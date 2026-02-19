-- ============================================================
-- CRITICAL FIXES MIGRATION
-- Deploy via: Supabase SQL Editor → paste → Run
-- ============================================================

-- ============================================
-- C2: Fix COD payment_status auto-set on delivery
-- Previously: driver_update_order_status set payment_status='paid' automatically
-- Fix: Only set delivery timestamp, NOT payment status.
--      COD payment confirmed separately via confirm_cod_payment RPC.
-- ============================================

CREATE OR REPLACE FUNCTION driver_update_order_status(
    p_order_id UUID,
    p_status TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_current_status TEXT;
    v_driver_id UUID;
BEGIN
    v_driver_id := auth.uid();

    SELECT status INTO v_current_status
    FROM public.orders
    WHERE id = p_order_id AND driver_id = v_driver_id
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan atau bukan milik Anda');
    END IF;

    IF p_status = 'picked_up' THEN
        IF v_current_status != 'pickup' THEN
             RETURN jsonb_build_object('success', false, 'message', 'Alur salah: Status saat ini ' || v_current_status);
        END IF;

        UPDATE public.orders 
        SET status = 'picked_up', picked_up_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;

    ELSIF p_status = 'delivering' THEN
        IF v_current_status != 'picked_up' THEN
             RETURN jsonb_build_object('success', false, 'message', 'Harus ambil pesanan dulu');
        END IF;
        
        UPDATE public.orders 
        SET status = 'delivering', updated_at = NOW()
        WHERE id = p_order_id;

    ELSIF p_status = 'delivered' OR p_status = 'completed' THEN
        IF v_current_status NOT IN ('picked_up', 'delivering') THEN
             RETURN jsonb_build_object('success', false, 'message', 'Pesanan belum diambil');
        END IF;

        -- C2 FIX: Only set delivery status + timestamp.
        -- Payment status is handled separately by confirm_cod_payment (for COD)
        -- or was already 'paid' at order creation (for wallet).
        UPDATE public.orders 
        SET status = 'delivered', delivered_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;
        
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Status tidak valid');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Status diperbarui');
END;
$$;


-- ============================================
-- C2b: New RPC — confirm_cod_payment
-- Called by driver AFTER delivery to confirm cash received.
-- Only the assigned driver can confirm. Prevents double-confirm.
-- ============================================

CREATE OR REPLACE FUNCTION confirm_cod_payment(
    p_order_id UUID
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
    v_order RECORD;
BEGIN
    v_driver_id := auth.uid();
    IF v_driver_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    -- Lock row to prevent concurrent updates
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan');
    END IF;

    -- Only assigned driver can confirm
    IF v_order.driver_id != v_driver_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya driver yang ditugaskan yang dapat konfirmasi pembayaran');
    END IF;

    -- Must be delivered first
    IF v_order.status NOT IN ('delivered', 'completed') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan belum diantar');
    END IF;

    -- Must be COD
    IF v_order.payment_method != 'cod' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan ini bukan COD');
    END IF;

    -- Prevent double-confirm
    IF v_order.payment_status = 'paid' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Pembayaran sudah dikonfirmasi sebelumnya');
    END IF;

    -- Confirm payment
    UPDATE public.orders
    SET payment_status = 'paid',
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'message', 'Pembayaran COD berhasil dikonfirmasi');
END;
$$;


-- ============================================
-- C3: Fix order_items INSERT RLS (too permissive)
-- Previously: WITH CHECK (true) — anyone authenticated could insert
-- Fix: Only allow insert if the order belongs to the caller
-- ============================================

DROP POLICY IF EXISTS "System insert order items" ON order_items;
CREATE POLICY "System insert order items" ON order_items 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders WHERE id = order_items.order_id 
        AND customer_id = auth.uid()
    )
    OR
    -- Allow admin and system (SECURITY DEFINER RPCs bypass RLS anyway)
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ============================================
-- C4: New RPC — validate_cart_items
-- Checks if menu items exist and are available before checkout.
-- Returns validation result with unavailable items.
-- ============================================

CREATE OR REPLACE FUNCTION validate_cart_items(
    p_items JSONB
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_item JSONB;
    v_menu_item RECORD;
    v_unavailable JSONB := '[]'::JSONB;
    v_all_valid BOOLEAN := TRUE;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT id, name, price, is_available
        INTO v_menu_item
        FROM public.menu_items
        WHERE id = (v_item->>'menu_item_id')::UUID;

        IF v_menu_item IS NULL THEN
            v_all_valid := FALSE;
            v_unavailable := v_unavailable || jsonb_build_array(jsonb_build_object(
                'menu_item_id', v_item->>'menu_item_id',
                'name', v_item->>'name',
                'reason', 'Item tidak ditemukan (mungkin sudah dihapus)'
            ));
        ELSIF v_menu_item.is_available = FALSE THEN
            v_all_valid := FALSE;
            v_unavailable := v_unavailable || jsonb_build_array(jsonb_build_object(
                'menu_item_id', v_menu_item.id,
                'name', v_menu_item.name,
                'reason', 'Item sedang tidak tersedia'
            ));
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'valid', v_all_valid,
        'unavailable_items', v_unavailable
    );
END;
$$;
