-- =============================================
-- Tabela: injuries (Lesões)
-- =============================================
CREATE TABLE IF NOT EXISTS public.injuries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    physio_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT,
    body_part TEXT,
    severity TEXT CHECK (severity IN ('low', 'moderate', 'high')) DEFAULT 'moderate',
    status TEXT CHECK (status IN ('active', 'recovered')) DEFAULT 'active',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS: Lesões
ALTER TABLE public.injuries ENABLE ROW LEVEL SECURITY;

-- Fisio vê e gerencia lesões dos seus atletas
CREATE POLICY "Physio manages own athletes injuries"
    ON public.injuries
    USING (physio_id = auth.uid());

-- Atleta vê suas próprias lesões
CREATE POLICY "Athlete views own injuries"
    ON public.injuries FOR SELECT
    USING (athlete_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS injuries_physio_id_idx ON public.injuries(physio_id);
CREATE INDEX IF NOT EXISTS injuries_athlete_id_idx ON public.injuries(athlete_id);
CREATE INDEX IF NOT EXISTS injuries_status_idx ON public.injuries(status);

-- =============================================
-- Tabela: sessions (Sessões)
-- =============================================
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    physio_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    session_type TEXT DEFAULT 'individual',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT CHECK (status IN ('scheduled', 'done', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS: Sessões
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Fisio vê e gerencia suas sessões
CREATE POLICY "Physio manages own sessions"
    ON public.sessions
    USING (physio_id = auth.uid());

-- Atleta vê suas próprias sessões
CREATE POLICY "Athlete views own sessions"
    ON public.sessions FOR SELECT
    USING (athlete_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS sessions_physio_id_idx ON public.sessions(physio_id);
CREATE INDEX IF NOT EXISTS sessions_athlete_id_idx ON public.sessions(athlete_id);
CREATE INDEX IF NOT EXISTS sessions_scheduled_at_idx ON public.sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON public.sessions(status);
