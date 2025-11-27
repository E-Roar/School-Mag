-- Migration: Renumber pages to start from 1 instead of 0
-- Run this ONCE in Supabase SQL Editor to fix existing data

-- This script will renumber all pages in all books to start from 1
-- WARNING: This will modify your existing data. Make a backup first!

DO $$
DECLARE
    book_record RECORD;
    page_record RECORD;
    new_page_number INT;
BEGIN
    -- Loop through each book
    FOR book_record IN 
        SELECT DISTINCT book_id FROM pages ORDER BY book_id
    LOOP
        RAISE NOTICE 'Processing book: %', book_record.book_id;
        
        new_page_number := 1;
        
        -- Loop through pages in this book, ordered by current page_number
        FOR page_record IN 
            SELECT id, page_number 
            FROM pages 
            WHERE book_id = book_record.book_id 
            ORDER BY page_number
        LOOP
            -- Update the page_number to the new sequence (1, 2, 3...)
            UPDATE pages 
            SET page_number = new_page_number 
            WHERE id = page_record.id;
            
            RAISE NOTICE '  Page % -> %', page_record.page_number, new_page_number;
            
            new_page_number := new_page_number + 1;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Migration complete!';
END $$;

-- Verify the results
SELECT book_id, page_number, label 
FROM pages 
ORDER BY book_id, page_number;
