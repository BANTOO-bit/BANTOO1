-- ==========================================
-- Migration: Fix create_order RPC & Add Promo Usage Tracking
-- Created: 2026-03-12
-- ==========================================
-- PROBLEMS:
-- 1. create_order() reuses v_product_name and v_price for promo logic,
--    making code confusing and prone to bugs.
-- 2. No tracking of promo usage per user — same user can use promo
--    unlimited times.
--
-- FIX: Proper variable names + promo_usages table.
-- SAFE TO RUN MULTIPLE TIMES (idempotent)
-- ==========================================


-- ==========================================
-- 1. Create promo_usages tracking table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.promo_usages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    promo_id UUID REFERENCES public.promos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(promo_id, user_id)  -- Each user can only use each promo once
);

ALTER TABLE promo_usages ENABLE ROW LEVEL SECURITY;

-- Users can view their own promo usage
DROP POLICY IF EXISTS "Users view own promo usages" ON promo_usages;
CREATE POLICY "Users view own promo usages" ON promo_usages FOR SELECT USING (
    auth.uid() = user_id
);

-- System insert (via SECURITY DEFINER function)
DROP POLICY IF EXISTS "System insert promo usages" ON promo_usages;
CREATE POLICY "System insert promo usages" ON promo_usages FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Admin can view all
DROP POLICY IF EXISTS "Admin view all promo usages" ON promo_usages;
CREATE POLICY "Admin view all promo usages" ON promo_usages FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Grant access
GRANT SELECT, INSERT ON public.promo_usages TO authenticated;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_usages_promo_id ON promo_usages(promo_id);
CREATE INDEX IF NOT EXISTS idx_promo_usages_user_id ON promo_usages(user_id);


-- ==========================================
-- 2. Refactored create_order with proper variable names
-- ==========================================

CREATE OR REPLACE FUNCTION create_order(
    p_merchant_id UUID,
    p_items JSONB,
    p_delivery_address TEXT,
    p_delivery_detail TEXT,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_lat FLOAT,
    p_customer_lng FLOAT,
    p_payment_method TEXT,
    p_promo_code TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_subtotal INTEGER := 0;
    v_delivery_fee INTEGER;
    v_service_fee INTEGER := 2000;
    v_discount INTEGER := 0;
    v_total INTEGER;
    v_item JSONB;
    v_item_price INTEGER;
    v_item_name TEXT;
    -- Promo-specific variables (no longer reusing v_item_price/v_item_name)
    v_promo_id UUID;
    v_promo_type TEXT;
    v_promo_value INTEGER;
    v_promo_max_discount INTEGER;
    v_customer_id UUID;
BEGIN
    v_customer_id := auth.uid();

    -- 1. Calculate Delivery Fee
    v_delivery_fee := calculate_delivery_fee(p_merchant_id, p_customer_lat, p_customer_lng);

    -- 2. Calculate Subtotal & Validate Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT price, name INTO v_item_price, v_item_name
        FROM menu_items WHERE id = (v_item->>'menu_item_id')::UUID;

        IF v_item_price IS NULL THEN
            RAISE EXCEPTION 'Item not found: %', (v_item->>'menu_item_id');
        END IF;

        v_subtotal := v_subtotal + (v_item_price * (v_item->>'quantity')::INTEGER);
    END LOOP;

    -- 3. Validate & Apply Promo
    IF p_promo_code IS NOT NULL AND p_promo_code != '' THEN
        -- Fetch promo details into properly-named variables
        SELECT id, type, value, max_discount
        INTO v_promo_id, v_promo_type, v_promo_value, v_promo_max_discount
        FROM promos
        WHERE code = p_promo_code
          AND is_active = TRUE
          AND (valid_until IS NULL OR valid_until > NOW())
          AND (usage_limit IS NULL OR used_count < usage_limit);

        IF v_promo_id IS NOT NULL THEN
            -- Check if user already used this promo
            IF EXISTS (
                SELECT 1 FROM promo_usages
                WHERE promo_id = v_promo_id AND user_id = v_customer_id
            ) THEN
                -- Promo already used by this user, silently ignore
                v_promo_id := NULL;
                v_discount := 0;
            ELSE
                -- Calculate discount based on type
                IF v_promo_type = 'percentage' THEN
                    v_discount := (v_subtotal * v_promo_value) / 100;
                    -- Apply max_discount cap
                    IF v_promo_max_discount IS NOT NULL AND v_discount > v_promo_max_discount THEN
                        v_discount := v_promo_max_discount;
                    END IF;
                ELSE
                    -- Fixed discount
                    v_discount := v_promo_value;
                END IF;

                -- Ensure discount doesn't exceed subtotal
                IF v_discount > v_subtotal THEN
                    v_discount := v_subtotal;
                END IF;
            END IF;
        ELSE
            v_discount := 0; -- Invalid or expired promo
        END IF;
    END IF;

    v_total := v_subtotal + v_delivery_fee + v_service_fee - v_discount;

    -- 4. Insert Order
    INSERT INTO orders (
        customer_id, merchant_id, status,
        subtotal, delivery_fee, service_fee, discount, total_amount,
        payment_method, payment_status,
        delivery_address, delivery_detail, customer_name, customer_phone,
        customer_lat, customer_lng, notes, promo_code, promo_id
    ) VALUES (
        v_customer_id, p_merchant_id, 'pending',
        v_subtotal, v_delivery_fee, v_service_fee, v_discount, v_total,
        p_payment_method, CASE WHEN p_payment_method = 'wallet' THEN 'paid' ELSE 'pending' END,
        p_delivery_address, p_delivery_detail, p_customer_name, p_customer_phone,
        p_customer_lat, p_customer_lng, p_notes, p_promo_code, v_promo_id
    ) RETURNING id INTO v_order_id;

    -- 5. Insert Order Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT price, name INTO v_item_price, v_item_name
        FROM menu_items WHERE id = (v_item->>'menu_item_id')::UUID;

        INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_time, notes)
        VALUES (
            v_order_id,
            (v_item->>'menu_item_id')::UUID,
            v_item_name,
            (v_item->>'quantity')::INTEGER,
            v_item_price,
            v_item->>'notes'
        );
    END LOOP;

    -- 6. Record promo usage & increment counter
    IF v_promo_id IS NOT NULL THEN
        INSERT INTO promo_usages (promo_id, user_id, order_id)
        VALUES (v_promo_id, v_customer_id, v_order_id)
        ON CONFLICT (promo_id, user_id) DO NOTHING;

        UPDATE promos SET used_count = used_count + 1 WHERE id = v_promo_id;
    END IF;

    -- Return the created order
    RETURN (SELECT row_to_json(orders) FROM orders WHERE id = v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
