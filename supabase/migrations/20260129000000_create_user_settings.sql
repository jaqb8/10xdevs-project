-- Migration: Create user_settings table and RPC functions
-- Purpose: Store per-user UI settings with defaults
-- Date: 2026-01-29
-- Dependencies: Supabase auth.users, user_points table

-- ============================================================================
-- Create user_settings table
-- ============================================================================
create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points_enabled boolean not null default true,
  context_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================
alter table user_settings enable row level security;

-- ============================================================================
-- RLS Policy: SELECT for authenticated users
-- ============================================================================
create policy "authenticated_users_select_own_settings"
  on user_settings
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- Function: get_user_settings
-- ============================================================================
-- Returns defaults when no row exists
create or replace function get_user_settings()
returns table(points_enabled boolean, context_enabled boolean)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(us.points_enabled, true),
    coalesce(us.context_enabled, true)
  from (select auth.uid() as uid) as u
  left join user_settings us on us.user_id = u.uid;
$$;

-- ============================================================================
-- Function: upsert_user_settings
-- ============================================================================
create or replace function upsert_user_settings(
  p_points_enabled boolean default null,
  p_context_enabled boolean default null
)
returns table(points_enabled boolean, context_enabled boolean)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into user_settings (user_id, points_enabled, context_enabled, updated_at)
  values (
    auth.uid(),
    coalesce(p_points_enabled, true),
    coalesce(p_context_enabled, true),
    now()
  )
  on conflict (user_id) do update set
    points_enabled = coalesce(p_points_enabled, user_settings.points_enabled),
    context_enabled = coalesce(p_context_enabled, user_settings.context_enabled),
    updated_at = now();

  return query
    select us.points_enabled, us.context_enabled
    from user_settings us
    where us.user_id = auth.uid();
end;
$$;

-- ============================================================================
-- Function: reset_user_points
-- ============================================================================
create or replace function reset_user_points()
returns void
language sql
security definer
set search_path = public
as $$
  delete from user_points where user_id = auth.uid();
$$;
