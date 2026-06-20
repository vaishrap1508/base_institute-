-- ==========================================
-- 00010_email_infrastructure.sql
-- Add email verification, password reset, and logging infrastructure
-- ==========================================

-- 1. Add email_verified flag to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE NOT NULL;

-- Update existing profiles (like admin accounts) to be verified by default
UPDATE public.profiles 
SET email_verified = TRUE 
WHERE email IN ('sarah.c@aptitude-ai.com', 'marcus.w@aptitude-ai.com', 'student@university.edu', 'sriram_neppalli@university.edu');

-- 2. Create Email Verifications Table
CREATE TABLE IF NOT EXISTS public.email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create Password Resets Table
CREATE TABLE IF NOT EXISTS public.password_resets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create Email Logs Table (Database Queue)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'sent', 'failed'
    provider TEXT DEFAULT 'resend' NOT NULL,
    error_message TEXT,
    attempts INTEGER DEFAULT 0 NOT NULL,
    last_attempt_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    body_html TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON public.email_verifications(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON public.password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON public.email_logs(created_at DESC);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are left empty so that only the service_role client (used by backend APIs) has full access.

-- 7. Update handle_new_user() trigger function to auto-verify OAuth signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, email_verified)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    CASE 
      WHEN new.email = 'sarah.c@aptitude-ai.com' THEN 'ADMIN'::user_role
      ELSE 'STUDENT'::user_role
    END,
    (new.email_confirmed_at IS NOT NULL) -- If OAuth confirms email immediately, mark verified
  )
  ON CONFLICT (id) DO UPDATE
  SET email_verified = EXCLUDED.email_verified OR public.profiles.email_verified;
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user trigger: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
