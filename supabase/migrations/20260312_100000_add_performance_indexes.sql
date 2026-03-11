-- =====================================================================================
-- Migration: Add Performance Indexes for frequent querying
-- Applies to: orders, merchants, drivers
-- Resolves Evaluasi Item 14
-- =====================================================================================

-- ORDERS table indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- MERCHANTS table indexes
CREATE INDEX IF NOT EXISTS idx_merchants_owner_id ON merchants(owner_id);
CREATE INDEX IF NOT EXISTS idx_merchants_is_open ON merchants(is_open);

-- DRIVERS table indexes
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);

-- WALLETS table indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
