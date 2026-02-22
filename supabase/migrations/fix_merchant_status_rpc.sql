-- ============================================================
-- FIX: ORDER_ITEMS COLUMN NAME MISMATCH
-- The create_order RPC was trying to insert into "menu_item_id" and "price".
-- The actual table schema uses "product_id" and "price_at_time".
-- This script fixes the INSERT statement inside create_order to match the schema.
-- ============================================================

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
    v_merchant_open BOOLEAN;
    v_item_available BOOLEAN;
    v_item_stock INTEGER;
BEGIN
    v_customer_id := auth.uid();
    
    -- M-3.4: Validate merchant is open (server-side)
    -- FIX: Check for both 'active' and 'approved' status
    SELECT is_open INTO v_merchant_open
    FROM public.merchants
    WHERE id = p_merchant_id AND status IN ('active', 'approved');
    
    IF v_merchant_open IS NULL THEN
        RAISE EXCEPTION 'Merchant tidak ditemukan atau belum aktif';
    END IF;
    
    IF v_merchant_open = FALSE THEN
        RAISE EXCEPTION 'Warung sedang tutup';
    END IF;
    
    -- 1. Calculate Delivery Fee
    v_delivery_fee := calculate_delivery_fee(p_merchant_id, p_customer_lat, p_customer_lng);
    
    -- 2. Calculate Subtotal & Validate Items (with stock check)
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT price, name, is_available, stock 
        INTO v_price, v_product_name, v_item_available, v_item_stock
        FROM menu_items WHERE id = (v_item->>'menu_item_id')::UUID;
        
        IF v_price IS NULL THEN
            RAISE EXCEPTION 'Item tidak ditemukan: %', COALESCE(v_item->>'menu_item_id', 'unknown');
        END IF;
        
        -- Check item availability
        IF v_item_available = FALSE THEN
            RAISE EXCEPTION 'Item "%" sedang tidak tersedia', v_product_name;
        END IF;
        
        -- Check stock (NULL = unlimited)
        IF v_item_stock IS NOT NULL AND v_item_stock < (v_item->>'quantity')::INTEGER THEN
            RAISE EXCEPTION 'Stok "%" tidak cukup (sisa: %)', v_product_name, v_item_stock;
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
    
    -- 5. Insert Order
    INSERT INTO orders (
        customer_id, merchant_id, status, 
        subtotal, delivery_fee, service_fee, discount, total_amount,
        payment_method, payment_status,
        delivery_address, delivery_detail,
        customer_name, customer_phone,
        customer_lat, customer_lng,
        promo_id, notes
    ) VALUES (
        v_customer_id, p_merchant_id, 'pending',
        v_subtotal, v_delivery_fee, v_service_fee, v_discount, v_total,
        p_payment_method, CASE WHEN p_payment_method = 'wallet' THEN 'paid' ELSE 'pending' END,
        p_delivery_address, p_delivery_detail,
        p_customer_name, p_customer_phone,
        p_customer_lat, p_customer_lng,
        v_promo_id, p_notes
    ) RETURNING id INTO v_order_id;
    
    -- 6. Insert Order Items & Decrement Stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT price, name INTO v_price, v_product_name
        FROM menu_items WHERE id = (v_item->>'menu_item_id')::UUID;
        
        -- FIX: Column names are product_id and price_at_time, not menu_item_id and price
        -- Also changed name -> product_name
        INSERT INTO order_items (order_id, product_id, product_name, price_at_time, quantity, notes)
        VALUES (
            v_order_id,
            (v_item->>'menu_item_id')::UUID,
            v_product_name,
            v_price,
            (v_item->>'quantity')::INTEGER,
            v_item->>'notes'
        );
        
        -- Decrement stock if tracked (NULL = unlimited, skip)
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
    
    -- 7. Wallet transaction record
    IF p_payment_method = 'wallet' THEN
        INSERT INTO transactions (wallet_id, type, amount, description, reference_id, status)
        VALUES (v_wallet_id, 'payment', v_total, 'Pembayaran pesanan #' || substring(v_order_id::text, 1, 8), v_order_id, 'completed');
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'total', v_total,
        'subtotal', v_subtotal,
        'delivery_fee', v_delivery_fee,
        'service_fee', v_service_fee,
        'discount', v_discount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
