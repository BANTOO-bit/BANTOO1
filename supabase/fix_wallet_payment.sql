-- ==========================================
-- FIX: SECURE WALLET PAYMENT LOGIC
-- Run this in Supabase SQL Editor
-- ==========================================

CREATE OR REPLACE FUNCTION create_order(
    p_merchant_id UUID,
    p_items JSONB, -- Array of objects: {menu_item_id, quantity, notes}
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
BEGIN
    v_customer_id := auth.uid();
    
    -- 1. Calculate Delivery Fee
    v_delivery_fee := calculate_delivery_fee(p_merchant_id, p_customer_lat, p_customer_lng);
    
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
        SELECT id, value, type, max_discount INTO v_promo_id, v_discount, v_product_name, v_price -- reuse vars
        FROM promos 
        WHERE code = p_promo_code AND is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW());
        
        IF v_promo_id IS NOT NULL THEN
            IF v_product_name = 'percentage' THEN
                 v_discount := (v_subtotal * v_discount) / 100;
                 IF v_price IS NOT NULL AND v_discount > v_price THEN -- max_discount check
                    v_discount := v_price;
                 END IF;
            END IF;
        ELSE
            v_discount := 0; -- Invalid promo
        END IF;
    END IF;
    
    v_total := v_subtotal + v_delivery_fee + v_service_fee - v_discount;
    
    -- 4. HANDLE WALLET PAYMENT (CRITICAL FIX)
    IF p_payment_method = 'wallet' THEN
        -- Lock wallet for update
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
        
        -- Deduct balance
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
    
    -- 6. Insert Wallet Transaction Record (If Wallet)
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
    
    -- Return the created order
    RETURN (SELECT row_to_json(orders) FROM orders WHERE id = v_order_id);
END;
$$ LANGUAGE plpgsql;
