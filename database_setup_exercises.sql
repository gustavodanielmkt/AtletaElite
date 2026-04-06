-- =============================================
-- Tabela: exercises (Cache de exercícios da API)
-- =============================================
CREATE TABLE IF NOT EXISTS public.exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    body_part TEXT,
    target TEXT,
    equipment TEXT,
    gif_url TEXT,
    secondary_muscles TEXT[],
    instructions TEXT[],
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Sem RLS: exercícios são públicos para todos os usuários autenticados
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read exercises"
    ON public.exercises FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert exercises"
    ON public.exercises FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update exercises"
    ON public.exercises FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete exercises"
    ON public.exercises FOR DELETE
    TO authenticated
    USING (true);

-- Índices para busca
CREATE INDEX IF NOT EXISTS exercises_name_idx ON public.exercises USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS exercises_body_part_idx ON public.exercises(body_part);
CREATE INDEX IF NOT EXISTS exercises_target_idx ON public.exercises(target);
CREATE INDEX IF NOT EXISTS exercises_equipment_idx ON public.exercises(equipment);
