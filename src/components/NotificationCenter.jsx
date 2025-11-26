import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../context/NotificationContext';

export const NotificationCenter = () => {
    const { notifications, isOpen, setIsOpen, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const popupRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_issue': return '📚';
            case 'success': return '✅';
            case 'warning': return '⚠️';
            default: return '🔔';
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto animate-fade-in"
                onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <div
                ref={popupRef}
                className="relative z-10 w-full max-w-md pointer-events-auto animate-slide-up"
            >
                <div className="neo-card m-4 p-6 max-h-[80vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200/50">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔔</span>
                            <h3 className="text-xl font-bold text-gray-700">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Actions */}
                    {notifications.length > 0 && (
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={markAllAsRead}
                                className="text-xs neo-btn text-blue-500 px-3 py-1 hover:scale-105 transition-transform"
                            >
                                Mark all as read
                            </button>
                        </div>
                    )}

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-6xl mb-4 block opacity-50">🔕</span>
                                <p className="text-gray-400">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const isRead = JSON.parse(localStorage.getItem('readNotifications') || '[]').includes(notification.id);

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => {
                                            markAsRead(notification.id);
                                            if (notification.target_url) {
                                                window.location.href = notification.target_url;
                                            }
                                        }}
                                        className={`
                      p-4 rounded-xl cursor-pointer transition-all duration-300
                      ${isRead
                                                ? 'bg-gray-50 hover:bg-gray-100'
                                                : 'bg-blue-50 hover:bg-blue-100 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.3),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]'
                                            }
                    `}
                                    >
                                        <div className="flex gap-3">
                                            <span className="text-2xl flex-shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-700 mb-1 truncate">
                                                    {notification.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {!isRead && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
