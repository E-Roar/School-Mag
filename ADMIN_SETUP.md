# Admin Login Setup Guide

## Issue: Can't Login as Admin

If you're unable to login to the admin dashboard, follow these steps:

## Step 1: Set Admin Role in Supabase

### Method A: Via SQL Editor (Recommended)

1. Open Supabase Dashboard > SQL Editor
2. Run this SQL (replace with your email):

```sql
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- Verify it was set
SELECT 
  email,
  raw_app_meta_data->>'role' as role,
  app_metadata->>'role' as app_metadata_role
FROM auth.users
WHERE email = 'your-email@example.com';
```

### Method B: Via Supabase Dashboard

1. Go to **Authentication > Users**
2. Click on your user
3. Click **Edit User**
4. Under **User Metadata**, add:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save

**Note:** After setting the role, you may need to:
- Sign out completely
- Clear browser cache/localStorage
- Sign in again

## Step 2: Verify Role is Set

After setting the role, check the browser console when logging in. You should see:

```
User metadata: {
  app_metadata: { role: "admin" },
  user_metadata: { ... },
  role: "admin"
}
```

## Step 3: Troubleshooting

### Error: "Access denied. Admin role required. Current role: none"

This means the role wasn't set correctly. Try:

1. **Check SQL was run correctly** - Make sure the UPDATE query returned 1 row
2. **Try setting both locations**:

```sql
-- Set in raw_app_meta_data (for RLS policies)
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- Also set in user_metadata (for client access)
UPDATE auth.users
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

3. **Sign out and clear localStorage**:
   - Open browser DevTools > Application > Local Storage
   - Clear all entries for your domain
   - Close and reopen browser
   - Try logging in again

### Error: "Invalid credentials"

1. Double-check email and password
2. Make sure user exists in Supabase Auth
3. Check Supabase Dashboard > Authentication > Users

### Still Not Working?

1. Open browser console (F12)
2. Try logging in
3. Look for the "User metadata:" log - it shows what role was found
4. Share that info to debug further

## Alternative: Temporary Bypass for Testing

If you need to test immediately, you can temporarily modify the check in `src/routes/AdminPage.jsx`:

```javascript
// TEMPORARY: Allow any authenticated user (for testing only!)
if (role === "admin" || user) {
  setIsAuthed(true);
}
```

**⚠️ Remember to remove this after setting the role correctly!**

