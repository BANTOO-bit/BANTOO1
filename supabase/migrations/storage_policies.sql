-- ==========================================
-- STORAGE POLICIES for public-assets & private-docs
-- Run this in Supabase SQL Editor to enable file uploads
-- ==========================================

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

-- Users can only view their own private docs (+ admin)
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

-- Users can delete their own private docs (+ admin)
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
