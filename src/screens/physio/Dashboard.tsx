import React, { useState, useEffect } from 'react';
import { Activity, Bell, AlertCircle, LayoutDashboard, Users, BarChart, LogOut, Copy, CheckCircle2, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getPhysioDashboardStats, type PhysioDashboardStats } from '../../services/physioService';

const APP_VERSION = '1.6.0';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ELITE-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function PhysioDashboard({ navigate }: { navigate: (screen: string) => void }) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [stats, setStats] = useState<PhysioDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchCode = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase.from('profiles').select('invite_code').eq('id', session.user.id).single();
      if (data?.invite_code) {
        setInviteCode(data.invite_code);
      } else {
        await generateAndSaveCode(session.user.id);
      }
    };
    fetchCode();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      try {
        const data = await getPhysioDashboardStats(session.user.id);
        setStats(data);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const generateAndSaveCode = async (userId?: string) => {
    setGeneratingCode(true);
    const id = userId || (await supabase.auth.getSession()).data.session?.user.id;
    if (!id) return;
    const code = generateInviteCode();
    await supabase.from('profiles').update({ invite_code: code }).eq('id', id);
    setInviteCode(code);
    setGeneratingCode(false);
  };

  const handleCopy = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <header className="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-primary">
              <Activity className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight tracking-tight">Atleta Elite</h1>
              <p className="text-xs text-slate-400">Painel do Profissional</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
              <LogOut size={20} />
            </button>
            <button className="p-2 rounded-lg bg-slate-800 text-slate-400 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 size-2 bg-accent-danger rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-white mb-1">
              {statsLoading ? '—' : stats?.totalAthletes ?? 0}
            </span>
            <span className="text-slate-400 text-sm font-medium">Total de Atletas</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-accent-warning mb-1">
              {statsLoading ? '—' : stats?.needAttention ?? 0}
            </span>
            <span className="text-slate-400 text-sm font-medium">Precisam de Atenção</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-accent-danger mb-1">
              {statsLoading ? '—' : stats?.activeInjuries ?? 0}
            </span>
            <span className="text-slate-400 text-sm font-medium">Lesões Ativas</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-primary mb-1">
              {statsLoading ? '—' : stats?.todaySessions ?? 0}
            </span>
            <span className="text-slate-400 text-sm font-medium">Sessões de Hoje</span>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="text-accent-danger" size={20} />
              Alertas de Alta Prioridade
            </h2>
            <button className="text-primary text-sm font-medium">Ver Todos</button>
          </div>
          <div className="space-y-3">
            <div className="bg-accent-danger/10 border border-accent-danger/20 p-4 rounded-xl flex items-start gap-4">
              <div className="size-10 rounded-full bg-slate-800 overflow-hidden shrink-0">
                <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Marcus" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">Marcus Sterling: Alerta de Dor (7/10)</h3>
                <p className="text-xs text-slate-400">Dor aguda no joelho relatada após a sessão</p>
              </div>
              <button onClick={() => navigate('physio-athlete-profile')} className="bg-accent-warning text-white px-3 py-1.5 rounded-lg text-xs font-bold">Revisar</button>
            </div>
            <div className="bg-accent-warning/10 border border-accent-warning/20 p-4 rounded-xl flex items-start gap-4">
              <div className="size-10 rounded-full bg-slate-800 overflow-hidden shrink-0">
                <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Sarah" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">Sarah Chen: Fadiga Extrema</h3>
                <p className="text-xs text-slate-400">Pontuação de sono 42/100, PSE significativamente elevada</p>
              </div>
              <button className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold">Ajustar Carga</button>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <h2 className="text-lg font-bold mb-6">Visão Geral de Prontidão dos Atletas</h2>
            <div className="flex gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Prontos para Treinar</span>
                    <span className="text-accent-success">14 Atletas (58%)</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-success w-[58%] rounded-full"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Fadiga Moderada</span>
                    <span className="text-primary">7 Atletas (29%)</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[29%] rounded-full"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Precisam de Recuperação</span>
                    <span className="text-accent-warning">3 Atletas (13%)</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-warning w-[13%] rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="w-24 flex flex-col justify-center items-center gap-4 border-l border-slate-800 pl-4">
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">76%</span>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Prontidão Média</p>
                </div>
                <div className="text-center">
                  <span className="text-xl font-bold text-accent-neon">62ms</span>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">VFC Média</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-blue-400">Código de Convite</h2>
                <p className="text-xs text-slate-400 mt-0.5">Compartilhe com seus atletas para vincularem a conta</p>
              </div>
              <button onClick={() => generateAndSaveCode()} disabled={generatingCode} className="text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50">
                <RefreshCw size={16} className={generatingCode ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-900 rounded-xl px-4 py-3 text-center">
                <span className="text-2xl font-black tracking-widest text-blue-400">
                  {inviteCode || '— — — — — —'}
                </span>
              </div>
              <button onClick={handleCopy} disabled={!inviteCode} className="h-12 w-12 flex items-center justify-center bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Agenda de Hoje</h2>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded-md text-slate-500">24 Out</span>
            </div>
            <div className="space-y-4">
              {[
                { time: '10:00', ampm: 'AM', title: 'Reabilitação LCA Fase 2', desc: 'Jake Morrison • Ginásio A', border: '' },
                { time: '11:30', ampm: 'AM', title: 'Desenvolvimento de Potência', desc: 'Esquadrão de Elite • Quadra Principal', border: 'border-l-4 border-accent-success' },
                { time: '14:00', ampm: 'PM', title: 'Testes de Retorno ao Esporte', desc: 'Elena Rodriguez • Lab 1', border: '' },
                { time: '16:30', ampm: 'PM', title: 'Recuperação Pós-Jogo', desc: 'Equipe Alpha • Piscina', border: '' },
              ].map((session, i) => (
                <div key={i} className={`flex gap-4 items-start ${session.border}`}>
                  <div className="w-14 text-right shrink-0">
                    <span className="text-sm font-bold block">{session.time}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{session.ampm}</span>
                  </div>
                  <div className="flex-1 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                    <h4 className="font-bold text-sm">{session.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{session.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 font-bold text-sm hover:border-primary hover:text-primary transition-colors">
              Adicionar Sessão
            </button>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-6 pt-2">
        <p className="text-center text-[9px] text-slate-700 font-bold tracking-widest uppercase pt-1">v{APP_VERSION}</p>
        <div className="flex items-center justify-around px-2">
          <button className="flex flex-col items-center gap-1 py-2 px-3 text-primary">
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold">Painel</span>
          </button>
          <button onClick={() => navigate('athletes-list')} className="flex flex-col items-center gap-1 py-2 px-3 text-slate-400">
            <Users size={24} />
            <span className="text-[10px] font-medium">Atletas</span>
          </button>
          <button onClick={() => navigate('clubs-list')} className="flex flex-col items-center gap-1 py-2 px-3 text-slate-400">
            <Shield size={24} />
            <span className="text-[10px] font-medium">Clubes</span>
          </button>
          <button onClick={() => navigate('program-builder')} className="flex flex-col items-center gap-1 py-2 px-3 text-slate-400">
            <Activity size={24} />
            <span className="text-[10px] font-medium">Programas</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-3 text-slate-400">
            <BarChart size={24} />
            <span className="text-[10px] font-medium">Relatórios</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
