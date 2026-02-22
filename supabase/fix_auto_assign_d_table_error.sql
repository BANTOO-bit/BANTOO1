-- ==========================================
-- FIX FOR "missing FROM-clause entry for table 'd'"
-- ==========================================
-- This script fixes a bug in auto_assign_nearest_driver where it failed
-- to calculate distance because the alias "d" was out of scope.

CREATE OR REPLACE FUNCTION auto_assign_nearest_driver(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_merchant RECORD;
    v_driver RECORD;
    v_max_radius FLOAT := 10.0; -- 10km max search radius
BEGIN
    -- Get order details
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'reason', 'Order not found');
    END IF;

    -- Only auto-assign if order is ready and has no driver yet
    IF v_order.status != 'ready' OR v_order.driver_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'reason', 'Order not eligible for auto-assignment');
    END IF;

    -- Get merchant location
    SELECT * INTO v_merchant FROM merchants WHERE id = v_order.merchant_id;
    IF NOT FOUND OR v_merchant.latitude IS NULL THEN
        RETURN json_build_object('success', false, 'reason', 'Merchant location not available');
    END IF;

    -- Find nearest online driver who has capacity
    -- Uses Haversine formula to calculate distance
    SELECT d.* INTO v_driver
    FROM drivers d
    WHERE d.is_active = TRUE
      AND d.is_verified = TRUE
      -- Check driver has capacity (active orders < max)
      AND (
          SELECT COUNT(*) FROM orders o
          WHERE o.driver_id = d.user_id
          AND o.status IN ('pickup', 'picked_up', 'delivering')
      ) < COALESCE(d.max_concurrent_orders, 2)
      -- Must have a recent location (within last 30 minutes)
      AND d.last_location_update > NOW() - INTERVAL '30 minutes'
      AND d.latitude IS NOT NULL
      AND d.longitude IS NOT NULL
      -- Calculate distance and filter by radius
      AND (
          6371 * acos(
              cos(radians(v_merchant.latitude)) * cos(radians(d.latitude)) *
              cos(radians(d.longitude) - radians(v_merchant.longitude)) +
              sin(radians(v_merchant.latitude)) * sin(radians(d.latitude))
          )
      ) <= v_max_radius
    ORDER BY (
        6371 * acos(
            cos(radians(v_merchant.latitude)) * cos(radians(d.latitude)) *
            cos(radians(d.longitude) - radians(v_merchant.longitude)) +
            sin(radians(v_merchant.latitude)) * sin(radians(d.latitude))
        )
    ) ASC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'reason', 'No available drivers nearby');
    END IF;

    -- Assign driver to order
    UPDATE orders
    SET driver_id = v_driver.user_id,
        status = 'pickup',
        picked_up_at = NOW()
    WHERE id = p_order_id
      AND driver_id IS NULL -- Prevent race condition
      AND status = 'ready';

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'reason', 'Order was already assigned');
    END IF;

    -- Notify the driver
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        v_driver.user_id,
        'Pesanan Baru Ditugaskan',
        'Anda mendapat pesanan baru. Segera pickup di ' || v_merchant.name,
        'order'
    );

    RETURN json_build_object(
        'success', true,
        'driver_id', v_driver.user_id,
        'distance_km', ROUND((
            6371 * acos(
                cos(radians(v_merchant.latitude)) * cos(radians(v_driver.latitude)) *
                cos(radians(v_driver.longitude) - radians(v_merchant.longitude)) +
                sin(radians(v_merchant.latitude)) * sin(radians(v_driver.latitude))
            )
        )::numeric, 2)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
