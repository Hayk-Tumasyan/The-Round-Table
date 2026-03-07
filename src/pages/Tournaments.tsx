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

  const getGoogleMapsLink = (locationName: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;
  };

  if (loading) return <div className="min-h-[80vh] flex flex-col items-center justify-center bg-citadel-main"><Loader2 className="w-10 h-10 text-citadel-accent animate-spin" /><p className="medieval-font text-citadel-accent uppercase tracking-widest">{t('common.loading')}</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-12 bg-citadel-card border border-citadel-border rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-citadel-accent/5 blur-[100px] rounded-full"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-citadel-accent rounded-lg flex items-center justify-center shadow-lg border border-citadel-accent/50 lantern-glow"><Trophy className="w-10 h-10 text-citadel-main" /></div>
          <div><h1 className="text-4xl font-bold medieval-font text-citadel-steel uppercase tracking-tight">{t('tournaments.title')}</h1><p className="text-citadel-muted text-sm italic mt-1">{t('tournaments.subtitle')}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="bg-citadel-card border border-citadel-border rounded-xl overflow-hidden shadow-xl hover:border-citadel-accent/30 transition-all group">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 border text-[10px] font-bold uppercase tracking-widest rounded ${tournament.status === 'Upcoming' ? 'bg-citadel-accent/10 border-citadel-accent/30 text-citadel-accent' : 'bg-citadel-main text-citadel-muted border-citadel-border'}`}>
                  {tournament.status}
                </span>
              </div>

              <h3 className="text-2xl font-bold medieval-font text-citadel-steel mb-4 group-hover:text-citadel-accent transition-colors uppercase tracking-wide">
                 {t(`tournaments.events.${tournament.id}.title`, { defaultValue: tournament.title })}
              </h3>
              <p className="text-citadel-muted text-sm italic mb-8 leading-relaxed">
                "{t(`tournaments.events.${tournament.id}.desc`, { defaultValue: tournament.description })}"
              </p>

              <div className="space-y-4 border-t border-citadel-border/50 pt-6">
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-citadel-muted"><Calendar className="w-4 h-4 text-citadel-accent" /><span>{tournament.date}</span></div>
                <a href={getGoogleMapsLink(tournament.location)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-citadel-muted hover:text-citadel-accent transition-colors group/loc">
                  <MapPin className="w-4 h-4 text-citadel-accent" />
                  <span>{tournament.location}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover/loc:opacity-100 transition-opacity" />
                </a>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-citadel-accent"><Coins className="w-4 h-4" /><span>{tournament.prize}</span></div>
              </div>
            </div>
            
            <div className="px-8 py-4 bg-citadel-main/50 border-t border-citadel-border flex justify-between items-center">
              <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-citadel-muted hover:text-citadel-steel transition-colors">View Participants</button>
              {tournament.external_link ? (
                <a href={tournament.external_link} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-citadel-accent hover:bg-amber-500 text-citadel-main text-[10px] font-bold uppercase tracking-[0.2em] rounded transition-all shadow-lg flex items-center gap-2">
                  {t('tournaments.fray_button')} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button className="px-6 py-2 bg-citadel-border cursor-not-allowed text-citadel-muted text-[10px] font-bold uppercase tracking-[0.2em] rounded">Sold Out</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tournaments;