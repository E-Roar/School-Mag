-- Run this in your Supabase SQL Editor

create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  message text not null,
  type text default 'info', -- 'info', 'success', 'warning', 'new_issue'
  target_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone
);

-- Enable Realtime
alter publication supabase_realtime add table notifications;

-- RLS Policies
alter table notifications enable row level security;

create policy "Public read access" 
  on notifications for select 
  using (true);

create policy "Admin insert access" 
  on notifications for insert 
  with check (auth.role() = 'authenticated');

-- Create an index for faster queries
create index if not exists notifications_created_at_idx on notifications (created_at desc);
