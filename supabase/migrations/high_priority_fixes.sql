-- ============================================================
-- HIGH PRIORITY FIXES MIGRATION
-- Deploy via: Supabase SQL Editor → paste → Run
-- ============================================================


-- ============================================
-- H-12.2: Performance Indexes
-- Missing indexes cause slow queries at scale
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON public.orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON public.orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_merchant_id ON public.menu_items(merchant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON public.drivers(is_active) WHERE is_active = true;


-- ============================================
-- H-9.1: Add explicit completed transition
-- update_order_status now supports 'completed' status
-- with permission for customer/driver/admin
-- ============================================

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
    -- H-9.1: completed can be set by customer, driver, or admin
    IF p_status = 'completed' AND NOT (v_is_customer OR v_is_driver OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda tidak memiliki akses untuk menyelesaikan pesanan');
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
    -- H-9.1: completed only from delivered
    IF p_status = 'completed' AND v_order.status != 'delivered' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan harus berstatus delivered untuk diselesaikan');
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
    ELSIF p_status = 'completed' THEN
        -- H-9.1: Mark as completed with timestamp
        UPDATE public.orders SET status = 'completed', updated_at = NOW()
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
        -- Generic update for other statuses (driver statuses handled by driver_update_order_status)
        UPDATE public.orders SET status = p_status, updated_at = NOW() WHERE id = p_order_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Status berhasil diperbarui');
END;
$$;


-- ============================================
-- H-5.1: Stock Management
-- Add stock column to menu_items (NULL = unlimited)
-- ============================================

ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT NULL;
-- NULL = unlimited stock, 0 = out of stock

COMMENT ON COLUMN public.menu_items.stock IS 'Item stock count. NULL means unlimited, 0 means out of stock.';


-- ============================================
-- H-6.2: Driver Order Timeout
-- Auto-unassign driver if order stuck in pickup/delivering for too long
-- ============================================

CREATE OR REPLACE FUNCTION auto_reassign_stale_driver_orders(
    p_timeout_minutes INTEGER DEFAULT 30
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_cutoff TIMESTAMPTZ;
    v_count INTEGER := 0;
    v_order RECORD;
BEGIN
    v_cutoff := NOW() - (p_timeout_minutes || ' minutes')::INTERVAL;

    -- Find orders stuck in driver-active statuses
    FOR v_order IN
        SELECT id, status, driver_id
        FROM public.orders
        WHERE status IN ('pickup', 'picked_up', 'delivering')
        AND updated_at < v_cutoff
        FOR UPDATE SKIP LOCKED
    LOOP
        -- Unassign driver and reset to 'ready' so another driver can pick up
        UPDATE public.orders
        SET driver_id = NULL,
            status = 'ready',
            updated_at = NOW(),
            cancellation_reason = COALESCE(cancellation_reason, '') ||
                ' [Auto: Driver timeout after ' || p_timeout_minutes || ' min]'
        WHERE id = v_order.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'reassigned_count', v_count,
        'timeout_minutes', p_timeout_minutes
    );
END;
$$;


-- ============================================
-- H-7.1: Admin Suspend Driver → Handle Active Orders
-- Trigger: when driver is deactivated, unassign their active orders
-- ============================================

CREATE OR REPLACE FUNCTION handle_driver_deactivation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_user_id UUID;
    v_count INTEGER := 0;
BEGIN
    -- Only trigger when is_active changes from true to false
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        v_driver_user_id := NEW.user_id;

        -- Unassign all active orders for this driver
        UPDATE public.orders
        SET driver_id = NULL,
            status = 'ready',
            updated_at = NOW(),
            cancellation_reason = COALESCE(cancellation_reason, '') ||
                ' [Auto: Driver suspended — order re-queued for pickup]'
        WHERE driver_id = v_driver_user_id
        AND status IN ('pickup', 'picked_up', 'delivering');

        GET DIAGNOSTICS v_count = ROW_COUNT;

        IF v_count > 0 THEN
            RAISE NOTICE 'Driver % deactivated: % active orders re-queued', v_driver_user_id, v_count;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_driver_deactivation ON public.drivers;
CREATE TRIGGER trg_driver_deactivation
    AFTER UPDATE OF is_active ON public.drivers
    FOR EACH ROW
    EXECUTE FUNCTION handle_driver_deactivation();


-- ============================================
-- H-4.2: COD Dispute Logging
-- Table + RPC for raising payment disputes
-- ============================================

CREATE TABLE IF NOT EXISTS public.order_disputes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    raised_by UUID REFERENCES public.profiles(id) NOT NULL,
    raised_by_role TEXT NOT NULL CHECK (raised_by_role IN ('customer', 'driver', 'merchant', 'admin')),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
    resolution TEXT,
    resolved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View own disputes" ON order_disputes;
CREATE POLICY "View own disputes" ON order_disputes FOR SELECT USING (
    raised_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM orders o WHERE o.id = order_disputes.order_id AND (
            o.customer_id = auth.uid() OR
            o.driver_id = auth.uid() OR
            EXISTS (SELECT 1 FROM merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
        )
    )
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Create dispute" ON order_disputes;
CREATE POLICY "Create dispute" ON order_disputes FOR INSERT WITH CHECK (
    raised_by = auth.uid()
);

DROP POLICY IF EXISTS "Admin manage disputes" ON order_disputes;
CREATE POLICY "Admin manage disputes" ON order_disputes FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- RPC to raise a dispute with validation
CREATE OR REPLACE FUNCTION raise_order_dispute(
    p_order_id UUID,
    p_reason TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_caller UUID;
    v_order RECORD;
    v_role TEXT;
    v_dispute_id UUID;
BEGIN
    v_caller := auth.uid();
    IF v_caller IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan');
    END IF;

    IF v_order.status NOT IN ('delivered', 'completed') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Dispute hanya bisa diajukan untuk pesanan yang sudah diantar');
    END IF;

    IF v_order.customer_id = v_caller THEN
        v_role := 'customer';
    ELSIF v_order.driver_id = v_caller THEN
        v_role := 'driver';
    ELSIF EXISTS (SELECT 1 FROM merchants WHERE id = v_order.merchant_id AND owner_id = v_caller) THEN
        v_role := 'merchant';
    ELSE
        SELECT role INTO v_role FROM profiles WHERE id = v_caller;
        IF v_role != 'admin' THEN
            RETURN jsonb_build_object('success', false, 'message', 'Anda tidak terkait dengan pesanan ini');
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.order_disputes
        WHERE order_id = p_order_id AND status IN ('open', 'investigating')
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sudah ada dispute aktif untuk pesanan ini');
    END IF;

    INSERT INTO public.order_disputes (order_id, raised_by, raised_by_role, reason)
    VALUES (p_order_id, v_caller, v_role, p_reason)
    RETURNING id INTO v_dispute_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Dispute berhasil diajukan',
        'dispute_id', v_dispute_id
    );
END;
$$;

CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.order_disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.order_disputes(status);
