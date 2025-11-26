// Mock Analytics Data for Demo Mode
// Used to show example data when users try demo login

export const generateMockAnalytics = (books) => {
    const today = new Date();

    // Generate daily stats for the past 30 days
    const dailyStats = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (29 - i));

        return {
            date: date.toISOString().split('T')[0],
            total_views: Math.floor(Math.random() * 200) + 50,
            unique_users: Math.floor(Math.random() * 80) + 20,
            total_sessions: Math.floor(Math.random() * 120) + 30,
            avg_session_duration_seconds: Math.floor(Math.random() * 300) + 60,
            mobile_users: Math.floor(Math.random() * 40) + 10,
            desktop_users: Math.floor(Math.random() * 50) + 20,
            tablet_users: Math.floor(Math.random() * 10) + 2,
        };
    });

    // Calculate totals
    const totals = dailyStats.reduce((acc, day) => ({
        totalViews: acc.totalViews + day.total_views,
        uniqueUsers: acc.uniqueUsers + day.unique_users,
        totalSessions: acc.totalSessions + day.total_sessions,
        mobileUsers: acc.mobileUsers + day.mobile_users,
        desktopUsers: acc.desktopUsers + day.desktop_users,
        tabletUsers: acc.tabletUsers + day.tablet_users,
    }), {
        totalViews: 0,
        uniqueUsers: 0,
        totalSessions: 0,
        mobileUsers: 0,
        desktopUsers: 0,
        tabletUsers: 0,
    });

    // Generate top books
    const topBooks = books.slice(0, 3).map((book, i) => ({
        book_id: book.id,
        views: Math.floor(Math.random() * 500) + 200 - (i * 50),
        users: Math.floor(Math.random() * 200) + 80 - (i * 20),
    })).sort((a, b) => b.views - a.views);

    return {
        totalViews: totals.totalViews,
        uniqueUsers: totals.uniqueUsers,
        totalSessions: totals.totalSessions,
        avgSessionDuration: 180, // 3 minutes average
        topBooks,
        dailyStats,
        deviceBreakdown: {
            mobile: totals.mobileUsers,
            desktop: totals.desktopUsers,
            tablet: totals.tabletUsers,
        }
    };
};

export const generateMockBookAnalytics = (book) => {
    const pageCount = book.pages?.length || 10;

    // Generate daily views for past 30 days
    const dailyViews = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));

        return {
            date: date.toISOString().split('T')[0],
            total_views: Math.floor(Math.random() * 50) + 10,
            unique_users: Math.floor(Math.random() * 30) + 5,
            total_sessions: Math.floor(Math.random() * 40) + 8,
        };
    });

    // Generate page stats
    const pageStats = Array.from({ length: pageCount }, (_, i) => ({
        pageNumber: i,
        views: Math.floor(Math.random() * 100) + 20,
        uniqueViewers: Math.floor(Math.random() * 50) + 10,
        avgDwellTime: Math.floor(Math.random() * 15000) + 3000, // 3-18 seconds
        clicks: Math.floor(Math.random() * 30) + 2,
        exits: Math.floor(Math.random() * 10) + 1,
    }));

    const topPages = [...pageStats]
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    const totalViews = dailyViews.reduce((sum, day) => sum + day.total_views, 0);
    const totalUsers = dailyViews.reduce((sum, day) => sum + day.unique_users, 0);

    return {
        totalViews,
        uniqueUsers: totalUsers,
        avgSessionDuration: 210, // 3.5 minutes
        dailyViews,
        pageStats,
        topPages,
    };
};

export const generateMockHeatmap = () => {
    const size = 10;

    // Generate click heatmap
    const clickGrid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.random() * 0.8)
    );

    // Generate hover heatmap
    const hoverGrid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.random() * 0.6)
    );

    return {
        clickGrid,
        hoverGrid,
    };
};
