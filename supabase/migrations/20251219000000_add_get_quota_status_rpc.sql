-- Create RPC function to get current quota status without incrementing
-- This function uses SECURITY DEFINER to allow anon key to read the table
create or replace function get_anonymous_quota_status(
  p_ip_hash text,
  p_usage_date date
)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count int;
begin
  select request_count into v_count
  from public.anonymous_daily_usage
  where ip_hash = p_ip_hash
    and usage_date = p_usage_date;

  -- Return 0 if no record found (user hasn't made any requests today)
  return coalesce(v_count, 0);
end;
$$;

-- Restrict function execution to only intended roles
revoke execute on function get_anonymous_quota_status(text, date) from public;
grant execute on function get_anonymous_quota_status(text, date) to anon;
grant execute on function get_anonymous_quota_status(text, date) to authenticated;

