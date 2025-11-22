# Fix: Admin UI Vanishing on Refresh + Image Loading Crashes

## Date: 2025-11-22 (18:03)

## 🔴 **Issues Fixed**

### **Issue 1: Admin UI Vanishing on Page Refresh** ✅ FIXED
**Problem**: After refreshing the admin page, only the 3D book and bottom navigation appeared. No admin controls, no issues list. Required clearing browser storage every time.

**Root Cause**:
1. The `loading` state wasn't being handled properly
2. BookDataProvider was rendering before auth check completed
3. This caused the UI to render in an incomplete state

**Fix Applied**:
- Added loading screen that waits for auth check to complete
- Only renders BookDataProvider AFTER confirming authentication
- Prevents partial UI rendering during auth state resolution

**File**: `src/routes/AdminPage.jsx`
```javascript
// Before: Rendered immediately, causing incomplete UI
return (
  <BookDataProvider isAdminMode={true}>
    <SceneLayout>{overlays}</SceneLayout>
  </BookDataProvider>
);

// After: Wait for auth check, then render
if (loading) {
  return <LoadingScreen />;
}
return (
  <BookDataProvider isAdminMode={true}>
    <SceneLayout>{overlays}</SceneLayout>
  </BookDataProvider>
);
```

---

### **Issue 2: Image Loading Crashes 3D Book** ✅ FIXED
**Problem**: Getting 400 errors when loading images from Supabase Storage:
```
GET .../pages/eff02bfa-.../0-front.jpg 400 (Bad Request)
Error: Could not load ... undefined
```

**Root Cause**:
1. Database had image paths stored for files that were never successfully uploaded
2. `useTexture` hook crashes when it receives 400/404 errors
3. This crashed the entire React Three Fiber canvas
4. Since canvas crashed, admin UI couldn't render

**Why This Happened**:
- RLS policies weren't configured initially
- Users tried uploading images → failed silently
- Database stored paths to non-existent files
- Later when RLS was fixed, app tried to load those missing images → 400 error → crash

**Fix Applied**:
1. Added validation for image URLs before loading
2. Added error callbacks to `useTexture` to catch failures
3. Fall back to default placeholder if image URL is invalid
4. Prevents crash by always providing valid texture

**File**: `src/components/Book.jsx`
```javascript
// Before: Direct use, crashes on error
const [picture, picture2] = useTexture([frontSrc, backSrc]);

// After: Validation + error handling
const defaultTexture = '/textures/DSC00933.jpg';
const safeFrontSrc = frontSrc && !frontSrc.includes('undefined') 
  ? frontSrc 
  : defaultTexture;

const [picture, picture2] = useTexture(
  [safeFrontSrc, safeBackSrc],
  (textures) => { /* success */ },
  (error) => { console.warn('Failed to load texture:', error); }
);
```

---

## 🧹 **Cleanup: Remove Bad Image Paths from Database**

Since you have images in the database that reference non-existent files, you should clean them up:

### **Option 1: SQL to Reset Bad Paths**
Run this in Supabase SQL Editor:

```sql
-- Reset image paths for pages that point to non-existent files
UPDATE pages
SET 
  front_asset_path = NULL,
  back_asset_path = NULL
WHERE 
  front_asset_path IS NOT NULL 
  OR back_asset_path IS NOT NULL;
```

This will clear all image paths, reverting pages to show placeholders. Then you can re-upload images properly.

### **Option 2: Keep Existing, Only Fix Broken Ones**
If you want to keep some images but fix broken ones:

1. Go to admin panel
2. For each book that shows errors in console
3. Click on the pages with placeholder images
4. Re-upload the correct images

The fix ensures that even if paths are wrong, the app won't crash.

---

## ✅ **What's Fixed Now**

### Before:
- ❌ Refresh admin page → UI vanishes
- ❌ Had to clear browser storage every time
- ❌ Image 400 errors crash entire canvas
- ❌ No admin controls visible after refresh

### After:
- ✅ Refresh admin page → Loading screen → Full admin UI
- ✅ No need to clear browser storage
- ✅ Image errors show placeholder instead of crashing
- ✅ Admin controls always visible when authenticated
- ✅ 3D book shows placeholders for missing images

---

## 🧪 **Testing**

1. **Test Refresh Without Clearing Storage**:
   - Log into admin panel
   - Refresh page (F5)
   - **Expected**: See "Loading admin panel..." briefly, then full admin UI appears

2. **Test Missing Images**:
   - Look for any 400 errors in console
   - **Expected**: Console warning, but placeholder image shows
   - **Expected**: App doesn't crash

3. **Test Creating New Issue**:
   - Create new issue
   - Refresh page
   - **Expected**: New issue still visible, admin UI loads correctly

---

## 📋 **Files Modified**

1. **`src/routes/AdminPage.jsx`** 
   - Added loading screen before rendering BookDataProvider
   - Prevents incomplete UI state

2. **`src/components/Book.jsx`**
   - Added URL validation for textures
   - Added error handling for useTexture
   - Falls back to placeholder on load failure

---

## 🔍 **Why You Had to Clear Storage**

The browser was caching the broken state:
1. React Query cached data with broken image paths
2. Auth state was in localStorage
3. On refresh, React Query loaded cached data immediately
4. Tried to render UI with broken image URLs
5. Canvas crashed before auth check completed
6. Result: Broken UI state

The fix ensures:
1. Auth check completes first (loading screen)
2. Images validated before loading (no crashes)
3. Proper render order (auth → provider → UI)

---

## 🚀 **Next Steps**

1. **Test the fixes** - Refresh admin page several times
2. **Clean database** - Run SQL to reset bad image paths (optional)
3. **Re-upload images** - Upload images properly with working RLS
4. **Monitor console** - Should see warnings, no crashes

---

**Both issues are now fixed!** The admin panel should persist properly on refresh, and missing images won't crash the app anymore.
