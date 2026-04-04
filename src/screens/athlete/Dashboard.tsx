import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, MapPin, ChevronRight, Home, Dumbbell, LineChart, MessageSquare, User, Lock, X, Link2, Loader2, CheckCircle2 } from 'lucide-react';

const APP_VERSION = '1.1.5';
import { supabase } from '../../lib/supabase';


export default function AthleteDashboard({ navigate }: { navigate: (screen: string) => void }) {
  const [isLimited, setIsLimited] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);

  const handleLink = async () => {
    if (!inviteCode.trim()) return;
    setLinkLoading(true);
    setLinkError(null);

    const { data: physio, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .eq('role', 'physio')
      .single();

    if (error || !physio) {
      setLinkError('Código inválido. Verifique com seu fisioterapeuta.');
      setLinkLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setLinkError('Sessão expirada. Faça login novamente.');
      setLinkLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ physio_id: physio.id })
      .eq('id', session.user.id);

    if (updateError) {
      setLinkError('Erro ao vincular. Tente novamente.');
      setLinkLoading(false);
      return;
    }

    setLinkSuccess(true);
    setLinkLoading(false);
    setTimeout(() => {
      setIsLimited(false);
      setShowLinkModal(false);
      setLinkSuccess(false);
      setInviteCode('');
    }, 2000);
  };

  const today = new Date();
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const formattedDate = `${weekdays[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url, physio_id')
          .eq('id', session.user.id)
          .single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        setIsLimited(!data?.physio_id);
      }
    };
    getProfile();
  }, []);
  return (
    <div className="min-h-screen flex flex-col pb-24 bg-background-dark">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 border-b border-slate-800 bg-background-dark/80 backdrop-blur-md">
        <button onClick={() => navigate('athlete-profile')} className="flex size-10 shrink-0 items-center overflow-hidden rounded-full border-2 border-primary shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform cursor-pointer">
          <img className="w-full h-full object-cover" src={avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Profile" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-extrabold leading-tight tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic uppercase pr-1">Atleta Elite</h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] opacity-80">{formattedDate}</p>
        </div>
        <div className="flex w-10 items-center justify-end">
          <button className="relative flex items-center justify-center rounded-xl h-10 w-10 bg-slate-800/50 border border-slate-700 text-slate-300" onClick={() => navigate('daily-checkin')}>
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          </button>
        </div>
      </header>

      {isLimited && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 flex items-center justify-between sticky top-[73px] z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-amber-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Modo Limitado Ativo</p>
          </div>
          <button onClick={() => setShowLinkModal(true)} className="text-[9px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors">Vincular</button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <section className="p-8 flex flex-col items-center relative overflow-hidden">
          {/* Animated Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex items-center justify-center w-64 h-64"
          >
            {/* The Tree of Life 3D Model Image */}
            <motion.div
              animate={{
                y: [0, -5, 0],
                filter: ["brightness(1) contrast(1)", "brightness(1.2) contrast(1.1)", "brightness(1) contrast(1)"]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-full h-full flex items-center justify-center rounded-full overflow-hidden"
              style={{
                maskImage: 'radial-gradient(circle at center, black 35%, transparent 55%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 35%, transparent 55%)'
              }}
            >
              <img
                src="/arvore_da_vida_3d_1773794222441.png"
                alt="Árvore da Vida"
                className="w-[85%] h-[85%] object-contain mix-blend-screen opacity-90 drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                style={{ filter: "contrast(1.4) brightness(0.9)" }}
              />
            </motion.div>

            {/* Radial Dashboard UI around the tree */}
            <div className="absolute inset-0 border-[6px] border-slate-800/50 rounded-full"></div>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="124"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="780"
                strokeDashoffset={780 * (1 - 0.85)}
                className="text-primary/60 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute -bottom-4 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-primary/30 flex flex-col items-center shadow-lg">
              <span className="text-2xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">85%</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest -mt-1">Vitalidade</span>
            </div>
          </motion.div>

          <div className="mt-10 text-center px-8">
            <p className="text-slate-300 text-sm font-medium leading-relaxed">Sua árvore está <span className="text-primary font-bold">Resiliente</span> hoje. Otimizado para potência máxima.</p>
          </div>
        </section>

        <section className="px-4 py-2">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Próxima Missão</h2>
            <button className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Expandir</button>
          </div>
          <div className="px-1">
            <div className="flex flex-col items-stretch justify-start rounded-2xl shadow-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800 overflow-hidden group hover:border-primary/50 transition-all duration-500">
              <div className="w-full h-44 bg-center bg-no-repeat bg-cover relative grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80")' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4 bg-primary text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">Elite Level</div>
              </div>
              <div className="flex w-full flex-col items-stretch justify-center gap-1 p-5 relative">
                <p className="text-xl font-black leading-tight tracking-tight italic uppercase">Sessão de Velocidade</p>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock size={16} />
                    <p className="text-xs font-bold leading-normal">60 min</p>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                  <p className="text-slate-400 text-xs font-semibold">Foco: Explosão Muscular</p>
                </div>

                <div className="mt-6">
                  <button
                    disabled={isLimited}
                    onClick={() => navigate('daily-training')}
                    className="w-full flex cursor-pointer items-center justify-center rounded-xl h-12 bg-primary text-slate-950 text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLimited ? (
                      <span className="flex items-center gap-2"><Lock size={16} /> Requer Vínculo Clínico</span>
                    ) : (
                      <span>Iniciar Treino</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-6">
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold">Visão Geral da Carga Semanal</h3>
                <p className="text-xs text-slate-400">Pontuação de Estresse do Treino (TSS)</p>
              </div>
              <span className="text-primary font-bold text-lg">482 <span className="text-[10px] text-slate-400 uppercase tracking-tighter">pts</span></span>
            </div>
            <div className="flex items-end justify-between h-32 gap-2">
              {[
                { day: 'S', height: '60%', color: 'bg-primary/40' },
                { day: 'T', height: '85%', color: 'bg-primary/60' },
                { day: 'Q', height: '40%', color: 'bg-primary', active: true },
                { day: 'Q', height: '0%', color: 'bg-slate-600' },
                { day: 'S', height: '0%', color: 'bg-slate-600' },
                { day: 'S', height: '0%', color: 'bg-slate-600' },
                { day: 'D', height: '0%', color: 'bg-slate-600' },
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-700 rounded-t-sm relative h-full">
                    <div className={`absolute bottom-0 w-full ${item.color} rounded-t-sm`} style={{ height: item.height }}></div>
                  </div>
                  <span className={`text-[10px] font-medium ${item.active ? 'text-slate-100 font-bold' : 'text-slate-500'}`}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-2">
          <h2 className="text-lg font-bold leading-tight mb-3">Próxima Consulta</h2>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-primary text-white p-3 rounded-lg flex flex-col items-center justify-center min-w-[60px]">
              <span className="text-xs uppercase font-bold">Out</span>
              <span className="text-xl font-bold">25</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Fisioterapia</h4>
              <p className="text-slate-400 text-xs">Dra. Sarah Jenkins • Centro de Recuperação</p>
              <div className="flex items-center gap-1 mt-1 text-primary text-xs font-semibold">
                <MapPin size={12} />
                <span>Centro de Treinamento Principal</span>
              </div>
            </div>
            <ChevronRight className="text-slate-400" size={20} />
          </div>
        </section>
      </main>

      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Link2 size={18} className="text-amber-500" />
                <h2 className="font-black uppercase tracking-widest text-sm">Vincular Fisioterapeuta</h2>
              </div>
              <button onClick={() => { setShowLinkModal(false); setLinkError(null); setInviteCode(''); }} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {linkSuccess ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 size={48} className="text-primary" />
                <p className="text-sm font-bold text-primary uppercase tracking-widest">Vinculado com sucesso!</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-400 leading-relaxed mb-5">
                  Insira o código de convite fornecido pelo seu fisioterapeuta para desbloquear o plano completo.
                </p>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ELITE-2026"
                  className="w-full h-14 bg-slate-800 border border-slate-700 rounded-xl px-4 text-sm font-bold tracking-widest uppercase text-center focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all mb-3"
                />
                {linkError && (
                  <p className="text-xs text-red-400 font-bold text-center mb-3 uppercase tracking-wide">{linkError}</p>
                )}
                <button
                  onClick={handleLink}
                  disabled={linkLoading || !inviteCode.trim()}
                  className="w-full h-12 bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {linkLoading ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Vínculo'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex flex-col bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 px-2 pb-8 pt-2">
        <p className="text-center text-[9px] text-slate-700 font-bold tracking-widest uppercase mb-1">v{APP_VERSION}</p>
        <div className="flex">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-primary/30"></div>
        <button onClick={() => navigate('athlete-dashboard')} className="flex flex-1 flex-col items-center justify-center gap-1.5 text-primary">
          <div className="flex h-7 items-center justify-center drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"><Home size={22} strokeWidth={2.5} /></div>
          <p className="text-[10px] font-black leading-normal uppercase tracking-tighter">Início</p>
        </button>
        <button onClick={() => navigate('daily-training')} className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
          <div className="flex h-7 items-center justify-center"><Dumbbell size={22} /></div>
          <p className="text-[10px] font-bold leading-normal uppercase tracking-tighter">Treino</p>
        </button>
        <button onClick={() => navigate('performance-analytics')} className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
          <div className="flex h-7 items-center justify-center"><LineChart size={22} /></div>
          <p className="text-[10px] font-bold leading-normal uppercase tracking-tighter">Status</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
          <div className="flex h-7 items-center justify-center"><MessageSquare size={22} /></div>
          <p className="text-[10px] font-bold leading-normal uppercase tracking-tighter">Chat</p>
        </button>
        <button onClick={() => navigate('athlete-profile')} className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
          <div className="flex h-7 items-center justify-center"><User size={22} /></div>
          <p className="text-[10px] font-bold leading-normal uppercase tracking-tighter">Perfil</p>
        </button>
        </div>
      </nav>
    </div>
  );
}
