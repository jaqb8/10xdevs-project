-- Migration: Harden user_settings RPC security
-- Purpose: Add proper search_path and restrict permissions to authenticated users
-- Date: 2026-01-29
-- Related: PR #65 security review comments

-- ============================================================================
-- Recreate get_user_settings with hardened search_path
-- ============================================================================
create or replace function get_user_settings()
returns table(points_enabled boolean, context_enabled boolean)
language sql
security definer
set search_path = public, pg_catalog
as $$
  select
    coalesce(us.points_enabled, true),
    coalesce(us.context_enabled, true)
  from (select auth.uid() as uid) as u
  left join user_settings us on us.user_id = u.uid;
$$;

-- Restrict function execution to authenticated users only
revoke execute on function get_user_settings() from public;
grant execute on function get_user_settings() to authenticated;

-- ============================================================================
-- Recreate upsert_user_settings with hardened search_path
-- ============================================================================
create or replace function upsert_user_settings(
  p_points_enabled boolean default null,
  p_context_enabled boolean default null
)
returns table(points_enabled boolean, context_enabled boolean)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into user_settings (user_id, points_enabled, context_enabled, updated_at)
  values (
    auth.uid(),
    coalesce(p_points_enabled, true),
    coalesce(p_context_enabled, true),
    pg_catalog.now()
  )
  on conflict (user_id) do update set
    points_enabled = coalesce(p_points_enabled, user_settings.points_enabled),
    context_enabled = coalesce(p_context_enabled, user_settings.context_enabled),
    updated_at = pg_catalog.now();

  return query
    select us.points_enabled, us.context_enabled
    from user_settings us
    where us.user_id = auth.uid();
end;
$$;

-- Restrict function execution to authenticated users only
revoke execute on function upsert_user_settings(boolean, boolean) from public;
grant execute on function upsert_user_settings(boolean, boolean) to authenticated;

-- ============================================================================
-- Recreate reset_user_points with hardened search_path
-- ============================================================================
create or replace function reset_user_points()
returns void
language sql
security definer
set search_path = public, pg_catalog
as $$
  delete from user_points where user_id = auth.uid();
$$;

-- Restrict function execution to authenticated users only
revoke execute on function reset_user_points() from public;
grant execute on function reset_user_points() to authenticated;
