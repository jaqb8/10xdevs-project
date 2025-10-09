-- Migration: Disable RLS policies on learning_items table
-- Purpose: Remove all RLS policies to allow unrestricted access during development
-- Affected: learning_items table policies
-- Date: 2025-10-09
-- Dependencies: 20251009000000_create_learning_items.sql

-- ============================================================================
-- Drop all RLS policies for learning_items table
-- ============================================================================
-- Drop SELECT policies
drop policy if exists "authenticated_users_select_own_items" on learning_items;
drop policy if exists "anon_users_no_select" on learning_items;

-- Drop INSERT policies
drop policy if exists "authenticated_users_insert_own_items" on learning_items;
drop policy if exists "anon_users_no_insert" on learning_items;

-- Drop UPDATE policies
drop policy if exists "authenticated_users_update_own_items" on learning_items;
drop policy if exists "anon_users_no_update" on learning_items;

-- Drop DELETE policies
drop policy if exists "authenticated_users_delete_own_items" on learning_items;
drop policy if exists "anon_users_no_delete" on learning_items;

-- ============================================================================
-- Disable Row Level Security on learning_items table
-- ============================================================================
-- Warning: This allows unrestricted access to all rows in the table
-- Only use this in development environments
alter table learning_items disable row level security;

