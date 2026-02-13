
-- Fix Orders RLS Policy for Drivers
-- The 'orders' table has 'driver_id' which references 'drivers.id'
-- But the 'drivers.id' is NOT the same as 'auth.uid()' (which acts as user_id).
-- We need to check if the current user owns the driver record referenced by order.driver_id

DROP POLICY IF EXISTS "Users view own orders" ON orders;

CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (
    auth.uid() = customer_id -- For Customers
    OR 
    EXISTS ( -- For Drivers
      SELECT 1 FROM drivers 
      WHERE drivers.id = orders.driver_id 
      AND drivers.user_id = auth.uid()
    )
    OR 
    EXISTS ( -- For Merchants
      SELECT 1 FROM merchants 
      WHERE merchants.id = orders.merchant_id 
      AND merchants.owner_id = auth.uid()
    )
    OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' -- For Admins
);

-- Note: We also need similar logic for UPDATE if drivers need to update status
DROP POLICY IF EXISTS "Drivers update own orders" ON orders;
CREATE POLICY "Drivers update own orders" ON orders FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM drivers 
      WHERE drivers.id = orders.driver_id 
      AND drivers.user_id = auth.uid()
    )
);
