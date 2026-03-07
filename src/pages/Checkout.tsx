import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Loader2, CheckCircle, MapPin, AlertCircle } from 'lucide-react';
import { RoutePath } from '../types';

import { useStripe } from '@stripe/react-stripe-js';
import { startPaymentQuest } from '../services/paymentService';

const Checkout: React.FC = () => {
  const { cart, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const stripe = useStripe(); 

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shipping, setShipping] = useState({
    address: '',
    city: '',
    zip: ''
  });

  const handlePurchase = async () => {
    setError(null);

    if (!user) {
      alert("Please login to complete thy quest.");
      navigate('/login');
      return;
    }

    if (!shipping.address || !shipping.city || !shipping.zip) {
      setError(t('checkout.error_address'));
      return;
    }

    if (!stripe) {
      setError(t('checkout.error_mint'));
      return;
    }

    setIsProcessing(true);
    
    try {
      await startPaymentQuest(cart, user.email, shipping);
    } catch (err: any) {
      console.error("Order error:", err);
      setError(err.message || "Connection Error.");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <ShoppingBag className="w-16 h-16 text-zinc-800 mx-auto mb-8" />
        <h1 className="text-3xl font-bold medieval-font text-zinc-100 mb-4 uppercase">{t('checkout.empty_title')}</h1>
        <p className="text-zinc-500 mb-8 italic">{t('checkout.empty_subtitle')}</p>
        <Link to="/shop" className="text-amber-500 uppercase text-xs font-bold underline">{t('nav.armory')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex justify-between items-end mb-12 border-b border-zinc-900 pb-8">
        <h1 className="text-5xl font-bold medieval-font text-zinc-100 uppercase">{t('checkout.title')}</h1>
        <button onClick={clearCart} className="text-[10px] uppercase text-zinc-600 hover:text-red-500 transition-colors">{t('checkout.abandon')}</button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-900/50 text-red-500 text-xs font-bold uppercase tracking-widest rounded flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> {t('checkout.sack_contents')}
            </h2>
            {cart.map((item) => (
              <div key={item.id} className="bg-[#1c120d] border border-zinc-800 rounded-xl p-6 flex items-center gap-6 shadow-xl hover:border-zinc-700 transition-colors">
                <img src={item.image} className="w-20 h-20 object-cover rounded-lg grayscale border border-zinc-900" alt="" />
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-zinc-100 medieval-font uppercase">{item.name}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{item.price}g x {item.quantity}</p>
                  <button onClick={() => removeFromCart(item.id)} className="mt-4 text-zinc-600 hover:text-red-500 transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase"><Trash2 className="w-3.5 h-3.5" /> {t('checkout.remove')}</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1c120d] border border-zinc-800 rounded-2xl p-10 shadow-2xl">
            <h2 className="text-xs font-bold text-amber-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {t('checkout.courier_title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-2">{t('checkout.address_label')}</label>
                <input className="w-full bg-[#0f0a08] border border-zinc-900 rounded-xl p-4 text-zinc-200 text-sm outline-none focus:border-amber-600 transition-all" placeholder={t('checkout.address_placeholder')} value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} required />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-2">{t('checkout.city_label')}</label>
                <input className="w-full bg-[#0f0a08] border border-zinc-900 rounded-xl p-4 text-zinc-200 text-sm outline-none focus:border-amber-600 transition-all" placeholder={t('checkout.city_placeholder')} value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} required />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-2">{t('checkout.zip_label')}</label>
                <input className="w-full bg-[#0f0a08] border border-zinc-900 rounded-xl p-4 text-zinc-200 text-sm outline-none focus:border-amber-600 transition-all" placeholder={t('checkout.zip_placeholder')} value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})} required />
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="bg-[#1c120d] border border-zinc-800 rounded-xl p-8 sticky top-24 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-100 mb-8 border-b border-zinc-900 pb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> {t('checkout.summary_title')}
            </h4>
            <div className="flex justify-between text-4xl font-bold text-amber-500 medieval-font mb-10">
              <span>{totalPrice}g</span>
            </div>
            
            <button onClick={handlePurchase} disabled={isProcessing || !shipping.address || !stripe} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-[#0f0a08] font-bold uppercase text-xs rounded-xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
              {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : (
                <>
                  {t('checkout.pay_button')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[9px] text-zinc-600 text-center mt-6 uppercase tracking-widest leading-relaxed">
              {t('checkout.security_msg')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;