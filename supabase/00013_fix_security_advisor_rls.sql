-- Migration to fix Supabase Security Advisor errors: RLS Disabled on Public Tables
-- Target tables: domains, sub_topics, concepts, questions, companies, question_companies

-- 1. Enable Row Level Security (RLS) on all 6 tables
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_companies ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if the current user is an Admin
-- This avoids writing complex subqueries in every policy statement.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'ADMIN'::user_role
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Drop existing policies to prevent conflicts during re-runs
DROP POLICY IF EXISTS "Allow public read access on domains" ON public.domains;
DROP POLICY IF EXISTS "Allow admin write access on domains" ON public.domains;

DROP POLICY IF EXISTS "Allow public read access on sub_topics" ON public.sub_topics;
DROP POLICY IF EXISTS "Allow admin write access on sub_topics" ON public.sub_topics;

DROP POLICY IF EXISTS "Allow public read access on concepts" ON public.concepts;
DROP POLICY IF EXISTS "Allow admin write access on concepts" ON public.concepts;

DROP POLICY IF EXISTS "Allow public read access on questions" ON public.questions;
DROP POLICY IF EXISTS "Allow admin write access on questions" ON public.questions;

DROP POLICY IF EXISTS "Allow public read access on companies" ON public.companies;
DROP POLICY IF EXISTS "Allow admin write access on companies" ON public.companies;

DROP POLICY IF EXISTS "Allow public read access on question_companies" ON public.question_companies;
DROP POLICY IF EXISTS "Allow admin write access on question_companies" ON public.question_companies;


-- 3. Define Policies for "domains"
CREATE POLICY "Allow public read access on domains" 
    ON public.domains FOR SELECT USING (true);

CREATE POLICY "Allow admin write access on domains" 
    ON public.domains FOR ALL TO authenticated 
    USING (public.is_admin()) 
    WITH CHECK (public.is_admin());


-- 4. Define Policies for "sub_topics"
CREATE POLICY "Allow public read access on sub_topics" 
    ON public.sub_topics FOR SELECT USING (true);

CREATE POLICY "Allow admin write access on sub_topics" 
    ON public.sub_topics FOR ALL TO authenticated 
    USING (public.is_admin()) 
    WITH CHECK (public.is_admin());


-- 5. Define Policies for "concepts"
CREATE POLICY "Allow public read access on concepts" 
    ON public.concepts FOR SELECT USING (true);

CREATE POLICY "Allow admin write access on concepts" 
    ON public.concepts FOR ALL TO authenticated 
    USING (public.is_admin()) 
    WITH CHECK (public.is_admin());


-- 6. Define Policies for "questions"
CREATE POLICY "Allow public read access on questions" 
    ON public.questions FOR SELECT USING (true);

CREATE POLICY "Allow admin write access on questions" 
    ON public.questions FOR ALL TO authenticated 
    USING (public.is_admin()) 
    WITH CHECK (public.is_admin());


-- 7. Define Policies for "companies"
CREATE POLICY "Allow public read access on companies" 
    ON public.companies FOR SELECT USING (true);

CREATE POLICY "Allow admin write access on companies" 
    ON public.companies FOR ALL TO authenticated 
    USING (public.is_admin()) 
    WITH CHECK (public.is_admin());


-- 8. Define Policies for "question_companies"
CREATE POLICY "Allow public read access on question_companies" 
    ON public.question_companies FOR SELECT USING (true);

CREATE POLICY "Allow admin write access on question_companies" 
    ON public.question_companies FOR ALL TO authenticated 
    USING (public.is_admin()) 
    WITH CHECK (public.is_admin());
