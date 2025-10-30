ALTER TABLE public.learning_items
ADD COLUMN analysis_mode TEXT NOT NULL DEFAULT 'grammar_and_spelling';

ALTER TABLE public.learning_items
ADD CONSTRAINT check_analysis_mode
CHECK (analysis_mode IN ('grammar_and_spelling', 'colloquial_speech'));
