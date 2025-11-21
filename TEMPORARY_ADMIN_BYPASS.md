# Temporary Admin Bypass (For Testing Only!)

If you need to test the admin panel **RIGHT NOW** without setting up the role, you can temporarily allow any authenticated user to access it.

## ⚠️ WARNING: Only use this for development/testing!

## How to Enable Temporary Bypass

1. Open `src/routes/AdminPage.jsx`
2. Find this line (around line 220):
   ```javascript
   if (role === "admin") {
   ```
3. Replace it with:
   ```javascript
   // TEMPORARY: Allow any authenticated user for testing
   if (role === "admin" || (process.env.NODE_ENV === "development" && user?.id)) {
   ```

4. Save the file and refresh

Now ANY authenticated user can access the admin panel in development mode.

## ⚠️ IMPORTANT: Remove This Before Production!

Before deploying to production, **REMOVE** the temporary bypass and ensure proper role setup!

## Proper Fix (After Testing)

Once you've tested everything works:

1. Remove the temporary bypass
2. Run the SQL in `supabase/FIX_YOUR_EMAIL.sql` to set your admin role
3. Clear browser storage and sign in again

