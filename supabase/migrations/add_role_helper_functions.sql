-- ==========================================
-- Migration: Add Role Helper Functions
-- Created: 2026-03-12
-- ==========================================
-- PROBLEM: Admin checks are scattered across RLS policies using:
--   (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
-- But the app also has a user_roles table. These can go out of sync.
--
-- FIX: Create helper functions that check BOTH sources for backward
-- compatibility, then update the most critical RLS policies.
-- SAFE TO RUN MULTIPLE TIMES (idempotent — CREATE OR REPLACE)
-- ==========================================


-- ==========================================
-- 1. is_admin() — Check if current user is admin
-- ==========================================
-- Checks both profiles.role AND user_roles table for maximum safety.
-- Cached per-transaction via STABLE marker for performance.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
    OR EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    );
$$;


-- ==========================================
-- 2. has_role(role_name) — Check if current user has a specific role
-- ==========================================

CREATE OR REPLACE FUNCTION has_role(p_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = p_role
    )
    OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = p_role
    );
$$;


-- ==========================================
-- 3. Update critical RLS policies to use is_admin()
-- ==========================================
-- We only update the most critical policies. Others can be migrated
-- gradually to avoid risk from a mega-migration.

-- 3.1 Orders — SELECT
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (
    auth.uid() = customer_id
    OR auth.uid() = driver_id
    OR (driver_id IS NULL AND status = 'ready')
    OR EXISTS (SELECT 1 FROM merchants WHERE id = orders.merchant_id AND owner_id = auth.uid())
    OR is_admin()
);

-- 3.2 Orders — INSERT
DROP POLICY IF EXISTS "Customers create orders" ON orders;
CREATE POLICY "Customers create orders" ON orders FOR INSERT WITH CHECK (
    auth.uid() = customer_id
    OR is_admin()
);

-- 3.3 Orders — UPDATE
DROP POLICY IF EXISTS "Order participants can update" ON orders;
CREATE POLICY "Order participants can update" ON orders FOR UPDATE USING (
    auth.uid() = customer_id
    OR auth.uid() = driver_id
    OR EXISTS (SELECT 1 FROM merchants WHERE id = orders.merchant_id AND owner_id = auth.uid())
    OR is_admin()
);

-- 3.4 Orders — DELETE
DROP POLICY IF EXISTS "Admin delete orders" ON orders;
CREATE POLICY "Admin delete orders" ON orders FOR DELETE USING (
    is_admin()
);

-- 3.5 Wallets — SELECT
DROP POLICY IF EXISTS "Users view own wallet" ON wallets;
CREATE POLICY "Users view own wallet" ON wallets FOR SELECT USING (
    auth.uid() = user_id
    OR is_admin()
);

-- 3.6 Wallets — UPDATE
DROP POLICY IF EXISTS "Users update own wallet" ON wallets;
CREATE POLICY "Users update own wallet" ON wallets FOR UPDATE USING (
    auth.uid() = user_id
    OR is_admin()
);

-- 3.7 Withdrawals — SELECT
DROP POLICY IF EXISTS "Users view own withdrawals" ON withdrawals;
CREATE POLICY "Users view own withdrawals" ON withdrawals FOR SELECT USING (
    auth.uid() = user_id
    OR is_admin()
);

-- 3.8 Withdrawals — UPDATE
DROP POLICY IF EXISTS "Admin update withdrawals" ON withdrawals;
CREATE POLICY "Admin update withdrawals" ON withdrawals FOR UPDATE USING (
    is_admin()
);

-- 3.9 Profiles — UPDATE
DROP POLICY IF EXISTS "Admin update any profile" ON profiles;
CREATE POLICY "Admin update any profile" ON profiles FOR UPDATE USING (
    auth.uid() = id
    OR is_admin()
);


-- ==========================================
-- Grant execute on helper functions
-- ==========================================
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION has_role(TEXT) TO authenticated;
