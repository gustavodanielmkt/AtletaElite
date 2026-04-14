-- Phase 1: Category Refinement
-- Run this SQL in the Supabase SQL Editor

-- 1.1: Move mobility seed exercises to their own body_part
UPDATE public.exercises
SET body_part = 'mobility'
WHERE id LIKE 'seed_mob_%';

-- Verify
SELECT body_part, count(*) FROM public.exercises
WHERE id LIKE 'seed_%'
GROUP BY body_part
ORDER BY body_part;
