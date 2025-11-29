-- Create RPC function to atomically check and increment daily usage
-- This prevents race conditions where concurrent requests could bypass the quota
create or replace function increment_anonymous_daily_usage(
  p_ip_hash text,
  p_usage_date date,
  p_limit int
)
returns json
language plpgsql
security definer
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

