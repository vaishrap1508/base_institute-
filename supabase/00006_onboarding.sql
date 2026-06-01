-- ==========================================
-- 00006_onboarding.sql
-- Table configurations for User Onboarding Flow
-- ==========================================

-- Create onboarding profile table linked to auth.users
CREATE TABLE IF NOT EXISTS public.onboarding_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    user_type TEXT,
    country TEXT,
    state TEXT,
    college TEXT,
    degree TEXT,
    branch TEXT,
    graduation_year INTEGER,
    primary_goal TEXT,
    target_timeline TEXT,
    weekly_commitment TEXT,
    learning_preference TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.onboarding_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own onboarding profile" ON public.onboarding_profile;
DROP POLICY IF EXISTS "Users can insert own onboarding profile" ON public.onboarding_profile;
DROP POLICY IF EXISTS "Users can update own onboarding profile" ON public.onboarding_profile;

-- Create policies
CREATE POLICY "Users can view own onboarding profile" ON public.onboarding_profile
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding profile" ON public.onboarding_profile
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding profile" ON public.onboarding_profile
    FOR UPDATE USING (auth.uid() = user_id);
