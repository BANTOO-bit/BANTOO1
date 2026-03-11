-- ==========================================
-- Migration: Fix Transactions INSERT RLS Policy
-- Created: 2026-03-12
-- ==========================================
-- PROBLEM: transactions INSERT has WITH CHECK (true) — anyone can insert.
-- FIX: Only allow insert if the wallet belongs to the authenticated user,
--       or by an admin. SECURITY DEFINER functions (triggers/RPCs) bypass RLS,
--       so this won't break existing atomic RPC flows.
-- SAFE TO RUN MULTIPLE TIMES (idempotent)
-- ==========================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System insert transactions" ON transactions;
DROP POLICY IF EXISTS "Owner or admin insert transactions" ON transactions;

-- New policy: user can only insert into their own wallet's transactions
CREATE POLICY "Owner or admin insert transactions" ON transactions FOR INSERT
WITH CHECK (
    -- User owns the wallet
    EXISTS (
        SELECT 1 FROM wallets
        WHERE wallets.id = transactions.wallet_id
        AND wallets.user_id = auth.uid()
    )
    -- Or user is admin
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Note: RPC functions like request_withdrawal, process_withdrawal, etc.
-- use SECURITY DEFINER which bypasses RLS entirely.
-- This policy only restricts direct frontend .from('transactions').insert() calls.
