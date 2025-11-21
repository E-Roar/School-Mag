import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iqiijwnxixnucpsatweq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaWlqd254aXhudWNwc2F0d2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzE4NzYsImV4cCI6MjA3OTMwNzg3Nn0.r8bMLgXnRxIXQdn8ERouppgij_OPWsM6irOJB1AbbSA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  console.log('Checking Supabase connection...')
  
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
  
  if (error) {
    console.error('Error fetching books:', error)
    return
  }
  
  console.log(`Found ${books.length} books.`)
  
  if (books.length > 0) {
    console.log('First book:', books[0])
    
    // Check if visual_settings exists
    if (!books[0].visual_settings) {
      console.warn('WARNING: visual_settings column is missing or null in the first book!')
    } else {
      console.log('visual_settings:', books[0].visual_settings)
    }
  } else {
    console.log('No books found in DB. This explains why it reverts to defaults (if defaults are used).')
  }

  // Check pages table
  const { data: pages, error: pagesError } = await supabase
    .from('pages')
    .select('*')
    .limit(5)

  if (pagesError) {
    console.error('Error fetching pages:', pagesError)
  } else {
    console.log(`Found ${pages.length} pages (limit 5).`)
  }
}

check()
