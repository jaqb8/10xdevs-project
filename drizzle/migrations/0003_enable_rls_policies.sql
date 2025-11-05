-- Migration: Enable RLS policies on learning_items table
-- Purpose: Restore Row Level Security to ensure users can only access their own data
-- Affected: learning_items table policies
-- Date: 2025-10-19
-- Dependencies: 20251009000000_create_learning_items.sql

-- ============================================================================
-- Enable Row Level Security on learning_items table
-- ============================================================================
alter table learning_items enable row level security;

-- ============================================================================
-- RLS Policy: SELECT for authenticated users
-- ============================================================================
-- Purpose: Allow authenticated users to read their own learning items
-- Condition: The requesting user's ID must match the user_id of the row
create policy "authenticated_users_select_own_items"
  on learning_items
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- RLS Policy: SELECT for anonymous users
-- ============================================================================
-- Purpose: Prevent anonymous users from reading any learning items
-- Rationale: Learning items are private user data
create policy "anon_users_no_select"
  on learning_items
  for select
  to anon
  using (false);

-- ============================================================================
-- RLS Policy: INSERT for authenticated users
-- ============================================================================
-- Purpose: Allow authenticated users to create learning items for themselves
-- Condition: The user_id in the new row must match the requesting user's ID
create policy "authenticated_users_insert_own_items"
  on learning_items
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- ============================================================================
-- RLS Policy: INSERT for anonymous users
-- ============================================================================
-- Purpose: Prevent anonymous users from creating learning items
-- Rationale: Users must be authenticated to save learning items
create policy "anon_users_no_insert"
  on learning_items
  for insert
  to anon
  with check (false);

-- ============================================================================
-- RLS Policy: UPDATE for authenticated users
-- ============================================================================
-- Purpose: Allow authenticated users to update their own learning items
-- Condition: The user_id of the row must match the requesting user's ID
create policy "authenticated_users_update_own_items"
  on learning_items
  for update
  to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- RLS Policy: UPDATE for anonymous users
-- ============================================================================
-- Purpose: Prevent anonymous users from updating learning items
-- Rationale: Users must be authenticated to modify learning items
create policy "anon_users_no_update"
  on learning_items
  for update
  to anon
  using (false);

-- ============================================================================
-- RLS Policy: DELETE for authenticated users
-- ============================================================================
-- Purpose: Allow authenticated users to delete their own learning items
-- Condition: The user_id of the row must match the requesting user's ID
-- Note: This performs a hard delete (permanent removal from database)
create policy "authenticated_users_delete_own_items"
  on learning_items
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- RLS Policy: DELETE for anonymous users
-- ============================================================================
-- Purpose: Prevent anonymous users from deleting learning items
-- Rationale: Users must be authenticated to remove learning items
create policy "anon_users_no_delete"
  on learning_items
  for delete
  to anon
  using (false);
