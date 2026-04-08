-- =============================================
-- Migration: exercises table v2
-- Adiciona suporte a exercícios customizados, seed e Wger
-- =============================================

-- Novos campos na tabela exercises
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'exercisedb',
  ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT NULL;

-- Índice para buscar exercícios customizados por fisioterapeuta
CREATE INDEX IF NOT EXISTS exercises_created_by_idx ON public.exercises(created_by);
CREATE INDEX IF NOT EXISTS exercises_is_custom_idx ON public.exercises(is_custom) WHERE is_custom = true;

-- Policy: fisioterapeuta pode atualizar e deletar apenas seus próprios exercícios customizados
CREATE POLICY IF NOT EXISTS "Physio can delete own custom exercises"
  ON public.exercises FOR DELETE
  TO authenticated
  USING (is_custom = true AND created_by = auth.uid());
