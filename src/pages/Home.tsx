import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../services/productService'; // NEW
import { getPosts } from '../services/postService'; // NEW
import { Product, Post } from '../types';
import { Loader2 } from 'lucide-react';

const Hero: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="relative h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="https://i.pinimg.com/1200x/97/77/f8/9777f83a1226a1ab8e60461c15937bd1.jpg" alt="Castle" className="w-full h-full object-cover opacity-20 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a08] via-transparent to-[#1c120d]/50"></div>
      </div>
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <span className="inline-block px-4 py-1.5 bg-red-900/30 border border-red-700/50 text-red-500 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-8">{t('home.hero.badge')}</span>
        <h1 className="text-6xl md:text-8xl font-bold medieval-font text-zinc-100 mb-8 drop-shadow-2xl">{t('home.hero.title_main')} <span className="text-amber-500">{t('home.hero.title_accent')}</span></h1>
        <p className="text-xl md:text-2xl text-zinc-400 mb-12 italic max-w-2xl mx-auto">{t('home.hero.subtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/shop" className="px-10 py-5 bg-amber-600 hover:bg-amber-500 text-[#0f0a08] text-sm font-bold uppercase tracking-widest rounded transition-all shadow-2xl lantern-glow">{t('home.hero.cta_shop')}</Link>
          <Link to="/community" className="px-10 py-5 bg-transparent hover:bg-zinc-800 text-zinc-100 text-sm font-bold uppercase tracking-widest rounded border border-zinc-700 transition-all">{t('home.hero.cta_community')}</Link>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodData, postData] = await Promise.all([getProducts(), getPosts()]);
        setProducts(prodData.slice(0, 4)); // Show only 4 top items
        setPosts(postData.slice(0, 3)); // Show 3 recent decrees
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f0a08]"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-32 pb-32">
      <Hero />
      
      {/* Real Marketplace Preview */}
      <section className="px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <h2 className="text-4xl font-bold medieval-font text-zinc-100">{t('home.treasures.title')}</h2>
            <div className="w-24 h-1 bg-red-700 mt-4"></div>
            <p className="text-zinc-500 mt-6 text-lg">{t('home.treasures.subtitle')}</p>
          </div>
          <Link to="/shop" className="text-amber-500 hover:text-amber-400 font-bold uppercase text-xs tracking-widest group">
            {t('home.treasures.link')} <span className="inline-block transform group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {products.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} className="group bg-[#1c120d] border border-zinc-900 rounded-lg overflow-hidden hover:border-amber-500/40 transition-all shadow-xl">
              <div className="aspect-[4/5] overflow-hidden relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-zinc-100 group-hover:text-amber-500 transition-colors uppercase tracking-wider">{product.name}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[9px] uppercase tracking-widest px-2 py-1 rounded border border-zinc-800 text-zinc-500">{product.rarity}</span>
                  <span className="text-amber-500 font-bold">{product.price}g</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Real Community Preview */}
      <section className="px-8 max-w-7xl mx-auto">
        <div className="bg-[#1c120d] border border-zinc-900 rounded-3xl p-10 md:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-700/10 blur-[120px] rounded-full"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-red-600 font-bold uppercase text-[10px] tracking-[0.3em] mb-4 block">The Great Library</span>
              <h2 className="text-5xl font-bold medieval-font text-zinc-100 mb-8 leading-tight">Chronicles of the <span className="text-red-700">Fallen</span></h2>
              <div className="space-y-6">
                {posts.map(post => (
                  <Link key={post.id} to={`/post/${post.id}`} className="block p-6 bg-[#0f0a08]/50 border border-zinc-800 rounded-xl hover:border-red-800/50 transition-all hover:bg-[#0f0a08]">
                    <h4 className="font-bold text-zinc-200 mb-2 uppercase tracking-wide">{post.title}</h4>
                    <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest">
                      <span>By {post.author}</span>
                      <span className="text-amber-600">{post.likes} {t('common.fealty')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden md:block relative">
              <img src="https://i.pinimg.com/736x/0e/d1/e6/0ed1e6223df10dc7fbd4a82b40456747.jpg" alt="Manuscript" className="rounded-2xl shadow-2xl opacity-80 border border-zinc-800" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;