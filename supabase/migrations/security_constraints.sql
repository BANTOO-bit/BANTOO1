-- =========================================================
-- Migration: Security Constraints
-- Author: ANTIGRAVITY
-- Created: 2026-02-25
-- =========================================================
-- Adds amount constraints to deposits table for security.
-- =========================================================

-- 1. Add CHECK constraint on deposits.amount (min 1000, max 10000000)
-- Drop if exists first (idempotent)
DO $$
BEGIN
    ALTER TABLE deposits DROP CONSTRAINT IF EXISTS chk_deposit_amount_range;
    ALTER TABLE deposits ADD CONSTRAINT chk_deposit_amount_range
        CHECK (amount >= 1000 AND amount <= 10000000);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add deposit amount constraint: %', SQLERRM;
END;
$$;

-- 2. Add CHECK constraint on cod_ledger.amount (must be positive, max 10000000)
DO $$
BEGIN
    ALTER TABLE cod_ledger DROP CONSTRAINT IF EXISTS chk_cod_ledger_amount_range;
    ALTER TABLE cod_ledger ADD CONSTRAINT chk_cod_ledger_amount_range
        CHECK (amount > 0 AND amount <= 10000000);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add cod_ledger amount constraint: %', SQLERRM;
END;
$$;
