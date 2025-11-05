-- Migration: Change explanation to text and analysis_mode to enum
-- Purpose: Change explanation column from varchar(500) to text and convert analysis_mode to enum type
-- Affected: learning_items table
-- Date: 2025-01-29

-- Create enum type for analysis_mode (if it doesn't exist)
DO $$ BEGIN
  CREATE TYPE "public"."analysis_mode" AS ENUM('grammar_and_spelling', 'colloquial_speech');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop existing check constraint
ALTER TABLE "public"."learning_items" DROP CONSTRAINT IF EXISTS "check_analysis_mode";

-- Change explanation column type from varchar(500) to text
ALTER TABLE "public"."learning_items" 
  ALTER COLUMN "explanation" TYPE text;

-- Change analysis_mode column type from text to enum
-- First, drop the default value (if it exists)
ALTER TABLE "public"."learning_items" 
  ALTER COLUMN "analysis_mode" DROP DEFAULT;

-- Then change the column type
ALTER TABLE "public"."learning_items" 
  ALTER COLUMN "analysis_mode" TYPE "public"."analysis_mode" 
  USING "analysis_mode"::"public"."analysis_mode";

-- Finally, restore the default value
ALTER TABLE "public"."learning_items" 
  ALTER COLUMN "analysis_mode" SET DEFAULT 'grammar_and_spelling'::"public"."analysis_mode";
