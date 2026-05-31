-- ==========================================
-- 00005_landing_page.sql
-- Table configurations for Dynamic Landing Page Custom Content and Caching
-- ==========================================

-- 1. Create landing page settings table
CREATE TABLE IF NOT EXISTS public.landing_page_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_paragraph TEXT,
    cta_title TEXT,
    cta_subtitle TEXT,
    faq_items JSONB,
    marquee_images JSONB,
    mentor_name TEXT,
    mentor_designation TEXT,
    mentor_bio TEXT,
    mentor_message TEXT,
    mentor_image TEXT,
    mentor_badge_1 TEXT,
    mentor_badge_2 TEXT,
    mentor_badge_3 TEXT,
    mentor_badge_4 TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create statistics caching table (for 3AM daily cron job simulation)
CREATE TABLE IF NOT EXISTS public.landing_stats_cache (
    id TEXT PRIMARY KEY DEFAULT 'current',
    active_students INTEGER DEFAULT 200000 NOT NULL,
    question_pool INTEGER DEFAULT 10000 NOT NULL,
    company_tags INTEGER DEFAULT 500 NOT NULL,
    college_partnerships INTEGER DEFAULT 150 NOT NULL,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Enable RLS on new tables
ALTER TABLE public.landing_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_stats_cache ENABLE ROW LEVEL SECURITY;

-- 4. Set access rules
-- Read permissions: open to public (anonymous) so any visitor sees the correct content
CREATE POLICY "Allow public read access on landing_page_settings" 
    ON public.landing_page_settings FOR SELECT USING (true);

CREATE POLICY "Allow public read access on landing_stats_cache" 
    ON public.landing_stats_cache FOR SELECT USING (true);

-- Write/Update permissions: allowed for anyone in development staging sandbox, or can restrict to authenticated admin users
CREATE POLICY "Allow write/update access on landing_page_settings" 
    ON public.landing_page_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow write/update access on landing_stats_cache" 
    ON public.landing_stats_cache FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed default records
INSERT INTO public.landing_page_settings (
    id, hero_title, hero_subtitle, hero_paragraph, cta_title, cta_subtitle, faq_items, marquee_images,
    mentor_name, mentor_designation, mentor_bio, mentor_message, mentor_image,
    mentor_badge_1, mentor_badge_2, mentor_badge_3, mentor_badge_4
)
VALUES (
    'current',
    'MASTER APTITUDE WITH THE KINETIC PLATFORM',
    'TRUSTED BY 100K+ STUDENTS AND EMPLOYEES',
    'Experience ''No-Compiler'' learning speed. A structured roadmap designed to take you from fundamentals to company-specific readiness in record time.',
    'Ready to bridge the gap to your dream offer?',
    'Join 2 lakh students who have already transformed their preparation journey.',
    '[
        {"id": "faq-1", "question": "What does \"No-Compiler\" speed mean?", "answer": "Our proprietary engine processes inputs instantly without traditional server-side compilation, allowing students to iterate through logic and aptitude problems 10x faster than conventional platforms."},
        {"id": "faq-2", "question": "Is the platform neutral for all engineering branches?", "answer": "Yes, our core focus is on fundamental quantitative skill sets, logical aptitude, and verbal comprehensions which are industry-standard and branch-agnostic."},
        {"id": "faq-3", "question": "How does the college sync feature work?", "answer": "Colleges can sync their directories to track student progress in real-time, view live metrics, and administer mock placement examinations on the staging environment."},
        {"id": "faq-4", "question": "Are there any seats involved for individual students?", "answer": "No, any student can sign up for free and begin completing practice sections, learning pathways, and video analysis."}
    ]'::jsonb,
    '[
        {"url": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60", "caption": "Interactive Seminar", "category": "Student Interactions"},
        {"url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=60", "caption": "Live Hackathon", "category": "Workshops"},
        {"url": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=60", "caption": "Classroom Activity", "category": "Empowering Campuses"},
        {"url": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=60", "caption": "Placement Success", "category": "Mass Impact"},
        {"url": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=60", "caption": "Campus Mentorship", "category": "Empowering Campuses"},
        {"url": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=60", "caption": "Technical Placement Training", "category": "Workshops"}
    ]'::jsonb,
    'Vaibhav Sharma',
    'Founder & CEO, Kinetic Platform',
    'Hello, I''m Vaibhav Sharma.
Founder and creator of Kinetic Platform.
I built this platform to simplify aptitude, verbal ability, and placement preparation through structured learning paths and practical problem solving.
Whether you''re preparing for placements, competitive exams, or simply improving your aptitude skills, this platform is designed to guide you step by step.',
    'Remember:
Consistency beats intensity.
Small daily improvements create long-term success.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    '🏆 Founder',
    '🎯 Placement Mentor',
    '📚 Aptitude Trainer',
    '⭐ Industry Experience'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.landing_stats_cache (id, active_students, question_pool, company_tags, college_partnerships, last_calculated_at)
VALUES ('current', 200000, 10000, 500, 150, NOW())
ON CONFLICT (id) DO NOTHING;
