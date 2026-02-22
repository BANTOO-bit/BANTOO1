-- ==========================================
-- 20260222183000_radius_validation_and_cleanup.sql
-- Mencegah Ghost Delivery & Membersihkan Ghost Drivers
-- ==========================================

-- 1. Modifikasi RPC driver_update_order_status
-- Menambahkan parameter latitude dan longitude untuk validasi jarak (Maks 200 meter)
CREATE OR REPLACE FUNCTION driver_update_order_status(
    p_order_id UUID,
    p_status TEXT, -- 'picked_up', 'delivering', 'delivered'
    p_lat DOUBLE PRECISION DEFAULT NULL,
    p_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_current_status TEXT;
    v_driver_id UUID;
    v_target_lat DOUBLE PRECISION;
    v_target_lng DOUBLE PRECISION;
    v_distance_km DOUBLE PRECISION;
    v_max_distance_km CONSTANT DOUBLE PRECISION := 0.2; -- 200 meter
BEGIN
    v_driver_id := auth.uid();

    -- Check current status & driver ownership
    SELECT status INTO v_current_status
    FROM public.orders
    WHERE id = p_order_id AND driver_id = v_driver_id
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan atau bukan milik Anda');
    END IF;

    -- State Transitions Logic
    IF p_status = 'picked_up' THEN
        IF v_current_status != 'pickup' THEN
             RETURN jsonb_build_object('success', false, 'message', 'Alur salah: Status saat ini ' || v_current_status);
        END IF;

        -- Validasi Jarak ke Merchant (Opsional jika p_lat & p_lng disediakan oleh frontend yang sudah update)
        IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
            SELECT m.latitude, m.longitude INTO v_target_lat, v_target_lng
            FROM public.merchants m
            JOIN public.orders o ON m.id = o.merchant_id
            WHERE o.id = p_order_id;

            IF v_target_lat IS NOT NULL AND v_target_lng IS NOT NULL THEN
                v_distance_km := (6371 * acos(
                    cos(radians(p_lat)) * cos(radians(v_target_lat)) * cos(radians(v_target_lng) - radians(p_lng)) + 
                    sin(radians(p_lat)) * sin(radians(v_target_lat))
                ));
                
                IF v_distance_km > v_max_distance_km THEN
                    RETURN jsonb_build_object('success', false, 'message', 'Anda masih terlalu jauh dari restoran (' || (v_distance_km * 1000)::INT || 'm). Tolong mendekat kurang dari 200m.');
                END IF;
            END IF;
        END IF;

        UPDATE public.orders 
        SET status = 'picked_up', picked_up_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;

    ELSIF p_status = 'delivering' THEN
        IF v_current_status != 'picked_up' THEN
             RETURN jsonb_build_object('success', false, 'message', 'Harus ambil pesanan dulu');
        END IF;
        
        UPDATE public.orders 
        SET status = 'delivering', updated_at = NOW()
        WHERE id = p_order_id;

    ELSIF p_status = 'delivered' OR p_status = 'completed' THEN 
        IF v_current_status NOT IN ('picked_up', 'delivering') THEN
             RETURN jsonb_build_object('success', false, 'message', 'Pesanan belum diambil');
        END IF;

        -- Validasi Jarak ke Customer
        IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
            SELECT latitude, longitude INTO v_target_lat, v_target_lng
            FROM public.orders
            WHERE id = p_order_id;

            IF v_target_lat IS NOT NULL AND v_target_lng IS NOT NULL THEN
                v_distance_km := (6371 * acos(
                    cos(radians(p_lat)) * cos(radians(v_target_lat)) * cos(radians(v_target_lng) - radians(p_lng)) + 
                    sin(radians(p_lat)) * sin(radians(v_target_lat))
                ));
                
                IF v_distance_km > v_max_distance_km THEN
                    RETURN jsonb_build_object('success', false, 'message', 'Anda masih terlalu jauh dari alamat pelanggan (' || (v_distance_km * 1000)::INT || 'm). Tolong memastikan titik pengantaran.');
                END IF;
            END IF;
        END IF;

        UPDATE public.orders 
        SET status = 'delivered', delivered_at = NOW(), payment_status = 'paid', updated_at = NOW() 
        WHERE id = p_order_id;
        
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Status tidak valid');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Status diperbarui');
END;
$$;


-- 2. Fungsi untuk membersihkan Ghost Drivers
-- Driver yang tidak mengirim location > 1 jam akan diset offline.
-- (Biasanya dipanggil lewat pg_cron, tapi bisa juga ditrigger secara manual atau via Edge Function)
CREATE OR REPLACE FUNCTION cleanup_ghost_drivers()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.drivers
    SET is_active = FALSE, updated_at = NOW()
    WHERE is_active = TRUE 
      AND updated_at < NOW() - INTERVAL '1 hour';
END;
$$;

-- Opsional: Jika Supabase instance mendukung pg_cron (harus di-enable oleh admin)
-- SELECT cron.schedule('cleanup_ghost_drivers_hourly', '0 * * * *', $$SELECT cleanup_ghost_drivers()$$);
