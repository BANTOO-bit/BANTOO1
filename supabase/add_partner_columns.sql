-- ============================================================
-- Migration: Add missing columns for partner registration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. MERCHANTS: Add KTP URL and bank info columns
ALTER TABLE public.merchants 
    ADD COLUMN IF NOT EXISTS ktp_url TEXT,
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_number TEXT;

-- 2. DRIVERS: Add photo URLs, address, phone, and bank info columns
ALTER TABLE public.drivers
    ADD COLUMN IF NOT EXISTS selfie_url TEXT,
    ADD COLUMN IF NOT EXISTS vehicle_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS stnk_url TEXT,
    ADD COLUMN IF NOT EXISTS ktp_url TEXT,
    ADD COLUMN IF NOT EXISTS photo_with_vehicle_url TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_number TEXT;

-- 3. Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'merchants' 
  AND column_name IN ('ktp_url', 'bank_name', 'bank_account_name', 'bank_account_number');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'drivers' 
  AND column_name IN ('selfie_url', 'vehicle_photo_url', 'stnk_url', 'ktp_url', 'photo_with_vehicle_url', 'address', 'phone', 'bank_name', 'bank_account_name', 'bank_account_number');
