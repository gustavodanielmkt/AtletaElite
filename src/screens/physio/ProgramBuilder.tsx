import React from 'react';
import { ArrowLeft, Search, GripVertical, PlayCircle, PlusCircle, Edit, Dumbbell, LineChart, User } from 'lucide-react';

export default function ProgramBuilder({ navigate }: { navigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen flex flex-col pb-24">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('physio-dashboard')}><ArrowLeft size={24} className="text-slate-400 cursor-pointer" /></button>
            <h2 className="text-xl font-bold leading-tight tracking-tight">Novo Programa</h2>
          </div>
          <button className="bg-[#ccff00] text-background-dark px-6 py-1.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
            Salvar
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-24">
        <div className="px-4 py-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-slate-500 group-focus-within:text-[#ccff00] transition-colors" />
            </div>
            <input type="text" placeholder="Buscar em mais de 500 exercícios..." className="block w-full bg-slate-900 border-none rounded-xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-[#ccff00]/50 transition-all outline-none" />
          </div>
        </div>

        <div className="pb-2">
          <div className="flex overflow-x-auto custom-scrollbar px-4 gap-6 hide-scrollbar">
            <a href="#" className="flex flex-col items-center justify-center border-b-2 border-[#ccff00] text-[#ccff00] pb-3 pt-2 whitespace-nowrap">
              <p className="text-sm font-bold uppercase tracking-wider">Aquecimento</p>
            </a>
            <a href="#" className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 pb-3 pt-2 whitespace-nowrap hover:text-slate-300">
              <p className="text-sm font-bold uppercase tracking-wider">Mobilidade</p>
            </a>
            <a href="#" className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 pb-3 pt-2 whitespace-nowrap hover:text-slate-300">
              <p className="text-sm font-bold uppercase tracking-wider">Força</p>
            </a>
            <a href="#" className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 pb-3 pt-2 whitespace-nowrap hover:text-slate-300">
              <p className="text-sm font-bold uppercase tracking-wider">Recuperação</p>
            </a>
          </div>
        </div>

        <div className="px-4 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold">Exercícios Selecionados</h3>
          <span className="text-xs text-slate-500 uppercase font-semibold">3 Itens</span>
        </div>

        <div className="px-4 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 relative group">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-slate-700">
              <GripVertical size={20} />
            </div>
            <div className="ml-6">
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2jcAyzdUYo6QWVeGbSQiTRO7XUH2enWECwgObGKYru9BwzIBNZNEcIlc29FVh20-IH65m62tPm2govVKInVbJQVgfEnPq0ZOaaWNBq9o3GjkoOio0vMLrct029a2Ufs2t17zyqK55JjEtkq5EbtY-cKLn7_QLHnJ3uv9-eZm6qiXsHhwIwWnxfXybCX9DOwx32UornX9HIJKjdRueGLfMAyPFx1FO0OXuimk7M-0sTMLEKh3orAXpS1r0YFcZ6XaYxq1Uq1excWsB" alt="Dynamic Lunges" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <PlayCircle size={32} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-100">Avanço Dinâmico</h4>
                  <p className="text-xs text-[#ccff00] font-medium mb-3 uppercase tracking-tighter">Membros Inferiores • Aquecimento</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Séries</span>
                      <input type="number" defaultValue="3" className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Reps</span>
                      <input type="number" defaultValue="12" className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Descanso</span>
                      <input type="text" defaultValue="30s" className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 relative group">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-slate-700">
              <GripVertical size={20} />
            </div>
            <div className="ml-6">
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfe6T3JjBwuqvmJo54QKf4bhpGVOHJxMlilPSiIsq2hyx4tzatlStnFjVj_N-zaGr9wDmHjmXHgyzhioHimTVr2cdQ_AzAuZknNSKeiev_QzjhpJpnrT_HW7vjP3gF0pCNEnqYLeg_cw980hpJpBF-8XGtt9DRrgUwPwcHewMNzAB2-3CpGF7TwoQNStgJCJzUKrwfhiBj3xMteRix2TX99IZpAT9A4qkjaukKGLFGnStthb-tjdQRCjDYdY-JpS6MYkVLYUJGBFPg" alt="IT Band Foam Roll" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <PlayCircle size={32} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-100">Rolo de Espuma na Banda IT</h4>
                  <p className="text-xs text-[#ccff00] font-medium mb-3 uppercase tracking-tighter">Mobilidade • Recuperação</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Duração</span>
                      <input type="text" defaultValue="60s" className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Lado</span>
                      <select className="bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#ccff00] outline-none text-white">
                        <option>Ambos</option>
                        <option>Esquerdo</option>
                        <option>Direito</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-8 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-[#ccff00] hover:text-[#ccff00] transition-all group">
            <PlusCircle size={32} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold uppercase">Adicionar Exercício</span>
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark border-t border-slate-800 px-4 pb-6 pt-2 z-50">
        <div className="flex max-w-2xl mx-auto justify-between items-center">
          <button className="flex flex-col items-center gap-1 text-[#ccff00]">
            <Edit size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Construtor</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Dumbbell size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Exercícios</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <LineChart size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Progresso</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
