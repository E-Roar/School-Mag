-- Seed data for Books
-- Run this in the Supabase SQL Editor to populate your database with initial data

-- Insert Books
INSERT INTO books (id, slug, title, subtitle, issue_tag, release_date, list_of_content, hero_image_path, visual_settings, is_published)
VALUES 
  (
    uuid_generate_v4(),
    'fall-issue-2025',
    'Fall Issue',
    'Arts Festival Special',
    'Vol. 08',
    '2025-10-15',
    'Principal Letter; Arts Festival Recap; Student Spotlight: Mia Chen; Gallery Highlights; Upcoming Exhibitions',
    '/textures/book-cover.jpg',
    '{
      "marqueeTexts": ["Fall Arts", "Student Gallery", "Spotlights", "Design Lab", "Creative Voices"],
      "marqueeColor": "#ffefd5",
      "marqueeFontFamily": "''Playfair Display'', serif",
      "gradientStart": "#FF6F91",
      "gradientEnd": "#2B2E4A",
      "floatIntensity": 1,
      "rotationIntensity": 2,
      "floatSpeed": 2,
      "marqueeSpeed": 16
    }'::jsonb,
    true
  ),
  (
    uuid_generate_v4(),
    'winter-issue-2025',
    'Winter Issue',
    'STEM Showcase',
    'Vol. 09',
    '2025-12-05',
    'Dean''s Note; Innovation Week Winners; Robotics Lab Tour; Space Club Discoveries; Code Jam Results',
    '/textures/DSC01145.jpg',
    '{
      "marqueeTexts": ["Innovation Week", "Robotics", "Astronomy", "Code Jam", "Future Ready"],
      "marqueeColor": "#b3f0ff",
      "marqueeFontFamily": "''Space Grotesk'', sans-serif",
      "gradientStart": "#0F2027",
      "gradientEnd": "#2C5364",
      "floatIntensity": 1,
      "rotationIntensity": 2,
      "floatSpeed": 2,
      "marqueeSpeed": 16
    }'::jsonb,
    true
  );

-- Insert Pages for the first book (we need to get the ID first in a real script, but for SQL editor we can use a DO block or just manual IDs if we knew them. 
-- Since we used uuid_generate_v4(), we can't easily link them in a single simple script without variables.
-- So we will use a DO block.

DO $$
DECLARE
  fall_book_id UUID;
  winter_book_id UUID;
BEGIN
  -- Get the IDs of the books we just inserted (assuming they are the only ones or filtering by title)
  SELECT id INTO fall_book_id FROM books WHERE title = 'Fall Issue' LIMIT 1;
  SELECT id INTO winter_book_id FROM books WHERE title = 'Winter Issue' LIMIT 1;

  -- Insert Pages for Fall Issue
  IF fall_book_id IS NOT NULL THEN
    INSERT INTO pages (book_id, page_number, front_asset_path, back_asset_path, label) VALUES
    (fall_book_id, 0, '/textures/book-cover.jpg', '/textures/DSC00680.jpg', 'Cover'),
    (fall_book_id, 1, '/textures/DSC00933.jpg', '/textures/DSC00966.jpg', 'Spread 1'),
    (fall_book_id, 2, '/textures/DSC00983.jpg', '/textures/DSC01011.jpg', 'Spread 2'),
    (fall_book_id, 3, '/textures/DSC01040.jpg', '/textures/DSC01064.jpg', 'Spread 3'),
    (fall_book_id, 4, '/textures/DSC01071.jpg', '/textures/DSC01103.jpg', 'Spread 4'),
    (fall_book_id, 5, '/textures/DSC01145.jpg', '/textures/book-back.jpg', 'Back Cover');
  END IF;

  -- Insert Pages for Winter Issue
  IF winter_book_id IS NOT NULL THEN
    INSERT INTO pages (book_id, page_number, front_asset_path, back_asset_path, label) VALUES
    (winter_book_id, 0, '/textures/DSC01145.jpg', '/textures/DSC01420.jpg', 'Cover'),
    (winter_book_id, 1, '/textures/DSC01461.jpg', '/textures/DSC01489.jpg', 'Spread 1'),
    (winter_book_id, 2, '/textures/DSC02031.jpg', '/textures/DSC02064.jpg', 'Spread 2'),
    (winter_book_id, 3, '/textures/DSC02069.jpg', '/textures/book-back.jpg', 'Back Cover');
  END IF;
END $$;
