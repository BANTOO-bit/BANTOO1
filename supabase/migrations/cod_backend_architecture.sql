-- =========================================================
-- Migration: Backend-First COD Settlement Architecture
-- Author: ANTIGRAVITY
-- Created: 2026-02-25
-- =========================================================
-- WHAT THIS DOES:
-- 1. Creates cod_ledger table (debit/credit audit trail)
-- 2. Trigger on order completion → auto-record fee_accrued
-- 3. Trigger on deposit approval → auto-record deposit_credited
-- 4. Trigger on ledger insert → auto-suspend if over limit
-- 5. RPC get_cod_balance() → all calculations server-side
-- 6. Hourly cron safety net
-- =========================================================


-- =====================
-- 1. COD LEDGER TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.cod_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('fee_accrued', 'deposit_credited')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    balance_after INTEGER NOT NULL DEFAULT 0,
    reference_id UUID,             -- order_id or deposit_id
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_cod_ledger_driver ON cod_ledger(driver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cod_ledger_type ON cod_ledger(driver_id, type);
CREATE INDEX IF NOT EXISTS idx_cod_ledger_ref ON cod_ledger(reference_id);

-- RLS
ALTER TABLE cod_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers can view own ledger" ON cod_ledger;
CREATE POLICY "Drivers can view own ledger"
ON cod_ledger FOR SELECT USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Admins can view all ledger" ON cod_ledger;
CREATE POLICY "Admins can view all ledger"
ON cod_ledger FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- System-only insert (via triggers, not direct user insert)
DROP POLICY IF EXISTS "System insert only" ON cod_ledger;
CREATE POLICY "System insert only"
ON cod_ledger FOR INSERT WITH CHECK (false);  -- blocked for clients, triggers use SECURITY DEFINER


-- =====================
-- 2. HELPER: Calculate current COD balance for a driver
-- =====================
CREATE OR REPLACE FUNCTION _get_cod_driver_balance(p_driver_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    SELECT COALESCE(balance_after, 0) INTO v_balance
    FROM cod_ledger
    WHERE driver_id = p_driver_id
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================
-- 3. TRIGGER: On Order Completed (COD) → Record fee_accrued
-- =====================
CREATE OR REPLACE FUNCTION trg_cod_order_completed()
RETURNS TRIGGER AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Only fire when status changes TO 'completed' AND payment is COD AND has service_fee
    IF NEW.status = 'completed'
       AND OLD.status IS DISTINCT FROM 'completed'
       AND NEW.payment_method = 'cod'
       AND NEW.driver_id IS NOT NULL
       AND COALESCE(NEW.service_fee, 0) > 0
    THEN
        -- Get current balance from last ledger entry
        v_current_balance := _get_cod_driver_balance(NEW.driver_id);
        v_new_balance := v_current_balance + NEW.service_fee;

        -- Insert ledger entry
        INSERT INTO cod_ledger (driver_id, type, amount, balance_after, reference_id, description)
        VALUES (
            NEW.driver_id,
            'fee_accrued',
            NEW.service_fee,
            v_new_balance,
            NEW.id,
            'Fee admin COD order #' || LEFT(NEW.id::TEXT, 8)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trg_cod_order_completed ON orders;
CREATE TRIGGER trg_cod_order_completed
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trg_cod_order_completed();


-- =====================
-- 4. TRIGGER: On Deposit Approved → Record deposit_credited
-- =====================
CREATE OR REPLACE FUNCTION trg_cod_deposit_approved()
RETURNS TRIGGER AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Only fire when status changes TO 'approved'
    IF NEW.status = 'approved'
       AND OLD.status IS DISTINCT FROM 'approved'
       AND COALESCE(NEW.amount, 0) > 0
    THEN
        -- Get current balance
        v_current_balance := _get_cod_driver_balance(NEW.user_id);
        v_new_balance := GREATEST(0, v_current_balance - NEW.amount::INTEGER);

        -- Insert ledger entry
        INSERT INTO cod_ledger (driver_id, type, amount, balance_after, reference_id, description)
        VALUES (
            NEW.user_id,
            'deposit_credited',
            NEW.amount::INTEGER,
            v_new_balance,
            NEW.id,
            'Setoran fee COD - ' || COALESCE(NEW.payment_method, 'transfer')
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trg_cod_deposit_approved ON deposits;
CREATE TRIGGER trg_cod_deposit_approved
    AFTER UPDATE ON deposits
    FOR EACH ROW
    EXECUTE FUNCTION trg_cod_deposit_approved();


-- =====================
-- 5. TRIGGER: Auto-Suspend on Ledger Insert (fee_accrued only)
-- =====================
CREATE OR REPLACE FUNCTION trg_cod_auto_suspend()
RETURNS TRIGGER AS $$
DECLARE
    v_limit INTEGER := 10000;
    v_time_limit_hours INTEGER := 48;
    v_oldest_unpaid TIMESTAMPTZ;
    v_hours_elapsed FLOAT;
    v_should_suspend BOOLEAN := FALSE;
    v_operational JSONB;
BEGIN
    -- Only check on fee_accrued entries
    IF NEW.type != 'fee_accrued' THEN
        RETURN NEW;
    END IF;

    -- Get limits from settings
    BEGIN
        SELECT value INTO v_operational FROM app_settings WHERE key = 'operational';
        IF v_operational IS NOT NULL THEN
            v_limit := COALESCE((v_operational->>'cod_balance_limit')::INTEGER, 10000);
            v_time_limit_hours := COALESCE((v_operational->>'cod_time_limit_hours')::INTEGER, 48);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Use defaults
    END;

    -- Check 1: Nominal limit
    IF NEW.balance_after >= v_limit THEN
        v_should_suspend := TRUE;
    END IF;

    -- Check 2: Time limit (oldest fee_accrued entry without a subsequent deposit)
    IF NOT v_should_suspend THEN
        SELECT MIN(created_at) INTO v_oldest_unpaid
        FROM cod_ledger
        WHERE driver_id = NEW.driver_id
          AND type = 'fee_accrued'
          AND created_at > COALESCE(
              (SELECT MAX(created_at) FROM cod_ledger WHERE driver_id = NEW.driver_id AND type = 'deposit_credited'),
              '1970-01-01'::TIMESTAMPTZ
          );

        IF v_oldest_unpaid IS NOT NULL THEN
            v_hours_elapsed := EXTRACT(EPOCH FROM (NOW() - v_oldest_unpaid)) / 3600.0;
            IF v_hours_elapsed >= v_time_limit_hours THEN
                v_should_suspend := TRUE;
            END IF;
        END IF;
    END IF;

    -- Execute suspend
    IF v_should_suspend THEN
        UPDATE drivers
        SET status = 'suspended', updated_at = NOW()
        WHERE user_id = NEW.driver_id
          AND status IN ('approved', 'active');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trg_cod_auto_suspend ON cod_ledger;
CREATE TRIGGER trg_cod_auto_suspend
    AFTER INSERT ON cod_ledger
    FOR EACH ROW
    EXECUTE FUNCTION trg_cod_auto_suspend();


-- =====================
-- 6. RPC: get_cod_balance (all calculation server-side)
-- =====================
CREATE OR REPLACE FUNCTION get_cod_balance(p_driver_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_owed INTEGER := 0;
    v_deposits_made INTEGER := 0;
    v_balance INTEGER := 0;
    v_limit INTEGER := 10000;
    v_time_limit_hours INTEGER := 48;
    v_oldest_unpaid TIMESTAMPTZ;
    v_hours_elapsed FLOAT := 0;
    v_operational JSONB;
    v_ledger JSONB;
BEGIN
    -- Get limits from settings
    BEGIN
        SELECT value INTO v_operational FROM app_settings WHERE key = 'operational';
        IF v_operational IS NOT NULL THEN
            v_limit := COALESCE((v_operational->>'cod_balance_limit')::INTEGER, 10000);
            v_time_limit_hours := COALESCE((v_operational->>'cod_time_limit_hours')::INTEGER, 48);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    -- Get totals from ledger
    SELECT
        COALESCE(SUM(CASE WHEN type = 'fee_accrued' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'deposit_credited' THEN amount ELSE 0 END), 0)
    INTO v_total_owed, v_deposits_made
    FROM cod_ledger
    WHERE driver_id = p_driver_id;

    -- Current balance (from last ledger entry, or calculated)
    v_balance := _get_cod_driver_balance(p_driver_id);

    -- Fallback: if ledger is empty but has old orders, calculate from orders+deposits
    IF v_total_owed = 0 THEN
        SELECT COALESCE(SUM(service_fee), 0) INTO v_total_owed
        FROM orders
        WHERE driver_id = p_driver_id AND status = 'completed' AND payment_method = 'cod';

        SELECT COALESCE(SUM(amount::INTEGER), 0) INTO v_deposits_made
        FROM deposits
        WHERE user_id = p_driver_id AND status = 'approved';

        v_balance := GREATEST(0, v_total_owed - v_deposits_made);
    END IF;

    -- Find oldest unpaid entry
    SELECT MIN(created_at) INTO v_oldest_unpaid
    FROM cod_ledger
    WHERE driver_id = p_driver_id
      AND type = 'fee_accrued'
      AND created_at > COALESCE(
          (SELECT MAX(created_at) FROM cod_ledger WHERE driver_id = p_driver_id AND type = 'deposit_credited'),
          '1970-01-01'::TIMESTAMPTZ
      );

    IF v_oldest_unpaid IS NOT NULL THEN
        v_hours_elapsed := EXTRACT(EPOCH FROM (NOW() - v_oldest_unpaid)) / 3600.0;
    END IF;

    -- Get recent ledger entries (last 20)
    SELECT COALESCE(jsonb_agg(entry ORDER BY entry.created_at DESC), '[]'::JSONB) INTO v_ledger
    FROM (
        SELECT id, type, amount, balance_after, description, created_at
        FROM cod_ledger
        WHERE driver_id = p_driver_id
        ORDER BY created_at DESC
        LIMIT 20
    ) entry;

    RETURN jsonb_build_object(
        'total_owed', v_total_owed,
        'deposits_made', v_deposits_made,
        'balance', v_balance,
        'limit', v_limit,
        'time_limit_hours', v_time_limit_hours,
        'hours_elapsed', ROUND(v_hours_elapsed::NUMERIC, 1),
        'oldest_unpaid_at', v_oldest_unpaid,
        'is_over_limit', (v_balance >= v_limit) OR (v_hours_elapsed >= v_time_limit_hours),
        'is_over_nominal', v_balance >= v_limit,
        'is_over_time_limit', v_hours_elapsed >= v_time_limit_hours,
        'percentage', CASE WHEN v_limit > 0 THEN ROUND((v_balance::NUMERIC / v_limit::NUMERIC) * 100) ELSE 0 END,
        'ledger', v_ledger
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================
-- 7. UPDATED: Hourly cron safety net (uses ledger data)
-- =====================
CREATE OR REPLACE FUNCTION check_and_suspend_cod_drivers()
RETURNS JSONB AS $$
DECLARE
    v_driver RECORD;
    v_balance_data JSONB;
    v_suspended_count INTEGER := 0;
BEGIN
    FOR v_driver IN
        SELECT DISTINCT d.user_id
        FROM drivers d
        WHERE d.status IN ('approved', 'active')
    LOOP
        v_balance_data := get_cod_balance(v_driver.user_id);

        IF (v_balance_data->>'is_over_limit')::BOOLEAN THEN
            UPDATE drivers
            SET status = 'suspended', updated_at = NOW()
            WHERE user_id = v_driver.user_id AND status IN ('approved', 'active');

            IF FOUND THEN
                v_suspended_count := v_suspended_count + 1;
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'suspended_count', v_suspended_count,
        'checked_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant RPC access
GRANT EXECUTE ON FUNCTION get_cod_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_suspend_cod_drivers() TO service_role;

-- Schedule cron (uncomment after enabling pg_cron extension):
-- SELECT cron.schedule('auto-suspend-cod-drivers', '0 * * * *', 'SELECT check_and_suspend_cod_drivers()');


-- =====================
-- 8. Backfill existing COD orders into ledger
-- =====================
-- This inserts historical data into cod_ledger for drivers who already have completed COD orders.
-- Running balance is calculated cumulatively per driver.
DO $$
DECLARE
    v_order RECORD;
    v_deposit RECORD;
    v_running_balance INTEGER;
    v_drivers UUID[];
    v_driver_id UUID;
BEGIN
    -- Get unique drivers with COD orders
    SELECT ARRAY_AGG(DISTINCT driver_id) INTO v_drivers
    FROM orders
    WHERE status = 'completed' AND payment_method = 'cod' AND driver_id IS NOT NULL AND service_fee > 0;

    IF v_drivers IS NULL THEN RETURN; END IF;

    FOREACH v_driver_id IN ARRAY v_drivers
    LOOP
        -- Skip if already has ledger entries
        IF EXISTS (SELECT 1 FROM cod_ledger WHERE driver_id = v_driver_id LIMIT 1) THEN
            CONTINUE;
        END IF;

        v_running_balance := 0;

        -- Insert fee_accrued for each completed COD order
        FOR v_order IN
            SELECT id, service_fee, created_at
            FROM orders
            WHERE driver_id = v_driver_id AND status = 'completed' AND payment_method = 'cod' AND service_fee > 0
            ORDER BY created_at ASC
        LOOP
            v_running_balance := v_running_balance + v_order.service_fee;
            INSERT INTO cod_ledger (driver_id, type, amount, balance_after, reference_id, description, created_at)
            VALUES (v_driver_id, 'fee_accrued', v_order.service_fee, v_running_balance, v_order.id,
                    'Fee admin COD order #' || LEFT(v_order.id::TEXT, 8), v_order.created_at);
        END LOOP;

        -- Insert deposit_credited for each approved deposit
        FOR v_deposit IN
            SELECT id, amount, created_at, payment_method
            FROM deposits
            WHERE user_id = v_driver_id AND status = 'approved'
            ORDER BY created_at ASC
        LOOP
            v_running_balance := GREATEST(0, v_running_balance - v_deposit.amount::INTEGER);
            INSERT INTO cod_ledger (driver_id, type, amount, balance_after, reference_id, description, created_at)
            VALUES (v_driver_id, 'deposit_credited', v_deposit.amount::INTEGER, v_running_balance, v_deposit.id,
                    'Setoran fee COD - ' || COALESCE(v_deposit.payment_method, 'transfer'), v_deposit.created_at);
        END LOOP;
    END LOOP;
END;
$$;
