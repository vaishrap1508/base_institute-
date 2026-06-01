-- ==========================================
-- 00007_onboarding_settings.sql
-- Table configurations for Dynamic Onboarding flow Options
-- ==========================================

-- 1. Create onboarding settings table
CREATE TABLE IF NOT EXISTS public.onboarding_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    goal_options JSONB NOT NULL,
    timeline_options JSONB NOT NULL,
    commitment_options JSONB NOT NULL,
    preference_options JSONB NOT NULL,
    indian_states JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.onboarding_settings ENABLE ROW LEVEL SECURITY;

-- 3. Set access rules
-- Read permissions: open to public (anonymous) so any signing student sees the dynamic content
DROP POLICY IF EXISTS "Allow public read access on onboarding_settings" ON public.onboarding_settings;
CREATE POLICY "Allow public read access on onboarding_settings" 
    ON public.onboarding_settings FOR SELECT USING (true);

-- Write/Update permissions: open in sandbox staging environment, or restricted to admin
DROP POLICY IF EXISTS "Allow write/update access on onboarding_settings" ON public.onboarding_settings;
CREATE POLICY "Allow write/update access on onboarding_settings" 
    ON public.onboarding_settings FOR ALL USING (true) WITH CHECK (true);

-- 4. Seed default onboarding options records
INSERT INTO public.onboarding_settings (
    id, 
    goal_options, 
    timeline_options, 
    commitment_options, 
    preference_options, 
    indian_states
)
VALUES (
    'current',
    '[
        {"id": "placements", "label": "Campus Placements", "desc": "Crack standard institutional service & product placement stems."},
        {"id": "competitive", "label": "Competitive Exams", "desc": "Prepare for GRE, GATE, and general analytical exams."},
        {"id": "government", "label": "Government Exams", "desc": "Solve logical aptitude matrices for public services."},
        {"id": "mba", "label": "CAT / MBA Preparation", "desc": "Master advanced quantitative and reading comprehension metrics."},
        {"id": "banking", "label": "Banking Exams", "desc": "Boost rapid speed math calculations and logical sequences."},
        {"id": "skills", "label": "Improve Aptitude Skills", "desc": "Hone analytical reasoning, formulas, and visual logic."},
        {"id": "english", "label": "Improve English Communication", "desc": "Master active verbal comprehension and grammatical syntax."},
        {"id": "others", "label": "Others", "desc": "Specify your own custom primary learning or preparation goal."}
    ]'::jsonb,
    '["Within 1 Month", "Within 3 Months", "Within 6 Months", "Within 1 Year", "Just Exploring"]'::jsonb,
    '["Less than 3 Hours", "3–5 Hours", "5–10 Hours", "10–15 Hours", "15+ Hours"]'::jsonb,
    '["Practice Questions Only", "Learn Concepts First", "Concept + Practice", "Mock Tests"]'::jsonb,
    '[
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
        "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
        "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    goal_options = EXCLUDED.goal_options,
    timeline_options = EXCLUDED.timeline_options,
    commitment_options = EXCLUDED.commitment_options,
    preference_options = EXCLUDED.preference_options,
    indian_states = EXCLUDED.indian_states,
    updated_at = NOW();
