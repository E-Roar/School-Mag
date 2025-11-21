-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  issue_tag TEXT,
  release_date DATE,
  list_of_content TEXT,
  hero_image_path TEXT,
  cover_thumbnail_url TEXT,
  
  -- Visual settings stored as JSONB for flexibility
  visual_settings JSONB DEFAULT '{
    "gradientStart": "#5a47ce",
    "gradientEnd": "#232323",
    "marqueeTexts": ["Wawa Sensei", "React Three Fiber", "Three.js"],
    "marqueeFont": "Poppins",
    "marqueeColor": "#ffffff",
    "marqueeSpeed": 16,
    "floatIntensity": 1,
    "rotationIntensity": 2,
    "floatSpeed": 2
  }'::jsonb,
  
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  front_asset_path TEXT,
  back_asset_path TEXT,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, page_number)
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER,
  event_type TEXT NOT NULL, -- 'view', 'click', 'hover', 'page_turn', 'dwell'
  device_id TEXT, -- Client-side generated UUID stored in localStorage
  session_id TEXT,
  position_x FLOAT, -- Normalized 0-1 for heatmap
  position_y FLOAT,
  dwell_time_ms INTEGER,
  payload JSONB, -- Additional event data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_book_id ON pages(book_id);
CREATE INDEX IF NOT EXISTS idx_pages_book_page ON pages(book_id, page_number);
CREATE INDEX IF NOT EXISTS idx_analytics_book_id ON analytics_events(book_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_book_event ON analytics_events(book_id, event_type);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(is_published);
CREATE INDEX IF NOT EXISTS idx_books_release_date ON books(release_date DESC);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Books: Public read, admin write
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Books are editable by admins only"
  ON books FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Pages: Public read, admin write
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages are viewable by everyone"
  ON pages FOR SELECT
  USING (true);

CREATE POLICY "Pages are editable by admins only"
  ON pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Analytics: Public insert, admin read
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Analytics are readable by admins only"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Storage bucket policies (run these in Supabase Dashboard > Storage)

-- Bucket: pages (renamed from book-pages)
-- Policy: Public read
-- Policy: Admin write/update/delete

-- Bucket: book-assets (for hero images, thumbnails)
-- Policy: Public read
-- Policy: Admin write

