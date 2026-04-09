import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Search, GripVertical, PlayCircle, PlusCircle, Edit, LineChart, User, X, Loader2, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, BookTemplate, Users, Info, Dumbbell, ImagePlus } from 'lucide-react';
import {
  searchExercises, getExercisesByBodyPart, saveProgram, saveTemplate,
  getPhysioAthletes, getPhysioTemplates, createCustomExercise, updateExerciseImage,
  ALL_BODY_PARTS, type Exercise, type Program, type Athlete,
} from '../../services/exerciseService';
import { supabase } from '../../lib/supabase';


const BODY_PART_PT: Record<string, string> = {
  back: 'Costas', cardio: 'Cardio', chest: 'Peito', neck: 'Pescoço',
  shoulders: 'Ombros', 'upper arms': 'Braços', 'lower arms': 'Antebraços',
  'upper legs': 'Coxas', 'lower legs': 'Panturrilhas', waist: 'Abdômen',
  stretching: 'Alongamentos',
};

function exerciseImgSrc(exercise: Exercise): string {
  if (exercise.gifUrl?.startsWith('http')) return exercise.gifUrl;
  if (exercise.gifUrl?.startsWith('/api/')) return exercise.gifUrl;
  if (exercise.id.startsWith('wger_') || exercise.id.startsWith('seed_') || exercise.id.startsWith('custom_')) return '';
  return `/api/exercise-image?id=${exercise.id}`;
}

const BODY_PARTS_LIST = [
  { key: 'back', label: 'Costas' },
  { key: 'cardio', label: 'Cardio' },
  { key: 'chest', label: 'Peito' },
  { key: 'lower arms', label: 'Antebraços' },
  { key: 'lower legs', label: 'Panturrilhas' },
  { key: 'neck', label: 'Pescoço' },
  { key: 'shoulders', label: 'Ombros' },
  { key: 'stretching', label: 'Alongamentos' },
  { key: 'upper arms', label: 'Braços' },
  { key: 'upper legs', label: 'Coxas' },
  { key: 'waist', label: 'Abdômen' },
] as const;

const TARGET_PT: Record<string, string> = {
  abductors: 'Abdutores', abs: 'Abdômen', adductors: 'Adutores',
  biceps: 'Bíceps', calves: 'Panturrilhas', 'cardiovascular system': 'Sistema Cardiovascular',
  delts: 'Deltoides', forearms: 'Antebraços', glutes: 'Glúteos',
  hamstrings: 'Isquiotibiais', lats: 'Latíssimo', 'levator scapulae': 'Elevador da Escápula',
  pectorals: 'Peitoral', quads: 'Quadríceps', 'serratus anterior': 'Serrátil',
  spine: 'Coluna', traps: 'Trapézio', triceps: 'Tríceps', 'upper back': 'Parte Superior das Costas',
  quadriceps: 'Quadríceps', shoulders: 'Ombros', core: 'Core',
  'hip flexors': 'Flexores do Quadril', obliques: 'Oblíquos', rhomboids: 'Romboides',
  'lower back': 'Lombar', chest: 'Peito', neck: 'Pescoço',
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

const PHASES = [
  { key: 'warmup',   label: 'Aquecimento' },
  { key: 'mobility', label: 'Mobilidade' },
  { key: 'strength', label: 'Força' },
  { key: 'recovery', label: 'Recuperação' },
] as const;

type Phase = typeof PHASES[number]['key'];

function pt(map: Record<string, string>, key: string): string {
  return map[key?.toLowerCase()] ?? key;
}

interface SelectedExercise extends Exercise {
  phase: Phase;
  sets: number;
  reps: number;
  rest: string;
  weight: string;
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
  const [physioId, setPhysioId] = useState<string | null>(null);
  const [activeBodyPart, setActiveBodyPart] = useState<string>('chest');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const [browseExercises, setBrowseExercises] = useState<Exercise[]>([]);
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [pendingPhase, setPendingPhase] = useState<Phase>('strength');

  const [programName, setProgramName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Athlete selector modal
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [showAthleteModal, setShowAthleteModal] = useState(false);
  const [loadingAthletes, setLoadingAthletes] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<Program[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState(false);

  // Edit image
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState('');
  const [savingImage, setSavingImage] = useState(false);

  const handleSaveImage = async () => {
    if (!editingImageId) return;
    setSavingImage(true);
    await updateExerciseImage(editingImageId, editingImageUrl.trim());
    setSavingImage(false);
    // Update preview and browse list locally
    if (previewExercise?.id === editingImageId) {
      setPreviewExercise(prev => prev ? { ...prev, gifUrl: editingImageUrl.trim() } : prev);
    }
    setBrowseExercises(prev => prev.map(e => e.id === editingImageId ? { ...e, gifUrl: editingImageUrl.trim() } : e));
    setSelected(prev => prev.map(e => e.id === editingImageId ? { ...e, gifUrl: editingImageUrl.trim() } : e));
    setEditingImageId(null);
    setEditingImageUrl('');
  };

  // Custom exercise modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '', bodyPart: 'stretching', target: '', equipment: 'body weight', gifUrl: '',
    instructionsRaw: '',
  });
  const [savingCustom, setSavingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const localCache = useRef<Map<string, Exercise[]>>(new Map());
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (dir: 'left' | 'right') => {
    tabsRef.current?.scrollBy({ left: dir === 'right' ? 120 : -120, behavior: 'smooth' });
  };

  // Load physio session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setPhysioId(session.user.id);
    });
  }, []);

  // Load exercises for active body part
  useEffect(() => {
    if (debouncedQuery) return;
    const cached = localCache.current.get(activeBodyPart);
    if (cached) { setBrowseExercises(cached); return; }
    setLoading(true);
    getExercisesByBodyPart(activeBodyPart, (updated) => {
      localCache.current.set(activeBodyPart, updated);
      setBrowseExercises(updated);
    })
      .then((results) => { localCache.current.set(activeBodyPart, results); setBrowseExercises(results); })
      .finally(() => setLoading(false));
  }, [activeBodyPart, debouncedQuery]);

  // Preload other body parts in background
  useEffect(() => {
    ALL_BODY_PARTS.forEach((bp) => {
      if (bp === activeBodyPart) return;
      getExercisesByBodyPart(bp, (u) => localCache.current.set(bp, u))
        .then((r) => localCache.current.set(bp, r))
        .catch(() => {});
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Search
  useEffect(() => {
    if (!debouncedQuery) { setSearchResults([]); return; }
    setLoading(true);
    searchExercises(debouncedQuery).then(setSearchResults).finally(() => setLoading(false));
  }, [debouncedQuery]);

  const displayExercises = debouncedQuery ? searchResults : browseExercises;

  const addExercise = useCallback((exercise: Exercise) => {
    if (selected.find(s => s.id === exercise.id)) return;
    setSelected(prev => [...prev, { ...exercise, phase: pendingPhase, sets: 3, reps: 12, rest: '30s', weight: '' }]);
    setPreviewExercise(null);
  }, [selected, pendingPhase]);

  const removeExercise = (id: string) => setSelected(prev => prev.filter(e => e.id !== id));

  const updateField = (id: string, field: keyof SelectedExercise, value: string | number) => {
    setSelected(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const exerciseRows = () => selected.map((e, i) => ({
    exerciseId: e.id, phase: e.phase, sets: e.sets, reps: e.reps, rest: e.rest, weight: e.weight ?? '', sortOrder: i,
  }));

  const validate = (): string | null => {
    if (!programName.trim()) return 'Dê um nome ao programa.';
    if (selected.length === 0) return 'Adicione ao menos um exercício.';
    return null;
  };

  // Open athlete modal to assign program
  const handleSaveClick = async () => {
    const err = validate();
    if (err) { setSaveError(err); return; }
    setSaveError(null);
    setLoadingAthletes(true);
    setShowAthleteModal(true);
    if (physioId) {
      const list = await getPhysioAthletes(physioId);
      setAthletes(list);
    }
    setLoadingAthletes(false);
  };

  // Confirm assignment to athlete
  const handleAssign = async (athleteId: string) => {
    if (!physioId) return;
    setSaving(true);
    setShowAthleteModal(false);
    const result = await saveProgram(physioId, athleteId, programName.trim(), exerciseRows());
    setSaving(false);
    if ('error' in result) { setSaveError(result.error); return; }
    setSaveSuccess(true);
    setTimeout(() => navigate('physio-dashboard'), 1500);
  };

  // Save as reusable template
  const handleSaveTemplate = async () => {
    const err = validate();
    if (err) { setSaveError(err); return; }
    if (!physioId) return;
    setSavingTemplate(true);
    setSaveError(null);
    const result = await saveTemplate(physioId, programName.trim(), exerciseRows());
    setSavingTemplate(false);
    if ('error' in result) { setSaveError(result.error); return; }
    setTemplateSuccess(true);
    setTimeout(() => setTemplateSuccess(false), 2000);
  };

  // Load templates list
  const handleShowTemplates = async () => {
    setShowTemplates(true);
    setLoadingTemplates(true);
    if (physioId) setTemplates(await getPhysioTemplates(physioId));
    setLoadingTemplates(false);
  };

  const handleSaveCustomExercise = async () => {
    if (!physioId) return;
    if (!customForm.name.trim()) { setCustomError('Digite o nome do exercício.'); return; }
    if (!customForm.target.trim()) { setCustomError('Digite o músculo alvo.'); return; }
    const instructions = customForm.instructionsRaw
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    if (instructions.length === 0) { setCustomError('Adicione ao menos uma instrução.'); return; }

    setSavingCustom(true);
    setCustomError(null);
    const result = await createCustomExercise({
      name: customForm.name,
      bodyPart: customForm.bodyPart,
      target: customForm.target,
      equipment: customForm.equipment,
      instructions,
      gifUrl: customForm.gifUrl,
      physioId,
    });
    setSavingCustom(false);

    if ('error' in result) { setCustomError(result.error); return; }

    // Add to selected immediately and close modal
    const ex = result.exercise;
    setSelected(prev => [...prev, { ...ex, phase: pendingPhase, sets: 3, reps: 12, rest: '30s' }]);
    localCache.current.delete(ex.bodyPart);
    setShowCustomModal(false);
    setCustomForm({ name: '', bodyPart: 'stretching', target: '', equipment: 'body weight', gifUrl: '', instructionsRaw: '' });
  };

  // Load a template into the builder
  const handleLoadTemplate = (template: Program) => {
    setProgramName(template.name);
    setSelected(template.exercises.map(e => ({
      id: e.id, name: e.name, bodyPart: e.bodyPart, target: e.target,
      equipment: e.equipment, gifUrl: e.gifUrl, secondaryMuscles: e.secondaryMuscles,
      instructions: e.instructions, phase: e.phase, sets: e.sets, reps: e.reps, rest: e.rest, weight: e.weight ?? '',
    })));
    setShowTemplates(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto w-full gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('physio-dashboard')}><ArrowLeft size={24} className="text-slate-400 cursor-pointer shrink-0" /></button>
            <input
              type="text"
              value={programName}
              onChange={e => setProgramName(e.target.value)}
              placeholder="Nome do programa..."
              className="bg-transparent text-base font-bold outline-none placeholder-slate-600 min-w-0 w-36"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Save as template */}
            <button
              onClick={handleSaveTemplate}
              disabled={savingTemplate || templateSuccess}
              title="Salvar como modelo"
              className="h-9 px-3 rounded-full border border-slate-700 text-slate-400 hover:border-[#ccff00] hover:text-[#ccff00] transition-all text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              {savingTemplate ? <Loader2 size={13} className="animate-spin" /> : templateSuccess ? <CheckCircle2 size={13} /> : <BookTemplate size={13} />}
              <span className="hidden sm:inline">{templateSuccess ? 'Salvo!' : 'Modelo'}</span>
            </button>
            {/* Assign to athlete */}
            <button
              onClick={handleSaveClick}
              disabled={saving || saveSuccess}
              className="h-9 px-4 bg-[#ccff00] text-slate-950 rounded-full text-xs font-black flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={13} /> : <Users size={13} />}
              {saveSuccess ? 'Atribuído!' : 'Atribuir'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-24">
        {saveError && (
          <div className="mx-4 mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{saveError}</p>
            <button onClick={() => setSaveError(null)} className="ml-auto text-red-400"><X size={14} /></button>
          </div>
        )}

        {/* Load template banner */}
        <div className="px-4 pt-4">
          <button
            onClick={handleShowTemplates}
            className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-[#ccff00]/40 rounded-xl px-4 py-3 text-left transition-colors group"
          >
            <BookTemplate size={18} className="text-slate-500 group-hover:text-[#ccff00] transition-colors shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Carregar Modelo</p>
              <p className="text-[10px] text-slate-600">Use um programa salvo anteriormente como base</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-600 group-hover:text-[#ccff00]" />
          </button>
        </div>

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

        {/* Body part tabs */}
        {!debouncedQuery && (
          <div className="pb-2 relative">
            <button onClick={() => scrollTabs('left')} className="absolute left-0 top-0 bottom-0 z-10 px-1 flex items-center bg-gradient-to-r from-background-dark to-transparent text-slate-500 hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div ref={tabsRef} className="flex overflow-x-auto px-8 gap-6 hide-scrollbar">
              {ALL_BODY_PARTS.map(bp => (
                <button
                  key={bp}
                  onClick={() => setActiveBodyPart(bp)}
                  className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 whitespace-nowrap transition-colors ${
                    activeBodyPart === bp
                      ? 'border-[#ccff00] text-[#ccff00]'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <p className="text-sm font-bold uppercase tracking-wider">{pt(BODY_PART_PT, bp)}</p>
                </button>
              ))}
            </div>
            <button onClick={() => scrollTabs('right')} className="absolute right-0 top-0 bottom-0 z-10 px-1 flex items-center bg-gradient-to-l from-background-dark to-transparent text-slate-500 hover:text-white transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Exercise browser */}
        {displayExercises.length > 0 && (
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {debouncedQuery ? `Resultados para "${debouncedQuery}"` : pt(BODY_PART_PT, activeBodyPart)}
              </h3>
              <button
                onClick={() => { setCustomForm(f => ({ ...f, bodyPart: activeBodyPart })); setShowCustomModal(true); }}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#ccff00] transition-colors"
              >
                <PlusCircle size={13} />
                Criar
              </button>
            </div>

            {/* Phase chips — select once, tap to add */}
            <div className="flex gap-2 flex-wrap mb-4">
              <span className="text-[10px] text-slate-500 uppercase font-bold self-center">Fase:</span>
              {PHASES.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPendingPhase(p.key)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                    pendingPhase === p.key
                      ? 'bg-[#ccff00] text-slate-950 border-[#ccff00]'
                      : 'border-slate-700 text-slate-500 hover:border-slate-400 hover:text-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {displayExercises.map(exercise => {
                const isAdded = !!selected.find(s => s.id === exercise.id);
                return (
                  <div key={exercise.id} className="relative">
                    {/* Main tap — add or remove */}
                    <button
                      onClick={() => isAdded ? removeExercise(exercise.id) : addExercise(exercise)}
                      className={`w-full bg-slate-900 border rounded-xl overflow-hidden text-left transition-all ${
                        isAdded ? 'border-[#ccff00]/60' : 'border-slate-800 hover:border-[#ccff00]/40'
                      }`}
                    >
                      <div className="relative w-full aspect-square bg-slate-800 flex items-center justify-center">
                        {exerciseImgSrc(exercise) ? (
                          <img src={exerciseImgSrc(exercise)} alt={exercise.name} className={`w-full h-full object-cover ${isAdded ? 'opacity-70' : ''}`} />
                        ) : (
                          <Dumbbell size={40} className={`text-slate-600 ${isAdded ? 'opacity-50' : ''}`} />
                        )}
                        {isAdded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#ccff00]/10">
                            <CheckCircle2 size={36} className="text-[#ccff00] drop-shadow" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 pr-7">
                        <p className="text-xs font-bold text-slate-100 capitalize truncate">{exercise.name}</p>
                        <p className="text-[10px] text-[#ccff00] uppercase tracking-tight truncate">{pt(TARGET_PT, exercise.target)}</p>
                      </div>
                    </button>
                    {/* Info button — opens read-only modal */}
                    <button
                      onClick={() => setPreviewExercise(exercise)}
                      className="absolute bottom-2 right-2 text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      <Info size={15} />
                    </button>
                  </div>
                );
              })}
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
                  <button onClick={() => removeExercise(exercise.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                  <div className="ml-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative cursor-pointer bg-slate-800 flex items-center justify-center" onClick={() => setPreviewExercise(exercise)}>
                        {exerciseImgSrc(exercise) ? (
                          <img src={exerciseImgSrc(exercise)} alt={exercise.name} className="w-full h-full object-cover" />
                        ) : (
                          <Dumbbell size={28} className="text-slate-600" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20"><PlayCircle size={24} className="text-white" /></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-100 capitalize">{exercise.name}</h4>
                        <p className="text-xs text-[#ccff00] font-medium mb-3 uppercase tracking-tighter">{pt(TARGET_PT, exercise.target)} · {pt(EQUIPMENT_PT, exercise.equipment)}</p>
                        <div className="flex gap-1.5 flex-wrap mb-3">
                          {PHASES.map(p => (
                            <button key={p.key} onClick={() => updateField(exercise.id, 'phase', p.key)}
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                                exercise.phase === p.key ? 'bg-[#ccff00] text-slate-950 border-[#ccff00]' : 'border-slate-700 text-slate-500 hover:border-slate-500'
                              }`}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Séries</span>
                            <input type="number" value={exercise.sets} onChange={e => updateField(exercise.id, 'sets', Number(e.target.value))} className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Reps</span>
                            <input type="number" value={exercise.reps} onChange={e => updateField(exercise.id, 'reps', Number(e.target.value))} className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Descanso</span>
                            <input type="text" value={exercise.rest} onChange={e => updateField(exercise.id, 'rest', e.target.value)} className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Peso</span>
                            <input type="text" value={exercise.weight} onChange={e => updateField(exercise.id, 'weight', e.target.value)} placeholder="ex: 20kg" className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white placeholder-slate-600" />
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
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full py-8 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-[#ccff00] hover:text-[#ccff00] transition-all group"
          >
            <PlusCircle size={32} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold uppercase">Adicionar Exercício</span>
          </button>
        </div>
      </main>

      {/* Exercise preview modal */}
      {previewExercise && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={() => setPreviewExercise(null)}>
          <div className="bg-slate-900 rounded-t-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative bg-slate-800 flex items-center justify-center rounded-t-3xl aspect-square">
              {exerciseImgSrc(previewExercise) ? (
                <img src={exerciseImgSrc(previewExercise)} alt={previewExercise.name} className="w-full aspect-square object-cover rounded-t-3xl" />
              ) : (
                <Dumbbell size={72} className="text-slate-600" />
              )}
              <button onClick={() => setPreviewExercise(null)} className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white"><X size={20} /></button>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold capitalize mb-1">{previewExercise.name}</h3>
              <p className="text-[#ccff00] text-sm uppercase tracking-wider mb-3">{pt(TARGET_PT, previewExercise.target)} · {pt(EQUIPMENT_PT, previewExercise.equipment)}</p>
              {previewExercise.secondaryMuscles.length > 0 && (
                <p className="text-xs text-slate-400 mb-4">Músculos secundários: {previewExercise.secondaryMuscles.map(m => pt(TARGET_PT, m)).join(', ')}</p>
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
              {/* Edit image section */}
              {editingImageId === previewExercise.id ? (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">URL da imagem</p>
                  <input
                    type="url"
                    value={editingImageUrl}
                    onChange={e => setEditingImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagem.gif"
                    className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#ccff00]/50"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveImage}
                      disabled={savingImage}
                      className="flex-1 py-3 bg-[#ccff00] text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {savingImage ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Salvar
                    </button>
                    <button
                      onClick={() => { setEditingImageId(null); setEditingImageUrl(''); }}
                      className="px-4 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingImageId(previewExercise.id); setEditingImageUrl(previewExercise.gifUrl ?? ''); }}
                  className="w-full mb-3 py-3 border border-slate-700 text-slate-400 hover:border-[#ccff00]/50 hover:text-[#ccff00] font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ImagePlus size={15} />
                  {exerciseImgSrc(previewExercise) ? 'Trocar imagem' : 'Adicionar imagem'}
                </button>
              )}

              <button
                onClick={() => setPreviewExercise(null)}
                className="w-full py-4 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Athlete selector modal */}
      {showAthleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowAthleteModal(false)}>
          <div className="bg-slate-900 rounded-t-3xl w-full max-w-2xl max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Atribuir a qual atleta?</h3>
              <button onClick={() => setShowAthleteModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4">
              {loadingAthletes ? (
                <div className="flex justify-center py-10"><Loader2 size={28} className="animate-spin text-[#ccff00]" /></div>
              ) : athletes.length === 0 ? (
                <p className="text-center text-slate-500 py-10 text-sm">Nenhum atleta vinculado à sua conta.</p>
              ) : (
                <div className="space-y-2">
                  {athletes.map(a => (
                    <button
                      key={a.id}
                      onClick={() => handleAssign(a.id)}
                      className="w-full flex items-center gap-4 bg-slate-800 hover:bg-slate-700 rounded-xl p-4 transition-colors text-left"
                    >
                      <img
                        src={a.avatarUrl ?? 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                        alt={a.fullName}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <span className="font-bold text-slate-100">{a.fullName}</span>
                      <ChevronRight size={18} className="ml-auto text-slate-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowTemplates(false)}>
          <div className="bg-slate-900 rounded-t-3xl w-full max-w-2xl max-h-[75vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Carregar Modelo</h3>
              <button onClick={() => setShowTemplates(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4">
              {loadingTemplates ? (
                <div className="flex justify-center py-10"><Loader2 size={28} className="animate-spin text-[#ccff00]" /></div>
              ) : templates.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm">Nenhum modelo salvo ainda.</p>
                  <p className="text-slate-600 text-xs mt-1">Monte um programa e clique em "Modelo" para salvar.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleLoadTemplate(t)}
                      className="w-full flex items-center gap-4 bg-slate-800 hover:bg-slate-700 rounded-xl p-4 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center shrink-0">
                        <BookTemplate size={18} className="text-[#ccff00]" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-100">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.exercises.length} exercício{t.exercises.length !== 1 ? 's' : ''}</p>
                      </div>
                      <ChevronRight size={18} className="ml-auto text-slate-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom exercise modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowCustomModal(false)}>
          <div className="bg-slate-900 rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Criar Exercício Personalizado</h3>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {customError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <AlertCircle size={15} className="text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{customError}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nome do exercício *</label>
                <input
                  type="text"
                  value={customForm.name}
                  onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Alongamento do Quadríceps em Pé"
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#ccff00]/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Grupo muscular</label>
                <select
                  value={customForm.bodyPart}
                  onChange={e => setCustomForm(f => ({ ...f, bodyPart: e.target.value }))}
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-[#ccff00]/50"
                >
                  {BODY_PARTS_LIST.map(bp => (
                    <option key={bp.key} value={bp.key}>{bp.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Músculo alvo *</label>
                <input
                  type="text"
                  value={customForm.target}
                  onChange={e => setCustomForm(f => ({ ...f, target: e.target.value }))}
                  placeholder="Ex: quadriceps, isquiotibiais, glúteos..."
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#ccff00]/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Equipamento</label>
                <select
                  value={customForm.equipment}
                  onChange={e => setCustomForm(f => ({ ...f, equipment: e.target.value }))}
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-[#ccff00]/50"
                >
                  <option value="body weight">Peso Corporal</option>
                  <option value="band">Elástico</option>
                  <option value="barbell">Barra</option>
                  <option value="dumbbell">Haltere</option>
                  <option value="kettlebell">Kettlebell</option>
                  <option value="cable">Cabo/Polia</option>
                  <option value="none">Sem equipamento</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Instruções * <span className="text-slate-600 normal-case font-normal">(uma por linha)</span>
                </label>
                <textarea
                  value={customForm.instructionsRaw}
                  onChange={e => setCustomForm(f => ({ ...f, instructionsRaw: e.target.value }))}
                  placeholder={`Fique em pé com os pés juntos.\nDobre o joelho direito levando o calcanhar ao glúteo.\nMantenha por 20 a 30 segundos.`}
                  rows={5}
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none focus:ring-2 focus:ring-[#ccff00]/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  URL da imagem <span className="text-slate-600 normal-case font-normal">(opcional)</span>
                </label>
                <input
                  type="url"
                  value={customForm.gifUrl}
                  onChange={e => setCustomForm(f => ({ ...f, gifUrl: e.target.value }))}
                  placeholder="https://exemplo.com/imagem.gif"
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#ccff00]/50"
                />
              </div>

              <button
                onClick={handleSaveCustomExercise}
                disabled={savingCustom}
                className="w-full py-4 bg-[#ccff00] text-slate-950 font-black rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingCustom ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {savingCustom ? 'Salvando...' : 'Salvar e Adicionar ao Programa'}
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
          <button onClick={() => navigate('athletes-list')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors">
            <Users size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Atletas</span>
          </button>
          <button onClick={() => navigate('physio-dashboard')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors">
            <LineChart size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
          </button>
          <button onClick={() => navigate('physio-dashboard')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors">
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
