-- Set admin role for a user
-- Replace 'your-email@example.com' with your actual email

-- Step 1: Set admin role in raw_app_meta_data (used by RLS policies)
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- Step 2: Also set in raw_user_meta_data (for client-side access)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- Step 3: Verify the role was set correctly
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as role_in_app_meta,
  raw_user_meta_data->>'role' as role_in_user_meta
FROM auth.users
WHERE email = 'your-email@example.com';

-- Alternative: Create a function to check admin role
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id
    AND (
      raw_app_meta_data->>'role' = 'admin'
      OR raw_user_meta_data->>'role' = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

