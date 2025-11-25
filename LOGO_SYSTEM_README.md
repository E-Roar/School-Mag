# Logo Upload & Management System

## Overview
Complete logo management system with automatic compression, variant generation, and dynamic sizing across the platform.

## Features

### ✨ Auto-Compression & Optimization
- Uploads are automatically compressed using WebP/PNG/JPEG formats
- Multiple variants generated for different use cases
- Progress tracking during upload

### 📐 Variants Generated
1. **Full Logo** (512x512 WebP) - Main logo for general use
2. **Favicon 192** (192x192 PNG) - PWA icon
3. **Favicon 512** (512x512 PNG) - High-res PWA icon  
4. **Thumbnail** (128x128 WebP) - Small previews
5. **OG Image** (1200x630 JPEG) - Social media sharing

### 🎨 Neomorphic Design
- **NeomorphicLogo**: Standard logo component with hover/click animations
- **ExtrudedLogo**: 3D-styled logo for hero sections
- Custom sizing support (32px - 80px via admin slider)

### 📍 Logo Locations
- Landing page navigation
- Landing page hero (extruded 3D style)
- Admin panel navigation (links to landing page)
- Browser favicon (auto-updated)
- Social media previews (Open Graph)

## Usage

### Admin Panel
1. Navigate to **Settings** in admin panel
2. Click **Upload Logo** button
3. Select an image file (PNG, JPG, or SVG recommended)
4. Wait for compression and variant generation
5. Adjust logo size using the slider (see real-time preview)
6. Click **Save Changes**

### Best Practices
- **Recommended size**: 512x512px square
- **Format**: PNG with transparent background (for best results)
- **File size**: Under 10MB (will be compressed automatically)
- **Content**: Simple, recognizable design that scales well

## Technical Details

### Components
- `NeomorphicLogo.jsx` - Reusable logo component with animations
- `MetaTags.jsx` - Dynamic meta tags for SEO and social sharing
- `logoCompression.js` - Compression utilities

### Database Schema
```sql
settings table:
- school_logo_url: TEXT (main logo)
- school_logo_favicon_192: TEXT
- school_logo_favicon_512: TEXT  
- school_logo_thumbnail: TEXT
- school_logo_og: TEXT
- logo_size: INTEGER (32-80, default 48)
```

### API/Storage
- All logos stored in Supabase `pages` bucket under `logos/` folder
- Public read access required
- Automatic URL generation

## SEO & Social Media

### Meta Tags (Auto-generated)
- Title, description from settings
- Open Graph tags (Facebook, Twitter)
- Twitter Card with image
- Apple touch icon
- PWA manifest icons

### Sharing Preview
When sharing links on social media, the platform will display:
- School name as title
- Description from settings
- Logo/OG image as preview image

## Migration

Run the SQL migration to add new columns:
```bash
# In Supabase SQL Editor, run:
supabase/migrations/add_logo_variants.sql
```

## Files Modified
- `src/components/NeomorphicLogo.jsx` - Logo components
- `src/components/MetaTags.jsx` - SEO meta tags
- `src/utils/logoCompression.js` - Compression utilities
- `src/components/admin/SettingsPanel.jsx` - Upload UI with slider
- `src/components/admin/TopNav.jsx` - Admin nav with logo
- `src/routes/LandingPage.jsx` - Landing page with logos
- `src/main.jsx` - HelmetProvider wrapper

## Dependencies Added
- `react-helmet-async` - For dynamic meta tag management

## Todo/Future Enhancements
- [ ] Logo cropper/editor inline
- [ ] Dark mode logo variant
- [ ] Animated logo support (GIF/Lottie)
- [ ] Logo usage analytics
