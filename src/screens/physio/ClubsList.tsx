import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, Shield, Trash2, Loader2, X, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getPhysioClubs, createClub, deleteClub, type Club } from '../../services/clubService';

export default function ClubsList({ navigate }: { navigate: (screen: string, id?: string) => void }) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubSport, setClubSport] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [physioId, setPhysioId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      setPhysioId(session.user.id);
      const list = await getPhysioClubs(session.user.id);
      setClubs(list);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!clubName.trim() || !physioId) return;
    setCreating(true);
    setCreateError(null);
    const { club, error } = await createClub(physioId, { name: clubName, sport: clubSport });
    setCreating(false);
    if (error) { setCreateError(error); return; }
    if (club) setClubs(prev => [club, ...prev]);
    setShowModal(false);
    setClubName('');
    setClubSport('');
  };

  const handleDelete = async (clubId: string) => {
    if (!confirm('Remover este clube? Esta ação não pode ser desfeita.')) return;
    await deleteClub(clubId);
    setClubs(prev => prev.filter(c => c.id !== clubId));
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-background-dark text-slate-100">
      <header className="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('physio-dashboard')} className="size-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold leading-tight">Meus Clubes</h1>
          <p className="text-xs text-slate-500">{clubs.length} clube{clubs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold"
        >
          <Plus size={16} />
          Novo
        </button>
      </header>

      <main className="flex-1 px-4 py-6">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        )}

        {!loading && clubs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Shield size={48} className="text-slate-700" />
            <p className="text-lg font-bold text-slate-300">Nenhum clube ainda</p>
            <p className="text-sm text-slate-500">Crie seu primeiro clube para monitorar o estado dos atletas.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold"
            >
              <Plus size={16} />
              Criar clube
            </button>
          </div>
        )}

        <div className="space-y-3">
          {clubs.map(club => (
            <div
              key={club.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield size={22} className="text-primary" />
              </div>
              <button
                onClick={() => navigate('club-detail', club.id)}
                className="flex-1 text-left"
              >
                <p className="font-bold text-base leading-tight">{club.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  {club.sport && <span className="text-xs text-primary font-medium">{club.sport}</span>}
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Users size={11} />
                    {club.memberCount ?? 0} atleta{(club.memberCount ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate('club-detail', club.id)}
                  className="size-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => handleDelete(club.id)}
                  className="size-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create Club Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl w-full max-w-lg p-6 pb-10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Criar Clube</h2>
              <button onClick={() => { setShowModal(false); setCreateError(null); }} className="text-slate-500">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome do Clube *</label>
                <input
                  autoFocus
                  value={clubName}
                  onChange={e => setClubName(e.target.value)}
                  placeholder="Ex: Flamengo Sub-20"
                  className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl px-4 text-sm focus:border-primary/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Modalidade</label>
                <input
                  value={clubSport}
                  onChange={e => setClubSport(e.target.value)}
                  placeholder="Ex: Futebol, Basquete, Natação..."
                  className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl px-4 text-sm focus:border-primary/50 outline-none transition-all"
                />
              </div>
              {createError && <p className="text-xs text-red-400 font-bold">{createError}</p>}
              <button
                onClick={handleCreate}
                disabled={creating || !clubName.trim()}
                className="w-full h-12 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {creating ? 'Criando...' : 'Criar Clube'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
