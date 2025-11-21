# Database Setup Guide

## ✅ Completed Changes

1. **Auto-save functionality** - All changes now save automatically to database
2. **Save button added** - Manual save button in admin dashboard for syncing
3. **Storage bucket renamed** - Changed from `book-pages` to `pages`
4. **App health history** - New table for tracking app health metrics
5. **Auto-refetch** - Changes propagate to all users immediately

## 📋 Setup Steps

### 1. Run Schema Updates

Run the new schema updates in Supabase Dashboard > SQL Editor:

```sql
-- Run supabase/schema-updates.sql
-- This creates the app_health_history table
```

Or run directly:

```sql
-- App Health History table
CREATE TABLE IF NOT EXISTS app_health_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  component TEXT, -- 'api', 'storage', 'database', 'auth'
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_health_history_created_at ON app_health_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_history_status ON app_health_history(status);
CREATE INDEX IF NOT EXISTS idx_health_history_component ON app_health_history(component);

-- RLS Policies
ALTER TABLE app_health_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Health history readable by admins only"
  ON app_health_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Anyone can insert health events"
  ON app_health_history FOR INSERT
  WITH CHECK (true);
```

### 2. Update Storage Bucket

**Create new bucket named `pages`:**

1. Go to Supabase Dashboard > Storage
2. Click "Create bucket"
3. Name it: `pages`
4. Make it **public** (for read access)
5. Add policies:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'pages');
```

**Policy 2: Admin Write**
```sql
CREATE POLICY "Admin write access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pages'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admin update access"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pages'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admin delete access"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pages'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'admin'
  )
);
```

**Note:** If you have existing files in `book-pages`, you'll need to:
- Migrate files from `book-pages` to `pages` bucket
- Or keep both buckets and update code to use both (not recommended)

### 3. Verify Changes Work

1. **Test Auto-save:**
   - Make a change in admin dashboard (edit title, change color, etc.)
   - Change should save automatically
   - Check Supabase Dashboard > Database > books table to verify

2. **Test Save Button:**
   - Click "💾 Save All Changes" button in admin dashboard
   - Should show "✓ Saved Successfully"
   - All users should see updates immediately

3. **Test Image Upload:**
   - Upload an image to a page
   - Should upload to `pages` bucket
   - Check Supabase Dashboard > Storage > pages bucket

## 🔄 How It Works

### Auto-Save
- **Page images**: Saved immediately when uploaded
- **Visual settings**: Saved when changed (gradient, marquee, etc.)
- **Book metadata**: Saved when changed (title, date, etc.)
- **Pages added/removed**: Saved immediately

### Save Button
- **Manual sync**: Click to ensure all changes are synced
- **Refetch data**: Pulls latest data from database
- **Propagates to users**: Other users see updates after their next fetch

### Data Flow
```
Admin makes change → Mutation runs → Saves to DB → Refetch → All users see update
```

## 📊 Analytics & Health History

### Analytics Events
All user interactions are tracked in `analytics_events` table:
- Page views
- Clicks
- Hovers
- Page turns
- Dwell time

### Health History
Track app health metrics:
```javascript
// Example: Record health event
await supabase.from('app_health_history').insert({
  status: 'healthy',
  component: 'api',
  message: 'All systems operational',
  metadata: { response_time: 120, uptime: 99.9 }
});
```

## 🛠️ Troubleshooting

### Changes not appearing for users
1. Check if changes were saved to database (Supabase Dashboard)
2. Click "Save All Changes" button to force sync
3. Users may need to refresh to see updates
4. Check browser console for errors

### Images not uploading
1. Verify `pages` bucket exists and is public
2. Check storage policies are set correctly
3. Verify admin role is set correctly
4. Check browser console for upload errors

### Database errors
1. Check Supabase Dashboard > Logs
2. Verify RLS policies allow admin access
3. Check if user has admin role set
4. Verify all schema updates were run

## 📝 Notes

- Changes are saved **automatically** - you don't need to click Save for every change
- The Save button is for **manual syncing** and confirming all changes are persisted
- All mutations now call `refetch()` to ensure users see updates
- Storage bucket name changed from `book-pages` to `pages` (simpler name)

