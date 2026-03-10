-- ==========================================
-- Migration: Infrastructure Improvements
-- ==========================================
-- 1. Human-readable Order Number (BTN-YYMMDD-XXXX)
-- 2. Tier-based delivery fee calculation (server-side, matches admin config)
-- 3. Service fee from tier config (not hardcoded)
-- 4. completed_at timestamp
-- ==========================================


-- ==========================================
-- 1. ORDER_NUMBER: Add column + sequence + trigger
-- ==========================================

-- Add order_number column to orders (human-readable, e.g. BTN-240228-0042)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT;

-- Daily counter table for order numbers
CREATE TABLE IF NOT EXISTS public.order_counters (
    date_key DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    counter INTEGER NOT NULL DEFAULT 0
);

-- Function to generate human-readable order number
-- Format: BTN-YYMMDD-XXXX (e.g. BTN-260228-0042)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_counter INTEGER;
    v_date_str TEXT;
BEGIN
    -- Atomic increment: INSERT or UPDATE the daily counter
    INSERT INTO public.order_counters (date_key, counter)
    VALUES (v_today, 1)
    ON CONFLICT (date_key) DO UPDATE SET counter = order_counters.counter + 1
    RETURNING counter INTO v_counter;

    -- Format: BTN-YYMMDD-XXXX
    v_date_str := TO_CHAR(v_today, 'YYMMDD');
    RETURN 'BTN-' || v_date_str || '-' || LPAD(v_counter::TEXT, 4, '0');
END;
$$;

-- Auto-generate order_number on INSERT via trigger
CREATE OR REPLACE FUNCTION trigger_set_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_order_number();

-- Backfill existing orders that have no order_number
-- Uses created_at date to reconstruct what the number would have been
DO $$
DECLARE
    r RECORD;
    v_counter INTEGER;
    v_num TEXT;
BEGIN
    FOR r IN 
        SELECT id, created_at 
        FROM public.orders 
        WHERE order_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Atomically increment counter for that date
        INSERT INTO public.order_counters (date_key, counter)
        VALUES (r.created_at::DATE, 1)
        ON CONFLICT (date_key) DO UPDATE SET counter = order_counters.counter + 1
        RETURNING counter INTO v_counter;

        -- Build order number from counter
        v_num := 'BTN-' || TO_CHAR(r.created_at::DATE, 'YYMMDD') || '-' || LPAD(v_counter::TEXT, 4, '0');

        UPDATE public.orders SET order_number = v_num WHERE id = r.id;
    END LOOP;
END;
$$;

-- Create unique index on order_number for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number) WHERE order_number IS NOT NULL;


-- ==========================================
-- 2. COMPLETED_AT timestamp
-- ==========================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Update driver_complete_cod_delivery to also set completed_at
CREATE OR REPLACE FUNCTION driver_complete_cod_delivery(
    p_order_id UUID,
    p_lat FLOAT DEFAULT NULL,
    p_lng FLOAT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
    v_order RECORD;
BEGIN
    v_driver_id := auth.uid();

    IF v_driver_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    SELECT id, driver_id, status, payment_method, payment_status
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan');
    END IF;

    IF v_order.driver_id != v_driver_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya driver yang ditugaskan yang bisa menyelesaikan pesanan ini');
    END IF;

    IF v_order.status NOT IN ('picked_up', 'delivering') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan belum diambil dari merchant (status: ' || v_order.status || ')');
    END IF;

    -- Validate payment method is COD (accept all variants: cod, cash, tunai)
    IF LOWER(v_order.payment_method) NOT IN ('cod', 'cash', 'tunai') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Fungsi ini hanya untuk pesanan COD');
    END IF;

    IF v_order.payment_status = 'paid' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pembayaran sudah dikonfirmasi sebelumnya');
    END IF;

    -- ATOMIC: Set everything in one UPDATE
    UPDATE public.orders
    SET 
        status = 'completed',
        payment_status = 'paid',
        delivered_at = NOW(),
        completed_at = NOW(),
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'message', 'Pesanan COD selesai dan pembayaran dikonfirmasi');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION driver_complete_cod_delivery(UUID, FLOAT, FLOAT) TO authenticated;


-- ==========================================
-- 3. IMPROVED DELIVERY FEE CALCULATION (Tier-based from DB)
-- ==========================================

-- Updated calculate_delivery_fee that uses tier config from app_settings
-- Must DROP first because return type may differ from original
DROP FUNCTION IF EXISTS calculate_delivery_fee(UUID, FLOAT, FLOAT);
DROP FUNCTION IF EXISTS calculate_delivery_fee(UUID, DOUBLE PRECISION, DOUBLE PRECISION);
CREATE OR REPLACE FUNCTION calculate_delivery_fee(
    p_merchant_id UUID,
    p_user_lat FLOAT,
    p_user_lng FLOAT
) RETURNS INTEGER AS $$
DECLARE
    v_merchant_lat FLOAT;
    v_merchant_lng FLOAT;
    v_distance FLOAT;
    v_fee INTEGER;
    v_tier RECORD;
    v_config JSONB;
    v_max_radius FLOAT;
BEGIN
    -- Get merchant coordinates
    SELECT latitude, longitude INTO v_merchant_lat, v_merchant_lng
    FROM merchants WHERE id = p_merchant_id;
    
    -- Fallback if merchant has no coordinates
    IF v_merchant_lat IS NULL OR v_merchant_lng IS NULL THEN
        RETURN 8000;
    END IF;
    
    -- Fallback if customer has no coordinates
    IF p_user_lat IS NULL OR p_user_lng IS NULL OR p_user_lat = 0 OR p_user_lng = 0 THEN
        RETURN 8000;
    END IF;
    
    -- Calculate distance using Haversine (already exists as calculate_distance)
    v_distance := calculate_distance(v_merchant_lat, v_merchant_lng, p_user_lat, p_user_lng);
    
    -- Try to read tier config from app_settings
    BEGIN
        SELECT value INTO v_config
        FROM app_settings
        WHERE key = 'delivery_fee_tiers';
    EXCEPTION WHEN OTHERS THEN
        v_config := NULL;
    END;
    
    -- Use tier-based calculation if config exists
    IF v_config IS NOT NULL AND v_config->'tiers' IS NOT NULL THEN
        v_max_radius := COALESCE((v_config->>'max_radius_km')::FLOAT, 15);
        
        -- Check out of range
        IF v_distance > v_max_radius THEN
            RETURN 0; -- Out of range, will be rejected by frontend
        END IF;
        
        -- Find matching tier
        FOR v_tier IN
            SELECT 
                (t->>'min_km')::FLOAT AS min_km,
                (t->>'max_km')::FLOAT AS max_km,
                (t->>'total_fee')::INTEGER AS total_fee
            FROM jsonb_array_elements(v_config->'tiers') AS t
            ORDER BY (t->>'min_km')::FLOAT ASC
        LOOP
            IF v_distance >= v_tier.min_km AND v_distance < v_tier.max_km THEN
                RETURN v_tier.total_fee;
            END IF;
        END LOOP;
        
        -- Edge case: use last tier if distance == max_km of last tier
        RETURN COALESCE(v_tier.total_fee, 8000);
    END IF;
    
    -- Fallback: Simple linear calculation (original behavior)
    v_fee := 5000 + (v_distance * 2500)::INTEGER;
    v_fee := CEIL(v_fee / 500.0) * 500;
    IF v_fee < 5000 THEN v_fee := 5000; END IF;
    
    RETURN v_fee;
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- 4. IMPROVED SERVICE FEE (from tier config, not hardcoded)
-- ==========================================

-- Function to get admin_fee for a given distance from tier config
CREATE OR REPLACE FUNCTION get_service_fee_for_distance(
    p_distance FLOAT
) RETURNS INTEGER AS $$
DECLARE
    v_config JSONB;
    v_tier RECORD;
BEGIN
    -- Try to read tier config from app_settings
    BEGIN
        SELECT value INTO v_config
        FROM app_settings
        WHERE key = 'delivery_fee_tiers';
    EXCEPTION WHEN OTHERS THEN
        RETURN 2000; -- fallback
    END;
    
    IF v_config IS NOT NULL AND v_config->'tiers' IS NOT NULL THEN
        FOR v_tier IN
            SELECT 
                (t->>'min_km')::FLOAT AS min_km,
                (t->>'max_km')::FLOAT AS max_km,
                (t->>'admin_fee')::INTEGER AS admin_fee
            FROM jsonb_array_elements(v_config->'tiers') AS t
            ORDER BY (t->>'min_km')::FLOAT ASC
        LOOP
            IF p_distance >= v_tier.min_km AND p_distance < v_tier.max_km THEN
                RETURN COALESCE(v_tier.admin_fee, 2000);
            END IF;
        END LOOP;
    END IF;
    
    RETURN 2000; -- Default fallback
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- 5. UPDATED create_order: uses tier-based service_fee
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
    v_service_fee INTEGER;
    v_discount INTEGER := 0;
    v_total INTEGER;
    v_item JSONB;
    v_price INTEGER;
    v_product_name TEXT;
    v_promo_id UUID;
    v_customer_id UUID;
    v_wallet_id UUID;
    v_balance INTEGER;
    v_merchant_lat FLOAT;
    v_merchant_lng FLOAT;
    v_distance FLOAT;
BEGIN
    v_customer_id := auth.uid();
    
    -- 1. Calculate Delivery Fee (server-side, tier-based)
    v_delivery_fee := calculate_delivery_fee(p_merchant_id, p_customer_lat, p_customer_lng);
    
    -- 1b. Calculate distance for service fee lookup
    SELECT latitude, longitude INTO v_merchant_lat, v_merchant_lng
    FROM merchants WHERE id = p_merchant_id;
    
    IF v_merchant_lat IS NOT NULL AND v_merchant_lng IS NOT NULL 
       AND p_customer_lat IS NOT NULL AND p_customer_lng IS NOT NULL THEN
        v_distance := calculate_distance(v_merchant_lat, v_merchant_lng, p_customer_lat, p_customer_lng);
        v_service_fee := get_service_fee_for_distance(v_distance);
    ELSE
        v_service_fee := 2000; -- fallback
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
    
    -- 3. Validate Promo
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
    
    -- 4. Handle Wallet Payment
    IF p_payment_method = 'wallet' THEN
        SELECT id, balance INTO v_wallet_id, v_balance
        FROM wallets
        WHERE user_id = v_customer_id
        FOR UPDATE;
        
        IF v_wallet_id IS NULL THEN
            RAISE EXCEPTION 'Wallet not found';
        END IF;
        
        IF v_balance < v_total THEN
            RAISE EXCEPTION 'Saldo tidak mencukupi. Total: %, Saldo: %', v_total, v_balance;
        END IF;
        
        UPDATE wallets 
        SET balance = balance - v_total, updated_at = NOW()
        WHERE id = v_wallet_id;
    END IF;
    
    -- 5. Insert Order (order_number auto-generated by trigger)
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
    
    -- 6. Wallet Transaction Record
    IF p_payment_method = 'wallet' THEN
        INSERT INTO transactions (wallet_id, type, amount, description, reference_id, status)
        VALUES (v_wallet_id, 'payment', v_total, 'Pembayaran Pesanan #' || substring(v_order_id::text, 1, 8), v_order_id, 'completed');
    END IF;
    
    -- 7. Insert Order Items
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
    
    RETURN (SELECT row_to_json(orders) FROM orders WHERE id = v_order_id);
END;
$$ LANGUAGE plpgsql;
