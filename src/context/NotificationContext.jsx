import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { fetchNotifications } from '../lib/supabaseQueries';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notifications on mount
    useEffect(() => {
        loadNotifications();
    }, []);

    // Subscribe to realtime updates
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) return;

        const channel = supabase
            .channel('notifications-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    const newNotification = payload.new;
                    setNotifications((prev) => [newNotification, ...prev]);
                    setUnreadCount((prev) => prev + 1);

                    // Show browser notification if permission granted
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(newNotification.title, {
                            body: newNotification.message,
                            icon: '/pwa-192x192.png',
                            badge: '/pwa-192x192.png'
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadNotifications = async () => {
        const data = await fetchNotifications(10);
        setNotifications(data);

        // Check for unread notifications
        const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        const unread = data.filter(n => !readIds.includes(n.id));
        setUnreadCount(unread.length);
    };

    const markAsRead = (notificationId) => {
        const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        if (!readIds.includes(notificationId)) {
            readIds.push(notificationId);
            localStorage.setItem('readNotifications', JSON.stringify(readIds));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        localStorage.setItem('readNotifications', JSON.stringify(allIds));
        setUnreadCount(0);
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
        localStorage.setItem('readNotifications', '[]');
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                isOpen,
                setIsOpen,
                markAsRead,
                markAllAsRead,
                clearAll,
                loadNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
