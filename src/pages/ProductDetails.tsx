import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProductById } from '../services/productService';
import { Product, RoutePath } from '../types';
import { useCart } from '../context/CartContext';
import { Loader2, X, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { addToCart, itemCount } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAcquire = () => {
    if (product && product.stock_quantity > 0) {
      addToCart(product);
      setShowModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#0f0a08]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center text-zinc-500 medieval-font uppercase tracking-widest text-center px-6">
      <p className="mb-8">The artifact vanished into the ethereal plane.</p>
      <Link to="/shop" className="text-amber-500 text-xs underline">Return to Armory</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 relative">
      <Link to="/shop" className="text-zinc-600 hover:text-amber-500 mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
        &larr; {t('common.back')} {t('nav.armory')}
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="relative">
          <div className="aspect-square bg-[#1c120d] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            <img 
              src={product.image} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-opacity duration-700 ${product.stock_quantity > 0 ? 'opacity-80 hover:opacity-100' : 'opacity-20 grayscale'}`} 
            />
          </div>
          <div className="absolute -bottom-6 -right-6 px-10 py-5 bg-[#1c120d] border border-amber-600/30 rounded-xl shadow-2xl lantern-glow">
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">{t('shop.value')}</p>
            <p className="text-4xl font-bold text-amber-500 medieval-font">{product.price}g</p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.3em] bg-amber-600/10 text-amber-500 border border-amber-500/30">
              {t(`shop.rarity.${product.rarity}`)} {t(`shop.categories.${product.category}`)}
            </span>
            {product.stock_quantity <= 0 && (
              <span className="px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.3em] bg-red-900/10 text-red-500 border border-red-900/30">
                {t('shop.out_of_stock')}
              </span>
            )}
          </div>
          
          <h1 className="text-5xl font-bold medieval-font text-zinc-100 mb-8 uppercase tracking-tighter">
            {t(`shop.items.${product.id}.name`, { defaultValue: product.name })}
          </h1>
          <p className="text-xl text-zinc-400 mb-12 italic leading-relaxed">
            "{t(`shop.items.${product.id}.desc`, { defaultValue: product.description })}"
          </p>

          <div className="bg-[#1c120d]/50 border border-zinc-800 p-8 rounded-xl mb-12 shadow-inner">
            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] mb-4">{t('shop.oracle_appraisal')}</h4>
            <p className="text-zinc-200 italic leading-relaxed font-serif">"{t('shop.oracle_default')}"</p>
          </div>

          <div className="mt-auto">
            <button 
              onClick={handleAcquire}
              disabled={product.stock_quantity <= 0}
              className={`w-full py-5 font-bold uppercase text-xs tracking-[0.2em] rounded-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                product.stock_quantity > 0 
                ? 'bg-amber-600 hover:bg-amber-500 text-[#0f0a08] shadow-amber-950/40' 
                : 'bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {product.stock_quantity > 0 ? t('shop.acquire') : t('shop.out_of_stock')}
            </button>
            {product.stock_quantity > 0 && (
              <p className="text-center text-[10px] text-green-500/60 uppercase tracking-[0.2em] mt-4 font-bold">
                {product.stock_quantity} {t('shop.remaining_msg')}
              </p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-[#1c120d] border border-zinc-800 w-full max-w-lg rounded-3xl p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
            
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-600/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-600/20">
                <ShieldCheck className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-3xl font-bold medieval-font text-zinc-100 uppercase tracking-widest mb-2">
                {t('checkout.added_to_sack')}
              </h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest italic mb-10">Thy claim has been acknowledged by the Merchant.</p>
            </div>

            <div className="flex items-center gap-6 mb-10 bg-[#0f0a08] p-6 rounded-2xl border border-zinc-900 shadow-inner">
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-800 shrink-0 shadow-lg">
                <img src={product.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h3 className="text-amber-500 font-bold uppercase text-lg tracking-wide medieval-font">
                   {t(`shop.items.${product.id}.name`, { defaultValue: product.name })}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{t(`shop.categories.${product.category}`)}</span>
                  <span className="text-zinc-800">•</span>
                  <span className="text-zinc-400 font-bold">{product.price}g</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 font-bold uppercase text-[10px] tracking-widest rounded-xl border border-zinc-800 transition-all"
              >
                {t('checkout.continue_quest')}
              </button>
              <Link 
                to={RoutePath.Checkout}
                className="py-4 bg-amber-600 hover:bg-amber-500 text-[#0f0a08] font-bold uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-900/40"
              >
                {t('checkout.view_sack')} ({itemCount})
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;