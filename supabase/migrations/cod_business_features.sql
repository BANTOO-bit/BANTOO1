-- =========================================================
-- Migration: Business Features - Summary Stats + COD Order Limit
-- Author: ANTIGRAVITY
-- Created: 2026-02-25
-- =========================================================

-- 1. RPC: Get COD summary stats (daily/weekly/monthly)
CREATE OR REPLACE FUNCTION get_cod_summary()
RETURNS JSONB AS $$
DECLARE
    v_today_start TIMESTAMPTZ;
    v_week_start TIMESTAMPTZ;
    v_month_start TIMESTAMPTZ;
    v_today JSONB;
    v_week JSONB;
    v_month JSONB;
    v_active_drivers INTEGER;
    v_suspended_drivers INTEGER;
BEGIN
    v_today_start := DATE_TRUNC('day', NOW());
    v_week_start := DATE_TRUNC('week', NOW());
    v_month_start := DATE_TRUNC('month', NOW());

    -- Today stats
    SELECT jsonb_build_object(
        'fee_accrued', COALESCE(SUM(CASE WHEN type = 'fee_accrued' THEN amount ELSE 0 END), 0),
        'deposits', COALESCE(SUM(CASE WHEN type = 'deposit_credited' THEN amount ELSE 0 END), 0),
        'entries', COUNT(*)
    ) INTO v_today
    FROM cod_ledger WHERE created_at >= v_today_start;

    -- Week stats
    SELECT jsonb_build_object(
        'fee_accrued', COALESCE(SUM(CASE WHEN type = 'fee_accrued' THEN amount ELSE 0 END), 0),
        'deposits', COALESCE(SUM(CASE WHEN type = 'deposit_credited' THEN amount ELSE 0 END), 0),
        'entries', COUNT(*)
    ) INTO v_week
    FROM cod_ledger WHERE created_at >= v_week_start;

    -- Month stats
    SELECT jsonb_build_object(
        'fee_accrued', COALESCE(SUM(CASE WHEN type = 'fee_accrued' THEN amount ELSE 0 END), 0),
        'deposits', COALESCE(SUM(CASE WHEN type = 'deposit_credited' THEN amount ELSE 0 END), 0),
        'entries', COUNT(*)
    ) INTO v_month
    FROM cod_ledger WHERE created_at >= v_month_start;

    -- Driver counts
    SELECT COUNT(*) INTO v_active_drivers
    FROM drivers WHERE status IN ('approved', 'active');

    SELECT COUNT(*) INTO v_suspended_drivers
    FROM drivers WHERE status = 'suspended';

    RETURN jsonb_build_object(
        'today', v_today,
        'week', v_week,
        'month', v_month,
        'active_drivers', v_active_drivers,
        'suspended_drivers', v_suspended_drivers
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_cod_summary() TO authenticated;


-- 2. Add cod_max_order_amount to operational settings
-- Orders above this amount cannot use COD payment
DO $$
BEGIN
    UPDATE app_settings
    SET value = value || '{"cod_max_order_amount": 500000}'::JSONB
    WHERE key = 'operational'
      AND NOT (value ? 'cod_max_order_amount');
EXCEPTION WHEN OTHERS THEN
    NULL;
END;
$$;
