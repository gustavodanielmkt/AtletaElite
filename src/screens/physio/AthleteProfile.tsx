import React, { useState, useEffect } from 'react';
import { ArrowLeft, MoreVertical, MessageSquare, ClipboardList, TrendingUp, FileText, Users, Calendar, LineChart, Mail, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PhysioAthleteProfile({ navigate, athleteId }: { navigate: (screen: string) => void, athleteId?: string }) {
  const [athlete, setAthlete] = useState<any>(null);

  useEffect(() => {
    if (!athleteId) return;
    const fetchAthlete = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', athleteId).single();
      if (data) setAthlete(data);
    };
    fetchAthlete();
  }, [athleteId]);

  const name = athlete?.full_name || 'Carregando...';
  const sportInfo = athlete?.sport || 'Esporte não definido';
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark overflow-x-hidden pb-24">
      <div className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 border-b border-border-dark bg-background-dark">
        <button onClick={() => navigate('athletes-list')} className="flex size-12 shrink-0 items-center justify-center cursor-pointer">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Perfil do Atleta</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-surface-dark transition-colors">
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      <div className="flex p-6">
        <div className="flex w-full flex-col gap-6 md:flex-row md:items-center">
          <div className="flex gap-5 items-center">
            <div className="relative">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 border-2 border-primary" style={{ backgroundImage: "url('https://cdn-icons-png.flaticon.com/512/149/149071.png')" }}></div>
              <div className="absolute bottom-0 right-0 h-6 w-6 bg-accent-neon rounded-full border-4 border-background-dark"></div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold tracking-tight">{name}</p>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/30">Pro</span>
              </div>
              <p className="text-slate-400 text-base font-medium flex items-center gap-1">
                {sportInfo}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-semibold border border-orange-500/20">
                  <span className="size-2 bg-orange-500 rounded-full"></span>
                  Em Recuperação
                </span>
                <span className="text-slate-400 text-xs font-medium italic">12ª Semana Pós-Op LCA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex border-b border-border-dark justify-between overflow-x-auto hide-scrollbar">
          <a className="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 pt-2 px-4 whitespace-nowrap" href="#">
            <p className="text-sm font-bold tracking-wide">Visão Geral</p>
          </a>
          <a className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-400 pb-3 pt-2 px-4 whitespace-nowrap" href="#">
            <p className="text-sm font-bold tracking-wide">Avaliação</p>
          </a>
          <a className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-400 pb-3 pt-2 px-4 whitespace-nowrap" href="#">
            <p className="text-sm font-bold tracking-wide">Plano de Treino</p>
          </a>
          <a className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-400 pb-3 pt-2 px-4 whitespace-nowrap" href="#">
            <p className="text-sm font-bold tracking-wide">Progresso</p>
          </a>
          <a className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-400 pb-3 pt-2 px-4 whitespace-nowrap" href="#">
            <p className="text-sm font-bold tracking-wide">Mensagens</p>
          </a>
        </div>
      </div>

      <div className="flex gap-3 px-4 py-6 flex-wrap">
        <button className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-xl h-12 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
          <MessageSquare size={20} />
          <span>Enviar Mensagem</span>
        </button>
        <button onClick={() => navigate('program-builder')} className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-xl h-12 bg-surface-dark text-slate-100 text-sm font-bold border border-border-dark hover:bg-slate-700 transition-all">
          <ClipboardList size={20} />
          <span>Atribuir Programa</span>
        </button>
        <button onClick={() => navigate('anamnesis-report')} className="w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-blue-500/20 text-blue-500 text-sm font-bold border border-blue-500/30 hover:bg-blue-500/30 transition-all">
          <FileText size={20} />
          <span>Ver Relatório de Anamnese</span>
        </button>
      </div>

      <div className="px-4 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-dark border border-border-dark">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Prontidão</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-accent-neon">84%</p>
              <TrendingUp size={16} className="text-accent-neon mb-1" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface-dark border border-border-dark">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">A/C Ratio</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">1.15</p>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] mb-1">Ideal</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-dark rounded-xl p-5 border border-border-dark flex items-center gap-6">
            <div className="relative size-24 flex items-center justify-center">
              <svg className="size-full" viewBox="0 0 100 100">
                <circle className="text-slate-800" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary progress-ring" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeDasharray="263.89" strokeDashoffset="21.11" strokeLinecap="round" strokeWidth="8"></circle>
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-bold">92%</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">Adesão</h3>
              <p className="text-sm text-slate-400 leading-tight mt-1">A taxa de conclusão nos últimos 14 dias está acima da meta.</p>
            </div>
          </div>

          <div className="bg-surface-dark rounded-xl p-5 border border-border-dark">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Tendência de Dor (EVA)</h3>
              <span className="text-xs text-slate-500">Últimos 14 Dias</span>
            </div>
            <div className="relative h-24 w-full flex items-end gap-1">
              <div className="flex-1 bg-primary/20 rounded-t-sm h-[90%] relative group">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-dark text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">7</div>
              </div>
              <div className="flex-1 bg-primary/25 rounded-t-sm h-[85%]"></div>
              <div className="flex-1 bg-primary/30 rounded-t-sm h-[80%]"></div>
              <div className="flex-1 bg-primary/35 rounded-t-sm h-[70%]"></div>
              <div className="flex-1 bg-primary/40 rounded-t-sm h-[75%]"></div>
              <div className="flex-1 bg-primary/45 rounded-t-sm h-[60%]"></div>
              <div className="flex-1 bg-primary/50 rounded-t-sm h-[55%]"></div>
              <div className="flex-1 bg-primary/55 rounded-t-sm h-[50%]"></div>
              <div className="flex-1 bg-primary/60 rounded-t-sm h-[40%]"></div>
              <div className="flex-1 bg-primary/70 rounded-t-sm h-[45%]"></div>
              <div className="flex-1 bg-primary/80 rounded-t-sm h-[35%]"></div>
              <div className="flex-1 bg-primary/90 rounded-t-sm h-[30%]"></div>
              <div className="flex-1 bg-primary rounded-t-sm h-[20%]"></div>
              <div className="flex-1 bg-accent-neon rounded-t-sm h-[15%]"></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-slate-500">Dia 1</span>
              <span className="text-[10px] font-bold text-accent-neon">Atual: 1.2</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-dark rounded-xl p-5 border border-border-dark">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              Anotações Clínicas Recentes
            </h3>
            <button className="text-xs font-bold text-primary">Ver Todos</button>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-primary pl-4 py-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wide">Reabilitação Pós-Sessão</span>
                <span className="text-[10px] text-slate-500 font-medium">24 Out, 2023</span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">
                Série de carga excêntrica nos posteriores concluída. Relatou dor 0 durante os exercícios. Amplitude de movimento melhorou 5° na extensão passiva.
              </p>
            </div>
            <div className="border-l-2 border-slate-700 pl-4 py-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wide">Check-in de Monitoramento</span>
                <span className="text-[10px] text-slate-500 font-medium">22 Out, 2023</span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">
                Atleta mencionou leve fadiga no quadríceps esquerdo durante a verificação matinal de PSE. Volume pliométrico de hoje ajustado para -15%.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full z-20">
        <div className="flex gap-2 border-t border-border-dark bg-surface-dark px-4 pb-6 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <button onClick={() => navigate('athletes-list')} className="flex flex-1 flex-col items-center justify-center gap-1 text-primary">
            <Users size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Elenco</p>
          </button>
          <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
            <Calendar size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Agenda</p>
          </button>
          <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
            <LineChart size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Análises</p>
          </button>
          <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
            <Mail size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Caixa de Entrada</p>
          </button>
          <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
            <Settings size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Configurações</p>
          </button>
        </div>
      </div>
    </div>
  );
}
