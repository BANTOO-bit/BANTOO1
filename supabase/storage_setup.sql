-- ==========================================
-- BANTOO - STORAGE BUCKETS SETUP
-- Run this in Supabase SQL Editor AFTER migration_v2.sql
-- ==========================================

-- 1. CREATE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 2097152, -- 2 MB
     ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('menu-images', 'menu-images', true, 5242880, -- 5 MB
     ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('merchant-images', 'merchant-images', true, 5242880, -- 5 MB
     ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('documents', 'documents', false, 10485760, -- 10 MB (PRIVATE)
     ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('issue-evidence', 'issue-evidence', true, 5242880, -- 5 MB
     ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- 2. STORAGE POLICIES - PUBLIC BUCKETS
-- (avatars, menu-images, merchant-images, issue-evidence)
-- ==========================================

-- === AVATARS ===
CREATE POLICY "Avatar public read" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Avatar auth upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Avatar owner update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

CREATE POLICY "Avatar owner delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

-- === MENU IMAGES ===
CREATE POLICY "Menu images public read" ON storage.objects
    FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Menu images auth upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'menu-images' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Menu images owner update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'menu-images' AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

CREATE POLICY "Menu images owner delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'menu-images' AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

-- === MERCHANT IMAGES ===
CREATE POLICY "Merchant images public read" ON storage.objects
    FOR SELECT USING (bucket_id = 'merchant-images');

CREATE POLICY "Merchant images auth upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'merchant-images' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Merchant images owner update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'merchant-images' AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

CREATE POLICY "Merchant images owner delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'merchant-images' AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

-- === ISSUE EVIDENCE ===
CREATE POLICY "Issue evidence public read" ON storage.objects
    FOR SELECT USING (bucket_id = 'issue-evidence');

CREATE POLICY "Issue evidence auth upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'issue-evidence' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Issue evidence owner delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'issue-evidence' AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );


-- ==========================================
-- 3. STORAGE POLICIES - PRIVATE BUCKET
-- (documents: KTP, SIM, STNK - data sensitif)
-- ==========================================

-- Owner can view own documents
CREATE POLICY "Documents owner read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND (
            auth.uid()::TEXT = (storage.foldername(name))[1] OR
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        )
    );

-- Authenticated users upload to own folder
CREATE POLICY "Documents auth upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND 
        auth.role() = 'authenticated' AND
        auth.uid()::TEXT = (storage.foldername(name))[1]
    );

-- Owner can delete own documents
CREATE POLICY "Documents owner delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );


-- ==========================================
-- DONE! 🎉
-- ==========================================
-- Buckets created:
-- ✅ avatars       (public, 2MB, images only)
-- ✅ menu-images   (public, 5MB, images only)
-- ✅ merchant-images (public, 5MB, images only)
-- ✅ documents     (PRIVATE, 10MB, images + PDF)
-- ✅ issue-evidence (public, 5MB, images only)
--
-- File structure convention:
-- Each user uploads to their own folder: {bucket}/{user_id}/{filename}
-- This enables owner-based access control via storage.foldername()
