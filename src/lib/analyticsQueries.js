import { supabase, isSupabaseConfigured } from "./supabaseClient";

// Fetch analytics for a book
export const fetchBookAnalytics = async (bookId, dateFrom, dateTo) => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      pageViews: {},
      clicks: {},
      hovers: {},
      dwellTimes: {},
      totalViews: 0,
      uniqueDevices: 0,
    };
  }

  try {
    const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = dateTo || new Date().toISOString();

    // Fetch all events for the book in date range
    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("*")
      .eq("book_id", bookId)
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Aggregate data
    const pageViews = {};
    const clicks = {};
    const hovers = {};
    const dwellTimes = {};
    const devices = new Set();

    events.forEach((event) => {
      const pageNum = event.page_number;

      // Count views
      if (event.event_type === "view") {
        pageViews[pageNum] = (pageViews[pageNum] || 0) + 1;
        if (event.device_id) devices.add(event.device_id);
      }

      // Aggregate clicks for heatmap
      if (event.event_type === "click") {
        if (!clicks[pageNum]) clicks[pageNum] = [];
        clicks[pageNum].push({
          x: event.position_x || 0.5,
          y: event.position_y || 0.5,
          timestamp: event.created_at,
        });
      }

      // Aggregate hovers for heatmap
      if (event.event_type === "hover") {
        if (!hovers[pageNum]) hovers[pageNum] = [];
        hovers[pageNum].push({
          x: event.position_x || 0.5,
          y: event.position_y || 0.5,
          timestamp: event.created_at,
        });
      }

      // Aggregate dwell times
      if (event.event_type === "dwell" && event.dwell_time_ms) {
        if (!dwellTimes[pageNum]) dwellTimes[pageNum] = [];
        dwellTimes[pageNum].push(event.dwell_time_ms);
      }
    });

    // Calculate average dwell times
    const avgDwellTimes = {};
    Object.keys(dwellTimes).forEach((pageNum) => {
      const times = dwellTimes[pageNum];
      avgDwellTimes[pageNum] =
        times.reduce((sum, t) => sum + t, 0) / times.length;
    });

    return {
      pageViews,
      clicks,
      hovers,
      avgDwellTimes,
      totalViews: events.filter((e) => e.event_type === "view").length,
      uniqueDevices: devices.size,
      events: events.length,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      pageViews: {},
      clicks: {},
      hovers: {},
      dwellTimes: {},
      totalViews: 0,
      uniqueDevices: 0,
    };
  }
};

// Get heatmap data for a specific page
export const getPageHeatmap = (clicks, hovers, width = 10, height = 10) => {
  const grid = Array(height)
    .fill(0)
    .map(() => Array(width).fill(0));

  // Process clicks (higher weight)
  Object.values(clicks).forEach((points) => {
    points.forEach((point) => {
      const x = Math.floor(point.x * width);
      const y = Math.floor(point.y * height);
      if (x >= 0 && x < width && y >= 0 && y < height) {
        grid[y][x] += 3; // Clicks are weighted more
      }
    });
  });

  // Process hovers
  Object.values(hovers).forEach((points) => {
    points.forEach((point) => {
      const x = Math.floor(point.x * width);
      const y = Math.floor(point.y * height);
      if (x >= 0 && x < width && y >= 0 && y < height) {
        grid[y][x] += 1;
      }
    });
  });

  // Normalize to 0-1 range
  const max = Math.max(...grid.flat());
  if (max > 0) {
    return grid.map((row) => row.map((val) => val / max));
  }

  return grid;
};

