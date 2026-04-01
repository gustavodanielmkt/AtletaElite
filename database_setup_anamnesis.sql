-- 1. Create the Anamnesis table
CREATE TABLE public.anamnesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'completed',
    general_data JSONB DEFAULT '{}',
    sports_history JSONB DEFAULT '{}',
    injury_history JSONB DEFAULT '{}',
    medical_history JSONB DEFAULT '{}',
    functional_eval JSONB DEFAULT '{}',
    biomechanics_eval JSONB DEFAULT '{}',
    treatment_goals JSONB DEFAULT '{}',
    specific_questionnaire JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Athletes can insert, read, and update their own anamnesis
CREATE POLICY "Athletes can manage their own anamnesis" 
ON public.anamnesis 
FOR ALL 
USING (auth.uid() = athlete_id);

-- Physios can read any anamnesis (for now, eventually restricted to linked athletes)
CREATE POLICY "Physios can view all anamnesis" 
ON public.anamnesis 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'physio')
);
