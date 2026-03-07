import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAboutPageData, AboutPageData } from '../services/siteService';
import { Shield, BookOpen, Sword, Users, Loader2 } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);

  // A guaranteed working fallback image of a medieval table/castle
  const fallbackMural = "https://i.pinimg.com/1200x/6d/46/7d/6d467d589088198f86f7b99c75a40a45.jpg";

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getAboutPageData();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch mural:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-citadel-main">
      <Loader2 className="animate-spin text-citadel-accent w-10 h-10" />
    </div>
  );

  const finalImage = (data && data.imageUrl && data.imageUrl.trim() !== "") 
    ? data.imageUrl 
    : fallbackMural;

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-20">
        {/* Established Date logic */}
        <span className="text-red-700 font-bold uppercase text-[10px] tracking-[0.4em] block mb-4">
          {data?.establishedDate || "Established MMXIV"}
        </span>
        {/* FIXED: Corrected key case to lowercase 'about.title' */}
        <h1 className="text-5xl md:text-6xl font-bold medieval-font text-citadel-steel uppercase mb-6">
          {t('about.title')}
        </h1>
        <div className="w-24 h-1 bg-citadel-accent mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32">
        <div className="space-y-6">
          {/* FIXED: Corrected key case to lowercase */}
          <h2 className="text-2xl font-bold text-citadel-accent uppercase tracking-widest flex items-center gap-3">
            <Shield className="w-6 h-6" /> {t('about.mission_label')}
          </h2>
          <p className="text-citadel-muted text-lg leading-relaxed italic">
            "{t('about.mission_text')}"
          </p>
          <p className="text-citadel-muted leading-relaxed">
            {t('about.vision_text')}
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-citadel-accent/10 blur-[80px] rounded-full"></div>
          
          <div className="rounded-2xl border border-citadel-border shadow-2xl relative z-10 overflow-hidden aspect-[4/5]">
            <img 
              src={finalImage} 
              alt="The Table Mural" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackMural;
              }}
            />
          </div>
        </div>
      </div>

      {/* THE PILLARS BOX */}
      <div className="bg-citadel-card border border-citadel-border rounded-3xl p-8 md:p-12 shadow-inner">
        <h3 className="text-center text-citadel-steel font-bold uppercase tracking-[0.3em] mb-12">
          {t('about.pillars_title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <Users className="w-8 h-8 text-citadel-accent mx-auto" />
            <p className="text-citadel-muted text-sm px-4">{t('about.pillar_1')}</p>
          </div>
          <div className="text-center space-y-4 border-y md:border-y-0 md:border-x border-citadel-border/30 py-8 md:py-0 md:px-8">
            <Sword className="w-8 h-8 text-citadel-accent mx-auto" />
            <p className="text-citadel-muted text-sm px-4">{t('about.pillar_2')}</p>
          </div>
          <div className="text-center space-y-4">
            <BookOpen className="w-8 h-8 text-citadel-accent mx-auto" />
            <p className="text-citadel-muted text-sm px-4">{t('about.pillar_3')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;