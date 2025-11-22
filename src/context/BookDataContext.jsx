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

const BookDataContext = createContext();

const normalizePages = (pages) => {
  if (!pages || pages.length === 0) return [];
  // Ensure cover (page 0) exists
  const hasCover = pages.some((p) => p.page_number === 0 || p.label === "Cover");
  if (!hasCover) {
    return [
      {
        frontSrc: defaultPagePlaceholder,
        backSrc: defaultPagePlaceholder,
        label: "Cover",
        page_number: 0,
      },
      ...pages,
    ];
  }
  return pages;
};

const createBlankSpread = (spreadNumber) => ({
  frontSrc: defaultPagePlaceholder,
  backSrc: defaultPagePlaceholder,
  label: `New Spread ${spreadNumber}`,
});

const withVisualDefaults = (visual = {}) => ({
  ...defaultVisualSettings,
  ...visual,
  marqueeTexts:
    visual.marqueeTexts && visual.marqueeTexts.length
      ? visual.marqueeTexts
      : defaultVisualSettings.marqueeTexts,
  floatIntensity:
    typeof visual.floatIntensity === "number"
      ? visual.floatIntensity
      : defaultVisualSettings.floatIntensity,
  rotationIntensity:
    typeof visual.rotationIntensity === "number"
      ? visual.rotationIntensity
      : defaultVisualSettings.rotationIntensity,
  floatSpeed:
    typeof visual.floatSpeed === "number"
      ? visual.floatSpeed
      : defaultVisualSettings.floatSpeed,
});

const hydrateBook = (book) => ({
  ...book,
  pages: normalizePages(book.pages ?? []),
  visualSettings: withVisualDefaults(book.visualSettings),
  listOfContent: book.listOfContent || "",
});

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
    data: books = defaultBooks.map(hydrateBook),
    isLoading,
    refetch,
  } = useQuery({
    queryKey: isAdminMode ? ["books", "admin"] : ["books", "public"],
    queryFn: async () => {
      try {
        return await fetchFunction()
      } catch (error) {
        console.error('Failed to fetch books, using defaults:', error)
        return defaultBooks.map(hydrateBook)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once
    retryDelay: 1000,
    // Ensure we always have data
    placeholderData: defaultBooks.map(hydrateBook),
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
      if (!book) {
        throw new Error('Book not found');
      }

      const page = book.pages[pageIndex];
      if (!page) {
        throw new Error('Page not found');
      }

      // If it's a URL string, just update locally
      if (typeof file === "string") {
        return { bookId, pageIndex, side, url: file };
      }

      // Upload to Supabase Storage
      if (isSupabaseConfigured && supabase && file) {
        try {
          const url = await uploadPageImage(file, bookId, pageIndex, side);

          // Check if upload actually succeeded (uploadPageImage returns null on failure)
          if (!url || url.includes('blob:')) {
            throw new Error('Image upload failed - check Supabase Storage RLS policies');
          }

          // Update database
          const pageNumber = pageIndex;
          const fieldName = side === "front" ? "front_asset_path" : "back_asset_path";
          const path = `${bookId}/${pageIndex}-${side}.${file.name.split(".").pop()}`;

          const { error } = await supabase
            .from("pages")
            .update({ [fieldName]: path })
            .eq("book_id", bookId)
            .eq("page_number", pageNumber);

          if (error) {
            console.error('Database update error:', error);
            throw new Error(`Failed to update page in database: ${error.message}`);
          }

          return { bookId, pageIndex, side, url };
        } catch (error) {
          console.error('Upload error:', error);
          throw error; // Re-throw to trigger onError handler
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
    onSuccess: ({ bookId, pageIndex, side, url }) => {
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      queryClient.setQueryData(queryKey, (oldBooks) =>
        oldBooks.map((book) => {
          if (book.id !== bookId) return book;
          const sideKey = side === "front" ? "frontSrc" : "backSrc";
          const updatedPages = book.pages.map((page, idx) =>
            idx === pageIndex ? { ...page, [sideKey]: url } : page
          );
          return hydrateBook({ ...book, pages: updatedPages });
        })
      );
      // Cache update is sufficient; refetch removed to prevent race conditions
    },
    onError: (error) => {
      console.error("Error updating page image:", error);
      alert(`Failed to update page image: ${error.message || 'Unknown error'}`);
    },
  });

  const updatePageImage = (bookId, pageIndex, side, file) => {
    updatePageImageMutation.mutate({ bookId, pageIndex, side, file });
  };

  const addPageMutation = useMutation({
    mutationFn: async (bookId) => {
      const book = books.find((b) => b.id === bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      if (isSupabaseConfigured && supabase) {
        // Query database to find the highest page_number for this book
        const { data: existingPages, error: queryError } = await supabase
          .from("pages")
          .select("page_number")
          .eq("book_id", bookId)
          .order("page_number", { ascending: false })
          .limit(1);

        if (queryError) {
          console.error('Error querying pages:', queryError);
          throw queryError;
        }

        // Calculate the next page number (insert before the last page which is usually the back cover)
        // If we have pages [0, 1, 2], we want to insert at position 2 (before the back cover at position 2)
        // So the new order becomes [0, 1, NEW_PAGE(2), OLD_PAGE_2_BECOMES(3)]
        const maxPageNumber = existingPages && existingPages.length > 0
          ? existingPages[0].page_number
          : 0;

        // Insert at second-to-last position (before back cover)
        // This will be the new max page number
        const newPageNumber = maxPageNumber + 1;

        const { data, error } = await supabase
          .from("pages")
          .insert({
            book_id: bookId,
            page_number: newPageNumber,
            front_asset_path: null,
            back_asset_path: null,
            label: `New Spread ${Math.ceil(newPageNumber / 2)}`,
          })
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        return { bookId, pageNumber: newPageNumber };
      }

      return { bookId, pageNumber: book.pages.length };
    },
    onSuccess: ({ bookId, pageNumber }) => {
      // Trigger refetch to get the new page from database
      refetch();
    },
    onError: (error) => {
      console.error("Error adding page:", error);
      alert(`Failed to add page: ${error.message || 'Unknown error'}. Check console for details.`);
    },
  });

  const addPage = (bookId) => {
    addPageMutation.mutate(bookId);
  };

  const removePageMutation = useMutation({
    mutationFn: async ({ bookId, pageIndex }) => {
      const book = books.find((b) => b.id === bookId);
      if (!book || pageIndex <= 0 || pageIndex >= book.pages.length - 1) {
        return;
      }

      if (isSupabaseConfigured && supabase) {
        const page = book.pages[pageIndex];
        // Find page by page_number in database
        const { data: dbPage } = await supabase
          .from("pages")
          .select("id, page_number")
          .eq("book_id", bookId)
          .order("page_number")
          .limit(1)
          .offset(pageIndex)
          .single();

        if (dbPage) {
          await supabase.from("pages").delete().eq("id", dbPage.id);
        }
      }

      return { bookId, pageIndex };
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Error removing page:", error);
      alert(`Failed to remove page: ${error.message || 'Unknown error'}`);
    },
  });

  const removePage = (bookId, pageIndex) => {
    removePageMutation.mutate({ bookId, pageIndex });
  };

  const updateVisualSettingsMutation = useMutation({
    mutationFn: async ({ bookId, changes }) => {
      // Check if we have a valid UUID before trying to update Supabase
      // This prevents 400 errors when working with default/mock data
      const isValidId = isUUID(bookId);

      if (isSupabaseConfigured && supabase && isValidId) {
        const book = books.find((b) => b.id === bookId);
        if (!book) return;

        const nextVisual = withVisualDefaults({
          ...book.visualSettings,
          ...changes,
        });

        await supabase
          .from("books")
          .update({ visual_settings: nextVisual })
          .eq("id", bookId);

        return { bookId, visualSettings: nextVisual };
      } else if (isSupabaseConfigured && !isValidId) {
        console.warn("Skipping Supabase update for non-UUID book ID:", bookId);
      }

      return { bookId, visualSettings: changes };
    },
    onSuccess: ({ bookId, visualSettings }) => {
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      queryClient.setQueryData(queryKey, (oldBooks) =>
        oldBooks.map((book) =>
          book.id === bookId
            ? { ...book, visualSettings: withVisualDefaults(visualSettings) }
            : book
        )
      );
      // Cache update is sufficient; refetch removed to prevent race conditions
    },
    onError: (error) => {
      console.error("Error updating visual settings:", error);
      alert(`Failed to update visual settings: ${error.message || 'Unknown error'}`);
    },
  });

  const updateVisualSettings = (bookId, changes) => {
    updateVisualSettingsMutation.mutate({ bookId, changes });
  };

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
        };

        await supabase.from("books").update(updateData).eq("id", bookId);
      } else if (isSupabaseConfigured && !isValidId) {
        console.warn("Skipping Supabase update for non-UUID book ID:", bookId);
      }

      return { bookId, changes };
    },
    onSuccess: ({ bookId, changes }) => {
      const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
      queryClient.setQueryData(queryKey, (oldBooks) =>
        oldBooks.map((book) =>
          book.id === bookId ? hydrateBook({ ...book, ...changes }) : book
        )
      );
      // Cache update is sufficient; refetch removed to prevent race conditions
    },
    onError: (error) => {
      console.error("Error updating book metadata:", error);
      alert(`Failed to update book: ${error.message || 'Unknown error'}`);
    },
  });

  const updateBookMeta = (bookId, changes) => {
    updateBookMetaMutation.mutate({ bookId, changes });
  };

  const createNewBookMutation = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured || !supabase) {
        alert("Supabase not configured. Cannot create new book.");
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
        is_published: false, // Draft by default
      };

      const { data, error } = await supabase
        .from("books")
        .insert(newBook)
        .select()
        .single();

      if (error) {
        console.error("Supabase INSERT error:", error);
        throw error;
      }

      // Add a cover page
      await supabase.from("pages").insert({
        book_id: data.id,
        page_number: 0,
        label: "Cover",
        front_asset_path: null,
        back_asset_path: null
      });

      return hydrateBook(data);
    },
    onSuccess: (newBook) => {
      if (newBook) {
        const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
        queryClient.setQueryData(queryKey, (oldBooks) => [newBook, ...oldBooks]);
        setActiveBookId(newBook.id);
        refetch();
      }
    },
    onError: (error) => {
      console.error("Error creating new book:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      alert(`Failed to create new issue: ${error.message || 'Unknown error'}. Check browser console for details.`);
    },
  });

  function createNewBook() {
    createNewBookMutation.mutate();
  }

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId) => {
      if (!isSupabaseConfigured || !supabase) {
        alert("Supabase not configured. Cannot delete book.");
        return;
      }

      if (!isUUID(bookId)) {
        console.warn("Cannot delete book with invalid UUID:", bookId);
        return;
      }

      const { error } = await supabase.from("books").delete().eq("id", bookId);

      if (error) throw error;

      return bookId;
    },
    onSuccess: (deletedBookId) => {
      if (deletedBookId) {
        const queryKey = isAdminMode ? ["books", "admin"] : ["books", "public"];
        queryClient.setQueryData(queryKey, (oldBooks) =>
          oldBooks.filter((b) => b.id !== deletedBookId)
        );

        if (activeBookId === deletedBookId) {
          const remainingBooks = queryClient.getQueryData(queryKey);
          if (remainingBooks && remainingBooks.length > 0) {
            setActiveBookId(remainingBooks[0].id);
          } else {
            setActiveBookId(null);
          }
        }
        // Cache update is sufficient
      }
    },
    onError: (error) => {
      console.error("Error deleting book:", error);
      alert(`Failed to delete issue: ${error.message || 'Unknown error'}`);
    },
  });

  function deleteBook(bookId) {
    deleteBookMutation.mutate(bookId);
  }

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
