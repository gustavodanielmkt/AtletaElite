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

async function translateText(text: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-BR`
    );
    const data = await res.json();
    return data.responseData?.translatedText || text;
  } catch {
    return text;
  }
}

async function translateInstructions(instructions: string[]): Promise<string[]> {
  const translated = await Promise.all(instructions.map(translateText));
  return translated;
}

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

async function cacheExercises(exercises: Exercise[]): Promise<void> {
  if (!exercises.length) return;

  // Traduz instruções antes de cachear (só acontece uma vez por exercício)
  const withTranslations = await Promise.all(
    exercises.map(async (e) => {
      const [translatedName, translatedInstructions] = await Promise.all([
        translateText(e.name),
        translateInstructions(e.instructions),
      ]);
      return {
        id:                e.id,
        name:              translatedName,
        body_part:         e.bodyPart,
        target:            e.target,
        equipment:         e.equipment,
        gif_url:           e.gifUrl || null,
        secondary_muscles: e.secondaryMuscles,
        instructions:      translatedInstructions,
      };
    })
  );

  await supabase.from('exercises').upsert(withTranslations, { onConflict: 'id' });
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

export async function searchExercises(query: string): Promise<Exercise[]> {
  if (!query || query.length < 2) return [];

  const { data: cached } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(20);

  if (cached && cached.length > 0) return cached.map(mapDbRow);

  const results = await fetchFromApi(
    `/exercises/name/${encodeURIComponent(query.toLowerCase())}?limit=20&offset=0`
  );
  await cacheExercises(results);
  return results;
}

export async function getExercisesByCategory(category: string): Promise<Exercise[]> {
  const bodyParts = BODY_PART_CATEGORY_MAP[category] ?? [];
  if (!bodyParts.length) return [];

  const { data: cached } = await supabase
    .from('exercises')
    .select('*')
    .in('body_part', bodyParts)
    .not('gif_url', 'is', null)
    .limit(20);

  if (cached && cached.length >= 10) return cached.map(mapDbRow);

  const allResults: Exercise[] = [];
  for (const part of bodyParts) {
    const results = await fetchFromApi(
      `/exercises/bodyPart/${encodeURIComponent(part)}?limit=10&offset=0`
    );
    allResults.push(...results);
  }
  await cacheExercises(allResults);
  return allResults.slice(0, 20);
}
