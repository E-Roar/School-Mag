-- Fix Analytics Events Table - Add Missing Metadata Column
-- Run this in Supabase SQL Editor

-- Add metadata column if it doesn't exist
ALTER TABLE analytics_events 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add index for metadata queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_metadata 
ON analytics_events USING gin (metadata);

COMMENT ON COLUMN analytics_events.metadata IS 'Flexible JSON metadata for event-specific data (zoom duration, interest scores, etc.)';
