-- EMERGENCY RLS FIX
-- Run this in Supabase SQL Editor to completely reset access rights

-- 1. BOOKS TABLE
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Enable insert for admins" ON books;
DROP POLICY IF EXISTS "Enable delete for admins" ON books;
DROP POLICY IF EXISTS "Enable update for admins" ON books;
DROP POLICY IF EXISTS "Enable read access for all users" ON books;
DROP POLICY IF EXISTS "Admins can insert books" ON books;
DROP POLICY IF EXISTS "Admins can update books" ON books;
DROP POLICY IF EXISTS "Admins can delete books" ON books;
DROP POLICY IF EXISTS "Public can view books" ON books;
DROP POLICY IF EXISTS "Public can view published books" ON books;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON books;

-- Create simplified policies
-- Allow ANY authenticated user to do ANYTHING (for debugging/fixing)
-- We can tighten this later, but this will confirm if it's a role issue
CREATE POLICY "Allow Full Access to Authenticated Users" ON books
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Keep public read access
CREATE POLICY "Allow Public Read Access" ON books
FOR SELECT
TO anon
USING (true);


-- 2. PAGES TABLE
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Enable insert for admins" ON pages;
DROP POLICY IF EXISTS "Enable delete for admins" ON pages;
DROP POLICY IF EXISTS "Enable update for admins" ON pages;
DROP POLICY IF EXISTS "Enable read access for all users" ON pages;
DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
DROP POLICY IF EXISTS "Admins can update pages" ON pages;
DROP POLICY IF EXISTS "Admins can delete pages" ON pages;
DROP POLICY IF EXISTS "Public can view pages" ON pages;
DROP POLICY IF EXISTS "Allow Full Access to Authenticated Users" ON pages;

-- Create simplified policies
CREATE POLICY "Allow Full Access to Authenticated Users" ON pages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow Public Read Access" ON pages
FOR SELECT
TO anon
USING (true);
