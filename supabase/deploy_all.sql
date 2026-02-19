-- ==========================================
-- BANTOO FOOD DELIVERY — FULL DEPLOYMENT SCRIPT
-- ==========================================
-- 
-- INSTRUCTIONS:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Click "New Query"
--   3. Paste this ENTIRE script
--   4. Click "Run"
--
-- This script is IDEMPOTENT — safe to run multiple times.
-- It consolidates: schema.sql, all migrations, all policies,
-- driver_functions.sql, triggers, indexes, and realtime config.
--
-- ORDER OF EXECUTION:
--   1. Extensions
--   2. Tables (base + migration tables)
--   3. Column additions (migrations)
--   4. RLS enable + policies
--   5. RPC functions (helpers, order, driver, admin)
--   6. Triggers (auto profile, ratings, notifications)
--   7. Indexes
--   8. Realtime publication
--   9. Storage buckets & policies
-- ==========================================


-- ==========================================
-- 1. EXTENSIONS
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ==========================================
-- 2. TABLES
-- ==========================================

-- Cleanup old views if needed
DROP VIEW IF EXISTS public.menu_items CASCADE;

-- 2.1 PROFILES (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT UNIQUE,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'merchant', 'driver', 'admin')),
    active_role TEXT DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 MERCHANTS
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    image_url TEXT,
    category TEXT,
    rating NUMERIC(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    delivery_time TEXT DEFAULT '20-30 min',
    delivery_fee INTEGER DEFAULT 0,
    distance NUMERIC(5, 2) DEFAULT 0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_open BOOLEAN DEFAULT TRUE,
    has_promo BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'suspended')),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 MENU ITEMS
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    image_url TEXT,
    category TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 DRIVERS
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type TEXT DEFAULT 'motorcycle',
    vehicle_plate TEXT,
    vehicle_brand TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'suspended')),
    is_active BOOLEAN DEFAULT FALSE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 PROMOS
CREATE TABLE IF NOT EXISTS public.promos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'fixed' CHECK (type IN ('fixed', 'percentage')),
    value INTEGER NOT NULL,
    max_discount INTEGER,
    min_order INTEGER DEFAULT 0,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id),
    merchant_id UUID REFERENCES public.merchants(id),
    driver_id UUID REFERENCES public.profiles(id),
    
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'preparing', 'processing', 'ready', 
        'pickup', 'picked_up', 'delivering', 'delivered', 
        'completed', 'cancelled'
    )),
    
    subtotal INTEGER NOT NULL DEFAULT 0,
    delivery_fee INTEGER NOT NULL DEFAULT 0,
    service_fee INTEGER NOT NULL DEFAULT 0,
    discount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL DEFAULT 0,
    
    payment_method TEXT DEFAULT 'cod',
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    
    promo_id UUID REFERENCES public.promos(id),
    promo_code TEXT,
    
    delivery_address TEXT,
    delivery_detail TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_lat DOUBLE PRECISION,
    customer_lng DOUBLE PRECISION,
    notes TEXT,
    
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    preparing_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.menu_items(id),
    product_name TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    balance INTEGER DEFAULT 0 CHECK (balance >= 0),
    pin TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 TRANSACTIONS (Wallet History)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'earnings')),
    amount INTEGER NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 WITHDRAWALS
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    amount INTEGER NOT NULL,
    bank_name TEXT,
    bank_account_name TEXT,
    bank_account_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    proof_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 ADDRESSES (Migration v2)
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

-- 2.12 REVIEWS (Migration v2)
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

-- 2.13 NOTIFICATIONS (Migration v2)
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

-- 2.14 ISSUES (Migration v2)
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

-- 2.15 FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, merchant_id)
);


-- ==========================================
-- 3. COLUMN ADDITIONS (Migrations)
-- ==========================================

-- Orders: prep_time
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS prep_time INTEGER;

-- Orders: preparing_at timestamp
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS preparing_at TIMESTAMPTZ;

-- Merchants: operating hours
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT NULL;

-- Merchants: KTP & bank info
ALTER TABLE public.merchants
    ADD COLUMN IF NOT EXISTS ktp_url TEXT,
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_number TEXT;

-- Drivers: photos, documents, address, phone, bank info
ALTER TABLE public.drivers
    ADD COLUMN IF NOT EXISTS selfie_url TEXT,
    ADD COLUMN IF NOT EXISTS vehicle_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS stnk_url TEXT,
    ADD COLUMN IF NOT EXISTS ktp_url TEXT,
    ADD COLUMN IF NOT EXISTS photo_with_vehicle_url TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_number TEXT;

-- Drivers: legacy columns (from earlier migration)
ALTER TABLE public.drivers
    ADD COLUMN IF NOT EXISTS stnk_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS id_card_photo_url TEXT;


-- ==========================================
-- 4. ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- === PROFILES ===
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin update any profile" ON profiles;
CREATE POLICY "Admin update any profile" ON profiles FOR UPDATE USING (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- === MERCHANTS ===
DROP POLICY IF EXISTS "Merchants viewable by everyone" ON merchants;
CREATE POLICY "Merchants viewable by everyone" ON merchants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners insert merchant" ON merchants;
CREATE POLICY "Owners insert merchant" ON merchants FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners update own merchant" ON merchants;
DROP POLICY IF EXISTS "Admin update merchants" ON merchants;
CREATE POLICY "Admin update merchants" ON merchants FOR UPDATE USING (
    auth.uid() = owner_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- === MENU ITEMS ===
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

-- === DRIVERS ===
DROP POLICY IF EXISTS "Drivers viewable by everyone" ON drivers;
CREATE POLICY "Drivers viewable by everyone" ON drivers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can apply as driver" ON drivers;
DROP POLICY IF EXISTS "Drivers insert own record" ON drivers;
CREATE POLICY "Drivers insert own record" ON drivers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Drivers update own record" ON drivers;
CREATE POLICY "Drivers update own record" ON drivers FOR UPDATE USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can update drivers" ON drivers;
-- (covered by combined policy above)

DROP POLICY IF EXISTS "Admins can delete drivers" ON drivers;
CREATE POLICY "Admins can delete drivers" ON drivers FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- === ORDERS ===
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (
    auth.uid() = customer_id OR
    auth.uid() = driver_id OR
    EXISTS (SELECT 1 FROM merchants WHERE id = orders.merchant_id AND owner_id = auth.uid()) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Customers create orders" ON orders;
CREATE POLICY "Customers create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Order participants can update" ON orders;
DROP POLICY IF EXISTS "Drivers update own orders" ON orders;
CREATE POLICY "Order participants can update" ON orders FOR UPDATE USING (
    auth.uid() = customer_id OR
    auth.uid() = driver_id OR
    EXISTS (SELECT 1 FROM merchants WHERE id = orders.merchant_id AND owner_id = auth.uid()) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- === ORDER ITEMS ===
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
CREATE POLICY "System insert order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders WHERE id = order_items.order_id
        AND customer_id = auth.uid()
    )
    OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- === WALLETS ===
DROP POLICY IF EXISTS "Users view own wallet" ON wallets;
CREATE POLICY "Users view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own wallet" ON wallets;
CREATE POLICY "Users update own wallet" ON wallets FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System insert wallets" ON wallets;
CREATE POLICY "System insert wallets" ON wallets FOR INSERT WITH CHECK (true);

-- === TRANSACTIONS ===
DROP POLICY IF EXISTS "Users view own transactions" ON transactions;
CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM wallets WHERE id = transactions.wallet_id AND user_id = auth.uid()) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "System insert transactions" ON transactions;
CREATE POLICY "System insert transactions" ON transactions FOR INSERT WITH CHECK (true);

-- === WITHDRAWALS ===
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

-- === PROMOS ===
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

DROP POLICY IF EXISTS "Admin delete promos" ON promos;
CREATE POLICY "Admin delete promos" ON promos FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

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

-- === FAVORITES ===
DROP POLICY IF EXISTS "Users view own favorites" ON favorites;
CREATE POLICY "Users view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own favorites" ON favorites;
CREATE POLICY "Users insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own favorites" ON favorites;
CREATE POLICY "Users delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 5. RPC FUNCTIONS
-- ==========================================

-- 5.1 Helper: Haversine Distance (returns km)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
DECLARE
    R float := 6371;
    dLat float;
    dLon float;
    a float;
    c float;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    a := sin(dLat/2) * sin(dLat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dLon/2) * sin(dLon/2);
    c := 2 * asin(sqrt(a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- 5.2 Delivery Fee Calculation
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
    SELECT latitude, longitude INTO v_merchant_lat, v_merchant_lng
    FROM merchants WHERE id = p_merchant_id;
    
    IF v_merchant_lat IS NULL OR v_merchant_lng IS NULL THEN
        RETURN 8000;
    END IF;
    
    v_distance := calculate_distance(v_merchant_lat, v_merchant_lng, p_user_lat, p_user_lng);
    v_fee := v_base_fee + (v_distance * v_price_per_km);
    v_fee := CEIL(v_fee / 500.0) * 500;
    
    IF v_fee < 5000 THEN v_fee := 5000; END IF;
    
    RETURN v_fee;
END;
$$ LANGUAGE plpgsql;

-- 5.3 Create Order (with Wallet Payment Support)
CREATE OR REPLACE FUNCTION create_order(
    p_merchant_id UUID,
    p_items JSONB,
    p_delivery_address TEXT,
    p_delivery_detail TEXT,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_lat FLOAT,
    p_customer_lng FLOAT,
    p_payment_method TEXT,
    p_promo_code TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_subtotal INTEGER := 0;
    v_delivery_fee INTEGER;
    v_service_fee INTEGER := 2000;
    v_discount INTEGER := 0;
    v_total INTEGER;
    v_item JSONB;
    v_price INTEGER;
    v_product_name TEXT;
    v_promo_id UUID;
    v_customer_id UUID;
    v_wallet_id UUID;
    v_balance INTEGER;
BEGIN
    v_customer_id := auth.uid();
    
    -- 1. Calculate Delivery Fee
    v_delivery_fee := calculate_delivery_fee(p_merchant_id, p_customer_lat, p_customer_lng);
    
    -- 2. Calculate Subtotal & Validate Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT price, name INTO v_price, v_product_name
        FROM menu_items WHERE id = (v_item->>'menu_item_id')::UUID;
        
        IF v_price IS NULL THEN
            RAISE EXCEPTION 'Item not found';
        END IF;
        
        v_subtotal := v_subtotal + (v_price * (v_item->>'quantity')::INTEGER);
    END LOOP;
    
    -- 3. Validate Promo
    IF p_promo_code IS NOT NULL THEN
        SELECT id, value, type, max_discount INTO v_promo_id, v_discount, v_product_name, v_price
        FROM promos 
        WHERE code = p_promo_code AND is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW());
        
        IF v_promo_id IS NOT NULL THEN
            IF v_product_name = 'percentage' THEN
                 v_discount := (v_subtotal * v_discount) / 100;
                 IF v_price IS NOT NULL AND v_discount > v_price THEN
                    v_discount := v_price;
                 END IF;
            END IF;
        ELSE
            v_discount := 0;
        END IF;
    END IF;
    
    v_total := v_subtotal + v_delivery_fee + v_service_fee - v_discount;
    
    -- 4. Handle Wallet Payment
    IF p_payment_method = 'wallet' THEN
        SELECT id, balance INTO v_wallet_id, v_balance
        FROM wallets
        WHERE user_id = v_customer_id
        FOR UPDATE;
        
        IF v_wallet_id IS NULL THEN
            RAISE EXCEPTION 'Wallet not found';
        END IF;
        
        IF v_balance < v_total THEN
            RAISE EXCEPTION 'Saldo tidak mencukupi. Total: %, Saldo: %', v_total, v_balance;
        END IF;
        
        UPDATE wallets 
        SET balance = balance - v_total, updated_at = NOW()
        WHERE id = v_wallet_id;
    END IF;
    
    -- 5. Insert Order
    INSERT INTO orders (
        customer_id, merchant_id, status, 
        subtotal, delivery_fee, service_fee, discount, total_amount,
        payment_method, payment_status,
        delivery_address, delivery_detail, customer_name, customer_phone,
        customer_lat, customer_lng, notes, promo_code, promo_id
    ) VALUES (
        v_customer_id, p_merchant_id, 'pending',
        v_subtotal, v_delivery_fee, v_service_fee, v_discount, v_total,
        p_payment_method, CASE WHEN p_payment_method = 'wallet' THEN 'paid' ELSE 'pending' END,
        p_delivery_address, p_delivery_detail, p_customer_name, p_customer_phone,
        p_customer_lat, p_customer_lng, p_notes, p_promo_code, v_promo_id
    ) RETURNING id INTO v_order_id;
    
    -- 6. Wallet Transaction Record
    IF p_payment_method = 'wallet' THEN
        INSERT INTO transactions (wallet_id, type, amount, description, reference_id, status)
        VALUES (v_wallet_id, 'payment', v_total, 'Pembayaran Pesanan #' || substring(v_order_id::text, 1, 8), v_order_id, 'completed');
    END IF;
    
    -- 7. Insert Order Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT price, name INTO v_price, v_product_name
        FROM menu_items WHERE id = (v_item->>'menu_item_id')::UUID;
        
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_time, notes)
        VALUES (
            v_order_id, 
            (v_item->>'menu_item_id')::UUID, 
            v_product_name, 
            (v_item->>'quantity')::INTEGER, 
            v_price,
            v_item->>'notes'
        );
    END LOOP;
    
    RETURN (SELECT row_to_json(orders) FROM orders WHERE id = v_order_id);
END;
$$ LANGUAGE plpgsql;

-- 5.4 Admin Dashboard Stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    v_total_orders INTEGER;
    v_active_cod INTEGER;
    v_online_drivers INTEGER;
    v_total_revenue INTEGER;
    v_json JSONB;
BEGIN
    SELECT COUNT(*) INTO v_total_orders FROM orders 
    WHERE created_at > CURRENT_DATE;
    
    SELECT COALESCE(SUM(total_amount), 0) INTO v_active_cod 
    FROM orders WHERE payment_method = 'cod' AND payment_status = 'pending';
    
    SELECT COUNT(*) INTO v_online_drivers FROM drivers WHERE is_active = TRUE;
    
    SELECT COALESCE(SUM(service_fee), 0) INTO v_total_revenue 
    FROM orders WHERE status IN ('delivered', 'completed');

    v_json := json_build_object(
        'total_orders', v_total_orders,
        'active_cod', v_active_cod,
        'online_drivers', v_online_drivers,
        'today_revenue', v_total_revenue
    );
    
    RETURN v_json;
END;
$$ LANGUAGE plpgsql;

-- 5.5 Get Available Orders (for drivers)
CREATE OR REPLACE FUNCTION get_available_orders(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    merchant_name TEXT,
    merchant_address TEXT,
    customer_address TEXT,
    distance_to_merchant DOUBLE PRECISION,
    total_amount INTEGER,
    payment_method TEXT,
    created_at TIMESTAMPTZ,
    merchant_lat DOUBLE PRECISION,
    merchant_lng DOUBLE PRECISION
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        m.name AS merchant_name,
        m.address AS merchant_address,
        o.delivery_address AS customer_address,
        (6371 * acos(
            cos(radians(p_lat)) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(p_lng)) + 
            sin(radians(p_lat)) * sin(radians(m.latitude))
        )) AS distance_to_merchant,
        o.total_amount,
        o.payment_method,
        o.created_at,
        m.latitude AS merchant_lat,
        m.longitude AS merchant_lng
    FROM public.orders o
    JOIN public.merchants m ON o.merchant_id = m.id
    WHERE 
        o.status = 'ready'
        AND o.driver_id IS NULL
    ORDER BY distance_to_merchant ASC;
END;
$$;

-- 5.6 Driver Accept Order (Atomic, Anti-Race Condition)
CREATE OR REPLACE FUNCTION driver_accept_order(
    p_order_id UUID
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_driver_id UUID;
    v_order_status TEXT;
    v_current_driver UUID;
BEGIN
    v_driver_id := auth.uid();
    
    IF NOT EXISTS (
        SELECT 1 FROM public.drivers 
        WHERE user_id = v_driver_id 
        AND status = 'approved' 
        AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Driver tidak aktif atau belum disetujui');
    END IF;

    SELECT status, driver_id INTO v_order_status, v_current_driver
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF v_order_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan');
    END IF;

    IF v_order_status != 'ready' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak lagi tersedia (Status: ' || v_order_status || ')');
    END IF;

    IF v_current_driver IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan sudah diambil driver lain');
    END IF;

    UPDATE public.orders
    SET 
        driver_id = v_driver_id,
        status = 'pickup',
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'message', 'Order berhasil diambil');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- 5.7 Driver Update Order Status (State Machine)
CREATE OR REPLACE FUNCTION driver_update_order_status(
    p_order_id UUID,
    p_status TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_current_status TEXT;
    v_driver_id UUID;
BEGIN
    v_driver_id := auth.uid();

    SELECT status INTO v_current_status
    FROM public.orders
    WHERE id = p_order_id AND driver_id = v_driver_id
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan atau bukan milik Anda');
    END IF;

    IF p_status = 'picked_up' THEN
        IF v_current_status != 'pickup' THEN
             RETURN jsonb_build_object('success', false, 'message', 'Alur salah: Status saat ini ' || v_current_status);
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

        -- C2 FIX: Only set delivery status + timestamp.
        -- Payment status handled separately by confirm_cod_payment (for COD)
        -- or was already 'paid' at order creation (for wallet).
        UPDATE public.orders 
        SET status = 'delivered', delivered_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;
        
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Status tidak valid');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Status diperbarui');
END;
$$;

-- 5.7b General Order Status Update (Merchant / Customer / Admin)
-- Called by: orderService.js → supabase.rpc('update_order_status', { p_order_id, p_status, p_additional })
-- Validates caller role + enforces valid state transitions + sets server-side timestamps
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_status TEXT,
    p_additional JSONB DEFAULT '{}'
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_caller UUID;
    v_order RECORD;
    v_is_customer BOOLEAN := FALSE;
    v_is_merchant BOOLEAN := FALSE;
    v_is_driver BOOLEAN := FALSE;
    v_is_admin BOOLEAN := FALSE;
    v_caller_role TEXT;
    v_wallet_id UUID;
BEGIN
    v_caller := auth.uid();
    IF v_caller IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    -- Lock the order row
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan');
    END IF;

    -- Determine caller role
    v_is_customer := (v_order.customer_id = v_caller);
    v_is_driver := (v_order.driver_id = v_caller);
    v_is_merchant := EXISTS (
        SELECT 1 FROM public.merchants WHERE id = v_order.merchant_id AND owner_id = v_caller
    );
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller;
    v_is_admin := (v_caller_role = 'admin');

    -- Permission check per target status
    IF p_status = 'accepted' AND NOT (v_is_merchant OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya merchant yang dapat menerima pesanan');
    END IF;
    IF p_status = 'preparing' AND NOT (v_is_merchant OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya merchant yang dapat memproses pesanan');
    END IF;
    IF p_status = 'ready' AND NOT (v_is_merchant OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya merchant yang dapat menandai pesanan siap');
    END IF;
    IF p_status IN ('pickup', 'picked_up', 'delivering', 'delivered') AND NOT (v_is_driver OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya driver yang dapat mengubah status ini');
    END IF;
    IF p_status = 'cancelled' AND NOT (v_is_customer OR v_is_merchant OR v_is_admin) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda tidak memiliki akses untuk membatalkan pesanan ini');
    END IF;

    -- State machine: validate transition
    IF p_status = 'accepted' AND v_order.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hanya pesanan pending yang bisa diterima');
    END IF;
    IF p_status = 'preparing' AND v_order.status NOT IN ('accepted', 'pending') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Alur status tidak valid');
    END IF;
    IF p_status = 'ready' AND v_order.status NOT IN ('accepted', 'preparing') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan belum diproses');
    END IF;
    IF p_status = 'cancelled' AND v_order.status NOT IN ('pending', 'accepted', 'preparing') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan sudah tidak bisa dibatalkan');
    END IF;

    -- Apply update with server-side timestamps
    IF p_status = 'accepted' THEN
        UPDATE public.orders SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;
    ELSIF p_status = 'preparing' THEN
        UPDATE public.orders SET status = 'preparing', preparing_at = NOW(), updated_at = NOW()
        WHERE id = p_order_id;
    ELSIF p_status = 'ready' THEN
        UPDATE public.orders SET status = 'ready', updated_at = NOW()
        WHERE id = p_order_id;
    ELSIF p_status = 'cancelled' THEN
        UPDATE public.orders
        SET status = 'cancelled',
            cancelled_at = NOW(),
            updated_at = NOW(),
            cancellation_reason = COALESCE(p_additional->>'cancellation_reason', v_order.cancellation_reason)
        WHERE id = p_order_id;

        -- Refund wallet if paid via wallet
        IF v_order.payment_method = 'wallet' AND v_order.payment_status = 'paid' THEN
            SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = v_order.customer_id;
            IF v_wallet_id IS NOT NULL THEN
                UPDATE public.wallets SET balance = balance + v_order.total_amount, updated_at = NOW()
                WHERE id = v_wallet_id;

                INSERT INTO public.transactions (wallet_id, type, amount, description, reference_id, status)
                VALUES (v_wallet_id, 'refund', v_order.total_amount,
                        'Refund pesanan #' || substring(p_order_id::text, 1, 8), p_order_id, 'completed');

                UPDATE public.orders SET payment_status = 'refunded' WHERE id = p_order_id;
            END IF;
        END IF;
    ELSE
        -- Generic update for other statuses (driver statuses handled by driver_update_order_status)
        UPDATE public.orders SET status = p_status, updated_at = NOW() WHERE id = p_order_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Status berhasil diperbarui');
END;
$$;

-- 5.8 Update Driver Location (Heartbeat)
CREATE OR REPLACE FUNCTION update_driver_location(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.drivers
    SET 
        latitude = p_lat, 
        longitude = p_lng,
        updated_at = NOW(),
        is_active = true
    WHERE user_id = auth.uid();
END;
$$;

-- 5.9 Toggle Driver Online Status
CREATE OR REPLACE FUNCTION toggle_driver_status(
    p_is_active BOOLEAN
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.drivers
    SET 
        is_active = p_is_active,
        updated_at = NOW()
    WHERE user_id = auth.uid();
END;
$$;

-- 5.10 Get Driver Active Order (Session Persistence)
CREATE OR REPLACE FUNCTION get_driver_active_order()
RETURNS TABLE (
    id UUID,
    merchant_name TEXT,
    merchant_address TEXT,
    customer_address TEXT,
    total_amount INTEGER,
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

-- 5.11 Assign Driver to Order (Admin)
CREATE OR REPLACE FUNCTION assign_driver_to_order(
    p_order_id UUID,
    p_driver_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_driver_record RECORD;
    v_order RECORD;
BEGIN
    SELECT * INTO v_driver_record FROM drivers 
    WHERE user_id = p_driver_user_id AND status IN ('approved', 'active') AND is_active = TRUE;
    
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
    
    IF v_order.status NOT IN ('pending', 'accepted', 'preparing', 'processing', 'ready') THEN
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

-- 5.12 Process Withdrawal (atomic: deduct balance + create record)
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

-- 5.13 Get Driver Stats
CREATE OR REPLACE FUNCTION get_driver_stats(
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_total_trips INTEGER;
    v_avg_rating NUMERIC;
    v_total_earnings INTEGER;
    v_json JSONB;
BEGIN
    SELECT COUNT(*) INTO v_total_trips
    FROM orders WHERE driver_id = p_user_id AND status IN ('delivered', 'completed');

    SELECT COALESCE(AVG(driver_rating), 0)::NUMERIC(3,2) INTO v_avg_rating
    FROM reviews WHERE driver_id = p_user_id AND driver_rating IS NOT NULL;

    SELECT COALESCE(SUM(delivery_fee), 0) INTO v_total_earnings
    FROM orders WHERE driver_id = p_user_id AND status IN ('delivered', 'completed');

    v_json := json_build_object(
        'total_trips', v_total_trips,
        'avg_rating', v_avg_rating,
        'total_earnings', v_total_earnings
    );

    RETURN v_json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.14 Request Withdrawal (User-facing, atomic)
CREATE OR REPLACE FUNCTION request_withdrawal(
    p_amount INTEGER,
    p_bank_name TEXT,
    p_bank_account_name TEXT DEFAULT NULL,
    p_account_name TEXT DEFAULT NULL,
    p_bank_account_number TEXT DEFAULT NULL,
    p_account_number TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_wallet RECORD;
    v_withdrawal_id UUID;
    v_final_bank_account_name TEXT;
    v_final_bank_account_number TEXT;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_final_bank_account_name := COALESCE(p_bank_account_name, p_account_name);
    v_final_bank_account_number := COALESCE(p_bank_account_number, p_account_number);

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Jumlah penarikan tidak valid';
    END IF;

    SELECT * INTO v_wallet FROM wallets
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet tidak ditemukan';
    END IF;

    IF v_wallet.balance < p_amount THEN
        RAISE EXCEPTION 'Saldo tidak mencukupi. Saldo: %, Diminta: %', v_wallet.balance, p_amount;
    END IF;

    UPDATE wallets
    SET balance = balance - p_amount, updated_at = NOW()
    WHERE user_id = v_user_id;

    INSERT INTO withdrawals (user_id, amount, bank_name, bank_account_name, bank_account_number, status)
    VALUES (v_user_id, p_amount, p_bank_name, v_final_bank_account_name, v_final_bank_account_number, 'pending')
    RETURNING id INTO v_withdrawal_id;

    INSERT INTO transactions (wallet_id, type, amount, description, reference_id, status)
    VALUES (v_wallet.id, 'withdrawal', p_amount, 'Penarikan ke ' || p_bank_name, v_withdrawal_id, 'completed');

    INSERT INTO notifications (user_id, title, message, type)
    VALUES (v_user_id, 'Penarikan Diproses', 'Permintaan penarikan Rp ' || p_amount || ' sedang diproses.', 'system');

    RETURN json_build_object(
        'success', true,
        'withdrawal_id', v_withdrawal_id,
        'new_balance', v_wallet.balance - p_amount
    );
EXCEPTION WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.15 Wallet Balance Plus (Admin refund on withdrawal rejection)
CREATE OR REPLACE FUNCTION wallet_balance_plus(
    p_user_id UUID,
    p_amount INTEGER
) RETURNS VOID AS $$
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid amount';
    END IF;

    UPDATE wallets
    SET balance = balance + p_amount, updated_at = NOW()
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
    END IF;

    INSERT INTO transactions (wallet_id, type, amount, description, status)
    SELECT w.id, 'refund', p_amount, 'Refund penarikan yang ditolak', 'completed'
    FROM wallets w WHERE w.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5.16 Operating Hours: is_merchant_open helper
CREATE OR REPLACE FUNCTION is_merchant_open(p_merchant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_hours JSONB;
    v_day_key TEXT;
    v_day_schedule JSONB;
    v_now TIME;
    v_open TIME;
    v_close TIME;
    v_day_of_week INT;
BEGIN
    SELECT operating_hours INTO v_hours FROM merchants WHERE id = p_merchant_id;
    IF v_hours IS NULL THEN RETURN TRUE; END IF;
    v_now := (NOW() AT TIME ZONE 'Asia/Jakarta')::TIME;
    v_day_of_week := EXTRACT(DOW FROM (NOW() AT TIME ZONE 'Asia/Jakarta'));
    v_day_key := CASE v_day_of_week
        WHEN 0 THEN 'sun' WHEN 1 THEN 'mon' WHEN 2 THEN 'tue'
        WHEN 3 THEN 'wed' WHEN 4 THEN 'thu' WHEN 5 THEN 'fri' WHEN 6 THEN 'sat'
    END;
    v_day_schedule := v_hours -> v_day_key;
    IF v_day_schedule IS NULL THEN RETURN TRUE; END IF;
    IF (v_day_schedule ->> 'isOpen')::BOOLEAN = FALSE THEN RETURN FALSE; END IF;
    v_open := (v_day_schedule ->> 'open')::TIME;
    v_close := (v_day_schedule ->> 'close')::TIME;
    IF v_close < v_open THEN RETURN v_now >= v_open OR v_now <= v_close; END IF;
    RETURN v_now >= v_open AND v_now <= v_close;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5.17 check_merchant_open (frontend RPC)
CREATE OR REPLACE FUNCTION check_merchant_open(p_merchant_id UUID)
RETURNS JSONB AS $$
DECLARE v_is_open BOOLEAN; v_merchant RECORD; v_day_key TEXT; v_day_of_week INT; v_schedule JSONB;
BEGIN
    SELECT name, operating_hours, is_open INTO v_merchant FROM merchants WHERE id = p_merchant_id;
    IF NOT FOUND THEN RETURN json_build_object('is_open', false, 'reason', 'Warung tidak ditemukan'); END IF;
    IF v_merchant.is_open = FALSE THEN RETURN json_build_object('is_open', false, 'reason', v_merchant.name || ' sedang tutup'); END IF;
    v_is_open := is_merchant_open(p_merchant_id);
    IF NOT v_is_open THEN
        v_day_of_week := EXTRACT(DOW FROM (NOW() AT TIME ZONE 'Asia/Jakarta'));
        v_day_key := CASE v_day_of_week WHEN 0 THEN 'sun' WHEN 1 THEN 'mon' WHEN 2 THEN 'tue' WHEN 3 THEN 'wed' WHEN 4 THEN 'thu' WHEN 5 THEN 'fri' WHEN 6 THEN 'sat' END;
        v_schedule := v_merchant.operating_hours -> v_day_key;
        IF v_schedule IS NOT NULL AND (v_schedule ->> 'isOpen')::BOOLEAN = FALSE THEN
            RETURN json_build_object('is_open', false, 'reason', v_merchant.name || ' tidak buka hari ini');
        END IF;
        RETURN json_build_object('is_open', false, 'reason', v_merchant.name || ' buka jam ' || (v_schedule ->> 'open') || ' - ' || (v_schedule ->> 'close'));
    END IF;
    RETURN json_build_object('is_open', true, 'reason', NULL);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5.18 Auto-assign nearest driver
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS max_concurrent_orders INT DEFAULT 2;

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
    UPDATE orders SET driver_id = v_driver.user_id, status = 'pickup', picked_up_at = NOW() WHERE id = p_order_id AND driver_id IS NULL AND status = 'ready';
    IF NOT FOUND THEN RETURN json_build_object('success', false, 'reason', 'Already assigned'); END IF;
    INSERT INTO notifications (user_id, title, message, type) VALUES (v_driver.user_id, 'Pesanan Baru Ditugaskan', 'Pickup di ' || v_merchant.name, 'order');
    RETURN json_build_object('success', true, 'driver_id', v_driver.user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.19 Multi-order: override driver_accept_order
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
    UPDATE orders SET driver_id = v_driver_id, status = 'pickup', picked_up_at = NOW() WHERE id = p_order_id;
    INSERT INTO notifications (user_id, title, message, type) VALUES (v_order.customer_id, 'Driver Ditugaskan', 'Driver menuju warung', 'order');
    RETURN json_build_object('success', true, 'order_id', p_order_id, 'active_orders', v_active + 1, 'max_orders', v_max);
END;
$$;

-- 5.20 get_driver_active_orders (multi-order)
CREATE OR REPLACE FUNCTION get_driver_active_orders()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_driver_id UUID; v_orders JSONB;
BEGIN
    v_driver_id := auth.uid();
    IF v_driver_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    SELECT COALESCE(json_agg(row_to_json(o.*)), '[]'::json)::jsonb INTO v_orders
    FROM (SELECT ord.id, ord.status, ord.total_amount, ord.delivery_fee, ord.delivery_address, ord.customer_name, ord.customer_phone, ord.customer_lat, ord.customer_lng, ord.payment_method, ord.merchant_id, ord.created_at, m.name as merchant_name, m.address as merchant_address, m.latitude as merchant_lat, m.longitude as merchant_lng
    FROM orders ord LEFT JOIN merchants m ON m.id = ord.merchant_id WHERE ord.driver_id = v_driver_id AND ord.status IN ('pickup','picked_up','delivering') ORDER BY ord.created_at ASC) o;
    RETURN json_build_object('orders', v_orders, 'count', jsonb_array_length(v_orders));
END;
$$;

-- 5.21 Auto-Cancel Expired Orders (timeout)
-- Cancels orders stuck in 'pending' for more than p_timeout_minutes
CREATE OR REPLACE FUNCTION auto_cancel_expired_orders(
    p_timeout_minutes INTEGER DEFAULT 15
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_count INTEGER := 0;
    v_wallet RECORD;
    v_expired RECORD;
BEGIN
    FOR v_expired IN
        SELECT id, customer_id, payment_method, payment_status, total_amount
        FROM public.orders
        WHERE status = 'pending'
          AND created_at < NOW() - (p_timeout_minutes || ' minutes')::INTERVAL
        FOR UPDATE
    LOOP
        UPDATE public.orders
        SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW(),
            cancellation_reason = 'Otomatis dibatalkan — merchant tidak merespons dalam ' || p_timeout_minutes || ' menit'
        WHERE id = v_expired.id;

        IF v_expired.payment_method = 'wallet' AND v_expired.payment_status = 'paid' THEN
            SELECT id INTO v_wallet FROM public.wallets WHERE user_id = v_expired.customer_id;
            IF v_wallet.id IS NOT NULL THEN
                UPDATE public.wallets SET balance = balance + v_expired.total_amount, updated_at = NOW()
                WHERE id = v_wallet.id;
                INSERT INTO public.transactions (wallet_id, type, amount, description, reference_id, status)
                VALUES (v_wallet.id, 'refund', v_expired.total_amount,
                        'Refund otomatis — timeout pesanan #' || substring(v_expired.id::text, 1, 8),
                        v_expired.id, 'completed');
                UPDATE public.orders SET payment_status = 'refunded' WHERE id = v_expired.id;
            END IF;
        END IF;

        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (v_expired.customer_id, 'Pesanan Dibatalkan',
                'Pesanan #' || substring(v_expired.id::text, 1, 8) || ' otomatis dibatalkan karena tidak direspons merchant.',
                'order', v_expired.id);

        v_count := v_count + 1;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'cancelled_count', v_count);
END;
$$;


-- ==========================================
-- 6. TRIGGERS
-- ==========================================

-- 6.1 Auto-create profile + wallet on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_phone TEXT;
    v_email TEXT;
    v_full_name TEXT;
    v_role TEXT;
BEGIN
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
    v_phone := NEW.raw_user_meta_data->>'phone_number';
    v_email := NEW.raw_user_meta_data->>'email';
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    
    INSERT INTO public.profiles (id, full_name, email, phone, role, active_role)
    VALUES (NEW.id, v_full_name, v_email, v_phone, v_role, v_role)
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        role = COALESCE(EXCLUDED.role, profiles.role),
        active_role = COALESCE(EXCLUDED.active_role, profiles.active_role),
        updated_at = NOW();
    
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

-- 6.2 Auto-update merchant rating on review
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

-- 6.3 Auto-notify on order status change
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
        WHEN 'preparing' THEN
            v_title := 'Sedang Dimasak';
            v_message := 'Pesananmu sedang dipersiapkan oleh restoran';
        WHEN 'processing' THEN
            v_title := 'Sedang Diproses';
            v_message := 'Pesananmu sedang diproses oleh restoran';
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

-- 6.4 Notify merchant on new order
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
-- 7. INDEXES
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
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON orders(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_merchants_owner_id ON merchants(owner_id);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);


-- ==========================================
-- 7.1 CHAT MESSAGES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'driver')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_order_id ON public.chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(order_id, created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customer can view chat messages" ON public.chat_messages FOR SELECT
USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = chat_messages.order_id AND o.customer_id = auth.uid()));

CREATE POLICY "Driver can view chat messages" ON public.chat_messages FOR SELECT
USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = chat_messages.order_id AND o.driver_id = auth.uid()));

CREATE POLICY "Customer can send chat messages" ON public.chat_messages FOR INSERT
WITH CHECK (sender_id = auth.uid() AND sender_role = 'customer'
    AND EXISTS (SELECT 1 FROM orders o WHERE o.id = chat_messages.order_id AND o.customer_id = auth.uid() AND o.status IN ('pickup', 'picked_up', 'delivering')));

CREATE POLICY "Driver can send chat messages" ON public.chat_messages FOR INSERT
WITH CHECK (sender_id = auth.uid() AND sender_role = 'driver'
    AND EXISTS (SELECT 1 FROM orders o WHERE o.id = chat_messages.order_id AND o.driver_id = auth.uid() AND o.status IN ('pickup', 'picked_up', 'delivering')));

CREATE POLICY "Users can mark messages as read" ON public.chat_messages FOR UPDATE
USING (sender_id != auth.uid() AND EXISTS (SELECT 1 FROM orders o WHERE o.id = chat_messages.order_id AND (o.customer_id = auth.uid() OR o.driver_id = auth.uid())))
WITH CHECK (sender_id != auth.uid());


-- ==========================================
-- 8. ENABLE REALTIME
-- ==========================================

DO $$
BEGIN
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE orders;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drivers;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE merchants;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE withdrawals;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;


-- ==========================================
-- 9. STORAGE BUCKETS & POLICIES
-- ==========================================
-- Bucket structure:
--   public-assets/  → profile photos, merchant logos, menu images (PUBLIC)
--   private-docs/   → KTP, STNK, receipts, evidence (PRIVATE, signed URL)
-- Folder convention: {category}/{subcategory}/{userId or entityId}/{timestamp_random.ext}

-- ===== BUCKET: public-assets (PUBLIC) =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'public-assets',
    'public-assets',
    true,
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ===== BUCKET: private-docs (PRIVATE) =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'private-docs',
    'private-docs',
    false,
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];


-- ===== POLICIES: public-assets =====

-- Anyone can view public assets
DROP POLICY IF EXISTS "Public assets are viewable by everyone" ON storage.objects;
CREATE POLICY "Public assets are viewable by everyone"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'public-assets');

-- Authenticated users can upload to public-assets (folder must contain their user ID)
DROP POLICY IF EXISTS "Users can upload public assets" ON storage.objects;
CREATE POLICY "Users can upload public assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'public-assets'
    AND auth.uid()::text = (storage.foldername(name))[3]
);

-- Users can update their own public assets
DROP POLICY IF EXISTS "Users can update own public assets" ON storage.objects;
CREATE POLICY "Users can update own public assets"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'public-assets'
    AND auth.uid()::text = (storage.foldername(name))[3]
);

-- Users can delete their own public assets
DROP POLICY IF EXISTS "Users can delete own public assets" ON storage.objects;
CREATE POLICY "Users can delete own public assets"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'public-assets'
    AND auth.uid()::text = (storage.foldername(name))[3]
);


-- ===== POLICIES: private-docs =====

-- Users can only view their own private docs
DROP POLICY IF EXISTS "Users can view own private docs" ON storage.objects;
CREATE POLICY "Users can view own private docs"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'private-docs'
    AND (
        auth.uid()::text = (storage.foldername(name))[3]
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    )
);

-- Authenticated users can upload private docs (folder must contain their user ID)
DROP POLICY IF EXISTS "Users can upload private docs" ON storage.objects;
CREATE POLICY "Users can upload private docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'private-docs'
    AND auth.uid()::text = (storage.foldername(name))[3]
);

-- Users can delete their own private docs
DROP POLICY IF EXISTS "Users can delete own private docs" ON storage.objects;
CREATE POLICY "Users can delete own private docs"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'private-docs'
    AND (
        auth.uid()::text = (storage.foldername(name))[3]
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    )
);


-- ==========================================
-- DEPLOYMENT COMPLETE!
-- ==========================================
-- 
-- Next steps:
-- 1. Set admin user: Run supabase/seeds/set_admin.sql
-- 2. Verify: Check Tables, Functions, and Policies in Supabase Dashboard
-- ==========================================
