-- ==========================================
-- BANTOO FOOD DELIVERY - MIGRATION v2 (FIXED)
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ==========================================
-- Safe to run multiple times (idempotent)
-- Adds: 4 missing tables, RLS policies, RPC functions, triggers


-- ==========================================
-- 1. MISSING TABLES
-- ==========================================

-- 1.1 ADDRESSES (User saved delivery addresses)
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Rumah',
    recipient_name TEXT,
    phone TEXT,
    address TEXT NOT NULL,
    detail TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 REVIEWS (Order ratings & reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id),
    merchant_id UUID REFERENCES public.merchants(id),
    driver_id UUID REFERENCES public.profiles(id),
    merchant_rating INTEGER CHECK (merchant_rating >= 1 AND merchant_rating <= 5),
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    comment TEXT,
    merchant_reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 NOTIFICATIONS (In-app notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 ISSUES (Order complaints/reports)
CREATE TABLE IF NOT EXISTS public.issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id),
    reporter_id UUID REFERENCES public.profiles(id),
    reporter_type TEXT DEFAULT 'customer',
    category TEXT,
    description TEXT,
    evidence_urls JSONB DEFAULT '[]'::JSONB,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    resolution TEXT,
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 2. ENABLE RLS ON NEW TABLES
-- ==========================================

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 3. RLS POLICIES FOR NEW TABLES
-- (All with DROP IF EXISTS for idempotency)
-- ==========================================

-- === ADDRESSES ===
DROP POLICY IF EXISTS "Users view own addresses" ON addresses;
CREATE POLICY "Users view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own addresses" ON addresses;
CREATE POLICY "Users insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own addresses" ON addresses;
CREATE POLICY "Users update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own addresses" ON addresses;
CREATE POLICY "Users delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- === REVIEWS ===
DROP POLICY IF EXISTS "Reviews viewable by everyone" ON reviews;
CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers create reviews" ON reviews;
CREATE POLICY "Customers create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Merchants reply to reviews" ON reviews;
CREATE POLICY "Merchants reply to reviews" ON reviews FOR UPDATE USING (
    EXISTS (SELECT 1 FROM merchants WHERE id = reviews.merchant_id AND owner_id = auth.uid())
);

-- === NOTIFICATIONS ===
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own notifications" ON notifications;
CREATE POLICY "Users delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System insert notifications" ON notifications;
CREATE POLICY "System insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- === ISSUES ===
DROP POLICY IF EXISTS "Users view own issues" ON issues;
CREATE POLICY "Users view own issues" ON issues FOR SELECT USING (
    auth.uid() = reporter_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Users create issues" ON issues;
CREATE POLICY "Users create issues" ON issues FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admin update issues" ON issues;
CREATE POLICY "Admin update issues" ON issues FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);


-- ==========================================
-- 4. MISSING RLS POLICIES FOR EXISTING TABLES
-- ==========================================

-- Orders: UPDATE policy
DROP POLICY IF EXISTS "Order participants can update" ON orders;
CREATE POLICY "Order participants can update" ON orders FOR UPDATE USING (
    auth.uid() = customer_id OR
    auth.uid() = driver_id OR
    EXISTS (SELECT 1 FROM merchants WHERE id = orders.merchant_id AND owner_id = auth.uid()) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Menu Items: CRUD for merchants
DROP POLICY IF EXISTS "Menu items viewable by everyone" ON menu_items;
CREATE POLICY "Menu items viewable by everyone" ON menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Merchants manage own menu" ON menu_items;
CREATE POLICY "Merchants manage own menu" ON menu_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM merchants WHERE id = menu_items.merchant_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Merchants update own menu" ON menu_items;
CREATE POLICY "Merchants update own menu" ON menu_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM merchants WHERE id = menu_items.merchant_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Merchants delete own menu" ON menu_items;
CREATE POLICY "Merchants delete own menu" ON menu_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM merchants WHERE id = menu_items.merchant_id AND owner_id = auth.uid())
);

-- Drivers
DROP POLICY IF EXISTS "Drivers viewable by everyone" ON drivers;
CREATE POLICY "Drivers viewable by everyone" ON drivers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Drivers update own record" ON drivers;
CREATE POLICY "Drivers update own record" ON drivers FOR UPDATE USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Drivers insert own record" ON drivers;
CREATE POLICY "Drivers insert own record" ON drivers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wallets
DROP POLICY IF EXISTS "Users view own wallet" ON wallets;
CREATE POLICY "Users view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own wallet" ON wallets;
CREATE POLICY "Users update own wallet" ON wallets FOR UPDATE USING (auth.uid() = user_id);

-- System can insert wallets (for triggers)
DROP POLICY IF EXISTS "System insert wallets" ON wallets;
CREATE POLICY "System insert wallets" ON wallets FOR INSERT WITH CHECK (true);

-- Transactions
DROP POLICY IF EXISTS "Users view own transactions" ON transactions;
CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM wallets WHERE id = transactions.wallet_id AND user_id = auth.uid()) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "System insert transactions" ON transactions;
CREATE POLICY "System insert transactions" ON transactions FOR INSERT WITH CHECK (true);

-- Withdrawals
DROP POLICY IF EXISTS "Users view own withdrawals" ON withdrawals;
CREATE POLICY "Users view own withdrawals" ON withdrawals FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Users create withdrawals" ON withdrawals;
CREATE POLICY "Users create withdrawals" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin update withdrawals" ON withdrawals;
CREATE POLICY "Admin update withdrawals" ON withdrawals FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Promos
DROP POLICY IF EXISTS "Promos viewable by everyone" ON promos;
CREATE POLICY "Promos viewable by everyone" ON promos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage promos" ON promos;
CREATE POLICY "Admin manage promos" ON promos FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admin update promos" ON promos;
CREATE POLICY "Admin update promos" ON promos FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Profiles: INSERT for new signups
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Profiles: UPDATE - drop old policy from schema.sql, replace with admin-capable one
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin update any profile" ON profiles;
CREATE POLICY "Admin update any profile" ON profiles FOR UPDATE USING (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Merchants: UPDATE - drop old policy from schema.sql, replace with admin-capable one
DROP POLICY IF EXISTS "Owners update own merchant" ON merchants;
DROP POLICY IF EXISTS "Admin update merchants" ON merchants;
CREATE POLICY "Admin update merchants" ON merchants FOR UPDATE USING (
    auth.uid() = owner_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Order Items
DROP POLICY IF EXISTS "Order items viewable by participants" ON order_items;
CREATE POLICY "Order items viewable by participants" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (
            o.customer_id = auth.uid() OR
            o.driver_id = auth.uid() OR
            EXISTS (SELECT 1 FROM merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid()) OR
            (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        )
    )
);

DROP POLICY IF EXISTS "System insert order items" ON order_items;
CREATE POLICY "System insert order items" ON order_items FOR INSERT WITH CHECK (true);


-- ==========================================
-- 5. ADDITIONAL RPC FUNCTIONS
-- ==========================================

-- 5.1 Assign Driver to Order (atomic)
CREATE OR REPLACE FUNCTION assign_driver_to_order(
    p_order_id UUID,
    p_driver_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_driver_record RECORD;
    v_order RECORD;
BEGIN
    SELECT * INTO v_driver_record FROM drivers 
    WHERE user_id = p_driver_user_id AND status = 'active' AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Driver not found or not active';
    END IF;
    
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;
    
    IF v_order.driver_id IS NOT NULL THEN
        RAISE EXCEPTION 'Order already has a driver assigned';
    END IF;
    
    IF v_order.status NOT IN ('pending', 'accepted', 'processing', 'ready') THEN
        RAISE EXCEPTION 'Order is not in a valid state for driver assignment';
    END IF;
    
    UPDATE orders SET
        driver_id = p_driver_user_id,
        status = CASE WHEN status = 'ready' THEN 'pickup' ELSE status END,
        updated_at = NOW()
    WHERE id = p_order_id;
    
    RETURN json_build_object(
        'success', true,
        'order_id', p_order_id,
        'driver_id', p_driver_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 Process Withdrawal (atomic: deduct balance + create withdrawal)
CREATE OR REPLACE FUNCTION process_withdrawal(
    p_user_id UUID,
    p_amount INTEGER,
    p_bank_name TEXT,
    p_bank_account_name TEXT,
    p_bank_account_number TEXT
) RETURNS JSONB AS $$
DECLARE
    v_wallet RECORD;
    v_withdrawal_id UUID;
BEGIN
    SELECT * INTO v_wallet FROM wallets 
    WHERE user_id = p_user_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;
    
    IF v_wallet.balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance. Current: %, Requested: %', v_wallet.balance, p_amount;
    END IF;
    
    UPDATE wallets SET 
        balance = balance - p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    INSERT INTO withdrawals (user_id, amount, bank_name, bank_account_name, bank_account_number, status)
    VALUES (p_user_id, p_amount, p_bank_name, p_bank_account_name, p_bank_account_number, 'pending')
    RETURNING id INTO v_withdrawal_id;
    
    INSERT INTO transactions (wallet_id, type, amount, description, reference_id)
    VALUES (v_wallet.id, 'withdrawal', p_amount, 'Penarikan ke ' || p_bank_name, v_withdrawal_id);
    
    RETURN json_build_object(
        'success', true,
        'withdrawal_id', v_withdrawal_id,
        'new_balance', v_wallet.balance - p_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 6. DATABASE TRIGGERS
-- ==========================================

-- 6.1 Auto-create profile + wallet when user signs up
-- NOTE: App uses pseudo-email auth (phone@bantoo.app), so:
--   NEW.email = pseudo-email (e.g. 08xxx@bantoo.app)
--   NEW.phone = NULL (not using phone-based auth)
--   raw_user_meta_data has: full_name, phone_number, email, role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_phone TEXT;
    v_email TEXT;
    v_full_name TEXT;
    v_role TEXT;
BEGIN
    -- Read actual values from metadata (where authService stores them)
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
    v_phone := NEW.raw_user_meta_data->>'phone_number';
    v_email := NEW.raw_user_meta_data->>'email';
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    
    -- Create profile
    INSERT INTO public.profiles (id, full_name, email, phone, role, active_role)
    VALUES (
        NEW.id,
        v_full_name,
        v_email,      -- Real email (e.g. inbantoo@gmail.com), not pseudo
        v_phone,      -- Actual phone number from metadata
        v_role,
        v_role
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        role = COALESCE(EXCLUDED.role, profiles.role),
        active_role = COALESCE(EXCLUDED.active_role, profiles.active_role),
        updated_at = NOW();
    
    -- Create wallet
    INSERT INTO public.wallets (user_id, balance)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6.2 Auto-update merchant rating when review is created
CREATE OR REPLACE FUNCTION update_merchant_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_avg NUMERIC;
    v_count INTEGER;
BEGIN
    SELECT AVG(merchant_rating)::NUMERIC(3,2), COUNT(*)
    INTO v_avg, v_count
    FROM reviews
    WHERE merchant_id = NEW.merchant_id AND merchant_rating IS NOT NULL;
    
    UPDATE merchants SET
        rating = COALESCE(v_avg, 0),
        rating_count = v_count,
        updated_at = NOW()
    WHERE id = NEW.merchant_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_merchant_rating();

-- 6.3 Auto-create notification on order status change
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_title TEXT;
    v_message TEXT;
    v_merchant_owner UUID;
BEGIN
    IF OLD.status = NEW.status THEN RETURN NEW; END IF;
    
    CASE NEW.status
        WHEN 'accepted' THEN
            v_title := 'Pesanan Diterima';
            v_message := 'Restoran menerima pesananmu dan sedang menyiapkan';
        WHEN 'processing' THEN
            v_title := 'Sedang Dimasak';
            v_message := 'Pesananmu sedang dipersiapkan oleh restoran';
        WHEN 'ready' THEN
            v_title := 'Pesanan Siap';
            v_message := 'Pesananmu sudah siap, menunggu driver mengambil';
        WHEN 'pickup' THEN
            v_title := 'Driver Menuju Restoran';
            v_message := 'Driver sedang menuju restoran untuk mengambil pesananmu';
        WHEN 'picked_up' THEN
            v_title := 'Driver Mengambil';
            v_message := 'Driver sudah mengambil pesananmu dari restoran';
        WHEN 'delivering' THEN
            v_title := 'Dalam Perjalanan';
            v_message := 'Driver sedang menuju lokasimu';
        WHEN 'delivered' THEN
            v_title := 'Pesanan Tiba';
            v_message := 'Pesananmu sudah tiba! Selamat menikmati';
        WHEN 'completed' THEN
            v_title := 'Pesanan Selesai';
            v_message := 'Pesanan selesai. Terima kasih telah memesan!';
        WHEN 'cancelled' THEN
            v_title := 'Pesanan Dibatalkan';
            v_message := COALESCE('Alasan: ' || NEW.cancellation_reason, 'Pesanan dibatalkan');
        ELSE
            RETURN NEW;
    END CASE;
    
    IF NEW.customer_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, reference_id)
        VALUES (NEW.customer_id, v_title, v_message, 'order', NEW.id);
    END IF;
    
    IF NEW.status IN ('cancelled') THEN
        SELECT owner_id INTO v_merchant_owner FROM merchants WHERE id = NEW.merchant_id;
        IF v_merchant_owner IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, message, type, reference_id)
            VALUES (v_merchant_owner, 'Pesanan Dibatalkan', v_message, 'order', NEW.id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_status_changed ON orders;
CREATE TRIGGER on_order_status_changed
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION notify_order_status_change();

-- 6.4 Notify merchant on NEW order
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
    v_merchant_owner UUID;
BEGIN
    SELECT owner_id INTO v_merchant_owner FROM merchants WHERE id = NEW.merchant_id;
    IF v_merchant_owner IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, reference_id)
        VALUES (v_merchant_owner, 'Pesanan Baru!', 'Ada pesanan baru masuk, segera konfirmasi!', 'order', NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_order_created ON orders;
CREATE TRIGGER on_new_order_created
    AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION notify_new_order();


-- ==========================================
-- 7. INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_merchant_id ON reviews(merchant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_issues_reporter_id ON issues(reporter_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_merchants_owner_id ON merchants(owner_id);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);


-- ==========================================
-- 8. ENABLE REALTIME FOR KEY TABLES
-- ==========================================
-- Using DO block to handle "already exists" errors gracefully
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE orders;
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- already added, skip
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE drivers;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;


-- ==========================================
-- DONE! Safe to run multiple times.
-- ==========================================
