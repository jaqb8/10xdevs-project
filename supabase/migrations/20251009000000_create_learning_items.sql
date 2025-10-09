-- Migration: Create learning_items table
-- Purpose: Set up the core table for storing user learning items (grammatical errors)
-- Affected: learning_items table (new)
-- Date: 2025-10-09
-- Dependencies: Requires Supabase auth.users table

-- ============================================================================
-- Create learning_items table
-- ============================================================================
-- This table stores learning items (grammatical errors) that users save
-- for later review and practice.
create table learning_items (
  -- Primary key: unique identifier for each learning item
  id uuid primary key default gen_random_uuid(),
  
  -- Foreign key: links to the user who owns this learning item
  -- ON DELETE CASCADE ensures that when a user is deleted, all their learning items are also deleted
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- The original sentence containing the grammatical error
  original_sentence text not null,
  
  -- The corrected version of the sentence
  corrected_sentence text not null,
  
  -- Brief explanation of the error (max 150 characters)
  explanation varchar(150) not null,
  
  -- Timestamp when the learning item was created
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Create index for performance optimization
-- ============================================================================
-- Composite index on (user_id, created_at DESC)
-- Purpose: Optimizes queries that filter by user_id and sort by created_at descending
-- This is the primary query pattern for displaying a user's learning list
create index idx_learning_items_user_created on learning_items(user_id, created_at desc);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================
-- RLS ensures that users can only access their own learning items
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

