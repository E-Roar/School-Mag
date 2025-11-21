# Full Setup Guide

## ✅ Completed Features

### 1. **Supabase Backend Integration**
- ✅ Database schema with `books`, `pages`, and `analytics_events` tables
- ✅ Storage buckets for page images and assets
- ✅ Row-level security policies (public read, admin write)
- ✅ Supabase Auth integration for admin login

### 2. **Admin Dashboard**
- ✅ Issue picker (left sidebar matching public view)
- ✅ Tabbed interface:
  - Issue Settings (title, date, list of content)
  - Backdrop & Marquee (gradient, fonts, colors, animation speed)
  - Pages & Spreads (upload, add, remove pages)
- ✅ Analytics panel (top-right button)
  - View analytics per issue
  - Page view counts, clicks, hovers
  - Heatmap visualization
  - Date range filtering

### 3. **Analytics Tracking**
- ✅ Automatic page view tracking
- ✅ Click and hover tracking with position data
- ✅ Dwell time measurement
- ✅ Device/session tracking
- ✅ Real-time analytics dashboard

### 4. **Offline & PWA Support**
- ✅ Service Worker for offline caching
- ✅ IndexedDB cache for books and textures
- ✅ Background texture preloading
- ✅ PWA install prompt
- ✅ Offline-first architecture

## 🚀 Setup Instructions

### Step 1: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your project URL and anon key from Settings > API

### Step 2: Run Database Schema

1. Open Supabase Dashboard > SQL Editor
2. Copy and run the contents of `supabase/schema.sql`
3. Verify tables were created: `books`, `pages`, `analytics_events`

### Step 3: Set Up Storage Buckets

1. Go to Storage > Create bucket
2. Create bucket named `book-pages`:
   - Make it public (for read access)
   - Add policy: Allow public read
   - Add policy: Allow authenticated admin write
3. Create bucket named `book-assets`:
   - Make it public
   - Same policies as above

### Step 4: Configure Admin Users

1. Go to Authentication > Users
2. Create admin user or edit existing user
3. Under User Metadata (or via SQL), set role to `admin`:

```sql
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@school.edu';
```

### Step 5: Environment Variables

Create `.env.local` in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 6: Install Dependencies & Build

```bash
npm install
npm run build
npm run dev
```

## 📱 Features

### For Users
- Browse magazine issues in 3D book viewer
- Click/hover pages to flip through
- Responsive pagination
- Issue selection panel
- PWA install for offline access
- Fast loading with background caching

### For Admins
- Secure login via Supabase Auth
- Edit issue metadata (title, date, content list)
- Customize scene (gradient, marquee text, fonts, animation)
- Upload/manage page images
- Add/remove spreads
- View analytics dashboard:
  - Page views, clicks, hovers
  - Heatmaps per page
  - Engagement metrics
  - Date range filtering

## 🔒 Security

- Row-level security (RLS) enabled on all tables
- Public read access for published books
- Admin-only write access (verified via user role)
- Supabase Auth integration for admin authentication

## 📊 Analytics

Analytics are automatically tracked:
- **Page Views**: Every time a user views a page
- **Clicks**: User clicks on pages with position data
- **Hovers**: Mouse hover events with position
- **Dwell Time**: Time spent on each page
- **Page Turns**: Navigation between pages

All analytics are stored in Supabase and accessible via the admin dashboard.

## 🎨 Customization

Each issue can be customized:
- **Visual Settings**: Gradient colors, marquee text, fonts, colors
- **Animation**: Float intensity, rotation intensity, speed
- **Content**: Title, subtitle, issue tag, list of content
- **Pages**: Upload custom images for each spread

## 📦 Offline Support

- Service Worker caches all assets
- IndexedDB stores book metadata and textures
- Background preloading of next 3 pages
- Works completely offline after first visit

## 🔧 Development

The app uses:
- React 18 + Vite
- React Three Fiber for 3D
- Supabase for backend
- TanStack Query for data fetching
- IndexedDB for caching
- Workbox for service worker

To develop:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```

The build includes PWA files and service worker.

