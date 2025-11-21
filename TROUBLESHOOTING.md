# Troubleshooting Guide

## Issue: "Missing Supabase environment variables. Using mock mode."

This is expected if Supabase isn't configured yet. The app will still work with default mock data.

**To fix:**
1. Create `.env.local` file in project root
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Restart dev server: `npm run dev`

## Issue: "Cannot destructure property 'data' of '(intermediate value)' as it is undefined"

This was fixed in the latest update. The app now properly handles when Supabase isn't configured.

**If you still see this:**
- Clear browser cache
- Restart dev server
- Make sure you have the latest code

## Issue: Book not showing / UI not loading

The app is designed to work even if Supabase fails:

1. **Check console for errors** - Should show warnings but app should still load
2. **Default books should load** - The app falls back to `defaultBooks` from `src/data/defaultBooks.js`
3. **Check that books data exists** - Verify `src/data/defaultBooks.js` has book data

## Issue: Backend not responding

The app is designed to:
- ✅ Load from cached data (IndexedDB) if available
- ✅ Use default books if Supabase fails
- ✅ Continue working offline after first visit

**To verify cache is working:**
- Open browser DevTools > Application > IndexedDB
- Look for `magazine-cache` database
- Books and textures should be cached there

## Issue: Admin login not working

**If Supabase is configured:**
- Make sure user has `role: "admin"` in metadata
- Check Supabase Dashboard > Authentication > Users
- Update user metadata:
  ```sql
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
  WHERE email = 'your-email@example.com';
  ```

**If Supabase is NOT configured:**
- Uses fallback mock auth
- Default credentials:
  - Email: `admin@school.edu` (or `VITE_ADMIN_EMAIL`)
  - Password: `supersecure` (or `VITE_ADMIN_PASSWORD`)

## Issue: Analytics not tracking

Analytics only work if Supabase is configured. If not configured:
- Events are silently ignored
- No errors thrown
- App continues normally

## Issue: Images not loading

**Check:**
1. Supabase Storage buckets exist (`book-pages`, `book-assets`)
2. Buckets are public (for read access)
3. Images are uploaded to correct paths: `{bookId}/{pageNumber}-{side}.{ext}`

**Fallback:**
- If Supabase fails, images use default texture paths from `/textures/`
- Check `public/textures/` folder for default images

## Development Mode

In development, the app:
- ✅ Works without Supabase (uses defaults)
- ✅ Falls back gracefully on errors
- ✅ Logs warnings but doesn't crash
- ✅ Uses cached data when available

## Production Checklist

Before deploying:
- [ ] Supabase project created
- [ ] Database schema run (`supabase/schema.sql`)
- [ ] Storage buckets created and public
- [ ] Admin user created with role
- [ ] Environment variables set
- [ ] Test that books load
- [ ] Test admin login
- [ ] Test image uploads
- [ ] Test analytics tracking

