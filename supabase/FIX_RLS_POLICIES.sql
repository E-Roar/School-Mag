-- Fix RLS Policies for Books and Pages
-- Run this in Supabase SQL Editor

-- 1. Reset Policies for Books
DROP POLICY IF EXISTS "Enable insert for admins" ON books;
DROP POLICY IF EXISTS "Enable delete for admins" ON books;
DROP POLICY IF EXISTS "Enable update for admins" ON books;
DROP POLICY IF EXISTS "Enable read access for all users" ON books;
DROP POLICY IF EXISTS "Admins can insert books" ON books;
DROP POLICY IF EXISTS "Admins can update books" ON books;
DROP POLICY IF EXISTS "Admins can delete books" ON books;
DROP POLICY IF EXISTS "Public can view published books" ON books;

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can insert books" ON books
FOR INSERT WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' 
  OR 
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

CREATE POLICY "Admins can update books" ON books
FOR UPDATE USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' 
  OR 
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

CREATE POLICY "Admins can delete books" ON books
FOR DELETE USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' 
  OR 
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

CREATE POLICY "Public can view books" ON books
FOR SELECT USING (true);


-- 2. Reset Policies for Pages
DROP POLICY IF EXISTS "Enable insert for admins" ON pages;
DROP POLICY IF EXISTS "Enable delete for admins" ON pages;
DROP POLICY IF EXISTS "Enable update for admins" ON pages;
DROP POLICY IF EXISTS "Enable read access for all users" ON pages;

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can insert pages" ON pages
FOR INSERT WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' 
  OR 
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

CREATE POLICY "Admins can update pages" ON pages
FOR UPDATE USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' 
  OR 
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

CREATE POLICY "Admins can delete pages" ON pages
FOR DELETE USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' 
  OR 
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

CREATE POLICY "Public can view pages" ON pages
FOR SELECT USING (true);
