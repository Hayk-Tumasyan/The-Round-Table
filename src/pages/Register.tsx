import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Hook for translation
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase'; 
import { RoutePath } from '../types';
import { useAuth } from '../context/AuthContext';
import { createUserDossier } from '../services/userService';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize translation
  const { updateUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(''); 
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName: nickname });
      
      // Create the Firestore Dossier with localized defaults
      await createUserDossier({
        uid: userCredential.user.uid,
        display_name: nickname,
        role: email === 'hayko.tumasyan2004@gmail.com' ? 'admin' : 'user',
        bio: "A new traveler in the realm.",
        preferred_lang: "en",
        avatar_url: "",
        isBanned: false
      });

      if (updateUser) {
        updateUser({ username: nickname });
      }
      
      navigate(RoutePath.Home);
    } catch (err: any) {
      setError(t('auth.error_magical') + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg bg-[#1c120d] border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold medieval-font text-white mb-2 uppercase tracking-widest">
            {t('auth.register_title')}
          </h1>
          <p className="text-zinc-500 text-xs uppercase italic">
            {t('auth.register_subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 text-red-500 text-[10px] font-bold uppercase rounded">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 px-1">
              {t('auth.nickname_label')}
            </label>
            <input 
              type="text" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              placeholder={t('auth.nickname_placeholder')} 
              className="w-full bg-[#0f0a08] border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-amber-600 transition-all text-sm" 
              required 
            />
          </div>

          <div>
            <label className="block text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 px-1">
              {t('auth.email_label')}
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder={t('auth.email_placeholder')} 
              className="w-full bg-[#0f0a08] border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-amber-600 transition-all text-sm" 
              required 
            />
          </div>

          <div>
            <label className="block text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 px-1">
              {t('auth.password_label')}
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder={t('auth.password_placeholder')} 
              className="w-full bg-[#0f0a08] border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-amber-600 transition-all text-sm" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-[#0f0a08] font-bold rounded-xl transition-all shadow-xl uppercase text-xs disabled:opacity-50 tracking-[0.2em]"
          >
            {isSubmitting ? t('auth.registering') : t('auth.submit_register')}
          </button>
        </form>

        <div className="mt-8 text-center">
           <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
             {t('auth.is_member')}{' '}
             <Link to="/login" className="text-amber-500 font-bold hover:text-amber-400 ml-1">
                {t('common.login')}
             </Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Register;