-- ============================================================
-- FIX: DELIVERY FEE NULL CONSTRAINT IN RPC
-- The orders table strictly requires delivery_fee to be NOT NULL.
-- But calculate_delivery_fee returns NULL if user_lat or user_lng is missing.
-- This script ensures calculate_delivery_fee always returns a valid integer.
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_delivery_fee(
    p_merchant_id UUID,
    p_user_lat FLOAT,
    p_user_lng FLOAT
) RETURNS INTEGER AS $$
DECLARE
    v_merchant_lat FLOAT;
    v_merchant_lng FLOAT;
    v_distance FLOAT;
    v_base_fee INTEGER := 5000;
    v_price_per_km INTEGER := 2500;
    v_fee INTEGER;
BEGIN
    -- If user coordinates are completely missing, return a default flat fee
    -- This prevents NULL calculation and database crashing
    IF p_user_lat IS NULL OR p_user_lng IS NULL THEN
        RETURN 8000; 
    END IF;

    -- Get merchant location
    SELECT latitude, longitude INTO v_merchant_lat, v_merchant_lng
    FROM merchants WHERE id = p_merchant_id;
    
    -- If merchant coordinates are completely missing, return default flat fee
    IF v_merchant_lat IS NULL OR v_merchant_lng IS NULL THEN
        RETURN 8000; 
    END IF;
    
    -- Calculate distance using Haversine
    v_distance := calculate_distance(v_merchant_lat, v_merchant_lng, p_user_lat, p_user_lng);
    
    -- Safety check: if distance calculation failed, return default
    IF v_distance IS NULL THEN
        RETURN 8000;
    END IF;
    
    -- Calculate fee: Base + (Dist * Price)
    v_fee := v_base_fee + (v_distance * v_price_per_km);
    
    -- Round up to nearest 500 (e.g. 5200 -> 5500, 6800 -> 7000)
    v_fee := CEIL(CAST(v_fee AS NUMERIC) / 500.0) * 500;
    
    -- Minimum fee 5000
    IF v_fee < 5000 THEN 
        v_fee := 5000; 
    END IF;
    
    RETURN v_fee;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
