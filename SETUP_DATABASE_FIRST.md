# ⚠️ CRITICAL: RUN DATABASE MIGRATION FIRST!

## 🚨 Database Setup Required

**Before using the logo upload feature, you MUST run this SQL migration in your Supabase dashboard:**

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run This SQL

```sql
-- Add logo variant columns and logo size to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS school_logo_favicon_192 TEXT,
ADD COLUMN IF NOT EXISTS school_logo_favicon_512 TEXT,
ADD COLUMN IF NOT EXISTS school_logo_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS school_logo_og TEXT,
ADD COLUMN IF NOT EXISTS logo_size INTEGER DEFAULT 48;

-- Add helpful comments
COMMENT ON COLUMN settings.school_logo_url IS 'Main logo URL (full size, WebP format)';
COMMENT ON COLUMN settings.school_logo_favicon_192 IS 'Favicon 192x192 PNG';
COMMENT ON COLUMN settings.school_logo_favicon_512 IS 'Favicon 512x512 PNG';
COMMENT ON COLUMN settings.school_logo_thumbnail IS 'Thumbnail version of logo (128x128 WebP)';
COMMENT ON COLUMN settings.school_logo_og IS 'Open Graph image for social media (1200x630 JPEG)';
COMMENT ON COLUMN settings.logo_size IS 'Logo size in pixels for navigation (32-80)';
```

### Step 3: Verify Success
You should see a success message saying:
```
Success. No rows returned
```

## ✅ After Running Migration

Once the migration is complete, you can:
1. Go to Admin Panel → Settings
2. Upload your logo
3. Adjust the size with the slider
4. Save changes

## What We Fixed Today

### ✅ Removed ExtrudedLogo from hero section
- Logo now only appears in navigation bar
- Cleaner, more focused landing page

### ✅ Added "Back Home" button to admin
- Blue button next to Logout in admin panel
- Easy navigation back to landing page

### ✅ Fixed database query errors
- Made `logo_size` field optional in queries
- Won't cause errors if migration hasn't been run yet
- Defaults to 48px if not set

### ✅ Logo appears in:
- Landing page navigation (top left)
- Admin panel navigation (top left, clickable to go home)

## If You See Errors

### Error: Column "logo_size" does not exist
**Solution**: Run the SQL migration above!

### Error: Cannot upload logo
**Possible causes**:
1. Migration not run
2. Supabase storage permissions
3. File too large (must be under 10MB)

**Solution**: 
1. Run migration first
2. Check Supabase RLS policies for `pages` bucket
3. Try a smaller file

## React Router Warnings (Can be ignored)

The warnings about `v7_startTransition` and `v7_relativeSplatPath` are just deprecation warnings from React Router. They won't affect functionality and can be safely ignored for now.

To suppress them (optional), update your router configuration in `App.jsx` to add future flags, but this is NOT required.

---

**Need help?** Check `LOGO_QUICK_START.md` for detailed instructions!
