import { supabase, isSupabaseConfigured } from './supabaseClient';

// =====================================================
// DASHBOARD OVERVIEW ANALYTICS
// =====================================================

/**
 * Fetch platform-wide statistics for dashboard
 */
export const fetchPlatformStats = async (days = 30) => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      totalViews: 0,
      uniqueUsers: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      topBooks: [],
      dailyStats: [],
      deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 }
    };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch daily aggregated stats
    const { data: dailyStats, error: dailyError } = await supabase
      .from('analytics_daily_stats')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (dailyError) throw dailyError;

    // Aggregate totals
    const totals = (dailyStats || []).reduce((acc, day) => ({
      totalViews: acc.totalViews + (day.total_views || 0),
      uniqueUsers: acc.uniqueUsers + (day.unique_users || 0),
      totalSessions: acc.totalSessions + (day.total_sessions || 0),
      totalDuration: acc.totalDuration + (day.avg_session_duration_seconds || 0) * (day.total_sessions || 0),
      mobileUsers: acc.mobileUsers + (day.mobile_users || 0),
      desktopUsers: acc.desktopUsers + (day.desktop_users || 0),
      tabletUsers: acc.tabletUsers + (day.tablet_users || 0),
    }), {
      totalViews: 0,
      uniqueUsers: 0,
      totalSessions: 0,
      totalDuration: 0,
      mobileUsers: 0,
      desktopUsers: 0,
      tabletUsers: 0
    });

    // Get top performing books
    const { data: bookStats, error: bookError } = await supabase
      .from('analytics_daily_stats')
      .select('book_id, total_views, unique_users')
      .gte('date', startDate.toISOString().split('T')[0]);

    if (bookError) throw bookError;

    const bookAggregates = (bookStats || []).reduce((acc, stat) => {
      if (!stat.book_id) return acc;
      if (!acc[stat.book_id]) {
        acc[stat.book_id] = { views: 0, users: 0 };
      }
      acc[stat.book_id].views += stat.total_views || 0;
      acc[stat.book_id].users += stat.unique_users || 0;
      return acc;
    }, {});

    const topBooks = Object.entries(bookAggregates)
      .map(([book_id, stats]) => ({ book_id, ...stats }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return {
      totalViews: totals.totalViews,
      uniqueUsers: totals.uniqueUsers,
      totalSessions: totals.totalSessions,
      avgSessionDuration: totals.totalSessions > 0
        ? Math.round(totals.totalDuration / totals.totalSessions)
        : 0,
      topBooks,
      dailyStats: dailyStats || [],
      deviceBreakdown: {
        mobile: totals.mobileUsers,
        desktop: totals.desktopUsers,
        tablet: totals.tabletUsers
      }
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return {
      totalViews: 0,
      uniqueUsers: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      topBooks: [],
      dailyStats: [],
      deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 }
    };
  }
};

/**
 * Fetch detailed analytics for a specific book
 */
export const fetchBookAnalytics = async (bookId, days = 30) => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      totalViews: 0,
      uniqueUsers: 0,
      avgSessionDuration: 0,
      dailyViews: [],
      pageStats: [],
      topPages: []
    };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch daily stats for this book
    const { data: dailyStats, error: dailyError } = await supabase
      .from('analytics_daily_stats')
      .select('*')
      .eq('book_id', bookId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (dailyError) throw dailyError;

    // Fetch page-level stats
    const { data: pageStats, error: pageError } = await supabase
      .from('analytics_page_stats')
      .select('*')
      .eq('book_id', bookId)
      .gte('date', startDate.toISOString().split('T')[0]);

    if (pageError) throw pageError;

    // Aggregate page stats
    const pageAggregates = (pageStats || []).reduce((acc, stat) => {
      const pageNum = stat.page_number;
      if (!acc[pageNum]) {
        acc[pageNum] = {
          pageNumber: pageNum,
          views: 0,
          uniqueViewers: 0,
          avgDwellTime: 0,
          clicks: 0,
          exits: 0,
          dwellTimeSum: 0,
          count: 0
        };
      }
      acc[pageNum].views += stat.view_count || 0;
      acc[pageNum].uniqueViewers += stat.unique_viewers || 0;
      acc[pageNum].clicks += stat.total_clicks || 0;
      acc[pageNum].exits += stat.exit_count || 0;
      acc[pageNum].dwellTimeSum += stat.avg_dwell_time_ms || 0;
      acc[pageNum].count += 1;
      return acc;
    }, {});

    const pageStatsArray = Object.values(pageAggregates).map(page => ({
      ...page,
      avgDwellTime: page.count > 0 ? page.dwellTimeSum / page.count : 0
    }));

    const topPages = [...pageStatsArray]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Calculate totals
    const totals = (dailyStats || []).reduce((acc, day) => ({
      views: acc.views + (day.total_views || 0),
      users: acc.users + (day.unique_users || 0),
      duration: acc.duration + (day.avg_session_duration_seconds || 0) * (day.total_sessions || 0),
      sessions: acc.sessions + (day.total_sessions || 0),
    }), { views: 0, users: 0, duration: 0, sessions: 0 });

    // Fetch aggregated heatmap data for all pages
    const { data: heatmapData, error: heatmapError } = await supabase
      .from('analytics_heatmap_grid')
      .select('click_grid, hover_grid')
      .eq('book_id', bookId)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (heatmapError && heatmapError.code !== 'PGRST116') {
      console.warn('Error fetching heatmap:', heatmapError);
    }

    // Fetch current likes count
    const { data: bookData } = await supabase
      .from('books')
      .select('likes')
      .eq('id', bookId)
      .single();

    return {
      totalViews: totals.views,
      totalLikes: bookData?.likes || 0,
      uniqueUsers: totals.users,
      avgSessionDuration: totals.sessions > 0 ? Math.round(totals.duration / totals.sessions) : 0,
      dailyViews: dailyStats || [],
      pageStats: pageStatsArray,
      topPages,
      heatmapData: heatmapData ? {
        clickGrid: heatmapData.click_grid || [],
        hoverGrid: heatmapData.hover_grid || []
      } : null
    };
  } catch (error) {
    console.error('Error fetching book analytics:', error);
    return {
      totalViews: 0,
      uniqueUsers: 0,
      avgSessionDuration: 0,
      dailyViews: [],
      pageStats: [],
      topPages: [],
      heatmapData: null
    };
  }
};

/**
 * Fetch heatmap data for a specific page
 */
export const fetchPageHeatmap = async (bookId, pageNumber, days = 7) => {
  if (!isSupabaseConfigured || !supabase) {
    return { clickGrid: [], hoverGrid: [] };
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('analytics_heatmap_grid')
      .select('click_grid, hover_grid')
      .eq('book_id', bookId)
      .eq('page_number', pageNumber)
      .gte('date_range_start', startDate.toISOString().split('T')[0])
      .lte('date_range_end', endDate.toISOString().split('T')[0])
      .order('computed_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      return {
        clickGrid: data.click_grid || [],
        hoverGrid: data.hover_grid || []
      };
    }

    // If no pre-computed data, fetch raw events and compute on-the-fly
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('event_type, position_x, position_y')
      .eq('book_id', bookId)
      .eq('page_number', pageNumber)
      .in('event_type', ['click', 'hover'])
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (eventsError) throw eventsError;

    // Compute grid on-the-fly
    const grid = computeHeatmapGrid(events || [], 10, 10);
    return grid;
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    return { clickGrid: [], hoverGrid: [] };
  }
};

/**
 * Compute heatmap grid from raw events
 */
function computeHeatmapGrid(events, width = 10, height = 10) {
  const clickGrid = Array(height).fill(0).map(() => Array(width).fill(0));
  const hoverGrid = Array(height).fill(0).map(() => Array(width).fill(0));

  events.forEach(event => {
    const x = Math.floor((event.position_x || 0.5) * width);
    const y = Math.floor((event.position_y || 0.5) * height);

    if (x >= 0 && x < width && y >= 0 && y < height) {
      if (event.event_type === 'click') {
        clickGrid[y][x] += 1;
      } else if (event.event_type === 'hover') {
        hoverGrid[y][x] += 1;
      }
    }
  });

  // Normalize
  const maxClick = Math.max(...clickGrid.flat());
  const maxHover = Math.max(...hoverGrid.flat());

  return {
    clickGrid: clickGrid.map(row => row.map(val => maxClick > 0 ? val / maxClick : 0)),
    hoverGrid: hoverGrid.map(row => row.map(val => maxHover > 0 ? val / maxHover : 0))
  };
}

/**
 * Fetch recent user sessions for behavior analysis
 */
export const fetchRecentSessions = async (limit = 20, bookId = null) => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    let query = supabase
      .from('analytics_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (bookId) {
      query = query.eq('book_id', bookId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

/**
 * Trigger daily aggregation (call this via cron or manually)
 */
export const triggerDailyAggregation = async (targetDate = null) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const date = targetDate || new Date().toISOString().split('T')[0];

    const { error } = await supabase.rpc('aggregate_daily_stats', {
      target_date: date
    });

    if (error) throw error;

    console.log(`Daily aggregation completed for ${date}`);
  } catch (error) {
    console.error('Error triggering aggregation:', error);
  }
};
