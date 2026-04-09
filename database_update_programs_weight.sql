-- =============================================
-- Migration: adiciona campo weight em program_exercises
-- =============================================

ALTER TABLE public.program_exercises
  ADD COLUMN IF NOT EXISTS weight TEXT DEFAULT null;
