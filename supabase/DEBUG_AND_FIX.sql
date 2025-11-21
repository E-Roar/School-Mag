-- DEBUG AND FIX: Admin Role Setup
-- Replace 'YOUR_EMAIL_HERE' with your actual email address

-- Step 1: Check current user status
SELECT 
  id,
  email,
  created_at,
  raw_app_meta_data,
  raw_user_meta_data,
  raw_app_meta_data->>'role' as role_from_raw_app,
  raw_user_meta_data->>'role' as role_from_raw_user
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 2: If user exists, set admin role in BOTH places
-- IMPORTANT: Replace 'YOUR_EMAIL_HERE' with your actual email before running

-- Set in raw_app_meta_data (this is what RLS policies use and what client sees as app_metadata)
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'YOUR_EMAIL_HERE';

-- Set in raw_user_meta_data (this is what client sees as user_metadata)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 3: Verify it worked - should show 'admin' for both
SELECT 
  email,
  raw_app_meta_data->>'role' as role_in_app_meta,
  raw_user_meta_data->>'role' as role_in_user_meta,
  raw_app_meta_data as full_app_meta,
  raw_user_meta_data as full_user_meta
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 4: Alternative - Set role using direct JSON assignment (if above doesn't work)
-- Uncomment and run this if the jsonb_set approach doesn't work:
/*
UPDATE auth.users
SET raw_app_meta_data = '{"role": "admin"}'::jsonb
WHERE email = 'YOUR_EMAIL_HERE';

UPDATE auth.users
SET raw_user_meta_data = '{"role": "admin"}'::jsonb
WHERE email = 'YOUR_EMAIL_HERE';
*/

