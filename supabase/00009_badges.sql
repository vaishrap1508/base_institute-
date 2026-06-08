-- ==========================================
-- 00009_badges.sql
-- Table configurations for Gamification and Achievement Badges
-- ==========================================

-- 1. Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id VARCHAR(100) PRIMARY KEY,
    name TEXT NOT NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create user_badges junction table
CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id VARCHAR(100) REFERENCES public.badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);

-- 3. Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 4. RLS Access Rules
DROP POLICY IF EXISTS "Allow public read access on badges" ON public.badges;
CREATE POLICY "Allow public read access on badges" 
    ON public.badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own unlocked badges" ON public.user_badges;
CREATE POLICY "Users can view own unlocked badges" 
    ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allows trigger/definers to insert user badges" ON public.user_badges;
CREATE POLICY "Allows trigger/definers to insert user badges" 
    ON public.user_badges FOR INSERT WITH CHECK (true);

-- 5. Seed all badges (Levels 1 to 5)
INSERT INTO public.badges (id, name, level, description, image_url, category)
VALUES
    -- STANDALONE: Getting Started Badges (Phase 1)
    ('gs_first_step', 'First Step', 1, 'Solve your first practice question.', '/badges/first_step.png', 'getting_started'),
    ('gs_getting_started', 'Getting Started', 1, 'Complete onboarding profile setup.', '/badges/getting_started.png', 'getting_started'),
    ('gs_curious_mind', 'Curious Mind', 1, 'Bookmark your first practice question.', '/badges/curious_mind.png', 'getting_started'),
    ('gs_learning_begins', 'Learning Begins', 1, 'Bookmark 5 practice questions.', '/badges/learning_begins.png', 'getting_started'),
    ('gs_first_challenge', 'First Challenge', 1, 'Participate in your first mock test.', '/badges/first_challenge.png', 'getting_started'),
    ('gs_keep_going', 'Keep Going', 1, 'Solve 10 total questions.', '/badges/keep_going.png', 'getting_started'),
    ('gs_early_bird', 'Early Bird', 1, 'Solve any question between 4:00 AM and 7:00 AM.', '/badges/early_bird.png', 'getting_started'),
    ('gs_on_track', 'On Track', 1, 'Reach a daily streak of 3 days.', '/badges/on_track.png', 'getting_started'),
    ('gs_not_stopping', 'Not Stopping', 1, 'Reach a daily streak of 5 days.', '/badges/not_stopping.png', 'getting_started'),

    -- LEVEL 1: Micro Badges
    ('explorer_lvl1', 'Explorer', 1, 'Start the journey by solving your first question.', '/badges/explorer_lvl1.png', 'learning'),
    ('quick_starter_lvl1', 'Quick Starter', 1, 'Complete your onboarding profile setup.', '/badges/quick_starter_lvl1.png', 'profile'),
    ('thinker_lvl1', 'Thinker', 1, 'Ignite ideas by solving a Hard difficulty question.', '/badges/thinker_lvl1.png', 'learning'),
    ('logic_lover_lvl1', 'Logic Lover', 1, 'Solve and evolve by completing 5 Logical Reasoning questions.', '/badges/logic_lover_lvl1.png', 'logical'),
    ('pattern_spotter_lvl1', 'Pattern Spotter', 1, 'Find connections in quantitative patterns.', '/badges/pattern_spotter_lvl1.png', 'quant'),
    ('mind_mapper_lvl1', 'Mind Mapper', 1, 'See the big picture by completing a topic map.', '/badges/mind_mapper_lvl1.png', 'learning'),
    ('smart_move_lvl1', 'Smart Move', 1, 'Make it count by solving a question in under 10 seconds.', '/badges/smart_move_lvl1.png', 'speed'),
    ('problem_solver_lvl1', 'Problem Solver', 1, 'Find the solution for 10 total questions.', '/badges/problem_solver_lvl1.png', 'learning'),
    ('on_track_lvl1', 'On Track', 1, 'Stay on track with a 3-day streak.', '/badges/on_track_lvl1.png', 'streak'),
    ('not_stopping_lvl1', 'Not Stopping', 1, 'Keep going by reaching a 5-day streak.', '/badges/not_stopping_lvl1.png', 'streak'),

    -- LEVEL 2: Tier Badges
    ('explorer_lvl2', 'Explorer (Tier 2)', 2, 'Begin the advanced tier by solving 20 questions.', '/badges/explorer_lvl2.png', 'learning'),
    ('quick_starter_lvl2', 'Quick Starter (Tier 2)', 2, 'Set up custom goals in onboarding.', '/badges/quick_starter_lvl2.png', 'profile'),
    ('thinker_lvl2', 'Thinker (Tier 2)', 2, 'Solve 5 Hard difficulty questions.', '/badges/thinker_lvl2.png', 'learning'),
    ('logic_lover_lvl2', 'Logic Lover (Tier 2)', 2, 'Solve 15 Logical Reasoning questions.', '/badges/logic_lover_lvl2.png', 'logical'),
    ('pattern_spotter_lvl2', 'Pattern Spotter (Tier 2)', 2, 'Solve 15 Quantitative Aptitude questions.', '/badges/pattern_spotter_lvl2.png', 'quant'),
    ('mind_mapper_lvl2', 'Mind Mapper (Tier 2)', 2, 'Complete 3 learning sub-topics.', '/badges/mind_mapper_lvl2.png', 'learning'),
    ('smart_move_lvl2', 'Smart Move (Tier 2)', 2, 'Solve 5 questions in under 10 seconds each.', '/badges/smart_move_lvl2.png', 'speed'),
    ('deep_diver_lvl2', 'Deep Diver', 2, 'Go beyond by solving 50 total questions.', '/badges/deep_diver_lvl2.png', 'learning'),

    -- LEVEL 3: Mastery Badges
    ('curious_mind_lvl3', 'Curious Mind', 3, 'Love to question by posting 3 comments in discussion threads.', '/badges/curious_mind_lvl3.png', 'community'),
    ('learning_begins_lvl3', 'Learning Begins', 3, 'Every step matters - bookmark 5 challenging questions.', '/badges/learning_begins_lvl3.png', 'profile'),
    ('first_challenge_lvl3', 'First Challenge', 3, 'Step into practice by completing your first full mock test.', '/badges/first_challenge_lvl3.png', 'mock'),

    -- LEVEL 4: Legendary Badges
    ('learning_seeker_lvl4', 'Learning Seeker', 4, 'Always exploring - solve 100 total questions.', '/badges/learning_seeker_lvl4.png', 'learning'),
    ('knowledge_hunter_lvl4', 'Knowledge Hunter', 4, 'Curious & inquisitive - achieve 100% score on a mock test.', '/badges/knowledge_hunter_lvl4.png', 'mock'),

    -- LEVEL 5: Mythic Badge
    ('the_explorer_lvl5', 'The Explorer', 5, 'Explorer Supreme - complete all syllabus modules and mock tests.', '/badges/the_explorer_lvl5.png', 'learning')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    level = EXCLUDED.level,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    category = EXCLUDED.category;
