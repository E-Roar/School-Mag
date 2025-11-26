-- Enhanced Analytics Database Schema for School Magazine Platform
-- Run this in Supabase SQL Editor after NOTIFICATIONS_SETUP.sql

-- =====================================================
-- ANALYTICS AGGREGATIONS TABLE
-- Pre-computed stats for fast dashboard loading
-- =====================================================
create table if not exists analytics_daily_stats (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  book_id uuid references books(id) on delete cascade,
  -- Overall metrics
  total_views int default 0,
  unique_users int default 0,
  total_sessions int default 0,
  avg_session_duration_seconds int default 0,
  -- Page metrics
  total_page_turns int default 0,
  avg_pages_per_session decimal(10,2) default 0,
  bounce_rate decimal(5,2) default 0, -- Users who leave after first page
  -- Engagement metrics
  total_clicks int default 0,
  total_hovers int default 0,
  avg_dwell_time_ms int default 0,
  -- Time-based metrics
  peak_hour int, -- Hour of day with most activity (0-23)
  -- Device breakdown
  mobile_users int default 0,
  desktop_users int default 0,
  tablet_users int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(date, book_id)
);

-- =====================================================
-- PAGE-LEVEL ANALYTICS
-- Detailed stats per page/spread
-- =====================================================
create table if not exists analytics_page_stats (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid references books(id) on delete cascade not null,
  page_number int not null,
  date date not null,
  -- View metrics
  view_count int default 0,
  unique_viewers int default 0,
  -- Engagement metrics
  avg_dwell_time_ms int default 0,
  total_clicks int default 0,
  total_hovers int default 0,
  click_through_rate decimal(5,2) default 0, -- % of viewers who clicked
  -- Position data for heatmap (stored as JSON for flexibility)
  click_positions jsonb default '[]'::jsonb,
  hover_positions jsonb default '[]'::jsonb,
  -- Exit metrics
  exit_count int default 0, -- How many users left from this page
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(book_id, page_number, date)
);

-- =====================================================
-- USER SESSION TRACKING
-- Track individual user sessions for behavior analysis
-- =====================================================
create table if not exists analytics_sessions (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid not null,
  device_id uuid not null,
  book_id uuid references books(id) on delete cascade,
  -- Session metrics
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone,
  duration_seconds int,
  page_count int default 0, -- Pages viewed in session
  pages_visited int[] default array[]::int[], -- Array of page numbers
  -- Engagement
  total_clicks int default 0,
  total_hovers int default 0,
  -- Device info
  user_agent text,
  device_type text, -- 'mobile', 'tablet', 'desktop'
  browser text,
  os text,
  -- Geo (optional, for future)
  country text,
  city text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- HEATMAP DATA (Optimized for visualization)
-- =====================================================
create table if not exists analytics_heatmap_grid (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid references books(id) on delete cascade not null,
  page_number int not null,
  date_range_start date not null,
  date_range_end date not null,
  -- Grid data (10x10 normalized values)
  click_grid jsonb not null default '[]'::jsonb,
  hover_grid jsonb not null default '[]'::jsonb,
  -- Computed at
  computed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(book_id, page_number, date_range_start, date_range_end)
);

-- =====================================================
-- PLATFORM-WIDE STATS
-- Overall platform health metrics
-- =====================================================
create table if not exists analytics_platform_stats (
  id uuid default uuid_generate_v4() primary key,
  date date not null unique,
  -- User metrics
  total_active_users int default 0,
  new_users int default 0,
  returning_users int default 0,
  -- Content metrics
  total_issues_published int default 0,
  total_books_created int default 0,
  total_pages_uploaded int default 0,
  -- Engagement metrics
  total_views int default 0,
  total_sessions int default 0,
  avg_session_duration_seconds int default 0,
  -- Top performers
  top_book_id uuid references books(id) on delete set null,
  top_book_views int default 0,
  -- System health
  avg_load_time_ms int default 0,
  error_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
create index if not exists idx_daily_stats_date on analytics_daily_stats(date desc);
create index if not exists idx_daily_stats_book on analytics_daily_stats(book_id);
create index if not exists idx_page_stats_book_page on analytics_page_stats(book_id, page_number);
create index if not exists idx_page_stats_date on analytics_page_stats(date desc);
create index if not exists idx_sessions_book on analytics_sessions(book_id);
create index if not exists idx_sessions_device on analytics_sessions(device_id);
create index if not exists idx_sessions_started on analytics_sessions(started_at desc);
create index if not exists idx_heatmap_book_page on analytics_heatmap_grid(book_id, page_number);
create index if not exists idx_platform_stats_date on analytics_platform_stats(date desc);

-- =====================================================
-- RLS POLICIES
-- =====================================================
alter table analytics_daily_stats enable row level security;
alter table analytics_page_stats enable row level security;
alter table analytics_sessions enable row level security;
alter table analytics_heatmap_grid enable row level security;
alter table analytics_platform_stats enable row level security;

-- Admins can read all analytics
create policy "Admins read analytics_daily_stats" 
  on analytics_daily_stats for select 
  using (auth.role() = 'authenticated');

create policy "Admins read analytics_page_stats" 
  on analytics_page_stats for select 
  using (auth.role() = 'authenticated');

create policy "Admins read analytics_sessions" 
  on analytics_sessions for select 
  using (auth.role() = 'authenticated');

create policy "Admins read analytics_heatmap_grid" 
  on analytics_heatmap_grid for select 
  using (auth.role() = 'authenticated');

create policy "Admins read analytics_platform_stats" 
  on analytics_platform_stats for select 
  using (auth.role() = 'authenticated');

-- System can insert/update (for aggregation functions)
create policy "System can write analytics_daily_stats"
  on analytics_daily_stats for all
  using (true);

create policy "System can write analytics_page_stats"
  on analytics_page_stats for all
  using (true);

create policy "System can write analytics_sessions"
  on analytics_sessions for all
  using (true);

create policy "System can write analytics_heatmap_grid"
  on analytics_heatmap_grid for all
  using (true);

create policy "System can write analytics_platform_stats"
  on analytics_platform_stats for all
  using (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to aggregate daily stats
create or replace function aggregate_daily_stats(target_date date)
returns void
language plpgsql
as $$
begin
  -- Aggregate for each book
  insert into analytics_daily_stats (
    date,
    book_id,
    total_views,
    unique_users,
    total_sessions,
    total_page_turns,
    total_clicks,
    total_hovers
  )
  select
    target_date,
    book_id,
    count(*) filter (where event_type = 'view') as total_views,
    count(distinct device_id) as unique_users,
    count(distinct session_id) as total_sessions,
    count(*) filter (where event_type = 'page_turn') as total_page_turns,
    count(*) filter (where event_type = 'click') as total_clicks,
    count(*) filter (where event_type = 'hover') as total_hovers
  from analytics_events
  where date(created_at) = target_date
    and book_id is not null
  group by book_id
  on conflict (date, book_id) 
  do update set
    total_views = excluded.total_views,
    unique_users = excluded.unique_users,
    total_sessions = excluded.total_sessions,
    total_page_turns = excluded.total_page_turns,
    total_clicks = excluded.total_clicks,
    total_hovers = excluded.total_hovers,
    updated_at = now();
end;
$$;

-- Function to compute heatmap grid for a page
create or replace function compute_heatmap_grid(
  target_book_id uuid,
  target_page_number int,
  range_start date,
  range_end date
)
returns void
language plpgsql
as $$
declare
  click_data jsonb;
  hover_data jsonb;
begin
  -- Aggregate click positions
  select jsonb_agg(jsonb_build_object('x', position_x, 'y', position_y))
  into click_data
  from analytics_events
  where book_id = target_book_id
    and page_number = target_page_number
    and event_type = 'click'
    and date(created_at) between range_start and range_end;

  -- Aggregate hover positions
  select jsonb_agg(jsonb_build_object('x', position_x, 'y', position_y))
  into hover_data
  from analytics_events
  where book_id = target_book_id
    and page_number = target_page_number
    and event_type = 'hover'
    and date(created_at) between range_start and range_end;

  -- Insert or update heatmap grid
  insert into analytics_heatmap_grid (
    book_id,
    page_number,
    date_range_start,
    date_range_end,
    click_grid,
    hover_grid
  )
  values (
    target_book_id,
    target_page_number,
    range_start,
    range_end,
    coalesce(click_data, '[]'::jsonb),
    coalesce(hover_data, '[]'::jsonb)
  )
  on conflict (book_id, page_number, date_range_start, date_range_end)
  do update set
    click_grid = coalesce(excluded.click_grid, '[]'::jsonb),
    hover_grid = coalesce(excluded.hover_grid, '[]'::jsonb),
    computed_at = now();
end;
$$;

-- Run initial aggregation for today
select aggregate_daily_stats(current_date);

-- Comment with usage instructions
comment on table analytics_daily_stats is 'Pre-aggregated daily statistics per book for fast dashboard loading';
comment on table analytics_page_stats is 'Page-level engagement metrics for heatmap and per-page analysis';
comment on table analytics_sessions is 'Individual user session tracking for behavior analysis and RAG context';
comment on table analytics_heatmap_grid is 'Pre-computed heatmap grids for visualization';
comment on table analytics_platform_stats is 'Platform-wide health and usage metrics';
