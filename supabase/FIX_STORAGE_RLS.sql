-- STORAGE RLS FIX - Run this in Supabase SQL Editor
-- This fixes the "new row violates row-level security policy" error when uploading images

-- ==========================================
-- STORAGE BUCKET POLICIES
-- ==========================================

-- 1. Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies for the pages bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to pages bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update pages bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from pages bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public users can read pages bucket" ON storage.objects;

-- 3. Create new policies for the pages bucket

-- Allow authenticated users to INSERT (upload) files to pages bucket
CREATE POLICY "Authenticated users can upload to pages bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pages');

-- Allow authenticated users to UPDATE files in pages bucket
CREATE POLICY "Authenticated users can update pages bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pages')
WITH CHECK (bucket_id = 'pages');

-- Allow authenticated users to DELETE files from pages bucket
CREATE POLICY "Authenticated users can delete from pages bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pages');

-- Allow public (anonymous) users to SELECT (read) files from pages bucket
CREATE POLICY "Public users can read pages bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pages');

-- ==========================================
-- VERIFY BUCKET EXISTS AND IS PUBLIC
-- ==========================================

-- Make sure the pages bucket exists and is public
-- You may need to create it manually in Supabase Dashboard > Storage if it doesn't exist

-- To verify, run this query:
SELECT id, name, public 
FROM storage.buckets 
WHERE name = 'pages';

-- If the bucket doesn't exist or isn't public, you need to:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a bucket named 'pages'
-- 3. Make it public
-- 4. Then run this SQL script

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

-- If you see no errors, the RLS policies are now set!
-- Try uploading an image again in your admin panel.
