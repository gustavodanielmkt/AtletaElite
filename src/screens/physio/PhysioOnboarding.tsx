import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Briefcase, FileText, ArrowRight, Loader2, Award, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PhysioOnboardingProps {
    userId: string;
    onComplete: () => void;
}

function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ELITE-';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export default function PhysioOnboarding({ userId, onComplete }: PhysioOnboardingProps) {
    const [specialty, setSpecialty] = useState('');
    const [councilNumber, setCouncilNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!specialty) {
            setError("Por favor, selecione sua especialidade.");
            setLoading(false);
            return;
        }

        const inviteCode = generateInviteCode();

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    specialty,
                    council_number: councilNumber,
                    invite_code: inviteCode,
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            setGeneratedCode(inviteCode);
            setLoading(false);
        } catch (err: any) {
            setError("Falha ao salvar o perfil. Verifique as configurações e tente novamente.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-display">
            <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none"></div>

            {generatedCode ? (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 relative z-10 flex flex-col items-center text-center gap-6"
                >
                    <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center">
                        <Award size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                            Central Configurada!
                        </h2>
                        <p className="text-slate-400 text-sm mt-2">
                            Este é o seu código de convite. Compartilhe com seus atletas para que eles possam se vincular à sua conta.
                        </p>
                    </div>

                    <div className="w-full bg-slate-800 border border-blue-500/30 rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Código de Convite</p>
                        <p className="text-3xl font-black tracking-widest text-blue-400">{generatedCode}</p>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 h-12 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm font-bold hover:border-blue-500/50 hover:text-blue-400 transition-all"
                    >
                        {copied ? <><CheckCircle2 size={16} className="text-primary" /> Copiado!</> : <><Copy size={16} /> Copiar Código</>}
                    </button>

                    <button
                        onClick={onComplete}
                        className="w-full flex items-center justify-center gap-2 h-14 bg-blue-500 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                        <ArrowRight size={20} /> Entrar na Central
                    </button>
                </motion.div>
            ) : (

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-2xl font-black italic tracking-tight uppercase text-center bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                        Seu Perfil Profissional
                    </h1>
                    <p className="text-slate-400 text-sm text-center mt-2 font-medium">
                        Precisamos de mais alguns detalhes para configurar sua central de comando.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Especialidade / Área</label>
                        <div className="relative group">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <select
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                className="w-full h-14 bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none appearance-none"
                                required
                            >
                                <option value="" disabled>Selecione sua área de atuação</option>
                                <option value="Fisioterapeuta">Fisioterapeuta</option>
                                <option value="Preparador Físico">Preparador Físico</option>
                                <option value="Médico do Esporte">Médico do Esporte</option>
                                <option value="Nutricionista Esportivo">Nutricionista Esportivo</option>
                                <option value="Clínica / Centro de Treinamento">Clínica / Centro de Treinamento</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Registro / Conselho (Opcional)</label>
                        <div className="relative group">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={councilNumber}
                                onChange={(e) => setCouncilNumber(e.target.value)}
                                placeholder="Ex: CREFITO 12345-F, CRM..."
                                className="w-full h-14 bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                            />
                        </div>
                        <p className="text-[9px] text-slate-500 px-2 pt-1 font-medium">Isso ajuda a passar mais credibilidade aos seus atletas vinculados.</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                            <p className="text-red-500 text-xs font-bold uppercase tracking-wider">{error}</p>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !specialty}
                        className="w-full flex items-center justify-center gap-2 h-14 bg-blue-500 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Entrar na Central</>}
                    </button>
                </form>
            </motion.div>
            )}
        </div>
    );
}
