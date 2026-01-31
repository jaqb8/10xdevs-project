-- Migration: Harden analysis stats RPC security
-- Purpose: Add search_path and restrict execution to authenticated users
-- Date: 2026-01-31

-- ============================================================================
-- Recreate record_analysis with hardened search_path
-- ============================================================================
create or replace function record_analysis(p_is_correct boolean)
returns table(correct_analyses integer, total_analyses integer)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into user_points (user_id, correct_analyses, total_analyses, updated_at)
  values (
    auth.uid(),
    case when p_is_correct then 1 else 0 end,
    1,
    pg_catalog.now()
  )
  on conflict (user_id)
  do update set
    correct_analyses = user_points.correct_analyses + case when p_is_correct then 1 else 0 end,
    total_analyses = user_points.total_analyses + 1,
    updated_at = pg_catalog.now();

  return query
    select up.correct_analyses, up.total_analyses
    from user_points up
    where up.user_id = auth.uid();
end;
$$;

revoke execute on function record_analysis(boolean) from public;
grant execute on function record_analysis(boolean) to authenticated;

-- ============================================================================
-- Recreate get_analysis_stats with hardened search_path
-- ============================================================================
create or replace function get_analysis_stats()
returns table(correct_analyses integer, total_analyses integer)
language sql
security definer
set search_path = public, pg_catalog
as $$
  select
    coalesce(up.correct_analyses, 0),
    coalesce(up.total_analyses, 0)
  from (select auth.uid() as uid) as u
  left join user_points up on up.user_id = u.uid;
$$;

revoke execute on function get_analysis_stats() from public;
grant execute on function get_analysis_stats() to authenticated;

-- ============================================================================
-- Recreate reset_analysis_stats with hardened search_path
-- ============================================================================
create or replace function reset_analysis_stats()
returns void
language sql
security definer
set search_path = public, pg_catalog
as $$
  delete from user_points where user_id = auth.uid();
$$;

revoke execute on function reset_analysis_stats() from public;
grant execute on function reset_analysis_stats() to authenticated;
