-- Migration: Create user_points table
-- Purpose: Track gamification points for authenticated users (correct analyses)
-- Affected: user_points table (new), increment_user_points function (new)
-- Date: 2026-01-21
-- Dependencies: Requires Supabase auth.users table

-- ============================================================================
-- Create user_points table
-- ============================================================================
-- This table stores total points per user with a simple counter.
-- One row per user, updated via upsert when points are earned.
create table user_points (
  -- Primary key: user_id (one row per user)
  user_id uuid primary key references auth.users(id) on delete cascade,
  
  -- Total points accumulated by the user
  points integer not null default 0,
  
  -- Timestamp when the points were last updated
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================
-- RLS ensures that users can only access their own points
alter table user_points enable row level security;

-- ============================================================================
-- RLS Policy: SELECT for authenticated users
-- ============================================================================
-- Purpose: Allow authenticated users to read their own points
-- Condition: The requesting user's ID must match the user_id of the row
create policy "authenticated_users_select_own_points"
  on user_points
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- RLS Policy: SELECT for anonymous users
-- ============================================================================
-- Purpose: Prevent anonymous users from reading any points
-- Rationale: Points are private user data
create policy "anon_users_no_select"
  on user_points
  for select
  to anon
  using (false);

-- ============================================================================
-- Function: increment_user_points
-- ============================================================================
-- Purpose: Atomically increment points for a user (upsert pattern)
-- Security: SECURITY DEFINER allows the function to bypass RLS
-- Returns: The new total points after increment
create or replace function increment_user_points(target_user_id uuid)
returns integer
language sql
security definer
as $$
  insert into user_points (user_id, points, updated_at)
  values (target_user_id, 1, now())
  on conflict (user_id)
  do update set 
    points = user_points.points + 1,
    updated_at = now()
  returning points;
$$;

-- ============================================================================
-- Function: get_user_points_total
-- ============================================================================
-- Purpose: Get total points for a user (returns 0 if no record exists)
-- Security: SECURITY DEFINER allows the function to bypass RLS
create or replace function get_user_points_total(target_user_id uuid)
returns integer
language sql
security definer
as $$
  select coalesce(
    (select points from user_points where user_id = target_user_id),
    0
  );
$$;
