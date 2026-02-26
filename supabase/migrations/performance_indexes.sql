-- =========================================================
-- Migration: Performance Indexes
-- Author: ANTIGRAVITY
-- Created: 2026-02-25
-- =========================================================
-- Optimizes query performance for COD admin panel,
-- driver dashboard, and notification queries.
-- =========================================================

-- 1. cod_ledger: composite index for balance queries per driver by type
CREATE INDEX IF NOT EXISTS idx_cod_ledger_driver_type
    ON cod_ledger (driver_id, type, created_at DESC);

-- 2. cod_ledger: index for time-based queries (oldest unpaid)
CREATE INDEX IF NOT EXISTS idx_cod_ledger_driver_created
    ON cod_ledger (driver_id, created_at)
    WHERE type = 'fee_accrued';

-- 3. deposits: index for admin pending review queue
CREATE INDEX IF NOT EXISTS idx_deposits_status_created
    ON deposits (status, created_at DESC);

-- 4. deposits: index for driver deposit history
CREATE INDEX IF NOT EXISTS idx_deposits_user_created
    ON deposits (user_id, created_at DESC);

-- 5. notifications: index for unread notifications per user
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications (user_id, created_at DESC)
    WHERE is_read = FALSE;

-- 6. notifications: index for COD-specific notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_type
    ON notifications (user_id, type)
    WHERE type IN ('cod_fee', 'system');

-- 7. orders: index for COD payment method lookups (used by triggers)
CREATE INDEX IF NOT EXISTS idx_orders_payment_method
    ON orders (payment_method, status)
    WHERE payment_method = 'cod';

-- 8. drivers: index for suspended driver lookups
CREATE INDEX IF NOT EXISTS idx_drivers_status
    ON drivers (status)
    WHERE status = 'suspended';
