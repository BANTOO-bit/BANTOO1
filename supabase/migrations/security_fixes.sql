-- ==========================================
-- SECURITY FIXES — Production Readiness
-- ==========================================
-- 
-- This migration fixes critical security issues found during audit:
-- 1. order_items INSERT policy — ownership validation
-- 2. auto_assign_nearest_driver — missing columns
-- 3. Admin RPC role checks
-- 4. Notifications INSERT policy tightening
-- 5. Admin audit log table
-- 6. Merchant status update RPC (server-side timestamps)
--
-- SAFE TO RUN MULTIPLE TIMES (idempotent)
-- ==========================================


-- ==========================================
-- 1. FIX: order_items INSERT policy
-- ==========================================
-- PROBLEM: WITH CHECK (true) allows anyone to insert order items
-- FIX: Only allow insert if the order belongs to the authenticated user

DROP POLICY IF EXISTS "System insert order items" ON order_items;
DROP POLICY IF EXISTS "Order owner insert items" ON order_items;
CREATE POLICY "Order owner insert items" ON order_items FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.customer_id = auth.uid()
    )
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 2. FIX: auto_assign_nearest_driver missing columns
-- ==========================================
-- PROBLEM: Function references `is_verified` and `last_location_update` which don't exist
-- FIX: Add the missing columns, then update the function

-- Add missing columns to drivers table
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ;

-- Update driver location function to also update last_location_update
CREATE OR REPLACE FUNCTION update_driver_location(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.drivers
    SET 
        latitude = p_lat, 
        longitude = p_lng,
        updated_at = NOW(),
        last_location_update = NOW(),
        is_active = true
    WHERE user_id = auth.uid();
END;
$$;

-- Mark approved drivers as verified automatically
UPDATE public.drivers SET is_verified = TRUE WHERE status IN ('approved', 'active');


-- ==========================================
-- 3. FIX: Admin RPC role checks
-- ==========================================

-- 3.1 get_admin_dashboard_stats — admin only
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    v_role TEXT;
    v_total_orders INTEGER;
    v_active_cod INTEGER;
    v_online_drivers INTEGER;
    v_total_revenue INTEGER;
    v_json JSONB;
BEGIN
    -- Role check: admin only
    SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
    IF v_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: admin access only';
    END IF;

    SELECT COUNT(*) INTO v_total_orders FROM orders 
    WHERE created_at > CURRENT_DATE;
    
    SELECT COALESCE(SUM(total_amount), 0) INTO v_active_cod 
    FROM orders WHERE payment_method = 'cod' AND payment_status = 'pending';
    
    SELECT COUNT(*) INTO v_online_drivers FROM drivers WHERE is_active = TRUE;
    
    SELECT COALESCE(SUM(service_fee), 0) INTO v_total_revenue 
    FROM orders WHERE status IN ('delivered', 'completed');

    v_json := json_build_object(
        'total_orders', v_total_orders,
        'active_cod', v_active_cod,
        'online_drivers', v_online_drivers,
        'today_revenue', v_total_revenue
    );
    
    RETURN v_json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3.2 wallet_balance_plus — admin only
CREATE OR REPLACE FUNCTION wallet_balance_plus(
    p_user_id UUID,
    p_amount INTEGER
) RETURNS VOID AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- Role check: admin only
    SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
    IF v_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: admin access only';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid amount';
    END IF;

    UPDATE wallets
    SET balance = balance + p_amount, updated_at = NOW()
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
    END IF;

    INSERT INTO transactions (wallet_id, type, amount, description, status)
    SELECT w.id, 'refund', p_amount, 'Refund penarikan yang ditolak', 'completed'
    FROM wallets w WHERE w.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3.3 process_withdrawal — admin only
CREATE OR REPLACE FUNCTION process_withdrawal(
    p_user_id UUID,
    p_amount INTEGER,
    p_bank_name TEXT,
    p_bank_account_name TEXT,
    p_bank_account_number TEXT
) RETURNS JSONB AS $$
DECLARE
    v_role TEXT;
    v_wallet RECORD;
    v_withdrawal_id UUID;
BEGIN
    -- Role check: admin only
    SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
    IF v_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: admin access only';
    END IF;

    SELECT * INTO v_wallet FROM wallets 
    WHERE user_id = p_user_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;
    
    IF v_wallet.balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance. Current: %, Requested: %', v_wallet.balance, p_amount;
    END IF;
    
    UPDATE wallets SET 
        balance = balance - p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    INSERT INTO withdrawals (user_id, amount, bank_name, bank_account_name, bank_account_number, status)
    VALUES (p_user_id, p_amount, p_bank_name, p_bank_account_name, p_bank_account_number, 'pending')
    RETURNING id INTO v_withdrawal_id;
    
    INSERT INTO transactions (wallet_id, type, amount, description, reference_id)
    VALUES (v_wallet.id, 'withdrawal', p_amount, 'Penarikan ke ' || p_bank_name, v_withdrawal_id);
    
    RETURN json_build_object(
        'success', true,
        'withdrawal_id', v_withdrawal_id,
        'new_balance', v_wallet.balance - p_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3.4 assign_driver_to_order — admin only
CREATE OR REPLACE FUNCTION assign_driver_to_order(
    p_order_id UUID,
    p_driver_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_role TEXT;
    v_driver_record RECORD;
    v_order RECORD;
BEGIN
    -- Role check: admin only
    SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
    IF v_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: admin access only';
    END IF;

    SELECT * INTO v_driver_record FROM drivers 
    WHERE user_id = p_driver_user_id AND status IN ('approved', 'active') AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Driver not found or not active';
    END IF;
    
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;
    
    IF v_order.driver_id IS NOT NULL THEN
        RAISE EXCEPTION 'Order already has a driver assigned';
    END IF;
    
    IF v_order.status NOT IN ('pending', 'accepted', 'preparing', 'processing', 'ready') THEN
        RAISE EXCEPTION 'Order is not in a valid state for driver assignment';
    END IF;
    
    UPDATE orders SET
        driver_id = p_driver_user_id,
        status = CASE WHEN status = 'ready' THEN 'pickup' ELSE status END,
        updated_at = NOW()
    WHERE id = p_order_id;
    
    RETURN json_build_object(
        'success', true,
        'order_id', p_order_id,
        'driver_id', p_driver_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 4. FIX: Notifications INSERT policy
-- ==========================================
-- PROBLEM: WITH CHECK (true) allows anyone to insert notifications
-- FIX: Only allow self-notifications or system triggers

DROP POLICY IF EXISTS "System insert notifications" ON notifications;
DROP POLICY IF EXISTS "Notifications insert policy" ON notifications;
CREATE POLICY "System insert notifications" ON notifications FOR INSERT 
WITH CHECK (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Note: Triggers use SECURITY DEFINER so they bypass RLS.
-- This policy covers direct inserts from frontend.


-- ==========================================
-- 5. NEW: Admin Audit Log Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_type TEXT, -- 'order', 'merchant', 'driver', 'user', 'withdrawal', 'promo', 'setting'
    target_id UUID,
    details JSONB DEFAULT '{}'::JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admin can view audit logs
DROP POLICY IF EXISTS "Admin view audit logs" ON admin_audit_log;
CREATE POLICY "Admin view audit logs" ON admin_audit_log FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Only admin can insert audit logs
DROP POLICY IF EXISTS "Admin insert audit logs" ON admin_audit_log;
CREATE POLICY "Admin insert audit logs" ON admin_audit_log FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    AND auth.uid() = admin_id
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON admin_audit_log(created_at DESC);


-- ==========================================
-- 6. NEW: Server-side order status update RPC
-- ==========================================
-- Replaces client-side timestamps in orderService.updateStatus

CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_status TEXT,
    p_additional JSONB DEFAULT '{}'::JSONB
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_order RECORD;
    v_user_id UUID;
    v_role TEXT;
    v_is_customer BOOLEAN;
    v_is_driver BOOLEAN;
    v_is_merchant BOOLEAN;
    v_is_admin BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get user role
    SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
    v_is_admin := (v_role = 'admin');

    -- Get order with lock
    SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- Check permissions
    v_is_customer := (v_order.customer_id = v_user_id);
    v_is_driver := (v_order.driver_id = v_user_id);
    v_is_merchant := EXISTS (
        SELECT 1 FROM merchants WHERE id = v_order.merchant_id AND owner_id = v_user_id
    );

    -- Validate role-based permissions for status transitions
    CASE p_status
        WHEN 'cancelled' THEN
            IF NOT (v_is_customer OR v_is_merchant OR v_is_admin) THEN
                RAISE EXCEPTION 'Not authorized to cancel';
            END IF;
            IF v_order.status NOT IN ('pending', 'accepted') THEN
                RAISE EXCEPTION 'Cannot cancel order in status: %', v_order.status;
            END IF;
        WHEN 'accepted' THEN
            IF NOT (v_is_merchant OR v_is_admin) THEN
                RAISE EXCEPTION 'Not authorized';
            END IF;
        WHEN 'preparing' THEN
            IF NOT (v_is_merchant OR v_is_admin) THEN
                RAISE EXCEPTION 'Not authorized';
            END IF;
        WHEN 'ready' THEN
            IF NOT (v_is_merchant OR v_is_admin) THEN
                RAISE EXCEPTION 'Not authorized';
            END IF;
        WHEN 'pickup', 'picked_up', 'delivering' THEN
            IF NOT (v_is_driver OR v_is_admin) THEN
                RAISE EXCEPTION 'Not authorized';
            END IF;
        WHEN 'delivered', 'completed' THEN
            IF NOT (v_is_driver OR v_is_customer OR v_is_admin) THEN
                RAISE EXCEPTION 'Not authorized';
            END IF;
        ELSE
            IF NOT v_is_admin THEN
                RAISE EXCEPTION 'Invalid status';
            END IF;
    END CASE;

    -- Update with SERVER-SIDE timestamps
    UPDATE orders SET
        status = p_status,
        accepted_at = CASE WHEN p_status = 'accepted' THEN NOW() ELSE accepted_at END,
        preparing_at = CASE WHEN p_status = 'preparing' THEN NOW() ELSE preparing_at END,
        picked_up_at = CASE WHEN p_status IN ('pickup', 'picked_up') THEN NOW() ELSE picked_up_at END,
        delivered_at = CASE WHEN p_status IN ('delivered', 'completed') THEN NOW() ELSE delivered_at END,
        cancelled_at = CASE WHEN p_status = 'cancelled' THEN NOW() ELSE cancelled_at END,
        cancellation_reason = CASE WHEN p_status = 'cancelled' THEN (p_additional->>'cancellation_reason') ELSE cancellation_reason END,
        payment_status = CASE WHEN p_status IN ('delivered', 'completed') THEN 'paid' ELSE payment_status END,
        prep_time = CASE WHEN (p_additional->>'prep_time') IS NOT NULL THEN (p_additional->>'prep_time')::INTEGER ELSE prep_time END,
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN json_build_object(
        'success', true,
        'order_id', p_order_id,
        'status', p_status
    );
END;
$$;


-- ==========================================
-- DONE! Security fixes deployed.
-- ==========================================
