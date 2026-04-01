import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, MapPin, ChevronRight, Home, Dumbbell, LineChart, MessageSquare, User, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AthleteDashboard({ navigate }: { navigate: (screen: string) => void }) {
  const [isLimited, setIsLimited] = useState(false);

  const today = new Date();
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const formattedDate = `${weekdays[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsLimited(localStorage.getItem('elite_is_limited') === 'true');

    // Fetch user avatar
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
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
          <h1 className="text-lg font-extrabold leading-tight tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic uppercase pr-1">Elite Performance</h1>
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
          <button className="text-[9px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors">Vincular</button>
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
              <div className="w-full h-44 bg-center bg-no-repeat bg-cover relative grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBEKU0OoXJ6_dKspdig4Z-ZJcB3-67JNFYwmxz5kScMJA3UrifAnZRtu1i3ovtem9a-97M4ECfpC6hdJ8goOZVgBq9JmfvrLDnjZJSgudT5ZPHG9Qe2qp_LxzGEiM_eVncHoY8csK0wMxWAoAIV2NAaZ3J2y9Al8swjluzWq_k899SJf2_avZj7w8adSQH6Jn-8pKiUwQ1_iDn40zO2ejSB3KsxpDY16SXA88yK9fAeF0qE46WqzBthUBqsBreRYynBQf1wKOZkodRO")' }}>
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

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 px-2 pb-8 pt-4">
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
      </nav>
    </div>
  );
}
