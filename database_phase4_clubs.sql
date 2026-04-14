-- Phase 4: Club / Team Management + Daily Check-ins
-- Run this SQL in the Supabase SQL Editor

-- ── 1. Daily Check-ins ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  pain_level      INTEGER NOT NULL DEFAULT 0 CHECK (pain_level BETWEEN 0 AND 10),
  fatigue         TEXT NOT NULL DEFAULT 'low'
                    CHECK (fatigue IN ('low','moderate','high','extreme')),
  sleep_quality   TEXT NOT NULL DEFAULT 'good'
                    CHECK (sleep_quality IN ('bad','fair','good','great')),
  mental_readiness INTEGER NOT NULL DEFAULT 80
                    CHECK (mental_readiness BETWEEN 0 AND 100),
  muscle_soreness_areas TEXT[] DEFAULT '{}',
  readiness_score INTEGER NOT NULL DEFAULT 80
                    CHECK (readiness_score BETWEEN 0 AND 100),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (athlete_id, date)
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='daily_checkins' AND policyname='Athlete manages own checkins') THEN
    CREATE POLICY "Athlete manages own checkins"
      ON public.daily_checkins FOR ALL TO authenticated
      USING (athlete_id = auth.uid()) WITH CHECK (athlete_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='daily_checkins' AND policyname='Physio reads athlete checkins') THEN
    CREATE POLICY "Physio reads athlete checkins"
      ON public.daily_checkins FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = daily_checkins.athlete_id
            AND p.physio_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ── 2. Clubs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clubs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  sport            TEXT,
  logo_url         TEXT,
  owner_physio_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code      TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clubs' AND policyname='Physio manages own clubs') THEN
    CREATE POLICY "Physio manages own clubs"
      ON public.clubs FOR ALL TO authenticated
      USING (owner_physio_id = auth.uid()) WITH CHECK (owner_physio_id = auth.uid());
  END IF;
END $$;

-- ── 3. Club Members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.club_members (
  club_id        UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  athlete_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  jersey_number  TEXT,
  position       TEXT,
  member_status  TEXT DEFAULT 'active' CHECK (member_status IN ('active','injured','suspended')),
  joined_at      TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (club_id, athlete_id)
);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='club_members' AND policyname='Physio manages club members') THEN
    CREATE POLICY "Physio manages club members"
      ON public.club_members FOR ALL TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_members.club_id AND c.owner_physio_id = auth.uid())
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_members.club_id AND c.owner_physio_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='club_members' AND policyname='Athlete reads own memberships') THEN
    CREATE POLICY "Athlete reads own memberships"
      ON public.club_members FOR SELECT TO authenticated
      USING (athlete_id = auth.uid());
  END IF;
END $$;

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_daily_checkins_athlete_date ON public.daily_checkins (athlete_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON public.club_members (club_id);
CREATE INDEX IF NOT EXISTS idx_clubs_physio ON public.clubs (owner_physio_id);

-- ── Verify ───────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('daily_checkins','clubs','club_members')
ORDER BY table_name;
