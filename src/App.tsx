import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RoutePath, User } from './types';
import Home from './pages/Home';
import Community from './pages/Community';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import PostDetails from './pages/PostDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import Tournaments from './pages/Tournaments';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop'; 
import { ShieldCheck, LogOut, ShoppingBag, Globe, Sun, Moon, Menu, X as CloseIcon } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublicKey);

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to={RoutePath.Login} />;
  if (role && user.role !== role) return <Navigate to={RoutePath.Home} />;
  return <>{children}</>;
};

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path ? 'text-citadel-accent border-b-2 border-citadel-accent' : 'text-citadel-muted hover:text-citadel-accent';
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-citadel-card/95 backdrop-blur-lg border-b border-citadel-border px-4 md:px-8 py-4 flex justify-between items-center shadow-2xl">
      <Link to="/" className="flex items-center space-x-3 shrink-0" onClick={() => setIsMenuOpen(false)}>
        <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-600 rounded-lg flex items-center justify-center shadow-lg lantern-glow">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-[#1c120d]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 11a1 1 0 11-2 0H2a1 1 0 110-2h1a1 1 0 110 2zm1.464 4.95a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707z" /></svg>
        </div>
        <span className="text-lg md:text-2xl font-bold medieval-font tracking-widest text-citadel-steel uppercase">The Round <span className="text-citadel-accent">Table</span></span>
      </Link>
      
      <div className="hidden lg:flex space-x-8 xl:space-x-10 font-bold uppercase text-xs tracking-[0.2em]">
        <Link to="/" className={`${isActive('/')} transition-all duration-300 py-1`}>{t('nav.chambers')}</Link>
        <Link to="/community" className={`${isActive('/community')} transition-all duration-300 py-1`}>{t('nav.great_hall')}</Link>
        <Link to="/shop" className={`${isActive('/shop')} transition-all duration-300 py-1`}>{t('nav.armory')}</Link>
        <Link to="/tournaments" className={`${isActive('/tournaments')} transition-all duration-300 py-1`}>{t('nav.tournaments')}</Link>
        {user?.role === 'admin' && (<Link to={RoutePath.Admin} className={`${isActive(RoutePath.Admin)} transition-all duration-300 py-1 flex items-center gap-2`}><ShieldCheck className="w-3 h-3 text-citadel-accent" />{t('nav.admin')}</Link>)}
      </div>

      <div className="flex items-center space-x-2 md:space-x-6">
        <button onClick={toggleTheme} className="p-2 rounded-lg bg-citadel-main border border-citadel-border text-citadel-accent hover:shadow-lg transition-all hidden sm:block">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="hidden sm:flex items-center gap-2 border-r border-citadel-border pr-4">
          <Globe className="w-3 h-3 text-citadel-muted" />
          <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language} className="bg-transparent text-[10px] text-citadel-muted font-bold uppercase tracking-widest outline-none">
            <option value="en">EN</option><option value="hy">AM</option><option value="ru">RU</option>
          </select>
        </div>

        <Link to={RoutePath.Checkout} className="relative group cursor-pointer p-2" onClick={() => setIsMenuOpen(false)}>
          <ShoppingBag className="w-5 h-5 text-citadel-muted group-hover:text-citadel-accent transition-colors" />
          {itemCount > 0 && <span className="absolute top-0 right-0 bg-red-700 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-citadel-card">{itemCount}</span>}
        </Link>

        {user ? (
          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-citadel-border">
            <Link to="/profile" className="flex flex-col items-end group">
              <span className="text-[10px] font-bold text-citadel-steel uppercase tracking-widest group-hover:text-citadel-accent transition-colors">{user.username}</span>
              <span className="text-[8px] text-citadel-accent uppercase tracking-[0.2em]">{user.role === 'admin' ? t('common.hand_of_the_king') : t('common.knight')}</span>
            </Link>
            <button onClick={logout} className="p-2 text-citadel-muted hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-4 md:space-x-6 lg:space-x-8">
            <Link to="/login" className="text-citadel-muted hover:text-citadel-steel font-bold text-[10px] md:text-xs uppercase tracking-widest">
              {t('common.login')}
            </Link>
            {/* FIXED: Restored the Register Button with refined styling */}
            <Link to="/register" className="hidden md:block px-5 py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded-md text-[10px] uppercase tracking-widest border border-red-700/50 transition-all shrink-0">
              {t('common.register')}
            </Link>
          </div>
        )}

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-citadel-accent border border-citadel-border rounded-lg bg-citadel-main">
          {isMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-[40] bg-citadel-main animate-in slide-in-from-right lg:hidden overflow-y-auto">
          <div className="p-8 space-y-8">
            <div className="flex flex-col space-y-6 font-bold uppercase text-lg tracking-[0.2em]">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className={`${location.pathname === '/' ? 'text-citadel-accent' : 'text-citadel-muted'}`}>{t('nav.chambers')}</Link>
              <Link to="/community" onClick={() => setIsMenuOpen(false)} className={`${location.pathname === '/community' ? 'text-citadel-accent' : 'text-citadel-muted'}`}>{t('nav.great_hall')}</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className={`${location.pathname === '/shop' ? 'text-citadel-accent' : 'text-citadel-muted'}`}>{t('nav.armory')}</Link>
              <Link to="/tournaments" onClick={() => setIsMenuOpen(false)} className={`${location.pathname === '/tournaments' ? 'text-citadel-accent' : 'text-citadel-muted'}`}>{t('nav.tournaments')}</Link>
              {user?.role === 'admin' && (<Link to={RoutePath.Admin} onClick={() => setIsMenuOpen(false)} className="text-red-700 flex items-center gap-2"><ShieldCheck className="w-5 h-5" />{t('nav.admin')}</Link>)}
            </div>

            <div className="pt-8 border-t border-citadel-border space-y-6">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold uppercase text-citadel-muted tracking-widest">Theme</span>
                 <button onClick={toggleTheme} className="p-3 rounded-xl bg-citadel-card border border-citadel-border text-citadel-accent">
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold uppercase text-citadel-muted tracking-widest">Language</span>
                 <div className="flex gap-2">
                    {['en', 'hy', 'ru'].map(lang => (
                      <button key={lang} onClick={() => changeLanguage(lang)} className={`px-4 py-2 rounded-lg border uppercase text-xs font-bold ${i18n.language === lang ? 'bg-citadel-accent text-citadel-main border-citadel-accent' : 'bg-citadel-card text-citadel-muted border-citadel-border'}`}>
                        {lang}
                      </button>
                    ))}
                 </div>
               </div>
            </div>

            <div className="pt-8">
              {user ? (
                <div className="space-y-4">
                   <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block p-4 bg-citadel-card rounded-xl border border-citadel-border">
                      <p className="text-citadel-steel font-bold uppercase text-sm">{user.username}</p>
                      <p className="text-citadel-accent text-[10px] uppercase tracking-widest">{t('common.knight')}</p>
                   </Link>
                   <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full py-4 text-red-500 font-bold uppercase text-xs tracking-widest border border-red-900/20 rounded-xl">
                     {t('common.logout')}
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <Link to="/login" onClick={() => setIsMenuOpen(false)} className="py-4 text-center text-citadel-muted font-bold uppercase text-xs border border-citadel-border rounded-xl">{t('common.login')}</Link>
                   <Link to="/register" onClick={() => setIsMenuOpen(false)} className="py-4 text-center bg-red-800 text-white font-bold uppercase text-xs rounded-xl">{t('common.register')}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-citadel-main border-t border-citadel-border py-12 md:py-20 px-6 md:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center sm:text-left">
        <div className="sm:col-span-2 lg:col-span-2">
          <h3 className="text-2xl font-bold medieval-font text-red-700 mb-6">The Round Table</h3>
          <p className="text-citadel-muted max-w-sm leading-relaxed text-sm mx-auto sm:mx-0">{t('footer.description')}</p>
        </div>
        <div>
          <h4 className="font-bold text-citadel-steel uppercase text-xs tracking-widest mb-6">{t('footer.provinces')}</h4>
          <ul className="space-y-3 text-citadel-muted text-sm">
            <li><Link to="/community" className="hover:text-citadel-accent transition-colors">{t('nav.great_hall')}</Link></li>
            <li><Link to="/shop" className="hover:text-citadel-accent transition-colors">{t('nav.armory')}</Link></li>
            <li><Link to="/about" className="hover:text-citadel-accent transition-colors">{t('footer.about_us')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-citadel-steel uppercase text-xs tracking-widest mb-6">{t('footer.decrees')}</h4>
          <ul className="space-y-3 text-citadel-muted text-sm">
            <li><Link to="/contact" className="hover:text-citadel-accent transition-colors">{t('footer.contact')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-citadel-border/50 flex flex-col md:flex-row justify-between items-center text-citadel-muted text-[10px] uppercase tracking-[0.2em] gap-6">
        <p>&copy; {new Date().getFullYear()} The Round Table . {t('footer.rights')}</p>
        <p className="mt-4 md:mt-0">{t('footer.motto')}</p>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Elements stripe={stripePromise}>
            <Router>
              <ScrollToTop /> 
              <div className="min-h-screen flex flex-col selection:bg-citadel-accent/30 selection:text-citadel-accent bg-citadel-main text-citadel-steel overflow-x-hidden">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path={RoutePath.Home} element={<Home />} />
                    <Route path={RoutePath.Community} element={<Community />} />
                    <Route path={RoutePath.Shop} element={<Shop />} />
                    <Route path={RoutePath.Tournaments} element={<Tournaments />} />
                    <Route path={RoutePath.ProductDetails} element={<ProductDetails />} />
                    <Route path={RoutePath.PostDetails} element={<PostDetails />} />
                    <Route path={RoutePath.Login} element={<Login />} />
                    <Route path={RoutePath.Register} element={<Register />} />
                    <Route path={RoutePath.Checkout} element={<Checkout />} />
                    <Route path={RoutePath.Orders} element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path={RoutePath.Admin} element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </Elements>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;