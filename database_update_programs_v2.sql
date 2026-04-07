-- =============================================
-- Atualização: programs v2
-- - athlete_id passa a ser opcional (templates não têm atleta)
-- - nova coluna is_template
-- =============================================

ALTER TABLE public.programs
    ALTER COLUMN athlete_id DROP NOT NULL;

ALTER TABLE public.programs
    ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false;

-- Índice para buscar templates do fisio rapidamente
CREATE INDEX IF NOT EXISTS programs_template_idx ON public.programs(physio_id, is_template);

-- Política: fisio pode ler os próprios templates
-- (já coberto pela política "Physio can manage own programs" via physio_id = auth.uid())
