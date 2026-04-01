import React from 'react';
import { ArrowLeft, Bell, TrendingDown, Home, Dumbbell, LineChart, MessageSquare, User, CheckCircle2 } from 'lucide-react';

export default function PerformanceAnalytics({ navigate }: { navigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen flex flex-col pb-24">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-dark border-b border-slate-800">
        <button onClick={() => navigate('athlete-dashboard')} className="flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Análise de Performance</h1>
        <button className="flex size-10 items-center justify-center text-slate-400">
          <Bell size={20} />
        </button>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button className="flex-1 py-2 text-sm font-bold rounded-md bg-primary text-white shadow-sm">Semanal</button>
          <button className="flex-1 py-2 text-sm font-bold text-slate-400">Mensal</button>
        </div>

        <section>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold">Tendência de Dor</h3>
                <p className="text-slate-400 text-xs">Escala Visual Analógica (0-10)</p>
              </div>
              <div className="flex items-center gap-1 text-accent-success bg-accent-success/10 px-2 py-1 rounded">
                <TrendingDown size={14} />
                <span className="text-xs font-bold">-1.2</span>
              </div>
            </div>
            
            <div className="relative h-32 w-full flex items-end gap-2">
              {[
                { h: '60%', val: '6' },
                { h: '50%', val: '5' },
                { h: '40%', val: '4' },
                { h: '40%', val: '4' },
                { h: '30%', val: '3' },
                { h: '20%', val: '2' },
                { h: '10%', val: '1', active: true },
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 relative group">
                  <div className={`w-full rounded-t-sm ${item.active ? 'bg-accent-neon' : 'bg-primary/40'}`} style={{ height: item.h }}></div>
                  <div className="absolute -top-6 bg-slate-800 text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-medium">
              <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <h3 className="text-base font-bold mb-4">Evolução de Força</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Agachamento (1RM)</span>
                  <span className="font-bold">145kg <span className="text-accent-success">+5kg</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[85%] rounded-full"></div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Levantamento Terra (1RM)</span>
                  <span className="font-bold">180kg <span className="text-accent-success">+2.5kg</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[92%] rounded-full"></div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Supino (1RM)</span>
                  <span className="font-bold">105kg <span className="text-slate-400">Estável</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 w-[75%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <section>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col items-center">
              <h3 className="text-sm font-bold mb-3">Mobilidade</h3>
              <div className="relative size-20">
                <svg className="size-full" viewBox="0 0 100 100">
                  <circle className="text-slate-800" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-accent-electric progress-ring" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="50.24" strokeLinecap="round" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">80%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">Índice de Amplitude de Movimento</p>
            </div>
          </section>

          <section>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col items-center">
              <h3 className="text-sm font-bold mb-3">Pontuação de Fadiga</h3>
              <div className="relative size-20">
                <svg className="size-full" viewBox="0 0 100 100">
                  <circle className="text-slate-800" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-accent-warning progress-ring" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="150.72" strokeLinecap="round" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">4/10</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">Média Diária de PSE</p>
            </div>
          </section>
        </div>

        <section>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold">Histórico de Carga de Treino</h3>
            </div>
            <div className="flex items-end gap-4 h-40">
              <div className="flex-1 flex flex-col justify-end gap-1">
                <div className="w-full bg-primary/40 rounded-t-md h-[70%]"></div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Aguda</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end gap-1">
                <div className="w-full bg-slate-700 rounded-t-md h-[60%]"></div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Crônica</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-accent-success" />
                <span className="text-xs font-medium text-slate-300">ACWR: 1.15 (Zona Ideal)</span>
              </div>
              <span className="text-[10px] font-bold text-primary cursor-pointer uppercase tracking-wider">Detalhes</span>
            </div>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex bg-slate-900 border-t border-slate-800 px-2 pb-6 pt-2">
        <button onClick={() => navigate('athlete-dashboard')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><Home size={24} /></div>
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button onClick={() => navigate('daily-training')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><Dumbbell size={24} /></div>
          <span className="text-[10px] font-medium">Treino</span>
        </button>
        <button className="flex flex-1 flex-col items-center justify-center gap-1 text-primary">
          <div className="flex h-8 items-center justify-center"><LineChart size={24} /></div>
          <span className="text-[10px] font-bold">Progresso</span>
        </button>
        <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><MessageSquare size={24} /></div>
          <span className="text-[10px] font-medium">Mensagens</span>
        </button>
        <button onClick={() => navigate('athlete-profile')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><User size={24} /></div>
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
