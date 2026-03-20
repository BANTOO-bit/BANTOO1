-- Fix: Add subtotal, delivery_fee, service_fee to driver active order RPCs
-- Fix: Join profiles table for proper customer_name resolution
-- Problem 1: Driver pickup page showed total_amount (including ongkir) instead of
--            food subtotal as the COD amount to pay to warung.
-- Problem 2: Customer name showed 'Pelanggan' because orders.customer_name was null
--            and the RPC didn't join profiles to get full_name.
-- Root cause: Both get_driver_active_order and get_driver_active_orders RPCs
--             did not include subtotal in output AND didn't join profiles.

-- 1. Fix get_driver_active_order (singular, legacy)
CREATE OR REPLACE FUNCTION get_driver_active_order()
RETURNS TABLE (
    id UUID,
    merchant_name TEXT,
    merchant_address TEXT,
    customer_address TEXT,
    total_amount INTEGER,
    subtotal INTEGER,
    delivery_fee INTEGER,
    service_fee INTEGER,
    payment_method TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    merchant_lat DOUBLE PRECISION,
    merchant_lng DOUBLE PRECISION,
    customer_lat DOUBLE PRECISION,
    customer_lng DOUBLE PRECISION,
    customer_name TEXT,
    customer_note TEXT,
    items JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        m.name AS merchant_name,
        m.address AS merchant_address,
        o.delivery_address AS customer_address,
        o.total_amount,
        o.subtotal,
        o.delivery_fee,
        o.service_fee,
        o.payment_method,
        o.status,
        o.created_at,
        m.latitude AS merchant_lat,
        m.longitude AS merchant_lng,
        o.customer_lat,
        o.customer_lng,
        p.full_name AS customer_name,
        o.notes AS customer_note,
        (
            SELECT jsonb_agg(jsonb_build_object(
                'name', oi.product_name,
                'quantity', oi.quantity,
                'notes', oi.notes
            ))
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        ) AS items
    FROM public.orders o
    JOIN public.merchants m ON o.merchant_id = m.id
    LEFT JOIN public.profiles p ON o.customer_id = p.id
    WHERE 
        o.driver_id = auth.uid()
        AND o.status IN ('pickup', 'picked_up', 'delivering');
END;
$$;

-- 2. Fix get_driver_active_orders (plural, multi-order)
CREATE OR REPLACE FUNCTION get_driver_active_orders()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_driver_id UUID; v_orders JSONB;
BEGIN
    v_driver_id := auth.uid();
    IF v_driver_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    SELECT COALESCE(json_agg(row_to_json(o.*)), '[]'::json)::jsonb INTO v_orders
    FROM (SELECT ord.id, ord.status, ord.total_amount, ord.subtotal, ord.delivery_fee, ord.service_fee, ord.delivery_address, COALESCE(p.full_name, ord.customer_name) as customer_name, COALESCE(p.phone, ord.customer_phone) as customer_phone, ord.customer_lat, ord.customer_lng, ord.payment_method, ord.notes, ord.merchant_id, ord.created_at, m.name as merchant_name, m.address as merchant_address, m.latitude as merchant_lat, m.longitude as merchant_lng
    FROM orders ord LEFT JOIN merchants m ON m.id = ord.merchant_id LEFT JOIN profiles p ON p.id = ord.customer_id WHERE ord.driver_id = v_driver_id AND ord.status IN ('pickup','picked_up','delivering') ORDER BY ord.created_at ASC) o;
    RETURN json_build_object('orders', v_orders, 'count', jsonb_array_length(v_orders));
END;
$$;
