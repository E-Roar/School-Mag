# 🚨 CRITICAL FIXES REQUIRED

I have fixed the code issues, but you MUST run the following SQL scripts in your Supabase SQL Editor to make everything work:

## 1. Fix Analytics Error
Run the content of `ANALYTICS_FIX.sql` to add the missing `metadata` column. This will stop the "Bad Request" errors in your console.

```sql
-- Fix Analytics Events Table - Add Missing Metadata Column
ALTER TABLE analytics_events 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_analytics_events_metadata 
ON analytics_events USING gin (metadata);
```

## 2. Enable Likes System
Run the content of `LIKES_SETUP.sql` if you haven't already. This creates the tables needed for the like button to work.

## ✅ What I Fixed in Code:
1. **Landing Page**: Now correctly receives and displays the `likes` count for each issue.
2. **Dashboard**: Added a new "Total Likes" stat card to the analytics overview.
3. **Data Fetching**: Updated queries to ensure `likes` data is retrieved from the database.

Once you run the SQL scripts, refresh your app and everything will work perfectly!
