-- PostgreSQL Migration Script: Unified 20-Character Sequential Question IDs with Static Category Suffixes (D, S, C, Q)
-- Run this script in your Supabase SQL Editor to update your trigger and recalculate all existing IDs sequentially.

-- 1. Create the helper functions first to guarantee they exist in the schema
CREATE OR REPLACE FUNCTION public.get_crockford_letter(p_val BIGINT)
RETURNS CHAR(1) AS $$
DECLARE
    v_alphabet TEXT := 'ABCDEFGHJKMNPQRT';
BEGIN
    RETURN SUBSTRING(v_alphabet FROM ((ABS(p_val) % 16) + 1)::INTEGER FOR 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.int_to_binary_2(p_val BIGINT)
RETURNS CHAR(2) AS $$
BEGIN
    RETURN ((p_val >> 1) & 1)::TEXT ||
           (p_val & 1)::TEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Drop existing trigger to safely update the trigger function
DROP TRIGGER IF EXISTS trigger_generate_questions_unified_id ON public.questions;

-- 3. Update the unified trigger function with static suffixes and permanent default index mappings
CREATE OR REPLACE FUNCTION public.generate_questions_unified_id()
RETURNS TRIGGER AS $$
DECLARE
    v_domain_id UUID;
    v_subtopic_id UUID;
    v_concept_id UUID;
    
    v_domain_name TEXT;
    v_subtopic_name TEXT;
    v_concept_name TEXT;
    
    v_domain_idx INT;
    v_subtopic_idx INT;
    v_concept_idx INT;
    v_q_idx INT;
    
    v_block1 CHAR(6);
    v_block2 CHAR(6);
    v_block3 CHAR(6);
    v_block4 CHAR(6);
    
    v_binary CHAR(27);
BEGIN
    -- Resolve taxonomy IDs and names for the question
    SELECT 
        st.domain_id, c.sub_topic_id, c.id, d.name, st.name, c.name
    INTO 
        v_domain_id, v_subtopic_id, v_concept_id, v_domain_name, v_subtopic_name, v_concept_name
    FROM public.concepts c
    JOIN public.sub_topics st ON c.sub_topic_id = st.id
    JOIN public.domains d ON st.domain_id = d.id
    WHERE c.id = NEW.concept_id;

    -- Fallback default values if concept_id is missing
    IF v_concept_id IS NULL THEN
        SELECT c.id, c.sub_topic_id, st.domain_id, d.name, st.name, c.name 
        INTO v_concept_id, v_subtopic_id, v_domain_id, v_domain_name, v_subtopic_name, v_concept_name
        FROM public.concepts c
        JOIN public.sub_topics st ON c.sub_topic_id = st.id
        JOIN public.domains d ON st.domain_id = d.id
        LIMIT 1;
    END IF;

    -- 1. Calculate Domain Index (1-based, with fixed permanent default mappings)
    IF v_domain_name = 'Quantitative Aptitude' THEN
        v_domain_idx := 1;
    ELSIF v_domain_name = 'Logical Reasoning' THEN
        v_domain_idx := 2;
    ELSIF v_domain_name = 'Verbal Ability' THEN
        v_domain_idx := 3;
    ELSE
        -- For custom domains, count existing custom domains created before this one and add 4
        SELECT COUNT(*) + 4 INTO v_domain_idx
        FROM public.domains d
        WHERE d.name NOT IN ('Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability')
          AND d.created_at < (SELECT created_at FROM public.domains WHERE id = v_domain_id);
    END IF;

    -- 2. Calculate Sub-topic Index (1-based, with fixed domain-scoped mappings)
    IF v_domain_name = 'Quantitative Aptitude' THEN
        IF v_subtopic_name = 'Arithmetic' THEN v_subtopic_idx := 1;
        ELSIF v_subtopic_name = 'Algebra' THEN v_subtopic_idx := 2;
        ELSIF v_subtopic_name = 'Geometry & Mensuration' THEN v_subtopic_idx := 3;
        ELSE
            SELECT COUNT(*) + 4 INTO v_subtopic_idx
            FROM public.sub_topics st
            WHERE st.domain_id = v_domain_id
              AND st.name NOT IN ('Arithmetic', 'Algebra', 'Geometry & Mensuration')
              AND st.created_at < (SELECT created_at FROM public.sub_topics WHERE id = v_subtopic_id);
        END IF;
    ELSIF v_domain_name = 'Logical Reasoning' THEN
        IF v_subtopic_name = 'Arrangements' THEN v_subtopic_idx := 1;
        ELSIF v_subtopic_name = 'Syllogisms' THEN v_subtopic_idx := 2;
        ELSE
            SELECT COUNT(*) + 3 INTO v_subtopic_idx
            FROM public.sub_topics st
            WHERE st.domain_id = v_domain_id
              AND st.name NOT IN ('Arrangements', 'Syllogisms')
              AND st.created_at < (SELECT created_at FROM public.sub_topics WHERE id = v_subtopic_id);
        END IF;
    ELSIF v_domain_name = 'Verbal Ability' THEN
        IF v_subtopic_name = 'Grammar & Usage' THEN v_subtopic_idx := 1;
        ELSIF v_subtopic_name = 'Reading Comprehension' THEN v_subtopic_idx := 2;
        ELSE
            SELECT COUNT(*) + 3 INTO v_subtopic_idx
            FROM public.sub_topics st
            WHERE st.domain_id = v_domain_id
              AND st.name NOT IN ('Grammar & Usage', 'Reading Comprehension')
              AND st.created_at < (SELECT created_at FROM public.sub_topics WHERE id = v_subtopic_id);
        END IF;
    ELSE
        -- Custom domain sub-topics
        SELECT COUNT(*) + 1 INTO v_subtopic_idx
        FROM public.sub_topics st
        WHERE st.domain_id = v_domain_id
          AND st.created_at < (SELECT created_at FROM public.sub_topics WHERE id = v_subtopic_id);
    END IF;

    -- 3. Calculate Concept Index (1-based, with fixed subtopic-scoped mappings)
    IF v_subtopic_name = 'Arithmetic' THEN
        IF v_concept_name = 'Percentages' THEN v_concept_idx := 1;
        ELSIF v_concept_name = 'Profit & Loss' THEN v_concept_idx := 2;
        ELSIF v_concept_name = 'Ratios & Proportions' THEN v_concept_idx := 3;
        ELSIF v_concept_name = 'Simple & Compound Interest' THEN v_concept_idx := 4;
        ELSIF v_concept_name = 'Time & Work' THEN v_concept_idx := 5;
        ELSIF v_concept_name = 'Time, Speed & Distance' THEN v_concept_idx := 6;
        ELSE
            SELECT COUNT(*) + 7 INTO v_concept_idx
            FROM public.concepts c
            WHERE c.sub_topic_id = v_subtopic_id
              AND c.name NOT IN ('Percentages', 'Profit & Loss', 'Ratios & Proportions', 'Simple & Compound Interest', 'Time & Work', 'Time, Speed & Distance')
              AND c.created_at < (SELECT created_at FROM public.concepts WHERE id = v_concept_id);
        END IF;
    ELSIF v_subtopic_name = 'Algebra' THEN
        IF v_concept_name = 'Linear Equations' THEN v_concept_idx := 1;
        ELSIF v_concept_name = 'Quadratic Equations' THEN v_concept_idx := 2;
        ELSIF v_concept_name = 'AP, GP & HP' THEN v_concept_idx := 3;
        ELSIF v_concept_name = 'Functions & Graphs' THEN v_concept_idx := 4;
        ELSE
            SELECT COUNT(*) + 5 INTO v_concept_idx
            FROM public.concepts c
            WHERE c.sub_topic_id = v_subtopic_id
              AND c.name NOT IN ('Linear Equations', 'Quadratic Equations', 'AP, GP & HP', 'Functions & Graphs')
              AND c.created_at < (SELECT created_at FROM public.concepts WHERE id = v_concept_id);
        END IF;
    ELSIF v_subtopic_name = 'Geometry & Mensuration' THEN
        IF v_concept_name = 'Triangles & Properties' THEN v_concept_idx := 1;
        ELSIF v_concept_name = 'Circles & Tangents' THEN v_concept_idx := 2;
        ELSIF v_concept_name = 'Surface Areas & Volumes' THEN v_concept_idx := 3;
        ELSE
            SELECT COUNT(*) + 4 INTO v_concept_idx
            FROM public.concepts c
            WHERE c.sub_topic_id = v_subtopic_id
              AND c.name NOT IN ('Triangles & Properties', 'Circles & Tangents', 'Surface Areas & Volumes')
              AND c.created_at < (SELECT created_at FROM public.concepts WHERE id = v_concept_id);
        END IF;
    ELSIF v_subtopic_name = 'Arrangements' THEN
        IF v_concept_name = 'Linear Arrangements' THEN v_concept_idx := 1;
        ELSIF v_concept_name = 'Circular Arrangements' THEN v_concept_idx := 2;
        ELSE
            SELECT COUNT(*) + 3 INTO v_concept_idx
            FROM public.concepts c
            WHERE c.sub_topic_id = v_subtopic_id
              AND c.name NOT IN ('Linear Arrangements', 'Circular Arrangements')
              AND c.created_at < (SELECT created_at FROM public.concepts WHERE id = v_concept_id);
        END IF;
    ELSIF v_subtopic_name = 'Syllogisms' THEN
        IF v_concept_name = 'Basic Syllogisms' THEN v_concept_idx := 1;
        ELSIF v_concept_name = 'Conditional Syllogisms' THEN v_concept_idx := 2;
        ELSE
            SELECT COUNT(*) + 3 INTO v_concept_idx
            FROM public.concepts c
            WHERE c.sub_topic_id = v_subtopic_id
              AND c.name NOT IN ('Basic Syllogisms', 'Conditional Syllogisms')
              AND c.created_at < (SELECT created_at FROM public.concepts WHERE id = v_concept_id);
        END IF;
    ELSIF v_subtopic_name = 'Grammar & Usage' THEN
        IF v_concept_name = 'Tenses & Active/Passive' THEN v_concept_idx := 1;
        ELSIF v_concept_name = 'Prepositions & Conjunctions' THEN v_concept_idx := 2;
        ELSE
            SELECT COUNT(*) + 3 INTO v_concept_idx
            FROM public.concepts c
            WHERE c.sub_topic_id = v_subtopic_id
              AND c.name NOT IN ('Tenses & Active/Passive', 'Prepositions & Conjunctions')
              AND c.created_at < (SELECT created_at FROM public.concepts WHERE id = v_concept_id);
        END IF;
    ELSIF v_subtopic_name = 'Reading Comprehension' THEN
        IF v_concept_name = 'Inference-based questions' THEN v_concept_idx := 1;
        ELSIF v_concept_name = 'Contextual Vocabulary' THEN v_concept_idx := 2;
        ELSE
            SELECT COUNT(*) + 3 INTO v_concept_idx
            FROM public.concepts c
            WHERE c.sub_topic_id = v_subtopic_id
              AND c.name NOT IN ('Inference-based questions', 'Contextual Vocabulary')
              AND c.created_at < (SELECT created_at FROM public.concepts WHERE id = v_concept_id);
        END IF;
    ELSE
        -- Custom subtopic concepts
        SELECT COUNT(*) + 1 INTO v_concept_idx
        FROM public.concepts c
        WHERE c.sub_topic_id = v_subtopic_id
          AND c.created_at < (SELECT created_at FROM public.concepts WHERE id = v_concept_id);
    END IF;

    -- 4. Calculate Question Sequence Index (0-based, ordered by creation time)
    SELECT COUNT(*) INTO v_q_idx
    FROM public.questions
    WHERE concept_id = v_concept_id 
      AND (created_at < COALESCE(NEW.created_at, NOW()) OR (created_at = NEW.created_at AND id < NEW.id));
    v_q_idx := COALESCE(v_q_idx, 0);

    -- Format blocks: BB[CrockfordLetter]BB[CategorySuffix]
    v_block1 := public.int_to_binary_2((v_domain_idx % 16) >> 2) || public.get_crockford_letter(v_domain_idx % 16) || public.int_to_binary_2(v_domain_idx % 16) || 'D';
    v_block2 := public.int_to_binary_2((v_subtopic_idx % 16) >> 2) || public.get_crockford_letter(v_subtopic_idx % 16) || public.int_to_binary_2(v_subtopic_idx % 16) || 'S';
    v_block3 := public.int_to_binary_2((v_concept_idx % 16) >> 2) || public.get_crockford_letter(v_concept_idx % 16) || public.int_to_binary_2(v_concept_idx % 16) || 'C';
    v_block4 := public.int_to_binary_2((v_q_idx % 16) >> 2) || public.get_crockford_letter(v_q_idx % 16) || public.int_to_binary_2(v_q_idx % 16) || 'Q';

    v_binary := v_block1 || '-' || v_block2 || '-' || v_block3 || '-' || v_block4;

    -- Override the primary key id with the calculated visual secure sequential ID
    NEW.id := v_binary;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-bind the trigger to public.questions
CREATE TRIGGER trigger_generate_questions_unified_id
BEFORE INSERT OR UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.generate_questions_unified_id();

-- 5. Double check RLS remains disabled to prevent public anon save blocks
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;

-- 6. RELATIONAL STAGING UPDATE PROCEDURE
-- B. Drop foreign key constraints temporarily to allow safe column type widening
ALTER TABLE IF EXISTS public.question_companies DROP CONSTRAINT IF EXISTS question_companies_question_id_fkey;
ALTER TABLE IF EXISTS public.user_progress DROP CONSTRAINT IF EXISTS user_progress_question_id_fkey;
ALTER TABLE IF EXISTS public.user_bookmarks DROP CONSTRAINT IF EXISTS user_bookmarks_question_id_fkey;
ALTER TABLE IF EXISTS public.question_comments DROP CONSTRAINT IF EXISTS question_comments_question_id_fkey;

-- C. Widen column types to VARCHAR(100) to safely hold staging suffixes
ALTER TABLE public.questions ALTER COLUMN id TYPE VARCHAR(100);
ALTER TABLE public.question_companies ALTER COLUMN question_id TYPE VARCHAR(100);
ALTER TABLE public.user_progress ALTER COLUMN question_id TYPE VARCHAR(100);
ALTER TABLE public.user_bookmarks ALTER COLUMN question_id TYPE VARCHAR(100);
ALTER TABLE public.question_comments ALTER COLUMN question_id TYPE VARCHAR(100);

-- D. Re-establish foreign keys temporarily with ON UPDATE CASCADE to propagate the staging suffixes
ALTER TABLE public.question_companies ADD CONSTRAINT question_companies_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.user_bookmarks ADD CONSTRAINT user_bookmarks_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.question_comments ADD CONSTRAINT question_comments_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- E. Disable trigger temporarily to bypass visual ID trigger processing during staging update
ALTER TABLE public.questions DISABLE TRIGGER trigger_generate_questions_unified_id;

-- F. Append staging suffix to all primary keys (Cascades instantly across all child tables!)
UPDATE public.questions 
SET id = id || '-temp';

-- G. Update parent table using the staging CTE (joining on temp ID).
-- Thanks to ON UPDATE CASCADE, this single parent update automatically propagates the clean IDs to all 4 child tables!
UPDATE public.questions q
SET id = s.new_id
FROM (
    WITH domain_idx_map AS (
        SELECT 
            d.id AS domain_id,
            CASE 
                WHEN d.name = 'Quantitative Aptitude' THEN 1
                WHEN d.name = 'Logical Reasoning' THEN 2
                WHEN d.name = 'Verbal Ability' THEN 3
                ELSE 4 + (
                    SELECT COUNT(*) 
                    FROM public.domains d2 
                    WHERE d2.name NOT IN ('Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability')
                      AND d2.created_at < d.created_at
                )
            END AS domain_idx
        FROM public.domains d
    ),
    subtopic_idx_map AS (
        SELECT 
            st.id AS subtopic_id,
            CASE 
                WHEN d.name = 'Quantitative Aptitude' THEN
                    CASE 
                        WHEN st.name = 'Arithmetic' THEN 1
                        WHEN st.name = 'Algebra' THEN 2
                        WHEN st.name = 'Geometry & Mensuration' THEN 3
                        ELSE 4 + (
                            SELECT COUNT(*)
                            FROM public.sub_topics st2
                            WHERE st2.domain_id = st.domain_id
                              AND st2.name NOT IN ('Arithmetic', 'Algebra', 'Geometry & Mensuration')
                              AND st2.created_at < st.created_at
                        )
                    END
                WHEN d.name = 'Logical Reasoning' THEN
                    CASE 
                        WHEN st.name = 'Arrangements' THEN 1
                        WHEN st.name = 'Syllogisms' THEN 2
                        ELSE 3 + (
                            SELECT COUNT(*)
                            FROM public.sub_topics st2
                            WHERE st2.domain_id = st.domain_id
                              AND st2.name NOT IN ('Arrangements', 'Syllogisms')
                              AND st2.created_at < st.created_at
                        )
                    END
                WHEN d.name = 'Verbal Ability' THEN
                    CASE 
                        WHEN st.name = 'Grammar & Usage' THEN 1
                        WHEN st.name = 'Reading Comprehension' THEN 2
                        ELSE 3 + (
                            SELECT COUNT(*)
                            FROM public.sub_topics st2
                            WHERE st2.domain_id = st.domain_id
                              AND st2.name NOT IN ('Grammar & Usage', 'Reading Comprehension')
                              AND st2.created_at < st.created_at
                        )
                    END
                ELSE
                    1 + (
                        SELECT COUNT(*)
                        FROM public.sub_topics st2
                        WHERE st2.domain_id = st.domain_id
                          AND st2.created_at < st.created_at
                    )
            END AS subtopic_idx
        FROM public.sub_topics st
        JOIN public.domains d ON st.domain_id = d.id
    ),
    concept_idx_map AS (
        SELECT 
            c.id AS concept_id,
            CASE 
                WHEN st.name = 'Arithmetic' THEN
                    CASE 
                        WHEN c.name = 'Percentages' THEN 1
                        WHEN c.name = 'Profit & Loss' THEN 2
                        WHEN c.name = 'Ratios & Proportions' THEN 3
                        WHEN c.name = 'Simple & Compound Interest' THEN 4
                        WHEN c.name = 'Time & Work' THEN 5
                        WHEN c.name = 'Time, Speed & Distance' THEN 6
                        ELSE 7 + (
                            SELECT COUNT(*)
                            FROM public.concepts c2
                            WHERE c2.sub_topic_id = c.sub_topic_id
                              AND c2.name NOT IN ('Percentages', 'Profit & Loss', 'Ratios & Proportions', 'Simple & Compound Interest', 'Time & Work', 'Time, Speed & Distance')
                              AND c2.created_at < c.created_at
                        )
                    END
                WHEN st.name = 'Algebra' THEN
                    CASE 
                        WHEN c.name = 'Linear Equations' THEN 1
                        WHEN c.name = 'Quadratic Equations' THEN 2
                        WHEN c.name = 'AP, GP & HP' THEN 3
                        WHEN c.name = 'Functions & Graphs' THEN 4
                        ELSE 5 + (
                            SELECT COUNT(*)
                            FROM public.concepts c2
                            WHERE c2.sub_topic_id = c.sub_topic_id
                              AND c2.name NOT IN ('Linear Equations', 'Quadratic Equations', 'AP, GP & HP', 'Functions & Graphs')
                              AND c2.created_at < c.created_at
                        )
                    END
                WHEN st.name = 'Geometry & Mensuration' THEN
                    CASE 
                        WHEN c.name = 'Triangles & Properties' THEN 1
                        WHEN c.name = 'Circles & Tangents' THEN 2
                        WHEN c.name = 'Surface Areas & Volumes' THEN 3
                        ELSE 4 + (
                            SELECT COUNT(*)
                            FROM public.concepts c2
                            WHERE c2.sub_topic_id = c.sub_topic_id
                              AND c2.name NOT IN ('Triangles & Properties', 'Circles & Tangents', 'Surface Areas & Volumes')
                              AND c2.created_at < c.created_at
                        )
                    END
                WHEN st.name = 'Arrangements' THEN
                    CASE 
                        WHEN c.name = 'Linear Arrangements' THEN 1
                        WHEN c.name = 'Circular Arrangements' THEN 2
                        ELSE 3 + (
                            SELECT COUNT(*)
                            FROM public.concepts c2
                            WHERE c2.sub_topic_id = c.sub_topic_id
                              AND c2.name NOT IN ('Linear Arrangements', 'Circular Arrangements')
                              AND c2.created_at < c.created_at
                        )
                    END
                WHEN st.name = 'Syllogisms' THEN
                    CASE 
                        WHEN c.name = 'Basic Syllogisms' THEN 1
                        WHEN c.name = 'Conditional Syllogisms' THEN 2
                        ELSE 3 + (
                            SELECT COUNT(*)
                            FROM public.concepts c2
                            WHERE c2.sub_topic_id = c.sub_topic_id
                              AND c2.name NOT IN ('Basic Syllogisms', 'Conditional Syllogisms')
                              AND c2.created_at < c.created_at
                        )
                    END
                WHEN st.name = 'Grammar & Usage' THEN
                    CASE 
                        WHEN c.name = 'Tenses & Active/Passive' THEN 1
                        WHEN c.name = 'Prepositions & Conjunctions' THEN 2
                        ELSE 3 + (
                            SELECT COUNT(*)
                            FROM public.concepts c2
                            WHERE c2.sub_topic_id = c.sub_topic_id
                              AND c2.name NOT IN ('Tenses & Active/Passive', 'Prepositions & Conjunctions')
                              AND c2.created_at < c.created_at
                        )
                    END
                WHEN st.name = 'Reading Comprehension' THEN
                    CASE 
                        WHEN c.name = 'Inference-based questions' THEN 1
                        WHEN c.name = 'Contextual Vocabulary' THEN 2
                        ELSE 3 + (
                            SELECT COUNT(*)
                            FROM public.concepts c2
                            WHERE c2.sub_topic_id = c.sub_topic_id
                              AND c2.name NOT IN ('Inference-based questions', 'Contextual Vocabulary')
                              AND c2.created_at < c.created_at
                        )
                    END
                ELSE
                    1 + (
                        SELECT COUNT(*)
                        FROM public.concepts c2
                        WHERE c2.sub_topic_id = c.sub_topic_id
                          AND c2.created_at < c.created_at
                    )
            END AS concept_idx
        FROM public.concepts c
        JOIN public.sub_topics st ON c.sub_topic_id = st.id
    ),
    fallback_concept AS (
        SELECT 
            c.id AS concept_id,
            st.id AS subtopic_id,
            d.id AS domain_id
        FROM public.concepts c
        JOIN public.sub_topics st ON c.sub_topic_id = st.id
        JOIN public.domains d ON st.domain_id = d.id
        ORDER BY c.created_at ASC, c.id ASC
        LIMIT 1
    ),
    resolved_questions AS (
        SELECT 
            q.id AS old_id,
            COALESCE(q.concept_id, fb.concept_id) AS concept_id,
            q.created_at
        FROM public.questions q
        CROSS JOIN fallback_concept fb
    ),
    ranked_questions AS (
        SELECT 
            rq.old_id,
            dm.domain_idx,
            sm.subtopic_idx,
            cm.concept_idx,
            ROW_NUMBER() OVER (
                PARTITION BY rq.concept_id 
                ORDER BY rq.created_at ASC, rq.old_id ASC
            ) - 1 AS q_idx
        FROM resolved_questions rq
        JOIN public.concepts c ON rq.concept_id = c.id
        JOIN public.sub_topics st ON c.sub_topic_id = st.id
        JOIN domain_idx_map dm ON st.domain_id = dm.domain_id
        JOIN subtopic_idx_map sm ON c.sub_topic_id = sm.subtopic_id
        JOIN concept_idx_map cm ON rq.concept_id = cm.concept_id
    )
    SELECT 
        old_id,
        -- Construct new sequential ID: BB[CrockfordLetter]BB[Suffix]
        public.int_to_binary_2((domain_idx::BIGINT % 16) >> 2) || public.get_crockford_letter(domain_idx::BIGINT % 16) || public.int_to_binary_2(domain_idx::BIGINT % 16) || 'D-' ||
        public.int_to_binary_2((subtopic_idx::BIGINT % 16) >> 2) || public.get_crockford_letter(subtopic_idx::BIGINT % 16) || public.int_to_binary_2(subtopic_idx::BIGINT % 16) || 'S-' ||
        public.int_to_binary_2((concept_idx::BIGINT % 16) >> 2) || public.get_crockford_letter(concept_idx::BIGINT % 16) || public.int_to_binary_2(concept_idx::BIGINT % 16) || 'C-' ||
        public.int_to_binary_2((q_idx::BIGINT % 16) >> 2) || public.get_crockford_letter(q_idx::BIGINT % 16) || public.int_to_binary_2(q_idx::BIGINT % 16) || 'Q' AS new_id
    FROM ranked_questions
) s
WHERE q.id = s.old_id;

-- H. Re-enable the trigger to capture future single INSERTs/UPDATEs
ALTER TABLE public.questions ENABLE TRIGGER trigger_generate_questions_unified_id;

-- I. Drop foreign keys once more to safely shrink column sizes back
ALTER TABLE IF EXISTS public.question_companies DROP CONSTRAINT IF EXISTS question_companies_question_id_fkey;
ALTER TABLE IF EXISTS public.user_progress DROP CONSTRAINT IF EXISTS user_progress_question_id_fkey;
ALTER TABLE IF EXISTS public.user_bookmarks DROP CONSTRAINT IF EXISTS user_bookmarks_question_id_fkey;
ALTER TABLE IF EXISTS public.question_comments DROP CONSTRAINT IF EXISTS question_comments_question_id_fkey;

-- J. Shrink columns to VARCHAR(27) now that all sequential visual IDs are exactly 27 characters
ALTER TABLE public.questions ALTER COLUMN id TYPE VARCHAR(27);
ALTER TABLE public.question_companies ALTER COLUMN question_id TYPE VARCHAR(27);
ALTER TABLE public.user_progress ALTER COLUMN question_id TYPE VARCHAR(27);
ALTER TABLE public.user_bookmarks ALTER COLUMN question_id TYPE VARCHAR(27);
ALTER TABLE public.question_comments ALTER COLUMN question_id TYPE VARCHAR(27);

-- K. Re-establish final foreign keys with ON UPDATE CASCADE for full operational security
ALTER TABLE public.question_companies ADD CONSTRAINT question_companies_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.user_bookmarks ADD CONSTRAINT user_bookmarks_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.question_comments ADD CONSTRAINT question_comments_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;
