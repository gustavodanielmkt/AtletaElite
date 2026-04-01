import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, AlertTriangle, Activity, Target, Download, CheckCircle, BrainCircuit } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

// Helper to determine risk string based on pain or injury type
const calculateRisk = (painLevel: number, hasInjury: boolean) => {
    if (!hasInjury) return { text: 'Baixo (Prevenção)', color: 'text-primary', bg: 'bg-primary/20 border-primary/30' };
    if (painLevel > 7) return { text: 'Alto (Crítico)', color: 'text-red-500', bg: 'bg-red-500/20 border-red-500/30' };
    if (painLevel > 3) return { text: 'Moderado', color: 'text-orange-500', bg: 'bg-orange-500/20 border-orange-500/30' };
    return { text: 'Leve (Controle)', color: 'text-yellow-500', bg: 'bg-yellow-500/20 border-yellow-500/30' };
};

export default function AnamnesisReport({ navigate, athleteId }: { navigate: (screen: string) => void, athleteId?: string }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // For MVP, if athleteId is missing, we fetch the first available anamnesis (or we can just mock it)
    // Usually the parent screen passes the selected athlete ID in a real app context. We'll use mock-1 default.
    const targetId = athleteId || 'mock-1';

    useEffect(() => {
        const fetchReport = async () => {
            // In a real app we query by athlete_id, but here we just grab the most recent one for demonstration if needed, 
            // or we just render a placeholder if none exists yet.
            const { data: anamnesis, error } = await supabase
                .from('anamnesis')
                .select('*, profiles(full_name)')
                .eq('athlete_id', targetId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!error && anamnesis) {
                setData(anamnesis);
            } else {
                // Fallback mock data for visual demonstration until real data flows in
                setData({
                    profiles: { full_name: 'Atleta Demonstração' },
                    general_data: { age: 24, weight: 82, height: 185, activity_level: 'atleta_pro' },
                    sports_history: { modalities: 'Futebol', frequency: '5+', demands: 'Explosão, mudança de direção' },
                    injury_history: { has_injury: true, type: 'Aguda', location: 'Joelho Direito', pain_level: 6, mechanism: 'Entorse durante salto' },
                    medical_history: { sleep: 'Irregular', stress: 'Alto', surgeries: 'Nenhuma' },
                    functional_eval: { difficulties: ['Agachar', 'Girar/Mudar Direção'], strength: 'Fraqueza no posterior' },
                    biomechanics_eval: { asymmetries: 'Pelve inclinada à direita' },
                    treatment_goals: { main_goals: ['Redução da Dor', 'Retorno ao Esporte'], deadline: '1 mês' },
                });
            }
            setLoading(false);
        };
        fetchReport();
    }, [targetId]);

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Activity className="animate-pulse text-blue-500" size={40} /></div>;
    }

    if (!data) return <div className="text-white">Nenhuma anamnese encontrada.</div>;

    const risk = calculateRisk(data.injury_history?.pain_level || 0, data.injury_history?.has_injury || false);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-950 overflow-x-hidden pb-12 font-display text-slate-100">

            {/* Header */}
            <div className="flex items-center p-4 justify-between sticky top-0 z-10 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
                <button onClick={() => navigate('physio-athlete-profile')} className="flex size-12 items-center justify-center hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-sm font-black tracking-widest uppercase flex-1 text-center text-blue-400">Relatório Clínico (Anamnese)</h2>
                <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400" onClick={() => window.print()}>
                    <Download size={20} />
                </button>
            </div>

            <main className="p-4 space-y-6">

                {/* Title / Risk Card */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5"><FileText size={100} /></div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1">
                            {data.profiles?.full_name || 'Paciente'}
                        </h1>
                        <p className="text-slate-400 text-sm font-medium mb-4">
                            {data.general_data?.age} anos • {data.sports_history?.modalities} • Nível: {data.general_data?.activity_level}
                        </p>

                        <div className={`p-3 rounded-xl border flex items-center gap-3 ${risk.bg}`}>
                            <AlertTriangle className={risk.color} size={24} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Score de Risco Físico</p>
                                <p className={`text-sm font-bold uppercase tracking-wider ${risk.color}`}>{risk.text}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Diagnóstico Funcional Inicial */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Activity className="text-blue-500" size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Diagnóstico Funcional Inicial</h3>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Queixa Principal</p>
                            <p className="text-sm font-medium text-slate-200 mt-1">
                                {data.injury_history?.has_injury ? `${data.injury_history.type} em ${data.injury_history.location} (Dor: ${data.injury_history.pain_level}/10)` : 'Prevenção e Otimização de Performance'}
                            </p>
                            {data.injury_history?.mechanism && <p className="text-xs text-slate-400 mt-1 italic">"{data.injury_history.mechanism}"</p>}
                        </div>

                        <div className="h-px w-full bg-slate-800"></div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Limitações Primárias</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {data.functional_eval?.difficulties?.length > 0 ? (
                                    data.functional_eval.difficulties.map((diff: string) => (
                                        <span key={diff} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                            {diff}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-400">Nenhuma limitação severa reportada.</span>
                                )}
                            </div>
                        </div>
                        {data.functional_eval?.strength && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Observações de Força/Estabilidade</p>
                                <p className="text-sm font-medium text-slate-300 mt-1">{data.functional_eval.strength}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Biomechanics & Points of Interest */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Target className="text-purple-500" size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Biomecânica & Fatores Críticos</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Assimetrias / Postura</p>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">{data.biomechanics_eval?.asymmetries || 'Sem relato significativo'}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Fatores de Recuperação</p>
                            <div className="space-y-2 mt-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Sono</span>
                                    <span className={`font-bold ${data.medical_history?.sleep === 'Ruim' || data.medical_history?.sleep === 'Irregular' ? 'text-orange-500' : 'text-primary'}`}>{data.medical_history?.sleep || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Estresse</span>
                                    <span className={`font-bold ${data.medical_history?.stress === 'Alto' || data.medical_history?.stress === 'Extremo' ? 'text-red-500' : 'text-primary'}`}>{data.medical_history?.stress || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Treatment Direction (AI suggested format) */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <BrainCircuit className="text-emerald-500" size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Direcionamento Proposto</h3>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 relative">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500/70">Foco Inicial</p>
                                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                                    {data.injury_history?.has_injury && data.injury_history?.pain_level > 5 ? 'Controle Analgésico e Redução de Edema' : 'Recuperação Funcional e Estabilização'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500/70">Metas do Atleta</p>
                                <ul className="mt-1 space-y-1">
                                    {data.treatment_goals?.main_goals?.map((g: string) => (
                                        <li key={g} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                                            <CheckCircle size={12} className="text-emerald-500" /> {g}
                                        </li>
                                    ))}
                                    {data.treatment_goals?.deadline && (
                                        <li className="flex items-center gap-2 text-xs font-medium text-slate-300 italic mt-2">
                                            Prazo Alvo: {data.treatment_goals.deadline}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <p className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-600 pt-4 pb-8">
                    Gerado pelo sistema inteligente de anamnese Elite
                </p>

            </main>
        </div>
    );
}
