-- QUICK FIX: Set admin role
-- Replace 'YOUR_EMAIL_HERE' with your actual email address

-- Update raw_app_meta_data (required for RLS policies)
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'YOUR_EMAIL_HERE';

-- Update raw_user_meta_data (for client access)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'YOUR_EMAIL_HERE';

-- Verify it worked (should show 'admin' for both)
SELECT 
  email,
  raw_app_meta_data->>'role' as role,
  raw_user_meta_data->>'role' as user_role
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE';

-- IMPORTANT: After running this, you need to:
-- 1. Sign out completely from the admin panel
-- 2. Clear browser localStorage (F12 > Application > Local Storage > Clear)
-- 3. Sign in again with your email/password

