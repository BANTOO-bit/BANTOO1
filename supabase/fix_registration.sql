-- ==========================================
-- BANTOO - FIX REGISTRATION TRIGGER
-- Run this in Supabase SQL Editor to fix registration
-- ==========================================

-- Fix: The trigger was reading NEW.phone (null) and NEW.email (pseudo-email)
-- instead of reading from raw_user_meta_data where authService stores them.

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
        v_email,
        v_phone,
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

-- Also clean up any orphan auth users from failed registrations
-- (users in auth.users but no profile created)
-- You can check in Authentication > Users in Supabase Dashboard
-- and delete any users that were created during failed registration attempts.

-- DONE! Now try registering again.
