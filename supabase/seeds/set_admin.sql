-- ============================================================
-- Set user as admin by email
-- Run this AFTER creating the user in Authentication > Users
-- ============================================================

-- 1. Update profile role to admin
UPDATE public.profiles
SET 
    role = 'admin',
    active_role = 'admin',
    full_name = 'Admin BANTOO',
    updated_at = NOW()
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'projectnariswara@gmail.com'
    LIMIT 1
);

-- 2. Verify the admin was set correctly
SELECT id, full_name, email, phone, role, active_role 
FROM public.profiles 
WHERE role = 'admin';
