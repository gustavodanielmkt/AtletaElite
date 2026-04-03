import { supabase } from '../lib/supabase';

export interface PhysioDashboardStats {
  totalAthletes: number;
  needAttention: number;
  activeInjuries: number;
  todaySessions: number;
}

export async function getPhysioDashboardStats(physioId: string): Promise<PhysioDashboardStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [athletesRes, injuriesRes, sessionsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('physio_id', physioId)
      .eq('role', 'athlete'),

    supabase
      .from('injuries')
      .select('athlete_id', { count: 'exact' })
      .eq('physio_id', physioId)
      .eq('status', 'active'),

    supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('physio_id', physioId)
      .in('status', ['scheduled', 'done'])
      .gte('scheduled_at', todayStart.toISOString())
      .lte('scheduled_at', todayEnd.toISOString()),
  ]);

  const totalAthletes = athletesRes.count ?? 0;
  const activeInjuries = injuriesRes.count ?? 0;
  const todaySessions = sessionsRes.count ?? 0;

  // "Precisam de Atenção" = atletas distintos com lesão ativa
  const athletesWithInjury = new Set(
    (injuriesRes.data ?? []).map((r: { athlete_id: string }) => r.athlete_id)
  ).size;

  return {
    totalAthletes,
    needAttention: athletesWithInjury,
    activeInjuries,
    todaySessions,
  };
}
