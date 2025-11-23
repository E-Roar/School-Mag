-- FIX PUBLIC ACCESS - Run this in Supabase SQL Editor

-- 1. Allow public (anonymous) users to view published books
DROP POLICY IF EXISTS "Public can view published books" ON books;

CREATE POLICY "Public can view published books"
ON books FOR SELECT
TO public
USING (is_published = true);

-- 2. Allow public (anonymous) users to view all pages
-- (We allow all pages because the application filters books by is_published, 
-- and pages are only accessed via books)
DROP POLICY IF EXISTS "Public can view pages" ON pages;

CREATE POLICY "Public can view pages"
ON pages FOR SELECT
TO public
USING (true);

-- 3. Verify policies
-- You can verify this by going to Authentication > Policies in Supabase Dashboard
