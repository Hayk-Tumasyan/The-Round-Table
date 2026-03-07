import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../services/productService';
import { Product, RoutePath } from '../types';
import { useCart } from '../context/CartContext';
import { Loader2, ShoppingBag, ArrowRight, X, ShieldCheck } from 'lucide-react';

const Shop: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, itemCount } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Weapon', 'Armor', 'Artifact', 'Consumable'];

  const [showModal, setShowModal] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  const handleQuickBuy = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_quantity <= 0) return;
    
    addToCart(product);
    setLastAddedProduct(product);
    setShowModal(true);
  };

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0f0a08]">
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
      <p className="medieval-font text-amber-500 uppercase tracking-widest">{t('common.loading')}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 relative">
      <div className="mb-20 text-center max-w-3xl mx-auto">
        <span className="text-red-600 font-bold text-[10px] tracking-[0.4em] uppercase mb-4 block">Merchant Quarter</span>
        <h1 className="text-5xl md:text-6xl font-bold medieval-font text-zinc-100 mb-6 uppercase">{t('shop.title')}</h1>
        <p className="text-zinc-500 text-lg italic">{t('shop.subtitle')}</p>
        <div className="h-0.5 w-40 bg-zinc-800 mx-auto mt-10"></div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-16">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-8 py-3 rounded text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-300 ${filter === cat ? 'bg-amber-600 border-amber-500 text-[#0f0a08] shadow-2xl' : 'bg-[#1c120d] border-zinc-800 text-zinc-300 hover:border-amber-500'}`}>
            {t(`shop.categories.${cat}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProducts.map(product => (
          <div key={product.id} className="group flex flex-col bg-[#1c120d] border border-zinc-900 rounded-lg overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-xl">
            <Link to={`/product/${product.id}`} className="block relative aspect-[16/10] overflow-hidden bg-black">
              <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-transform duration-1000 ${product.stock_quantity > 0 ? 'opacity-60 group-hover:opacity-100 group-hover:scale-110' : 'opacity-20 grayscale'}`} />
              <div className="absolute top-4 left-4">
                <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded border ${product.stock_quantity > 0 ? 'border-amber-500/50 text-amber-500 bg-amber-500/20' : 'border-red-900/50 text-red-500 bg-red-900/20'}`}>
                  {product.stock_quantity > 0 ? t(`shop.rarity.${product.rarity}`) : t('shop.out_of_stock')}
                </span>
              </div>
            </Link>
            <div className="p-8 flex-grow flex flex-col">
              <div className="mb-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-2xl font-bold text-zinc-100 hover:text-amber-500 transition-colors uppercase tracking-widest medieval-font">
                    {t(`shop.items.${product.id}.name`, { defaultValue: product.name })}
                  </h3>
                </Link>
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest block mt-1">{t(`shop.categories.${product.category}`)}</span>
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed mb-8 flex-grow italic line-clamp-2">
                "{t(`shop.items.${product.id}.desc`, { defaultValue: product.description })}"
              </p>
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-900/50">
                <span className="text-amber-500 font-bold text-2xl tracking-tighter medieval-font">{product.price}g</span>
                {product.stock_quantity > 0 && <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest">{product.stock_quantity} {t('shop.stock_msg')}</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link to={`/product/${product.id}`} className="py-3 bg-[#0f0a08] hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 text-[9px] font-bold uppercase tracking-[0.3em] rounded border border-zinc-800 transition-all text-center">{t('shop.inspect')}</Link>
                <button 
                  onClick={(e) => handleQuickBuy(e, product)} 
                  disabled={product.stock_quantity <= 0}
                  className={`py-3 text-[9px] font-bold uppercase tracking-[0.3em] rounded border transition-all ${product.stock_quantity > 0 ? 'bg-red-900/20 hover:bg-red-900/40 text-red-500 border-red-900/30' : 'bg-zinc-900 text-zinc-700 border-zinc-800 cursor-not-allowed'}`}
                >
                  {product.stock_quantity > 0 ? t('shop.buy_now') : t('shop.out_of_stock')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && lastAddedProduct && (
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
                <img src={lastAddedProduct.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h3 className="text-amber-500 font-bold uppercase text-lg tracking-wide medieval-font">
                   {t(`shop.items.${lastAddedProduct.id}.name`, { defaultValue: lastAddedProduct.name })}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{t(`shop.categories.${lastAddedProduct.category}`)}</span>
                  <span className="text-zinc-800">•</span>
                  <span className="text-zinc-400 font-bold">{lastAddedProduct.price}g</span>
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

export default Shop;