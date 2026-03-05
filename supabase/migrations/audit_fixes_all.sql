-- ================================================================
-- AUDIT FIXES: Priority 1 + Priority 2
-- Generated: 2026-03-06
-- Fixes: FIX-M1, FIX-D2, FIX-C3, FIX-C4, FIX-E1, FIX-E2
-- NOTE: FIX-C1 already resolved (create_order already calculates delivery fee server-side)
-- ================================================================

-- ================================================================
-- FIX-E2: Audit Log Table
-- Tracks sensitive operations by all users (admin, merchant, driver)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_table TEXT,
    target_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: only admin can view audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin view audit logs" ON public.audit_logs;
CREATE POLICY "Admin view audit logs" ON public.audit_logs FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "System insert audit logs" ON public.audit_logs;
CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);


-- ================================================================
-- FIX-E1: Promo Usage Tracking Per-User
-- Prevents a single user from reusing the same promo code
-- ================================================================
CREATE TABLE IF NOT EXISTS public.promo_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    promo_id UUID REFERENCES public.promos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(promo_id, user_id)
);

ALTER TABLE public.promo_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own promo usage" ON public.promo_usage;
CREATE POLICY "Users view own promo usage" ON public.promo_usage FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "System insert promo usage" ON public.promo_usage;
CREATE POLICY "System insert promo usage" ON public.promo_usage FOR INSERT WITH CHECK (true);


-- ================================================================
-- FIX-M1 + FIX-C3 + FIX-C4 + FIX-E1: Updated create_order RPC
-- Added: stock validation, self-order block, max distance, promo per-user
-- ================================================================
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
    v_price INTEGER;
    v_product_name TEXT;
    v_promo_id UUID;
    v_customer_id UUID;
    v_wallet_id UUID;
    v_balance INTEGER;
    v_item_available BOOLEAN;
    v_item_stock INTEGER;
    v_distance DOUBLE PRECISION;
    v_max_distance DOUBLE PRECISION := 15.0; -- km
BEGIN
    v_customer_id := auth.uid();

    -- ========================================
    -- FIX-C3: Block self-ordering
    -- ========================================
    IF EXISTS (SELECT 1 FROM merchants WHERE id = p_merchant_id AND owner_id = v_customer_id) THEN
        RAISE EXCEPTION 'Anda tidak bisa memesan ke warung sendiri';
    END IF;

    -- ========================================
    -- 1. Calculate Delivery Fee (server-side, FIX-C1 already OK)
    -- ========================================
    v_delivery_fee := calculate_delivery_fee(p_merchant_id, p_customer_lat, p_customer_lng);

    -- ========================================
    -- FIX-C4: Validate max distance (15km)
    -- ========================================
    IF p_customer_lat IS NOT NULL AND p_customer_lng IS NOT NULL THEN
        SELECT (6371 * acos(
            cos(radians(p_customer_lat)) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(p_customer_lng)) +
            sin(radians(p_customer_lat)) * sin(radians(m.latitude))
        )) INTO v_distance
        FROM merchants m WHERE m.id = p_merchant_id;

        IF v_distance IS NOT NULL AND v_distance > v_max_distance THEN
            RAISE EXCEPTION 'Jarak terlalu jauh (%.1f km). Maks % km.', v_distance, v_max_distance;
        END IF;
    END IF;

    -- ========================================
    -- 2. Calculate Subtotal & Validate Items + Stock (FIX-M1)
    -- ========================================
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT price, name, is_available, stock
        INTO v_price, v_product_name, v_item_available, v_item_stock
        FROM menu_items
        WHERE id = (v_item->>'menu_item_id')::UUID
        FOR UPDATE; -- Lock row to prevent race condition on stock

        IF v_price IS NULL THEN
            RAISE EXCEPTION 'Item tidak ditemukan';
        END IF;

        IF v_item_available IS NOT NULL AND v_item_available = FALSE THEN
            RAISE EXCEPTION 'Item "%" sedang tidak tersedia', v_product_name;
        END IF;

        -- FIX-M1: Check stock (NULL = unlimited)
        IF v_item_stock IS NOT NULL AND v_item_stock < (v_item->>'quantity')::INTEGER THEN
            RAISE EXCEPTION 'Stok "%" tidak cukup (sisa: %)', v_product_name, v_item_stock;
        END IF;

        v_subtotal := v_subtotal + (v_price * (v_item->>'quantity')::INTEGER);
    END LOOP;

    -- ========================================
    -- 3. Validate Promo + Per-User Check (FIX-E1)
    -- ========================================
    IF p_promo_code IS NOT NULL THEN
        SELECT id, value, type, max_discount INTO v_promo_id, v_discount, v_product_name, v_price
        FROM promos
        WHERE code = p_promo_code AND is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW());

        IF v_promo_id IS NOT NULL THEN
            -- FIX-E1: Check per-user usage
            IF EXISTS (SELECT 1 FROM promo_usage WHERE promo_id = v_promo_id AND user_id = v_customer_id) THEN
                RAISE EXCEPTION 'Promo "%" sudah pernah Anda gunakan', p_promo_code;
            END IF;

            -- Check global usage limit
            IF EXISTS (
                SELECT 1 FROM promos
                WHERE id = v_promo_id AND usage_limit IS NOT NULL AND used_count >= usage_limit
            ) THEN
                RAISE EXCEPTION 'Kuota promo "%" sudah habis', p_promo_code;
            END IF;

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

    -- ========================================
    -- 4. Handle Wallet Payment
    -- ========================================
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

    -- ========================================
    -- 5. Insert Order
    -- ========================================
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

    -- ========================================
    -- 6. Wallet Transaction Record
    -- ========================================
    IF p_payment_method = 'wallet' THEN
        INSERT INTO transactions (wallet_id, type, amount, description, reference_id, status)
        VALUES (v_wallet_id, 'payment', v_total, 'Pembayaran Pesanan #' || substring(v_order_id::text, 1, 8), v_order_id, 'completed');
    END IF;

    -- ========================================
    -- 7. Insert Order Items + Decrement Stock (FIX-M1)
    -- ========================================
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

        -- FIX-M1: Decrement stock if tracked (NULL = unlimited, skip)
        UPDATE menu_items
        SET stock = stock - (v_item->>'quantity')::INTEGER,
            is_available = CASE
                WHEN stock - (v_item->>'quantity')::INTEGER <= 0 THEN FALSE
                ELSE is_available
            END,
            updated_at = NOW()
        WHERE id = (v_item->>'menu_item_id')::UUID
        AND stock IS NOT NULL;
    END LOOP;

    -- ========================================
    -- 8. Record Promo Usage (FIX-E1) + Increment used_count
    -- ========================================
    IF v_promo_id IS NOT NULL THEN
        INSERT INTO promo_usage (promo_id, user_id, order_id)
        VALUES (v_promo_id, v_customer_id, v_order_id)
        ON CONFLICT (promo_id, user_id) DO NOTHING;

        UPDATE promos SET used_count = used_count + 1 WHERE id = v_promo_id;
    END IF;

    RETURN (SELECT row_to_json(orders) FROM orders WHERE id = v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ================================================================
-- FIX-D2: Driver Cancel/Issue RPC
-- Allows driver to cancel/report issue on orders in pickup/picked_up/delivering status
-- Handles: unassign driver, revert status to 'ready' OR cancel with reason
-- Also handles wallet refund if applicable
-- ================================================================
CREATE OR REPLACE FUNCTION driver_report_issue(
    p_order_id UUID,
    p_reason TEXT,
    p_action TEXT DEFAULT 'cancel' -- 'cancel' or 'unassign'
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
    v_order RECORD;
    v_wallet_id UUID;
BEGIN
    v_driver_id := auth.uid();

    -- Lock the order row
    SELECT * INTO v_order FROM public.orders
    WHERE id = p_order_id AND driver_id = v_driver_id
    FOR UPDATE;

    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan atau bukan milik Anda');
    END IF;

    IF v_order.status NOT IN ('pickup', 'picked_up', 'delivering') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Status pesanan tidak memungkinkan pelaporan kendala');
    END IF;

    IF p_action = 'unassign' THEN
        -- Unassign driver, revert to 'ready' so another driver can take it
        UPDATE public.orders
        SET driver_id = NULL,
            status = 'ready',
            updated_at = NOW()
        WHERE id = p_order_id;

        -- Audit log
        INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, new_data)
        VALUES (v_driver_id, 'driver_unassign', 'orders', p_order_id,
            jsonb_build_object('reason', p_reason, 'previous_status', v_order.status));
    ELSE
        -- Cancel the order entirely
        UPDATE public.orders
        SET status = 'cancelled',
            cancelled_at = NOW(),
            updated_at = NOW(),
            cancellation_reason = '[Driver Issue] ' || COALESCE(p_reason, 'Kendala tidak diketahui')
        WHERE id = p_order_id;

        -- Refund wallet if paid via wallet
        IF v_order.payment_method = 'wallet' AND v_order.payment_status = 'paid' THEN
            SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = v_order.customer_id;
            IF v_wallet_id IS NOT NULL THEN
                UPDATE public.wallets SET balance = balance + v_order.total_amount, updated_at = NOW()
                WHERE id = v_wallet_id;

                INSERT INTO public.transactions (wallet_id, type, amount, description, reference_id, status)
                VALUES (v_wallet_id, 'refund', v_order.total_amount,
                        'Refund — kendala driver #' || substring(p_order_id::text, 1, 8), p_order_id, 'completed');

                UPDATE public.orders SET payment_status = 'refunded' WHERE id = p_order_id;
            END IF;
        END IF;

        -- Notify customer
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (v_order.customer_id, 'Pesanan Dibatalkan',
                'Pesanan #' || substring(p_order_id::text, 1, 8) || ' dibatalkan oleh driver: ' || COALESCE(p_reason, '-'),
                'order', p_order_id);

        -- Audit log
        INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, new_data)
        VALUES (v_driver_id, 'driver_cancel_order', 'orders', p_order_id,
            jsonb_build_object('reason', p_reason, 'previous_status', v_order.status));
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Laporan kendala berhasil diproses');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
