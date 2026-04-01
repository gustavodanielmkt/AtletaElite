import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditProfile({ navigate }: { navigate: (screen: string) => void }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [fullName, setFullName] = useState('');
    const [sport, setSport] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [dominantSide, setDominantSide] = useState('Direito');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        async function fetchProfile() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (data) {
                    setFullName(data.full_name || '');
                    setSport(data.sport || '');
                    setAge(data.age?.toString() || '');
                    setHeight(data.height?.toString() || '');
                    setWeight(data.weight?.toString() || '');
                    setDominantSide(data.dominant_side || 'Direito');
                    setAvatarUrl(data.avatar_url || '');
                }
            }
            setLoading(false);
        }
        fetchProfile();
    }, []);

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            setError(null);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você precisa selecionar uma imagem para enviar.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);
        } catch (error: any) {
            setError(error.message || 'Erro ao fazer upload da imagem.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            setError("Sessão não encontrada.");
            setSaving(false);
            return;
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                sport,
                age: parseInt(age),
                height: parseInt(height),
                weight: parseFloat(weight),
                dominant_side: dominantSide,
                avatar_url: avatarUrl
            })
            .eq('id', session.user.id);

        if (updateError) {
            setError("Falha ao salvar as alterações.");
            console.error(updateError);
            setSaving(false);
        } else {
            navigate('athlete-profile');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pb-24 bg-slate-950 text-white font-display">
            <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <button onClick={() => navigate('athlete-profile')} className="flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-bold leading-tight flex-1 text-center">Editar Perfil</h2>
                <div className="w-10"></div> {/* Spacer balance */}
            </header>

            <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
                <form onSubmit={handleSave} className="space-y-6">

                    {/* Foto de Perfil */}
                    <section className="flex flex-col items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <div className="size-24 rounded-full overflow-hidden border-2 border-primary p-1 mb-4">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                                <img
                                    src={avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="w-full space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Anexar Foto</label>
                            <div className="relative group flex items-center gap-4">
                                <input
                                    type="file"
                                    id="avatar"
                                    accept="image/*"
                                    onChange={uploadAvatar}
                                    disabled={uploading}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="avatar"
                                    className="flex-1 cursor-pointer flex items-center justify-center h-12 bg-slate-900 border border-slate-700 hover:border-primary/50 text-sm font-medium focus:border-primary/50 transition-all outline-none rounded-xl"
                                >
                                    {uploading ? <Loader2 className="animate-spin text-primary" size={18} /> : 'Selecionar Arquivo'}
                                </label>
                            </div>
                            <p className="text-[9px] text-slate-500 text-center mt-2 px-4">Selecione uma imagem do seu dispositivo para usar no perfil.</p>
                        </div>
                    </section>

                    {/* Dados Pessoais */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">Informações Básicas</h3>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Nome Completo</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full h-12 bg-slate-900 border border-slate-700 rounded-xl px-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Esporte | Posição</label>
                            <input
                                type="text"
                                value={sport}
                                onChange={(e) => setSport(e.target.value)}
                                className="w-full h-12 bg-slate-900 border border-slate-700 rounded-xl px-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Idade</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full h-12 bg-slate-900 border border-slate-700 rounded-xl px-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Altura (cm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="w-full h-12 bg-slate-900 border border-slate-700 rounded-xl px-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Peso (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full h-12 bg-slate-900 border border-slate-700 rounded-xl px-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Lado</label>
                                <select
                                    value={dominantSide}
                                    onChange={(e) => setDominantSide(e.target.value)}
                                    className="w-full h-12 bg-slate-900 border border-slate-700 rounded-xl px-4 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none appearance-none"
                                >
                                    <option value="Direito">Direito</option>
                                    <option value="Esquerdo">Esquerdo</option>
                                    <option value="Ambidestro">Ambidestro</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-lg text-center uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 rounded-xl h-14 bg-primary text-slate-950 text-sm font-black uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Salvar Alterações</>}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
