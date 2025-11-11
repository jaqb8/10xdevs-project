-- Migration: Add translation column to learning_items table
-- Purpose: Add optional translation field for storing Polish translations of corrected text
-- Affected: learning_items table
-- Date: 2025-11-10
-- Dependencies: Requires learning_items table to exist

-- ============================================================================
-- Add translation column
-- ============================================================================
-- This column stores the translation of the corrected text (currently Polish,
-- but designed to be language-neutral for future multi-language support)
ALTER TABLE public.learning_items
ADD COLUMN translation TEXT NULL;

