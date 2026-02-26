-- =========================================================
-- Migration: Tier-Based Delivery Fee + COD Admin Fee Settlement
-- Author: ANTIGRAVITY
-- Created: 2026-02-25
-- =========================================================
-- This migration updates the create_order RPC to use tier-based
-- delivery fees with per-tier admin fees (service_fee), replacing
-- the old linear formula and hardcoded service_fee of Rp 2000.
-- =========================================================

-- 1. Drop old calculate_delivery_fee (return type changed: INTEGER → JSONB)
DROP FUNCTION IF EXISTS calculate_delivery_fee(UUID, FLOAT, FLOAT);

-- Replace with tier-based version that returns JSONB
CREATE OR REPLACE FUNCTION calculate_delivery_fee(
    p_merchant_id UUID,
    p_user_lat FLOAT,
    p_user_lng FLOAT
) RETURNS JSONB AS $$
DECLARE
    v_merchant_lat FLOAT;
    v_merchant_lng FLOAT;
    v_distance FLOAT;
    v_tiers JSONB;
    v_tier JSONB;
    v_max_radius FLOAT := 15.0;
    v_total_fee INTEGER := 0;
    v_admin_fee INTEGER := 0;
    v_tier_label TEXT := '';
    v_found BOOLEAN := FALSE;
BEGIN
    -- Get merchant location
    SELECT latitude, longitude INTO v_merchant_lat, v_merchant_lng
    FROM merchants WHERE id = p_merchant_id;

    IF v_merchant_lat IS NULL OR v_merchant_lng IS NULL THEN
        -- Fallback: return default tier 1
        RETURN jsonb_build_object(
            'delivery_fee', 3500, 'service_fee', 500, 'distance', 0,
            'tier_label', '0-1 km', 'out_of_range', FALSE
        );
    END IF;

    -- Calculate distance using Haversine
    v_distance := calculate_distance(v_merchant_lat, v_merchant_lng, p_user_lat, p_user_lng);

    -- Get tier configuration from app_settings
    BEGIN
        SELECT value INTO v_tiers
        FROM app_settings
        WHERE key = 'delivery_fee_tiers';
    EXCEPTION WHEN OTHERS THEN
        v_tiers := NULL;
    END;

    -- Extract max_radius
    IF v_tiers IS NOT NULL AND v_tiers ? 'max_radius_km' THEN
        v_max_radius := (v_tiers->>'max_radius_km')::FLOAT;
    END IF;

    -- Check out of range
    IF v_distance > v_max_radius THEN
        RETURN jsonb_build_object(
            'delivery_fee', 0, 'service_fee', 0, 'distance', ROUND(v_distance::numeric, 2),
            'tier_label', 'Out of range', 'out_of_range', TRUE
        );
    END IF;

    -- Match distance to tier
    IF v_tiers IS NOT NULL AND v_tiers ? 'tiers' THEN
        FOR v_tier IN SELECT * FROM jsonb_array_elements(v_tiers->'tiers')
        LOOP
            IF v_distance >= (v_tier->>'min_km')::FLOAT AND v_distance < (v_tier->>'max_km')::FLOAT THEN
                v_total_fee := (v_tier->>'total_fee')::INTEGER;
                v_admin_fee := COALESCE((v_tier->>'admin_fee')::INTEGER, 0);
                v_tier_label := (v_tier->>'min_km') || '-' || (v_tier->>'max_km') || ' km';
                v_found := TRUE;
                EXIT;
            END IF;
        END LOOP;

        -- If distance is exactly at max of last tier
        IF NOT v_found THEN
            -- Use the last tier
            SELECT jsonb_array_element(v_tiers->'tiers', jsonb_array_length(v_tiers->'tiers') - 1) INTO v_tier;
            v_total_fee := (v_tier->>'total_fee')::INTEGER;
            v_admin_fee := COALESCE((v_tier->>'admin_fee')::INTEGER, 0);
            v_tier_label := (v_tier->>'min_km') || '-' || (v_tier->>'max_km') || ' km';
        END IF;
    ELSE
        -- Default tiers if no config exists
        v_total_fee := CASE
            WHEN v_distance <= 1 THEN 3500
            WHEN v_distance <= 2 THEN 5000
            WHEN v_distance <= 3 THEN 6500
            WHEN v_distance <= 5 THEN 8000
            WHEN v_distance <= 7 THEN 10000
            WHEN v_distance <= 10 THEN 13000
            ELSE 17000
        END;
        v_admin_fee := CASE
            WHEN v_distance <= 1 THEN 500
            WHEN v_distance <= 2 THEN 700
            WHEN v_distance <= 3 THEN 1000
            WHEN v_distance <= 5 THEN 1200
            WHEN v_distance <= 7 THEN 1500
            WHEN v_distance <= 10 THEN 2000
            ELSE 2500
        END;
        v_tier_label := 'default';
    END IF;

    RETURN jsonb_build_object(
        'delivery_fee', v_total_fee,
        'service_fee', v_admin_fee,
        'distance', ROUND(v_distance::numeric, 2),
        'tier_label', v_tier_label,
        'out_of_range', FALSE
    );
END;
$$ LANGUAGE plpgsql;


-- 2. Update create_order to use tier-based fees
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
    v_service_fee INTEGER;
    v_discount INTEGER := 0;
    v_total INTEGER;
    v_item JSONB;
    v_price INTEGER;
    v_product_name TEXT;
    v_promo_id UUID;
    v_customer_id UUID;
    v_fee_result JSONB;
BEGIN
    v_customer_id := auth.uid();

    -- 1. Calculate Delivery Fee (tier-based, returns JSONB with delivery_fee + service_fee)
    v_fee_result := calculate_delivery_fee(p_merchant_id, p_customer_lat, p_customer_lng);
    v_delivery_fee := (v_fee_result->>'delivery_fee')::INTEGER;
    v_service_fee := COALESCE((v_fee_result->>'service_fee')::INTEGER, 0);

    -- Reject order if out of range
    IF (v_fee_result->>'out_of_range')::BOOLEAN THEN
        RAISE EXCEPTION 'Alamat pengiriman di luar jangkauan layanan';
    END IF;

    -- 2. Calculate Subtotal & Validate Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT price, name INTO v_price, v_product_name
        FROM menu_items WHERE id = (v_item->>'menu_item_id')::UUID;

        IF v_price IS NULL THEN
            RAISE EXCEPTION 'Item not found';
        END IF;

        v_subtotal := v_subtotal + (v_price * (v_item->>'quantity')::INTEGER);
    END LOOP;

    -- 3. Validate Promo (Simplified)
    IF p_promo_code IS NOT NULL THEN
        SELECT id, value, type, max_discount INTO v_promo_id, v_discount, v_product_name, v_price
        FROM promos
        WHERE code = p_promo_code AND is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW());

        IF v_promo_id IS NOT NULL THEN
            IF v_product_name = 'percentage' THEN
                 v_discount := (v_subtotal * v_discount) / 100;
                 IF v_price IS NOT NULL AND v_discount > v_price THEN
                    v_discount := v_price;
                 END IF;
            END IF;
        ELSE
            v_discount := 0;
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
        SELECT price, name INTO v_price, v_product_name
        FROM menu_items WHERE id = (v_item->>'menu_item_id')::UUID;

        INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_time, notes)
        VALUES (
            v_order_id,
            (v_item->>'menu_item_id')::UUID,
            v_product_name,
            (v_item->>'quantity')::INTEGER,
            v_price,
            v_item->>'notes'
        );
    END LOOP;

    -- Return the created order
    RETURN (SELECT row_to_json(orders) FROM orders WHERE id = v_order_id);
END;
$$ LANGUAGE plpgsql;


-- 3. Ensure app_settings table exists for tier config
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- RLS for app_settings (anyone can read, only admin can write)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read settings" ON app_settings;
CREATE POLICY "Anyone can read settings" ON app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON app_settings;
CREATE POLICY "Admins can manage settings" ON app_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);


-- 4. Insert default delivery fee tiers (if not exists)
INSERT INTO app_settings (key, value) VALUES (
    'delivery_fee_tiers',
    '{
        "max_radius_km": 15,
        "tiers": [
            {"min_km": 0,  "max_km": 1,  "total_fee": 3500,  "admin_fee": 500},
            {"min_km": 1,  "max_km": 2,  "total_fee": 5000,  "admin_fee": 700},
            {"min_km": 2,  "max_km": 3,  "total_fee": 6500,  "admin_fee": 1000},
            {"min_km": 3,  "max_km": 5,  "total_fee": 8000,  "admin_fee": 1200},
            {"min_km": 5,  "max_km": 7,  "total_fee": 10000, "admin_fee": 1500},
            {"min_km": 7,  "max_km": 10, "total_fee": 13000, "admin_fee": 2000},
            {"min_km": 10, "max_km": 15, "total_fee": 17000, "admin_fee": 2500}
        ]
    }'::JSONB
) ON CONFLICT (key) DO NOTHING;


-- 5. Add index for COD fee tracking queries
CREATE INDEX IF NOT EXISTS idx_orders_driver_cod
ON orders(driver_id, payment_method, status)
WHERE payment_method = 'cod' AND status = 'completed';

-- 6. Add index for deposits by user
CREATE INDEX IF NOT EXISTS idx_deposits_user_status
ON deposits(user_id, status);
