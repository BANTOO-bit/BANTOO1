-- ==========================================
-- Fix Order Counter RLS Violation
-- ==========================================
-- Problem: The 'generate_order_number' function tries to insert into
-- 'order_counters' when calculating the human-readable order number.
-- Because 'order_counters' has Row Level Security (RLS) enabled, normal
-- users get an RLS violation error.
--
-- Solution: Make 'generate_order_number' execute with SECURITY DEFINER
-- context (as the database owner) so it bypasses RLS on 'order_counters'.
-- ==========================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_counter INTEGER;
    v_date_str TEXT;
BEGIN
    -- Atomic increment: INSERT or UPDATE the daily counter
    INSERT INTO public.order_counters (date_key, counter)
    VALUES (v_today, 1)
    ON CONFLICT (date_key) DO UPDATE SET counter = order_counters.counter + 1
    RETURNING counter INTO v_counter;

    -- Format: BTN-YYMMDD-XXXX
    v_date_str := TO_CHAR(v_today, 'YYMMDD');
    RETURN 'BTN-' || v_date_str || '-' || LPAD(v_counter::TEXT, 4, '0');
END;
$$;

-- Grant EXECUTE to authenticated and anon users (in case they don't have it yet)
GRANT EXECUTE ON FUNCTION generate_order_number() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_order_number() TO anon;
