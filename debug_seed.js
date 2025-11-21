import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = 'https://iqiijwnxixnucpsatweq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaWlqd254aXhudWNwc2F0d2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzE4NzYsImV4cCI6MjA3OTMwNzg3Nn0.r8bMLgXnRxIXQdn8ERouppgij_OPWsM6irOJB1AbbSA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSeed() {
    console.log('Attempting to seed one book...')

    const bookId = randomUUID()

    const bookData = {
        id: bookId,
        slug: `debug-book-${bookId}`,
        title: "Debug Book",
        subtitle: "Testing Insertion",
        issue_tag: "Vol. Test",
        release_date: "2025-01-01",
        visual_settings: { test: true },
        is_published: true
    }

    const { data, error } = await supabase
        .from('books')
        .insert(bookData)
        .select()

    if (error) {
        console.error('Error inserting book:')
        console.error(JSON.stringify(error, null, 2))
    } else {
        console.log('Success! Inserted book:', data)
    }
}

debugSeed()
