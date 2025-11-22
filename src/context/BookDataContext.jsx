import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBooks,
  uploadPageImage,
  supabase,
  isSupabaseConfigured,
  isUUID,
} from "../lib/supabaseQueries";
import {
  defaultBooks,
  defaultPagePlaceholder,
  defaultVisualSettings,
} from "../data/defaultBooks";
import { hydrateBook, withVisualDefaults } from "../utils/bookUtils";

const BookDataContext = createContext();

export const BookDataProvider = ({ children, isAdminMode = false }) => {
  const queryClient = useQueryClient();
  const [activeBookId, setActiveBookId] = useState(null);

  // Import the appropriate fetch function based on mode
  const fetchFunction = isAdminMode ? fetchBooks : async () => {
    const { fetchPublishedBooks } = await import('../lib/supabaseQueries');
    return fetchPublishedBooks();
  };

  // Fetch books from Supabase or use defaults
  const {
    data: books = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: isAdminMode ? ["books", "admin"] : ["books", "public"],
    queryFn: async () => {
      try {
        const fetchedBooks = await fetchFunction();
        return fetchedBooks.map(hydrateBook);
      } catch (error) {
        console.error('Failed to fetch books, using defaults:', error)
        return defaultBooks.map(hydrateBook)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once
    retryDelay: 1000,
    // Removed placeholderData to prevent showing stale/default data on load
  });

  // Initialize active book
  useEffect(() => {
    if (books.length > 0 && !activeBookId) {
      setActiveBookId(books[0].id);
    }
  }, [books, activeBookId]);

  const selectedBook = useMemo(
    () => books.find((book) => book.id === activeBookId) ?? null,
    [books, activeBookId]
  );

  const updatePageImageMutation = useMutation({
    mutationFn: async ({ bookId, pageIndex, side, file }) => {
      const book = books.find((b) => b.id === bookId);
      if (!book) throw new Error('Book not found');

      const page = book.pages[pageIndex];
      if (!page) throw new Error('Page not found');

      // If it's a URL string, update database with that URL (or null if empty)
      if (typeof file === "string") {
        if (isSupabaseConfigured && supabase) {
          const pageNumber = pageIndex;
          const fieldName = side === "front" ? "front_asset_path" : "back_asset_path";

          let path = file;
          if (file.includes('DSC00933.jpg')) {
            path = null; // Clear the path in DB to revert to default
          }

          const { error } = await supabase
            .from("pages")
            .update({
              [fieldName]: path,
              updated_at: new Date().toISOString()
            })
            .eq("book_id", bookId)
            .eq("page_number", pageNumber);

          if (error) throw error;
        }
        return { bookId, pageIndex, side, url: file };
      }

      // Upload to Supabase Storage
      if (isSupabaseConfigured && supabase && file) {
        try {
          const url = await uploadPageImage(file, bookId, pageIndex, side);

          // Check if upload actually succeeded
          if (!url || url.includes('blob:')) {
            throw new Error('Image upload failed - check Supabase Storage RLS policies');
          }

          // Update database
          const pageNumber = pageIndex;
          const fieldName = side === "front" ? "front_asset_path" : "back_asset_path";
          const path = `${bookId}/${pageIndex}-${side}.${file.name.split(".").pop()}`;

          const { error } = await supabase
            .from("pages")
            .update({
              [fieldName]: path,
              updated_at: new Date().toISOString()
            })
            .eq("book_id", bookId)
            .eq("page_number", pageNumber);

          if (error) {
            console.error('Database update error:', error);
            throw new Error(`Failed to update page in database: ${error.message}`);
          }

          return { bookId, pageIndex, side, url };
        } catch (error) {
          console.error('Upload error:', error);
          throw error;
        }
      }

      // Fallback to blob URL
      return {
        bookId,
        pageIndex,
        side,
        url: URL.createObjectURL(file),
      };
    },
    onMutate: async ({ bookId, pageIndex, side, file }) => {
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      await queryClient.cancelQueries({ queryKey });
      const previousBooks = queryClient.getQueryData(queryKey);

      // Create a temporary URL for immediate display
      const tempUrl = typeof file === "string" ? file : URL.createObjectURL(file);

      queryClient.setQueryData(queryKey, (oldBooks) => {
        return oldBooks.map(book => {
          if (book.id !== bookId) return book;

          const sideKey = side === "front" ? "frontSrc" : "backSrc";
          const updatedPages = book.pages.map((page, idx) =>
            idx === pageIndex ? { ...page, [sideKey]: tempUrl } : page
          );

          return hydrateBook({ ...book, pages: updatedPages });
        });
      });

      return { previousBooks };
    },
    onError: (error, variables, context) => {
      console.error("Error updating page image:", error);
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      queryClient.setQueryData(queryKey, context.previousBooks);
      alert(`Failed to update page image: ${error.message || 'Unknown error'}`);
    },
    onSettled: () => {
      // Invalidate both admin and public queries to ensure sync across views
      queryClient.invalidateQueries({ queryKey: ["books"] });
    }
  });

  const updatePageImage = (bookId, pageIndex, side, file) => {
    updatePageImageMutation.mutate({ bookId, pageIndex, side, file });
  };

  const addPageMutation = useMutation({
    mutationFn: async (bookId) => {
      const book = books.find((b) => b.id === bookId);
      if (!book) throw new Error('Book not found');

      if (isSupabaseConfigured && supabase) {
        // 1. Get the highest page number
        const { data: maxPageData, error: queryError } = await supabase
          .from("pages")
          .select("page_number")
          .eq("book_id", bookId)
          .order("page_number", { ascending: false })
          .limit(1)
          .single();

        if (queryError && queryError.code !== 'PGRST116') throw queryError; // PGRST116 is "no rows found"

        const nextPageNumber = (maxPageData?.page_number ?? 0) + 1;

        // 2. Insert the new page at the end
        const { data, error } = await supabase
          .from("pages")
          .insert({
            book_id: bookId,
            page_number: nextPageNumber,
            front_asset_path: null,
            back_asset_path: null,
            label: `Spread ${nextPageNumber}`,
          })
          .select()
          .single();

        if (error) throw error;

        return { bookId, newPage: data };
      }

      return { bookId, pageNumber: book.pages.length };
    },
    onMutate: async (bookId) => {
      // Optimistic Update
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      await queryClient.cancelQueries({ queryKey });
      const previousBooks = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldBooks) => {
        return oldBooks.map(book => {
          if (book.id !== bookId) return book;

          const pages = [...book.pages];
          const lastPageNumber = pages.length > 0 ? pages[pages.length - 1].page_number : 0;
          const newPageNumber = lastPageNumber + 1;

          // Create new page
          const newPage = {
            id: `temp-${Date.now()}`, // Temp ID
            book_id: bookId,
            page_number: newPageNumber,
            label: `Spread ${newPageNumber}`,
            frontSrc: defaultPagePlaceholder,
            backSrc: defaultPagePlaceholder,
            front_asset_path: null,
            back_asset_path: null
          };

          return hydrateBook({ ...book, pages: [...pages, newPage] });
        });
      });

      return { previousBooks };
    },
    onError: (error, bookId, context) => {
      console.error("Error adding page:", error);
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      queryClient.setQueryData(queryKey, context.previousBooks);
      alert(`Failed to add page: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    }
  });

  const addPage = (bookId) => {
    addPageMutation.mutate(bookId);
  };

  const removePageMutation = useMutation({
    mutationFn: async ({ bookId, pageIndex }) => {
      const book = books.find((b) => b.id === bookId);
      // Prevent removing Cover (0)
      if (!book || pageIndex <= 0) {
        throw new Error("Cannot remove Cover page.");
      }

      if (isSupabaseConfigured && supabase) {
        const pageToRemove = book.pages[pageIndex];

        // Ensure we have a valid page number
        const pageNumber = pageToRemove?.page_number !== undefined ? pageToRemove.page_number : pageIndex;

        if (pageNumber === undefined) {
          throw new Error("Could not determine page number to delete.");
        }

        const { error: deleteError } = await supabase
          .from("pages")
          .delete()
          .eq("book_id", bookId)
          .eq("page_number", pageNumber);

        if (deleteError) throw deleteError;
      }
      return { bookId, pageIndex };
    },
    onMutate: async ({ bookId, pageIndex }) => {
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      await queryClient.cancelQueries({ queryKey });
      const previousBooks = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldBooks) => {
        return oldBooks.map(book => {
          if (book.id !== bookId) return book;
          const newPages = book.pages.filter((_, index) => index !== pageIndex);
          return hydrateBook({ ...book, pages: newPages });
        });
      });

      return { previousBooks };
    },
    onError: (error, variables, context) => {
      console.error("Error removing page:", error);
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      queryClient.setQueryData(queryKey, context.previousBooks);
      alert(`Failed to remove page: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    }
  });

  const removePage = (bookId, pageIndex) => {
    removePageMutation.mutate({ bookId, pageIndex });
  };

  const updateVisualSettingsMutation = useMutation({
    mutationFn: async ({ bookId, changes }) => {
      const isValidId = isUUID(bookId);
      if (isSupabaseConfigured && supabase && isValidId) {
        const book = books.find((b) => b.id === bookId);
        if (!book) return;
        const nextVisual = withVisualDefaults({ ...book.visualSettings, ...changes });
        await supabase.from("books").update({ visual_settings: nextVisual }).eq("id", bookId);
        return { bookId, visualSettings: nextVisual };
      }
      return { bookId, visualSettings: changes };
    },
    onSuccess: ({ bookId, visualSettings }) => {
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      queryClient.setQueryData(queryKey, (oldBooks) =>
        oldBooks.map((book) => book.id === bookId ? { ...book, visualSettings: withVisualDefaults(visualSettings) } : book)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => console.error(error)
  });

  const updateVisualSettings = (bookId, changes) => updateVisualSettingsMutation.mutate({ bookId, changes });

  const updateBookMetaMutation = useMutation({
    mutationFn: async ({ bookId, changes }) => {
      const isValidId = isUUID(bookId);
      if (isSupabaseConfigured && supabase && isValidId) {
        const updateData = {
          title: changes.title,
          subtitle: changes.subtitle,
          issue_tag: changes.issueTag,
          release_date: changes.releaseDate,
          list_of_content: changes.listOfContent,
          is_published: changes.is_published
        };
        await supabase.from("books").update(updateData).eq("id", bookId);
      }
      return { bookId, changes };
    },
    onSuccess: ({ bookId, changes }) => {
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      queryClient.setQueryData(queryKey, (oldBooks) =>
        oldBooks.map((book) => book.id === bookId ? hydrateBook({ ...book, ...changes }) : book)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => console.error(error)
  });

  const updateBookMeta = (bookId, changes) => updateBookMetaMutation.mutate({ bookId, changes });

  const createNewBookMutation = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured || !supabase) {
        alert("Supabase not configured.");
        return;
      }

      const timestamp = new Date().getTime();
      const newBook = {
        title: "New Issue",
        slug: `new-issue-${timestamp}`,
        subtitle: "Coming Soon",
        issue_tag: "Vol. XX",
        release_date: new Date().toISOString().split("T")[0],
        visual_settings: defaultVisualSettings,
        is_published: false,
      };

      const { data, error } = await supabase.from("books").insert(newBook).select().single();
      if (error) throw error;

      // 1. Insert Cover (Page 0)
      await supabase.from("pages").insert({
        book_id: data.id,
        page_number: 0,
        label: "Cover",
        front_asset_path: null,
        back_asset_path: null
      });

      // Removed automatic Back Cover creation as per user request

      return hydrateBook(data);
    },
    onSuccess: (newBook) => {
      if (newBook) {
        const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
        queryClient.setQueryData(queryKey, (oldBooks) => [newBook, ...oldBooks]);
        setActiveBookId(newBook.id);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => {
      console.error("Error creating book:", error);
      alert(`Failed to create issue: ${error.message}`);
    },
  });

  function createNewBook() {
    createNewBookMutation.mutate();
  }

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId) => {
      if (!isSupabaseConfigured || !supabase) return;
      const { error } = await supabase.from("books").delete().eq("id", bookId);
      if (error) throw error;
      return bookId;
    },
    onSuccess: (deletedBookId) => {
      if (deletedBookId) {
        const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
        queryClient.setQueryData(queryKey, (oldBooks) => oldBooks.filter((b) => b.id !== deletedBookId));
        if (activeBookId === deletedBookId) setActiveBookId(null);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => alert(`Failed to delete: ${error.message}`)
  });

  function deleteBook(bookId) {
    deleteBookMutation.mutate(bookId);
  }

  // Cleanup Function
  const cleanupEmptyBooksMutation = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured || !supabase) return;

      // Fetch all books with their pages
      const { data: allBooks, error } = await supabase
        .from("books")
        .select("*, pages(id)");

      if (error) throw error;

      // Identify empty books: Title is "New Issue" AND (no pages OR <= 2 pages)
      // We want to keep at least ONE book if all are empty.
      const emptyBooks = allBooks.filter(b =>
        (b.title === "New Issue" || b.title === "Untitled") &&
        (!b.pages || b.pages.length <= 2)
      );

      // Sort by created_at desc (assuming id or created_at works, usually higher ID is newer)
      // We'll keep the newest one if we have to, or just delete all except the currently selected one?
      // User said: "remove all the issues created that are empty, and only keep one"

      if (emptyBooks.length === 0) return { count: 0 };

      // Keep the most recent one
      const booksToDelete = emptyBooks.slice(1); // Skip the first one (newest)

      if (booksToDelete.length === 0) return { count: 0 };

      const idsToDelete = booksToDelete.map(b => b.id);

      const { error: deleteError } = await supabase
        .from("books")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) throw deleteError;

      return { count: idsToDelete.length };
    },
    onSuccess: ({ count }) => {
      if (count > 0) {
        alert(`Cleaned up ${count} empty issues.`);
      } else {
        alert("No empty issues found to clean up.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => alert(`Cleanup failed: ${error.message}`)
  });

  const cleanupEmptyBooks = () => cleanupEmptyBooksMutation.mutate();

  const value = {
    books,
    selectedBook,
    setActiveBookId,
    updatePageImage,
    addPage,
    removePage,
    updateVisualSettings,
    updateBookMeta,
    isLoading,
    refetch,
    createNewBook,
    deleteBook,
    cleanupEmptyBooks
  };

  return (
    <BookDataContext.Provider value={value}>
      {children}
    </BookDataContext.Provider>
  );
};

export const useBookData = () => {
  const context = useContext(BookDataContext);
  if (!context) {
    throw new Error("useBookData must be used within a BookDataProvider");
  }
  return context;
};
