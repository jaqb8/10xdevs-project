-- Migration: Fix search_path to include pg_catalog
-- Purpose: Ensure built-in functions (now, json_build_object) resolve from pg_catalog
-- Related to: Supabase Advisor warning about mutable search_path
-- Date: 2026-01-23

-- ============================================================================
-- Recreate function with proper search_path including pg_catalog
-- ============================================================================
-- The previous fix used pg_temp, but pg_catalog is essential for resolving
-- built-in PostgreSQL functions like now() and json_build_object().
-- 
-- search_path = public, pg_catalog ensures:
-- - public schema objects are resolved first (our tables)
-- - pg_catalog resolves built-in functions correctly
-- - No risk of function name shadowing attacks

create or replace function public.increment_anonymous_daily_usage(
  p_ip_hash text,
  p_usage_date date,
  p_limit int
)
returns json
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_count int;
  v_allowed boolean;
begin
  insert into public.anonymous_daily_usage (ip_hash, usage_date, request_count, updated_at)
  values (p_ip_hash, p_usage_date, 1, pg_catalog.now())
  on conflict (ip_hash, usage_date)
  do update set 
    request_count = public.anonymous_daily_usage.request_count + 1,
    updated_at = pg_catalog.now()
  returning request_count into v_count;

  if v_count <= p_limit then
    v_allowed := true;
  else
    v_allowed := false;
  end if;

  return pg_catalog.json_build_object(
    'allowed', v_allowed,
    'current_usage', v_count
  );
end;
$$;

-- Permissions remain unchanged (already set in previous migration)
-- But we reapply them to be explicit after CREATE OR REPLACE
revoke execute on function public.increment_anonymous_daily_usage(text, date, int) from public;
grant execute on function public.increment_anonymous_daily_usage(text, date, int) to anon;
grant execute on function public.increment_anonymous_daily_usage(text, date, int) to authenticated;
