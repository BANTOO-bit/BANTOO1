-- ==========================================
-- HIGH PRIORITY FIXES MIGRATION
-- ==========================================
-- Run this in Supabase SQL Editor to deploy:
--   1. update_order_status RPC (H1)
--   2. auto_cancel_expired_orders function (H4)
--   3. Merchant reject improvements (H5)
-- ==========================================


-- ==========================================
-- H1: update_order_status RPC
-- ==========================================
-- Called by: orderService.js → supabase.rpc('update_order_status', { p_order_id, p_status, p_additional })
-- Validates caller role + enforces valid state transitions + sets server-side timestamps

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

    -- Lock the order row
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan');
    END IF;

    -- Determine caller role
    v_is_customer := (v_order.customer_id = v_caller);
    v_is_driver := (v_order.driver_id = v_caller);
    v_is_merchant := EXISTS (
        SELECT 1 FROM public.merchants WHERE id = v_order.merchant_id AND owner_id = v_caller
    );
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller;
    v_is_admin := (v_caller_role = 'admin');

    -- Permission check per target status
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
    IF p_status = 'cancelled' AND NOT (v_is_customer OR v_is_merchant OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda tidak memiliki akses untuk membatalkan pesanan ini');
    END IF;

    -- State machine: validate transition
    IF p_status = 'accepted' AND v_order.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya pesanan pending yang bisa diterima');
    END IF;
    IF p_status = 'preparing' AND v_order.status NOT IN ('accepted', 'pending') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Alur status tidak valid');
    END IF;
    IF p_status = 'ready' AND v_order.status NOT IN ('accepted', 'preparing') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan belum diproses');
    END IF;
    IF p_status = 'cancelled' AND v_order.status NOT IN ('pending', 'accepted', 'preparing') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan sudah tidak bisa dibatalkan');
    END IF;

    -- Apply update with server-side timestamps
    IF p_status = 'accepted' THEN
        UPDATE public.orders SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;
    ELSIF p_status = 'preparing' THEN
        UPDATE public.orders SET status = 'preparing', preparing_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;
    ELSIF p_status = 'ready' THEN
        UPDATE public.orders SET status = 'ready', updated_at = NOW()
        WHERE id = p_order_id;
    ELSIF p_status = 'cancelled' THEN
        UPDATE public.orders
        SET status = 'cancelled',
            cancelled_at = NOW(),
            updated_at = NOW(),
            cancellation_reason = COALESCE(p_additional->>'cancellation_reason', v_order.cancellation_reason)
        WHERE id = p_order_id;

        -- Refund wallet if paid via wallet
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
        -- Generic update for other statuses
        UPDATE public.orders SET status = p_status, updated_at = NOW() WHERE id = p_order_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Status berhasil diperbarui');
END;
$$;


-- ==========================================
-- H4: Auto-Cancel Expired Orders
-- ==========================================
-- Cancels orders stuck in 'pending' for more than 15 minutes
-- Can be called by pg_cron, Edge Function, or frontend polling

CREATE OR REPLACE FUNCTION auto_cancel_expired_orders(
    p_timeout_minutes INTEGER DEFAULT 15
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_count INTEGER;
    v_wallet RECORD;
    v_expired RECORD;
BEGIN
    -- Find and cancel expired pending orders
    FOR v_expired IN
        SELECT id, customer_id, payment_method, payment_status, total_amount
        FROM public.orders
        WHERE status = 'pending'
          AND created_at < NOW() - (p_timeout_minutes || ' minutes')::INTERVAL
        FOR UPDATE
    LOOP
        -- Cancel the order
        UPDATE public.orders
        SET status = 'cancelled',
            cancelled_at = NOW(),
            updated_at = NOW(),
            cancellation_reason = 'Otomatis dibatalkan — merchant tidak merespons dalam ' || p_timeout_minutes || ' menit'
        WHERE id = v_expired.id;

        -- Refund wallet if paid via wallet
        IF v_expired.payment_method = 'wallet' AND v_expired.payment_status = 'paid' THEN
            SELECT id INTO v_wallet FROM public.wallets WHERE user_id = v_expired.customer_id;
            IF v_wallet.id IS NOT NULL THEN
                UPDATE public.wallets SET balance = balance + v_expired.total_amount, updated_at = NOW()
                WHERE id = v_wallet.id;

                INSERT INTO public.transactions (wallet_id, type, amount, description, reference_id, status)
                VALUES (v_wallet.id, 'refund', v_expired.total_amount,
                        'Refund otomatis — timeout pesanan #' || substring(v_expired.id::text, 1, 8),
                        v_expired.id, 'completed');

                UPDATE public.orders SET payment_status = 'refunded' WHERE id = v_expired.id;
            END IF;
        END IF;

        -- Notify customer
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (v_expired.customer_id, 'Pesanan Dibatalkan',
                'Pesanan #' || substring(v_expired.id::text, 1, 8) || ' otomatis dibatalkan karena tidak direspons merchant.',
                'order', v_expired.id);
    END LOOP;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'cancelled_count', v_count
    );
END;
$$;
