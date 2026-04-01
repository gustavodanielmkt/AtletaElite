import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Bandage, History, Timer, Flag, Activity, Calendar, ChevronRight, Home, Dumbbell, LineChart, MessageSquare, User, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AthleteProfile({ navigate }: { navigate: (screen: string) => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setProfile(data);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-dark border-b border-slate-800">
        <button onClick={() => navigate('athlete-dashboard')} className="flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Perfil do Atleta</h2>
        <button className="flex size-10 items-center justify-center text-slate-400">
          <Settings size={20} />
        </button>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        <section className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="size-24 rounded-full overflow-hidden border-2 border-primary p-1 bg-slate-900">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img src={profile?.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={profile?.full_name || 'Atleta'} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 size-6 bg-accent-neon rounded-full border-4 border-background-dark"></div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{profile?.full_name || 'Atleta'}</h1>
          <p className="text-slate-400 text-base font-medium text-center">{profile?.sport || 'Esporte não definido'}</p>
          <p className="text-primary font-semibold text-sm mt-1 uppercase tracking-widest">Programa de Alta Performance</p>

          <button onClick={() => navigate('edit-profile')} className="mt-6 w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-colors">
            <span>Editar Perfil do Atleta</span>
          </button>
        </section>

        <section className="grid grid-cols-4 gap-2">
          {[
            { label: 'Idade', value: profile?.age || '--' },
            { label: 'Altura', value: profile?.height || '--', unit: 'cm' },
            { label: 'Peso', value: profile?.weight || '--', unit: 'kg' },
            { label: 'Lado', value: profile?.dominant_side || '--' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{stat.label}</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-white">{stat.value}</span>
                {stat.unit && <span className="text-[10px] text-slate-400">{stat.unit}</span>}
              </div>
            </div>
          ))}
        </section>

        <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Histórico de Lesões</h3>
            <span className="text-xs font-bold text-slate-500 px-2 py-1 bg-slate-800 rounded">Nenhum Registro</span>
          </div>

          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-700/50 rounded-xl bg-slate-800/20">
            <div className="p-3 bg-slate-800 text-slate-500 rounded-full mb-3">
              <Bandage size={24} />
            </div>
            <p className="font-bold text-sm text-slate-300">Sem Lesões Registradas</p>
            <p className="text-slate-500 text-xs mt-1 max-w-[200px]">Aguardando a avaliação clínica do seu fisioterapeuta ou preparador físico.</p>
          </div>
        </section>

        <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Metas de Performance</h3>
            <span className="text-xs font-bold text-slate-500 px-2 py-1 bg-slate-800 rounded">Nenhuma Meta</span>
          </div>

          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-700/50 rounded-xl bg-slate-800/20">
            <div className="p-3 bg-slate-800 text-slate-500 rounded-full mb-3">
              <Flag size={24} />
            </div>
            <p className="font-bold text-sm text-slate-300">Sem Metas Definidas</p>
            <p className="text-slate-500 text-xs mt-1 max-w-[200px]">Aguardando a definição de metas pelo seu preparador físico.</p>
          </div>
        </section>

        <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Próxima Avaliação</h3>
            <span className="text-xs font-bold text-slate-500 px-2 py-1 bg-slate-800 rounded">Nenhuma Avaliação</span>
          </div>

          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-700/50 rounded-xl bg-slate-800/20">
            <div className="p-3 bg-slate-800 text-slate-500 rounded-full mb-3">
              <Activity size={24} />
            </div>
            <p className="font-bold text-sm text-slate-300">Sem Avaliações Agendadas</p>
            <p className="text-slate-500 text-xs mt-1 max-w-[200px]">Não há avaliações agendadas no momento.</p>
          </div>
        </section>

        <button
          onClick={handleLogout}
          className="mt-8 mb-4 w-full py-4 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          <span>Sair da Conta (Logoff)</span>
        </button>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex bg-slate-900 border-t border-slate-800 px-2 pb-6 pt-2">
        <button onClick={() => navigate('athlete-dashboard')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><Home size={24} /></div>
          <p className="text-xs font-medium leading-normal">Início</p>
        </button>
        <button onClick={() => navigate('daily-training')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><Dumbbell size={24} /></div>
          <p className="text-xs font-medium leading-normal">Treino</p>
        </button>
        <button onClick={() => navigate('performance-analytics')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><LineChart size={24} /></div>
          <p className="text-xs font-medium leading-normal">Progresso</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><MessageSquare size={24} /></div>
          <p className="text-xs font-medium leading-normal">Mensagens</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-center gap-1 text-primary">
          <div className="flex h-8 items-center justify-center"><User size={24} /></div>
          <p className="text-xs font-bold leading-normal">Perfil</p>
        </button>
      </nav>
    </div>
  );
}
