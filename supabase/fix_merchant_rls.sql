
-- Fix Merchant RLS Policy
-- Ensure owners can always select their own merchant record

-- Debug: Drop existing policy to avoid conflict
DROP POLICY IF EXISTS "Merchants viewable by everyone" ON merchants;
DROP POLICY IF EXISTS "Owners select own merchant" ON merchants;

-- Create explicit policy for everyone (since public profiles need to see merchants)
CREATE POLICY "Merchants viewable by everyone" ON merchants FOR SELECT USING (true);

-- Create explicit policy for owners (redundant but safe)
CREATE POLICY "Owners select own merchant" ON merchants FOR SELECT USING (auth.uid() = owner_id);

-- Ensure RLS is enabled
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
