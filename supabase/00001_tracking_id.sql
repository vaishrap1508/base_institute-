-- PostgreSQL Migration Script: Database-Level 16-Bit Hex Question IDs (4-4-4-4 strict layout)
-- Run this script in the Supabase SQL Editor to automatically calculate and maintain the tracking_id column.

-- 1. Add column to questions table if it does not exist
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(4);

-- 2. Create index on the tracking_id column for extremely fast search queries
CREATE INDEX IF NOT EXISTS idx_questions_tracking_id ON public.questions(tracking_id);

-- 3. Create the generator trigger function
CREATE OR REPLACE FUNCTION public.generate_question_tracking_id()
RETURNS TRIGGER AS $$
DECLARE
    v_domain_name TEXT;
    v_sub_topic_name TEXT;
    v_concept_name TEXT;
    
    v_domain_idx INT;
    v_sub_idx INT;
    v_concept_idx INT;
    v_q_idx INT;
    
    v_hex_id VARCHAR(4);
BEGIN
    -- If no concept_id is assigned, default to '0000'
    IF NEW.concept_id IS NULL THEN
        NEW.tracking_id := '0000';
        RETURN NEW;
    END IF;
    
    -- Resolve taxonomy names for Domain, Sub-topic, and Concept
    SELECT 
        c.name, st.name, d.name
    INTO 
        v_concept_name, v_sub_topic_name, v_domain_name
    FROM public.concepts c
    JOIN public.sub_topics st ON c.sub_topic_id = st.id
    JOIN public.domains d ON st.domain_id = d.id
    WHERE c.id = NEW.concept_id;
    
    -- Digit 1: Domain Index (4 bits: 1: Quant, 2: Logical, 3: Verbal, 4-F: Custom)
    IF v_domain_name ILIKE '%quant%' THEN 
        v_domain_idx := 1;
    ELSIF v_domain_name ILIKE '%logical%' THEN 
        v_domain_idx := 2;
    ELSIF v_domain_name ILIKE '%verbal%' THEN 
        v_domain_idx := 3;
    ELSE
        -- Fallback to alphabetical ordering index (4 to 15) for custom domains
        SELECT COALESCE(pos, 4) INTO v_domain_idx
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY name) + 3 AS pos
            FROM public.domains
            WHERE name NOT ILIKE '%quant%' AND name NOT ILIKE '%logical%' AND name NOT ILIKE '%verbal%'
        ) s
        WHERE s.id = (
            SELECT domain_id 
            FROM public.sub_topics 
            WHERE id = (SELECT sub_topic_id FROM public.concepts WHERE id = NEW.concept_id)
        );
    END IF;
    v_domain_idx := COALESCE(v_domain_idx, 4) % 16;
    
    -- Digit 2: Sub-topic Index (4 bits: alphabetical rank, 1-F)
    SELECT COALESCE(pos, 1) INTO v_sub_idx
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS pos
        FROM public.sub_topics
        WHERE domain_id = (
            SELECT domain_id 
            FROM public.sub_topics 
            WHERE id = (SELECT sub_topic_id FROM public.concepts WHERE id = NEW.concept_id)
        )
    ) s
    WHERE s.id = (SELECT sub_topic_id FROM public.concepts WHERE id = NEW.concept_id);
    v_sub_idx := COALESCE(v_sub_idx, 1) % 16;
    
    -- Digit 3: Concept Index (4 bits: alphabetical rank, 1-F)
    SELECT COALESCE(pos, 1) INTO v_concept_idx
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS pos
        FROM public.concepts
        WHERE sub_topic_id = (SELECT sub_topic_id FROM public.concepts WHERE id = NEW.concept_id)
    ) s
    WHERE s.id = NEW.concept_id;
    v_concept_idx := COALESCE(v_concept_idx, 1) % 16;
    
    -- Digit 4: Question Sequence (4 bits: alphabetical rank of questions within this concept, 0-F)
    SELECT COUNT(*) INTO v_q_idx
    FROM public.questions
    WHERE concept_id = NEW.concept_id 
      AND (created_at < COALESCE(NEW.created_at, NOW()) OR (created_at = NEW.created_at AND id < NEW.id));
    v_q_idx := v_q_idx % 16;
    
    -- Concatenate into uppercase 4-digit hexadecimal string
    v_hex_id := TO_HEX(v_domain_idx) || TO_HEX(v_sub_idx) || TO_HEX(v_concept_idx) || TO_HEX(v_q_idx);
    
    NEW.tracking_id := UPPER(v_hex_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach trigger to the questions table
DROP TRIGGER IF EXISTS trigger_generate_question_tracking_id ON public.questions;
CREATE TRIGGER trigger_generate_question_tracking_id
BEFORE INSERT OR UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.generate_question_tracking_id();

-- 5. Backfill existing records to calculate tracking_id for current questions
UPDATE public.questions 
SET tracking_id = NULL 
WHERE tracking_id IS NULL;
