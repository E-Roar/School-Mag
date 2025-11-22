# Architecture Changes - Data Flow Diagram

## Before (❌ Problematic)

```
┌─────────────────────────────────────────────────────────────┐
│                         main.jsx                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              BookDataProvider                       │    │
│  │              queryKey: ["books"]                    │    │
│  │              fetchFn: fetchBooks()                  │    │
│  │                  ↓                                  │    │
│  │         .eq('is_published', true) ❌                │    │
│  │                                                      │    │
│  │  Problem: Filters out unpublished books!            │    │
│  │           Admins can't see drafts!                  │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│                       App.jsx                                │
│                          ↓                                   │
│        ┌─────────────────┴────────────────┐                │
│        ↓                                   ↓                 │
│   PublicScene                          AdminPage            │
│   (shows all books)                    (shows all books)    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

ISSUE: Both routes share the same data source!
       Admins can't see unpublished books!
```

## Mutation Flow (Before - ❌ Race Conditions)

```
User edits title
     ↓
updateBookMetaMutation.mutate()
     ↓
onSuccess:
  1. Update React Query cache ✅
  2. Call refetch() ❌
     ↓
     Database hasn't finished writing yet!
     ↓
     Fetch returns OLD data
     ↓
     Cache overwritten with old data
     ↓
     User sees their edit REVERT!
```

---

## After (✅ Fixed)

```
┌─────────────────────────────────────────────────────────────┐
│                         main.jsx                             │
│                   (No BookDataProvider)                      │
│                                                              │
│                       App.jsx                                │
│                          ↓                                   │
│        ┌─────────────────┴────────────────┐                │
│        ↓                                   ↓                 │
│                                                              │
│  ┌──────────────────────┐      ┌───────────────────────┐  │
│  │   PublicScene.jsx    │      │    AdminPage.jsx       │  │
│  │                      │      │                        │  │
│  │ BookDataProvider     │      │  BookDataProvider      │  │
│  │ isAdminMode={false} │      │  isAdminMode={true}   │  │
│  │        ↓             │      │        ↓               │  │
│  │ queryKey:            │      │ queryKey:              │  │
│  │ ["books","public"]   │      │ ["books","admin"]      │  │
│  │        ↓             │      │        ↓               │  │
│  │ fetchPublishedBooks()│      │ fetchBooks()           │  │
│  │        ↓             │      │        ↓               │  │
│  │ .eq('is_published',  │      │ (no filter!)           │  │
│  │      true) ✅         │      │                        │  │
│  │                      │      │ Returns ALL books ✅   │  │
│  └──────────────────────┘      └───────────────────────┘  │
│                                                              │
│  Public users see:               Admin users see:           │
│  - Only published books          - Published books          │
│                                  - Unpublished drafts       │
└─────────────────────────────────────────────────────────────┘

FIXED: Separate data contexts!
       Separate query keys!
       Separate cache!
```

## Mutation Flow (After - ✅ No Race Conditions)

```
User edits title
     ↓
updateBookMetaMutation.mutate()
     ↓
onSuccess:
  1. Update React Query cache ✅
  2. Done! No refetch! ✅
     ↓
     Cache update is instant
     ↓
     User sees their edit immediately
     ↓
     Database writes happen in background
     ↓
     Next natural refetch (on page load, etc.) gets fresh data
```

---

## Query Key Strategy

### Before:
```javascript
// Single shared cache
queryKey: ["books"]

// Problem: Admin and public share the same data!
```

### After:
```javascript
// Separate caches
queryKey: isAdminMode ? ["books", "admin"] : ["books", "public"]

// Admin cache: ["books", "admin"] - ALL books
// Public cache: ["books", "public"] - PUBLISHED only

// These don't interfere with each other!
```

---

## Fetch Function Selection

```javascript
// In BookDataProvider
const fetchFunction = isAdminMode 
  ? fetchBooks              // No filter - returns all books
  : async () => {           // Lazy load for public
      const { fetchPublishedBooks } = await import('../lib/supabaseQueries');
      return fetchPublishedBooks();  // Filtered - only published
    };
```

---

## Component Tree

```
main.jsx
  ↓
App.jsx (BrowserRouter)
  ├─ Route: /
  │    ↓
  │  PublicScene
  │    ↓
  │  BookDataProvider (isAdminMode=false)
  │    ↓
  │  SceneLayout
  │    ├─ UI
  │    ├─ Landing
  │    └─ PWAInstallPrompt
  │
  └─ Route: /admin
       ↓
     AdminPage
       ↓
     BookDataProvider (isAdminMode=true) ← Auth check happens HERE
       ↓
     SceneLayout
       ├─ UI
       ├─ AdminIssuePicker  ← Uses admin context
       ├─ Dashboard         ← Uses admin context
       └─ LoginPanel (if not authenticated)
```

---

## Cache Behavior

### Creating New Book (Admin)
```
1. Admin clicks "Create New Issue"
2. createNewBookMutation.mutate()
3. Supabase INSERT { is_published: false, ... }
4. onSuccess:
   - Add to cache ["books", "admin"] ✅
   - Set as active book ✅
   - Refetch to get full data with pages ✅
5. Book appears in admin list ✅

--- Switch to Public Tab ---
6. Public page has cache ["books", "public"]
7. Different query key = different cache!
8. Unpublished book NOT in public cache ✅
9. Public users don't see it ✅
```

### Editing Book (Admin)
```
1. Admin changes title
2. updateBookMetaMutation.mutate({ title: "New Title" })
3. Supabase UPDATE
4. onSuccess:
   - Update cache ["books", "admin"] immediately ✅
   - NO refetch (prevents race condition) ✅
5. Title changes instantly in UI ✅
6. Cache and database now in sync ✅
```

### Page Refresh (Admin)
```
1. Admin refreshes page (F5)
2. AdminPage useEffect runs
3. Checks Supabase session ✅
4. Session exists → setIsAuthed(true) ✅
5. BookDataProvider isAdminMode=true
6. React Query fetches ["books", "admin"]
7. fetchBooks() returns ALL books ✅
8. UI renders with full admin interface ✅
```

---

## File Changes Summary

### Modified Files (7 total)

#### 1. `src/lib/supabaseQueries.js`
- ❌ Removed: `.eq('is_published', true)` from fetchBooks
- ✅ Added: `fetchPublishedBooks()` function for public

#### 2. `src/context/BookDataContext.jsx`
- ✅ Added: `isAdminMode` prop
- ✅ Added: Conditional fetch function selection
- ✅ Changed: Query key to include mode
- ❌ Removed: Unnecessary `refetch()` calls in mutations

#### 3. `src/routes/AdminPage.jsx`
- ✅ Added: BookDataProvider wrapper with isAdminMode=true
- ✅ Added: Import for BookDataProvider

#### 4. `src/routes/PublicScene.jsx`
- ✅ Added: BookDataProvider wrapper with isAdminMode=false
- ✅ Added: Import for BookDataProvider

#### 5. `src/main.jsx`
- ❌ Removed: BookDataProvider (moved to routes)
- ❌ Removed: Import for BookDataProvider

#### 6. `src/components/Dashboard.jsx`
- ✅ Improved: handleSaveAll error checking

#### 7. `src/components/AdminIssuePicker.jsx`
- ❌ Removed: Premature close on create

---

## Benefits of New Architecture

### 1. **Data Isolation** ✅
- Admin data separate from public data
- No cross-contamination
- Different cache keys prevent conflicts

### 2. **Performance** ✅
- Removed unnecessary network requests (refetch)
- Optimistic updates feel instant
- Lazy loading for public fetch function

### 3. **Security** ✅
- Public users can't access unpublished books
- Even if they inspect React Query cache
- Separate query keys enforce separation

### 4. **Maintainability** ✅
- Clear separation of concerns
- Each route owns its data provider
- Easy to add route-specific optimizations

### 5. **User Experience** ✅
- No more flickering edits
- No more disappearing books
- Immediate visual feedback
- Persistent admin state

---

## Migration Path

### If you need to rollback:

1. **Revert main.jsx**: Add BookDataProvider back
2. **Revert route files**: Remove BookDataProvider wrappers
3. **Revert queries**: Add back `.eq('is_published', true)`
4. **Revert mutations**: Add back `refetch()` calls

But you shouldn't need to! This architecture is solid. 🚀
