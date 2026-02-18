-- ==========================================
-- MULTI-ORDER SUPPORT FOR DRIVERS
-- ==========================================
-- Allows drivers to handle up to N concurrent orders (default 2).
-- Modifies driver_accept_order to check against max_concurrent_orders.
-- Adds get_driver_active_orders (returns array instead of single order).

-- Column already added in auto_assign_driver.sql:
-- ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS max_concurrent_orders INT DEFAULT 2;
-- But repeat with IF NOT EXISTS for safety:
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS max_concurrent_orders INT DEFAULT 2;


-- Override driver_accept_order to support multi-order
CREATE OR REPLACE FUNCTION driver_accept_order(p_order_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
    v_order RECORD;
    v_active_count INT;
    v_max_orders INT;
BEGIN
    v_driver_id := auth.uid();

    IF v_driver_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Check driver exists and is active
    SELECT max_concurrent_orders INTO v_max_orders
    FROM drivers WHERE user_id = v_driver_id AND is_active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Driver tidak aktif atau belum terdaftar';
    END IF;

    v_max_orders := COALESCE(v_max_orders, 2);

    -- Count current active orders for this driver
    SELECT COUNT(*) INTO v_active_count
    FROM orders
    WHERE driver_id = v_driver_id
    AND status IN ('pickup', 'picked_up', 'delivering');

    IF v_active_count >= v_max_orders THEN
        RAISE EXCEPTION 'Anda sudah memiliki % pesanan aktif (maks %)', v_active_count, v_max_orders;
    END IF;

    -- Lock the order row for atomic update
    SELECT * INTO v_order FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pesanan tidak ditemukan';
    END IF;

    IF v_order.driver_id IS NOT NULL THEN
        RAISE EXCEPTION 'Pesanan sudah diambil driver lain';
    END IF;

    IF v_order.status != 'ready' THEN
        RAISE EXCEPTION 'Pesanan tidak tersedia (status: %)', v_order.status;
    END IF;

    -- Assign driver
    UPDATE orders
    SET driver_id = v_driver_id,
        status = 'pickup',
        picked_up_at = NOW()
    WHERE id = p_order_id;

    -- Notify customer
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (v_order.customer_id, 'Driver Ditugaskan', 'Driver sedang menuju warung untuk mengambil pesananmu', 'order');

    RETURN json_build_object(
        'success', true,
        'order_id', p_order_id,
        'active_orders', v_active_count + 1,
        'max_orders', v_max_orders
    );
END;
$$;


-- Get all active orders for driver (multi-order support)
CREATE OR REPLACE FUNCTION get_driver_active_orders()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
    v_orders JSONB;
BEGIN
    v_driver_id := auth.uid();

    IF v_driver_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT COALESCE(json_agg(row_to_json(o.*)), '[]'::json)::jsonb
    INTO v_orders
    FROM (
        SELECT
            ord.id, ord.status, ord.total_amount, ord.delivery_fee,
            ord.delivery_address, ord.customer_name, ord.customer_phone,
            ord.customer_lat, ord.customer_lng,
            ord.payment_method, ord.payment_status,
            ord.merchant_id, ord.created_at,
            m.name as merchant_name, m.address as merchant_address,
            m.latitude as merchant_lat, m.longitude as merchant_lng
        FROM orders ord
        LEFT JOIN merchants m ON m.id = ord.merchant_id
        WHERE ord.driver_id = v_driver_id
        AND ord.status IN ('pickup', 'picked_up', 'delivering')
        ORDER BY ord.created_at ASC
    ) o;

    RETURN json_build_object(
        'orders', v_orders,
        'count', jsonb_array_length(v_orders)
    );
END;
$$;
