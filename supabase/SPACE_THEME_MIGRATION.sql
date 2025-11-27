-- Add space theme toggle to settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS enable_space_theme BOOLEAN DEFAULT false;

COMMENT ON COLUMN settings.enable_space_theme IS 'Enable cosmic space theme for landing page';
