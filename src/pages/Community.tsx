import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPosts, createPost, toggleFealty } from '../services/postService';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { Hash, TrendingUp, Clock, FilterX, Plus, X, MessageSquare, Loader2, Search, BookOpen } from 'lucide-react';

const Community: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortOrder, setSortOrder] = useState<'created_at' | 'likes'>('created_at');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isScribing, setIsScribing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const handleSidebarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (sidebarSearch.trim()) {
      setActiveSearch(sidebarSearch.trim().toLowerCase());
    } else {
      setActiveSearch('');
    }
  };

  const fetchScrolls = async () => {
    setLoading(true);
    try {
      const data = await getPosts(sortOrder, selectedTag);
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScrolls();
  }, [sortOrder, selectedTag]);

  // Derived state for client-side text filtering
  const filteredPosts = posts.filter(post => {
    if (!activeSearch) return true;
    const searchLower = activeSearch;
    return post.title.toLowerCase().includes(searchLower) || 
           post.content.toLowerCase().includes(searchLower) ||
           (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchLower)));
  });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().toLowerCase().replace(/#/g, ''); 
      if (tags.length < 3 && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleScribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await createPost(newTitle, newContent, user.username, tags);
      setNewTitle(''); setNewContent(''); setTags([]);
      setIsScribing(false);
      fetchScrolls(); 
    } catch (err) { 
      alert(t('community.error_post')); 
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return navigate('/login');
    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;
    const isAdding = !targetPost.liked_by?.includes(user.id);
    try {
      await toggleFealty(postId, user.id, isAdding);
      setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { 
        ...p, likes: isAdding ? p.likes + 1 : p.likes - 1,
        liked_by: isAdding ? [...(p.liked_by || []), user.id] : (p.liked_by || []).filter(id => id !== user.id)
      } : p ));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Header Banner */}
      <div className="mb-10 bg-[#1c120d] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-red-800 rounded-2xl flex items-center justify-center shadow-lg border border-red-700/50">
               <span className="medieval-font text-3xl font-bold">G</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold medieval-font text-zinc-100 uppercase tracking-tight">{t('community.banner_title')}</h1>
              <div className="flex items-center gap-4 mt-2">
                 <button onClick={() => setSortOrder('created_at')} className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${sortOrder === 'created_at' ? 'text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
                   <Clock className="w-3 h-3" /> {t('community.sort_new')}
                 </button>
                 <button onClick={() => setSortOrder('likes')} className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${sortOrder === 'likes' ? 'text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
                   <TrendingUp className="w-3 h-3" /> {t('community.sort_top')}
                 </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {selectedTag && (
              <button onClick={() => setSelectedTag(null)} className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-900/40 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-red-900/30">
                <FilterX className="w-3 h-3" /> Clear Tag: #{selectedTag}
              </button>
            )}
            {activeSearch && (
              <button onClick={() => { setActiveSearch(''); setSidebarSearch(''); }} className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-900/40 text-blue-500 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-blue-900/30">
                <FilterX className="w-3 h-3" /> Clear Topic: {activeSearch}
              </button>
            )}
            <button onClick={() => user ? setIsScribing(true) : navigate('/login')} className="bg-amber-600 hover:bg-amber-500 text-[#0f0a08] px-8 py-3 rounded-lg font-bold uppercase text-xs tracking-[0.2em] transition-all shadow-xl">
              {t('community.scribe_button')}
            </button>
          </div>
        </div>
      </div>

      {/* Scribing Form */}
      {isScribing && (
        <form onSubmit={handleScribe} className="mb-12 bg-[#1c120d] border border-amber-600/30 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <h3 className="medieval-font text-amber-500 mb-6 uppercase tracking-widest text-lg">{t('community.new_decree')}</h3>
          <div className="space-y-4">
            <input className="w-full bg-[#0f0a08] border border-zinc-800 rounded-xl p-4 text-zinc-100 outline-none focus:border-amber-600" placeholder={t('community.title_placeholder')} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            <textarea className="w-full bg-[#0f0a08] border border-zinc-800 rounded-xl p-4 text-zinc-100 h-32 outline-none focus:border-amber-600" placeholder={t('community.content_placeholder')} value={newContent} onChange={(e) => setNewContent(e.target.value)} required />
            
            <div className="space-y-3 bg-[#0f0a08] p-4 rounded-xl border border-zinc-900">
              <label className="block text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Banners (Max 3)</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 text-amber-500 rounded-md text-[10px] font-bold uppercase">
                    #{tag} <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setTags(tags.filter(t => t !== tag))} />
                  </span>
                ))}
                {tags.length < 3 && (
                  <input 
                    className="bg-transparent text-zinc-100 outline-none text-xs min-w-[150px]" 
                    placeholder="Type and press Enter..." 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="bg-amber-600 text-[#0f0a08] px-8 py-3 rounded-lg font-bold uppercase text-xs">{t('community.post_button')}</button>
              <button type="button" onClick={() => setIsScribing(false)} className="text-zinc-600 uppercase text-xs hover:text-white transition-colors">{t('common.cancel')}</button>
            </div>
          </div>
        </form>
      )}

      {/* Main Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
             <div className="text-center py-20 text-zinc-700 uppercase tracking-widest animate-pulse flex flex-col items-center gap-4">
               <Loader2 className="w-8 h-8 animate-spin" />
               {t('common.loading')}
             </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-[#1c120d] border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-600 italic">{t('community.empty')}</p>
            </div>
          ) : (
            filteredPosts.map(post => {
              const hasLiked = user && post.liked_by?.includes(user.id);
              return (
                <article key={post.id} className="bg-[#1c120d] border border-zinc-800 rounded-2xl flex flex-col hover:border-zinc-700 transition-all shadow-sm overflow-hidden group/card">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                        <span className="text-amber-600">Sir {post.author}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                      </div>
                      
                      {/* BANNERS (TAGS) RENDERING */}
                      <div className="flex gap-2">
                        {post.tags && post.tags.length > 0 && post.tags.map((tag, idx) => (
                          <button 
                            key={`${post.id}-tag-${idx}`} 
                            onClick={(e) => { e.preventDefault(); setSelectedTag(tag); }} 
                            className={`px-3 py-1 border rounded transition-all text-[10px] font-bold uppercase tracking-widest ${selectedTag === tag ? 'bg-amber-600 border-amber-500 text-[#0f0a08]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-amber-500 hover:border-amber-900'}`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Link to={`/post/${post.id}`} className="block mb-6">
                      <h2 className="text-2xl font-bold text-zinc-100 mb-3 group-hover/card:text-amber-500 transition-colors uppercase tracking-wide">{post.title}</h2>
                      <p className="text-zinc-400 text-sm italic leading-relaxed line-clamp-3">"{post.content}"</p>
                    </Link>

                    <div className="mt-4 pt-6 border-t border-zinc-900 flex items-center gap-6">
                      <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 transition-colors group ${hasLiked ? 'text-red-500' : 'text-amber-600 hover:text-amber-400'}`}>
                        <Hash className={`w-4 h-4 transition-transform ${!hasLiked && 'group-hover:rotate-12'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{post.likes} {t('common.fealty')}</span>
                      </button>
                      <Link to={`/post/${post.id}`} className="flex items-center gap-2 text-zinc-600 hover:text-amber-500 transition-colors text-[10px] font-bold uppercase tracking-widest">
                        <MessageSquare className="w-4 h-4" /> {post.commentsCount} {t('common.scrolls')}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-4">
          {/* Search Box */}
          <div className="bg-[#1c120d] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110 group-hover:-rotate-12 group-hover:opacity-10">
              <Search className="w-32 h-32" />
            </div>
            
            <h3 className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-sm mb-6 relative z-10">
              <Search className="w-4 h-4" /> {t('community.sidebar_search_title')}
            </h3>
            
            <form onSubmit={handleSidebarSearch} className="relative z-10">
              <input 
                type="text" 
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder={t('community.sidebar_search_placeholder')}
                className="w-full bg-[#0f0a08] border border-zinc-800 rounded-xl py-4 pl-5 pr-12 text-zinc-100 outline-none focus:border-amber-600 focus:shadow-[0_0_15px_rgba(217,119,6,0.1)] transition-all placeholder:text-zinc-600"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-500 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Rules Card */}
          <div className="bg-[#1c120d] border border-amber-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-10">
              <BookOpen className="w-32 h-32" />
            </div>
            
            <h3 className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-sm mb-6 relative z-10">
              <BookOpen className="w-4 h-4" /> {t('community.sidebar_rules_title')}
            </h3>
            
            <ul className="space-y-4 relative z-10 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="text-amber-600/50 mt-0.5 text-[10px] uppercase tracking-widest">I</span>
                <span>{t('community.sidebar_rules_1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600/50 mt-0.5 text-[10px] uppercase tracking-widest">II</span>
                <span>{t('community.sidebar_rules_2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600/50 mt-0.5 text-[10px] uppercase tracking-widest">III</span>
                <span>{t('community.sidebar_rules_3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600/50 mt-0.5 text-[10px] uppercase tracking-widest">IV</span>
                <span>{t('community.sidebar_rules_4')}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Community;