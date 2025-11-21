import { supabase, isSupabaseConfigured } from './supabaseClient'
import { defaultBooks } from '../data/defaultBooks'

export { supabase, isSupabaseConfigured }

// Transform Supabase book data to app format
const transformBook = (book) => ({
  id: book.id,
  slug: book.slug,
  title: book.title,
  subtitle: book.subtitle,
  issueTag: book.issue_tag,
  releaseDate: book.release_date,
  listOfContent: book.list_of_content || '',
  heroImage: book.hero_image_path || book.cover_thumbnail_url,
  coverThumbnailUrl: book.cover_thumbnail_url || book.hero_image_path,
  visualSettings: book.visual_settings || {},
  pages: [], // Will be populated separately
})

const transformPage = (page) => ({
  frontSrc: page.front_asset_path ? getSignedUrl('pages', page.front_asset_path) : null,
  backSrc: page.back_asset_path ? getSignedUrl('pages', page.back_asset_path) : null,
  label: page.label || `Page ${page.page_number}`,
})

// Get signed URL from Supabase Storage
export const getSignedUrl = (bucket, path) => {
  if (!path) return null
  if (path.startsWith('/') || path.startsWith('http')) return path
  if (!isSupabaseConfigured || !supabase) return path

  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  } catch (error) {
    console.error('Error getting signed URL:', error)
    return path
  }
}

// Fetch all books with pages
export const fetchBooks = async () => {
  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase not configured, using default books')
    return defaultBooks
  }

  try {
    // Check cache first
    const { getCachedBook } = await import('./cacheService')
    const cachedBooks = []
    // Try to get first cached book as a test
    // In production, you'd cache all books

    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .order('release_date', { ascending: false })

    if (booksError) {
      console.warn('Error fetching books from Supabase:', booksError)
      // Try to use cached data if available
      return defaultBooks
    }

    if (!books || books.length === 0) {
      // No books in Supabase yet - this is normal for new setups
      // Default books will be used as fallback
      return defaultBooks
    }

    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .order('book_id, page_number')

    if (pagesError) {
      console.warn('Error fetching pages from Supabase:', pagesError)
      // Return books with default pages as fallback
      return books.map((book) => ({
        ...transformBook(book),
        pages: defaultBooks[0]?.pages || [],
      }))
    }

    // Group pages by book_id
    const pagesByBook = (pages || []).reduce((acc, page) => {
      if (!acc[page.book_id]) acc[page.book_id] = []
      acc[page.book_id].push(page)
      return acc
    }, {})

    // Transform and attach pages
    const transformedBooks = books.map((book) => {
      const bookPages = (pagesByBook[book.id] || [])
        .sort((a, b) => a.page_number - b.page_number)
        .map(transformPage)

      return {
        ...transformBook(book),
        pages: bookPages.length > 0 ? bookPages : defaultBooks[0]?.pages || [],
      }
    })

    // Cache the books
    if (typeof window !== 'undefined') {
      const { cacheBook } = await import('./cacheService')
      transformedBooks.forEach((book) => cacheBook(book))
    }

    return transformedBooks.length > 0 ? transformedBooks : defaultBooks
  } catch (error) {
    console.error('Error fetching books:', error)
    // Always return default books as fallback
    return defaultBooks
  }
}

// Fetch single book by ID
export const fetchBookById = async (bookId) => {
  if (!isSupabaseConfigured || !supabase) {
    return defaultBooks.find((b) => b.id === bookId) || null
  }

  try {
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single()

    if (bookError) throw bookError

    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('book_id', bookId)
      .order('page_number')

    if (pagesError) throw pagesError

    return {
      ...transformBook(book),
      pages: pages.map(transformPage),
    }
  } catch (error) {
    console.error('Error fetching book:', error)
    return defaultBooks.find((b) => b.id === bookId) || null
  }
}

// Upload page image to Supabase Storage
export const uploadPageImage = async (file, bookId, pageNumber, side) => {
  if (!isSupabaseConfigured || !supabase) {
    return URL.createObjectURL(file)
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${bookId}/${pageNumber}-${side}.${fileExt}`
  const filePath = `${fileName}`

  try {
    const { data, error } = await supabase.storage
      .from('pages')
      .upload(filePath, file, { upsert: true })

    if (error) throw error

    return getSignedUrl('pages', data.path)
  } catch (error) {
    console.error('Error uploading image:', error)
    return URL.createObjectURL(file) // Fallback to blob URL
  }
}

// Check if string is a valid UUID
export const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Record analytics event
export const recordAnalyticsEvent = async (event) => {
  if (!isSupabaseConfigured || !supabase) return

  // Skip analytics for default/mock books (they use string IDs, not UUIDs)
  // Only record analytics for books that exist in Supabase (have UUIDs)
  if (event.book_id && !isUUID(event.book_id)) {
    // This is a default/mock book, skip analytics
    return
  }

  // Get or create device ID
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem('device_id', deviceId)
  }

  // Get session ID (per browser session)
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem('session_id', sessionId)
  }

  const eventData = {
    ...event,
    device_id: deviceId,
    session_id: sessionId,
  }

  // Remove book_id if it's not a valid UUID
  if (eventData.book_id && !isUUID(eventData.book_id)) {
    delete eventData.book_id
  }

  try {
    const { error } = await supabase.from('analytics_events').insert([eventData])

    if (error) {
      // Only log if it's not a UUID error (we already handle that above)
      if (!error.message?.includes('uuid') && !error.code?.includes('22P02')) {
        console.error('Analytics error:', error)
      }
    }
  } catch (error) {
    // Silently fail for analytics - don't break the app
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics recording failed (non-critical):', error.message)
    }
  }
}

