-- ==========================================
-- BANTOO FOOD DELIVERY - DATABASE SCHEMA (FIXED v2)
-- ==========================================

-- Enable PostGIS if available (for future use), but we use custom Haversine for now
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CLEANUP OLD VIEWS/TABLES IF NEEDED
DROP VIEW IF EXISTS public.menu_items CASCADE;

-- 1. PROFILES (Extends Supabase Auth)
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

-- 2. MERCHANTS
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
    distance NUMERIC(5, 2) DEFAULT 0, -- Static distance for now, dynamic in RPC
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

-- 3. MENU ITEMS
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

-- 4. DRIVERS
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type TEXT DEFAULT 'motorcycle',
    vehicle_plate TEXT,
    vehicle_brand TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'suspended')),
    is_active BOOLEAN DEFAULT FALSE, -- Online/Offline status
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROMOS
CREATE TABLE IF NOT EXISTS public.promos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'fixed' CHECK (type IN ('fixed', 'percentage')),
    value INTEGER NOT NULL, -- Amount or Percentage
    max_discount INTEGER, -- Cap for percentage
    min_order INTEGER DEFAULT 0,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id),
    merchant_id UUID REFERENCES public.merchants(id),
    driver_id UUID REFERENCES public.profiles(id), -- Points to profile for easier auth checks
    
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'processing', 'ready', 
        'pickup', 'picked_up', 'delivering', 'delivered', 
        'completed', 'cancelled'
    )),
    
    -- Financials
    subtotal INTEGER NOT NULL DEFAULT 0,
    delivery_fee INTEGER NOT NULL DEFAULT 0,
    service_fee INTEGER NOT NULL DEFAULT 0,
    discount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL DEFAULT 0,
    
    payment_method TEXT DEFAULT 'cod',
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    
    promo_id UUID REFERENCES public.promos(id),
    promo_code TEXT,
    
    -- Delivery Details
    delivery_address TEXT,
    delivery_detail TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_lat DOUBLE PRECISION,
    customer_lng DOUBLE PRECISION,
    notes TEXT,
    
    cancellation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.menu_items(id),
    product_name TEXT, -- Snapshot of name
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time INTEGER NOT NULL, -- Snapshot of price
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    balance INTEGER DEFAULT 0 CHECK (balance >= 0),
    pin TEXT, -- For withdrawal security
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TRANSACTIONS (Wallet History)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'earnings')),
    amount INTEGER NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    reference_id UUID, -- Can link to Order ID or Withdrawal ID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. WITHDRAWALS
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    amount INTEGER NOT NULL,
    bank_name TEXT,
    bank_account_name TEXT,
    bank_account_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    proof_image TEXT, -- Transfer proof
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- ADDITIONAL TABLES (from migration_v2)
-- ==========================================

-- 11. USER ROLES (Multi-role support)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'merchant', 'driver', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 12. ADDRESSES (User saved delivery addresses)
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

-- 13. REVIEWS (Order ratings & reviews)
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

-- 14. NOTIFICATIONS (In-app notifications)
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

-- 15. ISSUES (Order complaints/reports)
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
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 1. PROFILES
-- ==========================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin update any profile" ON profiles;
CREATE POLICY "Admin update any profile" ON profiles FOR UPDATE USING (
    auth.uid() = id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- 2. MERCHANTS
-- ==========================================
DROP POLICY IF EXISTS "Merchants viewable by everyone" ON merchants;
CREATE POLICY "Merchants viewable by everyone" ON merchants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners insert merchant" ON merchants;
CREATE POLICY "Owners insert merchant" ON merchants FOR INSERT WITH CHECK (
    auth.uid() = owner_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Owners update own merchant" ON merchants;
DROP POLICY IF EXISTS "Admin update merchants" ON merchants;
CREATE POLICY "Admin update merchants" ON merchants FOR UPDATE USING (
    auth.uid() = owner_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admin delete merchants" ON merchants;
CREATE POLICY "Admin delete merchants" ON merchants FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- 3. MENU ITEMS
-- ==========================================
DROP POLICY IF EXISTS "Menu items viewable by everyone" ON menu_items;
CREATE POLICY "Menu items viewable by everyone" ON menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Merchants manage own menu" ON menu_items;
CREATE POLICY "Merchants manage own menu" ON menu_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM merchants WHERE id = menu_items.merchant_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Merchants update own menu" ON menu_items;
CREATE POLICY "Merchants update own menu" ON menu_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM merchants WHERE id = menu_items.merchant_id AND owner_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Merchants delete own menu" ON menu_items;
DROP POLICY IF EXISTS "Admin delete menu items" ON menu_items;
CREATE POLICY "Admin delete menu items" ON menu_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM merchants WHERE id = menu_items.merchant_id AND owner_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- 4. DRIVERS
-- ==========================================
DROP POLICY IF EXISTS "Drivers viewable by everyone" ON drivers;
CREATE POLICY "Drivers viewable by everyone" ON drivers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can apply as driver" ON drivers;
CREATE POLICY "Users can apply as driver" ON drivers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Drivers update own record" ON drivers;
DROP POLICY IF EXISTS "Admins can update drivers" ON drivers;
CREATE POLICY "Drivers update own record" ON drivers FOR UPDATE USING (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admin delete drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can delete drivers" ON drivers;
CREATE POLICY "Admin delete drivers" ON drivers FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- 5. ORDERS
-- ==========================================
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (
    auth.uid() = customer_id
    OR auth.uid() = driver_id
    OR (driver_id IS NULL AND status = 'ready')
    OR EXISTS (SELECT 1 FROM merchants WHERE id = orders.merchant_id AND owner_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Customers create orders" ON orders;
CREATE POLICY "Customers create orders" ON orders FOR INSERT WITH CHECK (
    auth.uid() = customer_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Order participants can update" ON orders;
CREATE POLICY "Order participants can update" ON orders FOR UPDATE USING (
    auth.uid() = customer_id
    OR auth.uid() = driver_id
    OR EXISTS (SELECT 1 FROM merchants WHERE id = orders.merchant_id AND owner_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admin delete orders" ON orders;
CREATE POLICY "Admin delete orders" ON orders FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- 6. ORDER ITEMS
-- ==========================================
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

DROP POLICY IF EXISTS "Merchants can update order items" ON order_items;
CREATE POLICY "Merchants can update order items" ON order_items FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM orders o
        JOIN merchants m ON m.id = o.merchant_id
        WHERE o.id = order_items.order_id AND m.owner_id = auth.uid()
    )
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- 7. WALLETS
-- ==========================================
DROP POLICY IF EXISTS "Users view own wallet" ON wallets;
CREATE POLICY "Users view own wallet" ON wallets FOR SELECT USING (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Users update own wallet" ON wallets;
CREATE POLICY "Users update own wallet" ON wallets FOR UPDATE USING (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "System insert wallets" ON wallets;
CREATE POLICY "System insert wallets" ON wallets FOR INSERT WITH CHECK (true);

-- ==========================================
-- 8. TRANSACTIONS
-- ==========================================
DROP POLICY IF EXISTS "Users view own transactions" ON transactions;
CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM wallets WHERE id = transactions.wallet_id AND user_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "System insert transactions" ON transactions;
CREATE POLICY "System insert transactions" ON transactions FOR INSERT WITH CHECK (true);

-- ==========================================
-- 9. WITHDRAWALS
-- ==========================================
DROP POLICY IF EXISTS "Users view own withdrawals" ON withdrawals;
CREATE POLICY "Users view own withdrawals" ON withdrawals FOR SELECT USING (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Users create withdrawals" ON withdrawals;
CREATE POLICY "Users create withdrawals" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin update withdrawals" ON withdrawals;
CREATE POLICY "Admin update withdrawals" ON withdrawals FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- 10. PROMOS
-- ==========================================
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

-- ==========================================
-- 11. USER ROLES
-- ==========================================
DROP POLICY IF EXISTS "Users view own roles" ON user_roles;
CREATE POLICY "Users view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin manage all roles" ON user_roles;
CREATE POLICY "Admin manage all roles" ON user_roles FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;

-- ==========================================
-- 12. ADDRESSES
-- ==========================================
DROP POLICY IF EXISTS "Users view own addresses" ON addresses;
CREATE POLICY "Users view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own addresses" ON addresses;
CREATE POLICY "Users insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own addresses" ON addresses;
CREATE POLICY "Users update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own addresses" ON addresses;
CREATE POLICY "Users delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 13. REVIEWS
-- ==========================================
DROP POLICY IF EXISTS "Reviews viewable by everyone" ON reviews;
CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers create reviews" ON reviews;
CREATE POLICY "Customers create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Merchants reply to reviews" ON reviews;
DROP POLICY IF EXISTS "Admin update reviews" ON reviews;
CREATE POLICY "Admin update reviews" ON reviews FOR UPDATE USING (
    EXISTS (SELECT 1 FROM merchants WHERE id = reviews.merchant_id AND owner_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admin delete reviews" ON reviews;
CREATE POLICY "Admin delete reviews" ON reviews FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- 14. NOTIFICATIONS
-- ==========================================
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System insert notifications" ON notifications;
CREATE POLICY "System insert notifications" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own notifications" ON notifications;
CREATE POLICY "Users delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 15. ISSUES
-- ==========================================
DROP POLICY IF EXISTS "Users view own issues" ON issues;
CREATE POLICY "Users view own issues" ON issues FOR SELECT USING (
    auth.uid() = reporter_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Users create issues" ON issues;
CREATE POLICY "Users create issues" ON issues FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admin update issues" ON issues;
CREATE POLICY "Admin update issues" ON issues FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admin delete issues" ON issues;
CREATE POLICY "Admin delete issues" ON issues FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- RPC FUNCTIONS
-- ==========================================

-- 1. Helper: Calculate Distance (Haversine Formula)
-- Returns km
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
DECLARE
    R float := 6371; -- Earth radius in km
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

-- 2. Delivery Fee Calculation
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
    -- Get merchant location
    SELECT latitude, longitude INTO v_merchant_lat, v_merchant_lng
    FROM merchants WHERE id = p_merchant_id;
    
    IF v_merchant_lat IS NULL OR v_merchant_lng IS NULL THEN
        RETURN 8000; -- Default fallback
    END IF;
    
    -- Calculate distance
    v_distance := calculate_distance(v_merchant_lat, v_merchant_lng, p_user_lat, p_user_lng);
    
    -- Calculate fee: Base + (Dist * Price)
    -- First 2km strictly base fee? Or direct multiply? Let's do direct for simplicity + min fee.
    v_fee := v_base_fee + (v_distance * v_price_per_km);
    
    -- Round to nearest 1000 or 500
    v_fee := CEIL(v_fee / 500.0) * 500;
    
    -- Minimum fee 5000
    IF v_fee < 5000 THEN v_fee := 5000; END IF;
    
    RETURN v_fee;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Order (Transactional)
CREATE OR REPLACE FUNCTION create_order(
    p_merchant_id UUID,
    p_items JSONB, -- Array of objects: {menu_item_id, quantity, notes}
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
    
    -- 3. Validate Promo (Simplified)
    IF p_promo_code IS NOT NULL THEN
        SELECT id, value, type, max_discount INTO v_promo_id, v_discount, v_product_name, v_price -- reuse vars
        FROM promos 
        WHERE code = p_promo_code AND is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW());
        
        IF v_promo_id IS NOT NULL THEN
            IF v_product_name = 'percentage' THEN
                 v_discount := (v_subtotal * v_discount) / 100;
                 IF v_price IS NOT NULL AND v_discount > v_price THEN -- max_discount check
                    v_discount := v_price;
                 END IF;
            END IF;
        ELSE
            v_discount := 0; -- Invalid promo
        END IF;
    END IF;
    
    v_total := v_subtotal + v_delivery_fee + v_service_fee - v_discount;
    
    -- 4. Insert Order
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
    
    -- 5. Insert Order Items
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
    
    -- Return the created order
    RETURN (SELECT row_to_json(orders) FROM orders WHERE id = v_order_id);
END;
$$ LANGUAGE plpgsql;

-- 4. Admin Stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    v_total_orders INTEGER;
    v_active_cod INTEGER; -- Amount
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
    FROM orders WHERE status = 'completed';

    v_json := json_build_object(
        'total_orders', v_total_orders,
        'active_cod', v_active_cod,
        'online_drivers', v_online_drivers,
        'today_revenue', v_total_revenue
    );
    
    RETURN v_json;
END;
$$ LANGUAGE plpgsql;
