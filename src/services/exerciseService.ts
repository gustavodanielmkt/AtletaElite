import { supabase } from '../lib/supabase';

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  secondaryMuscles: string[];
  instructions: string[];
}

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST;

const BODY_PART_CATEGORY_MAP: Record<string, string[]> = {
  warmup:   ['cardio'],
  mobility: ['back', 'neck', 'shoulders'],
  strength: ['chest', 'lower arms', 'lower legs', 'upper arms', 'upper legs', 'waist'],
  recovery: ['back', 'lower legs', 'upper legs'],
};

// ── Corruption cleanup ─────────────────────────────────────────
let _cleanupDone = false;

async function cleanupCorruptedRows(): Promise<void> {
  if (_cleanupDone) return;
  _cleanupDone = true;

  try {
    await supabase
      .from('exercises')
      .delete()
      .ilike('name', 'MYMEMORY WARNING%');

    const { data: all } = await supabase
      .from('exercises')
      .select('id, instructions');

    if (all && all.length > 0) {
      const corruptedIds = all
        .filter((row: { id: string; instructions: string[] }) => {
          if (!Array.isArray(row.instructions)) return false;
          return row.instructions.some(
            (instr: string) => typeof instr === 'string' && instr.startsWith('MYMEMORY WARNING')
          );
        })
        .map((row: { id: string }) => row.id);

      if (corruptedIds.length > 0) {
        await supabase
          .from('exercises')
          .delete()
          .in('id', corruptedIds);
      }
    }
  } catch (err) {
    console.warn('[exerciseService] Cleanup failed:', err);
  }
}

// ── Gemini Translation ──────────────────────────────────────────
// Calls our /api/translate serverless function (Gemini 2.0 Flash).
// Returns translated name + instructions. Falls back to English on error.

async function translateWithGemini(
  name: string,
  instructions: string[]
): Promise<{ translatedName: string; translatedInstructions: string[] }> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, instructions }),
    });

    if (!res.ok) throw new Error(`translate API: ${res.status}`);

    const data = await res.json();

    const translatedName = data.translatedName || name;
    const translatedInstructions =
      Array.isArray(data.translatedInstructions) && data.translatedInstructions.length === instructions.length
        ? data.translatedInstructions
        : instructions;

    // Safety: reject if Gemini returned garbage
    if (translatedName.length > 200 || translatedName.includes('```')) {
      return { translatedName: name, translatedInstructions: instructions };
    }

    return { translatedName, translatedInstructions };
  } catch (err) {
    console.warn('[exerciseService] Translation failed, using English:', err);
    return { translatedName: name, translatedInstructions: instructions };
  }
}

// ── API helpers ─────────────────────────────────────────────────

function mapApiExercise(raw: Record<string, unknown>): Exercise {
  const id = String(raw.id);
  return {
    id,
    name:             String(raw.name),
    bodyPart:         String(raw.bodyPart || raw.body_part || ''),
    target:           String(raw.target || ''),
    equipment:        String(raw.equipment || ''),
    gifUrl:           '',
    secondaryMuscles: Array.isArray(raw.secondaryMuscles) ? raw.secondaryMuscles.map(String) : [],
    instructions:     Array.isArray(raw.instructions) ? raw.instructions.map(String) : [],
  };
}

async function fetchFromApi(endpoint: string): Promise<Exercise[]> {
  const url = `https://${RAPIDAPI_HOST}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'x-rapidapi-key':  RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });
  if (!res.ok) throw new Error(`ExerciseDB API error: ${res.status}`);
  const json = await res.json();
  const items: Record<string, unknown>[] = Array.isArray(json) ? json : (json.data ?? []);
  return items.map(mapApiExercise);
}

// ── Helpers ─────────────────────────────────────────────────────

function toDbRow(e: Exercise) {
  return {
    id:                e.id,
    name:              e.name,
    body_part:         e.bodyPart,
    target:            e.target,
    equipment:         e.equipment,
    gif_url:           e.gifUrl || null,
    secondary_muscles: e.secondaryMuscles,
    instructions:      e.instructions,
  };
}

// Save exercises to Supabase immediately, without translation.
async function saveToSupabase(exercises: Exercise[]): Promise<void> {
  if (!exercises.length) return;
  await supabase
    .from('exercises')
    .upsert(exercises.map(toDbRow), { onConflict: 'id' });
}

// Translate all exercises in parallel (not sequential batches).
// Updates memory cache and Supabase when done, then calls onDone.
async function translateAndUpdate(
  exercises: Exercise[],
  category: string,
  onDone?: (updated: Exercise[]) => void
): Promise<void> {
  try {
    const translated = await Promise.all(
      exercises.map(async (e) => {
        const { translatedName, translatedInstructions } = await translateWithGemini(
          e.name,
          e.instructions
        );
        const displayName =
          translatedName.toLowerCase() !== e.name.toLowerCase()
            ? `${translatedName} (${e.name})`
            : e.name;
        return { ...e, name: displayName, instructions: translatedInstructions };
      })
    );

    await saveToSupabase(translated);
    _categoryCache.set(category, translated);
    onDone?.(translated);
  } catch (err) {
    console.warn('[exerciseService] Background translation failed:', err);
  }
}

function mapDbRow(row: Record<string, unknown>): Exercise {
  return {
    id:               String(row.id),
    name:             String(row.name),
    bodyPart:         String(row.body_part || ''),
    target:           String(row.target || ''),
    equipment:        String(row.equipment || ''),
    gifUrl:           row.gif_url ? String(row.gif_url) : '',
    secondaryMuscles: Array.isArray(row.secondary_muscles) ? row.secondary_muscles.map(String) : [],
    instructions:     Array.isArray(row.instructions) ? row.instructions.map(String) : [],
  };
}

// ── In-memory cache ─────────────────────────────────────────────
const _categoryCache = new Map<string, Exercise[]>();

export const ALL_BODY_PARTS = [
  'back', 'cardio', 'chest', 'lower arms', 'lower legs',
  'neck', 'shoulders', 'upper arms', 'upper legs', 'waist',
] as const;

export type BodyPart = typeof ALL_BODY_PARTS[number];

export interface ProgramExercise extends Exercise {
  programExerciseId: string;
  phase: 'warmup' | 'mobility' | 'strength' | 'recovery';
  sets: number;
  reps: number;
  rest: string;
  sortOrder: number;
}

export interface Program {
  id: string;
  name: string;
  athleteId: string;
  physioId: string;
  exercises: ProgramExercise[];
}

// ── Public API ──────────────────────────────────────────────────

export async function searchExercises(query: string): Promise<Exercise[]> {
  if (!query || query.length < 2) return [];

  await cleanupCorruptedRows();

  const { data: cached } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(20);

  if (cached && cached.length > 0) return cached.map(mapDbRow);

  // Fetch, save in English, translate in background
  const results = await fetchFromApi(
    `/exercises/name/${encodeURIComponent(query.toLowerCase())}?limit=20&offset=0`
  );
  await saveToSupabase(results);
  translateAndUpdate(results, `search:${query}`);
  return results;
}

// Fetch exercises by a single API body part (for ProgramBuilder browse tabs).
export async function getExercisesByBodyPart(
  bodyPart: string,
  onTranslated?: (updated: Exercise[]) => void
): Promise<Exercise[]> {
  const cacheKey = `bodypart:${bodyPart}`;

  if (_categoryCache.has(cacheKey)) return _categoryCache.get(cacheKey)!;

  await cleanupCorruptedRows();

  const { data: cached } = await supabase
    .from('exercises')
    .select('*')
    .eq('body_part', bodyPart)
    .limit(20);

  if (cached && cached.length >= 10) {
    const results = cached.map(mapDbRow);
    _categoryCache.set(cacheKey, results);
    return results;
  }

  if (cached && cached.length > 0) {
    const partial = cached.map(mapDbRow);
    _categoryCache.set(cacheKey, partial);
    (async () => {
      try {
        const fetched = await fetchFromApi(
          `/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=20&offset=0`
        );
        await saveToSupabase(fetched);
        translateAndUpdate(fetched, cacheKey, onTranslated);
      } catch { /* keep partial */ }
    })();
    return partial;
  }

  const fetched = (await fetchFromApi(
    `/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=20&offset=0`
  )).slice(0, 20);

  await saveToSupabase(fetched);
  _categoryCache.set(cacheKey, fetched);
  translateAndUpdate(fetched, cacheKey, onTranslated);
  return fetched;
}

// Save a new program with its exercises to Supabase.
export async function saveProgram(
  physioId: string,
  athleteId: string,
  name: string,
  exercises: Array<{
    exerciseId: string;
    phase: 'warmup' | 'mobility' | 'strength' | 'recovery';
    sets: number;
    reps: number;
    rest: string;
    sortOrder: number;
  }>
): Promise<{ programId: string } | { error: string }> {
  const { data: program, error: progErr } = await supabase
    .from('programs')
    .insert({ physio_id: physioId, athlete_id: athleteId, name })
    .select('id')
    .single();

  if (progErr || !program) return { error: progErr?.message ?? 'Erro ao salvar programa.' };

  const rows = exercises.map((e) => ({
    program_id: program.id,
    exercise_id: e.exerciseId,
    phase:       e.phase,
    sets:        e.sets,
    reps:        e.reps,
    rest:        e.rest,
    sort_order:  e.sortOrder,
  }));

  const { error: exErr } = await supabase.from('program_exercises').insert(rows);
  if (exErr) return { error: exErr.message };

  return { programId: program.id };
}

// Fetch the most recent program assigned to an athlete, with full exercise data.
export async function getActiveProgram(athleteId: string): Promise<Program | null> {
  const { data: program, error } = await supabase
    .from('programs')
    .select('id, name, athlete_id, physio_id')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !program) return null;

  const { data: rows } = await supabase
    .from('program_exercises')
    .select(`
      id,
      phase,
      sets,
      reps,
      rest,
      sort_order,
      exercises (
        id, name, body_part, target, equipment,
        gif_url, secondary_muscles, instructions
      )
    `)
    .eq('program_id', program.id)
    .order('sort_order');

  const exercises: ProgramExercise[] = (rows ?? [])
    .filter((r: any) => r.exercises)
    .map((r: any) => ({
      programExerciseId: r.id,
      phase:             r.phase,
      sets:              r.sets ?? 3,
      reps:              r.reps ?? 12,
      rest:              r.rest ?? '30s',
      sortOrder:         r.sort_order,
      id:                r.exercises.id,
      name:              r.exercises.name,
      bodyPart:          r.exercises.body_part,
      target:            r.exercises.target,
      equipment:         r.exercises.equipment,
      gifUrl:            r.exercises.gif_url ?? '',
      secondaryMuscles:  r.exercises.secondary_muscles ?? [],
      instructions:      r.exercises.instructions ?? [],
    }));

  return {
    id:        program.id,
    name:      program.name,
    athleteId: program.athlete_id,
    physioId:  program.physio_id,
    exercises,
  };
}

// onTranslated: optional callback fired when background translation finishes.
// The component uses this to swap English names for Portuguese without a reload.
export async function getExercisesByCategory(
  category: string,
  onTranslated?: (updated: Exercise[]) => void
): Promise<Exercise[]> {
  // 1. Memory cache — instant, no network
  if (_categoryCache.has(category)) return _categoryCache.get(category)!;

  const bodyParts = BODY_PART_CATEGORY_MAP[category] ?? [];
  if (!bodyParts.length) return [];

  await cleanupCorruptedRows();

  // 2. Supabase cache — no gif_url filter (was the bug causing cache misses)
  const { data: cached } = await supabase
    .from('exercises')
    .select('*')
    .in('body_part', bodyParts)
    .limit(20);

  if (cached && cached.length >= 10) {
    const results = cached.map(mapDbRow);
    _categoryCache.set(category, results);
    return results;
  }

  // 3. Partial Supabase data — return immediately, fetch full set in background
  if (cached && cached.length > 0) {
    const partial = cached.map(mapDbRow);
    _categoryCache.set(category, partial);

    (async () => {
      try {
        const fetched = (await Promise.all(
          bodyParts.map((part) =>
            fetchFromApi(`/exercises/bodyPart/${encodeURIComponent(part)}?limit=10&offset=0`)
          )
        )).flat().slice(0, 20);
        await saveToSupabase(fetched);
        translateAndUpdate(fetched, category, onTranslated);
      } catch { /* keep partial */ }
    })();

    return partial;
  }

  // 4. No cache at all — fetch all bodyParts in parallel, save in English immediately,
  //    return to user (~2-3s), then translate in background.
  const fetched = (await Promise.all(
    bodyParts.map((part) =>
      fetchFromApi(`/exercises/bodyPart/${encodeURIComponent(part)}?limit=10&offset=0`)
    )
  )).flat().slice(0, 20);

  await saveToSupabase(fetched);
  _categoryCache.set(category, fetched);

  // Translate in background — updates Supabase + memory cache when done
  translateAndUpdate(fetched, category, onTranslated);

  return fetched;
}
