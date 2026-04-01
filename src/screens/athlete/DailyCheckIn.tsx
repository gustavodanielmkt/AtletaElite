import React, { useState } from 'react';
import { X, HelpCircle, Frown, Meh, Smile, Laugh, Accessibility, Maximize, Activity } from 'lucide-react';

export default function DailyCheckIn({ navigate }: { navigate: (screen: string) => void }) {
  const [painLevel, setPainLevel] = useState(3);
  
  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-slate-100 pb-24">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-dark border-b border-slate-800">
        <button onClick={() => navigate('athlete-dashboard')} className="flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center font-display">Check-in Diário</h2>
        <button className="flex size-10 items-center justify-center text-slate-400">
          <HelpCircle size={20} />
        </button>
      </header>

      <main className="flex-1 px-4 py-6 space-y-8">
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] font-display">Nível de Dor</h3>
            <span className="text-2xl font-bold text-accent-neon">{painLevel}/10</span>
          </div>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/20 text-red-500 rounded-full">
                <Frown size={24} />
              </div>
              <p className="text-slate-400 text-sm font-medium">Quanta dor física você está sentindo?</p>
            </div>
            
            <div className="relative pt-6 pb-2">
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-neon"
              />
              <div className="flex justify-between mt-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nenhuma</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Moderada</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Intensa</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] mb-4 font-display">Nível de Fadiga</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Baixa', desc: 'Pronto para o treino', checked: true },
              { label: 'Moderada', desc: 'Carga normal', checked: false },
              { label: 'Alta', desc: 'Precisa de recuperação', checked: false },
              { label: 'Extrema', desc: 'Sobrecarga', checked: false },
            ].map((item, i) => (
              <label key={i} className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${item.checked ? 'bg-primary/20 border-primary' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-bold ${item.checked ? 'text-primary' : 'text-slate-300'}`}>{item.label}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${item.checked ? 'border-primary' : 'border-slate-600'}`}>
                    {item.checked && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                  </div>
                </div>
                <span className="text-xs text-slate-500">{item.desc}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] mb-4 font-display">Qualidade do Sono</h3>
          <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex justify-between">
            <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg text-slate-500 hover:bg-slate-800 transition-colors">
              <Frown size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Ruim</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg text-slate-500 hover:bg-slate-800 transition-colors">
              <Meh size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Razoável</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg bg-accent-neon/20 text-accent-neon border border-accent-neon/30">
              <Smile size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter text-accent-neon">Boa</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg text-slate-500 hover:bg-slate-800 transition-colors">
              <Laugh size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Ótima</span>
            </button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] font-display">Dor Muscular</h3>
            <span className="text-primary text-sm font-medium">Selecionar Áreas</span>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <Accessibility size={120} className="text-slate-700" strokeWidth={1} />
            <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-2 p-4">
              <span className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold border border-primary">Posteriores</span>
              <span className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold border border-primary">Lombar</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">Quadríceps</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">Panturrilhas</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">Ombros</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] font-display">Prontidão Mental</h3>
          <div className="mt-4">
            <div className="h-12 bg-slate-900 rounded-full border border-slate-800 relative overflow-hidden flex">
              <div className="w-1/3 bg-slate-800"></div>
              <div className="w-1/3 bg-primary/20"></div>
              <div className="w-1/3 bg-accent-neon/20"></div>
              <div className="absolute top-1/2 -translate-y-1/2 left-[70%] w-6 h-6 bg-accent-neon rounded-full border-4 border-background-dark shadow-[0_0_10px_rgba(204,255,0,0.5)]"></div>
            </div>
            <div className="flex justify-between mt-2 px-2">
              <span className="text-[10px] text-slate-500 font-bold">DESFOCADO</span>
              <span className="text-[10px] text-slate-500 font-bold text-center">ESTADO DE FLOW</span>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-dark/90 backdrop-blur-md border-t border-slate-800 z-20">
        <button onClick={() => navigate('athlete-dashboard')} className="w-full flex items-center justify-center gap-2 rounded-xl h-14 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
          <Activity size={20} />
          <span>GERAR PONTUAÇÃO DE PRONTIDÃO</span>
        </button>
        <div className="flex justify-center mt-3 gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-accent-neon animate-pulse"></div>
          <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Sincronizando com HealthKit</p>
        </div>
      </div>
    </div>
  );
}
