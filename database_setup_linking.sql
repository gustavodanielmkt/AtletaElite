-- 1. Adicionar as colunas de Vínculo na tabela de perfis (se já não existirem)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS physio_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- 2. Vincular o atleta Gustavo Diretamente ao profissional Rafael Claro
UPDATE public.profiles
SET physio_id = (SELECT id FROM public.profiles WHERE full_name ILIKE '%Rafael Claro%' AND role = 'physio' LIMIT 1)
WHERE full_name ILIKE '%gustavo%' AND role = 'athlete';
