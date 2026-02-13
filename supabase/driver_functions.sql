-- ==========================================
-- DRIVER APP FUNCTIONS
-- ==========================================

-- 1. Get Available Orders (Nearby & Ready)
CREATE OR REPLACE FUNCTION get_available_orders(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    merchant_name TEXT,
    merchant_address TEXT,
    customer_address TEXT,
    distance_to_merchant DOUBLE PRECISION,
    total_amount INTEGER,
    payment_method TEXT,
    created_at TIMESTAMPTZ,
    merchant_lat DOUBLE PRECISION,
    merchant_lng DOUBLE PRECISION
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        m.name AS merchant_name,
        m.address AS merchant_address,
        o.delivery_address AS customer_address,
        -- Calculate distance from driver to merchant (in km)
        (6371 * acos(
            cos(radians(p_lat)) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(p_lng)) + 
            sin(radians(p_lat)) * sin(radians(m.latitude))
        )) AS distance_to_merchant,
        o.total_amount,
        o.payment_method,
        o.created_at,
        m.latitude AS merchant_lat,
        m.longitude AS merchant_lng
    FROM public.orders o
    JOIN public.merchants m ON o.merchant_id = m.id
    WHERE 
        o.status = 'ready' -- Only show orders ready for pickup
        AND o.driver_id IS NULL -- Order must not be assigned
    ORDER BY distance_to_merchant ASC;
END;
$$;

-- 2. Driver Accept Order (Transactional - Anti-Race Condition)
CREATE OR REPLACE FUNCTION driver_accept_order(
    p_order_id UUID
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
    v_order_status TEXT;
    v_current_driver UUID;
BEGIN
    -- Get current user ID (Driver's Profile ID)
    v_driver_id := auth.uid();
    
    -- Check if user is a valid active driver
    -- (Optional: Check public.drivers table for status='approved' AND is_active=true)
    IF NOT EXISTS (
        SELECT 1 FROM public.drivers 
        WHERE user_id = v_driver_id 
        AND status = 'approved' 
        AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Driver tidak aktif atau belum disetujui');
    END IF;

    -- Lock the order row to prevent race conditions
    SELECT status, driver_id INTO v_order_status, v_current_driver
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE; -- Critical: Locks row until transaction ends

    -- Validation 1: Order must exist
    IF v_order_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan');
    END IF;

    -- Validation 2: Order must be 'ready'
    IF v_order_status != 'ready' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak lagi tersedia (Status: ' || v_order_status || ')');
    END IF;

    -- Validation 3: Order must not have a driver
    IF v_current_driver IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan sudah diambil driver lain');
    END IF;

    -- Action: Assign Driver & Update Status
    UPDATE public.orders
    SET 
        driver_id = v_driver_id,
        status = 'pickup', -- Driver is OTW to Merchant
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'message', 'Order berhasil diambil');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- 3. Driver Update Order Status (State Machine)
CREATE OR REPLACE FUNCTION driver_update_order_status(
    p_order_id UUID,
    p_status TEXT -- 'picked_up', 'delivering', 'delivered' (mapped from 'completed')
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_current_status TEXT;
    v_driver_id UUID;
BEGIN
    v_driver_id := auth.uid();

    -- Check current status & driver ownership
    SELECT status INTO v_current_status
    FROM public.orders
    WHERE id = p_order_id AND driver_id = v_driver_id
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan atau bukan milik Anda');
    END IF;

    -- State Transitions Logic
    IF p_status = 'picked_up' THEN
        -- Allow 'pickup' -> 'picked_up'
        IF v_current_status != 'pickup' THEN
             RETURN jsonb_build_object('success', false, 'message', 'Alur salah: Status saat ini ' || v_current_status);
        END IF;

        UPDATE public.orders 
        SET status = 'picked_up', picked_up_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;

    ELSIF p_status = 'delivering' THEN
        -- Allow 'picked_up' -> 'delivering'
        -- Actually 'picked_up' usually means OTW to customer in some apps, but let's follow:
        -- Ready (Merchant) -> Pickup (Driver OTW Resto) -> Picked_Up (Driver has food) -> Delivering (OTW Customer) -> Delivered (Done)
        -- User requested: "Siap Diambil -> Diambil Driver -> Dalam Perjalanan -> Sampai Tujuan -> Selesai"
        
        -- Let's map strict logic:
        IF v_current_status != 'picked_up' THEN
             RETURN jsonb_build_object('success', false, 'message', 'Harus ambil pesanan dulu');
        END IF;
        
        UPDATE public.orders 
        SET status = 'delivering', updated_at = NOW()
        WHERE id = p_order_id;

    ELSIF p_status = 'delivered' OR p_status = 'completed' THEN -- Handle both as completion
        -- Allow 'delivering' -> 'delivered' OR 'picked_up' -> 'delivered' (if 'delivering' step skipped)
        IF v_current_status NOT IN ('picked_up', 'delivering') THEN
             RETURN jsonb_build_object('success', false, 'message', 'Pesanan belum diambil');
        END IF;

        UPDATE public.orders 
        SET status = 'delivered', delivered_at = NOW(), payment_status = 'paid', updated_at = NOW() -- Assume COD settled or Wallet finalized
        WHERE id = p_order_id;
        
        -- TODO: Calculate Driver Commission here
        
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Status tidak valid');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Status diperbarui');
END;
$$;

-- 4. Update Driver Location (Heartbeat)
CREATE OR REPLACE FUNCTION update_driver_location(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.drivers
    SET 
        latitude = p_lat, 
        longitude = p_lng,
        updated_at = NOW(),
        is_active = true -- Auto-set active on heartbeat
    WHERE user_id = auth.uid();
END;
$$;

-- 5. Toggle Driver Online Status
CREATE OR REPLACE FUNCTION toggle_driver_status(
    p_is_active BOOLEAN
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.drivers
    SET 
        is_active = p_is_active,
        updated_at = NOW()
    WHERE user_id = auth.uid();
END;
$$;

-- 6. Get Driver Active Order (Session Persistence)
CREATE OR REPLACE FUNCTION get_driver_active_order()
RETURNS TABLE (
    id UUID,
    merchant_name TEXT,
    merchant_address TEXT,
    customer_address TEXT,
    total_amount INTEGER,
    payment_method TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    merchant_lat DOUBLE PRECISION,
    merchant_lng DOUBLE PRECISION,
    customer_lat DOUBLE PRECISION,
    customer_lng DOUBLE PRECISION,
    customer_name TEXT,
    customer_note TEXT,
    items JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        m.name AS merchant_name,
        m.address AS merchant_address,
        o.delivery_address AS customer_address,
        o.total_amount,
        o.payment_method,
        o.status,
        o.created_at,
        m.latitude AS merchant_lat,
        m.longitude AS merchant_lng,
        o.latitude AS customer_lat,
        o.longitude AS customer_lng,
        p.full_name AS customer_name,
        o.notes AS customer_note,
        (
            SELECT jsonb_agg(jsonb_build_object(
                'name', oi.product_name,
                'quantity', oi.quantity,
                'notes', oi.notes
            ))
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        ) AS items
    FROM public.orders o
    JOIN public.merchants m ON o.merchant_id = m.id
    LEFT JOIN public.profiles p ON o.customer_id = p.id
    WHERE 
        o.driver_id = auth.uid()
        AND o.status IN ('pickup', 'picked_up', 'delivering'); -- Active states
END;
$$;
