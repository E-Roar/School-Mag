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
  is_published: book.is_published, // Ensure this is passed through
  likes: book.likes || 0,
  pages: [], // Will be populated separately
})

// Define a stable session cache buster (generated once per load)
const SESSION_CACHE_BUSTER = `?t=${Date.now()}`;

const transformPage = (page) => {
  // Import default placeholder at top level
  const defaultPlaceholder = '/textures/DSC00933.jpg';

  // Add cache buster to force reload of images
  // CRITICAL FIX: Do NOT use Date.now() as fallback, it causes infinite re-renders/reloads
  // because the URL changes on every fetch. Use a stable fallback or updated_at.
  const cacheBuster = page.updated_at
    ? `?t=${new Date(page.updated_at).getTime()}`
    : SESSION_CACHE_BUSTER;

  return {
    frontSrc: page.front_asset_path
      ? getSignedUrl('pages', page.front_asset_path) + cacheBuster
      : defaultPlaceholder,
    backSrc: page.back_asset_path
      ? getSignedUrl('pages', page.back_asset_path) + cacheBuster
      : defaultPlaceholder,
    label: page.label || `Page ${page.page_number}`,
    // Pass raw paths for admin usage if needed
    frontPath: page.front_asset_path,
    backPath: page.back_asset_path
  };
}

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

    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .order('release_date', { ascending: false })

    if (booksError) {
      console.error('CRITICAL: Error fetching books from Supabase:', booksError)
      throw booksError; // Don't fallback to defaults, let the UI handle the error
    }

    if (!books || books.length === 0) {
      return [] // Return empty if no books, don't show defaults
    }

    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .order('book_id, page_number')

    if (pagesError) {
      console.error('CRITICAL: Error fetching pages from Supabase:', pagesError)
      throw pagesError;
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
        pages: bookPages.length > 0 ? bookPages : [], // Don't use default pages
      }
    })

    // Cache the books
    if (typeof window !== 'undefined') {
      const { cacheBook } = await import('./cacheService')
      transformedBooks.forEach((book) => cacheBook(book))
    }

    return transformedBooks
  } catch (error) {
    console.error('Error fetching books:', error)
    throw error; // Propagate error
  }
}


// Fetch only published books for public display
export const fetchPublishedBooks = async () => {
  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase not configured, using default books')
    return defaultBooks
  }

  try {
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .order('release_date', { ascending: false })

    if (booksError) {
      console.error('Error fetching published books:', booksError)
      throw booksError;
    }

    if (!books || books.length === 0) {
      return [] // Return empty, allow UI to show "No issues found"
    }

    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .order('book_id, page_number')

    if (pagesError) {
      console.error('Error fetching pages:', pagesError)
      throw pagesError;
    }

    const pagesByBook = (pages || []).reduce((acc, page) => {
      if (!acc[page.book_id]) acc[page.book_id] = []
      acc[page.book_id].push(page)
      return acc
    }, {})

    const transformedBooks = books.map((book) => {
      const bookPages = (pagesByBook[book.id] || [])
        .sort((a, b) => a.page_number - b.page_number)
        .map(transformPage)

      return {
        ...transformBook(book),
        pages: bookPages.length > 0 ? bookPages : [],
      }
    })

    return transformedBooks
  } catch (error) {
    console.error('Error fetching published books:', error)
    throw error;
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
      .maybeSingle()

    if (bookError) throw bookError
    if (!book) return null // Handle case where book is not found

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

// Upload page image to Supabase Storage with automatic compression
export const uploadPageImage = async (file, bookId, pageNumber, side, onProgress = null) => {
  if (!isSupabaseConfigured || !supabase) {
    return URL.createObjectURL(file)
  }

  try {
    // Import compression utilities
    const { compressImage, validateImageFile } = await import('../utils/imageCompression')

    // Validate file
    const validation = validateImageFile(file, 50) // Max 50MB before compression
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Compress and convert to WebP
    if (onProgress) onProgress({ stage: 'compressing', percent: 0 })

    const compressionResult = await compressImage(file, {}, (progress) => {
      if (onProgress) onProgress({ stage: 'compressing', percent: progress })
    })

    const compressedFile = compressionResult.file

    // Log compression stats
    if (!compressionResult.skipped) {
      console.log(`Image compressed: ${compressionResult.compressionRatio}% reduction`)
    }

    // Always use .webp extension for compressed files
    const fileExt = 'webp'
    const fileName = `${bookId}/${pageNumber}-${side}.${fileExt}`
    const filePath = `${fileName}`

    if (onProgress) onProgress({ stage: 'uploading', percent: 0 })

    const { data, error } = await supabase.storage
      .from('pages')
      .upload(filePath, compressedFile, {
        upsert: true,
        contentType: 'image/webp'
      })

    if (error) throw error

    if (onProgress) onProgress({ stage: 'complete', percent: 100 })

    return getSignedUrl('pages', data.path)
  } catch (error) {
    console.error('Error uploading image:', error)
    if (onProgress) onProgress({ stage: 'error', percent: 0, error: error.message })
    throw error // Throw error instead of silently falling back
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

// Create a new notification (Admin only)
export const createNotification = async (notification) => {
  if (!isSupabaseConfigured || !supabase) return null

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

// Fetch recent notifications
export const fetchNotifications = async (limit = 10) => {
  if (!isSupabaseConfigured || !supabase) return []

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

// Delete a notification (Admin only)
export const deleteNotification = async (id) => {
  if (!isSupabaseConfigured || !supabase) return null

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}

// =====================================================
// LIKES FUNCTIONS
// =====================================================

// Get device ID (fingerprint) for anonymous like tracking
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// Like a book
export const likeBook = async (bookId) => {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const deviceId = getDeviceId();

    const { data, error } = await supabase.rpc('increment_book_likes', {
      p_book_id: bookId,
      p_device_id: deviceId
    });

    if (error) throw error;
    return data; // Returns updated likes count
  } catch (error) {
    console.error('Error liking book:', error);
    throw error;
  }
};

// Unlike a book
export const unlikeBook = async (bookId) => {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const deviceId = getDeviceId();

    const { data, error } = await supabase.rpc('decrement_book_likes', {
      p_book_id: bookId,
      p_device_id: deviceId
    });

    if (error) throw error;
    return data; // Returns updated likes count
  } catch (error) {
    console.error('Error unliking book:', error);
    throw error;
  }
};

// Check if current device has liked a book
export const hasLikedBook = async (bookId) => {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const deviceId = getDeviceId();

    const { data, error } = await supabase
      .from('book_likes')
      .select('id')
      .eq('book_id', bookId)
      .eq('device_id', deviceId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

// Get likes count for a book
export const getBookLikes = async (bookId) => {
  if (!isSupabaseConfigured || !supabase) return 0;

  try {
    const { data, error } = await supabase
      .from('books')
      .select('likes')
      .eq('id', bookId)
      .single();

    if (error) throw error;
    return data?.likes || 0;
  } catch (error) {
    console.error('Error getting book likes:', error);
    return 0;
  }
};
