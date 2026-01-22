-- Migration: Fix security vulnerability in user_points functions
-- Purpose: Use auth.uid() directly instead of accepting target_user_id parameter
-- Affected: increment_user_points, get_user_points_total functions
-- Date: 2026-01-22
-- Issue: SECURITY DEFINER functions trusted external user_id parameter

-- ============================================================================
-- Drop existing functions
-- ============================================================================
drop function if exists increment_user_points(uuid);
drop function if exists get_user_points_total(uuid);

-- ============================================================================
-- Function: increment_user_points (secured)
-- ============================================================================
-- Purpose: Atomically increment points for the current authenticated user
-- Security: Uses auth.uid() directly - no external parameter accepted
-- Returns: The new total points after increment, or NULL if not authenticated
create or replace function increment_user_points()
returns integer
language sql
security definer
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
-- Function: get_user_points_total (secured)
-- ============================================================================
-- Purpose: Get total points for the current authenticated user
-- Security: Uses auth.uid() directly - no external parameter accepted
-- Returns: The total points, 0 if no record exists, NULL if not authenticated
create or replace function get_user_points_total()
returns integer
language sql
security definer
as $$
  select coalesce(
    (select points from user_points where user_id = auth.uid()),
    0
  );
$$;
