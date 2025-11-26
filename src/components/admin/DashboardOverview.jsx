import { useEffect, useState } from "react";
import { useBookData } from "../../context/BookDataContext";
import { supabase } from "../../lib/supabaseClient";
import { fetchPlatformStats, fetchBookAnalytics as fetchBookAnalyticsQuery } from "../../lib/analyticsQueries";
import { generateMockAnalytics, generateMockBookAnalytics } from "../../lib/mockAnalytics";
import { LineChart, DonutChart, StatCard, BarChart, Heatmap } from "./Charts";
import { DemoDataNotice } from "./DemoDataNotice";

export const DashboardOverview = () => {
    const { books, isDemoMode } = useBookData();
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [selectedBookId, setSelectedBookId] = useState(null);
    const [bookAnalytics, setBookAnalytics] = useState(null);
    const [showDemoNotice, setShowDemoNotice] = useState(true);

    useEffect(() => {
        fetchLogs();
        fetchAnalytics();
    }, [selectedPeriod]);

    useEffect(() => {
        if (selectedBookId) {
            fetchBookAnalytics();
        } else {
            setBookAnalytics(null);
        }
    }, [selectedBookId, selectedPeriod]);

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setLoadingLogs(false);
        }
    };

    const fetchAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
            if (isDemoMode) {
                // Use mock data in demo mode
                const mockData = generateMockAnalytics(books);
                setAnalytics(mockData);
            } else {
                const data = await fetchPlatformStats(selectedPeriod);
                setAnalytics(data);
            }
        } catch (err) {
            console.error("Error fetching analytics:", err);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const fetchBookAnalytics = async () => {
        if (!selectedBookId) return;

        const selectedBook = books.find(b => b.id === selectedBookId);
        if (!selectedBook) return;

        try {
            if (isDemoMode) {
                // Use mock data in demo mode
                const mockData = generateMockBookAnalytics(selectedBook);
                setBookAnalytics(mockData);
            } else {
                // Use the renamed imported function to avoid recursion
                const data = await fetchBookAnalyticsQuery(selectedBookId, selectedPeriod);
                setBookAnalytics(data);
            }
        } catch (err) {
            console.error("Error fetching book analytics:", err);
        }
    };

    // Prepare stats
    const stats = [
        {
            label: "Total Issues",
            value: books.length,
            icon: "📚",
            color: "blue"
        },
        {
            label: "Published",
            value: books.filter(b => b.is_published).length,
            icon: "✅",
            color: "green"
        },
        {
            label: "Total Pages",
            value: books.reduce((acc, b) => acc + (b.pages?.length || 0), 0),
            icon: "📄",
            color: "purple"
        },
    ];

    if (analytics && !loadingAnalytics) {
        stats.push(
            {
                label: "Total Views",
                value: analytics.totalViews,
                icon: "👁️",
                color: "orange"
            },
            {
                label: "Active Users",
                value: analytics.uniqueUsers,
                icon: "👥",
                color: "blue"
            },
            {
                label: "Avg. Session",
                value: `${Math.floor(analytics.avgSessionDuration / 60)}m`,
                icon: "⏱️",
                color: "purple"
            }
        );
    }

    // Prepare chart data
    const dailyViewsData = analytics?.dailyStats.map(day => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: day.total_views || 0
    })) || [];

    const deviceData = analytics?.deviceBreakdown ? [
        { label: 'Desktop', value: analytics.deviceBreakdown.desktop, color: '#3b82f6' },
        { label: 'Mobile', value: analytics.deviceBreakdown.mobile, color: '#10b981' },
        { label: 'Tablet', value: analytics.deviceBreakdown.tablet, color: '#8b5cf6' },
    ].filter(d => d.value > 0) : [];

    // Book analytics chart data
    const bookDailyViewsData = bookAnalytics?.dailyViews.map(day => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: day.total_views || 0
    })) || [];

    const bookTopPagesData = bookAnalytics?.topPages.slice(0, 10).map(page => ({
        page: `Page ${page.pageNumber}`,
        views: page.views
    })) || [];

    const selectedBook = books.find(b => b.id === selectedBookId);

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#e0e5ec]">
            {/* Demo Notice */}
            {isDemoMode && showDemoNotice && (
                <DemoDataNotice
                    isDemo={isDemoMode}
                    onClose={() => setShowDemoNotice(false)}
                />
            )}

            {/* Header with Period Selector */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-700 tracking-tight">
                    Dashboard Overview
                    {isDemoMode && (
                        <span className="ml-3 text-sm font-normal text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                            🎭 Demo Mode
                        </span>
                    )}
                </h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            fetchLogs();
                            fetchAnalytics();
                            if (selectedBookId) fetchBookAnalytics();
                        }}
                        className="neo-btn text-xs px-3 py-2 text-gray-600 hover:text-blue-600 mr-2"
                        title="Refresh Data"
                    >
                        🔄
                    </button>
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setSelectedPeriod(days)}
                            className={`neo-btn text-xs px-4 py-2 transition-all ${selectedPeriod === days
                                ? 'text-blue-600 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]'
                                : 'text-gray-600'
                                }`}
                        >
                            {days}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div id="dashboard-overview-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <StatCard
                        key={idx}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                    />
                ))}
            </div>

            {/* Issue Selector & Insights */}
            {books.length > 0 && (
                <div className="neo-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-700">Issue Insights</h2>
                        <select
                            value={selectedBookId || ''}
                            onChange={(e) => setSelectedBookId(e.target.value || null)}
                            className="neo-input text-sm max-w-xs"
                        >
                            <option value="">Select an issue to view insights...</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {bookAnalytics && selectedBook ? (
                        <div className="space-y-6">
                            {/* Book Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div className="neo-card p-4 text-center">
                                    <div className="text-2xl mb-1">👁️</div>
                                    <div className="text-2xl font-bold text-gray-700">
                                        {bookAnalytics.totalViews.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase">Total Views</div>
                                </div>
                                <div className="neo-card p-4 text-center">
                                    <div className="text-2xl mb-1">👥</div>
                                    <div className="text-2xl font-bold text-gray-700">
                                        {bookAnalytics.uniqueUsers.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase">Unique Users</div>
                                </div>
                                <div className="neo-card p-4 text-center">
                                    <div className="text-2xl mb-1">❤️</div>
                                    <div className="text-2xl font-bold text-gray-700">
                                        {bookAnalytics.totalLikes || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase">Total Likes</div>
                                </div>
                                <div className="neo-card p-4 text-center">
                                    <div className="text-2xl mb-1">⏱️</div>
                                    <div className="text-2xl font-bold text-gray-700">
                                        {Math.floor(bookAnalytics.avgSessionDuration / 60)}m
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase">Avg Session</div>
                                </div>
                                <div className="neo-card p-4 text-center">
                                    <div className="text-2xl mb-1">📄</div>
                                    <div className="text-2xl font-bold text-gray-700">
                                        {bookAnalytics.totalPages || selectedBook.pages?.length || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase">Total Pages</div>
                                </div>
                                <div className="neo-card p-4 text-center">
                                    <div className="text-2xl mb-1">👆</div>
                                    <div className="text-2xl font-bold text-gray-700">
                                        {bookAnalytics.pageStats.reduce((acc, p) => acc + p.clicks, 0).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase">Total Clicks</div>
                                </div>
                            </div>

                            {/* Book Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="neo-card p-6">
                                    <h3 className="text-md font-bold text-gray-700 mb-4">Views Trend</h3>
                                    <LineChart
                                        data={bookDailyViewsData}
                                        dataKey="views"
                                        xKey="date"
                                        height={200}
                                        color="#10b981"
                                    />
                                </div>
                                <div className="neo-card p-6">
                                    <h3 className="text-md font-bold text-gray-700 mb-4">Top Pages</h3>
                                    <BarChart
                                        data={bookTopPagesData}
                                        valueKey="views"
                                        labelKey="page"
                                        height={200}
                                        color="#8b5cf6"
                                    />
                                </div>
                            </div>

                            {/* Heatmap Section */}
                            {bookAnalytics.heatmapData && (
                                <div className="neo-card p-6">
                                    <h3 className="text-md font-bold text-gray-700 mb-4">Interaction Heatmap (Aggregate)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Heatmap
                                            grid={bookAnalytics.heatmapData.clickGrid}
                                            label="Click Density"
                                            height={300}
                                        />
                                        <Heatmap
                                            grid={bookAnalytics.heatmapData.hoverGrid}
                                            label="Hover Density"
                                            height={300}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : selectedBookId ? (
                        <div className="text-center py-8 text-gray-400">
                            Loading issue analytics...
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            Select an issue above to view detailed insights
                        </div>
                    )}
                </div>
            )}

            {/* Platform Charts */}
            {!loadingAnalytics && analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 neo-card p-6">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Platform Views Trend</h2>
                        {dailyViewsData.length > 0 ? (
                            <LineChart
                                data={dailyViewsData}
                                dataKey="views"
                                xKey="date"
                                height={250}
                                color="#3b82f6"
                            />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">
                                No view data available
                            </div>
                        )}
                    </div>

                    <div className="neo-card p-6 flex flex-col items-center justify-center">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Device Usage</h2>
                        {deviceData.length > 0 ? (
                            <DonutChart data={deviceData} size={180} thickness={30} />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">
                                No device data
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="neo-card p-6">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Recent Activity</h2>
                    {loadingLogs ? (
                        <div className="text-center py-8 text-gray-500">Loading activity...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No recent activity found.</div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 glass-scroll">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]"
                                >
                                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-400 flex-shrink-0 shadow-[0_0_5px_rgba(66,153,225,0.6)]" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{log.action}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="neo-card p-6">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Quick Insights</h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-blue-50/50">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">📈</span>
                                <h3 className="font-bold text-gray-700">Growth Trend</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                {analytics?.totalViews > 0
                                    ? `Platform has received ${analytics.totalViews.toLocaleString()} total views in the past ${selectedPeriod} days.`
                                    : 'Start publishing issues to track growth.'}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-green-50/50">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">💡</span>
                                <h3 className="font-bold text-gray-700">Top Tip</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Use the issue selector above to dive deep into individual issue performance and identify your best content.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-purple-50/50">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">🎯</span>
                                <h3 className="font-bold text-gray-700">Pro Feature</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Select an issue above to view detailed page-by-page insights and heatmaps showing exactly where users click and hover.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
