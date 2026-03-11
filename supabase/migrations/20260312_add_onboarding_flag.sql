-- ==========================================
-- Migration: Add has_completed_onboarding to profiles
-- Created: 2026-03-12
-- ==========================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Update existing profiles that might have already completed it
-- Assuming older active users already completed it
UPDATE profiles 
SET has_completed_onboarding = TRUE 
WHERE created_at < NOW() - INTERVAL '1 day';
