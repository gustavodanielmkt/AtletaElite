import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Target, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login({
    onLogin,
    onNavigateToRegister
}: {
    onLogin: (user: any, role: string) => void,
    onNavigateToRegister: () => void
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError);
                onLogin(user, 'athlete'); // Default fallback
            } else {
                onLogin(user, profile.role || 'athlete');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white relative overflow-hidden font-display">
            {/* Background Decorative Elemements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full"></div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="z-10 w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-12">
                    <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 mb-6 group hover:border-primary/50 transition-all duration-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <Target className="text-primary group-hover:scale-110 transition-transform" size={40} />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Elite Performance</h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] mt-2">Acesse sua Central de Comando</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">E-mail</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="atleta@dominio.com"
                                className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none backdrop-blur-md"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Senha</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none backdrop-blur-md"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-lg text-center animate-pulse uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-xl h-14 bg-primary text-slate-950 text-sm font-black uppercase tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8 overflow-hidden group relative"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Entrar no modo Elite</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {/* BYPASS MODE BUTTONS */}
                    <div className="pt-8 border-t border-slate-900 flex flex-col items-center gap-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Ambiente de Desenvolvimento (Bypass)</p>
                        <div className="flex gap-4 w-full">
                            <button
                                type="button"
                                onClick={() => onLogin({ id: 'mock-1', email: 'atleta@teste.com' }, 'athlete')}
                                className="flex-1 h-12 rounded-xl border border-slate-800 hover:border-primary/50 text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Atleta (Bypass)
                            </button>
                            <button
                                type="button"
                                onClick={() => onLogin({ id: 'mock-2', email: 'fisio@teste.com' }, 'physio')}
                                className="flex-1 h-12 rounded-xl border border-slate-800 hover:border-blue-500/50 text-slate-400 hover:text-blue-500 text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Fisio (Bypass)
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-12 flex flex-col items-center gap-4">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Ainda não tem acesso?</p>
                    <button onClick={onNavigateToRegister} type="button" className="text-primary text-[10px] font-black uppercase tracking-widest hover:brightness-125 transition-all">Criar Conta Modo Elite</button>
                </div>
            </motion.div>
        </div>
    );
}
