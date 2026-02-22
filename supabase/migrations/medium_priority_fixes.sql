-- ============================================================
-- MEDIUM PRIORITY FIXES MIGRATION
-- Deploy via: Supabase SQL Editor → paste → Run
-- ============================================================


-- ============================================
-- M-3.4: Merchant Open Check in create_order
-- Previously: frontend-only check, SQL had no validation
-- Fix: Validate merchant is_open inside RPC before creating order
-- ============================================

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


-- ============================================
-- M-5.4: Restrict Cancel After Preparing
-- Tighten cancel rules: customer can only cancel during pending
-- Merchant/admin can cancel up to preparing
-- ============================================
-- This is already handled in update_order_status state machine.
-- Current rule: cancelled only from pending/accepted/preparing.
-- Tightening: customer can only cancel from pending.

-- We modify the cancel permission check in update_order_status:
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_status TEXT,
    p_additional JSONB DEFAULT '{}'
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_caller UUID;
    v_order RECORD;
    v_is_customer BOOLEAN := FALSE;
    v_is_merchant BOOLEAN := FALSE;
    v_is_driver BOOLEAN := FALSE;
    v_is_admin BOOLEAN := FALSE;
    v_caller_role TEXT;
    v_wallet_id UUID;
BEGIN
    v_caller := auth.uid();
    IF v_caller IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan');
    END IF;

    v_is_customer := (v_order.customer_id = v_caller);
    v_is_driver := (v_order.driver_id = v_caller);
    v_is_merchant := EXISTS (
        SELECT 1 FROM public.merchants WHERE id = v_order.merchant_id AND owner_id = v_caller
    );
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller;
    v_is_admin := (v_caller_role = 'admin');

    -- Permission checks
    IF p_status = 'accepted' AND NOT (v_is_merchant OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya merchant yang dapat menerima pesanan');
    END IF;
    IF p_status = 'preparing' AND NOT (v_is_merchant OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya merchant yang dapat memproses pesanan');
    END IF;
    IF p_status = 'ready' AND NOT (v_is_merchant OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya merchant yang dapat menandai pesanan siap');
    END IF;
    IF p_status IN ('pickup', 'picked_up', 'delivering', 'delivered') AND NOT (v_is_driver OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya driver yang dapat mengubah status ini');
    END IF;
    IF p_status = 'completed' AND NOT (v_is_customer OR v_is_driver OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda tidak memiliki akses untuk menyelesaikan pesanan');
    END IF;
    IF p_status = 'cancelled' AND NOT (v_is_customer OR v_is_merchant OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda tidak memiliki akses untuk membatalkan pesanan ini');
    END IF;

    -- State machine transitions
    IF p_status = 'accepted' AND v_order.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya pesanan pending yang bisa diterima');
    END IF;
    IF p_status = 'preparing' AND v_order.status NOT IN ('accepted', 'pending') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Alur status tidak valid');
    END IF;
    IF p_status = 'ready' AND v_order.status NOT IN ('accepted', 'preparing') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan belum diproses');
    END IF;
    IF p_status = 'completed' AND v_order.status != 'delivered' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan harus berstatus delivered untuk diselesaikan');
    END IF;

    -- M-5.4: Tightened cancel rules
    IF p_status = 'cancelled' THEN
        -- Customer can only cancel pending orders
        IF v_is_customer AND NOT v_is_admin THEN
            IF v_order.status != 'pending' THEN
                RETURN jsonb_build_object('success', false, 'message', 'Anda hanya bisa membatalkan pesanan yang belum diterima merchant');
            END IF;
        END IF;
        -- Merchant can cancel pending/accepted/preparing
        IF v_is_merchant AND NOT v_is_admin THEN
            IF v_order.status NOT IN ('pending', 'accepted', 'preparing') THEN
                RETURN jsonb_build_object('success', false, 'message', 'Pesanan sudah tidak bisa dibatalkan');
            END IF;
        END IF;
        -- Admin can cancel anything except delivered/completed
        IF v_is_admin THEN
            IF v_order.status IN ('delivered', 'completed') THEN
                RETURN jsonb_build_object('success', false, 'message', 'Pesanan yang sudah selesai tidak bisa dibatalkan');
            END IF;
        END IF;
    END IF;

    -- Apply updates
    IF p_status = 'accepted' THEN
        UPDATE public.orders SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;
    ELSIF p_status = 'preparing' THEN
        UPDATE public.orders SET status = 'preparing', preparing_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;
    ELSIF p_status = 'ready' THEN
        UPDATE public.orders SET status = 'ready', updated_at = NOW()
        WHERE id = p_order_id;
    ELSIF p_status = 'completed' THEN
        UPDATE public.orders SET status = 'completed', updated_at = NOW()
        WHERE id = p_order_id;
    ELSIF p_status = 'cancelled' THEN
        UPDATE public.orders
        SET status = 'cancelled',
            cancelled_at = NOW(),
            updated_at = NOW(),
            cancellation_reason = COALESCE(p_additional->>'cancellation_reason', v_order.cancellation_reason)
        WHERE id = p_order_id;

        IF v_order.payment_method = 'wallet' AND v_order.payment_status = 'paid' THEN
            SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = v_order.customer_id;
            IF v_wallet_id IS NOT NULL THEN
                UPDATE public.wallets SET balance = balance + v_order.total_amount, updated_at = NOW()
                WHERE id = v_wallet_id;

                INSERT INTO public.transactions (wallet_id, type, amount, description, reference_id, status)
                VALUES (v_wallet_id, 'refund', v_order.total_amount,
                        'Refund pesanan #' || substring(p_order_id::text, 1, 8), p_order_id, 'completed');

                UPDATE public.orders SET payment_status = 'refunded' WHERE id = p_order_id;
            END IF;
        END IF;
    ELSE
        UPDATE public.orders SET status = p_status, updated_at = NOW() WHERE id = p_order_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Status berhasil diperbarui');
END;
$$;


-- ============================================
-- M-5.2: Merchant Auto-Offline
-- Add last_active_at to merchants for heartbeat tracking
-- RPC to mark inactive merchants as closed
-- ============================================

ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Heartbeat function: called when merchant opens/uses app
CREATE OR REPLACE FUNCTION merchant_heartbeat(
    p_merchant_id UUID
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.merchants
    SET last_active_at = NOW(), updated_at = NOW()
    WHERE id = p_merchant_id 
    AND owner_id = auth.uid();
END;
$$;

-- Auto-close inactive merchants (called by cron or admin)
CREATE OR REPLACE FUNCTION auto_close_inactive_merchants(
    p_inactive_minutes INTEGER DEFAULT 60
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_cutoff TIMESTAMPTZ;
    v_count INTEGER := 0;
BEGIN
    v_cutoff := NOW() - (p_inactive_minutes || ' minutes')::INTERVAL;

    UPDATE public.merchants
    SET is_open = FALSE, updated_at = NOW()
    WHERE is_open = TRUE
    AND last_active_at < v_cutoff
    AND status IN ('active', 'approved');

    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'closed_count', v_count,
        'inactive_minutes', p_inactive_minutes
    );
END;
$$;


-- ============================================
-- M-9.2: Clean Up Unused 'processing' Status
-- Remove from CHECK constraint since no transition uses it
-- Note: We keep it in schema but document it as deprecated
-- ============================================

-- We don't remove from CHECK (would break existing data) but add a comment
COMMENT ON COLUMN public.orders.status IS 'Valid statuses: pending, accepted, preparing, ready, pickup, picked_up, delivering, delivered, completed, cancelled. Note: "processing" is deprecated and should not be used in new code.';
