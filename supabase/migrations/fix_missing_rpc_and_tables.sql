-- ==========================================
-- FIX: Missing RPC Functions & Tables
-- ==========================================
-- Fixes 4 issues found in driver app diagnosis:
-- 1. user_roles table (eliminates 404 error)
-- 2. get_available_orders RPC (radius-based filtering)
-- 3. toggle_driver_status RPC (server-side validation)
-- 4. driver_reject_order RPC (server-side tracking)
-- ==========================================


-- ==========================================
-- 1. USER_ROLES TABLE
-- ==========================================
-- Used by AuthContext.jsx to determine user roles.
-- Without this table, every page load produces a 404 error.

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'merchant', 'driver', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Only service_role/admin can insert/update/delete
CREATE POLICY "Service role manages roles"
    ON public.user_roles FOR ALL
    USING (auth.role() = 'service_role');

-- Grant access to PostgREST (required for REST API to expose the table)
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;

-- Auto-populate user_roles from existing data
-- This backfills roles for all existing users based on their profiles/drivers/merchants records
DO $$
BEGIN
    -- Everyone is a customer
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'customer' FROM auth.users
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Users with approved driver records
    INSERT INTO public.user_roles (user_id, role)
    SELECT user_id, 'driver' FROM public.drivers WHERE status = 'approved'
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Users with merchant records
    INSERT INTO public.user_roles (user_id, role)
    SELECT owner_id, 'merchant' FROM public.merchants WHERE status = 'approved'
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Admin users (from profiles.role)
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin' FROM public.profiles WHERE role = 'admin'
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- Trigger: Auto-add 'customer' role when a new user signs up
CREATE OR REPLACE FUNCTION auto_assign_customer_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_assign_customer_role ON public.profiles;
CREATE TRIGGER trg_auto_assign_customer_role
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_customer_role();


-- ==========================================
-- 2. GET_AVAILABLE_ORDERS RPC
-- ==========================================
-- Returns orders with status='ready' and no driver assigned,
-- filtered by Haversine distance from the driver's location.

-- Drop existing function first (return type changed from old version)
DROP FUNCTION IF EXISTS get_available_orders(double precision, double precision, double precision);

CREATE OR REPLACE FUNCTION get_available_orders(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
    v_result JSONB;
BEGIN
    v_driver_id := auth.uid();

    IF v_driver_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Verify driver is active
    IF NOT EXISTS (
        SELECT 1 FROM public.drivers
        WHERE user_id = v_driver_id AND is_active = TRUE AND status = 'approved'
    ) THEN
        RETURN '[]'::JSONB;
    END IF;

    SELECT COALESCE(json_agg(row_to_json(orders_data)), '[]'::json)::jsonb
    INTO v_result
    FROM (
        SELECT
            o.id,
            m.name AS merchant_name,
            m.address AS merchant_address,
            o.delivery_address AS customer_address,
            o.total_amount,
            o.payment_method,
            o.created_at,
            m.latitude AS merchant_lat,
            m.longitude AS merchant_lng,
            -- Haversine distance in km
            (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(p_lat)) * cos(radians(m.latitude)) *
                    cos(radians(m.longitude) - radians(p_lng)) +
                    sin(radians(p_lat)) * sin(radians(m.latitude))
                ))
            )) AS distance_to_merchant
        FROM public.orders o
        JOIN public.merchants m ON m.id = o.merchant_id
        WHERE o.status = 'ready'
          AND o.driver_id IS NULL
          AND m.latitude IS NOT NULL
          AND m.longitude IS NOT NULL
        ORDER BY o.created_at DESC
    ) orders_data
    WHERE orders_data.distance_to_merchant <= p_radius_km;

    RETURN v_result;
END;
$$;


-- ==========================================
-- 3. TOGGLE_DRIVER_STATUS RPC
-- ==========================================
-- Validates driver status before allowing online/offline toggle.
-- Prevents suspended/terminated drivers from going online.

-- Drop existing function first (return type changed)
DROP FUNCTION IF EXISTS toggle_driver_status(boolean);

CREATE OR REPLACE FUNCTION toggle_driver_status(p_is_active BOOLEAN)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
    v_current_status TEXT;
BEGIN
    v_driver_id := auth.uid();

    IF v_driver_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Check driver exists and current status
    SELECT status INTO v_current_status
    FROM public.drivers
    WHERE user_id = v_driver_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Driver tidak terdaftar';
    END IF;

    -- Prevent suspended/terminated drivers from going online
    IF p_is_active = TRUE AND v_current_status IN ('suspended', 'terminated', 'rejected') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Akun Anda sedang di-suspend. Hubungi admin untuk bantuan.'
        );
    END IF;

    -- Update status
    UPDATE public.drivers
    SET is_active = p_is_active,
        updated_at = NOW()
    WHERE user_id = v_driver_id;

    RETURN jsonb_build_object(
        'success', true,
        'is_active', p_is_active
    );
END;
$$;


-- ==========================================
-- 4. DRIVER_REJECT_ORDER RPC
-- ==========================================
-- Tracks driver rejections server-side.
-- Creates a rejection log table for analytics.

CREATE TABLE IF NOT EXISTS public.driver_order_rejections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rejected_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(driver_id, order_id)
);

ALTER TABLE public.driver_order_rejections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can insert own rejections"
    ON public.driver_order_rejections FOR INSERT
    WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Service role manages rejections"
    ON public.driver_order_rejections FOR ALL
    USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION driver_reject_order(p_order_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
BEGIN
    v_driver_id := auth.uid();

    IF v_driver_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Record the rejection (ignore duplicates)
    INSERT INTO public.driver_order_rejections (driver_id, order_id)
    VALUES (v_driver_id, p_order_id)
    ON CONFLICT (driver_id, order_id) DO NOTHING;

    RETURN jsonb_build_object('success', true);
END;
$$;
