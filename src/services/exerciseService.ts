/// <reference types="vite/client" />
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
  source?: 'exercisedb' | 'wger' | 'seed' | 'custom';
  isCustom?: boolean;
  createdBy?: string;
}

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST;
const WGER_BASE = 'https://wger.de/api/v2';
const WGER_LANGUAGE_PT = 7;

const BODY_PART_CATEGORY_MAP: Record<string, string[]> = {
  warmup:     ['cardio'],
  mobility:   ['back', 'neck', 'shoulders'],
  strength:   ['chest', 'lower arms', 'lower legs', 'upper arms', 'upper legs', 'waist'],
  recovery:   ['back', 'lower legs', 'upper legs'],
  stretching: ['stretching'],
};

// Map from our body part names to Wger category names
const WGER_BODY_PART_MAP: Record<string, string[]> = {
  back:         ['Back'],
  cardio:       ['Cardio'],
  chest:        ['Chest'],
  'lower arms': ['Arms'],
  'lower legs': ['Calves'],
  neck:         [],
  shoulders:    ['Shoulders'],
  'upper arms': ['Arms'],
  'upper legs': ['Legs'],
  waist:        ['Abs'],
  stretching:   [], // Only from seeded data
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

    if (translatedName.length > 200 || translatedName.includes('```')) {
      return { translatedName: name, translatedInstructions: instructions };
    }

    return { translatedName, translatedInstructions };
  } catch (err) {
    console.warn('[exerciseService] Translation failed, using English:', err);
    return { translatedName: name, translatedInstructions: instructions };
  }
}

// ── ExerciseDB API helpers ───────────────────────────────────────

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
    source:           'exercisedb',
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

// ── Wger API helpers ─────────────────────────────────────────────

let _wgerCategories: Record<string, number> | null = null;

async function getWgerCategories(): Promise<Record<string, number>> {
  if (_wgerCategories) return _wgerCategories;
  try {
    const res = await fetch(`${WGER_BASE}/exercisecategory/?format=json`);
    if (!res.ok) throw new Error('Wger categories unavailable');
    const data = await res.json();
    const map: Record<string, number> = {};
    for (const cat of data.results ?? []) {
      map[cat.name] = cat.id;
    }
    _wgerCategories = map;
    return map;
  } catch {
    return {};
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseWgerInstructions(description: string): string[] {
  const text = stripHtml(description);
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15)
    .slice(0, 8);
}

function mapWgerExercise(raw: Record<string, unknown>, bodyPart: string): Exercise | null {
  const translations = raw.translations as Array<Record<string, unknown>> ?? [];
  const ptTranslation = translations.find(
    (t) => (t.language as Record<string, unknown>)?.id === WGER_LANGUAGE_PT
  );
  const enTranslation = translations.find(
    (t) => (t.language as Record<string, unknown>)?.id === 2
  );
  const translation = ptTranslation ?? enTranslation;
  if (!translation) return null;

  const name = String(translation.name ?? '').trim();
  if (!name || name.length < 2) return null;

  const description = String(translation.description ?? '');
  const instructions = parseWgerInstructions(description);

  const images = raw.images as Array<Record<string, unknown>> ?? [];
  const mainImage = images.find(img => img.is_main) ?? images[0];
  const gifUrl = mainImage ? String(mainImage.image ?? '') : '';

  const muscles = raw.muscles as Array<Record<string, unknown>> ?? [];
  const musclesSecondary = raw.muscles_secondary as Array<Record<string, unknown>> ?? [];
  const target = muscles[0] ? String(muscles[0].name ?? '') : '';
  const secondaryMuscles = musclesSecondary.map(m => String(m.name ?? ''));

  const equipment = raw.equipment as Array<Record<string, unknown>> ?? [];
  const equipmentName = equipment[0] ? String(equipment[0].name ?? 'body weight').toLowerCase() : 'body weight';

  return {
    id:              `wger_${raw.id}`,
    name,
    bodyPart,
    target,
    equipment:       equipmentName,
    gifUrl,
    secondaryMuscles,
    instructions,
    source:          'wger',
  };
}

async function fetchFromWger(bodyPart: string): Promise<Exercise[]> {
  const categoryNames = WGER_BODY_PART_MAP[bodyPart] ?? [];
  if (categoryNames.length === 0) return [];

  try {
    const categoryIds = await getWgerCategories();
    const ids = categoryNames.map(n => categoryIds[n]).filter(Boolean);
    if (ids.length === 0) return [];

    const results: Exercise[] = [];
    const seen = new Set<string>();

    await Promise.all(
      ids.map(async (catId) => {
        const res = await fetch(
          `${WGER_BASE}/exerciseinfo/?format=json&category=${catId}&limit=20`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!res.ok) return;
        const data = await res.json();
        for (const item of data.results ?? []) {
          const exercise = mapWgerExercise(item as Record<string, unknown>, bodyPart);
          if (exercise && !seen.has(exercise.id)) {
            seen.add(exercise.id);
            results.push(exercise);
          }
        }
      })
    );

    return results;
  } catch (err) {
    console.warn('[exerciseService] Wger fetch failed:', err);
    return [];
  }
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
    source:            e.source ?? 'exercisedb',
    is_custom:         e.isCustom ?? false,
    created_by:        e.createdBy ?? null,
  };
}

async function saveToSupabase(exercises: Exercise[]): Promise<void> {
  if (!exercises.length) return;
  await supabase
    .from('exercises')
    .upsert(exercises.map(toDbRow), { onConflict: 'id' });
}

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
    source:           (row.source as Exercise['source']) ?? 'exercisedb',
    isCustom:         Boolean(row.is_custom),
    createdBy:        row.created_by ? String(row.created_by) : undefined,
  };
}

function mergeExercises(fromDb: Exercise[], fromWger: Exercise[]): Exercise[] {
  const seen = new Set<string>();
  const result: Exercise[] = [];
  for (const e of [...fromDb, ...fromWger]) {
    const key = e.name.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(e);
    }
  }
  return result.slice(0, 30);
}

// ── In-memory cache ─────────────────────────────────────────────
const _categoryCache = new Map<string, Exercise[]>();

export const ALL_BODY_PARTS = [
  'back', 'cardio', 'chest', 'lower arms', 'lower legs',
  'neck', 'shoulders', 'stretching', 'upper arms', 'upper legs', 'waist',
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
  athleteId: string | null;
  physioId: string;
  isTemplate: boolean;
  exercises: ProgramExercise[];
}

export interface Athlete {
  id: string;
  fullName: string;
  avatarUrl: string | null;
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

  const results = await fetchFromApi(
    `/exercises/name/${encodeURIComponent(query.toLowerCase())}?limit=20&offset=0`
  );
  await saveToSupabase(results);
  translateAndUpdate(results, `search:${query}`);
  return results;
}

export async function getExercisesByBodyPart(
  bodyPart: string,
  onTranslated?: (updated: Exercise[]) => void
): Promise<Exercise[]> {
  const cacheKey = `bodypart:${bodyPart}`;

  if (_categoryCache.has(cacheKey)) return _categoryCache.get(cacheKey)!;

  await cleanupCorruptedRows();

  // Stretching: only seeded/custom data from Supabase, no external API
  if (bodyPart === 'stretching') {
    const { data: cached } = await supabase
      .from('exercises')
      .select('*')
      .eq('body_part', 'stretching')
      .order('name')
      .limit(60);

    const results = (cached ?? []).map(mapDbRow);
    _categoryCache.set(cacheKey, results);
    return results;
  }

  // Check Supabase cache (non-seed exercises)
  const { data: cached } = await supabase
    .from('exercises')
    .select('*')
    .eq('body_part', bodyPart)
    .not('id', 'like', 'seed_%')
    .limit(30);

  if (cached && cached.length >= 15) {
    const results = cached.map(mapDbRow);
    _categoryCache.set(cacheKey, results);

    // Fetch Wger in background if not yet present for this body part
    const hasWger = cached.some((r: Record<string, unknown>) => String(r.id ?? '').startsWith('wger_'));
    if (!hasWger) {
      (async () => {
        try {
          const fromWger = await fetchFromWger(bodyPart);
          if (fromWger.length === 0) return;
          const merged = mergeExercises(results, fromWger);
          await saveToSupabase(fromWger);
          _categoryCache.set(cacheKey, merged);
          onTranslated?.(merged);
        } catch { /* silent */ }
      })();
    }

    return results;
  }

  // Partial data: return immediately, fetch from both APIs in background
  if (cached && cached.length > 0) {
    const partial = cached.map(mapDbRow);
    _categoryCache.set(cacheKey, partial);

    (async () => {
      try {
        const [edbResult, wgerResult] = await Promise.allSettled([
          fetchFromApi(`/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=20&offset=0`),
          fetchFromWger(bodyPart),
        ]);
        const fromEdb = edbResult.status === 'fulfilled' ? edbResult.value : [];
        const fromWger = wgerResult.status === 'fulfilled' ? wgerResult.value : [];
        const merged = mergeExercises(fromEdb, fromWger);
        await saveToSupabase(merged);
        const needsTranslation = merged.filter(e => e.source === 'exercisedb');
        if (needsTranslation.length > 0) {
          translateAndUpdate(needsTranslation, cacheKey, onTranslated);
        } else {
          _categoryCache.set(cacheKey, merged);
          onTranslated?.(merged);
        }
      } catch { /* keep partial */ }
    })();

    return partial;
  }

  // No cache: fetch from both APIs in parallel
  const [edbResult, wgerResult] = await Promise.allSettled([
    fetchFromApi(`/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=20&offset=0`),
    fetchFromWger(bodyPart),
  ]);

  const fromEdb = edbResult.status === 'fulfilled' ? edbResult.value.slice(0, 20) : [];
  const fromWger = wgerResult.status === 'fulfilled' ? wgerResult.value : [];
  const merged = mergeExercises(fromEdb, fromWger);

  await saveToSupabase(merged);
  _categoryCache.set(cacheKey, merged);

  // Only translate ExerciseDB exercises (Wger already has PT or will translate in background)
  const needsTranslation = merged.filter(e => e.source === 'exercisedb');
  if (needsTranslation.length > 0) {
    translateAndUpdate(needsTranslation, cacheKey, onTranslated);
  }

  return merged;
}

type ExerciseRow = {
  exerciseId: string;
  phase: 'warmup' | 'mobility' | 'strength' | 'recovery';
  sets: number;
  reps: number;
  rest: string;
  sortOrder: number;
};

async function insertProgramExercises(programId: string, exercises: ExerciseRow[]): Promise<{ error: string } | null> {
  const rows = exercises.map((e) => ({
    program_id:  programId,
    exercise_id: e.exerciseId,
    phase:       e.phase,
    sets:        e.sets,
    reps:        e.reps,
    rest:        e.rest,
    sort_order:  e.sortOrder,
  }));
  const { error } = await supabase.from('program_exercises').insert(rows);
  return error ? { error: error.message } : null;
}

export async function saveProgram(
  physioId: string,
  athleteId: string,
  name: string,
  exercises: ExerciseRow[]
): Promise<{ programId: string } | { error: string }> {
  const { data: program, error: progErr } = await supabase
    .from('programs')
    .insert({ physio_id: physioId, athlete_id: athleteId, name, is_template: false })
    .select('id')
    .single();

  if (progErr || !program) return { error: progErr?.message ?? 'Erro ao salvar programa.' };

  const err = await insertProgramExercises(program.id, exercises);
  if (err) return err;

  return { programId: program.id };
}

export async function saveTemplate(
  physioId: string,
  name: string,
  exercises: ExerciseRow[]
): Promise<{ programId: string } | { error: string }> {
  const { data: program, error: progErr } = await supabase
    .from('programs')
    .insert({ physio_id: physioId, athlete_id: null, name, is_template: true })
    .select('id')
    .single();

  if (progErr || !program) return { error: progErr?.message ?? 'Erro ao salvar modelo.' };

  const err = await insertProgramExercises(program.id, exercises);
  if (err) return err;

  return { programId: program.id };
}

export async function getPhysioAthletes(physioId: string): Promise<Athlete[]> {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('physio_id', physioId)
    .eq('role', 'athlete')
    .order('full_name');

  return (data ?? []).map((r: any) => ({
    id:        r.id,
    fullName:  r.full_name ?? 'Atleta',
    avatarUrl: r.avatar_url ?? null,
  }));
}

export async function getPhysioTemplates(physioId: string): Promise<Program[]> {
  const { data: programs } = await supabase
    .from('programs')
    .select('id, name, physio_id, is_template')
    .eq('physio_id', physioId)
    .eq('is_template', true)
    .order('created_at', { ascending: false });

  if (!programs || programs.length === 0) return [];

  const result: Program[] = await Promise.all(
    programs.map(async (p: any) => {
      const { data: rows } = await supabase
        .from('program_exercises')
        .select(`id, phase, sets, reps, rest, sort_order,
          exercises(id, name, body_part, target, equipment, gif_url, secondary_muscles, instructions)`)
        .eq('program_id', p.id)
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

      return { id: p.id, name: p.name, athleteId: null, physioId: p.physio_id, isTemplate: true, exercises };
    })
  );

  return result;
}

export async function getActiveProgram(athleteId: string): Promise<Program | null> {
  const { data: program, error } = await supabase
    .from('programs')
    .select('id, name, athlete_id, physio_id, is_template')
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
    id:         program.id,
    name:       program.name,
    athleteId:  program.athlete_id,
    physioId:   program.physio_id,
    isTemplate: program.is_template ?? false,
    exercises,
  };
}

export async function getExercisesByCategory(
  category: string,
  onTranslated?: (updated: Exercise[]) => void
): Promise<Exercise[]> {
  if (_categoryCache.has(category)) return _categoryCache.get(category)!;

  const bodyParts = BODY_PART_CATEGORY_MAP[category] ?? [];
  if (!bodyParts.length) return [];

  await cleanupCorruptedRows();

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

  const fetched = (await Promise.all(
    bodyParts.map((part) =>
      fetchFromApi(`/exercises/bodyPart/${encodeURIComponent(part)}?limit=10&offset=0`)
    )
  )).flat().slice(0, 20);

  await saveToSupabase(fetched);
  _categoryCache.set(category, fetched);
  translateAndUpdate(fetched, category, onTranslated);

  return fetched;
}

// ── Custom exercise CRUD ────────────────────────────────────────

export interface CustomExerciseInput {
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  instructions: string[];
  gifUrl?: string;
  physioId: string;
}

export async function createCustomExercise(
  input: CustomExerciseInput
): Promise<{ exercise: Exercise } | { error: string }> {
  const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const exercise: Exercise = {
    id,
    name:            input.name.trim(),
    bodyPart:        input.bodyPart,
    target:          input.target.trim(),
    equipment:       input.equipment.trim(),
    gifUrl:          input.gifUrl?.trim() ?? '',
    secondaryMuscles: [],
    instructions:    input.instructions.filter(i => i.trim().length > 0),
    source:          'custom',
    isCustom:        true,
    createdBy:       input.physioId,
  };

  const { error } = await supabase
    .from('exercises')
    .insert(toDbRow(exercise));

  if (error) return { error: error.message };

  // Invalidate cache for this body part
  _categoryCache.delete(`bodypart:${input.bodyPart}`);

  return { exercise };
}

export async function getCustomExercises(physioId: string): Promise<Exercise[]> {
  const { data } = await supabase
    .from('exercises')
    .select('*')
    .eq('is_custom', true)
    .eq('created_by', physioId)
    .order('name');

  return (data ?? []).map(mapDbRow);
}

export async function deleteCustomExercise(exerciseId: string): Promise<{ error: string } | null> {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId)
    .eq('is_custom', true);

  if (error) return { error: error.message };

  // Invalidate all body part caches
  _categoryCache.clear();

  return null;
}
