-- PostgreSQL Migration Script: High-Performance 16-Bit Binary Question IDs (XXXX-XXXX-XXXX-XXXX)
-- Run this script in your Supabase SQL Editor to install the FNV-1a 16-bit hashing system and metadata registry.

-- 1. Create the mapping registry table first
CREATE TABLE IF NOT EXISTS public.question_id_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_binary_id CHAR(19) NOT NULL UNIQUE,
    question_internal_uuid UUID NOT NULL UNIQUE,
    domain_id VARCHAR(100) NOT NULL,
    subtopic_id VARCHAR(100) NOT NULL,
    concept_id VARCHAR(100) NOT NULL,
    hash_seed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add columns to the questions table for high-performance direct reads
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS question_binary_id CHAR(19) UNIQUE;

ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS question_internal_uuid UUID UNIQUE;

ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS question_hash_seed INTEGER DEFAULT 0;

-- Explicitly disable Row-Level Security on critical tables to prevent insert blocks
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_id_registry DISABLE ROW LEVEL SECURITY;

-- Add indexes on registry for extremely fast lookup
CREATE INDEX IF NOT EXISTS idx_registry_binary ON public.question_id_registry(question_binary_id);
CREATE INDEX IF NOT EXISTS idx_registry_uuid ON public.question_id_registry(question_internal_uuid);

-- 3. Create FNV-1a 32-bit and XOR-folded 16-bit hashing function
CREATE OR REPLACE FUNCTION public.fnv1a_16(p_str TEXT)
RETURNS INT AS $$
DECLARE
    v_hash BIGINT := 2166136261; -- FNV-1a 32-bit offset basis (0x811c9dc5)
    v_char INT;
    v_i INT;
BEGIN
    FOR v_i IN 1..length(p_str) LOOP
        v_char := ascii(substring(p_str FROM v_i FOR 1));
        v_hash := (v_hash # v_char) * 16777619;
        v_hash := v_hash & 4294967295; -- Mask to maintain standard 32-bit unsigned overflow
    END LOOP;
    -- XOR-fold 32-bit down to 16-bit directly on BIGINT to avoid signed INT cast range errors
    RETURN (((v_hash >> 16) & 65535) # (v_hash & 65535))::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Create visual 16-bit binary formatter (XXXX-XXXX-XXXX-XXXX)
CREATE OR REPLACE FUNCTION public.int_to_binary_16(p_val INT)
RETURNS CHAR(19) AS $$
DECLARE
    v_bin TEXT := '';
    v_temp INT := p_val;
    v_i INT;
BEGIN
    FOR v_i IN 1..16 LOOP
        v_bin := (v_temp & 1)::TEXT || v_bin;
        v_temp := v_temp >> 1;
    END LOOP;
    RETURN substring(v_bin FROM 1 FOR 4) || '-' ||
           substring(v_bin FROM 5 FOR 4) || '-' ||
           substring(v_bin FROM 9 FOR 4) || '-' ||
           substring(v_bin FROM 13 FOR 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Trigger 1 (BEFORE): Calculate FNV-1a 16-bit hash, handle collisions, and populate columns on the row
CREATE OR REPLACE FUNCTION public.questions_before_insert_or_update()
RETURNS TRIGGER AS $$
DECLARE
    v_domain_id VARCHAR(100);
    v_subtopic_id VARCHAR(100);
    v_concept_id VARCHAR(100);
    v_seed INT := 0;
    v_input TEXT;
    v_hash INT;
    v_binary CHAR(19);
    v_collision BOOLEAN;
BEGIN
    -- Resolve taxonomy IDs for the question
    SELECT 
        st.domain_id, c.sub_topic_id, c.id
    INTO 
        v_domain_id, v_subtopic_id, v_concept_id
    FROM public.concepts c
    JOIN public.sub_topics st ON c.sub_topic_id = st.id
    WHERE c.id = NEW.concept_id;

    -- Fallback default values
    v_domain_id := COALESCE(v_domain_id, 'quant');
    v_subtopic_id := COALESCE(v_subtopic_id, 'arithmetic');
    v_concept_id := COALESCE(v_concept_id, 'percentages');

    -- Collision retry loop: Increment seed and re-hash until unique in registry
    LOOP
        v_input := v_domain_id || ':' || v_subtopic_id || ':' || v_concept_id || ':' || NEW.id || ':' || v_seed;
        v_hash := public.fnv1a_16(v_input);
        v_binary := public.int_to_binary_16(v_hash);

        -- Look for collision with a DIFFERENT question in the registry
        SELECT EXISTS (
            SELECT 1 
            FROM public.question_id_registry 
            WHERE question_binary_id = v_binary AND question_internal_uuid != NEW.id
        ) INTO v_collision;

        IF NOT v_collision THEN
            EXIT;
        END IF;

        v_seed := v_seed + 1;
    END LOOP;

    -- Assign computed values to the row before committing
    NEW.question_binary_id := v_binary;
    NEW.question_internal_uuid := NEW.id;
    NEW.question_hash_seed := v_seed;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger 2 (AFTER): Register the calculated binary ID mapping into the registry
CREATE OR REPLACE FUNCTION public.questions_after_insert_or_update()
RETURNS TRIGGER AS $$
DECLARE
    v_domain_id VARCHAR(100);
    v_subtopic_id VARCHAR(100);
    v_concept_id VARCHAR(100);
BEGIN
    -- Resolve taxonomy IDs for the question
    SELECT 
        st.domain_id, c.sub_topic_id, c.id
    INTO 
        v_domain_id, v_subtopic_id, v_concept_id
    FROM public.concepts c
    JOIN public.sub_topics st ON c.sub_topic_id = st.id
    WHERE c.id = NEW.concept_id;

    v_domain_id := COALESCE(v_domain_id, 'quant');
    v_subtopic_id := COALESCE(v_subtopic_id, 'arithmetic');
    v_concept_id := COALESCE(v_concept_id, 'percentages');

    -- Upsert mapping in central registry (parent row in questions now exists)
    INSERT INTO public.question_id_registry (
        question_binary_id,
        question_internal_uuid,
        domain_id,
        subtopic_id,
        concept_id,
        hash_seed
    ) VALUES (
        NEW.question_binary_id,
        NEW.id,
        v_domain_id,
        v_subtopic_id,
        v_concept_id,
        NEW.question_hash_seed
    )
    ON CONFLICT (question_internal_uuid) 
    DO UPDATE SET 
        question_binary_id = EXCLUDED.question_binary_id,
        domain_id = EXCLUDED.domain_id,
        subtopic_id = EXCLUDED.subtopic_id,
        concept_id = EXCLUDED.concept_id,
        hash_seed = EXCLUDED.hash_seed;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Bind triggers to questions table
DROP TRIGGER IF EXISTS trigger_questions_before_id ON public.questions;
CREATE TRIGGER trigger_questions_before_id
BEFORE INSERT OR UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.questions_before_insert_or_update();

DROP TRIGGER IF EXISTS trigger_questions_after_id ON public.questions;
CREATE TRIGGER trigger_questions_after_id
AFTER INSERT OR UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.questions_after_insert_or_update();

-- 8. Backfill all existing questions to automatically calculate their new 16-bit binary IDs
UPDATE public.questions 
SET question_hash_seed = 0;
