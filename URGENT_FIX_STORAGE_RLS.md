# ⚠️ CRITICAL: Image Upload Failure - Storage RLS Policy Missing

## Date: 2025-11-22 (16:42)

## 🔴 **URGENT ACTION REQUIRED**

You're getting this error when uploading images:
```
StorageApiError: new row violates row-level security policy
```

**This means the Supabase Storage bucket "pages" doesn't have permission policies to allow uploads.**

---

## 🛠️ **HOW TO FIX (5 minutes)**

### **Step 1: Go to Supabase Dashboard**
1. Open your browser
2. Go to `https://supabase.com/dashboard`
3. Select your project: `iqiijwnxixnucpsatweq`

### **Step 2: Verify Bucket Exists**
1. Click on **Storage** in the left sidebar
2. Look for a bucket named **"pages"**
3. If it doesn't exist:
   - Click "New Bucket"
   - Name it "pages"
   - Toggle "Public bucket" to ON
   - Click "Create Bucket"

### **Step 3: Run SQL to Fix Permissions**
1. Click on **SQL Editor** in the left sidebar
2. Click "New Query"
3. Copy and paste the contents of this file:
   ```
   supabase/FIX_STORAGE_RLS_COMPLETE.sql
   ```
4. Click **RUN** (bottom right)
5. Wait for success message

### **Step 4: Test Upload**
1. Go back to your admin panel: `http://localhost:5173/admin`
2. Select an issue
3. Try uploading an image to a page
4. **It should work now!**

---

## 📋 **What the SQL Script Does**

The script creates 4 policies:

1. **Admin upload to pages** - Allows authenticated users to INSERT (upload) files
2. **Admin update pages** - Allows authenticated users to UPDATE files
3. **Admin delete from pages** - Allows authenticated users to DELETE files  
4. **Public read pages** - Allows EVERYONE to READ (view) files

---

## ✅ **After You Run the SQL**

### Expected Results:
- ✅ Image uploads work
- ✅ No more "row violates row-level security policy" errors
- ✅ 3D book displays uploaded images correctly
- ✅ Public users can see book pages (because bucket is public)

### Verification:
```sql
-- Run this in SQL Editor to verify policies exist:
SELECT policyname, cmd 
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%pages%';
```

You should see 4 rows:
- Admin upload to pages (INSERT)
- Admin update pages (UPDATE)
- Admin delete from pages (DELETE)
- Public read pages (SELECT)

---

## 🐛 **Additional Fixes Applied to Code**

While you fix the Storage RLS, I've also improved the code:

### **1. Better Error Handling** (`BookDataContext.jsx`)
- Upload errors now properly throw instead of silently failing
- Prevents invalid URLs from being added to cache
- Shows clear error messages in browser

### **2. Fixed Controlled Input Warning** (`Dashboard.jsx`)
- All form inputs now use `?? ""` instead of allowing undefined
- Prevents React warnings about controlled/uncontrolled inputs

---

## 🆘 **Troubleshooting**

### If uploads still fail after running SQL:

**Issue**: Bucket doesn't exist
**Solution**: 
1. Go to Storage
2. Create bucket named "pages"
3. Make it public
4. Run SQL again

**Issue**: You're not logged in
**Solution**:
1. Make sure you're logged into admin panel
2. Check browser console for auth errors

**Issue**: RLS policies didn't apply
**Solution**:
1. Check SQL Editor for error messages
2. Try running each policy creation individually
3. Check if policies already exist (drop them first)

---

## 📄 **Files Changed** (Already Applied)

1. **`supabase/FIX_STORAGE_RLS_COMPLETE.sql`** ← Run this in Supabase!  
2. **`src/context/BookDataContext.jsx`** - Better upload error handling
3. **`src/components/Dashboard.jsx`** - Fixed controlled input warnings

---

## 🎯 **Bottom Line**

**YOU MUST DO THIS:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run `supabase/FIX_STORAGE_RLS_COMPLETE.sql`
4. Test image upload in admin panel

**Without this, image uploads will continue to fail!**

The code is ready, but Supabase storage permissions need to be configured on your end.
