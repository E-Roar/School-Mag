-- Simple script to set admin role for a user
-- Replace 'your-email@example.com' with your actual email

-- Set admin role in raw_app_meta_data (used by RLS policies and client SDK)
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- Also set in raw_user_meta_data (for client-side access via user_metadata)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- Verify the role was set
SELECT 
  email,
  raw_app_meta_data->>'role' as role,
  raw_user_meta_data->>'role' as user_role
FROM auth.users
WHERE email = 'your-email@example.com';

