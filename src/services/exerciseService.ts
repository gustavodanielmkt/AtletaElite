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

// ── Cache layer with Gemini translation ─────────────────────────
// Translates name + instructions via Gemini on first fetch, then
// caches in Supabase. Name format: "Nome PT (Original EN)"

async function cacheExercises(exercises: Exercise[]): Promise<Exercise[]> {
  if (!exercises.length) return [];

  // Translate in batches of 3 to avoid overwhelming the API
  const BATCH_SIZE = 3;
  const translated: Exercise[] = [];

  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (e) => {
        const { translatedName, translatedInstructions } = await translateWithGemini(
          e.name,
          e.instructions
        );

        // Format: "Nome PT (Original EN)" — only if translation is different
        const displayName =
          translatedName.toLowerCase() !== e.name.toLowerCase()
            ? `${translatedName} (${e.name})`
            : e.name;

        return {
          exercise: e,
          row: {
            id:                e.id,
            name:              displayName,
            body_part:         e.bodyPart,
            target:            e.target,
            equipment:         e.equipment,
            gif_url:           e.gifUrl || null,
            secondary_muscles: e.secondaryMuscles,
            instructions:      translatedInstructions,
          },
        };
      })
    );
    translated.push(
      ...batchResults.map((r) => ({
        id:               r.row.id,
        name:             r.row.name,
        bodyPart:         r.row.body_part,
        target:           r.exercise.target,
        equipment:        r.exercise.equipment,
        gifUrl:           r.row.gif_url ?? '',
        secondaryMuscles: r.row.secondary_muscles,
        instructions:     r.row.instructions,
      }))
    );

    // Upsert this batch
    await supabase
      .from('exercises')
      .upsert(batchResults.map((r) => r.row), { onConflict: 'id' });
  }

  return translated;
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
// Persists for the lifetime of the app session. Switching back to a
// previously loaded category is instant — no network round-trip.
const _categoryCache = new Map<string, Exercise[]>();

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
  return await cacheExercises(results);
}

export async function getExercisesByCategory(category: string): Promise<Exercise[]> {
  // 1. Memory cache — instant return, no network at all
  if (_categoryCache.has(category)) return _categoryCache.get(category)!;

  const bodyParts = BODY_PART_CATEGORY_MAP[category] ?? [];
  if (!bodyParts.length) return [];

  await cleanupCorruptedRows();

  const { data: cached } = await supabase
    .from('exercises')
    .select('*')
    .in('body_part', bodyParts)
    .not('gif_url', 'is', null)
    .limit(20);

  // 2. Supabase has enough data — return immediately and cache in memory
  if (cached && cached.length >= 10) {
    const results = cached.map(mapDbRow);
    _categoryCache.set(category, results);
    return results;
  }

  // 3. Partial Supabase data — return what we have right away, refresh in background
  if (cached && cached.length > 0) {
    const partial = cached.map(mapDbRow);
    _categoryCache.set(category, partial);

    // Fire-and-forget: fetch full set and update memory cache silently
    (async () => {
      try {
        const fetched = await Promise.all(
          bodyParts.map((part) =>
            fetchFromApi(`/exercises/bodyPart/${encodeURIComponent(part)}?limit=10&offset=0`)
          )
        );
        const fresh = await cacheExercises(fetched.flat());
        _categoryCache.set(category, fresh.slice(0, 20));
      } catch {
        // keep partial data in cache, no visible error
      }
    })();

    return partial;
  }

  // 4. No cache at all — fetch all bodyParts in parallel (was sequential before)
  const fetched = await Promise.all(
    bodyParts.map((part) =>
      fetchFromApi(`/exercises/bodyPart/${encodeURIComponent(part)}?limit=10&offset=0`)
    )
  );
  const results = (await cacheExercises(fetched.flat())).slice(0, 20);
  _categoryCache.set(category, results);
  return results;
}
