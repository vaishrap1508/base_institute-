-- 1. Create Custom Types (Enhanced)
CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE difficulty_level AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE question_type AS ENUM ('MCQ', 'CODING', 'SHORT_ANSWER');

-- 2. Profiles Table (Linked to Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    college TEXT,
    branch TEXT,
    grad_year INTEGER,
    role user_role DEFAULT 'STUDENT'::user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Core Hierarchy (Domain -> Sub-topic -> Concept)
CREATE TABLE public.domains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.sub_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(domain_id, name)
);

CREATE TABLE public.concepts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sub_topic_id UUID REFERENCES public.sub_topics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(sub_topic_id, name)
);

-- 4. Question Bank
CREATE TABLE public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    concept_id UUID REFERENCES public.concepts(id) ON DELETE SET NULL,
    type question_type DEFAULT 'MCQ'::question_type NOT NULL,
    difficulty difficulty_level DEFAULT 'MEDIUM'::difficulty_level NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB, 
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    video_url TEXT, -- YouTube/Bunny ID for solution
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Company Tagging
CREATE TABLE public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE public.question_companies (
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, company_id)
);

-- 6. NEW: Retention & Tracking (Critical for 200k Users)
CREATE TABLE public.user_streaks (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    max_streak INTEGER DEFAULT 0 NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL -- Track exact time/date locally to IST
);

CREATE TABLE public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    is_solved BOOLEAN DEFAULT FALSE,
    solved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    solve_time_ms INTEGER, -- For Screen 10 (Mock stats)
    UNIQUE(user_id, question_id)
);

-- 7. NEW: User Personalization
CREATE TABLE public.user_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    folder_name TEXT DEFAULT 'General',
    note_md TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, question_id)
);

-- 8. NEW: Discussion Threads
CREATE TABLE public.question_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.question_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Performance Indexes
CREATE INDEX idx_questions_concept ON public.questions(concept_id);
CREATE INDEX idx_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_bookmarks_user ON public.user_bookmarks(user_id);
CREATE INDEX idx_comments_question ON public.question_comments(question_id);

-- 10. Security: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_comments ENABLE ROW LEVEL SECURITY;
