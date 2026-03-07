import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../services/productService'; 
import { getPosts } from '../services/postService'; 
import { Product, Post } from '../types';
import { Loader2 } from 'lucide-react';

const Hero: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="relative h-[70vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="https://i.pinimg.com/1200x/97/77/f8/9777f83a1226a1ab8e60461c15937bd1.jpg" alt="Castle" className="w-full h-full object-cover opacity-20 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-citadel-main via-transparent to-citadel-card/50"></div>
      </div>
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Adjusted badge margin and text size */}
        <span className="inline-block px-4 py-1.5 bg-red-900/30 border border-red-700/50 text-red-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-6 md:mb-8">
          {t('home.hero.badge')}
        </span>
        
        {/* FLUID TYPOGRAPHY: text-4xl on mobile, text-8xl on desktop */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold medieval-font text-citadel-steel mb-6 md:mb-8 drop-shadow-2xl leading-tight">
          {t('home.hero.title_main')} <span className="text-citadel-accent">{t('home.hero.title_accent')}</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-citadel-muted mb-10 md:mb-12 italic max-w-2xl mx-auto leading-relaxed">
          {t('home.hero.subtitle')}
        </p>
        
        {/* Stacking buttons on small mobile, row on larger screens */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
          <Link to="/shop" className="px-8 md:px-10 py-4 md:py-5 bg-citadel-accent hover:bg-amber-500 text-citadel-main text-xs md:text-sm font-bold uppercase tracking-widest rounded transition-all shadow-2xl lantern-glow">
            {t('home.hero.cta_shop')}
          </Link>
          <Link to="/community" className="px-8 md:px-10 py-4 md:py-5 bg-transparent hover:bg-citadel-card text-citadel-steel text-xs md:text-sm font-bold uppercase tracking-widest rounded border border-citadel-border transition-all">
            {t('home.hero.cta_community')}
          </Link>
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
        setProducts(prodData.slice(0, 4)); 
        setPosts(postData.slice(0, 3)); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-citadel-main"><Loader2 className="animate-spin text-citadel-accent" /></div>;

  return (
    <div className="space-y-20 md:space-y-32 pb-20 md:pb-32">
      <Hero />
      
      {/* Real Marketplace Preview */}
      <section className="px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-16 gap-6 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold medieval-font text-citadel-steel">{t('home.treasures.title')}</h2>
            <div className="w-24 h-1 bg-red-700 mt-4 mx-auto md:mx-0"></div>
            <p className="text-citadel-muted mt-6 text-base md:text-lg">{t('home.treasures.subtitle')}</p>
          </div>
          <Link to="/shop" className="text-citadel-accent hover:text-amber-400 font-bold uppercase text-[10px] md:text-xs tracking-widest group shrink-0">
            {t('home.treasures.link')} <span className="inline-block transform group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>
        
        {/* RESPONSIVE GRID: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} className="group bg-citadel-card border border-citadel-border rounded-lg overflow-hidden hover:border-citadel-accent/40 transition-all shadow-xl">
              <div className="aspect-[4/5] overflow-hidden relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-citadel-steel group-hover:text-citadel-accent transition-colors uppercase tracking-wider text-sm md:text-base">
                   {t(`shop.items.${product.id}.name`, { defaultValue: product.name })}
                </h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[8px] md:text-[9px] uppercase tracking-widest px-2 py-1 rounded border border-citadel-border text-citadel-muted">
                    {t(`shop.rarity.${product.rarity}`)}
                  </span>
                  <span className="text-citadel-accent font-bold text-sm md:text-base">{product.price}g</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Real Community Preview */}
      <section className="px-6 md:px-8 max-w-7xl mx-auto">
        <div className="bg-citadel-card border border-citadel-border rounded-2xl md:rounded-3xl p-8 md:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-700/10 blur-[120px] rounded-full"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <span className="text-red-600 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.3em] mb-4 block">The Great Library</span>
              <h2 className="text-3xl md:text-5xl font-bold medieval-font text-citadel-steel mb-8 leading-tight">
                Chronicles of the <span className="text-red-700">Fallen</span>
              </h2>
              <div className="space-y-4 md:space-y-6">
                {posts.map(post => (
                  <Link key={post.id} to={`/post/${post.id}`} className="block p-4 md:p-6 bg-citadel-main/50 border border-citadel-border rounded-xl hover:border-red-800/50 transition-all hover:bg-citadel-main">
                    <h4 className="font-bold text-citadel-steel mb-2 uppercase tracking-wide text-xs md:text-sm">{post.title}</h4>
                    <div className="flex justify-between text-[8px] md:text-[10px] text-citadel-muted uppercase tracking-widest">
                      <span>By {post.author}</span>
                      <span className="text-citadel-accent">{post.likes} {t('common.fealty')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            {/* Hide the giant image on smaller mobile screens for better flow */}
            <div className="hidden lg:block relative">
              <img src="https://i.pinimg.com/736x/0e/d1/e6/0ed1e6223df10dc7fbd4a82b40456747.jpg" alt="Manuscript" className="rounded-2xl shadow-2xl opacity-80 border border-citadel-border" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;