import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import { RoutePath } from '../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    setIsLoggingIn(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(RoutePath.Home);
    } catch (err: any) {
      console.error("Login Error Code:", err.code);

      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password'
      ) {
        setError(t('auth.error_invalid'));
      } else if (err.code === 'auth/invalid-email') {
        setError(t('auth.error_bad_email'));
      } else if (err.code === 'auth/too-many-requests') {
        setError(t('auth.error_too_many'));
      } else {
        setError(t('auth.error_magical') + err.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      {/* FIXED: Changed max-md to max-w-md to stop the stretching */}
      <div className="w-full max-w-md bg-[#1c120d] border border-zinc-800 rounded-lg p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
        
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-3xl font-bold medieval-font text-zinc-100 mb-2 uppercase tracking-widest">
            {t('auth.login_title')}
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest italic">
            {t('auth.login_subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 px-1">
                {t('auth.email_label')}
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className="w-full bg-[#0f0a08] border border-zinc-800 rounded px-5 py-4 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-amber-600/50 transition-all text-sm"
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
                className="w-full bg-[#0f0a08] border border-zinc-800 rounded px-5 py-4 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-amber-600/50 transition-all text-sm"
                required
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-[#0f0a08] font-bold uppercase text-xs tracking-[0.3em] rounded transition-all shadow-2xl shadow-amber-950/50 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoggingIn ? t('auth.logging_in') : t('auth.submit_login')}
          </button>
        </form>

        <div className="mt-12 text-center text-[10px] uppercase tracking-widest relative z-10">
          <p className="text-zinc-600">
            {t('auth.not_member')}{' '}
            <Link to="/register" className="text-amber-500 hover:text-amber-400 font-bold ml-1">
              {t('auth.take_vow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;