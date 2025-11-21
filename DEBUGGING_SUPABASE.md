# Supabase Issues Debugging Guide

## 🔍 Current Status

You're experiencing issues where you **cannot create new issues** and **cannot edit existing ones**, with **no browser errors** appearing.

I've just pushed an update with **comprehensive error handling** that will now:
- ✅ Catch all mutation errors
- ✅ Display error alerts to the user
- ✅ Log detailed error information to the browser console

## 📋 Next Steps to Diagnose

### **Step 1: Test with New Error Handling**

1. **Open your live site** (after Vercel deploys): https://school-mag.vercel.app/admin
2. **Open Browser DevTools** (F12 or Right-click → Inspect)
3. **Go to Console tab**
4. **Try to create a new issue** - Click "+ Create New Issue"
5. **Look for**:
   - Alert popup with error message
   - Red error logs in console starting with "Error creating new book:"
   - Detailed error object showing `message`, `code`, `details`, `hint`

### **Step 2: Check Common Issues**

#### **A. RLS (Row Level Security) Policy Issues**

If you see errors like:
- `"new row violates row-level security policy"`
- `"permission denied"`
- `403 Forbidden`

**Solution:** Run the emergency RLS fix:
```sql
-- In Supabase Dashboard > SQL Editor, run:
-- c:\Users\Glitcher\Desktop\devtest\New folder\r3f-animated-book-slider-final\supabase\EMERGENCY_FIX.sql
```

#### **B. Missing Required Columns**

If you see errors like:
- `"null value in column ... violates not-null constraint"`
- `"invalid input value for column"`

**Solution:** Check if these columns exist and have correct constraints:
```sql
-- In Supabase Dashboard > SQL Editor:
SELECT column_name, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'books';
```

#### **C. Role/Authentication Issues**

If you see:
- `"User does not have admin role"`
- Authentication-related errors

**Solution:** Verify your admin role is set:
```sql
-- Check current user role:
SELECT email, raw_app_meta_data, raw_user_meta_data 
FROM auth.users 
WHERE email = 'YOUR_EMAIL_HERE';

-- If role is missing, set it:
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb), 
  '{role}', 
  '"admin"'
) 
WHERE email = 'YOUR_EMAIL_HERE';
```

---

## 🛠️ Troubleshooting Checklist

Run through these in order:

### ✅ **1. Check Environment Variables**
Open your `.env` file and verify:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

### ✅ **2. Check Network Tab**
1. Open DevTools → Network tab
2. Try creating a new issue
3. Look for requests to Supabase
4. Check the **Status Code** and **Response**:
   - `200 OK` = Success
   - `400 Bad Request` = Invalid data
   - `403 Forbidden` = RLS policy blocking
   - `500 Server Error` = Database issue

### ✅ **3. Check Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Database** → **Tables** → View `books` table
4. Try to **manually insert** a row to test if database works

### ✅ **4. Check Browser Console**
Look for any errors mentioning:
- `Supabase`
- `RLS`
- `INSERT`
- `UPDATE`
- `Permission denied`

---

## 🔧 Quick Fixes

### **Fix 1: Reset RLS Policies** (Most Common)
```sql
-- File: supabase/EMERGENCY_FIX.sql
-- This gives ALL authenticated users full access (temporary for debugging)

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Full Access to Authenticated Users" ON books;
CREATE POLICY "Allow Full Access to Authenticated Users" ON books
FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Full Access to Authenticated Users" ON pages;
CREATE POLICY "Allow Full Access to Authenticated Users" ON pages
FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

### **Fix 2: Check Table Schema**
```sql
-- Verify books table structure:
\d books

-- Should have these columns:
-- id (uuid, primary key)
-- title (text)
-- slug (text)
-- subtitle (text)
-- issue_tag (text)
-- release_date (date)
-- visual_settings (jsonb)
-- is_published (boolean)
```

### **Fix 3: Verify Supabase Configuration**
In your browser console, run:
```javascript
console.log('Supabase configured:', window.location.origin);
// Should see your Supabase URL
```

---

## 📊 What the Error Messages Mean

| Error Message | Likely Cause | Solution |
|--------------|--------------|----------|
| `"new row violates row-level security"` | RLS blocking INSERT | Run EMERGENCY_FIX.sql |
| `"null value in column ... not-null"` | Missing required field | Check schema, add default value |
| `"Supabase not configured"` | Missing env variables | Check `.env` file |
| `"invalid UUID"` | Trying to edit default books | Can only edit Supabase books |
| `"Failed to fetch"` | Network/CORS issue | Check Supabase URL, disable firewall |

---

## 🎯 Expected Behavior After Fix

Once fixed, you should see:
1. ✅ **Create New Issue** → Alert: "New issue created!" → Issue appears in list
2. ✅ **Edit Issue** → Changes save instantly → No errors
3. ✅ **Delete Issue** → Confirmation → Issue removed from list
4. ✅ **Console** → Clean, no red errors

---

## 📝 Report Template

If issues persist, share this info:

```
**Error Message:**
[Paste the alert/console error here]

**Console Log:**
[Paste the error object from console]

**Network Response:**
[Paste the response from Network tab → Supabase request]

**User Email:**
[Your admin email]

**Supabase Project:**
[Your project URL from dashboard]
```

---

## 🚀 Next Actions for You

1. **Wait for Vercel deployment** (check https://vercel.com/dashboard)
2. **Visit admin page** with DevTools open
3. **Try to create a new issue**
4. **Check for the error alert** and console logs
5. **Share the error message** with me so I can help fix the root cause

The new error handling will tell us exactly what's wrong!

---

**Last Updated:** 2025-11-21 20:23 CET  
**Commit:** `d575c28` - Debug: Add comprehensive error handling
