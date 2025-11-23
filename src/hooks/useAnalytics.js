import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { pageAtom } from "../store";
import { useBookData } from "../context/BookDataContext";
import { recordAnalyticsEvent } from "../lib/supabaseQueries";

export const useAnalytics = () => {
  const { selectedBook } = useBookData();
  const [currentPage] = useAtom(pageAtom);
  const lastPageRef = useRef(null);
  const pageEnterTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Track page views and dwell time
  useEffect(() => {
    if (!selectedBook) return;

    const bookId = selectedBook.id;
    const pageNumber = currentPage;

    // Record page view
    recordAnalyticsEvent({
      book_id: bookId,
      page_number: pageNumber,
      event_type: "view",
    });

    // Track page enter time
    const enterTime = Date.now();
    pageEnterTimeRef.current = enterTime;

    // Cleanup previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Record dwell time every 5 seconds
    intervalRef.current = setInterval(() => {
      if (pageEnterTimeRef.current) {
        const dwellTime = Date.now() - pageEnterTimeRef.current;
        recordAnalyticsEvent({
          book_id: bookId,
          page_number: pageNumber,
          event_type: "dwell",
          dwell_time_ms: dwellTime,
        });
      }
    }, 5000);

    // Record page exit dwell time when page changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (pageEnterTimeRef.current && lastPageRef.current !== null) {
        const dwellTime = Date.now() - pageEnterTimeRef.current;
        if (dwellTime > 1000) {
          // Only record if user spent more than 1 second
          recordAnalyticsEvent({
            book_id: bookId,
            page_number: lastPageRef.current,
            event_type: "dwell",
            dwell_time_ms: dwellTime,
          });
        }
      }

      lastPageRef.current = pageNumber;
    };
  }, [selectedBook, currentPage]);

  // Track page turns
  useEffect(() => {
    if (!selectedBook || lastPageRef.current === null) {
      lastPageRef.current = currentPage;
      return;
    }

    if (lastPageRef.current !== currentPage) {
      recordAnalyticsEvent({
        book_id: selectedBook.id,
        page_number: currentPage,
        event_type: "page_turn",
        payload: {
          from_page: lastPageRef.current,
          to_page: currentPage,
        },
      });
    }
  }, [selectedBook, currentPage]);
};

// Track click events on pages
export const usePageClickTracking = () => {
  const { selectedBook } = useBookData();

  const trackClick = (pageNumber, position) => {
    if (!selectedBook) return;

    recordAnalyticsEvent({
      book_id: selectedBook.id,
      page_number: pageNumber,
      event_type: "click",
      position_x: position.x,
      position_y: position.y,
    });
  };

  const trackHover = (pageNumber, position) => {
    if (!selectedBook) return;

    recordAnalyticsEvent({
      book_id: selectedBook.id,
      page_number: pageNumber,
      event_type: "hover",
      position_x: position.x,
      position_y: position.y,
    });
  };

  return { trackClick, trackHover };
};

