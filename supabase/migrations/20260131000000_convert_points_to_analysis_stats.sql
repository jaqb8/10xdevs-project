-- Migration: Convert points system to analysis statistics (percentage-based)
-- Purpose: Track both correct and total analyses for percentage calculation
-- Affected: user_points table, increment_user_points, get_user_points_total, reset_user_points functions
-- Date: 2026-01-31

-- ============================================================================
-- Alter user_points table
-- ============================================================================
-- Rename 'points' column to 'correct_analyses' for clarity
alter table user_points rename column points to correct_analyses;

-- Add total_analyses column (default to correct_analyses for existing data)
alter table user_points add column total_analyses integer not null default 0;

-- Migrate existing data: set total_analyses = correct_analyses (100% accuracy on start)
update user_points set total_analyses = correct_analyses where total_analyses = 0;

-- ============================================================================
-- Drop existing functions
-- ============================================================================
drop function if exists increment_user_points();
drop function if exists get_user_points_total();
drop function if exists reset_user_points();

-- ============================================================================
-- Function: record_analysis
-- ============================================================================
-- Purpose: Record an analysis result (correct or incorrect)
-- Security: Uses auth.uid() directly - no external parameter accepted
-- Parameters: p_is_correct - whether the analysis found no errors
-- Returns: JSON with correct_analyses and total_analyses
create or replace function record_analysis(p_is_correct boolean)
returns table(correct_analyses integer, total_analyses integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into user_points (user_id, correct_analyses, total_analyses, updated_at)
  values (
    auth.uid(),
    case when p_is_correct then 1 else 0 end,
    1,
    now()
  )
  on conflict (user_id)
  do update set 
    correct_analyses = user_points.correct_analyses + case when p_is_correct then 1 else 0 end,
    total_analyses = user_points.total_analyses + 1,
    updated_at = now();

  return query
    select up.correct_analyses, up.total_analyses
    from user_points up
    where up.user_id = auth.uid();
end;
$$;

-- ============================================================================
-- Function: get_analysis_stats
-- ============================================================================
-- Purpose: Get analysis statistics for the current authenticated user
-- Security: Uses auth.uid() directly - no external parameter accepted
-- Returns: JSON with correct_analyses and total_analyses (0, 0 if no record)
create or replace function get_analysis_stats()
returns table(correct_analyses integer, total_analyses integer)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(up.correct_analyses, 0),
    coalesce(up.total_analyses, 0)
  from (select auth.uid() as uid) as u
  left join user_points up on up.user_id = u.uid;
$$;

-- ============================================================================
-- Function: reset_analysis_stats
-- ============================================================================
-- Purpose: Reset analysis statistics for the current authenticated user
-- Security: Uses auth.uid() directly
create or replace function reset_analysis_stats()
returns void
language sql
security definer
set search_path = public
as $$
  delete from user_points where user_id = auth.uid();
$$;
