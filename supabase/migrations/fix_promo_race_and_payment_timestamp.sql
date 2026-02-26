-- ==========================================
-- Migration: Fix Promo Race Condition (Bug #8) & Server-Side Payment Timestamp (Bug #9)
-- ==========================================

-- ===========================================================================
-- BUG #8: Promo Validation Race Condition Fix
-- 
-- Problem: create_order() promo validation doesn't check usage_limit/used_count
--          AND doesn't increment used_count, so multiple users can use the same
--          promo code beyond its limit simultaneously.
-- 
-- Fix: Add FOR UPDATE lock on promo row, check usage_limit, and increment
--      used_count atomically inside the transaction.
-- ===========================================================================

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
    p_notes TEXT DEFAULT NULL,
    p_delivery_fee INTEGER DEFAULT NULL
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
    v_promo_record RECORD;
    v_customer_id UUID;
    v_wallet_id UUID;
    v_balance INTEGER;
BEGIN
    v_customer_id := auth.uid();
    
    -- 1. Calculate Delivery Fee (use client-provided fee if available, else calculate server-side)
    IF p_delivery_fee IS NOT NULL AND p_delivery_fee > 0 THEN
        v_delivery_fee := p_delivery_fee;
    ELSE
        v_delivery_fee := calculate_delivery_fee(p_merchant_id, p_customer_lat, p_customer_lng);
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
    
    -- 3. Validate Promo (BUG #8 FIX: with row lock and usage_limit check)
    IF p_promo_code IS NOT NULL THEN
        -- Lock the promo row to prevent race condition
        SELECT * INTO v_promo_record
        FROM promos 
        WHERE code = UPPER(p_promo_code) 
          AND is_active = TRUE 
          AND (valid_until IS NULL OR valid_until > NOW())
        FOR UPDATE;

        IF v_promo_record IS NULL THEN
            -- Promo not found or expired, just skip (no discount)
            v_discount := 0;
        ELSE
            -- Check usage limit
            IF v_promo_record.usage_limit IS NOT NULL 
               AND v_promo_record.used_count >= v_promo_record.usage_limit THEN
                RAISE EXCEPTION 'Kuota promo sudah habis';
            END IF;

            -- Check minimum order
            IF v_promo_record.min_order IS NOT NULL 
               AND v_subtotal < v_promo_record.min_order THEN
                RAISE EXCEPTION 'Minimum order untuk promo ini belum tercapai';
            END IF;

            -- Calculate discount
            v_promo_id := v_promo_record.id;
            IF v_promo_record.type = 'percentage' THEN
                v_discount := (v_subtotal * v_promo_record.value) / 100;
                IF v_promo_record.max_discount IS NOT NULL AND v_discount > v_promo_record.max_discount THEN
                    v_discount := v_promo_record.max_discount;
                END IF;
            ELSE
                v_discount := v_promo_record.value;
            END IF;

            -- Atomically increment used_count
            UPDATE promos SET used_count = COALESCE(used_count, 0) + 1 WHERE id = v_promo_record.id;
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
    
    -- 5. Insert Order
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


-- ===========================================================================
-- BUG #9: Server-Side Payment Timestamp
--
-- Problem: confirmPayment() in orderService.js uses client-side 
--          new Date().toISOString() which can be wrong or manipulated.
-- 
-- Fix: Create a server-side RPC that uses NOW() for the payment timestamp,
--      with proper authorization checks.
-- ===========================================================================

CREATE OR REPLACE FUNCTION confirm_cod_payment(
    p_order_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
    v_order RECORD;
BEGIN
    v_driver_id := auth.uid();
    
    IF v_driver_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    -- Lock the order row and verify ownership
    SELECT id, driver_id, payment_status, status, payment_method
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan');
    END IF;

    IF v_order.driver_id != v_driver_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya driver yang ditugaskan yang bisa konfirmasi pembayaran');
    END IF;

    IF v_order.payment_status = 'paid' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pembayaran sudah dikonfirmasi sebelumnya');
    END IF;

    -- Update payment status with server-side timestamp
    UPDATE public.orders
    SET payment_status = 'paid',
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'message', 'Pembayaran berhasil dikonfirmasi');
END;
$$;
