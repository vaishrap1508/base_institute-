-- ==========================================
-- 00009_domain_detail_tables.sql
-- Schema extensions for domain-level analytics, smart insights, and topic tracking
-- ==========================================

-- 1. Create question attempts table
CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create learning sessions table
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
    duration_seconds INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create progress tracking table (concept level progress details)
CREATE TABLE IF NOT EXISTS public.progress_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
    progress_percent INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'Locked' NOT NULL CHECK (status IN ('Locked', 'In Progress', 'Completed')),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, concept_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Allow read/write access to anyone for staging simplicity)
DROP POLICY IF EXISTS "Allow select for attempts" ON public.question_attempts;
CREATE POLICY "Allow select for attempts" ON public.question_attempts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for attempts" ON public.question_attempts;
CREATE POLICY "Allow insert for attempts" ON public.question_attempts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select for sessions" ON public.learning_sessions;
CREATE POLICY "Allow select for sessions" ON public.learning_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for sessions" ON public.learning_sessions;
CREATE POLICY "Allow insert for sessions" ON public.learning_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select for progress" ON public.progress_tracking;
CREATE POLICY "Allow select for progress" ON public.progress_tracking FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write for progress" ON public.progress_tracking;
CREATE POLICY "Allow write for progress" ON public.progress_tracking FOR ALL USING (true) WITH CHECK (true);

-- 6. Dynamic seeding of attempts, sessions, and progress
-- Find first profile record and seed quantitative, verbal and logical concept progress
DO $$
DECLARE
    v_user_id UUID;
    v_question_id UUID;
    
    -- Quant UUIDs
    v_concept_pct UUID := 'f9101842-9607-469d-b231-58dcd6ec872f'; -- Percentages
    v_concept_tsd UUID := '1f93e659-5a4a-47ae-b410-47b4ff156c05'; -- Time, Speed & Distance
    v_concept_quad UUID := '2fd68113-919f-41df-ae54-70904cd3c09e'; -- Quadratic Equations
    
    -- Verbal UUIDs
    v_concept_ten UUID := 'd73f6b93-0495-43e7-a850-dfdcb8a679ea'; -- Tenses & Active/Passive
    v_concept_voc UUID := '67f03daa-8704-40af-8509-1a15298762e4'; -- Contextual Vocabulary
    
    -- Logical UUIDs
    v_concept_lin UUID := 'e7297622-e676-4bec-a839-16ff7137e7e3'; -- Linear Arrangements
BEGIN
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- A. Seed Progress Tracking records
        INSERT INTO public.progress_tracking (user_id, concept_id, progress_percent, status)
        VALUES 
            (v_user_id, v_concept_pct, 75, 'In Progress'),
            (v_user_id, v_concept_tsd, 20, 'In Progress'),
            (v_user_id, v_concept_quad, 0, 'Locked'),
            (v_user_id, v_concept_ten, 85, 'In Progress'),
            (v_user_id, v_concept_voc, 100, 'Completed'),
            (v_user_id, v_concept_lin, 40, 'In Progress')
        ON CONFLICT (user_id, concept_id) DO NOTHING;

        -- B. Seed Learning Sessions (Simulating study sessions)
        INSERT INTO public.learning_sessions (user_id, concept_id, duration_seconds, created_at)
        VALUES
            (v_user_id, v_concept_pct, 1800, NOW() - INTERVAL '2 days'),
            (v_user_id, v_concept_pct, 2400, NOW() - INTERVAL '8 days'), -- stale trigger > 7 days ago
            (v_user_id, v_concept_tsd, 1200, NOW() - INTERVAL '1 day'),
            (v_user_id, v_concept_ten, 3000, NOW() - INTERVAL '3 days'),
            (v_user_id, v_concept_voc, 4500, NOW() - INTERVAL '5 days'),
            (v_user_id, v_concept_lin, 1500, NOW() - INTERVAL '4 days')
        ON CONFLICT DO NOTHING;

        -- C. Seed Question Attempts (to compute dynamic Weakest/Strongest stats & Accuracy)
        -- We resolve one question ID to hook attempts to
        SELECT id INTO v_question_id FROM public.questions LIMIT 1;
        
        IF v_question_id IS NOT NULL THEN
            INSERT INTO public.question_attempts (user_id, question_id, is_correct, time_spent_ms, created_at)
            VALUES
                -- Percentages attempts (62% accuracy)
                (v_user_id, v_question_id, true, 45000, NOW() - INTERVAL '2 days'),
                (v_user_id, v_question_id, false, 60000, NOW() - INTERVAL '2 days'),
                (v_user_id, v_question_id, true, 35000, NOW() - INTERVAL '2 days'),
                (v_user_id, v_question_id, true, 40000, NOW() - INTERVAL '3 days'),
                (v_user_id, v_question_id, false, 75000, NOW() - INTERVAL '3 days'),
                -- Time, Speed & Distance attempts (43% accuracy)
                (v_user_id, v_question_id, false, 90000, NOW() - INTERVAL '1 day'),
                (v_user_id, v_question_id, true, 55000, NOW() - INTERVAL '1 day'),
                (v_user_id, v_question_id, false, 80000, NOW() - INTERVAL '2 days'),
                -- Contextual Vocabulary (85% accuracy)
                (v_user_id, v_question_id, true, 20000, NOW() - INTERVAL '5 days'),
                (v_user_id, v_question_id, true, 15000, NOW() - INTERVAL '5 days'),
                (v_user_id, v_question_id, true, 18000, NOW() - INTERVAL '5 days'),
                (v_user_id, v_question_id, false, 30000, NOW() - INTERVAL '6 days'),
                -- Linear Arrangements (40% accuracy)
                (v_user_id, v_question_id, false, 120000, NOW() - INTERVAL '4 days'),
                (v_user_id, v_question_id, true, 80000, NOW() - INTERVAL '4 days'),
                (v_user_id, v_question_id, false, 95000, NOW() - INTERVAL '4 days')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;
