-- ============================================================
-- BUG FIX: Premature picked_up_at timestamp
-- 
-- The driver_accept_order and auto_assign_nearest_driver RPCs
-- were prematurely setting picked_up_at = NOW() when the driver
-- just accepted the order (status = 'pickup').
-- This should only be set when status = 'picked_up'.
-- ============================================================

-- 1. Perbaikan fungsi driver_accept_order
CREATE OR REPLACE FUNCTION driver_accept_order(p_order_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_driver_id UUID; v_order RECORD; v_active INT; v_max INT;
BEGIN
    v_driver_id := auth.uid();
    IF v_driver_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    SELECT max_concurrent_orders INTO v_max FROM drivers WHERE user_id = v_driver_id AND is_active = TRUE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Driver tidak aktif'; END IF;
    v_max := COALESCE(v_max, 2);
    SELECT COUNT(*) INTO v_active FROM orders WHERE driver_id = v_driver_id AND status IN ('pickup','picked_up','delivering');
    IF v_active >= v_max THEN RAISE EXCEPTION 'Maks % pesanan aktif', v_max; END IF;
    SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Pesanan tidak ditemukan'; END IF;
    IF v_order.driver_id IS NOT NULL THEN RAISE EXCEPTION 'Sudah diambil driver lain'; END IF;
    IF v_order.status != 'ready' THEN RAISE EXCEPTION 'Pesanan tidak tersedia'; END IF;
    
    -- [PERBAIKAN]: Hilangkan picked_up_at = NOW() dari update ini
    UPDATE orders SET driver_id = v_driver_id, status = 'pickup', updated_at = NOW() WHERE id = p_order_id;
    
    INSERT INTO notifications (user_id, title, message, type) VALUES (v_order.customer_id, 'Driver Ditugaskan', 'Driver menuju warung', 'order');
    RETURN json_build_object('success', true, 'order_id', p_order_id, 'active_orders', v_active + 1, 'max_orders', v_max);
END;
$$;

-- 2. Perbaikan fungsi auto_assign_nearest_driver
CREATE OR REPLACE FUNCTION auto_assign_nearest_driver(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE v_order RECORD; v_merchant RECORD; v_driver RECORD; v_max_radius FLOAT := 10.0;
BEGIN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    IF NOT FOUND THEN RETURN json_build_object('success', false, 'reason', 'Order not found'); END IF;
    IF v_order.status != 'ready' OR v_order.driver_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'reason', 'Order not eligible');
    END IF;
    SELECT * INTO v_merchant FROM merchants WHERE id = v_order.merchant_id;
    IF NOT FOUND OR v_merchant.latitude IS NULL THEN
        RETURN json_build_object('success', false, 'reason', 'Merchant location unavailable');
    END IF;
    SELECT d.* INTO v_driver FROM drivers d
    WHERE d.is_active = TRUE AND d.is_verified = TRUE
      AND (SELECT COUNT(*) FROM orders o WHERE o.driver_id = d.user_id AND o.status IN ('pickup','picked_up','delivering')) < COALESCE(d.max_concurrent_orders, 2)
      AND d.last_location_update > NOW() - INTERVAL '30 minutes' AND d.latitude IS NOT NULL
      AND (6371 * acos(cos(radians(v_merchant.latitude)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(v_merchant.longitude)) + sin(radians(v_merchant.latitude)) * sin(radians(d.latitude)))) <= v_max_radius
    ORDER BY (6371 * acos(cos(radians(v_merchant.latitude)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(v_merchant.longitude)) + sin(radians(v_merchant.latitude)) * sin(radians(d.latitude)))) ASC
    LIMIT 1;
    IF NOT FOUND THEN RETURN json_build_object('success', false, 'reason', 'No available drivers'); END IF;
    
    -- [PERBAIKAN]: Hilangkan picked_up_at = NOW() dari update ini
    UPDATE orders SET driver_id = v_driver.user_id, status = 'pickup', updated_at = NOW() WHERE id = p_order_id AND driver_id IS NULL AND status = 'ready';
    
    IF NOT FOUND THEN RETURN json_build_object('success', false, 'reason', 'Already assigned'); END IF;
    INSERT INTO notifications (user_id, title, message, type) VALUES (v_driver.user_id, 'Pesanan Baru Ditugaskan', 'Pickup di ' || v_merchant.name, 'order');
    RETURN json_build_object('success', true, 'driver_id', v_driver.user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
