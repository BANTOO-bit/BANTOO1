-- ==========================================
-- Migration: Atomic COD Delivery Completion
-- ==========================================
-- Problem: DriverPaymentConfirmation calls 2 separate RPCs:
--   1. driver_update_order_status('delivered')
--   2. confirm_cod_payment()
-- If step 1 succeeds but step 2 fails, order is stuck with
-- status='delivered' + payment_status='pending'.
--
-- Fix: Single atomic RPC that does all three in one transaction:
--   - Set status to 'completed'
--   - Set payment_status to 'paid'
--   - Set delivered_at and paid_at timestamps
-- ==========================================

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

    -- Lock the order row and verify ownership
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

    -- Validate current status (must be in active delivery state)
    IF v_order.status NOT IN ('picked_up', 'delivering') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan belum diambil dari merchant (status: ' || v_order.status || ')');
    END IF;

    -- Validate payment method is COD (accept all variants: cod, cash, tunai)
    IF LOWER(v_order.payment_method) NOT IN ('cod', 'cash', 'tunai') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Fungsi ini hanya untuk pesanan COD');
    END IF;

    -- Prevent double completion
    IF v_order.payment_status = 'paid' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pembayaran sudah dikonfirmasi sebelumnya');
    END IF;

    -- ATOMIC: Set everything in one UPDATE
    UPDATE public.orders
    SET 
        status = 'completed',
        payment_status = 'paid',
        delivered_at = NOW(),
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'message', 'Pesanan COD selesai dan pembayaran dikonfirmasi');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION driver_complete_cod_delivery(UUID, FLOAT, FLOAT) TO authenticated;
