import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tournament } from '../types';
import { getTournamentById, joinTournament, getTournamentParticipants } from '../services/tournamentService';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Trophy, Coins, ArrowLeft, Loader2, Users } from 'lucide-react';

const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<{ userId: string; username: string; joinedAt: any }[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await getTournamentById(id);
        setTournament(data);
        const participantData = await getTournamentParticipants(id);
        setParticipants(participantData);
      } catch (err: any) {
        console.error("Failed to load tournament:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!tournament?.id) return;

    setJoining(true);
    setErrorMsg('');
    try {
      await joinTournament(tournament.id, user.id, user.username);
      const participantData = await getTournamentParticipants(tournament.id);
      setParticipants(participantData);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'permission-denied') {
        setErrorMsg('The King has not granted permission to join (Firebase Rules Error).');
      } else {
        setErrorMsg('A magical interference prevented your registration.');
      }
    } finally {
      setJoining(false);
    }
  };

  const hasJoined = user && participants.some(p => p.userId === user.id);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0f0a08]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="medieval-font text-amber-500 uppercase tracking-widest">{t('common.loading')}</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0f0a08] text-white space-y-4">
        <h2 className="text-2xl medieval-font text-red-500 uppercase">{t('tournaments.lost_to_time', 'Tournament Lost to Time')}</h2>
        <button onClick={() => navigate('/tournaments')} className="text-zinc-400 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-bold">{t('tournaments.return_grounds', 'Return to Tourney Grounds')}</button>
      </div>
    );
  }

  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(tournament.location)}&output=embed`;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <button 
        onClick={() => navigate('/tournaments')}
        className="flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors mb-8 text-[10px] uppercase font-bold tracking-widest group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('common.back')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#1c120d] border border-zinc-800 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 blur-[100px] rounded-full pointer-events-none"></div>
             
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
               <div>
                  <span className={`inline-block px-4 py-1.5 border mb-6 text-[10px] font-bold uppercase tracking-widest rounded ${tournament.status === 'Upcoming' ? 'bg-amber-900/20 border-amber-900/30 text-amber-500' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'}`}>
                    {tournament.status}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-bold medieval-font text-zinc-100 mb-6 uppercase tracking-wider leading-tight">
                    {t(`tournaments.events.${tournament.id}.title`, { defaultValue: tournament.title })}
                  </h1>
                  
                  <div className="flex flex-wrap gap-6 mb-8 border-y border-zinc-800/50 py-6">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-zinc-400"><Calendar className="w-5 h-5 text-amber-600" /><span>{tournament.date}</span></div>
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-zinc-400"><MapPin className="w-5 h-5 text-amber-600" /><span>{tournament.location}</span></div>
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-amber-500"><Coins className="w-5 h-5" /><span>{tournament.prize}</span></div>
                  </div>

                  <p className="text-zinc-400 text-base md:text-lg italic leading-relaxed mb-10">
                    "{t(`tournaments.events.${tournament.id}.desc`, { defaultValue: tournament.description })}"
                  </p>
               </div>
               
               {/* Participate Button */}
               <div className="shrink-0 w-full md:w-auto flex flex-col items-center">
                 {hasJoined ? (
                   <div className="bg-amber-900/20 text-amber-500 border border-amber-900/30 px-8 py-4 rounded-xl text-center shadow-lg w-full">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{t('tournaments.status', 'Status')}</p>
                     <p className="medieval-font text-xl">{t('tournaments.sword_sworn', 'Sword Sworn')}</p>
                   </div>
                 ) : tournament.status === 'Upcoming' ? (
                   <>
                     <button 
                       onClick={handleJoin} 
                       disabled={joining}
                       className="w-full md:w-auto bg-amber-600 hover:bg-amber-500 text-[#0f0a08] px-10 py-5 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                     >
                       {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
                       {t('tournaments.fray_button')}
                     </button>
                     {errorMsg && (
                       <p className="text-red-500 text-xs mt-3 font-bold text-center max-w-[200px]">{errorMsg}</p>
                     )}
                   </>
                 ) : (
                   <div className="bg-zinc-900/50 text-zinc-500 border border-zinc-800 px-8 py-4 rounded-xl text-center shadow-lg w-full">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{t('tournaments.status', 'Status')}</p>
                     <p className="medieval-font text-xl">{t('tournaments.concluded', 'Concluded')}</p>
                   </div>
                 )}
               </div>
             </div>
          </div>

          {/* Map Section */}
          <div className="bg-[#1c120d] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h3 className="text-zinc-100 font-bold uppercase tracking-widest text-sm">{t('tournaments.tourney_grounds', 'Tourney Grounds')}</h3>
            </div>
            <div className="w-full h-[400px] md:h-[500px]">
              <iframe 
                src={mapEmbedUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Sidebar: Participants */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-[#1c120d] border border-amber-900/30 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col items-center justify-center border-b border-zinc-800/50 pb-6 mb-6">
              <Users className="w-10 h-10 text-amber-600 mb-4" />
              <h3 className="text-amber-500 font-bold uppercase tracking-widest text-sm text-center">{t('tournaments.combatants_list', 'Combatants List')}</h3>
              <p className="text-zinc-500 text-[10px] mt-2 font-bold tracking-widest uppercase">{participants.length} {t('tournaments.knights_sworn', 'Knights sworn')}</p>
            </div>
            
            {participants.length === 0 ? (
              <p className="text-center text-zinc-500 italic text-sm">{t('tournaments.empty_roster', 'The roster is empty. Be the first to pledge your sword.')}</p>
            ) : (
              <ul className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {participants.map((p, idx) => (
                  <li key={p.id} className="flex items-center gap-4 bg-[#0f0a08] p-4 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                       <span className="medieval-font text-zinc-500">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-zinc-200 font-bold uppercase text-xs tracking-wider">{p.username}</p>
                      <p className="text-amber-600/50 text-[9px] uppercase tracking-widest mt-1">
                        {t('tournaments.pledged_on', 'Pledged on')} {p.joinedAt?.toDate?.()?.toLocaleDateString() || "Unknown Date"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TournamentDetails;
