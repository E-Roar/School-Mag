# 🔧 URGENT FIX: Storage Upload Error

## 🎯 The Problem

**Error:** `StorageApiError: new row violates row-level security policy`

This error occurs when trying to upload images because **Supabase Storage RLS policies** are not configured for the `pages` bucket.

---

## ✅ SOLUTION (Step-by-Step)

### **Step 1: Go to Supabase Dashboard**

1. Open https://supabase.com/dashboard
2. Select your project
3. Click on **Storage** in the left sidebar

### **Step 2: Create/Verify the `pages` Bucket**

**Check if the bucket exists:**
- Look for a bucket named `pages` in the list
- If it exists, click on it and check if it's **public**

**If the bucket doesn't exist, create it:**
1. Click **"New bucket"**
2. Name: `pages`
3. **Check** ✅ "Public bucket" (very important!)
4. Click **"Create bucket"**

### **Step 3: Set Up RLS Policies**

1. Click on **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy and paste the entire contents of:
   ```
   supabase/FIX_STORAGE_RLS.sql
   ```
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: **"Success. No rows returned"**

### **Step 4: Verify the Fix**

1. Go back to your admin page: https://school-mag.vercel.app/admin
2. Try uploading an image again
3. ✅ It should work now!

---

## 📋 What the SQL Script Does

The script:
1. ✅ Enables RLS on the `storage.objects` table
2. ✅ Drops any conflicting policies
3. ✅ Creates **4 new policies**:
   - `INSERT` - Authenticated users can upload
   - `UPDATE` - Authenticated users can replace images
   - `DELETE` - Authenticated users can remove images
   - `SELECT` - Public can view images

---

## 🚨 If You Still Get Errors

### **Error: "bucket does not exist"**
**Solution:** You need to create the `pages` bucket first (Step 2 above)

### **Error: "permission denied for schema storage"**
**Solution:** Make sure you're running the SQL as the database owner (should work by default in SQL Editor)

### **Error: "bucket is not public"**
**Solution:** 
1. Go to **Storage** > Click on `pages` bucket
2. Click ⚙️ **Settings**
3. Check ✅ **"Public bucket"**
4. Click **Save**

---

## 🎯 Quick Test

After running the fix, test with this:

1. **Login to admin** (if not already)
2. **Select an issue** from the issue picker
3. **Open the Dashboard** (+ button on right)
4. **Click "Pages & Spreads"**
5. **Upload an image** to any page
6. ✅ **Should upload successfully** and show immediately

---

## 📝 Alternative: Manual Policy Creation

If the SQL script doesn't work, you can create policies manually:

1. Go to **Storage** > Click `pages` bucket
2. Click **Policies** tab
3. Click **"New policy"**
4. Create these 4 policies:

**Policy 1: Upload**
- Name: `Authenticated users can upload`
- Policy command: `INSERT`
- Target roles: `authenticated`
- WITH CHECK: `bucket_id = 'pages'`

**Policy 2: Update**
- Name: `Authenticated users can update`
- Policy command: `UPDATE`
- Target roles: `authenticated`
- USING: `bucket_id = 'pages'`
- WITH CHECK: `bucket_id = 'pages'`

**Policy 3: Delete**
- Name: `Authenticated users can delete`
- Policy command: `DELETE`
- Target roles: `authenticated`
- USING: `bucket_id = 'pages'`

**Policy 4: Public Read**
- Name: `Public can read`
- Policy command: `SELECT`
- Target roles: `anon`, `authenticated`
- USING: `bucket_id = 'pages'`

---

## ✅ Expected Result

After the fix:
- ✅ Image uploads work instantly
- ✅ No more "row-level security" errors
- ✅ Images appear immediately in the 3D viewer
- ✅ No page reloads or blank screens

---

## 📞 Need Help?

If you still see errors after running the script, share:
1. The exact error message from the browser console
2. A screenshot of your Storage > pages bucket settings
3. The result of running this query in SQL Editor:
   ```sql
   SELECT * FROM storage.buckets WHERE name = 'pages';
   ```

---

**Last Updated:** 2025-11-21 20:33 CET
