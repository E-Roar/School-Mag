import { useState, useEffect } from 'react';
import { useBookData } from '../../context/BookDataContext';
import { fetchBookAnalytics, fetchPageHeatmap } from '../../lib/analyticsQueries';
import { LineChart, BarChart, Heatmap, StatCard } from './Charts';

export const IssueAnalytics = () => {
    const { books, selectedBook, setSelectedBook } = useBookData();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);
    const [heatmapData, setHeatmapData] = useState(null);
    const [period, setPeriod] = useState(30);

    // Load analytics when book changes
    useEffect(() => {
        if (selectedBook) {
            loadAnalytics();
        }
    }, [selectedBook, period]);

    // Load heatmap when page selected
    useEffect(() => {
        if (selectedBook && selectedPage !== null) {
            loadHeatmap();
        }
    }, [selectedBook, selectedPage]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const data = await fetchBookAnalytics(selectedBook.id, period);
            setAnalytics(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadHeatmap = async () => {
        try {
            const data = await fetchPageHeatmap(selectedBook.id, selectedPage, 7);
            setHeatmapData(data);
        } catch (error) {
            console.error('Error loading heatmap:', error);
        }
    };

    if (!selectedBook) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#e0e5ec]">
                <div className="text-center neo-card p-12">
                    <p className="text-xl mb-4 font-bold text-gray-500">📊 No Issue Selected</p>
                    <p className="text-sm text-gray-400 mb-6">Select an issue from the sidebar to view detailed analytics</p>
                    {books.length > 0 && (
                        <select
                            onChange={(e) => {
                                const book = books.find(b => b.id === e.target.value);
                                if (book) setSelectedBook(book);
                            }}
                            className="neo-input text-sm"
                        >
                            <option value="">Select an issue...</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id}>{book.title}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#e0e5ec]">
                <div className="neo-card p-12 text-center">
                    <div className="animate-spin-slow text-4xl mb-4">📊</div>
                    <p className="text-gray-500">Loading analytics...</p>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const dailyViewsData = analytics?.dailyViews.map(day => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: day.total_views || 0
    })) || [];

    const topPagesData = analytics?.topPages.slice(0, 10).map(page => ({
        page: `Page ${page.pageNumber}`,
        views: page.views
    })) || [];

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#e0e5ec]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-700">{selectedBook.title}</h1>
                    <p className="text-sm text-gray-500">Detailed Analytics & Insights</p>
                </div>

                <div className="flex items-center gap-2">
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setPeriod(days)}
                            className={`neo-btn text-xs px-4 py-2 transition-all ${period === days
                                    ? 'text-blue-600 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]'
                                    : 'text-gray-600'
                                }`}
                        >
                            {days}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Total Views"
                    value={analytics?.totalViews || 0}
                    icon="👁️"
                    color="blue"
                />
                <StatCard
                    label="Unique Users"
                    value={analytics?.uniqueUsers || 0}
                    icon="👥"
                    color="green"
                />
                <StatCard
                    label="Avg Session"
                    value={`${Math.floor((analytics?.avgSessionDuration || 0) / 60)}m`}
                    icon="⏱️"
                    color="purple"
                />
                <StatCard
                    label="Total Pages"
                    value={selectedBook.pages?.length || 0}
                    icon="📄"
                    color="orange"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Views Trend */}
                <div className="neo-card p-6">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Views Over Time</h2>
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

                {/* Top Pages */}
                <div className="neo-card p-6">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Most Viewed Pages</h2>
                    {topPagesData.length > 0 ? (
                        <BarChart
                            data={topPagesData}
                            valueKey="views"
                            labelKey="page"
                            height={250}
                            color="#10b981"
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            No page data available
                        </div>
                    )}
                </div>
            </div>

            {/* Page-Level Analytics Table */}
            <div className="neo-card p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-700 mb-4">Page Performance</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200/50">
                                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Page</th>
                                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Views</th>
                                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Unique Viewers</th>
                                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Avg Dwell Time</th>
                                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Clicks</th>
                                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Exits</th>
                                <th className="text-center py-3 px-4 text-gray-600 font-semibold">Heatmap</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(analytics?.pageStats || []).map((page, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-gray-100 hover:bg-white/30 transition-colors"
                                >
                                    <td className="py-3 px-4 font-medium text-gray-700">
                                        Page {page.pageNumber}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600">
                                        {page.views.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600">
                                        {page.uniqueViewers.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600">
                                        {(page.avgDwellTime / 1000).toFixed(1)}s
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600">
                                        {page.clicks.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600">
                                        {page.exits.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setSelectedPage(page.pageNumber)}
                                            className="neo-btn text-xs px-3 py-1 text-blue-500 hover:scale-105 transition-transform"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!analytics?.pageStats || analytics.pageStats.length === 0) && (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-gray-400">
                                        No page-level data available yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Heatmap Modal/Section */}
            {selectedPage !== null && heatmapData && (
                <div className="neo-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-700">
                            Page {selectedPage} - Interaction Heatmap
                        </h2>
                        <button
                            onClick={() => setSelectedPage(null)}
                            className="neo-btn text-xs px-4 py-2 text-gray-600"
                        >
                            Close
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Heatmap
                            grid={heatmapData.clickGrid}
                            width={300}
                            height={400}
                            label="Click Heatmap"
                        />
                        <Heatmap
                            grid={heatmapData.hoverGrid}
                            width={300}
                            height={400}
                            label="Hover Heatmap"
                        />
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-blue-50/50">
                        <p className="text-sm text-gray-600">
                            <strong>💡 Tip:</strong> Darker areas indicate higher user engagement.
                            Use this data to understand which parts of the page attract the most attention.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
