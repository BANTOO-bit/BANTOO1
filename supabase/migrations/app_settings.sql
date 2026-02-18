-- ==========================================
-- APP SETTINGS TABLE
-- Key-value store for admin-configurable settings
-- ==========================================

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed for delivery fee calc, operating hours check, etc.)
DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;
CREATE POLICY "Anyone can read app settings"
ON public.app_settings FOR SELECT TO public
USING (true);

-- Only admin can insert/update/delete settings
DROP POLICY IF EXISTS "Admin can manage settings" ON public.app_settings;
CREATE POLICY "Admin can manage settings"
ON public.app_settings FOR ALL TO authenticated
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- SEED DEFAULT SETTINGS
-- ==========================================
INSERT INTO public.app_settings (key, value) VALUES
    ('operational', '{
        "service_radius_km": 10,
        "open_time": "08:00",
        "close_time": "21:00",
        "cod_balance_limit": 200000
    }'::jsonb),
    ('financial', '{
        "commission_percent": 10,
        "base_delivery_fare": 8000,
        "parking_fee": 2000,
        "cod_admin_fee": 0
    }'::jsonb),
    ('bank', '{
        "bank_name": "BCA",
        "account_number": "",
        "account_holder": ""
    }'::jsonb),
    ('admin_profile', '{
        "full_name": "",
        "whatsapp": "",
        "office_address": "",
        "office_lat": -6.2088,
        "office_lng": 106.8456
    }'::jsonb)
ON CONFLICT (key) DO NOTHING;
