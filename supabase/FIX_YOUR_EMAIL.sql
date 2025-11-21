-- FIX FOR: e.roar.morocco@gmail.com
-- This script sets admin role for your specific email

-- Step 1: Check current status
SELECT 
  email,
  raw_app_meta_data->>'role' as role,
  raw_user_meta_data->>'role' as user_role,
  raw_app_meta_data,
  raw_user_meta_data
FROM auth.users
WHERE email = 'e.roar.morocco@gmail.com';

-- Step 2: Set admin role
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'e.roar.morocco@gmail.com';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'e.roar.morocco@gmail.com';

-- Step 3: Verify it worked (should show 'admin' for both)
SELECT 
  email,
  raw_app_meta_data->>'role' as role,
  raw_user_meta_data->>'role' as user_role
FROM auth.users
WHERE email = 'e.roar.morocco@gmail.com';

-- If the above doesn't work, try this alternative approach:
-- UPDATE auth.users
-- SET raw_app_meta_data = '{"role": "admin"}'::jsonb
-- WHERE email = 'e.roar.morocco@gmail.com';
-- 
-- UPDATE auth.users
-- SET raw_user_meta_data = '{"role": "admin"}'::jsonb
-- WHERE email = 'e.roar.morocco@gmail.com';

