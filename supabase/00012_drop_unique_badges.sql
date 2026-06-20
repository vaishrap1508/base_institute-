-- Drop the UNIQUE constraint on user_badges to allow earning a badge multiple times (with multipliers)
ALTER TABLE public.user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_badge_id_key;
