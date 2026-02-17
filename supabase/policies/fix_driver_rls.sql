
-- Fix Driver RLS Policies
-- Drivers table was enabled for RLS but had NO policies, blocking everything.

-- 1. Allow everyone to view drivers (needed for admin/customers later?) 
-- Actually, strict checking: maybe only admins and the driver themselves?
-- For now, let's allow public read to be safe for status checks.
DROP POLICY IF EXISTS "Drivers viewable by everyone" ON drivers;
CREATE POLICY "Drivers viewable by everyone" ON drivers FOR SELECT USING (true);

-- 2. Allow authenticated users to INSERT their own driver application
DROP POLICY IF EXISTS "Users can apply as driver" ON drivers;
CREATE POLICY "Users can apply as driver" ON drivers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Allow drivers to update their own record
DROP POLICY IF EXISTS "Drivers update own record" ON drivers;
CREATE POLICY "Drivers update own record" ON drivers FOR UPDATE USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
