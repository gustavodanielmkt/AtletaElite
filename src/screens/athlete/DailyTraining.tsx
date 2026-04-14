import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, PlayCircle, Home, Dumbbell, LineChart, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getActiveProgram, isVideoUrl, type Program, type ProgramExercise } from '../../services/exerciseService';
import { supabase } from '../../lib/supabase';

const PHASES = [
  { key: 'warmup',   label: 'Aquecimento' },
  { key: 'mobility', label: 'Mobilidade' },
  { key: 'strength', label: 'Força' },
  { key: 'recovery', label: 'Recuperação' },
] as const;

type Phase = typeof PHASES[number]['key'];

function exerciseMediaSrc(ex: ProgramExercise): string {
  if (ex.gifUrl?.startsWith('http')) return ex.gifUrl;
  if (ex.gifUrl?.startsWith('/api/')) return ex.gifUrl;
  if (ex.id.startsWith('wger_') || ex.id.startsWith('seed_') || ex.id.startsWith('custom_')) return '';
  return `/api/exercise-image?id=${ex.id}`;
}

const SESSION_PHASE_KEY = 'dt_activePhase';
const SESSION_COMPLETED_KEY = 'dt_completed';
const SESSION_PROGRAM_KEY = 'dt_programId';

export default function DailyTraining({ navigate }: { navigate: (screen: string) => void }) {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePhase, setActivePhase] = useState<Phase>(() => {
    return (sessionStorage.getItem(SESSION_PHASE_KEY) as Phase) || 'warmup';
  });

  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_COMPLETED_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  // Persist activePhase
  useEffect(() => {
    sessionStorage.setItem(SESSION_PHASE_KEY, activePhase);
  }, [activePhase]);

  // Persist completed set
  useEffect(() => {
    sessionStorage.setItem(SESSION_COMPLETED_KEY, JSON.stringify([...completed]));
  }, [completed]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { setLoading(false); return; }
      getActiveProgram(session.user.id)
        .then((p) => {
          setProgram(p);
          if (p) {
            const savedProgramId = sessionStorage.getItem(SESSION_PROGRAM_KEY);
            // If it's a different program, reset phase and completed
            if (savedProgramId !== p.id) {
              sessionStorage.setItem(SESSION_PROGRAM_KEY, p.id);
              sessionStorage.removeItem(SESSION_COMPLETED_KEY);
              setCompleted(new Set());
              const firstPhase = PHASES.find(ph => p.exercises.some((e: ProgramExercise) => e.phase === ph.key));
              if (firstPhase) {
                setActivePhase(firstPhase.key);
                sessionStorage.setItem(SESSION_PHASE_KEY, firstPhase.key);
              }
            } else {
              // Same program — restore saved phase if it has exercises
              const savedPhase = sessionStorage.getItem(SESSION_PHASE_KEY) as Phase;
              const phaseHasExercises = p.exercises.some((e: ProgramExercise) => e.phase === savedPhase);
              if (!phaseHasExercises) {
                const firstPhase = PHASES.find(ph => p.exercises.some((e: ProgramExercise) => e.phase === ph.key));
                if (firstPhase) setActivePhase(firstPhase.key);
              }
            }
          }
        })
        .catch(() => setError('Não foi possível carregar o programa de treino.'))
        .finally(() => setLoading(false));
    });
  }, []);

  const availablePhases = PHASES.filter(ph =>
    program?.exercises.some((e: ProgramExercise) => e.phase === ph.key)
  );

  const activeExercises: ProgramExercise[] = (program?.exercises ?? []).filter(
    (e: ProgramExercise) => e.phase === activePhase
  );

  const toggleCompleted = (id: string) => {
    setCompleted((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => navigate('athlete-dashboard')} className="flex items-center gap-3">
            <ArrowLeft size={24} className="text-slate-400 cursor-pointer" />
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-tight">Plano de Treino</h1>
              {program && <p className="text-[10px] text-primary uppercase tracking-widest font-bold">{program.name}</p>}
            </div>
          </button>
          <button className="bg-slate-800 p-2 rounded-full text-slate-300">
            <Calendar size={20} />
          </button>
        </div>

        {/* Phase tabs — only phases with exercises */}
        {availablePhases.length > 0 && (
          <div className="flex overflow-x-auto hide-scrollbar px-4 gap-6 pb-2">
            {availablePhases.map((ph) => {
              const phExercises = program!.exercises.filter((e: ProgramExercise) => e.phase === ph.key);
              const doneCount = phExercises.filter((e: ProgramExercise) => completed.has(e.programExerciseId)).length;
              return (
                <button
                  key={ph.key}
                  onClick={() => setActivePhase(ph.key)}
                  className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 whitespace-nowrap transition-colors ${
                    activePhase === ph.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  <p className="text-sm font-bold uppercase tracking-wider">{ph.label}</p>
                  <p className="text-[10px] font-medium mt-0.5 opacity-70">{doneCount}/{phExercises.length}</p>
                </button>
              );
            })}
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm font-medium">Carregando programa...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm font-medium text-center text-slate-400">{error}</p>
          </div>
        )}

        {/* No program yet */}
        {!loading && !error && !program && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <Dumbbell size={40} className="text-slate-700" />
            <div className="text-center">
              <p className="text-base font-bold text-slate-300">Nenhum programa atribuído</p>
              <p className="text-sm mt-1">Aguarde seu fisioterapeuta criar seu plano de treino.</p>
            </div>
          </div>
        )}

        {/* Exercise list */}
        {!loading && !error && activeExercises.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {PHASES.find(p => p.key === activePhase)?.label}
              </h2>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                {activeExercises.filter(e => completed.has(e.programExerciseId)).length}/{activeExercises.length} Concluído
              </span>
            </div>

            <div className="space-y-4">
              {activeExercises.map((ex: ProgramExercise) => {
                const done = completed.has(ex.programExerciseId);
                return (
                  <div
                    key={ex.programExerciseId}
                    className={`bg-slate-900 border rounded-xl p-4 flex gap-4 items-center transition-opacity ${
                      done ? 'opacity-60 border-slate-700' : 'border-slate-800'
                    }`}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-slate-800 flex items-center justify-center">
                      {exerciseMediaSrc(ex) ? (
                        isVideoUrl(exerciseMediaSrc(ex)) ? (
                          <video
                            src={exerciseMediaSrc(ex)}
                            autoPlay loop muted playsInline
                            className={`w-full h-full object-cover ${done ? 'grayscale' : ''}`}
                          />
                        ) : (
                          <img
                            src={exerciseMediaSrc(ex)}
                            alt={ex.name}
                            className={`w-full h-full object-cover ${done ? 'grayscale' : ''}`}
                          />
                        )
                      ) : (
                        <Dumbbell size={28} className="text-slate-700" />
                      )}
                      {!done && exerciseMediaSrc(ex) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <PlayCircle size={24} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-bold leading-tight ${done ? 'line-through text-slate-500' : ''}`}>
                        {ex.name}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5 capitalize">{ex.target} · {ex.equipment}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{ex.sets} séries</span>
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{ex.reps} reps</span>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{ex.rest}</span>
                        {ex.weight && <span className="text-[11px] font-bold text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded-full">{ex.weight}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleCompleted(ex.programExerciseId)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border transition-all ${
                        done
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'border-slate-700 text-slate-600 hover:border-primary hover:text-primary'
                      }`}
                    >
                      <CheckCircle2 size={22} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex bg-slate-900 border-t border-slate-800 px-2 pb-6 pt-2">
        <button onClick={() => navigate('athlete-dashboard')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><Home size={24} /></div>
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button className="flex flex-1 flex-col items-center justify-center gap-1 text-primary">
          <div className="flex h-8 items-center justify-center"><Dumbbell size={24} /></div>
          <span className="text-[10px] font-bold">Treino</span>
        </button>
        <button onClick={() => navigate('performance-analytics')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><LineChart size={24} /></div>
          <span className="text-[10px] font-medium">Progresso</span>
        </button>
        <button onClick={() => navigate('athlete-profile')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><User size={24} /></div>
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
