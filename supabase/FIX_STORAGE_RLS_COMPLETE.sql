-- COMPLETE STORAGE FIX - Run this in Supabase SQL Editor
-- Fixes: "new row violates row-level security policy" error when uploading images

-- ==========================================
-- STEP 1: ENSURE PAGES BUCKET EXISTS
-- ==========================================

-- First, verify the pages bucket exists and is public
-- Run this query to check:
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'pages';

-- If the bucket doesn't exist, you MUST create it manually:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New Bucket"
-- 3. Name it "pages"
-- 4. Toggle "Public bucket" to ON
-- 5. Set file size limit (e.g., 50MB)
-- 6. Set allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- 7. Click "Create Bucket"

-- If bucket exists but isn't public, update it:
UPDATE storage.buckets 
SET public = true 
WHERE name = 'pages';

-- ==========================================
-- STEP 2: ENABLE RLS ON STORAGE.OBJECTS
-- ==========================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 3: DROP EXISTING POLICIES (CLEAN SLATE)
-- ==========================================

-- Drop all existing policies for pages bucket to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to pages bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update pages bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from pages bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public users can read pages bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload to pages" ON storage.objects;
DROP POLICY IF EXISTS "Admin update pages" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete from pages" ON storage.objects;
DROP POLICY IF EXISTS "Public read pages" ON storage.objects;

-- ==========================================
-- STEP 4: CREATE NEW RLS POLICIES
-- ==========================================

-- Policy 1: Allow authenticated users to INSERT (upload) files
CREATE POLICY "Admin upload to pages"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pages' AND
  auth.uid() IS NOT NULL
);

-- Policy 2: Allow authenticated users to UPDATE files  
CREATE POLICY "Admin update pages"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pages' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'pages' AND auth.uid() IS NOT NULL);

-- Policy 3: Allow authenticated users to DELETE files
CREATE POLICY "Admin delete from pages"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pages' AND auth.uid() IS NOT NULL);

-- Policy 4: Allow EVERYONE (including anonymous) to READ files
-- This is crucial for public access to book pages
CREATE POLICY "Public read pages"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pages');

-- ==========================================
-- STEP 5: VERIFY POLICIES WERE CREATED
-- ==========================================

-- Run this to see all policies on storage.objects for the pages bucket:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname LIKE '%pages%' OR policyname LIKE '%Admin%' OR policyname LIKE '%Public%');

-- You should see 4 policies:
-- 1. Admin upload to pages (FOR INSERT)
-- 2. Admin update pages (FOR UPDATE) 
-- 3. Admin delete from pages (FOR DELETE)
-- 4. Public read pages (FOR SELECT)

-- ==========================================
-- STEP 6: TEST THE SETUP
-- ==========================================

-- After running this script:
-- 1. Go to your admin panel
-- 2. Select an issue
-- 3. Try uploading an image to a page
-- 4. It should now work without errors!

-- ==========================================
-- TROUBLESHOOTING
-- ==========================================

-- If uploads still fail, check:

-- 1. Is the bucket really public?
SELECT name, public FROM storage.buckets WHERE name = 'pages';
-- Should return: public = true

-- 2. Are you logged in as an authenticated user?
SELECT auth.uid();
-- Should return your user UUID, not null

-- 3. Check storage.objects permissions
SELECT * FROM storage.objects WHERE bucket_id = 'pages' LIMIT 5;
-- Should list any existing files

-- 4. Test insert permission manually
-- This should NOT return an error if policies are correct:
-- (Don't actually run this, just for reference)
-- SELECT policy_name FROM storage.objects WHERE bucket_id = 'pages';

-- ==========================================
-- SUCCESS!
-- ==========================================

-- If you see no errors above, your storage RLS is now configured!
-- The "new row violates row-level security policy" error should be gone.

COMMIT;
