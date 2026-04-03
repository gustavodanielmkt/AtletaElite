import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, GripVertical, PlayCircle, PlusCircle, Edit, Dumbbell, LineChart, User, X, Loader2 } from 'lucide-react';
import { searchExercises, getExercisesByCategory, type Exercise } from '../../services/exerciseService';

function proxyGif(gifUrl: string): string {
  if (!gifUrl) return '';
  return `/api/exercise-image?url=${encodeURIComponent(gifUrl)}`;
}

const BODY_PART_PT: Record<string, string> = {
  back: 'Costas', cardio: 'Cardio', chest: 'Peito', neck: 'Pescoço',
  shoulders: 'Ombros', 'upper arms': 'Braços', 'lower arms': 'Antebraços',
  'upper legs': 'Coxas', 'lower legs': 'Panturrilhas', waist: 'Abdômen',
};

const TARGET_PT: Record<string, string> = {
  abductors: 'Abdutores', abs: 'Abdômen', adductors: 'Adutores',
  biceps: 'Bíceps', calves: 'Panturrilhas', 'cardiovascular system': 'Sistema Cardiovascular',
  delts: 'Deltoides', forearms: 'Antebraços', glutes: 'Glúteos',
  hamstrings: 'Isquiotibiais', lats: 'Latíssimo', 'levator scapulae': 'Elevador da Escápula',
  pectorals: 'Peitoral', quads: 'Quadríceps', 'serratus anterior': 'Serrátil',
  spine: 'Coluna', traps: 'Trapézio', triceps: 'Tríceps', 'upper back': 'Parte Superior das Costas',
};

const EQUIPMENT_PT: Record<string, string> = {
  assisted: 'Assistido', band: 'Elástico', barbell: 'Barra', 'body weight': 'Peso Corporal',
  bosu: 'Bosu', cable: 'Cabo/Polia', dumbbell: 'Haltere', 'elliptical machine': 'Elíptico',
  'ez barbell': 'Barra EZ', hammer: 'Martelo', kettlebell: 'Kettlebell',
  'leverage machine': 'Máquina', 'medicine ball': 'Bola Medicinal', olympic: 'Olímpico',
  'resistance band': 'Faixa Elástica', roller: 'Rolo', rope: 'Corda',
  'smith machine': 'Smith', 'stability ball': 'Bola de Estabilidade',
  stationary: 'Estacionário', trap: 'Armadilha', tire: 'Pneu', 'upper body ergometer': 'Ergômetro',
  weighted: 'Com Peso', wheel: 'Roda',
};

function pt(map: Record<string, string>, key: string): string {
  return map[key?.toLowerCase()] ?? key;
}

const CATEGORIES = [
  { key: 'warmup',   label: 'Aquecimento' },
  { key: 'mobility', label: 'Mobilidade' },
  { key: 'strength', label: 'Força' },
  { key: 'recovery', label: 'Recuperação' },
];

interface SelectedExercise extends Exercise {
  sets?: number;
  reps?: number;
  rest?: string;
  duration?: string;
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ProgramBuilder({ navigate }: { navigate: (screen: string) => void }) {
  const [activeCategory, setActiveCategory] = useState('warmup');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const [browseExercises, setBrowseExercises] = useState<Exercise[]>([]);
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  // Carrega exercícios da categoria ativa
  useEffect(() => {
    if (debouncedQuery) return;
    setLoading(true);
    getExercisesByCategory(activeCategory)
      .then(setBrowseExercises)
      .finally(() => setLoading(false));
  }, [activeCategory, debouncedQuery]);

  // Busca por query
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    searchExercises(debouncedQuery)
      .then(setSearchResults)
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const displayExercises = debouncedQuery ? searchResults : browseExercises;

  const addExercise = useCallback((exercise: Exercise) => {
    if (selected.find(s => s.id === exercise.id)) return;
    setSelected(prev => [...prev, { ...exercise, sets: 3, reps: 12, rest: '30s' }]);
    setPreviewExercise(null);
  }, [selected]);

  const removeExercise = (id: string) => {
    setSelected(prev => prev.filter(e => e.id !== id));
  };

  const updateField = (id: string, field: keyof SelectedExercise, value: string | number) => {
    setSelected(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('physio-dashboard')}><ArrowLeft size={24} className="text-slate-400 cursor-pointer" /></button>
            <h2 className="text-xl font-bold leading-tight tracking-tight">Novo Programa</h2>
          </div>
          <button className="bg-[#ccff00] text-background-dark px-6 py-1.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
            Salvar
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-24">
        {/* Search */}
        <div className="px-4 py-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {loading
                ? <Loader2 size={20} className="text-[#ccff00] animate-spin" />
                : <Search size={20} className="text-slate-500 group-focus-within:text-[#ccff00] transition-colors" />
              }
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar exercícios..."
              className="block w-full bg-slate-900 border-none rounded-xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-[#ccff00]/50 transition-all outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        {!debouncedQuery && (
          <div className="pb-2">
            <div className="flex overflow-x-auto px-4 gap-6 hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 whitespace-nowrap transition-colors ${
                    activeCategory === cat.key
                      ? 'border-[#ccff00] text-[#ccff00]'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <p className="text-sm font-bold uppercase tracking-wider">{cat.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise browser */}
        {displayExercises.length > 0 && (
          <div className="px-4 py-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
              {debouncedQuery ? `Resultados para "${debouncedQuery}"` : CATEGORIES.find(c => c.key === activeCategory)?.label}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {displayExercises.map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => setPreviewExercise(exercise)}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-left hover:border-[#ccff00]/50 transition-colors group"
                >
                  <div className="relative w-full aspect-square bg-slate-800">
                    <img
                      src={proxyGif(exercise.gifUrl)}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle size={32} className="text-white" />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-slate-100 capitalize truncate">{exercise.name}</p>
                    <p className="text-[10px] text-[#ccff00] uppercase tracking-tight truncate">{pt(TARGET_PT, exercise.target)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && displayExercises.length === 0 && debouncedQuery && (
          <p className="text-center text-slate-500 py-12">Nenhum exercício encontrado para "{debouncedQuery}"</p>
        )}

        {/* Selected exercises */}
        {selected.length > 0 && (
          <>
            <div className="px-4 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Exercícios Selecionados</h3>
              <span className="text-xs text-slate-500 uppercase font-semibold">{selected.length} {selected.length === 1 ? 'Item' : 'Itens'}</span>
            </div>
            <div className="px-4 space-y-4">
              {selected.map(exercise => (
                <div key={exercise.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 relative group">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-slate-700">
                    <GripVertical size={20} />
                  </div>
                  <button
                    onClick={() => removeExercise(exercise.id)}
                    className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div className="ml-6">
                    <div className="flex gap-4 items-start">
                      <div
                        className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative cursor-pointer"
                        onClick={() => setPreviewExercise(exercise)}
                      >
                        <img src={proxyGif(exercise.gifUrl)} alt={exercise.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <PlayCircle size={24} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-100 capitalize">{exercise.name}</h4>
                        <p className="text-xs text-[#ccff00] font-medium mb-3 uppercase tracking-tighter">{pt(TARGET_PT, exercise.target)} • {pt(EQUIPMENT_PT, exercise.equipment)}</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Séries</span>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={e => updateField(exercise.id, 'sets', Number(e.target.value))}
                              className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Reps</span>
                            <input
                              type="number"
                              value={exercise.reps}
                              onChange={e => updateField(exercise.id, 'reps', Number(e.target.value))}
                              className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Descanso</span>
                            <input
                              type="text"
                              value={exercise.rest}
                              onChange={e => updateField(exercise.id, 'rest', e.target.value)}
                              className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="px-4 mt-4">
          <button className="w-full py-8 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-[#ccff00] hover:text-[#ccff00] transition-all group">
            <PlusCircle size={32} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold uppercase">Adicionar Exercício</span>
          </button>
        </div>
      </main>

      {/* Exercise preview modal */}
      {previewExercise && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={() => setPreviewExercise(null)}>
          <div className="bg-slate-900 rounded-t-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={previewExercise.gifUrl} alt={previewExercise.name} className="w-full aspect-square object-cover rounded-t-3xl" />
              <button onClick={() => setPreviewExercise(null)} className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold capitalize mb-1">{previewExercise.name}</h3>
              <p className="text-[#ccff00] text-sm uppercase tracking-wider mb-4">{pt(TARGET_PT, previewExercise.target)} • {pt(EQUIPMENT_PT, previewExercise.equipment)}</p>
              {previewExercise.secondaryMuscles.length > 0 && (
                <p className="text-xs text-slate-400 mb-4">
                  Músculos secundários: {previewExercise.secondaryMuscles.map(m => pt(TARGET_PT, m)).join(', ')}
                </p>
              )}
              {previewExercise.instructions.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Como executar</h4>
                  {previewExercise.instructions.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-[#ccff00] font-bold text-sm shrink-0">{i + 1}.</span>
                      <p className="text-sm text-slate-400">{step}</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => addExercise(previewExercise)}
                disabled={!!selected.find(s => s.id === previewExercise.id)}
                className="w-full py-4 bg-[#ccff00] text-background-dark font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selected.find(s => s.id === previewExercise.id) ? 'Já adicionado' : 'Adicionar ao Programa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark border-t border-slate-800 px-4 pb-6 pt-2 z-40">
        <div className="flex max-w-2xl mx-auto justify-between items-center">
          <button className="flex flex-col items-center gap-1 text-[#ccff00]">
            <Edit size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Construtor</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Dumbbell size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Exercícios</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <LineChart size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Progresso</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
