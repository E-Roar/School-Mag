-- Schema updates: Add app health history and update storage bucket name
-- Run this after the main schema.sql

-- App Health History table
CREATE TABLE IF NOT EXISTS app_health_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  component TEXT, -- 'api', 'storage', 'database', 'auth'
  message TEXT,
  metadata JSONB, -- Additional diagnostic data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for health history queries
CREATE INDEX IF NOT EXISTS idx_health_history_created_at ON app_health_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_history_status ON app_health_history(status);
CREATE INDEX IF NOT EXISTS idx_health_history_component ON app_health_history(component);

-- Enable RLS on health history
ALTER TABLE app_health_history ENABLE ROW LEVEL SECURITY;

-- Allow admins to read health history
CREATE POLICY "Health history readable by admins only"
  ON app_health_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Allow system to insert health events (public insert for now, can restrict later)
CREATE POLICY "Anyone can insert health events"
  ON app_health_history FOR INSERT
  WITH CHECK (true);

-- Note: Storage bucket name change from 'book-pages' to 'pages'
-- This needs to be done in Supabase Dashboard > Storage:
-- 1. Create new bucket named 'pages'
-- 2. Set it to public for read access
-- 3. Add policy: Allow authenticated admin write
-- 4. Migrate files from 'book-pages' to 'pages' if needed
-- 5. Delete old 'book-pages' bucket if no longer needed

