-- ============================================
-- Driver Location History Table
-- ============================================
-- Stores sampled GPS snapshots (every 60s) for audit/dispute resolution.
-- The live broadcast via Supabase Realtime continues as before (every 5s).

CREATE TABLE IF NOT EXISTS driver_location_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    driver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    speed real DEFAULT 0,
    heading real DEFAULT 0,
    recorded_at timestamptz NOT NULL DEFAULT now()
);

-- Index for querying location history per order (for audit)
CREATE INDEX IF NOT EXISTS idx_dlh_order_time
    ON driver_location_history(order_id, recorded_at);

-- Index for querying by driver
CREATE INDEX IF NOT EXISTS idx_dlh_driver
    ON driver_location_history(driver_id, recorded_at);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE driver_location_history ENABLE ROW LEVEL SECURITY;

-- Driver can only INSERT their own location
CREATE POLICY "driver_insert_own_location"
    ON driver_location_history
    FOR INSERT
    TO authenticated
    WITH CHECK (driver_id = auth.uid());

-- Driver can read their own location history
CREATE POLICY "driver_read_own_location"
    ON driver_location_history
    FOR SELECT
    TO authenticated
    USING (driver_id = auth.uid());

-- Admin can read all location history (for dispute resolution)
CREATE POLICY "admin_read_all_locations"
    ON driver_location_history
    FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- ============================================
-- Optional: Auto-cleanup old records (> 30 days)
-- Run this periodically via Supabase cron or Edge Function
-- ============================================
-- DELETE FROM driver_location_history
-- WHERE recorded_at < now() - interval '30 days';
