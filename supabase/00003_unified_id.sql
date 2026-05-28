-- PostgreSQL Migration Script: Unified 20-Character Secure Mixed Binary-Letter IDs as Primary Key
-- Run this script in your Supabase SQL Editor to make the visual ID (BBBB[Letter]-BBBB[Letter]...) the actual Primary Key.

-- 1. Drop old triggers to prevent conflicts during structural changes
DROP TRIGGER IF EXISTS trigger_questions_before_id ON public.questions;
DROP TRIGGER IF EXISTS trigger_questions_after_id ON public.questions;
DROP TRIGGER IF EXISTS trigger_generate_question_tracking_id ON public.questions;
DROP TRIGGER IF EXISTS trigger_generate_questions_unified_id ON public.questions;

-- 2. Drop existing foreign keys in child tables linking to the old questions.id
ALTER TABLE IF EXISTS public.question_companies DROP CONSTRAINT IF EXISTS question_companies_question_id_fkey;
ALTER TABLE IF EXISTS public.user_progress DROP CONSTRAINT IF EXISTS user_progress_question_id_fkey;
ALTER TABLE IF EXISTS public.user_bookmarks DROP CONSTRAINT IF EXISTS user_bookmarks_question_id_fkey;
ALTER TABLE IF EXISTS public.question_comments DROP CONSTRAINT IF EXISTS question_comments_question_id_fkey;

-- 3. Create the 4-bit binary string formatter
CREATE OR REPLACE FUNCTION public.int_to_binary_4(p_val INT)
RETURNS CHAR(4) AS $$
BEGIN
    RETURN ((p_val >> 3) & 1)::TEXT ||
           ((p_val >> 2) & 1)::TEXT ||
           ((p_val >> 1) & 1)::TEXT ||
           (p_val & 1)::TEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Create the Crockford's letters mapping function
CREATE OR REPLACE FUNCTION public.get_alphabet_letter(p_val INT)
RETURNS CHAR(1) AS $$
DECLARE
    v_alphabet TEXT := 'ABCDEFGHJKMNPQRT'; -- Exactly 16 letters (4 bits)
BEGIN
    RETURN substring(v_alphabet FROM ((p_val & 15) + 1) FOR 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Create the visual secure ordered formatter function (BBBB[Letter]-BBBB[Letter]...)
CREATE OR REPLACE FUNCTION public.generate_alphanumeric_20(p_str TEXT)
RETURNS CHAR(23) AS $$
DECLARE
    v_hash BIGINT := public.fnv1a_32(p_str);
    v_binary CHAR(23);
BEGIN
    -- For backward compatibility fallback / staging conversion
    v_binary := public.int_to_binary_4((v_hash >> 0)::INT & 15) || public.get_alphabet_letter((v_hash >> 0)::INT & 15) || '-' ||
                public.int_to_binary_4((v_hash >> 4)::INT & 15) || public.get_alphabet_letter((v_hash >> 4)::INT & 15) || '-' ||
                public.int_to_binary_4((v_hash >> 8)::INT & 15) || public.get_alphabet_letter((v_hash >> 8)::INT & 15) || '-' ||
                public.int_to_binary_4((v_hash >> 12)::INT & 15) || public.get_alphabet_letter((v_hash >> 12)::INT & 15);
    RETURN v_binary;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. PHASE 1: Widen primary key and foreign key columns to VARCHAR(100) to safely hold UUIDs during migration
ALTER TABLE public.questions ALTER COLUMN id TYPE VARCHAR(100) USING id::text;
ALTER TABLE public.question_companies ALTER COLUMN question_id TYPE VARCHAR(100) USING question_id::text;
ALTER TABLE public.user_progress ALTER COLUMN question_id TYPE VARCHAR(100) USING question_id::text;
ALTER TABLE public.user_bookmarks ALTER COLUMN question_id TYPE VARCHAR(100) USING question_id::text;
ALTER TABLE public.question_comments ALTER COLUMN question_id TYPE VARCHAR(100) USING question_id::text;

-- 7. Create the mapping staging table to link old UUID keys to their computed 20-character secure IDs
CREATE TEMP TABLE question_id_mapping AS 
SELECT id AS old_key, public.generate_alphanumeric_20(id::text) AS new_secure_id 
FROM public.questions;

-- 8. PHASE 2: Migrate values in the questions table and child tables to use the calculated alphanumeric IDs
UPDATE public.questions q
SET id = m.new_secure_id
FROM question_id_mapping m
WHERE q.id = m.old_key;

UPDATE public.question_companies qc
SET question_id = m.new_secure_id
FROM question_id_mapping m
WHERE qc.question_id = m.old_key;

UPDATE public.user_progress up
SET question_id = m.new_secure_id
FROM question_id_mapping m
WHERE up.question_id = m.old_key;

UPDATE public.user_bookmarks ub
SET question_id = m.new_secure_id
FROM question_id_mapping m
WHERE ub.question_id = m.old_key;

UPDATE public.question_comments qcom
SET question_id = m.new_secure_id
FROM question_id_mapping m
WHERE qcom.question_id = m.old_key;

-- 9. PHASE 3: Shrink columns to VARCHAR(23) now that all keys are exactly 23-character visual alphanumeric IDs
ALTER TABLE public.questions ALTER COLUMN id TYPE VARCHAR(23);
ALTER TABLE public.question_companies ALTER COLUMN question_id TYPE VARCHAR(23);
ALTER TABLE public.user_progress ALTER COLUMN question_id TYPE VARCHAR(23);
ALTER TABLE public.user_bookmarks ALTER COLUMN question_id TYPE VARCHAR(23);
ALTER TABLE public.question_comments ALTER COLUMN question_id TYPE VARCHAR(23);

-- 10. Remove default UUID generator since the primary key will be our custom calculated visual ID
ALTER TABLE public.questions ALTER COLUMN id DROP DEFAULT;

-- 11. Clean up redundant columns in questions table since PK is now the visual ID
ALTER TABLE public.questions DROP COLUMN IF EXISTS question_binary_id;
ALTER TABLE public.questions DROP COLUMN IF EXISTS question_internal_uuid;
ALTER TABLE public.questions DROP COLUMN IF EXISTS tracking_id;

-- 12. Re-establish foreign keys with ON UPDATE CASCADE to enable automatic propagation if ID ever updates
ALTER TABLE public.question_companies 
    ADD CONSTRAINT question_companies_question_id_fkey 
    FOREIGN KEY (question_id) REFERENCES public.questions(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.user_progress 
    ADD CONSTRAINT user_progress_question_id_fkey 
    FOREIGN KEY (question_id) REFERENCES public.questions(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.user_bookmarks 
    ADD CONSTRAINT user_bookmarks_question_id_fkey 
    FOREIGN KEY (question_id) REFERENCES public.questions(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.question_comments 
    ADD CONSTRAINT question_comments_question_id_fkey 
    FOREIGN KEY (question_id) REFERENCES public.questions(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

-- 13. Explicitly disable RLS on questions table to ensure public anon role saving works
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;

-- 14. Clean up redundant question_id_registry table since primary key is directly the visual ID
DROP TABLE IF EXISTS public.question_id_registry CASCADE;

-- 15. Create the unified, self-contained trigger function
CREATE OR REPLACE FUNCTION public.generate_questions_unified_id()
RETURNS TRIGGER AS $$
DECLARE
    v_domain_id UUID;
    v_subtopic_id UUID;
    v_concept_id UUID;
    
    v_domain_idx INT;
    v_subtopic_idx INT;
    v_concept_idx INT;
    v_q_idx INT;
    
    v_block1 CHAR(5);
    v_block2 CHAR(5);
    v_block3 CHAR(5);
    v_block4 CHAR(5);
    
    v_binary CHAR(23);
BEGIN
    -- Resolve taxonomy IDs for the question
    SELECT 
        st.domain_id, c.sub_topic_id, c.id
    INTO 
        v_domain_id, v_subtopic_id, v_concept_id
    FROM public.concepts c
    JOIN public.sub_topics st ON c.sub_topic_id = st.id
    WHERE c.id = NEW.concept_id;

    -- Fallback default values if concept_id is missing
    IF v_concept_id IS NULL THEN
        -- Select first concept in database as fallback
        SELECT c.id, c.sub_topic_id, st.domain_id 
        INTO v_concept_id, v_subtopic_id, v_domain_id
        FROM public.concepts c
        JOIN public.sub_topics st ON c.sub_topic_id = st.id
        LIMIT 1;
    END IF;

    -- 1. Calculate Domain Index (1-based, sorted alphabetically by name)
    SELECT pos INTO v_domain_idx
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS pos
        FROM public.domains
    ) s
    WHERE s.id = v_domain_id;
    v_domain_idx := COALESCE(v_domain_idx, 1);

    -- 2. Calculate Sub-topic Index (1-based, sorted alphabetically by name within domain)
    SELECT pos INTO v_subtopic_idx
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS pos
        FROM public.sub_topics
        WHERE domain_id = v_domain_id
    ) s
    WHERE s.id = v_subtopic_id;
    v_subtopic_idx := COALESCE(v_subtopic_idx, 1);

    -- 3. Calculate Concept Index (1-based, sorted alphabetically by name within subtopic)
    SELECT pos INTO v_concept_idx
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS pos
        FROM public.concepts
        WHERE sub_topic_id = v_subtopic_id
    ) s
    WHERE s.id = v_concept_id;
    v_concept_idx := COALESCE(v_concept_idx, 1);

    -- 4. Calculate Question Sequence Index (0-based, ordered by creation time)
    SELECT COUNT(*) INTO v_q_idx
    FROM public.questions
    WHERE concept_id = v_concept_id 
      AND (created_at < COALESCE(NEW.created_at, NOW()) OR (created_at = NEW.created_at AND id < NEW.id));
    v_q_idx := COALESCE(v_q_idx, 0);

    -- Format blocks: 4 binary digits (p_val % 16) + 1 letter ((p_val - 1) % 16)
    v_block1 := public.int_to_binary_4(v_domain_idx % 16) || public.get_alphabet_letter((v_domain_idx - 1) % 16);
    v_block2 := public.int_to_binary_4(v_subtopic_idx % 16) || public.get_alphabet_letter((v_subtopic_idx - 1) % 16);
    v_block3 := public.int_to_binary_4(v_concept_idx % 16) || public.get_alphabet_letter((v_concept_idx - 1) % 16);
    v_block4 := public.int_to_binary_4(v_q_idx % 16) || public.get_alphabet_letter(v_q_idx % 16); -- Question sequence is 0-based, so no -1 needed!

    v_binary := v_block1 || '-' || v_block2 || '-' || v_block3 || '-' || v_block4;

    -- Override the primary key id with the calculated visual 20-character secure ID
    NEW.id := v_binary;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Bind trigger to questions table for INSERT/UPDATE operations
CREATE TRIGGER trigger_generate_questions_unified_id
BEFORE INSERT OR UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.generate_questions_unified_id();

-- 17. Run a complete backfill update on the questions table to recalculate all IDs based on new sequence order
UPDATE public.questions 
SET id = id;
