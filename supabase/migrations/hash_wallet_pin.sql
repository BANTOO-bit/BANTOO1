-- ==========================================
-- Migration: Hash Wallet PIN with pgcrypto
-- Created: 2026-03-12
-- ==========================================
-- PROBLEM: wallets.pin is stored as PLAIN TEXT.
-- Anyone with DB access (including admin) can read user PINs.
--
-- FIX: Use pgcrypto crypt() + gen_salt() to hash PINs.
-- Create RPC functions so frontend never sees the hash.
-- Migrate existing plain-text PINs to hashed versions.
-- SAFE TO RUN MULTIPLE TIMES (idempotent)
-- ==========================================


-- ==========================================
-- 1. Enable pgcrypto extension
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ==========================================
-- 2. RPC: set_wallet_pin — Hash PIN before storing
-- ==========================================
-- Frontend calls: supabase.rpc('set_wallet_pin', { p_pin: '1234' })
-- Never store raw PIN — always hash.

CREATE OR REPLACE FUNCTION set_wallet_pin(p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validate PIN format: must be 4-6 digits
    IF p_pin IS NULL OR LENGTH(p_pin) < 4 OR LENGTH(p_pin) > 6 THEN
        RAISE EXCEPTION 'PIN harus 4-6 digit';
    END IF;

    IF p_pin !~ '^\d+$' THEN
        RAISE EXCEPTION 'PIN harus berupa angka';
    END IF;

    -- Hash and store
    UPDATE wallets
    SET pin = crypt(p_pin, gen_salt('bf', 8)),
        updated_at = NOW()
    WHERE user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'PIN berhasil diatur');
END;
$$;


-- ==========================================
-- 3. RPC: verify_wallet_pin — Verify PIN without exposing hash
-- ==========================================
-- Frontend calls: supabase.rpc('verify_wallet_pin', { p_pin: '1234' })
-- Returns { valid: true/false }

CREATE OR REPLACE FUNCTION verify_wallet_pin(p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_stored_pin TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get stored hash
    SELECT pin INTO v_stored_pin
    FROM wallets
    WHERE user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    -- No PIN set
    IF v_stored_pin IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'message', 'PIN belum diatur');
    END IF;

    -- Verify: crypt(input, stored_hash) = stored_hash
    IF crypt(p_pin, v_stored_pin) = v_stored_pin THEN
        RETURN jsonb_build_object('valid', true);
    ELSE
        RETURN jsonb_build_object('valid', false, 'message', 'PIN salah');
    END IF;
END;
$$;


-- ==========================================
-- 4. RPC: has_wallet_pin — Check if user has a PIN set
-- ==========================================

CREATE OR REPLACE FUNCTION has_wallet_pin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pin TEXT;
BEGIN
    SELECT pin INTO v_pin
    FROM wallets
    WHERE user_id = auth.uid();

    RETURN v_pin IS NOT NULL;
END;
$$;


-- ==========================================
-- 5. Migrate existing plain-text PINs to hashed
-- ==========================================
-- Plain-text PINs are short numeric strings (4-6 chars).
-- Hashed PINs start with '$2a$' (bcrypt prefix).
-- Only hash pins that are NOT already hashed.

UPDATE wallets
SET pin = crypt(pin, gen_salt('bf', 8))
WHERE pin IS NOT NULL
  AND pin != ''
  AND pin NOT LIKE '$2a$%'  -- Skip already-hashed pins
  AND pin NOT LIKE '$2b$%'; -- Also skip newer bcrypt variants


-- ==========================================
-- 6. Grant execute to authenticated users
-- ==========================================
GRANT EXECUTE ON FUNCTION set_wallet_pin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_wallet_pin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION has_wallet_pin() TO authenticated;
