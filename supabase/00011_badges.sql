-- ==========================================
-- 00011_badges.sql
-- Schema configurations for Badge Management and Achievement System (Phase 1 Only)
-- ==========================================

-- 1. Expand public.profiles to track XP and visited sections
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS visited_sections TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;

-- 2. Create Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_name TEXT UNIQUE NOT NULL,
    badge_category TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    unlock_condition JSONB NOT NULL,
    xp_reward INTEGER DEFAULT 0 NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create User Badges Progress Table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ,
    progress_percentage INTEGER DEFAULT 0 NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    current_value INTEGER DEFAULT 0 NOT NULL,
    target_value INTEGER DEFAULT 0 NOT NULL,
    has_seen_popup BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 5. Set Access Policies (Allow full read/write for staging simplicity, matching other tables)
DROP POLICY IF EXISTS "Allow public select for badges" ON public.badges;
CREATE POLICY "Allow public select for badges" ON public.badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write access for badges" ON public.badges;
CREATE POLICY "Allow write access for badges" ON public.badges FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select for user_badges" ON public.user_badges;
CREATE POLICY "Allow public select for user_badges" ON public.user_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write access for user_badges" ON public.user_badges;
CREATE POLICY "Allow write access for user_badges" ON public.user_badges FOR ALL USING (true) WITH CHECK (true);

-- Delete Explorer badge if it exists (moved to Phase 2)
DELETE FROM public.badges WHERE badge_name = 'Explorer';

-- 6. Seed Stage 1 Badges (Badges 1-9)
INSERT INTO public.badges (badge_name, badge_category, description, image_url, unlock_condition, xp_reward, level)
VALUES
  ('First Step', 'Getting Started', 'Awarded when you complete your first learning activity, lesson, quiz, or question.', '/badges/stage1/01.png', '{"type": "activity_count", "target": 1}'::jsonb, 100, 1),
  ('Getting Started', 'Getting Started', 'Awarded when onboarding and profile setup are completed.', '/badges/stage1/02.png', '{"type": "onboarding_completed"}'::jsonb, 100, 1),
  ('Curious Mind', 'Getting Started', 'Awarded when you explore multiple sections of the platform.', '/badges/stage1/03.png', '{"type": "explore_count", "target": 3}'::jsonb, 150, 1),
  ('Learning Begins', 'Getting Started', 'Awarded when your first learning module is completed.', '/badges/stage1/04.png', '{"type": "module_completed"}'::jsonb, 200, 1),
  ('First Challenge', 'Getting Started', 'Awarded when the first aptitude challenge or practice test is attempted.', '/badges/stage1/05.png', '{"type": "challenge_attempted"}'::jsonb, 150, 1),
  ('Keep Going', 'Getting Started', 'Awarded after completing 5 learning activities.', '/badges/stage1/06.png', '{"type": "activity_count", "target": 5}'::jsonb, 250, 1),
  ('Early Bird', 'Getting Started', 'Awarded after learning for 3 consecutive days.', '/badges/stage1/07.png', '{"type": "streak_days", "target": 3}'::jsonb, 300, 1),
  ('On Track', 'Getting Started', 'Awarded after reaching 25% completion of the first learning path.', '/badges/stage1/08.png', '{"type": "path_progress", "target": 25}'::jsonb, 300, 1),
  ('Not Stopping', 'Getting Started', 'Awarded after completing 10 learning activities.', '/badges/stage1/09.png', '{"type": "activity_count", "target": 10}'::jsonb, 400, 1)
ON CONFLICT (badge_name) DO UPDATE SET
  badge_category = EXCLUDED.badge_category,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  unlock_condition = EXCLUDED.unlock_condition,
  xp_reward = EXCLUDED.xp_reward,
  level = EXCLUDED.level;
