-- =============================================
-- Tabela: programs (Programas de treino)
-- =============================================
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    physio_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Physio can manage own programs"
    ON public.programs FOR ALL
    TO authenticated
    USING (physio_id = auth.uid());

CREATE POLICY "Athlete can read own programs"
    ON public.programs FOR SELECT
    TO authenticated
    USING (athlete_id = auth.uid());

CREATE INDEX IF NOT EXISTS programs_physio_idx ON public.programs(physio_id);
CREATE INDEX IF NOT EXISTS programs_athlete_idx ON public.programs(athlete_id);

-- =============================================
-- Tabela: program_exercises (Exercícios do programa)
-- =============================================
CREATE TABLE IF NOT EXISTS public.program_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    phase TEXT NOT NULL CHECK (phase IN ('warmup', 'mobility', 'strength', 'recovery')),
    sets INTEGER,
    reps INTEGER,
    rest TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.program_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Physio can manage program exercises"
    ON public.program_exercises FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.programs p
            WHERE p.id = program_id AND p.physio_id = auth.uid()
        )
    );

CREATE POLICY "Athlete can read own program exercises"
    ON public.program_exercises FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.programs p
            WHERE p.id = program_id AND p.athlete_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS program_exercises_program_idx ON public.program_exercises(program_id);
CREATE INDEX IF NOT EXISTS program_exercises_phase_idx ON public.program_exercises(program_id, phase);
