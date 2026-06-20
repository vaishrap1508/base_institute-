-- ==========================================
-- 00008_student_dashboard_extensions.sql
-- Table configurations for Career Opportunities Hub and Admin Announcements
-- ==========================================

-- 1. Create opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Hiring' | 'Internship' | 'Government Exam' | 'Event' | 'Webinar' | 'Hackathon' | 'Scholarship'
    deadline TEXT NOT NULL,
    days_remaining INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'Open' | 'Closing Soon' | 'New' | 'Expired'
    details TEXT,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Placement Update' | 'New Course' | 'Notice' | 'Event' | 'Platform'
    content TEXT NOT NULL,
    publisher TEXT NOT NULL,
    priority TEXT NOT NULL, -- 'High' | 'Medium' | 'Low'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Allow public read access on opportunities" ON public.opportunities;
CREATE POLICY "Allow public read access on opportunities" 
    ON public.opportunities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write/update access on opportunities" ON public.opportunities;
CREATE POLICY "Allow write/update access on opportunities" 
    ON public.opportunities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access on announcements" ON public.announcements;
CREATE POLICY "Allow public read access on announcements" 
    ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write/update access on announcements" ON public.announcements;
CREATE POLICY "Allow write/update access on announcements" 
    ON public.announcements FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed default records
INSERT INTO public.opportunities (id, title, organization, type, deadline, days_remaining, status, details, link)
VALUES 
    ('opt-1', 'TCS NQT National Qualifier Test', 'Tata Consultancy Services', 'Hiring', 'July 28', 12, 'Closing Soon', 'Access the TCS National Qualifier Test for multiple systems roles. Open to 2025/2026 batches.', 'https://nextstep.tcs.com/'),
    ('opt-2', 'SWE Intern - Product Engineering', 'Microsoft India', 'Internship', 'August 15', 30, 'New', '3-month summer internship working with the Azure cloud networking tools team in Hyderabad.', 'https://careers.microsoft.com/'),
    ('opt-3', 'SSC CGL Executive Officers Recruitment', 'Staff Selection Commission', 'Government Exam', 'June 30', 5, 'Open', 'Staff Selection Commission Combined Graduate Level Examination for assistant audit officers.', 'https://ssc.gov.in/'),
    ('opt-4', 'Stripe Global FinTech Hackathon', 'Stripe Inc.', 'Hackathon', 'July 10', 18, 'Open', 'Build next-generation payment interfaces using API integrations. Total prize pool $50,000.', 'https://stripe.com/'),
    ('opt-5', 'General Aptitude Scholarship Test', 'Kinetic Platform', 'Scholarship', 'June 15', 2, 'Closing Soon', 'Win up to 100% discount on Kinetic Premium preparation models and interview certifications.', '#'),
    ('opt-6', 'UPSC Civil Services Prelims 2026', 'Union Public Service Commission', 'Government Exam', 'March 15', 0, 'Expired', 'Union Public Service Commission civil services main stage registration portals.', 'https://upsc.gov.in/')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.announcements (id, title, type, content, publisher, priority)
VALUES
    ('ann-1', 'Goldman Sachs Mock assessment goes live this Sunday', 'Notice', 'The weekly simulated mock assessment designed for Goldman Sachs preparation window begins at 10:00 AM on Sunday. Make sure your local sandbox compiler is synced.', 'Placement Coordinator', 'High'),
    ('ann-2', 'New Verbal Reasoning modules added to the Practice Arena', 'New Course', 'We have introduced 15 new high-fidelity sets on grammatical corrections, modifiers, and syntax maps under the Verbal Ability section.', 'Content Team', 'Medium'),
    ('ann-3', 'Dynamic Career Opportunities Hub integration completed', 'Platform', 'You can now view live hiring drives, internships, government exams, hackathons, and webinars directly from your unified Command Center.', 'Dev Team', 'High')
ON CONFLICT (id) DO NOTHING;
