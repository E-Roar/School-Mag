# Admin Login Debugging Guide

## Current Issue: Role is `undefined`

If you see this in the console:
```
User metadata: {app_metadata: {…}, user_metadata: {…}, raw_app_meta_data: undefined, role: undefined}
```

This means the role hasn't been set correctly in Supabase.

## Step-by-Step Fix

### 1. Get Your Exact Email

Make sure you know the EXACT email you're using to log in (case-sensitive).

### 2. Check Current Status

Run this in Supabase Dashboard > SQL Editor (replace with your email):

```sql
SELECT 
  email,
  raw_app_meta_data->>'role' as role,
  raw_user_meta_data->>'role' as user_role,
  raw_app_meta_data as full_app_meta,
  raw_user_meta_data as full_user_meta
FROM auth.users
WHERE email = 'your-email@example.com';
```

**What to look for:**
- If the query returns nothing → User doesn't exist
- If `role` and `user_role` are NULL → Role hasn't been set

### 3. Set Admin Role

Run this SQL (replace with your email):

```sql
-- Method 1: Using jsonb_set (recommended)
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

**If Method 1 doesn't work, try Method 2:**

```sql
-- Method 2: Direct assignment
UPDATE auth.users
SET raw_app_meta_data = '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';

UPDATE auth.users
SET raw_user_meta_data = '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

### 4. Verify Role Was Set

Run this again:

```sql
SELECT 
  email,
  raw_app_meta_data->>'role' as role,
  raw_user_meta_data->>'role' as user_role
FROM auth.users
WHERE email = 'your-email@example.com';
```

**You should see:**
```
email               | role  | user_role
your-email@example.com | admin | admin
```

### 5. Clear Browser State

**IMPORTANT:** After setting the role, you MUST:

1. **Sign out** from the admin panel (if logged in)
2. **Clear localStorage:**
   - Open DevTools (F12)
   - Go to Application > Local Storage
   - Clear all entries for your domain
3. **Clear sessionStorage:**
   - Same as above, but Session Storage
4. **Close ALL browser tabs** with your app open
5. **Open a fresh tab** (or incognito window)
6. **Try logging in again**

### 6. Check Browser Console

After logging in, open the browser console (F12) and look for:

```
📋 User metadata breakdown: {
  app_metadata: { role: "admin" },
  user_metadata: { role: "admin" },
  app_metadata_role: "admin",
  user_metadata_role: "admin",
  computed_role: "admin"
}
```

If you see `role: "admin"`, you're good! If not, continue troubleshooting.

## Troubleshooting

### Issue: SQL returns 0 rows updated

**Cause:** User doesn't exist with that email

**Fix:**
1. Check the exact email in Supabase Dashboard > Authentication > Users
2. Make sure email is spelled correctly (case-sensitive)
3. Check for typos or extra spaces

### Issue: Role shows NULL after UPDATE

**Cause:** The JSON structure might be different

**Fix:** Check what's actually in the metadata:

```sql
SELECT 
  email,
  raw_app_meta_data,
  raw_user_meta_data
FROM auth.users
WHERE email = 'your-email@example.com';
```

Then manually set it:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

### Issue: Role is set in DB but still undefined in client

**Cause:** JWT token hasn't refreshed

**Fix:**
1. Sign out completely
2. Clear ALL browser storage (localStorage, sessionStorage, cookies)
3. Close browser completely
4. Open fresh browser/incognito
5. Sign in again

### Issue: Still can't login

**Debug steps:**
1. Check browser console for the full user object
2. Share the console output showing:
   - `app_metadata` object
   - `user_metadata` object
   - `computed_role` value
3. Verify in Supabase Dashboard > Authentication > Users that the role is set

## Alternative: Test Without Role Check (Temporary)

If you need to test the admin panel immediately, you can temporarily bypass the role check:

1. Open `src/routes/AdminPage.jsx`
2. Find the line: `if (role === "admin") {`
3. Temporarily change to: `if (role === "admin" || user) {`

**⚠️ WARNING: Remove this after setting the role correctly!**

## Still Having Issues?

If none of this works:
1. Share the output from the SQL query showing what's in `raw_app_meta_data` and `raw_user_meta_data`
2. Share the browser console output showing the full user object
3. Verify you're using the correct email address in the SQL query

