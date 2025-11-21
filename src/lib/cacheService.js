import { get, set, del, keys } from 'idb-keyval'

const STORE_PREFIX = 'magazine_'
const BOOK_KEY = (id) => `${STORE_PREFIX}book_${id}`
const TEXTURE_KEY = (url) => `${STORE_PREFIX}texture_${url}`

// Cache book metadata
export const cacheBook = async (book) => {
  try {
    await set(BOOK_KEY(book.id), book)
  } catch (error) {
    console.error('Error caching book:', error)
  }
}

// Get cached book
export const getCachedBook = async (bookId) => {
  try {
    return await get(BOOK_KEY(bookId))
  } catch (error) {
    console.error('Error getting cached book:', error)
    return null
  }
}

// Cache page texture
export const cacheTexture = async (url, blob) => {
  try {
    await set(TEXTURE_KEY(url), blob)
  } catch (error) {
    console.error('Error caching texture:', error)
  }
}

// Get cached texture
export const getCachedTexture = async (url) => {
  try {
    return await get(TEXTURE_KEY(url))
  } catch (error) {
    console.error('Error getting cached texture:', error)
    return null
  }
}

// Preload and cache textures in background
export const preloadBookTextures = async (book) => {
  if (!book?.pages) return

  // Use requestIdleCallback for background loading
  const loadTexture = async (url) => {
    try {
      // Check cache first
      const cached = await getCachedTexture(url)
      if (cached) {
        return URL.createObjectURL(cached)
      }

      // Fetch and cache
      const response = await fetch(url)
      const blob = await response.blob()
      await cacheTexture(url, blob)
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error preloading texture:', error)
      return url
    }
  }

  // Load next 3 pages ahead
  const currentIndex = 0 // You'd get this from state
  const pagesToPreload = book.pages.slice(currentIndex, currentIndex + 3)

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      pagesToPreload.forEach((page) => {
        if (page.frontSrc) loadTexture(page.frontSrc)
        if (page.backSrc) loadTexture(page.backSrc)
      })
    })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      pagesToPreload.forEach((page) => {
        if (page.frontSrc) loadTexture(page.frontSrc)
        if (page.backSrc) loadTexture(page.backSrc)
      })
    }, 1000)
  }
}

// Clear old cache (keep last 10 books)
export const clearOldCache = async () => {
  try {
    const allKeys = await keys()
    const bookKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(`${STORE_PREFIX}book_`))
    if (bookKeys.length > 10) {
      const toDelete = bookKeys.slice(0, bookKeys.length - 10)
      await Promise.all(toDelete.map((key) => del(key)))
    }
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

