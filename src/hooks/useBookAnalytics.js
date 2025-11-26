import { useEffect, useRef, useCallback } from 'react';
import { recordAnalyticsEvent } from '../lib/supabaseQueries';
import { useBookData } from '../context/BookDataContext';

/**
 * Custom hook for tracking book interactions
 * Tracks: page clicks, navigation clicks, zoom events, page interest (time zoomed)
 */
export const useBookAnalytics = (bookId) => {
    const { selectedBook } = useBookData();
    const currentPageRef = useRef(null);
    const zoomStateRef = useRef({ isZoomed: false, zoomedAt: null, pageNumber: null });
    const sessionStartRef = useRef(Date.now());

    // Track page view
    const trackPageView = useCallback((pageNumber) => {
        if (!bookId) return;

        // Record time spent on previous page if zoomed
        if (zoomStateRef.current.isZoomed && zoomStateRef.current.pageNumber !== null) {
            const duration = Date.now() - zoomStateRef.current.zoomedAt;
            recordAnalyticsEvent({
                event_type: 'page_interest',
                book_id: bookId,
                page_number: zoomStateRef.current.pageNumber,
                metadata: {
                    zoom_duration_ms: duration,
                    interest_score: Math.min(duration / 1000, 100) // Cap at 100 seconds
                }
            });
        }

        currentPageRef.current = pageNumber;

        recordAnalyticsEvent({
            event_type: 'page_view',
            book_id: bookId,
            page_number: pageNumber,
            metadata: {
                timestamp: Date.now(),
                session_duration: Date.now() - sessionStartRef.current
            }
        });
    }, [bookId]);

    // Track page click (double-click to turn page)
    const trackPageClick = useCallback((pageNumber, clickPosition = {}) => {
        if (!bookId) return;

        recordAnalyticsEvent({
            event_type: 'page_click',
            book_id: bookId,
            page_number: pageNumber,
            position_x: clickPosition.x,
            position_y: clickPosition.y,
            metadata: {
                click_type: 'page_turn',
                timestamp: Date.now()
            }
        });
    }, [bookId]);

    // Track navigation button click
    const trackNavClick = useCallback((action, pageNumber) => {
        if (!bookId) return;

        recordAnalyticsEvent({
            event_type: 'navigation_click',
            book_id: bookId,
            page_number: pageNumber,
            metadata: {
                action, // 'next', 'prev', 'front', 'back'
                timestamp: Date.now()
            }
        });
    }, [bookId]);

    // Track zoom in
    const trackZoomIn = useCallback((pageNumber) => {
        if (!bookId) return;

        zoomStateRef.current = {
            isZoomed: true,
            zoomedAt: Date.now(),
            pageNumber
        };

        recordAnalyticsEvent({
            event_type: 'zoom_in',
            book_id: bookId,
            page_number: pageNumber,
            metadata: {
                timestamp: Date.now()
            }
        });
    }, [bookId]);

    // Track zoom out
    const trackZoomOut = useCallback((pageNumber) => {
        if (!bookId) return;

        const zoomDuration = zoomStateRef.current.isZoomed
            ? Date.now() - zoomStateRef.current.zoomedAt
            : 0;

        recordAnalyticsEvent({
            event_type: 'zoom_out',
            book_id: bookId,
            page_number: pageNumber,
            metadata: {
                zoom_duration_ms: zoomDuration,
                timestamp: Date.now()
            }
        });

        // Record interest if zoomed for significant time
        if (zoomDuration > 1000) { // More than 1 second
            recordAnalyticsEvent({
                event_type: 'page_interest',
                book_id: bookId,
                page_number: pageNumber,
                metadata: {
                    zoom_duration_ms: zoomDuration,
                    interest_score: Math.min(zoomDuration / 1000, 100)
                }
            });
        }

        zoomStateRef.current = {
            isZoomed: false,
            zoomedAt: null,
            pageNumber: null
        };
    }, [bookId]);

    // Track session end (cleanup on unmount)
    useEffect(() => {
        return () => {
            // Record final interest metrics if page was zoomed
            if (zoomStateRef.current.isZoomed && zoomStateRef.current.pageNumber !== null) {
                const duration = Date.now() - zoomStateRef.current.zoomedAt;
                recordAnalyticsEvent({
                    event_type: 'page_interest',
                    book_id: bookId,
                    page_number: zoomStateRef.current.pageNumber,
                    metadata: {
                        zoom_duration_ms: duration,
                        interest_score: Math.min(duration / 1000, 100),
                        session_end: true
                    }
                });
            }

            // Record session end
            recordAnalyticsEvent({
                event_type: 'session_end',
                book_id: bookId,
                metadata: {
                    total_duration: Date.now() - sessionStartRef.current
                }
            });
        };
    }, [bookId]);

    return {
        trackPageView,
        trackPageClick,
        trackNavClick,
        trackZoomIn,
        trackZoomOut
    };
};
