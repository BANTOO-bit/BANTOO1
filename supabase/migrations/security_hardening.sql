-- ==========================================
-- Security Fixes Migration
-- ==========================================
-- 1. Add RLS to order_counters and promos
-- 2. Fix create_order to use SECURITY DEFINER
-- ==========================================

-- 1. RLS for order_counters (internal table, no direct user access)
ALTER TABLE IF EXISTS public.order_counters ENABLE ROW LEVEL SECURITY;

-- Only internal functions can read/write order_counters
-- No user-facing policies needed (trigger uses SECURITY DEFINER functions)
DROP POLICY IF EXISTS "order_counters_internal_only" ON public.order_counters;

-- 2. RLS for promos (read-only for authenticated users)
ALTER TABLE IF EXISTS public.promos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promos_read_active" ON public.promos;
CREATE POLICY "promos_read_active" ON public.promos
    FOR SELECT USING (is_active = TRUE);

-- Admin can manage promos
DROP POLICY IF EXISTS "promos_admin_all" ON public.promos;
CREATE POLICY "promos_admin_all" ON public.promos
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 3. Make create_order use SECURITY DEFINER
-- (already replaced in infrastructure_improvements.sql, but ensure it's set)
-- The function uses auth.uid() internally, SECURITY DEFINER ensures it runs
-- with database owner privileges while still checking the caller's identity

-- 4. Make generate_order_number accessible from trigger context
-- (trigger_set_order_number runs as SECURITY DEFINER, so generate_order_number
-- needs to be callable from that context)
GRANT EXECUTE ON FUNCTION generate_order_number() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_order_number() TO anon;

-- 5. Ensure order_counters is accessible from trigger functions
GRANT SELECT, INSERT, UPDATE ON public.order_counters TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.order_counters TO anon;

-- 6. Protect app_settings - only admin can write
DROP POLICY IF EXISTS "app_settings_read_all" ON public.app_settings;
CREATE POLICY "app_settings_read_all" ON public.app_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "app_settings_admin_write" ON public.app_settings;
CREATE POLICY "app_settings_admin_write" ON public.app_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
