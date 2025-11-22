# Quick Test Plan - Admin Panel Fixes

## Before Testing
The dev server should already be running on `http://localhost:5173`
All changes have been applied and Vite HMR should have reloaded the modules.

---

## Test 1: Create New Issue
**Expected Outcome**: New issue appears and stays visible

### Steps:
1. Navigate to `http://localhost:5173/admin`
2. Login with admin credentials
3. Click the "Edit Issues" button (top left)
4. Click "+ Create New Issue"
5. Confirm the dialog

### ✅ Success Criteria:
- New book titled "New Issue" appears in the issues list
- The issue picker remains open
- The new issue is automatically selected
- The right panel shows "Editing: New Issue"
- The issue does NOT disappear

### ❌ Previous Behavior:
- Book would appear briefly then vanish
- Right panel would show "No issue selected"

---

## Test 2: Edit Book Metadata
**Expected Outcome**: Changes persist without reverting

### Steps:
1. Select any issue from the list
2. Expand "Issue Settings" section
3. Change the title to something like "Test Title Update"
4. Change subtitle, issue tag, or date
5. Wait 2-3 seconds
6. Click "💾 Save All Changes" (optional)

### ✅ Success Criteria:
- Changes remain in the input fields
- Changes do NOT revert back to original values
- The issue picker shows the updated title
- Save button shows "✓ Saved Successfully"

### ❌ Previous Behavior:
- Changes would revert back after typing
- Edits would not persist

---

## Test 3: Edit Visual Settings
**Expected Outcome**: Real-time visual updates

### Steps:
1. Select any issue
2. Expand "Backdrop & Marquee" section
3. Change gradient colors
4. Modify marquee text
5. Adjust float intensity slider

### ✅ Success Criteria:
- Background gradient updates immediately in 3D scene
- Marquee text changes appear in background
- Sliders show correct values
- Changes persist when toggling sections

### ❌ Previous Behavior:
- Changes would revert
- Visual updates would flicker

---

## Test 4: Upload Page Images
**Expected Outcome**: Images upload and display immediately

### Steps:
1. Select any issue
2. Expand "Pages & Spreads" section
3. Click file input for any page's "Front" or "Back"
4. Select an image file
5. OR paste an image URL and click "Use"

### ✅ Success Criteria:
- Image appears in the preview immediately
- No error alerts
- Image persists when re-selecting the issue

### ❌ Previous Behavior:
- Uploads might fail
- Images would disappear

---

## Test 5: Page Refresh Persistence
**Expected Outcome**: Admin state persists

### Steps:
1. While logged into admin
2. Make some edits (title, colors, etc.)
3. Press F5 to refresh the page
4. Wait for page to reload

### ✅ Success Criteria:
- Still logged in (no login screen)
- Admin UI is fully visible (issues list, editing panel)
- Books list loads completely
- Previous edits are still there

### ❌ Previous Behavior:
- Admin UI would vanish
- Only 3D book and bottom nav visible

---

## Test 6: Public vs Admin Separation
**Expected Outcome**: Unpublished books only visible to admins

### Steps:
1. In admin panel, create a new issue
2. Note: New issues are unpublished by default (is_published = false)
3. Open a new browser tab
4. Navigate to `http://localhost:5173/` (public page)
5. Click through the books using arrow buttons

### ✅ Success Criteria:
- The newly created unpublished issue does NOT appear on public page
- Only published books are visible to public users
- Going back to `/admin` shows all books including unpublished ones

---

## Test 7: Delete Issue
**Expected Outcome**: Books can be deleted

### Steps:
1. In admin panel, click "Edit Issues"
2. Find a book in the list
3. Click the trash icon next to it
4. Confirm deletion

### ✅Success Criteria:
- Book is removed from the list
- Another book is auto-selected
- No errors in browser console

---

## Browser Console Check

### During all tests, the browser console should:
- ✅ NOT show 400/403 errors
- ✅ NOT show "Failed to fetch books" errors
- ✅ NOT show React Query errors
- ✅ MAY show info logs about Supabase operations (normal)

### To open browser console:
- **Chrome/Edge**: Press F12
- **Firefox**: Press F12
- **Safari**: Press Cmd+Option+C

---

## Common Issues & Solutions

### If new books still disappear:
1. Check browser console for errors
2. Verify Supabase RLS policies allow INSERT
3. Check that is_published column exists in database

### If edits still revert:
1. Clear browser cache and reload
2. Check browser console for network errors
3. Verify Supabase RLS policies allow UPDATE

### If page refresh loses auth:
1. Check Application → Local Storage for Supabase session
2. Try clearing browser storage and logging in again
3. Verify VITE_SUPABASE_URL in .env is correct

---

## Expected Console Logs

### Normal operation:
```
Supabase configuration detected ✓
Fetching books from Supabase...
Successfully fetched [X] books
```

### When creating a new book:
```
Creating new book...
New book created: <uuid>
Cache updated with new book
```

### When editing:
```
Updating book metadata...
Cache update is sufficient; refetch removed to prevent race conditions
```

---

## After Testing

If all tests pass:
- ✅ Admin panel is fully functional
- ✅ Changes persist correctly
- ✅ Public/admin separation works
- ✅ No race conditions or revert issues

If any test fails:
- Check the browser console for specific errors
- Review ADMIN_PANEL_FIXES_2025-11-22.md for rollback instructions
- Open browser Network tab to see API requests
