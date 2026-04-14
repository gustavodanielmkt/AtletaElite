import React, { useState, useEffect } from 'react';
import { X, Frown, Meh, Smile, Laugh, Activity, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { saveCheckIn, getTodayCheckIn, calculateReadinessScore, type CheckInData } from '../../services/clubService';

const MUSCLE_AREAS = [
  'Posteriores', 'Lombar', 'Quadríceps', 'Panturrilhas', 'Ombros',
  'Peitoral', 'Costas', 'Bíceps', 'Tríceps', 'Glúteos', 'Abdômen',
];

const FATIGUE_OPTIONS: { key: CheckInData['fatigue']; label: string; desc: string }[] = [
  { key: 'low',      label: 'Baixa',    desc: 'Pronto para o treino' },
  { key: 'moderate', label: 'Moderada', desc: 'Carga normal' },
  { key: 'high',     label: 'Alta',     desc: 'Precisa de recuperação' },
  { key: 'extreme',  label: 'Extrema',  desc: 'Sobrecarga' },
];

const SLEEP_OPTIONS: { key: CheckInData['sleepQuality']; icon: React.ReactNode; label: string }[] = [
  { key: 'bad',   icon: <Frown  size={24} />, label: 'Ruim'     },
  { key: 'fair',  icon: <Meh    size={24} />, label: 'Razoável' },
  { key: 'good',  icon: <Smile  size={24} />, label: 'Boa'      },
  { key: 'great', icon: <Laugh  size={24} />, label: 'Ótima'    },
];

export default function DailyCheckIn({ navigate }: { navigate: (screen: string) => void }) {
  const [painLevel, setPainLevel]         = useState(0);
  const [fatigue, setFatigue]             = useState<CheckInData['fatigue']>('low');
  const [sleepQuality, setSleepQuality]   = useState<CheckInData['sleepQuality']>('good');
  const [mentalReadiness, setMentalReadiness] = useState(70);
  const [soreness, setSoreness]           = useState<Set<string>>(new Set());
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [alreadyDone, setAlreadyDone]     = useState(false);
  const [score, setScore]                 = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const ci = await getTodayCheckIn(session.user.id);
      if (ci) {
        setPainLevel(ci.painLevel);
        setFatigue(ci.fatigue);
        setSleepQuality(ci.sleepQuality);
        setMentalReadiness(ci.mentalReadiness);
        setSoreness(new Set(ci.muscleSorenessAreas));
        setScore(ci.readinessScore);
        setAlreadyDone(true);
      }
    });
  }, []);

  const toggleArea = (area: string) => {
    setSoreness(prev => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area); else next.add(area);
      return next;
    });
  };

  const previewScore = calculateReadinessScore({
    painLevel, fatigue, sleepQuality,
    mentalReadiness, muscleSorenessAreas: [...soreness],
  });

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setSaving(false); return; }

    const data: CheckInData = {
      painLevel,
      fatigue,
      sleepQuality,
      mentalReadiness,
      muscleSorenessAreas: [...soreness],
    };

    const { error } = await saveCheckIn(session.user.id, data);
    setSaving(false);
    if (!error) {
      setScore(previewScore);
      setSaved(true);
      setAlreadyDone(true);
      setTimeout(() => navigate('athlete-dashboard'), 1800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-slate-100 pb-36">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-dark border-b border-slate-800">
        <button onClick={() => navigate('athlete-dashboard')} className="flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Check-in Diário</h2>
        <div className="size-10" />
      </header>

      {saved ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-6 p-8">
          <CheckCircle2 size={72} className="text-[#ccff00]" />
          <div className="text-center">
            <p className="text-3xl font-black text-[#ccff00]">{score}</p>
            <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest">Pontuação de Prontidão</p>
          </div>
          <p className="text-slate-400 text-sm">Redirecionando...</p>
        </div>
      ) : (
        <main className="flex-1 px-4 py-6 space-y-8">

          {/* Pain Level */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold">Nível de Dor</h3>
              <span className="text-2xl font-bold text-[#ccff00]">{painLevel}/10</span>
            </div>
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/20 text-red-500 rounded-full">
                  <Frown size={24} />
                </div>
                <p className="text-slate-400 text-sm font-medium">Quanta dor física você está sentindo?</p>
              </div>
              <input
                type="range" min="0" max="10" value={painLevel}
                onChange={e => setPainLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ccff00]"
              />
              <div className="flex justify-between mt-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nenhuma</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Moderada</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Intensa</span>
              </div>
            </div>
          </section>

          {/* Fatigue */}
          <section>
            <h3 className="text-lg font-bold mb-4">Nível de Fadiga</h3>
            <div className="grid grid-cols-2 gap-3">
              {FATIGUE_OPTIONS.map(item => {
                const active = fatigue === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setFatigue(item.key)}
                    className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all text-left ${
                      active ? 'bg-primary/20 border-primary' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-bold ${active ? 'text-primary' : 'text-slate-300'}`}>{item.label}</span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-primary' : 'border-slate-600'}`}>
                        {active && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sleep Quality */}
          <section>
            <h3 className="text-lg font-bold mb-4">Qualidade do Sono</h3>
            <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex justify-between">
              {SLEEP_OPTIONS.map(item => {
                const active = sleepQuality === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setSleepQuality(item.key)}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/30'
                        : 'text-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Muscle Soreness */}
          <section>
            <h3 className="text-lg font-bold mb-4">Dor Muscular</h3>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_AREAS.map(area => {
                const active = soreness.has(area);
                return (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Mental Readiness */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold">Prontidão Mental</h3>
              <span className="text-2xl font-bold text-primary">{mentalReadiness}%</span>
            </div>
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <input
                type="range" min="0" max="100" value={mentalReadiness}
                onChange={e => setMentalReadiness(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Desfocado</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estado de Flow</span>
              </div>
            </div>
          </section>

          {/* Preview score */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-400">Pontuação prevista</p>
            <span className={`text-3xl font-black ${previewScore >= 80 ? 'text-[#ccff00]' : previewScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
              {previewScore}
            </span>
          </div>

        </main>
      )}

      {!saved && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-dark/90 backdrop-blur-md border-t border-slate-800 z-20">
          {alreadyDone && (
            <p className="text-center text-xs text-slate-500 mb-2">Você já fez o check-in hoje. Salvar vai atualizar.</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl h-14 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Activity size={20} />}
            <span>{saving ? 'SALVANDO...' : 'GERAR PONTUAÇÃO DE PRONTIDÃO'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
