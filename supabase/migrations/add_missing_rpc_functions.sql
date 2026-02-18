-- ==========================================
-- MISSING RPC FUNCTIONS
-- ==========================================
-- These two functions are called by the frontend but were not yet deployed.
-- 1. request_withdrawal  — User-facing atomic withdrawal (uses auth.uid())
-- 2. wallet_balance_plus — Admin-facing balance refund (SECURITY DEFINER)
-- ==========================================


-- 1. REQUEST WITHDRAWAL (User-facing, uses auth.uid())
-- Called by: walletService.js → supabase.rpc('request_withdrawal', { p_amount, p_bank_name, p_account_name, p_account_number })
-- Atomic operation: validates balance → deducts → creates withdrawal + transaction record
CREATE OR REPLACE FUNCTION request_withdrawal(
    p_amount INTEGER,
    p_bank_name TEXT,
    p_bank_account_name TEXT DEFAULT NULL,
    p_account_name TEXT DEFAULT NULL,
    p_bank_account_number TEXT DEFAULT NULL,
    p_account_number TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_wallet RECORD;
    v_withdrawal_id UUID;
    v_final_bank_account_name TEXT;
    v_final_bank_account_number TEXT;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Resolve parameter aliases (frontend may send either name)
    v_final_bank_account_name := COALESCE(p_bank_account_name, p_account_name);
    v_final_bank_account_number := COALESCE(p_bank_account_number, p_account_number);

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Jumlah penarikan tidak valid';
    END IF;

    -- Lock wallet row to prevent race conditions
    SELECT * INTO v_wallet FROM wallets
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet tidak ditemukan';
    END IF;

    IF v_wallet.balance < p_amount THEN
        RAISE EXCEPTION 'Saldo tidak mencukupi. Saldo: %, Diminta: %', v_wallet.balance, p_amount;
    END IF;

    -- 1. Deduct balance
    UPDATE wallets
    SET balance = balance - p_amount, updated_at = NOW()
    WHERE user_id = v_user_id;

    -- 2. Create withdrawal record
    INSERT INTO withdrawals (user_id, amount, bank_name, bank_account_name, bank_account_number, status)
    VALUES (v_user_id, p_amount, p_bank_name, v_final_bank_account_name, v_final_bank_account_number, 'pending')
    RETURNING id INTO v_withdrawal_id;

    -- 3. Create transaction record
    INSERT INTO transactions (wallet_id, type, amount, description, reference_id, status)
    VALUES (v_wallet.id, 'withdrawal', p_amount, 'Penarikan ke ' || p_bank_name, v_withdrawal_id, 'completed');

    -- 4. Create notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (v_user_id, 'Penarikan Diproses', 'Permintaan penarikan Rp ' || p_amount || ' sedang diproses.', 'system');

    RETURN json_build_object(
        'success', true,
        'withdrawal_id', v_withdrawal_id,
        'new_balance', v_wallet.balance - p_amount
    );
EXCEPTION WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. WALLET BALANCE PLUS (Admin-facing, refund on rejection)
-- Called by: financeService.js → supabase.rpc('wallet_balance_plus', { p_user_id, p_amount })
-- Adds balance back to a user's wallet (used when admin rejects a withdrawal)
CREATE OR REPLACE FUNCTION wallet_balance_plus(
    p_user_id UUID,
    p_amount INTEGER
) RETURNS VOID AS $$
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid amount';
    END IF;

    UPDATE wallets
    SET balance = balance + p_amount, updated_at = NOW()
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
    END IF;

    -- Create refund transaction record
    INSERT INTO transactions (wallet_id, type, amount, description, status)
    SELECT w.id, 'refund', p_amount, 'Refund penarikan yang ditolak', 'completed'
    FROM wallets w WHERE w.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
