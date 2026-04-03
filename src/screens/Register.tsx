import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Target, Lock, Mail, Loader2, User, ArrowRight, ArrowLeft, HeartPulse, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register({
    onNavigateToLogin,
    onRegisterSuccess
}: {
    onNavigateToLogin: () => void,
    onRegisterSuccess?: (user: any, role: string) => void
}) {
    const [step, setStep] = useState(1);

    // Form data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'athlete' | 'physio'>('athlete');
    const [inviteCode, setInviteCode] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. SignUp user in Auth
        const { data: { user }, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: role
                }
            }
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // 2. Insert into Profiles (Trigger might do this, but we update the role anyway)
        if (user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    role: role,
                    full_name: name,
                    // If inviteCode is provided, we would ideally link here or set status to pending.
                    // For now, we simulate limited mode if no code is provided.
                });

            if (profileError) {
                console.error("Error updating profile role:", profileError);
            }

            if (role === 'athlete' && !inviteCode) {
                localStorage.setItem('elite_is_limited', 'true');
            } else {
                localStorage.removeItem('elite_is_limited');
            }

            if (onRegisterSuccess) {
                onRegisterSuccess(user, role);
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white relative overflow-hidden font-display">
            {/* Background Decorative Elemements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[150px] rounded-full"></div>

            <div className="z-10 w-full max-w-md">
                <div className="flex flex-col items-center mb-10">
                    <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <Target className="text-primary" size={32} />
                    </div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Atleta Elite</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                        {step === 1 && "Crie sua conta"}
                        {step === 2 && "Selecione seu Perfil"}
                        {step === 3 && (role === 'athlete' ? "Vínculo Clínico" : "Finalizar Cadastro")}
                    </p>
                </div>

                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'w-4 bg-slate-800'}`} />
                    ))}
                </div>

                <form onSubmit={step === 3 ? handleRegister : (e) => { e.preventDefault(); setStep(step + 1); }} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Nome Completo</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: João Silva" className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none" required />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">E-mail</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="atleta@dominio.com" className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none" required />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Senha</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none" required minLength={6} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" onClick={() => setRole('athlete')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${role === 'athlete' ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'}`}>
                                        <HeartPulse size={40} className={role === 'athlete' ? 'text-primary' : ''} />
                                        <span className="text-sm font-black uppercase tracking-widest">Atleta</span>
                                    </button>
                                    <button type="button" onClick={() => setRole('physio')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${role === 'physio' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'}`}>
                                        <Building2 size={40} className={role === 'physio' ? 'text-blue-500' : ''} />
                                        <span className="text-sm font-black uppercase tracking-widest text-center">Profissional / Clínica</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-6">
                                {role === 'athlete' ? (
                                    <>
                                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                                            <h3 className="font-bold text-sm mb-2 text-primary">Tem uma clínica parceira?</h3>
                                            <p className="text-xs text-slate-400 leading-relaxed">Insira o código de convite do seu fisioterapeuta para destravar seu plano de treino e análises completas.</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Código de Convite (Opcional)</label>
                                            <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="Ex: ELITE-2026" className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl px-4 text-sm font-bold tracking-widest uppercase focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none text-center" />
                                        </div>
                                        {!inviteCode && (
                                            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
                                                *O app funcionará em <span className="text-amber-500">Módulo Limitado</span> até que um vínculo seja feito.
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 text-center">
                                        <Building2 size={48} className="text-blue-500 mx-auto mb-4" strokeWidth={1.5} />
                                        <h3 className="font-bold text-sm mb-2 text-blue-500">Configuração de Clínica</h3>
                                        <p className="text-xs text-slate-400 leading-relaxed">Após o cadastro, você poderá criar convites para os seus atletas e gerenciar os planos de reabilitação e treino deles na sua Central.</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-lg text-center animate-pulse uppercase tracking-widest">
                                        {error}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-3 mt-8 pt-4">
                        {step > 1 && (
                            <button type="button" onClick={() => setStep(step - 1)} className="w-14 h-14 flex items-center justify-center shrink-0 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl h-14 text-slate-950 text-sm font-black uppercase tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative ${role === 'physio' && step === 3 ? 'bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)]' : 'bg-primary'}`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>{step === 3 ? 'Finalizar Cadastro' : 'Continuar'}</span>
                                    {step < 3 && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-12 flex flex-col items-center gap-4">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Já possui uma conta?</p>
                    <button onClick={onNavigateToLogin} type="button" className="text-primary text-[10px] font-black uppercase tracking-widest hover:brightness-125 transition-all">Fazer Login Agora</button>
                </div>
            </div>
        </div>
    );
}
