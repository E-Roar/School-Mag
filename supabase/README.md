# Supabase Setup Instructions

## 1. Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Note your project URL and anon key from Settings > API

## 2. Run Database Schema
1. Open Supabase Dashboard > SQL Editor
2. Copy and run the contents of `schema.sql`
3. Verify tables were created: `books`, `pages`, `analytics_events`

## 3. Set Up Storage Buckets
1. Go to Storage > Create bucket
2. Create bucket named `book-pages`:
   - Make it public (for read access)
   - Add policy: Allow public read
   - Add policy: Allow authenticated admin write
3. Create bucket named `book-assets`:
   - Make it public
   - Same policies as above

## 4. Configure Admin Users
1. Go to Authentication > Users
2. For each admin user, click Edit
3. Under User Metadata, add: `{ "role": "admin" }`
4. Or use SQL:
```sql
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@school.edu';
```

## 5. Environment Variables
Create `.env.local` in project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 6. Migrate Existing Data (Optional)
If you have existing mock books, you can migrate them using the admin dashboard or a migration script.

