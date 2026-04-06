-- =============================================
-- LIMPAR TODO O CACHE DE EXERCÍCIOS
-- para forçar re-tradução via Gemini
-- Execute no Supabase SQL Editor
-- =============================================

DELETE FROM exercises;

-- Confirmar que está vazio
SELECT COUNT(*) AS exercises_remaining FROM exercises;
