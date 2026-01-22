-- Migration: Add search_path to SECURITY DEFINER functions
-- Purpose: Harden security by setting explicit search_path to prevent hijacking
-- Affected: increment_user_points, get_user_points_total functions
-- Date: 2026-01-22

-- ============================================================================
-- Function: increment_user_points (with search_path)
-- ============================================================================
create or replace function increment_user_points()
returns integer
language sql
security definer
set search_path = public
as $$
  insert into user_points (user_id, points, updated_at)
  values (auth.uid(), 1, now())
  on conflict (user_id)
  do update set 
    points = user_points.points + 1,
    updated_at = now()
  returning points;
$$;

-- ============================================================================
-- Function: get_user_points_total (with search_path)
-- ============================================================================
create or replace function get_user_points_total()
returns integer
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select points from user_points where user_id = auth.uid()),
    0
  );
$$;
