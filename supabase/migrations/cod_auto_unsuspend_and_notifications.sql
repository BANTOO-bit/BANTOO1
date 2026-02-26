-- =========================================================
-- Migration: Auto-Unsuspend + COD Notifications
-- Author: ANTIGRAVITY
-- Created: 2026-02-25
-- =========================================================
-- 1. Auto-unsuspend when deposit credited brings balance below limit
-- 2. Auto-notification when COD fee reaches warning/critical levels
-- =========================================================


-- =====================
-- 1. TRIGGER: Auto-Unsuspend on deposit_credited
-- When a deposit is credited and balance drops below limit,
-- automatically reactivate the driver.
-- =====================
CREATE OR REPLACE FUNCTION trg_cod_auto_unsuspend()
RETURNS TRIGGER AS $$
DECLARE
    v_limit INTEGER := 10000;
    v_time_limit_hours INTEGER := 48;
    v_oldest_unpaid TIMESTAMPTZ;
    v_hours_elapsed FLOAT;
    v_should_unsuspend BOOLEAN := FALSE;
    v_operational JSONB;
BEGIN
    -- Only run on deposit_credited entries
    IF NEW.type != 'deposit_credited' THEN
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
        NULL;
    END;

    -- Check if balance is now below limit
    IF NEW.balance_after < v_limit THEN
        -- Also check time limit
        SELECT MIN(created_at) INTO v_oldest_unpaid
        FROM cod_ledger
        WHERE driver_id = NEW.driver_id
          AND type = 'fee_accrued'
          AND created_at > NEW.created_at;

        IF v_oldest_unpaid IS NOT NULL THEN
            v_hours_elapsed := EXTRACT(EPOCH FROM (NOW() - v_oldest_unpaid)) / 3600.0;
        ELSE
            v_hours_elapsed := 0;
        END IF;

        -- Only unsuspend if both limits are satisfied
        IF NEW.balance_after < v_limit AND v_hours_elapsed < v_time_limit_hours THEN
            v_should_unsuspend := TRUE;
        END IF;
    END IF;

    -- Execute unsuspend
    IF v_should_unsuspend THEN
        UPDATE drivers
        SET status = 'approved', updated_at = NOW()
        WHERE user_id = NEW.driver_id
          AND status = 'suspended';

        -- Notify driver about reactivation
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
            NEW.driver_id,
            'Akun Diaktifkan Kembali',
            'Setoran fee COD Anda telah diterima. Saldo: Rp ' || NEW.balance_after || '. Akun Anda kembali aktif!',
            'system'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cod_auto_unsuspend ON cod_ledger;
CREATE TRIGGER trg_cod_auto_unsuspend
    AFTER INSERT ON cod_ledger
    FOR EACH ROW
    EXECUTE FUNCTION trg_cod_auto_unsuspend();


-- =====================
-- 2. TRIGGER: Notify driver on COD fee milestones
-- Sends in-app notification when:
-- - Balance reaches 70% of limit (warning)
-- - Balance reaches 100% of limit (critical, suspended)
-- - Time limit exceeded
-- =====================
CREATE OR REPLACE FUNCTION trg_cod_notify_driver()
RETURNS TRIGGER AS $$
DECLARE
    v_limit INTEGER := 10000;
    v_time_limit_hours INTEGER := 48;
    v_percentage FLOAT;
    v_oldest_unpaid TIMESTAMPTZ;
    v_hours_elapsed FLOAT;
    v_operational JSONB;
    v_title TEXT;
    v_message TEXT;
BEGIN
    -- Only notify on fee_accrued entries
    IF NEW.type != 'fee_accrued' THEN
        RETURN NEW;
    END IF;

    -- Get limits
    BEGIN
        SELECT value INTO v_operational FROM app_settings WHERE key = 'operational';
        IF v_operational IS NOT NULL THEN
            v_limit := COALESCE((v_operational->>'cod_balance_limit')::INTEGER, 10000);
            v_time_limit_hours := COALESCE((v_operational->>'cod_time_limit_hours')::INTEGER, 48);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    v_percentage := CASE WHEN v_limit > 0 THEN (NEW.balance_after::FLOAT / v_limit) * 100 ELSE 0 END;

    -- Check time
    SELECT MIN(created_at) INTO v_oldest_unpaid
    FROM cod_ledger
    WHERE driver_id = NEW.driver_id
      AND type = 'fee_accrued'
      AND created_at > COALESCE(
          (SELECT MAX(created_at) FROM cod_ledger WHERE driver_id = NEW.driver_id AND type = 'deposit_credited'),
          '1970-01-01'::TIMESTAMPTZ
      );

    v_hours_elapsed := CASE
        WHEN v_oldest_unpaid IS NOT NULL THEN EXTRACT(EPOCH FROM (NOW() - v_oldest_unpaid)) / 3600.0
        ELSE 0
    END;

    -- Determine notification type
    IF NEW.balance_after >= v_limit THEN
        -- CRITICAL: over limit → suspended
        v_title := '⚠️ Akun Di-suspend — Fee COD Melebihi Batas';
        v_message := 'Saldo fee COD Anda Rp ' || NEW.balance_after || ' melebihi batas Rp ' || v_limit || '. '
            || 'Akun di-suspend otomatis. Segera lakukan setoran untuk mengaktifkan kembali.';
    ELSIF v_hours_elapsed >= v_time_limit_hours THEN
        -- CRITICAL: over time → suspended
        v_title := '⚠️ Akun Di-suspend — Batas Waktu Setoran Terlampaui';
        v_message := 'Anda belum menyetor fee COD selama ' || ROUND(v_hours_elapsed::NUMERIC) || ' jam (batas: ' || v_time_limit_hours || ' jam). '
            || 'Segera lakukan setoran.';
    ELSIF v_percentage >= 70 THEN
        -- WARNING: approaching limit
        v_title := '⏰ Fee COD Mendekati Batas';
        v_message := 'Saldo fee COD: Rp ' || NEW.balance_after || ' (' || ROUND(v_percentage::NUMERIC) || '% dari batas Rp ' || v_limit || '). '
            || 'Segera setor sebelum akun di-suspend.';
    ELSE
        -- No notification needed
        RETURN NEW;
    END IF;

    -- Insert notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (NEW.driver_id, v_title, v_message, 'cod_fee');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cod_notify_driver ON cod_ledger;
CREATE TRIGGER trg_cod_notify_driver
    AFTER INSERT ON cod_ledger
    FOR EACH ROW
    EXECUTE FUNCTION trg_cod_notify_driver();
