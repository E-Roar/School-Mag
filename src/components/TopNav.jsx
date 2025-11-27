import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { likeBook, unlikeBook, hasLikedBook } from '../lib/supabaseQueries';
import { useTranslation } from 'react-i18next';

export const TopNav = ({ bookId, bookTitle }) => {
    const { t } = useTranslation();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!bookId) return;

        // Check if already liked
        hasLikedBook(bookId).then(liked => {
            setIsLiked(liked);
        });

        // Get likes count from book data (will be updated when like/unlike)
    }, [bookId]);

    const handleLike = async () => {
        if (!bookId || isAnimating) return;

        setIsAnimating(true);

        try {
            if (isLiked) {
                const newCount = await unlikeBook(bookId);
                setIsLiked(false);
                if (newCount !== null) setLikesCount(newCount);
            } else {
                const newCount = await likeBook(bookId);
                setIsLiked(true);
                if (newCount !== null) setLikesCount(newCount);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex justify-center pt-4 px-4">
            <div className="pointer-events-auto flex items-center gap-3 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 text-white shadow-lg">
                {/* Back Home Button */}
                <Link
                    to="/"
                    className="flex items-center gap-2 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/40 hover:border-white hover:bg-white/10 transition-all whitespace-nowrap"
                    title={t('nav.back_to_site')}
                >
                    <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="hidden sm:inline">{t('nav.home')}</span>
                </Link>

                {/* Book Title (Hidden on very small screens) */}
                {bookTitle && (
                    <div className="hidden md:flex items-center px-3 text-xs font-medium opacity-75 max-w-[200px] truncate">
                        {bookTitle}
                    </div>
                )}

                {/* Like Button */}
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all whitespace-nowrap ${isLiked
                        ? 'border-pink-500 bg-pink-500/20 text-pink-300'
                        : 'border-white/40 hover:border-pink-400 hover:bg-pink-500/10'
                        }`}
                    title={isLiked ? t('common.like') : t('common.like')}
                >
                    <svg
                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isAnimating ? 'scale-125' : 'scale-100'
                            }`}
                        fill={isLiked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    <span className="hidden sm:inline">{isLiked ? t('common.likes') : t('common.like')}</span>
                    {likesCount > 0 && (
                        <span className="font-bold">{likesCount}</span>
                    )}
                </button>
            </div>
        </div>
    );
};
