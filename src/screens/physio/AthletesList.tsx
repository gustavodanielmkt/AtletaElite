import React, { useState, useEffect } from 'react';
import { Bell, UserPlus, Search, SlidersHorizontal, TrendingUp, TrendingDown, Minus, LayoutDashboard, Users, Activity, BarChart, User, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AthletesList({ navigate }: { navigate: (screen: string, id?: string) => void }) {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkedAthletes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('physio_id', user.id)
        .eq('role', 'athlete');

      if (!error && data) {
        setAthletes(data.map(p => ({
          id: p.id,
          name: p.full_name,
          sport: p.sport || 'Esporte não definido',
          checkIn: 'Recente',
          status: 'Acompanhamento',
          statusColor: 'text-primary',
          bgStatus: 'bg-primary/20',
          trend: '--',
          trendIcon: <Activity size={14} />,
          // temporary fallback image for real users
          img: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
        })));
      }
      setLoading(false);
    };

    fetchLinkedAthletes();
  }, []);

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <header className="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Atletas</h1>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-slate-800 text-slate-400">
              <Bell size={20} />
            </button>
            <button className="p-2 rounded-lg bg-primary text-white">
              <UserPlus size={20} />
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar atletas ou posições..." className="w-full bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none text-slate-100" />
          </div>
          <button className="flex items-center justify-center bg-slate-800 px-3 rounded-xl">
            <SlidersHorizontal size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar">
          <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium">Todas as Equipes</button>
          <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-slate-800 text-slate-400 text-sm font-medium">Futebol</button>
          <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-slate-800 text-slate-400 text-sm font-medium">Basquete</button>
          <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-slate-800 text-slate-400 text-sm font-medium">Tênis</button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : athletes.length === 0 ? (
          <div className="text-center py-10 text-slate-400">Nenhum atleta vinculado ainda.</div>
        ) : (
          athletes.map((athlete, i) => (
            <div key={i} onClick={() => navigate('physio-athlete-profile', athlete.id)} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="size-14 rounded-full bg-slate-800 overflow-hidden border-2 border-primary/20">
                    <img src={athlete.img} alt={athlete.name} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute bottom-0 right-0 size-4 rounded-full border-2 border-slate-900 ${athlete.status === 'Pronto' ? 'bg-accent-success' : athlete.status === 'Recuperando' ? 'bg-accent-warning' : athlete.status === 'Acompanhamento' ? 'bg-primary' : 'bg-accent-danger'}`}></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{athlete.name}</h3>
                  <p className="text-xs text-slate-400">{athlete.sport}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-1">Check-in: {athlete.checkIn}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 ${athlete.bgStatus} ${athlete.statusColor} text-[10px] font-bold rounded uppercase`}>{athlete.status}</span>
                <div className={`flex items-center ${athlete.statusColor} gap-1`}>
                  {athlete.trendIcon}
                  <span className="text-xs font-semibold">{athlete.trend}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      <nav className="sticky bottom-0 z-30 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-6 pt-2">
        <div className="flex items-center justify-around px-2">
          <button onClick={() => navigate('physio-dashboard')} className="flex flex-col items-center gap-1 py-2 px-3 text-slate-400">
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-medium">Painel</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-3 text-primary">
            <Users size={24} />
            <span className="text-[10px] font-bold">Atletas</span>
          </button>
          <button onClick={() => navigate('program-builder')} className="flex flex-col items-center gap-1 py-2 px-3 text-slate-400">
            <Activity size={24} />
            <span className="text-[10px] font-medium">Programas</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-3 text-slate-400">
            <BarChart size={24} />
            <span className="text-[10px] font-medium">Relatórios</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-3 text-slate-400">
            <User size={24} />
            <span className="text-[10px] font-medium">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
