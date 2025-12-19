-- Migration: Enable RLS on anonymous_daily_usage table
-- Purpose: Block direct table access, allow access only through RPC functions
-- Affected: anonymous_daily_usage table
-- Date: 2025-12-19

-- ============================================================================
-- Enable Row Level Security
-- ============================================================================
-- By enabling RLS without any policies, we block all direct access to the table.
-- Access is only possible through RPC functions with SECURITY DEFINER:
--   - get_anonymous_quota_status()
--   - increment_anonymous_daily_usage()
-- 
-- SECURITY DEFINER functions execute with owner privileges, which bypass RLS
-- by default, so our RPC functions continue to work normally.
alter table anonymous_daily_usage enable row level security;

