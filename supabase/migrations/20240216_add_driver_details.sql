-- Add missing columns to drivers table for profile completion
ALTER TABLE public.drivers
ADD COLUMN IF NOT EXISTS vehicle_photo_url TEXT,
ADD COLUMN IF NOT EXISTS stnk_photo_url TEXT,
ADD COLUMN IF NOT EXISTS id_card_photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_with_vehicle_url TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT; -- Adding address to drivers table since profiles table might be shared

-- Comment on columns
COMMENT ON COLUMN public.drivers.vehicle_photo_url IS 'URL to vehicle photo';
COMMENT ON COLUMN public.drivers.stnk_photo_url IS 'URL to STNK document photo';
COMMENT ON COLUMN public.drivers.bank_name IS 'Name of the bank (e.g., BCA, BRI)';
COMMENT ON COLUMN public.drivers.address IS 'Driver domicile address (specific to driver context)';
