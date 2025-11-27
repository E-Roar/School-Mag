-- Add columns for Landing Page Background settings
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS landing_bg_url TEXT,
ADD COLUMN IF NOT EXISTS landing_bg_fixed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS landing_bg_size TEXT DEFAULT 'cover', -- 'cover', 'contain', 'auto'
ADD COLUMN IF NOT EXISTS landing_bg_repeat TEXT DEFAULT 'no-repeat'; -- 'no-repeat', 'repeat'
