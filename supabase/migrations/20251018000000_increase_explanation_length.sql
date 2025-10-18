-- Migration: Increase explanation column length
-- Purpose: Change explanation column from varchar(150) to varchar(500)
-- Affected: learning_items table
-- Date: 2025-10-18
-- Dependencies: 20251009000000_create_learning_items.sql

-- ============================================================================
-- Alter explanation column to allow up to 500 characters
-- ============================================================================
-- This change increases the maximum length of the explanation field
-- to accommodate more detailed error explanations for users.
alter table learning_items 
  alter column explanation type varchar(500);

