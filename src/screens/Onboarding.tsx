import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Target, User, Activity, Ruler, Weight, ArrowRight, Loader2, Footprints } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Onboarding({
    userId,
    onComplete
}: {
    userId: string;
    onComplete: () => void;
}) {
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [sport, setSport] = useState('Futebol | Meio-campista');
    const [dominantSide, setDominantSide] = useState('Direito');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                age: parseInt(age),
                height: parseInt(height),
                weight: parseFloat(weight),
                sport: sport,
                dominant_side: dominantSide
            })
            .eq('id', userId);

        if (updateError) {
            console.error("Error updating profile during onboarding:", updateError);
            setError("Falha ao salvar o perfil. Verifique as configurações e tente novamente.");
            setLoading(false);
            return;
        }

        onComplete();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white relative overflow-hidden font-display">
            {/* Background Decorative Elemements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="z-10 w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <User className="text-primary" size={40} />
                    </div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Complete seu Perfil</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-3 leading-relaxed">
                        Precisamos de alguns dados biométricos para calibrar sua Central de Comando.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Idade</label>
                            <div className="relative group">
                                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="Ex: 24"
                                    className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Altura (cm)</label>
                            <div className="relative group">
                                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="Ex: 185"
                                    className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Peso (kg)</label>
                        <div className="relative group">
                            <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Ex: 82.5"
                                className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Esporte | Posição</label>
                        <div className="relative group">
                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                value={sport}
                                onChange={(e) => setSport(e.target.value)}
                                placeholder="Ex: Futebol | Meio-campista"
                                className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Lado Dominante</label>
                        <div className="relative group">
                            <Footprints className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                            <select
                                value={dominantSide}
                                onChange={(e) => setDominantSide(e.target.value)}
                                className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none appearance-none"
                                required
                            >
                                <option value="Direito">Direito</option>
                                <option value="Esquerdo">Esquerdo</option>
                                <option value="Ambidestro">Ambidestro</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-lg text-center uppercase tracking-widest mt-4">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-xl h-14 bg-primary text-slate-950 text-sm font-black uppercase tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8 group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Concluir Perfil</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
