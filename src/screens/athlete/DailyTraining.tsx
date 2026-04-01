import React from 'react';
import { ArrowLeft, Calendar, CheckCircle2, PlayCircle, Lock, Home, Dumbbell, LineChart, User } from 'lucide-react';

export default function DailyTraining({ navigate }: { navigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen flex flex-col pb-24">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => navigate('athlete-dashboard')} className="flex items-center gap-3">
            <ArrowLeft size={24} className="text-slate-400 cursor-pointer" />
            <h1 className="text-xl font-bold tracking-tight">Plano de Treino Diário</h1>
          </button>
          <button className="bg-slate-800 p-2 rounded-full text-slate-300">
            <Calendar size={20} />
          </button>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar px-4 gap-6 pb-2">
          {['Aquecimento', 'Mobilidade', 'Força', 'Corretivos', 'Recuperação'].map((cat, i) => (
            <a key={i} href="#" className={`flex flex-col items-center justify-center border-b-2 ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-slate-500'} pb-3 pt-2 whitespace-nowrap`}>
              <p className="text-sm font-bold uppercase tracking-wider">{cat}</p>
            </a>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Exercícios de Aquecimento</h2>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">2/3 Concluído</span>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4 items-center relative overflow-hidden">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2jcAyzdUYo6QWVeGbSQiTRO7XUH2enWECwgObGKYru9BwzIBNZNEcIlc29FVh20-IH65m62tPm2govVKInVbJQVgfEnPq0ZOaaWNBq9o3GjkoOio0vMLrct029a2Ufs2t17zyqK55JjEtkq5EbtY-cKLn7_QLHnJ3uv9-eZm6qiXsHhwIwWnxfXybCX9DOwx32UornX9HIJKjdRueGLfMAyPFx1FO0OXuimk7M-0sTMLEKh3orAXpS1r0YFcZ6XaYxq1Uq1excWsB" alt="Dynamic Lunges" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <PlayCircle size={24} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-base font-bold leading-tight">Avanço Dinâmico</p>
                <p className="text-slate-400 text-sm font-normal">3 séries x 12 reps</p>
              </div>
              <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-8 px-4 bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">
                <span>Concluir</span>
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4 items-center relative overflow-hidden opacity-60">
              <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative grayscale">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfe6T3JjBwuqvmJo54QKf4bhpGVOHJxMlilPSiIsq2hyx4tzatlStnFjVj_N-zaGr9wDmHjmXHgyzhioHimTVr2cdQ_AzAuZknNSKeiev_QzjhpJpnrT_HW7vjP3gF0pCNEnqYLeg_cw980hpJpBF-8XGtt9DRrgUwPwcHewMNzAB2-3CpGF7TwoQNStgJCJzUKrwfhiBj3xMteRix2TX99IZpAT9A4qkjaukKGLFGnStthb-tjdQRCjDYdY-JpS6MYkVLYUJGBFPg" alt="Arm Circles" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold leading-tight line-through">Círculos com os Braços</p>
                <p className="text-slate-400 text-sm font-normal">2 séries x 30 seg</p>
              </div>
              <div className="flex items-center gap-1 text-accent-success">
                <CheckCircle2 size={16} />
                <span className="text-xs font-bold uppercase">Concluído</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Mobilidade</h2>
            <span className="text-xs font-medium text-slate-400">0/2 Concluído</span>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4 items-center">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0ekBogXMsC8wfQXLGazFg-ajGSnDtpbyJbXMgp2_hP8RcMMMoxAg6Q4BXnjfDBWZatjrA17o5ZuO3MQ7S-4zxndza2Yv0p09FGQlTYddU6JRWdC6MBrt15mtWCrzyTVD7I_L_LzmB7OdIVFeeMdKyVbIZsA0DJPaUkM98vazNxXNnK78dWV4R9KYwYFzEvARZ3kWF-IK_EGTJyM203Pdm2YbdU9ipxmobIvZn17FKxOKXAe1vPthUHaLCcavOfD2wTTg3K2EVWZiG" alt="Hip Openers" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <PlayCircle size={24} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-base font-bold leading-tight">Abertura de Quadril</p>
                <p className="text-slate-400 text-sm font-normal">3 séries x 10 reps</p>
              </div>
              <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-8 px-4 bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">
                <span>Concluir</span>
              </button>
            </div>
          </div>
        </section>

        <section className="opacity-50 pointer-events-none relative">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background-dark/40 backdrop-blur-[2px] rounded-xl border border-slate-800">
            <Lock size={32} className="text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-400">Conclua o Aquecimento e a Mobilidade para desbloquear os exercícios de Força</p>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Força</h2>
          </div>
          <div className="space-y-4 filter blur-[1px]">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4 items-center">
              <div className="w-20 h-20 bg-slate-800 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex bg-slate-900 border-t border-slate-800 px-2 pb-6 pt-2">
        <button onClick={() => navigate('athlete-dashboard')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><Home size={24} /></div>
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button className="flex flex-1 flex-col items-center justify-center gap-1 text-primary">
          <div className="flex h-8 items-center justify-center"><Dumbbell size={24} /></div>
          <span className="text-[10px] font-bold">Treino</span>
        </button>
        <button onClick={() => navigate('performance-analytics')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><LineChart size={24} /></div>
          <span className="text-[10px] font-medium">Progresso</span>
        </button>
        <button onClick={() => navigate('athlete-profile')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
          <div className="flex h-8 items-center justify-center"><User size={24} /></div>
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
