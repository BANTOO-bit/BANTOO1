-- Add operating_hours column to merchants table
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS operating_hours jsonb DEFAULT NULL;

-- Comment on column
COMMENT ON COLUMN merchants.operating_hours IS 'Stores the weekly operating schedule for the merchant';
