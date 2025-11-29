-- Migration: Create anonymous_daily_usage table
-- Purpose: Track daily analysis quota usage for unauthenticated users
-- Affected: anonymous_daily_usage table (new)
-- Date: 2025-11-24

-- ============================================================================
-- Create anonymous_daily_usage table
-- ============================================================================
-- This table tracks daily analysis request counts for unauthenticated users
-- identified by hashed IP addresses to protect privacy
create table anonymous_daily_usage (
  -- Hashed IP address (SHA-256) for privacy protection
  ip_hash text not null,
  
  -- Date of usage (UTC)
  usage_date date not null,
  
  -- Number of analysis requests made on this date
  request_count integer not null default 0,
  
  -- Timestamp when the record was last updated
  updated_at timestamptz not null default now(),
  
  -- Composite primary key ensures one record per IP per day
  primary key (ip_hash, usage_date)
);

-- ============================================================================
-- Create index for performance optimization
-- ============================================================================
-- Index on usage_date for efficient cleanup of old records
create index idx_anonymous_daily_usage_date on anonymous_daily_usage(usage_date);

-- ============================================================================
-- Row Level Security (RLS) - Disabled
-- ============================================================================
-- RLS is disabled for this table because it's only accessed by backend code
-- using service role. The table is not exposed to end users through the API.
-- Security is maintained through application-level access control.
alter table anonymous_daily_usage disable row level security;

