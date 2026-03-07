import React from 'react';
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
import { ShieldCheck, LogOut, ShoppingBag, Globe } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

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
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-400 hover:text-amber-200';
  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  return (
    <nav className="sticky top-0 z-50 bg-[#1c120d]/95 backdrop-blur-lg border-b border-zinc-800/50 px-8 py-5 flex justify-between items-center shadow-2xl">
      <Link to="/" className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center shadow-lg lantern-glow">
          <svg className="w-6 h-6 text-[#1c120d]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 11a1 1 0 11-2 0H2a1 1 0 110-2h1a1 1 0 110 2zm1.464 4.95a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 11a1 1 0 11-2 0H2a1 1 0 110-2h1a1 1 0 110 2zm1.464 4.95a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707z" /></svg>
        </div>
        <span className="text-2xl font-bold medieval-font tracking-widest text-zinc-100 uppercase">The Round <span className="text-amber-500">Table</span></span>
      </Link>
      <div className="hidden lg:flex space-x-10 font-bold uppercase text-xs tracking-[0.2em]">
        <Link to="/" className={`${isActive('/')} transition-all duration-300 py-1`}>{t('nav.chambers')}</Link>
        <Link to="/community" className={`${isActive('/community')} transition-all duration-300 py-1`}>{t('nav.great_hall')}</Link>
        <Link to="/shop" className={`${isActive('/shop')} transition-all duration-300 py-1`}>{t('nav.armory')}</Link>
        <Link to="/tournaments" className={`${isActive('/tournaments')} transition-all duration-300 py-1`}>{t('nav.tournaments')}</Link>
        {user?.role === 'admin' && (<Link to={RoutePath.Admin} className={`${isActive(RoutePath.Admin)} transition-all duration-300 py-1 flex items-center gap-2`}><ShieldCheck className="w-3 h-3 text-amber-500" />{t('nav.admin')}</Link>)}
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-2 border-r border-zinc-800 pr-4 mr-2"><Globe className="w-3 h-3 text-zinc-600" /><select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language} className="bg-transparent text-[10px] text-zinc-400 font-bold uppercase tracking-widest outline-none"><option value="en">EN</option><option value="hy">AM</option><option value="ru">RU</option></select></div>
        <Link to={RoutePath.Checkout} className="relative group cursor-pointer"><ShoppingBag className="w-5 h-5 text-zinc-400 group-hover:text-amber-500 transition-colors" />{itemCount > 0 && <span className="absolute -top-2 -right-2 bg-red-700 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{itemCount}</span>}</Link>
        {user ? (<div className="flex items-center gap-4 pl-4 border-l border-zinc-800"><Link to="/profile" className="flex flex-col items-end group"><span className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest group-hover:text-amber-500 transition-colors">{user.username}</span><span className="text-[8px] text-amber-500 uppercase tracking-[0.2em]">{user.role === 'admin' ? t('common.hand_of_the_king') : t('common.knight')}</span></Link><button onClick={logout} className="p-2 text-zinc-500 hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /></button></div>) : (<div className="flex items-center space-x-4"><Link to="/login" className="text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest">{t('common.login')}</Link><Link to="/register" className="px-6 py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded-md text-xs uppercase tracking-widest border border-red-700/50">{t('common.register')}</Link></div>)}
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#0a0705] border-t border-zinc-900 py-20 px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-2xl font-bold medieval-font text-red-700 mb-6">The Round Table</h3>
          <p className="text-zinc-500 max-w-sm leading-relaxed text-sm">{t('footer.description')}</p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-300 uppercase text-xs tracking-widest mb-6">{t('footer.provinces')}</h4>
          <ul className="space-y-3 text-zinc-500 text-sm">
            <li><Link to="/community" className="hover:text-amber-500 transition-colors">{t('nav.great_hall')}</Link></li>
            <li><Link to="/shop" className="hover:text-amber-500 transition-colors">{t('nav.armory')}</Link></li>
            <li><Link to="/about" className="hover:text-amber-500 transition-colors">{t('footer.about_us')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-zinc-300 uppercase text-xs tracking-widest mb-6">{t('footer.decrees')}</h4>
          <ul className="space-y-3 text-zinc-500 text-sm">
            <li><Link to="/contact" className="hover:text-amber-500 transition-colors">{t('footer.contact')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center text-zinc-600 text-[10px] uppercase tracking-[0.2em]">
        <p>&copy; {new Date().getFullYear()} The Round Table . {t('footer.rights')}</p>
        <p className="mt-4 md:mt-0">{t('footer.motto')}</p>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Elements stripe={stripePromise}>
          <Router>
            <ScrollToTop /> 
            <div className="min-h-screen flex flex-col selection:bg-amber-500/30 selection:text-amber-200 bg-[#0f0a08] text-zinc-300">
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
                  {/* CRITICAL: Ensure Checkout and Contact are distinct components */}
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
  );
};

export default App;