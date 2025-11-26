-- Enhanced Analytics & Likes System

-- 1. Add likes column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;

-- 2. Create likes table for tracking individual likes (optional, for preventing duplicate likes per user)
CREATE TABLE IF NOT EXISTS book_likes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(book_id, device_id) -- Prevent duplicate likes from same device
);

-- 3. Add zoom tracking columns to analytics_events (if not exists)
-- We'll use the existing analytics_events table and add event_type for zoom

-- Index for faster querying
CREATE INDEX IF NOT EXISTS idx_book_likes_book_id ON book_likes(book_id);
CREATE INDEX IF NOT EXISTS idx_book_likes_device_id ON book_likes(device_id);

-- RLS Policies for book_likes
ALTER TABLE book_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes
CREATE POLICY "Public read access to likes" 
  ON book_likes FOR SELECT 
  USING (true);

-- Anyone can insert likes (we'll handle duplicates with UNIQUE constraint)
CREATE POLICY "Public insert access to likes" 
  ON book_likes FOR INSERT 
  WITH CHECK (true);

-- Only authenticated users can delete likes (for admin cleanup)
CREATE POLICY "Admin delete access to likes" 
  ON book_likes FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_book_likes(p_book_id uuid, p_device_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_likes integer;
BEGIN
  -- Try to insert like
  INSERT INTO book_likes (book_id, device_id)
  VALUES (p_book_id, p_device_id)
  ON CONFLICT (book_id, device_id) DO NOTHING;
  
  -- Update books table likes count
  UPDATE books
  SET likes = (SELECT COUNT(*) FROM book_likes WHERE book_id = p_book_id)
  WHERE id = p_book_id
  RETURNING likes INTO v_likes;
  
  RETURN COALESCE(v_likes, 0);
END;
$$;

-- Function to decrement likes (for unlike)
CREATE OR REPLACE FUNCTION decrement_book_likes(p_book_id uuid, p_device_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_likes integer;
BEGIN
  -- Delete the like
  DELETE FROM book_likes
  WHERE book_id = p_book_id AND device_id = p_device_id;
  
  -- Update books table likes count
  UPDATE books
  SET likes = (SELECT COUNT(*) FROM book_likes WHERE book_id = p_book_id)
  WHERE id = p_book_id
  RETURNING likes INTO v_likes;
  
  RETURN COALESCE(v_likes, 0);
END;
$$;

COMMENT ON TABLE book_likes IS 'Tracks individual likes for books to prevent duplicate likes and enable analytics';
COMMENT ON FUNCTION increment_book_likes IS 'Safely increments book likes count and prevents duplicates';
COMMENT ON FUNCTION decrement_book_likes IS 'Safely decrements book likes count';
