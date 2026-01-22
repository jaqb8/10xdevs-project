-- Migration: Harden increment_anonymous_daily_usage function
-- Purpose: Fix mutable search_path security issue and add proper permissions
-- Related to: GitHub Issue #57
-- Date: 2026-01-22

-- ============================================================================
-- Recreate function with fixed search_path
-- ============================================================================
-- The original function had a mutable search_path, which is a security risk.
-- By setting search_path explicitly, we prevent potential search_path injection attacks.
-- 
-- search_path = public, pg_temp ensures:
-- - Only public schema objects are resolved
-- - pg_temp allows temporary tables/functions if needed by PostgreSQL internals

create or replace function increment_anonymous_daily_usage(
  p_ip_hash text,
  p_usage_date date,
  p_limit int
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count int;
  v_allowed boolean;
begin
  -- Atomically insert or increment
  -- We allow the counter to go above the limit to track blocked attempts
  insert into public.anonymous_daily_usage (ip_hash, usage_date, request_count, updated_at)
  values (p_ip_hash, p_usage_date, 1, now())
  on conflict (ip_hash, usage_date)
  do update set 
    request_count = public.anonymous_daily_usage.request_count + 1,
    updated_at = now()
  returning request_count into v_count;

  -- Check if the usage is within the limit
  if v_count <= p_limit then
    v_allowed := true;
  else
    v_allowed := false;
  end if;

  return json_build_object(
    'allowed', v_allowed,
    'current_usage', v_count
  );
end;
$$;

-- ============================================================================
-- Set proper permissions
-- ============================================================================
-- Restrict function execution to only intended roles
-- This follows the same pattern as get_anonymous_quota_status function
revoke execute on function increment_anonymous_daily_usage(text, date, int) from public;
grant execute on function increment_anonymous_daily_usage(text, date, int) to anon;
grant execute on function increment_anonymous_daily_usage(text, date, int) to authenticated;
