import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBookData } from "../context/BookDataContext";
import { fetchBookAnalytics, getPageHeatmap } from "../lib/analyticsQueries";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const AnalyticsPanel = ({ isOpen, onClose }) => {
  const { books } = useBookData();
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [dateRange, setDateRange] = useState(30); // days
  const [selectedPage, setSelectedPage] = useState(null);

  useEffect(() => {
    if (books.length > 0 && !selectedBookId) {
      setSelectedBookId(books[0].id);
    }
  }, [books, selectedBookId]);

  const dateFrom = new Date(
    Date.now() - dateRange * 24 * 60 * 60 * 1000
  ).toISOString();
  const dateTo = new Date().toISOString();

  const {
    data: analytics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["analytics", selectedBookId, dateFrom, dateTo],
    queryFn: () => fetchBookAnalytics(selectedBookId, dateFrom, dateTo),
    enabled: !!selectedBookId && isOpen,
    staleTime: 60 * 1000, // 1 minute
  });

  if (!isOpen) return null;

  const selectedBook = books.find((b) => b.id === selectedBookId);

  // Prepare chart data
  const pageViewData = analytics
    ? Object.keys(analytics.pageViews)
        .map((pageNum) => ({
          page: `Page ${pageNum}`,
          views: analytics.pageViews[pageNum],
          clicks:
            analytics.clicks[pageNum]?.length || 0,
          avgDwell:
            analytics.avgDwellTimes[pageNum]
              ? Math.round(analytics.avgDwellTimes[pageNum] / 1000)
              : 0,
        }))
        .sort((a, b) => parseInt(a.page.split(" ")[1]) - parseInt(b.page.split(" ")[1]))
    : [];

  const heatmapData = selectedPage && analytics
    ? getPageHeatmap(
        { [selectedPage]: analytics.clicks[selectedPage] || [] },
        { [selectedPage]: analytics.hovers[selectedPage] || [] }
      )
    : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="pointer-events-auto glass-panel w-full max-w-6xl max-h-[90vh] rounded-3xl border border-white/20 shadow-neon overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
            <p className="text-sm text-white/60 mt-1">
              Track engagement, clicks, and heatmaps for each issue
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-white transition"
          >
            Close
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-white/10 flex gap-4 flex-wrap items-center">
          <label className="text-sm text-white/80">
            Issue:
            <select
              value={selectedBookId || ""}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="ml-2 rounded-lg bg-white/10 border border-white/20 px-3 py-1 text-white"
            >
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.issueTag}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-white/80">
            Date Range:
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="ml-2 rounded-lg bg-white/10 border border-white/20 px-3 py-1 text-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </label>
          <button
            onClick={() => refetch()}
            className="rounded-full bg-white/20 hover:bg-white/30 px-4 py-1 text-white text-sm transition"
          >
            Refresh
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto glass-scroll p-6 space-y-6">
          {isLoading ? (
            <div className="text-center text-white/60 py-12">Loading analytics...</div>
          ) : analytics ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-panel rounded-xl p-4 border border-white/10">
                  <p className="text-xs uppercase tracking-widest text-white/60">Total Views</p>
                  <p className="text-3xl font-bold text-white mt-2">{analytics.totalViews}</p>
                </div>
                <div className="glass-panel rounded-xl p-4 border border-white/10">
                  <p className="text-xs uppercase tracking-widest text-white/60">Unique Devices</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {analytics.uniqueDevices}
                  </p>
                </div>
                <div className="glass-panel rounded-xl p-4 border border-white/10">
                  <p className="text-xs uppercase tracking-widest text-white/60">Total Events</p>
                  <p className="text-3xl font-bold text-white mt-2">{analytics.events || 0}</p>
                </div>
                <div className="glass-panel rounded-xl p-4 border border-white/10">
                  <p className="text-xs uppercase tracking-widest text-white/60">Pages Tracked</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {Object.keys(analytics.pageViews).length}
                  </p>
                </div>
              </div>

              {/* Page Views Chart */}
              {pageViewData.length > 0 && (
                <div className="glass-panel rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Page Engagement</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pageViewData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="page" stroke="rgba(255,255,255,0.6)" />
                      <YAxis stroke="rgba(255,255,255,0.6)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="views" fill="#60a5fa" name="Views" />
                      <Bar dataKey="clicks" fill="#34d399" name="Clicks" />
                      <Bar dataKey="avgDwell" fill="#f59e0b" name="Avg Dwell (s)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Heatmap Selector */}
              {selectedBook && selectedBook.pages.length > 0 && (
                <div className="glass-panel rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Page Heatmap</h3>
                  <select
                    value={selectedPage || ""}
                    onChange={(e) => setSelectedPage(e.target.value ? Number(e.target.value) : null)}
                    className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white mb-4"
                  >
                    <option value="">Select a page...</option>
                    {selectedBook.pages.map((_, idx) => (
                      <option key={idx} value={idx}>
                        Page {idx} - {selectedBook.pages[idx]?.label || `Spread ${idx}`}
                      </option>
                    ))}
                  </select>

                  {heatmapData && (
                    <div className="rounded-lg overflow-hidden border border-white/10">
                      <div
                        className="grid gap-0 p-4 bg-black/20"
                        style={{
                          gridTemplateColumns: `repeat(${heatmapData[0]?.length || 10}, 1fr)`,
                        }}
                      >
                        {heatmapData.map((row, y) =>
                          row.map((intensity, x) => (
                            <div
                              key={`${x}-${y}`}
                              className="aspect-square"
                              style={{
                                backgroundColor: `rgba(34, 211, 153, ${intensity})`,
                                border: "1px solid rgba(255,255,255,0.05)",
                              }}
                              title={`Intensity: ${(intensity * 100).toFixed(0)}%`}
                            />
                          ))
                        )}
                      </div>
                      <p className="text-xs text-white/50 p-2 text-center">
                        Heatmap shows click and hover intensity. Green = higher engagement.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-white/60 py-12">
              No analytics data available for this period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

