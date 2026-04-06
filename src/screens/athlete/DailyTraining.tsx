import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, PlayCircle, Lock, Home, Dumbbell, LineChart, User, Loader2, AlertCircle } from 'lucide-react';
import { getExercisesByCategory, Exercise } from '../../services/exerciseService';

const CATEGORIES = [
  { key: 'warmup',   label: 'Aquecimento' },
  { key: 'mobility', label: 'Mobilidade' },
  { key: 'strength', label: 'Força' },
  { key: 'recovery', label: 'Recuperação' },
];

export default function DailyTraining({ navigate }: { navigate: (screen: string) => void }) {
  const [activeCategory, setActiveCategory] = useState('warmup');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setExercises([]);

    getExercisesByCategory(activeCategory)
      .then((results) => {
        if (!cancelled) setExercises(results);
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar os exercícios. Verifique sua conexão.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeCategory]);

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
            <h1 className="text-xl font-bold tracking-tight">Plano de Treino Diário</h1>
          </button>
          <button className="bg-slate-800 p-2 rounded-full text-slate-300">
            <Calendar size={20} />
          </button>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar px-4 gap-6 pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex flex-col items-center justify-center border-b-2 ${
                activeCategory === cat.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500'
              } pb-3 pt-2 whitespace-nowrap transition-colors`}
            >
              <p className="text-sm font-bold uppercase tracking-wider">{cat.label}</p>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {CATEGORIES.find((c) => c.key === activeCategory)?.label}
          </h2>
          {exercises.length > 0 && (
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
              {completed.size}/{exercises.length} Concluído
            </span>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm font-medium">Carregando exercícios...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm font-medium text-center">{error}</p>
            <button
              onClick={() => setActiveCategory(activeCategory)}
              className="text-xs font-bold text-primary border border-primary/30 px-4 py-2 rounded-lg"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Lock size={32} />
            <p className="text-sm font-medium">Nenhum exercício encontrado nesta categoria.</p>
          </div>
        )}

        {!loading && !error && exercises.length > 0 && (
          <div className="space-y-4">
            {exercises.map((ex: Exercise) => {
              const done = completed.has(ex.id);
              return (
                <div
                  key={ex.id}
                  className={`bg-slate-900 border rounded-xl p-4 flex gap-4 items-center transition-opacity ${
                    done ? 'opacity-60 border-slate-700' : 'border-slate-800'
                  }`}
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-slate-800">
                    {ex.gifUrl ? (
                      <img
                        src={ex.gifUrl}
                        alt={ex.name}
                        className={`w-full h-full object-cover ${done ? 'grayscale' : ''}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Dumbbell size={28} />
                      </div>
                    )}
                    {!done && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <PlayCircle size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-bold leading-tight ${done ? 'line-through text-slate-500' : ''}`}>
                      {ex.name}
                    </p>
                    <p className="text-slate-400 text-xs mt-1 capitalize">{ex.target} · {ex.equipment}</p>
                  </div>
                  <button
                    onClick={() => toggleCompleted(ex.id)}
                    className={`flex-shrink-0 flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-8 px-4 text-xs font-bold transition-all ${
                      done
                        ? 'bg-slate-700 text-slate-400'
                        : 'bg-primary text-white shadow-lg shadow-primary/20'
                    }`}
                  >
                    {done ? 'Desfazer' : 'Concluir'}
                  </button>
                </div>
              );
            })}
          </div>
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
