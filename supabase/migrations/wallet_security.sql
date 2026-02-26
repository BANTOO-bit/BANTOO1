-- =========================================================
-- Migration: Wallet Security Constraints
-- Author: ANTIGRAVITY
-- Created: 2026-02-25
-- =========================================================
-- Database-level constraints on withdrawals for defense-in-depth.
-- =========================================================

-- 1. Withdrawal amount range (min 10000, max 10000000)
DO $$
BEGIN
    ALTER TABLE withdrawals DROP CONSTRAINT IF EXISTS chk_withdrawal_amount_range;
    ALTER TABLE withdrawals ADD CONSTRAINT chk_withdrawal_amount_range
        CHECK (amount >= 10000 AND amount <= 10000000);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add withdrawal constraint: %', SQLERRM;
END;
$$;

-- 2. Wallet balance must never go negative
DO $$
BEGIN
    ALTER TABLE wallets DROP CONSTRAINT IF EXISTS chk_wallet_balance_non_negative;
    ALTER TABLE wallets ADD CONSTRAINT chk_wallet_balance_non_negative
        CHECK (balance >= 0);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add wallet balance constraint: %', SQLERRM;
END;
$$;
