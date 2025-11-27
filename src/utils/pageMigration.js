import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Migrates all books to use 1-based page numbering instead of 0-based
 * This fixes issues with page 0 being protected by database constraints
 * 
 * @returns {Promise<{success: boolean, booksFixed: number, message: string}>}
 */
export const migrateToOneBasedPages = async () => {
    if (!isSupabaseConfigured || !supabase) {
        return { success: false, booksFixed: 0, message: 'Supabase not configured' };
    }

    try {
        // Fetch all books
        const { data: books, error: booksError } = await supabase
            .from('books')
            .select('id');

        if (booksError) throw booksError;

        let booksFixed = 0;

        // Process each book
        for (const book of books) {
            // Get all pages for this book, ordered by page_number
            const { data: pages, error: pagesError } = await supabase
                .from('pages')
                .select('id, page_number')
                .eq('book_id', book.id)
                .order('page_number');

            if (pagesError) {
                console.error(`Error fetching pages for book ${book.id}:`, pagesError);
                continue;
            }

            // Check if this book needs migration (has page_number = 0)
            const hasPageZero = pages.some(p => p.page_number === 0);

            if (!hasPageZero) {
                console.log(`Book ${book.id} already migrated, skipping`);
                continue;
            }

            console.log(`Migrating book ${book.id} with ${pages.length} pages`);

            // Renumber pages: 0 -> 1, 1 -> 2, etc.
            let newPageNumber = 1;
            for (const page of pages) {
                const { error: updateError } = await supabase
                    .from('pages')
                    .update({ page_number: newPageNumber })
                    .eq('id', page.id);

                if (updateError) {
                    console.error(`Error updating page ${page.id}:`, updateError);
                    throw updateError;
                }

                console.log(`  Page ${page.page_number} -> ${newPageNumber}`);
                newPageNumber++;
            }

            booksFixed++;
        }

        return {
            success: true,
            booksFixed,
            message: `Successfully migrated ${booksFixed} books to 1-based page numbering`
        };

    } catch (error) {
        console.error('Migration error:', error);
        return {
            success: false,
            booksFixed: 0,
            message: `Migration failed: ${error.message}`
        };
    }
};
