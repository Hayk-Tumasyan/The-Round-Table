import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tournament } from '../types';
import { getTournaments } from '../services/tournamentService';
import { useAuth } from '../context/AuthContext';
import { Trophy, Calendar, MapPin, Coins, Plus, ShieldAlert, Loader2, ExternalLink } from 'lucide-react';

const Tournaments: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getTournaments();
        setTournaments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0f0a08]"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /><p className="medieval-font text-amber-500 uppercase tracking-widest">{t('common.loading')}</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-12 bg-[#1c120d] border border-zinc-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-600/5 blur-[100px] rounded-full"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-amber-600 rounded-lg flex items-center justify-center shadow-lg border border-amber-500/50 lantern-glow"><Trophy className="w-10 h-10 text-[#0f0a08]" /></div>
          <div><h1 className="text-4xl font-bold medieval-font text-zinc-100 uppercase tracking-tight">{t('tournaments.title')}</h1><p className="text-zinc-500 text-sm italic mt-1">{t('tournaments.subtitle')}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="bg-[#1c120d] border border-zinc-800 rounded-xl overflow-hidden shadow-xl hover:border-amber-600/30 transition-all group">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 border text-[10px] font-bold uppercase tracking-widest rounded ${tournament.status === 'Upcoming' ? 'bg-amber-900/20 border-amber-900/30 text-amber-500' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'}`}>
                  {tournament.status}
                </span>
              </div>

              <h3 className="text-2xl font-bold medieval-font text-zinc-100 mb-4 group-hover:text-amber-500 transition-colors uppercase tracking-wide">
                {t(`tournaments.events.${tournament.id}.title`, { defaultValue: tournament.title })}
              </h3>
              <p className="text-zinc-400 text-sm italic mb-8 leading-relaxed">
                "{t(`tournaments.events.${tournament.id}.desc`, { defaultValue: tournament.description })}"
              </p>

              <div className="space-y-4 border-t border-zinc-800/50 pt-6">
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500"><Calendar className="w-4 h-4 text-amber-600" /><span>{tournament.date}</span></div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>{tournament.location}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-amber-500"><Coins className="w-4 h-4" /><span>{tournament.prize}</span></div>
              </div>
            </div>
            
            <div className="px-8 py-4 bg-[#160f0c] border-t border-zinc-800/50 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 block">Status: {tournament.status}</span>
              <a href={`#/tournaments/${tournament.id}`} className="px-6 py-2 bg-zinc-800 hover:bg-amber-600 hover:text-[#0f0a08] text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded transition-all shadow-lg flex items-center gap-2 group-hover:bg-amber-600 group-hover:text-[#0f0a08]">
                {t('tournaments.view_details', { defaultValue: 'View Details' })}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tournaments;