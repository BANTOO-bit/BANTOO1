-- Add prep_time column to orders table for merchant preparation time
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS prep_time INTEGER;

-- Add checking constraint to ensure prep_time is positive
ALTER TABLE public.orders 
ADD CONSTRAINT check_prep_time_positive CHECK (prep_time > 0);

-- Update realtime publication (optional but recommended)
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;

COMMENT ON COLUMN public.orders.prep_time IS 'Preparation time in minutes, set by merchant when accepting order';
