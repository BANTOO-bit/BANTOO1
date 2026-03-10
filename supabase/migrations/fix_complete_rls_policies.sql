-- ==========================================
-- BANTOO - COMPLETE RLS POLICY FIX
-- ==========================================
-- Fixes remaining RLS policy gaps found during role system audit.
-- SAFE TO RUN MULTIPLE TIMES (all statements use DROP IF EXISTS)
-- Run this in Supabase Dashboard → SQL Editor
-- ==========================================


-- ==========================================
-- 1. MERCHANTS — Missing DELETE for admin
-- ==========================================
-- Admin can approve/reject/update merchants (from migration_v2),
-- but CANNOT delete merchant records. Adding this policy.

DROP POLICY IF EXISTS "Admin delete merchants" ON merchants;
CREATE POLICY "Admin delete merchants" ON merchants FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 2. MENU_ITEMS — Missing UPDATE/DELETE for admin
-- ==========================================
-- Merchants can already manage own menu (migration_v2).
-- But admin needs to manage ANY menu item (e.g. remove inappropriate items).

DROP POLICY IF EXISTS "Admin update menu items" ON menu_items;
CREATE POLICY "Admin update menu items" ON menu_items FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Admin DELETE already exists in comprehensive_rls_fix.sql,
-- but let's ensure it covers admin role check directly:
DROP POLICY IF EXISTS "Admin delete menu items" ON menu_items;
CREATE POLICY "Admin delete menu items" ON menu_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM merchants WHERE id = menu_items.merchant_id AND owner_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 3. ORDERS — Ensure merchant can see ALL order statuses
-- ==========================================
-- The comprehensive_rls_fix.sql added "(driver_id IS NULL AND status = 'ready')"
-- which helps drivers see available orders.
-- But let's ensure the full SELECT policy is correct and complete:

DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (
    -- Customer sees their own orders
    auth.uid() = customer_id
    -- Driver sees their assigned orders 
    OR auth.uid() = driver_id
    -- Drivers can see unassigned ready orders (for picking up)
    OR (driver_id IS NULL AND status = 'ready')
    -- Merchant sees orders for their restaurant
    OR EXISTS (SELECT 1 FROM merchants WHERE id = orders.merchant_id AND owner_id = auth.uid())
    -- Admin sees everything
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 4. ORDERS — Ensure UPDATE is comprehensive
-- ==========================================
-- migration_v2 has "Order participants can update" but let's
-- make sure merchant check uses the correct join:

DROP POLICY IF EXISTS "Order participants can update" ON orders;
CREATE POLICY "Order participants can update" ON orders FOR UPDATE USING (
    -- Customer can cancel their own order
    auth.uid() = customer_id
    -- Driver can update delivery status
    OR auth.uid() = driver_id
    -- Merchant can accept/process/ready the order
    OR EXISTS (SELECT 1 FROM merchants WHERE id = orders.merchant_id AND owner_id = auth.uid())
    -- Admin can update any order
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 5. PROFILES — Ensure complete policies
-- ==========================================
-- migration_v2 has "Admin update any profile" which includes self.
-- Let's ensure it's there and correct:

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin update any profile" ON profiles;
CREATE POLICY "Admin update any profile" ON profiles FOR UPDATE USING (
    auth.uid() = id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 6. DRIVERS — Ensure UPDATE includes admin
-- ==========================================
-- migration_v2 already has admin in driver UPDATE policy,
-- fix_admin_driver_rls.sql adds a separate admin-only policy.
-- Consolidate to avoid duplicate/conflicting policies:

DROP POLICY IF EXISTS "Drivers update own record" ON drivers;
DROP POLICY IF EXISTS "Admins can update drivers" ON drivers;
CREATE POLICY "Drivers update own record" ON drivers FOR UPDATE USING (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Admin DELETE drivers (already in comprehensive_rls_fix, ensure it exists):
DROP POLICY IF EXISTS "Admins can delete drivers" ON drivers;
DROP POLICY IF EXISTS "Admin delete drivers" ON drivers;
CREATE POLICY "Admin delete drivers" ON drivers FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 7. MERCHANTS — Ensure UPDATE includes admin  
-- ==========================================
-- migration_v2 already has this, but let's consolidate:

DROP POLICY IF EXISTS "Owners update own merchant" ON merchants;
DROP POLICY IF EXISTS "Admin update merchants" ON merchants;
CREATE POLICY "Admin update merchants" ON merchants FOR UPDATE USING (
    auth.uid() = owner_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 8. WALLETS — Admin should view all wallets
-- ==========================================
-- Currently only users can view own wallet.
-- Admin needs to see all wallets for financial management.

DROP POLICY IF EXISTS "Users view own wallet" ON wallets;
CREATE POLICY "Users view own wallet" ON wallets FOR SELECT USING (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Admin should also be able to update wallets (for manual adjustments):
DROP POLICY IF EXISTS "Users update own wallet" ON wallets;
CREATE POLICY "Users update own wallet" ON wallets FOR UPDATE USING (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 9. TRANSACTIONS — Admin view all
-- ==========================================
-- Already in migration_v2, ensure it's correct:

DROP POLICY IF EXISTS "Users view own transactions" ON transactions;
CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM wallets WHERE id = transactions.wallet_id AND user_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 10. WITHDRAWALS — Ensure admin can manage
-- ==========================================
-- Already in migration_v2, ensure completeness:

DROP POLICY IF EXISTS "Users view own withdrawals" ON withdrawals;
CREATE POLICY "Users view own withdrawals" ON withdrawals FOR SELECT USING (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admin update withdrawals" ON withdrawals;
CREATE POLICY "Admin update withdrawals" ON withdrawals FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 11. REVIEWS — Admin UPDATE (for moderation)
-- ==========================================

DROP POLICY IF EXISTS "Admin update reviews" ON reviews;
CREATE POLICY "Admin update reviews" ON reviews FOR UPDATE USING (
    -- Merchant can reply to their reviews
    EXISTS (SELECT 1 FROM merchants WHERE id = reviews.merchant_id AND owner_id = auth.uid())
    -- Admin can moderate any review
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 12. PROMOS — DELETE for admin
-- ==========================================

DROP POLICY IF EXISTS "Admin delete promos" ON promos;
CREATE POLICY "Admin delete promos" ON promos FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 13. NOTIFICATIONS — Admin INSERT for broadcast
-- ==========================================
-- Admin should be able to create notifications for any user.
-- "System insert notifications" WITH CHECK (true) already exists,
-- which covers this. No change needed.


-- ==========================================
-- 14. ENSURE user_roles TABLE EXISTS WITH PROPER RLS
-- ==========================================
-- This table is created in fix_missing_rpc_and_tables.sql migration.
-- Ensure it has proper policies:

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'merchant', 'driver', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own roles" ON user_roles;
CREATE POLICY "Users view own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin manage all roles" ON user_roles;
CREATE POLICY "Admin manage all roles"
    ON public.user_roles FOR ALL
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;


-- ==========================================
-- DONE! All RLS policy gaps have been fixed.
-- ==========================================
-- 
-- Summary of what this migration adds/consolidates:
-- 1. Admin DELETE merchants (NEW)
-- 2. Admin UPDATE/DELETE menu_items (NEW + consolidated)
-- 3. Orders SELECT — complete policy with all role checks
-- 4. Orders UPDATE — complete policy with all role checks
-- 5. Profiles UPDATE — consolidated admin + self
-- 6. Drivers UPDATE — consolidated admin + self
-- 7. Drivers DELETE — admin only
-- 8. Merchants UPDATE — consolidated admin + owner
-- 9. Wallets SELECT/UPDATE — added admin access
-- 10. Transactions SELECT — added admin access
-- 11. Withdrawals SELECT/UPDATE — admin management
-- 12. Reviews UPDATE — admin moderation
-- 13. Promos DELETE — admin cleanup (NEW)
-- 14. user_roles table + RLS (ensure exists)
-- ==========================================
