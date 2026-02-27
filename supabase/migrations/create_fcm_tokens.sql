-- =============================================
-- FCM Tokens Table for Push Notifications
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Create fcm_tokens table
CREATE TABLE IF NOT EXISTS fcm_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'driver', 'merchant', 'admin')),
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- 2. Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_role ON fcm_tokens(role);

-- 3. Enable Row Level Security
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can manage their own tokens
CREATE POLICY "Users can insert own tokens"
    ON fcm_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tokens"
    ON fcm_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
    ON fcm_tokens FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens"
    ON fcm_tokens FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Service role can read all tokens (for sending notifications)
-- This is handled by Supabase Edge Functions using service_role key

SELECT 'FCM Tokens table created successfully!' AS result;
