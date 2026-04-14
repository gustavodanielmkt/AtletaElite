import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, Loader2, X, Search, UserMinus, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  getClubMembers, addAthleteToClub, removeAthleteFromClub,
  getAthletesNotInClub, readinessColor,
  type ClubMember,
} from '../../services/clubService';
import { getPhysioClubs, type Club } from '../../services/clubService';

type Filter = 'all' | 'ready' | 'attention' | 'alert' | 'no-checkin';

function scoreFilter(member: ClubMember, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'no-checkin') return member.readinessScore === null;
  const s = member.readinessScore;
  if (s === null) return false;
  if (filter === 'ready')     return s >= 80;
  if (filter === 'attention') return s >= 60 && s < 80;
  if (filter === 'alert')     return s < 60;
  return true;
}

export default function ClubDetail({
  clubId,
  navigate,
}: {
  clubId: string;
  navigate: (screen: string, id?: string) => void;
}) {
  const [club, setClub]       = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<Filter>('all');
  const [physioId, setPhysioId] = useState<string | null>(null);

  // Add-athlete modal
  const [showAdd, setShowAdd]   = useState(false);
  const [candidates, setCandidates] = useState<{ id: string; fullName: string; avatarUrl: string | null }[]>([]);
  const [search, setSearch]     = useState('');
  const [adding, setAdding]     = useState(false);

  const load = async (pid: string) => {
    const [clubs, mems] = await Promise.all([
      getPhysioClubs(pid),
      getClubMembers(clubId),
    ]);
    setClub(clubs.find(c => c.id === clubId) ?? null);
    setMembers(mems);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      setPhysioId(session.user.id);
      load(session.user.id);
    });
  }, [clubId]);

  const openAddModal = async () => {
    if (!physioId) return;
    const list = await getAthletesNotInClub(physioId, clubId);
    setCandidates(list);
    setSearch('');
    setShowAdd(true);
  };

  const handleAdd = async (athleteId: string) => {
    setAdding(true);
    await addAthleteToClub(clubId, athleteId);
    if (physioId) await load(physioId);
    setCandidates(prev => prev.filter(c => c.id !== athleteId));
    setAdding(false);
  };

  const handleRemove = async (athleteId: string, athleteName: string) => {
    if (!confirm(`Remover ${athleteName} do clube?`)) return;
    await removeAthleteFromClub(clubId, athleteId);
    setMembers(prev => prev.filter(m => m.athleteId !== athleteId));
  };

  const filtered = members.filter(m => scoreFilter(m, filter));
  const filteredCandidates = candidates.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const FILTERS: { key: Filter; label: string; color: string }[] = [
    { key: 'all',        label: 'Todos',        color: 'text-slate-300' },
    { key: 'ready',      label: 'Prontos',      color: 'text-[#ccff00]' },
    { key: 'attention',  label: 'Atenção',      color: 'text-amber-400' },
    { key: 'alert',      label: 'Alerta',       color: 'text-red-400'   },
    { key: 'no-checkin', label: 'Sem Check-in', color: 'text-slate-500' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-background-dark text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-md border-b border-slate-800 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('clubs-list')} className="size-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold leading-tight">{club?.name ?? '...'}</h1>
            <p className="text-xs text-slate-500">
              {club?.sport && <span className="text-primary mr-2">{club.sport}</span>}
              {members.length} atleta{members.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => physioId && load(physioId)}
            className="size-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            <Plus size={16} />
            Atleta
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {[
            { label: 'Prontos',   count: members.filter(m => (m.readinessScore ?? 0) >= 80).length,  color: 'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20' },
            { label: 'Atenção',   count: members.filter(m => { const s = m.readinessScore; return s !== null && s >= 60 && s < 80; }).length, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
            { label: 'Alerta',    count: members.filter(m => m.readinessScore !== null && m.readinessScore < 60).length, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
            { label: 'Sem C-in',  count: members.filter(m => m.readinessScore === null).length, color: 'bg-slate-800 text-slate-500 border-slate-700' },
          ].map(chip => (
            <span key={chip.label} className={`flex-shrink-0 text-[10px] font-bold border px-3 py-1 rounded-full ${chip.color}`}>
              {chip.count} {chip.label}
            </span>
          ))}
        </div>
      </header>

      {/* Filter tabs */}
      <div className="flex overflow-x-auto hide-scrollbar px-4 gap-6 py-3 border-b border-slate-800">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${
              filter === f.key ? `border-current ${f.color}` : 'border-transparent text-slate-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <main className="flex-1 px-4 py-4">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Users size={40} className="text-slate-700" />
            <p className="text-slate-500 text-sm">
              {members.length === 0
                ? 'Nenhum atleta no clube. Adicione atletas para começar.'
                : 'Nenhum atleta neste filtro.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {filtered.map(member => {
            const rc = readinessColor(member.readinessScore);
            return (
              <div
                key={member.athleteId}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 relative"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(member.athleteId, member.athleteName)}
                  className="absolute top-2 right-2 size-7 flex items-center justify-center text-slate-700 hover:text-red-400 transition-colors"
                >
                  <UserMinus size={14} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                    <img
                      src={member.athleteAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                      alt={member.athleteName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight truncate">{member.athleteName}</p>
                    {(member.jerseyNumber || member.position) && (
                      <p className="text-[10px] text-slate-500 truncate">
                        {member.jerseyNumber ? `#${member.jerseyNumber}` : ''}
                        {member.jerseyNumber && member.position ? ' · ' : ''}
                        {member.position ?? ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Readiness score */}
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${rc.bg}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${rc.text}`}>{rc.label}</span>
                  <span className={`text-xl font-black ${rc.text}`}>
                    {member.readinessScore !== null ? member.readinessScore : '—'}
                  </span>
                </div>

                {/* Details */}
                {member.readinessScore !== null && (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Dor: {member.painLevel ?? '—'}/10</span>
                    <span className="capitalize">{member.fatigue ?? '—'}</span>
                  </div>
                )}

                {/* Member status badge */}
                {member.memberStatus !== 'active' && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-center ${
                    member.memberStatus === 'injured' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {member.memberStatus === 'injured' ? 'Lesionado' : 'Suspenso'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Athlete Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl w-full max-w-lg p-5 pb-10 shadow-2xl max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Adicionar Atleta</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-500"><X size={22} /></button>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar atleta..."
                className="w-full h-11 bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 text-sm focus:border-primary/50 outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredCandidates.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-8">
                  {candidates.length === 0
                    ? 'Todos os atletas já estão no clube.'
                    : 'Nenhum atleta encontrado.'}
                </p>
              )}
              {filteredCandidates.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                  <div className="size-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                    <img
                      src={c.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                      alt={c.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="flex-1 text-sm font-bold">{c.fullName}</p>
                  <button
                    onClick={() => handleAdd(c.id)}
                    disabled={adding}
                    className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    {adding ? <Loader2 size={14} className="animate-spin" /> : 'Adicionar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
