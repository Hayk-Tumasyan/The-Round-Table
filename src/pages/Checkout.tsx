import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Loader2, MapPin, AlertCircle } from 'lucide-react';
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
    if (!user) { navigate('/login'); return; }
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
      setError(err.message || "Connection Error.");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center bg-citadel-main min-h-[70vh] flex flex-col justify-center">
        <ShoppingBag className="w-16 h-16 text-citadel-border mx-auto mb-8" />
        <h1 className="text-3xl font-bold medieval-font text-citadel-steel mb-4 uppercase">{t('checkout.empty_title')}</h1>
        <p className="text-citadel-muted mb-8 italic">{t('checkout.empty_subtitle')}</p>
        <Link to="/shop" className="text-citadel-accent uppercase text-xs font-bold underline">{t('nav.armory')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex justify-between items-end mb-12 border-b border-citadel-border pb-8">
        <h1 className="text-4xl md:text-5xl font-bold medieval-font text-citadel-steel uppercase">{t('checkout.title')}</h1>
        <button onClick={clearCart} className="text-[10px] uppercase text-citadel-muted hover:text-red-500 transition-colors">{t('checkout.abandon')}</button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-900/10 border border-red-900/20 text-red-600 text-xs font-bold uppercase rounded flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-citadel-muted uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> {t('checkout.sack_contents')}
            </h2>
            {cart.map((item) => (
              <div key={item.id} className="bg-citadel-card border border-citadel-border rounded-xl p-6 flex items-center gap-6 shadow-xl">
                <img src={item.image} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg grayscale border border-citadel-border" alt="" />
                <div className="flex-grow">
                  <h3 className="text-lg md:text-xl font-bold text-citadel-steel medieval-font uppercase">{t(`shop.items.${item.id}.name`, { defaultValue: item.name })}</h3>
                  <p className="text-[10px] text-citadel-muted uppercase font-bold tracking-widest">{item.price}g x {item.quantity}</p>
                  <button onClick={() => removeFromCart(item.id)} className="mt-4 text-citadel-muted hover:text-red-500 transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase"><Trash2 className="w-3.5 h-3.5" /> {t('checkout.remove')}</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-citadel-card border border-citadel-border rounded-2xl p-6 md:p-10 shadow-2xl">
            <h2 className="text-xs font-bold text-citadel-accent uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {t('checkout.courier_title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] text-citadel-muted font-bold uppercase mb-2">{t('checkout.address_label')}</label>
                <input className="w-full bg-citadel-main border border-citadel-border rounded-xl p-4 text-citadel-steel text-sm outline-none focus:border-citadel-accent transition-all" placeholder={t('checkout.address_placeholder')} value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} required />
              </div>
              <div>
                <label className="block text-[10px] text-citadel-muted font-bold uppercase mb-2">{t('checkout.city_label')}</label>
                <input className="w-full bg-citadel-main border border-citadel-border rounded-xl p-4 text-citadel-steel text-sm outline-none focus:border-citadel-accent transition-all" placeholder={t('checkout.city_placeholder')} value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} required />
              </div>
              <div>
                <label className="block text-[10px] text-citadel-muted font-bold uppercase mb-2">{t('checkout.zip_label')}</label>
                <input className="w-full bg-citadel-main border border-citadel-border rounded-xl p-4 text-citadel-steel text-sm outline-none focus:border-citadel-accent transition-all" placeholder={t('checkout.zip_placeholder')} value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})} required />
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="bg-citadel-card border border-citadel-border rounded-xl p-8 sticky top-24 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-citadel-accent" />
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-citadel-steel mb-8 border-b border-citadel-border pb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-citadel-accent" /> {t('checkout.summary_title')}
            </h4>
            <div className="flex justify-between text-4xl font-bold text-citadel-accent medieval-font mb-10">
              <span>{totalPrice}g</span>
            </div>
            
            <button onClick={handlePurchase} disabled={isProcessing || !shipping.address || !stripe} className="w-full py-5 bg-citadel-accent hover:bg-amber-500 text-citadel-main font-bold uppercase text-xs rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all">
              {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <>{t('checkout.pay_button')} <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-[9px] text-citadel-muted text-center mt-6 uppercase tracking-widest leading-relaxed">
              {t('checkout.security_msg')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;