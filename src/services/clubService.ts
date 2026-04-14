import { supabase } from '../lib/supabase';

// ── Types ────────────────────────────────────────────────────────

export interface Club {
  id: string;
  name: string;
  sport: string | null;
  logoUrl: string | null;
  ownerPhysioId: string;
  inviteCode: string;
  memberCount?: number;
  createdAt: string;
}

export interface ClubMember {
  clubId: string;
  athleteId: string;
  athleteName: string;
  athleteAvatar: string | null;
  jerseyNumber: string | null;
  position: string | null;
  memberStatus: 'active' | 'injured' | 'suspended';
  joinedAt: string;
  // Populated from daily_checkins
  readinessScore: number | null;
  lastCheckIn: string | null;
  painLevel: number | null;
  fatigue: string | null;
}

export interface CheckInData {
  painLevel: number;
  fatigue: 'low' | 'moderate' | 'high' | 'extreme';
  sleepQuality: 'bad' | 'fair' | 'good' | 'great';
  mentalReadiness: number;
  muscleSorenessAreas: string[];
}

export interface AthleteClubInfo {
  club: Club;
  jerseyNumber: string | null;
  position: string | null;
  memberStatus: 'active' | 'injured' | 'suspended';
}

// ── Readiness calculation ────────────────────────────────────────

export function calculateReadinessScore(data: CheckInData): number {
  const painScore = (10 - data.painLevel) / 10;
  const fatigueScore: Record<string, number> = { low: 1.0, moderate: 0.75, high: 0.5, extreme: 0.25 };
  const sleepScore: Record<string, number> = { bad: 0.25, fair: 0.5, good: 0.75, great: 1.0 };
  const mentalScore = data.mentalReadiness / 100;
  return Math.round(
    (painScore * 0.35 + (fatigueScore[data.fatigue] ?? 0.75) * 0.30 +
     (sleepScore[data.sleepQuality] ?? 0.75) * 0.20 + mentalScore * 0.15) * 100
  );
}

export function readinessColor(score: number | null): { bg: string; text: string; label: string } {
  if (score === null) return { bg: 'bg-slate-800', text: 'text-slate-400', label: 'Sem dados' };
  if (score >= 80) return { bg: 'bg-[#ccff00]/10', text: 'text-[#ccff00]', label: 'Pronto' };
  if (score >= 60) return { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Atenção' };
  return { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Alerta' };
}

// ── Club CRUD ────────────────────────────────────────────────────

export async function getPhysioClubs(physioId: string): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*, club_members(count)')
    .eq('owner_physio_id', physioId)
    .order('created_at', { ascending: false });

  if (error) return [];

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    sport: c.sport ?? null,
    logoUrl: c.logo_url ?? null,
    ownerPhysioId: c.owner_physio_id,
    inviteCode: c.invite_code ?? '',
    memberCount: Array.isArray(c.club_members) ? c.club_members[0]?.count ?? 0 : 0,
    createdAt: c.created_at,
  }));
}

export async function createClub(
  physioId: string,
  data: { name: string; sport?: string }
): Promise<{ club?: Club; error?: string }> {
  const { data: row, error } = await supabase
    .from('clubs')
    .insert({ name: data.name.trim(), sport: data.sport?.trim() || null, owner_physio_id: physioId })
    .select()
    .single();

  if (error) return { error: error.message };

  return {
    club: {
      id: row.id,
      name: row.name,
      sport: row.sport ?? null,
      logoUrl: row.logo_url ?? null,
      ownerPhysioId: row.owner_physio_id,
      inviteCode: row.invite_code ?? '',
      memberCount: 0,
      createdAt: row.created_at,
    },
  };
}

export async function deleteClub(clubId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('clubs').delete().eq('id', clubId);
  if (error) return { error: error.message };
  return {};
}

// ── Club members ─────────────────────────────────────────────────

export async function getClubMembers(clubId: string): Promise<ClubMember[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('club_members')
    .select(`
      club_id, athlete_id, jersey_number, position, member_status, joined_at,
      profiles!athlete_id (full_name, avatar_url)
    `)
    .eq('club_id', clubId)
    .order('joined_at');

  if (error || !data) return [];

  // Fetch today's check-ins for all members in one query
  const athleteIds = data.map((m: any) => m.athlete_id);
  const { data: checkins } = await supabase
    .from('daily_checkins')
    .select('athlete_id, date, readiness_score, pain_level, fatigue')
    .in('athlete_id', athleteIds)
    .eq('date', today);

  const checkinMap = new Map<string, any>();
  for (const c of checkins ?? []) checkinMap.set(c.athlete_id, c);

  return data.map((m: any) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    const checkin = checkinMap.get(m.athlete_id);
    return {
      clubId: m.club_id,
      athleteId: m.athlete_id,
      athleteName: profile?.full_name ?? 'Sem nome',
      athleteAvatar: profile?.avatar_url ?? null,
      jerseyNumber: m.jersey_number ?? null,
      position: m.position ?? null,
      memberStatus: m.member_status ?? 'active',
      joinedAt: m.joined_at,
      readinessScore: checkin?.readiness_score ?? null,
      lastCheckIn: checkin?.date ?? null,
      painLevel: checkin?.pain_level ?? null,
      fatigue: checkin?.fatigue ?? null,
    };
  });
}

export async function addAthleteToClub(
  clubId: string,
  athleteId: string,
  jerseyNumber?: string,
  position?: string
): Promise<{ error?: string }> {
  const { error } = await supabase.from('club_members').upsert({
    club_id: clubId,
    athlete_id: athleteId,
    jersey_number: jerseyNumber?.trim() || null,
    position: position?.trim() || null,
  }, { onConflict: 'club_id,athlete_id' });

  if (error) return { error: error.message };
  return {};
}

export async function removeAthleteFromClub(
  clubId: string,
  athleteId: string
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('club_id', clubId)
    .eq('athlete_id', athleteId);
  if (error) return { error: error.message };
  return {};
}

// ── Daily check-in ───────────────────────────────────────────────

export async function saveCheckIn(
  athleteId: string,
  data: CheckInData
): Promise<{ error?: string }> {
  const today = new Date().toISOString().slice(0, 10);
  const readinessScore = calculateReadinessScore(data);

  const { error } = await supabase.from('daily_checkins').upsert({
    athlete_id: athleteId,
    date: today,
    pain_level: data.painLevel,
    fatigue: data.fatigue,
    sleep_quality: data.sleepQuality,
    mental_readiness: data.mentalReadiness,
    muscle_soreness_areas: data.muscleSorenessAreas,
    readiness_score: readinessScore,
  }, { onConflict: 'athlete_id,date' });

  if (error) return { error: error.message };
  return {};
}

export async function getTodayCheckIn(athleteId: string): Promise<(CheckInData & { readinessScore: number }) | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('athlete_id', athleteId)
    .eq('date', today)
    .maybeSingle();

  if (error || !data) return null;

  return {
    painLevel: data.pain_level,
    fatigue: data.fatigue,
    sleepQuality: data.sleep_quality,
    mentalReadiness: data.mental_readiness,
    muscleSorenessAreas: data.muscle_soreness_areas ?? [],
    readinessScore: data.readiness_score,
  };
}

export async function getAthleteClubInfo(athleteId: string): Promise<AthleteClubInfo | null> {
  const { data, error } = await supabase
    .from('club_members')
    .select(`
      jersey_number, position, member_status,
      clubs (id, name, sport, logo_url, owner_physio_id, invite_code, created_at)
    `)
    .eq('athlete_id', athleteId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const club = Array.isArray(data.clubs) ? data.clubs[0] : data.clubs;
  if (!club) return null;

  return {
    club: {
      id: club.id,
      name: club.name,
      sport: club.sport ?? null,
      logoUrl: club.logo_url ?? null,
      ownerPhysioId: club.owner_physio_id,
      inviteCode: club.invite_code ?? '',
      createdAt: club.created_at,
    },
    jerseyNumber: data.jersey_number ?? null,
    position: data.position ?? null,
    memberStatus: data.member_status ?? 'active',
  };
}

// ── Physio athletes (not yet in club) ────────────────────────────

export async function getAthletesNotInClub(
  physioId: string,
  clubId: string
): Promise<{ id: string; fullName: string; avatarUrl: string | null }[]> {
  const { data: members } = await supabase
    .from('club_members')
    .select('athlete_id')
    .eq('club_id', clubId);

  const memberIds = (members ?? []).map((m: any) => m.athlete_id);

  const query = supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('physio_id', physioId)
    .eq('role', 'athlete')
    .order('full_name');

  if (memberIds.length > 0) {
    query.not('id', 'in', `(${memberIds.join(',')})`);
  }

  const { data } = await query;
  return (data ?? []).map((p: any) => ({
    id: p.id,
    fullName: p.full_name ?? 'Sem nome',
    avatarUrl: p.avatar_url ?? null,
  }));
}
