-- Add logo variant columns and logo size to settings table
-- Run this migration in your Supabase SQL Editor

-- Add columns for logo variants if they don't exist
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS school_logo_favicon_192 TEXT,
ADD COLUMN IF NOT EXISTS school_logo_favicon_512 TEXT,
ADD COLUMN IF NOT EXISTS school_logo_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS school_logo_og TEXT,
ADD COLUMN IF NOT EXISTS logo_size INTEGER DEFAULT 48;

-- Add helpful comment
COMMENT ON COLUMN settings.school_logo_url IS 'Main logo URL (full size, WebP format)';
COMMENT ON COLUMN settings.school_logo_favicon_192 IS 'Favicon 192x192 PNG';
COMMENT ON COLUMN settings.school_logo_favicon_512 IS 'Favicon 512x512 PNG';
COMMENT ON COLUMN settings.school_logo_thumbnail IS 'Thumbnail version of logo (128x128 WebP)';
COMMENT ON COLUMN settings.school_logo_og IS 'Open Graph image for social media (1200x630 JPEG)';
COMMENT ON COLUMN settings.logo_size IS 'Logo size in pixels for navigation (32-80)';
