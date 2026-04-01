import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Activity, Target, User, HeartPulse, ActivitySquare, BrainCircuit, Crosshair, HelpCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface AnamnesisData {
    general_data: any;
    sports_history: any;
    injury_history: any;
    medical_history: any;
    functional_eval: any;
    biomechanics_eval: any;
    treatment_goals: any;
    specific_questionnaire: any;
}

const initialData: AnamnesisData = {
    general_data: { age: '', gender: '', height: '', weight: '', profession: '', activity_level: '' },
    sports_history: { modalities: '', practice_time: '', frequency: '', competitive_level: '', recent_training: '' },
    injury_history: { has_injury: false, type: '', location: '', start_date: '', mechanism: '', pain_level: 5, evolution: '', treatment: '', time_off: '' },
    medical_history: { diseases: '', surgeries: '', meds: '', previous_injuries: '', sleep: 'Boa', stress: 'Moderado' },
    functional_eval: { difficulties: [], pain_activities: '', mobility: '', strength: '', instability: '' },
    biomechanics_eval: { posture: '', asymmetries: '', compensations: '', prof_feedback: '' },
    treatment_goals: { main_goals: [], deadline: '', specific_target: '' },
    specific_questionnaire: { knee_pain_stairs: false, knee_instability: false, knee_pops: false, knee_swelling: false }
};

interface AnamnesisWizardProps {
    userId: string;
    onComplete: () => void;
}

export default function AnamnesisWizard({ userId, onComplete }: AnamnesisWizardProps) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<AnamnesisData>(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalSteps = 8; // Adjust based on logic, if not injured, maybe skip some? For now 8.

    const updateData = (section: keyof AnamnesisData, field: string, value: any) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error: submitError } = await supabase.from('anamnesis').insert({
                athlete_id: userId,
                status: 'completed',
                general_data: data.general_data,
                sports_history: data.sports_history,
                injury_history: data.injury_history,
                medical_history: data.medical_history,
                functional_eval: data.functional_eval,
                biomechanics_eval: data.biomechanics_eval,
                treatment_goals: data.treatment_goals,
                specific_questionnaire: data.specific_questionnaire
            });

            if (submitError) throw submitError;

            // Update profiles age/weight so they are considered "onboarded" by App.tsx
            await supabase.from('profiles').update({
                age: parseInt(data.general_data.age) || 0,
                weight: parseFloat(data.general_data.weight) || 0,
                height: parseInt(data.general_data.height) || 0,
                sport: data.sports_history.modalities
            }).eq('id', userId);

            onComplete();
        } catch (err: any) {
            setError(err.message || 'Falha ao salvar a anamnese. Tente novamente.');
            setLoading(false);
        }
    };

    const renderStepIcon = (currentStep: number) => {
        switch (currentStep) {
            case 1: return <User size={24} className="text-primary" />;
            case 2: return <Activity size={24} className="text-primary" />;
            case 3: return <HeartPulse size={24} className="text-primary" />;
            case 4: return <ActivitySquare size={24} className="text-primary" />;
            case 5: return <BrainCircuit size={24} className="text-primary" />;
            case 6: return <Crosshair size={24} className="text-primary" />;
            case 7: return <Target size={24} className="text-primary" />;
            case 8: return <HelpCircle size={24} className="text-primary" />;
            default: return <User size={24} className="text-primary" />;
        }
    };

    const renderStepTitle = (currentStep: number) => {
        const titles = [
            "Dados Gerais", "Histórico Esportivo", "Histórico de Lesão", "Histórico Médico",
            "Avaliação Funcional", "Avaliação Biomecânica", "Objetivos do Tratamento", "Detalhes Específicos"
        ];
        return titles[currentStep - 1];
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-display pb-20">
            {/* Header */}
            <header className="pt-12 pb-6 px-6 bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            {renderStepIcon(step)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">Passo {step} de {totalSteps}</p>
                            <h1 className="text-xl font-bold text-white">{renderStepTitle(step)}</h1>
                        </div>
                    </div>
                    {step > 1 && (
                        <button onClick={handleBack} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                            <ChevronLeft size={20} />
                        </button>
                    )}
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* --- STEP 1: GENERAL DATA --- */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 mb-6 font-medium">Precisamos conhecer sua base física para traçarmos seu perfil.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Idade</label>
                                        <input type="number" value={data.general_data.age} onChange={(e) => updateData('general_data', 'age', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Ex: 25" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Sexo</label>
                                        <select value={data.general_data.gender} onChange={(e) => updateData('general_data', 'gender', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none">
                                            <option value="">Selecione</option><option value="M">Masculino</option><option value="F">Feminino</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Altura (cm)</label>
                                        <input type="number" value={data.general_data.height} onChange={(e) => updateData('general_data', 'height', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Ex: 180" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Peso (kg)</label>
                                        <input type="number" value={data.general_data.weight} onChange={(e) => updateData('general_data', 'weight', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Ex: 75.5" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Profissão Principal</label>
                                    <input type="text" value={data.general_data.profession} onChange={(e) => updateData('general_data', 'profession', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Ex: Engenheiro, Atleta Profissional..." />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Nível de Atividade</label>
                                    <select value={data.general_data.activity_level} onChange={(e) => updateData('general_data', 'activity_level', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none">
                                        <option value="">Selecione</option>
                                        <option value="iniciante">Iniciante / Recreacional</option>
                                        <option value="intermediario">Intermediário (3-4x/semana)</option>
                                        <option value="avancado">Avançado (Amador competitivo)</option>
                                        <option value="atleta_pro">Atleta Profissional</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* --- STEP 2: SPORTS HISTORY --- */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 mb-6 font-medium">Nos conte sobre a sua rotina no esporte.</p>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Modalidade(s)</label>
                                    <input type="text" value={data.sports_history.modalities} onChange={(e) => updateData('sports_history', 'modalities', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Ex: Futebol, Crossfit, Jiu-Jitsu" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Tempo de Prática</label>
                                        <input type="text" value={data.sports_history.practice_time} onChange={(e) => updateData('sports_history', 'practice_time', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Ex: 5 anos" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Frequência</label>
                                        <select value={data.sports_history.frequency} onChange={(e) => updateData('sports_history', 'frequency', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none">
                                            <option value="">Selecione</option><option value="1-2">1 a 2x na semana</option><option value="3-4">3 a 4x na semana</option><option value="5+">5+ vezes (Diário)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Demandas Físicas Principais</label>
                                    <textarea value={data.sports_history.demands} onChange={(e) => updateData('sports_history', 'demands', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none h-24 resize-none" placeholder="Ex: Muita corrida de explosão, mudanças de direção bruscas..." />
                                </div>
                            </div>
                        )}

                        {/* --- STEP 3: INJURY HISTORY --- */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 mb-6 font-medium">Você possui alguma lesão atual que precisa de tratamento?</p>
                                <div className="flex gap-4 mb-6">
                                    <button onClick={() => updateData('injury_history', 'has_injury', true)} className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${data.injury_history.has_injury ? 'border-primary bg-primary/10 text-primary' : 'border-slate-800 bg-slate-900 text-slate-400'}`}>Sim</button>
                                    <button onClick={() => updateData('injury_history', 'has_injury', false)} className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!data.injury_history.has_injury ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-slate-800 bg-slate-900 text-slate-400'}`}>Não (Prevenção)</button>
                                </div>

                                {data.injury_history.has_injury && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-500">Tipo da Lesão</label>
                                                <select value={data.injury_history.type} onChange={(e) => updateData('injury_history', 'type', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none">
                                                    <option value="">Selecione</option><option value="Aguda">Aguda (Recente/Trauma)</option><option value="Cronica">Crônica (Dor persistente)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-500">Localização</label>
                                                <input type="text" value={data.injury_history.location} onChange={(e) => updateData('injury_history', 'location', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Ex: Joelho Dir." />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Mecanismo (Como aconteceu?)</label>
                                            <textarea value={data.injury_history.mechanism} onChange={(e) => updateData('injury_history', 'mechanism', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none h-20 resize-none" placeholder="Ex: Torci o joelho caindo de um salto..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 flex justify-between">
                                                <span>Intensidade da Dor atual</span>
                                                <span className="text-primary font-bold">{data.injury_history.pain_level} / 10</span>
                                            </label>
                                            <input type="range" min="0" max="10" value={data.injury_history.pain_level} onChange={(e) => updateData('injury_history', 'pain_level', e.target.value)} className="w-full accent-primary h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                                            <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase"><p>Sem dor</p><p>Dor máxima</p></div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* --- STEP 4: MEDICAL HISTORY --- */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 mb-6 font-medium">Seu corpo como um todo. Algum detalhe médico relevante?</p>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Doenças Pré-existentes / Cirurgias</label>
                                    <textarea value={data.medical_history.diseases} onChange={(e) => updateData('medical_history', 'diseases', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none h-20 resize-none" placeholder="Ex: Asma, Cirurgia LCA em 2020..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Qualidade do Sono</label>
                                        <select value={data.medical_history.sleep} onChange={(e) => updateData('medical_history', 'sleep', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none">
                                            <option value="Muito Boa">Muito Boa</option><option value="Boa">Boa</option><option value="Irregular">Irregular</option><option value="Ruim">Ruim</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Nível de Estresse</label>
                                        <select value={data.medical_history.stress} onChange={(e) => updateData('medical_history', 'stress', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none">
                                            <option value="Baixo">Baixo</option><option value="Moderado">Moderado</option><option value="Alto">Alto</option><option value="Extremo">Extremo</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STEP 5: FUNCTIONAL EVALUATION --- */}
                        {step === 5 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 mb-6 font-medium">Como você se sente nos movimentos do dia a dia e treino?</p>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Dificuldades em Motricidade Básica (Selecione)</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {['Agachar', 'Correr', 'Pular', 'Girar/Mudar Direção', 'Subir Escada', 'Pegar Peso'].map(item => (
                                            <button
                                                key={item}
                                                onClick={() => {
                                                    const diff = data.functional_eval.difficulties;
                                                    if (diff.includes(item)) updateData('functional_eval', 'difficulties', diff.filter((i: string) => i !== item));
                                                    else updateData('functional_eval', 'difficulties', [...diff, item]);
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${data.functional_eval.difficulties.includes(item) ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1 pt-4">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Sente Perda de Força ou Instabilidade?</label>
                                    <textarea value={data.functional_eval.strength} onChange={(e) => updateData('functional_eval', 'strength', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none h-16 resize-none" placeholder="Ex: Meu tornozelo parece 'frouxo' quando corro." />
                                </div>
                            </div>
                        )}

                        {/* --- STEP 6: BIOMECHANICS --- */}
                        {step === 6 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 mb-6 font-medium">Sua percepção sobre como o seu corpo se move e se comporta estruturalmente.</p>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Alterações Posturais ou Assimetrias Notadas</label>
                                    <textarea value={data.biomechanics_eval.asymmetries} onChange={(e) => updateData('biomechanics_eval', 'asymmetries', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none h-20 resize-none" placeholder="Ex: Tenho um ombro mais alto que o outro, piso mais forte com o pé esquerdo" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Compensações durante Exercícios</label>
                                    <textarea value={data.biomechanics_eval.compensations} onChange={(e) => updateData('biomechanics_eval', 'compensations', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none h-20 resize-none" placeholder="Ex: Quando agacho, meu joelho entra pra dentro e sinto a lombar" />
                                </div>
                            </div>
                        )}

                        {/* --- STEP 7: TREATMENT GOALS --- */}
                        {step === 7 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 mb-6 font-medium">Onde queremos chegar juntos no seu processo?</p>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Principais Objetivos (Selecione)</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {['Redução da Dor', 'Retorno ao Esporte', 'Melhora de Performance', 'Prevenção de Lesões', 'Fortalecimento'].map(item => (
                                            <button
                                                key={item}
                                                onClick={() => {
                                                    const tg = data.treatment_goals.main_goals;
                                                    if (tg.includes(item)) updateData('treatment_goals', 'main_goals', tg.filter((i: string) => i !== item));
                                                    else updateData('treatment_goals', 'main_goals', [...tg, item]);
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${data.treatment_goals.main_goals.includes(item) ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1 pt-4">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Prazo / Meta Específica (Se houver)</label>
                                    <input type="text" value={data.treatment_goals.deadline} onChange={(e) => updateData('treatment_goals', 'deadline', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Ex: Voltar a jogar o campeonato no mês que vem" />
                                </div>
                            </div>
                        )}

                        {/* --- STEP 8: SPECIFIC SINTOMS --- */}
                        {step === 8 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 mb-6 font-medium">Para finalizar, responda rapidamente sobre sintomas específicos (Para articulações).</p>
                                {/* Simplified Specific Logic - In reality this adapts based on Selected Location step 3, showing generic as example */}
                                <div className="space-y-3">
                                    {[
                                        { key: 'knee_pain_stairs', label: 'Dor ao subir ou descer escadas?' },
                                        { key: 'knee_instability', label: 'Sente a articulação "falseando" ou instável?' },
                                        { key: 'knee_pops', label: 'Estalos frequentes durante movimento?' },
                                        { key: 'knee_swelling', label: 'Nota inchaço no fim do dia ou pós-treino?' },
                                    ].map((q) => (
                                        <div key={q.key} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                            <p className="text-sm text-slate-300 font-medium">{q.label}</p>
                                            <button
                                                onClick={() => updateData('specific_questionnaire', q.key, !data.specific_questionnaire[q.key])}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${data.specific_questionnaire[q.key] ? 'bg-primary' : 'bg-slate-700'}`}
                                            >
                                                <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${data.specific_questionnaire[q.key] ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {error && <p className="text-red-500 text-xs font-bold text-center mt-4">{error}</p>}
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-900 flex gap-3 z-30">
                {step < totalSteps && (
                    <button
                        onClick={handleNext}
                        className="flex-1 h-14 bg-primary text-slate-950 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                    >
                        Próximo Passo <ChevronRight size={18} />
                    </button>
                )}
                {step === totalSteps && (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 h-14 bg-blue-500 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={18} /> Finalizar Anamnese</>}
                    </button>
                )}
            </footer>
        </div>
    );
}
