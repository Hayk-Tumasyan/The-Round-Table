import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getPosts, banishPost } from '../services/postService';
import { getProducts, createProduct, banishProduct, updateProductStock } from '../services/productService';
import { getTournaments, createTournament, banishTournament } from '../services/tournamentService';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import { sendMessage, listenToChat, deleteChatRoom } from '../services/chatService'; // Added deleteChatRoom
import { getAllCitizens, toggleBanStatus } from '../services/userService';
import { Post, Product, Tournament, OrderData, User } from '../types';
import { 
  Trash2, ShieldAlert, ScrollText, Loader2, Package, Plus, X, 
  Trophy, ShoppingCart, Check, Truck, Mail, Send, MessageSquare, 
  Users, Search, Ban, ShieldCheck, User as UserIcon, RotateCcw, MapPin, PlusCircle, Trash
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [citizens, setCitizens] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'shop' | 'grounds' | 'orders' | 'ravens' | 'citizens'>('posts');

  const [isForging, setIsForging] = useState(false);
  const [isProclaiming, setIsProclaiming] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);

  const [newProd, setNewProd] = useState({ 
    name: '', 
    price: 0, 
    description: '', 
    image: '', 
    rarity: 'Common' as any, 
    category: 'Weapon' as any,
    stock_quantity: 0 
  });

  const [newTourney, setNewTourney] = useState({ title: '', description: '', event_date: '', location_name: '', prize: '', status: 'Upcoming' as any, external_link: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postD, prodD, tourD, ordD, citizenD] = await Promise.all([
        getPosts(), getProducts(), getTournaments(), getAllOrders(), getAllCitizens()
      ]);
      setPosts(postD); setProducts(prodD); setTournaments(tourD); setOrders(ordD); setCitizens(citizenD);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchData(); 
    const q = query(collection(db, "chats"), orderBy("lastUpdated", "desc"));
    const unsubRooms = onSnapshot(q, (snap) => setChatRooms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    return () => unsubRooms();
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    const unsubMessages = listenToChat(activeChatId, (data) => setChatMessages(data));
    return () => unsubMessages();
  }, [activeChatId]);

  useEffect(() => { chatScrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const refreshCitizens = async () => {
    setIsRefreshing(true);
    const data = await getAllCitizens();
    setCitizens(data);
    setIsRefreshing(false);
  };

  const handleToggleBan = async (uid: string, currentStatus: boolean) => {
    if (confirm("Change Knight's voice status?")) {
      await toggleBanStatus(uid, currentStatus);
      setCitizens(prev => prev.map(c => c.id === uid ? { ...c, isBanned: !currentStatus } : c));
    }
  };

  const handleBanishPost = async (id: string) => { if (confirm(t('admin.confirm_banish'))) { await banishPost(id); setPosts(prev => prev.filter(p => p.id !== id)); } };
  const handleForgeProduct = async (e: React.FormEvent) => { e.preventDefault(); await createProduct(newProd); setIsForging(false); fetchData(); };
  const handleBanishProduct = async (id: string) => { if (confirm(t('admin.banish_artifact_confirm'))) { await banishProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); } };
  
  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockingProduct) return;
    try {
      await updateProductStock(restockingProduct.id, newStockValue);
      setRestockingProduct(null);
      fetchData();
    } catch (err) {
      alert("The ledger is frozen. Could not update stock.");
    }
  };

  const handleProclaimTourney = async (e: React.FormEvent) => { e.preventDefault(); await createTournament(newTourney); setIsProclaiming(false); fetchData(); };
  const handleBanishTourney = async (id: string) => { if (confirm(t('admin.banish_tourney_confirm'))) { await banishTournament(id); setTournaments(prev => prev.filter(t => t.id !== id)); } };
  const handleUpdateOrderStatus = async (id: string, s: any) => { await updateOrderStatus(id, s); fetchData(); };
  const handleAdminChatSend = async (e: React.FormEvent) => { e.preventDefault(); if (!activeChatId || !adminReply.trim()) return; await sendMessage(activeChatId, "admin-system", "Hand of the King", adminReply); setAdminReply(""); };

  // NEW: Logic to close/delete chat
  const handleCloseChat = async (id: string) => {
    if (confirm(t('admin.confirm_close_chat'))) {
      try {
        await deleteChatRoom(id);
        setActiveChatId(null);
      } catch (err) {
        alert("The channel is protected by a powerful spell. Could not close.");
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f0a08]"><Loader2 className="w-12 h-12 text-red-700 animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-12 bg-[#1c120d] border border-zinc-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10"><ShieldAlert className="w-12 h-12 text-amber-500" /><div><h1 className="text-4xl font-bold medieval-font text-zinc-100 uppercase">{t('nav.admin')}</h1><p className="text-zinc-500 text-sm italic">{t('admin.subtitle')}</p></div></div>
        <div className="flex bg-[#0f0a08] p-1 rounded-lg border border-zinc-800 overflow-x-auto relative z-10">
          <button onClick={() => setActiveTab('posts')} className={`px-4 py-2 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${activeTab === 'posts' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-600'}`}>{t('admin.tabs.posts')}</button>
          <button onClick={() => setActiveTab('shop')} className={`px-4 py-2 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${activeTab === 'shop' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-600'}`}>{t('admin.tabs.shop')}</button>
          <button onClick={() => setActiveTab('grounds')} className={`px-4 py-2 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${activeTab === 'grounds' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-600'}`}>{t('admin.tabs.grounds')}</button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-600'}`}>{t('admin.tabs.orders')}</button>
          <button onClick={() => setActiveTab('ravens')} className={`px-4 py-2 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${activeTab === 'ravens' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-600'}`}>{t('admin.tabs.ravens')}</button>
          <button onClick={() => setActiveTab('citizens')} className={`px-4 py-2 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${activeTab === 'citizens' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-600'}`}>{t('admin.tabs.citizens')}</button>
        </div>
      </div>

      {restockingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-in fade-in">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRestockingProduct(null)} />
           <form onSubmit={handleRestock} className="relative bg-[#1c120d] border border-amber-600/30 w-full max-w-md rounded-2xl p-8 shadow-2xl">
              <h3 className="medieval-font text-amber-500 text-xl mb-4 uppercase">{t('admin.restock_title')}</h3>
              <p className="text-zinc-500 text-xs mb-6 uppercase">Artifact: {t(`shop.items.${restockingProduct.id}.name`, { defaultValue: restockingProduct.name })}</p>
              
              <label className="block text-zinc-600 text-[10px] font-bold uppercase mb-2">{t('admin.new_qty_label')}</label>
              <input type="number" autoFocus className="w-full bg-[#0f0a08] border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-amber-600 mb-8" value={newStockValue} onChange={e => setNewStockValue(parseInt(e.target.value))} />

              <div className="flex gap-4">
                 <button type="submit" className="flex-grow py-4 bg-amber-600 text-[#0f0a08] font-bold uppercase text-xs rounded-xl">{t('admin.update_ledger')}</button>
                 <button type="button" onClick={() => setRestockingProduct(null)} className="px-6 py-4 bg-zinc-900 text-zinc-500 font-bold uppercase text-xs rounded-xl">{t('common.cancel')}</button>
              </div>
           </form>
        </div>
      )}

      {/* --- RAVENS TAB UPDATED WITH CLOSE BUTTON --- */}
      {activeTab === 'ravens' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px] animate-in fade-in">
          <div className="lg:col-span-4 bg-[#1c120d] border border-zinc-800 rounded-3xl overflow-y-auto">
            <div className="p-6 border-b border-zinc-900 bg-[#160f0c] rounded-t-3xl"><h3 className="text-xs font-bold uppercase text-zinc-500 tracking-widest">Active Channels</h3></div>
            {chatRooms.map(room => (
              <div key={room.id} className="relative group/room">
                <button onClick={() => setActiveChatId(room.id)} className={`w-full text-left p-6 border-b border-zinc-900 transition-all ${activeChatId === room.id ? 'bg-zinc-800 border-l-4 border-l-amber-500' : 'hover:bg-zinc-900/50'}`}>
                    <span className="text-[10px] font-bold text-amber-500 uppercase mb-1">Knight: {room.userName}</span>
                    <p className="text-xs text-zinc-400 line-clamp-1">{room.lastMessage}</p>
                </button>
                {/* Delete button appears on hover in the room list */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCloseChat(room.id); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-700 hover:text-red-500 opacity-0 group-hover/room:opacity-100 transition-all"
                  title="Close Channel"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="lg:col-span-8 bg-[#1c120d] border border-zinc-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
            {activeChatId ? (
              <>
                <div className="p-4 border-b border-zinc-900 bg-[#160f0c] flex justify-between items-center px-8">
                   <h4 className="text-[10px] font-bold uppercase text-amber-500 tracking-widest">Ongoing Discourse</h4>
                   <button 
                    onClick={() => handleCloseChat(activeChatId)}
                    className="flex items-center gap-2 text-[9px] font-bold uppercase text-zinc-600 hover:text-red-500 transition-colors"
                   >
                     <Trash2 className="w-3.5 h-3.5" /> Close Channel
                   </button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto space-y-4 custom-scrollbar">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === 'admin-system' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-2xl max-w-[75%] text-sm ${msg.senderId === 'admin-system' ? 'bg-amber-600 text-[#0f0a08] rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'}`}>
                        <p className="text-[8px] uppercase font-bold opacity-40 mb-1">{msg.senderName}</p><p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatScrollRef} />
                </div>
                <form onSubmit={handleAdminChatSend} className="p-4 bg-[#0f0a08] border-t border-zinc-900 flex gap-4"><input className="flex-grow bg-transparent text-white outline-none px-4 text-xs" placeholder="Seal thy response..." value={adminReply} onChange={e => setAdminReply(e.target.value)} /><button className="p-3 bg-amber-600 text-[#0f0a08] rounded-lg hover:bg-amber-500"><Send className="w-4 h-4" /></button></form>
              </>
            ) : <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic"><MessageSquare className="w-12 h-12 mb-4 opacity-20" /> Select a channel.</div>}
          </div>
        </div>
      )}

      {/* REMAINDER OF FILE (Orders, Citizens, Grounds, Shop, Posts) remains unchanged to ensure no logic breakage */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           <h2 className="text-xl font-bold medieval-font text-zinc-300 uppercase tracking-widest flex items-center gap-3"><ShoppingCart className="w-5 h-5 text-amber-500" /> {t('admin.tributes_title')}</h2>
           <div className="grid grid-cols-1 gap-4">
            {orders.map(o => (
              <div key={o.id} className="bg-[#1c120d] border border-zinc-800 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start gap-6 shadow-sm">
                <div className="flex-grow">
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">{o.customerName} • {o.date}</p>
                  <h3 className="text-zinc-200 font-mono text-xs mt-1">#{o.id}</h3>
                  <div className="mt-4 p-3 bg-[#0f0a08] border border-zinc-900 rounded-lg flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-red-700 mt-0.5" />
                    <div>
                      <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">{t('admin.delivery_coords')}</p>
                      <p className="text-zinc-400 text-xs mt-1">{o.shippingAddress}, {o.city} {o.postalCode}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {o.items?.map((item: any, i: number) => <span key={i} className="text-[9px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-zinc-400">{t(`shop.items.${item.id}.name`, { defaultValue: item.name })} x{item.quantity}</span>)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-6 h-full justify-between">
                   <div className="text-right">
                      <p className="text-amber-500 font-bold medieval-font text-xl">{o.totalGold}g</p>
                      <span className={`text-[9px] uppercase font-bold tracking-widest ${o.status === 'Delivered' ? 'text-green-500' : 'text-zinc-600'}`}>{t(`inventory.status.${o.status}`)}</span>
                   </div>
                   <div className="flex gap-2">
                      <button title="Ship" onClick={() => handleUpdateOrderStatus(o.id!, 'Shipped')} className="p-3 bg-zinc-900 border border-zinc-800 rounded text-zinc-500 hover:text-amber-500 transition-colors"><Truck className="w-4 h-4" /></button>
                      <button title="Deliver" onClick={() => handleUpdateOrderStatus(o.id!, 'Delivered')} className="p-3 bg-zinc-900 border border-zinc-800 rounded text-zinc-500 hover:text-green-500 transition-colors"><Check className="w-4 h-4" /></button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'citizens' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8"><h2 className="text-xl font-bold medieval-font text-zinc-300 uppercase tracking-widest flex items-center gap-3"><Users className="w-5 h-5 text-amber-500" /> {t('admin.tabs.citizens')}</h2><div className="flex gap-4 items-center w-full md:w-auto"><div className="relative flex-grow md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" /><input className="w-full bg-[#0f0a08] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-xs text-white outline-none" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div><button onClick={refreshCitizens} className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-amber-500 ${isRefreshing && 'animate-spin'}`}><RotateCcw className="w-4 h-4" /></button></div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {citizens.filter(c => c.username.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
              <div key={c.id} className="bg-[#1c120d] border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4"><div className={`p-3 rounded-lg ${c.isBanned ? 'bg-red-900/10' : 'bg-zinc-900'}`}><UserIcon className={`w-5 h-5 ${c.isBanned ? 'text-red-500' : 'text-zinc-600'}`} /></div><div><h3 className={`text-sm font-bold uppercase ${c.isBanned ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>{c.username}</h3><p className="text-[9px] text-zinc-500 uppercase">Rank: {c.role}</p></div></div>
                {c.role !== 'admin' && (<button onClick={() => handleToggleBan(c.id, c.isBanned || false)} className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${c.isBanned ? 'bg-green-900/20 text-green-500 border border-green-900/30' : 'bg-red-900/10 text-red-500 border border-red-900/20'}`}>{c.isBanned ? "Restore" : "Banish"}</button>)}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'grounds' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-bold medieval-font text-zinc-300 uppercase tracking-widest"><Trophy className="w-5 h-5 text-amber-500 inline mr-2" /> {t('admin.tabs.grounds')}</h2><button onClick={() => setIsProclaiming(true)} className="px-6 py-3 bg-amber-600 text-[#0f0a08] rounded font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Plus className="w-4 h-4" /> {t('admin.proclaim_button')}</button></div>
          {isProclaiming && (
            <form onSubmit={handleProclaimTourney} className="bg-[#1c120d] border border-amber-600/30 rounded-xl p-8 mb-8 shadow-2xl relative"><button type="button" onClick={() => setIsProclaiming(false)} className="absolute top-4 right-4 text-zinc-600"><X /></button><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><input className="bg-[#0f0a08] border border-zinc-800 rounded p-4 text-white outline-none" placeholder="Name" value={newTourney.title} onChange={e => setNewTourney({...newTourney, title: e.target.value})} required /><input type="date" className="bg-[#0f0a08] border border-zinc-800 rounded p-4 text-zinc-400" value={newTourney.event_date} onChange={e => setNewTourney({...newTourney, event_date: e.target.value})} required /><input className="bg-[#0f0a08] border border-zinc-800 rounded p-4 text-white outline-none" placeholder="Location" value={newTourney.location_name} onChange={e => setNewTourney({...newTourney, location_name: e.target.value})} required /><input className="bg-[#0f0a08] border border-zinc-800 rounded p-4 text-white outline-none" placeholder="Prize" value={newTourney.prize} onChange={e => setNewTourney({...newTourney, prize: e.target.value})} required /></div><button type="submit" className="mt-6 w-full py-4 bg-amber-600 text-[#0f0a08] font-bold uppercase text-xs tracking-widest rounded">Seal Proclamation</button></form>
          )}
          <div className="grid grid-cols-1 gap-4">{tournaments.map(t => (<div key={t.id} className="bg-[#1c120d] border border-zinc-800 rounded-lg p-6 flex items-center justify-between"><div><h3 className="text-lg font-bold text-zinc-100 medieval-font uppercase">{t.title}</h3><p className="text-[10px] text-zinc-600 uppercase tracking-widest">{t.date} • {t.location}</p></div><button onClick={() => handleBanishTourney(t.id)} className="p-3 text-red-900 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button></div>))}</div>
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-bold medieval-font text-zinc-300 uppercase tracking-widest"><Package className="w-5 h-5 text-amber-500 inline mr-2" /> {t('admin.tabs.shop')}</h2><button onClick={() => setIsForging(true)} className="px-6 py-3 bg-amber-600 text-[#0f0a08] rounded font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Plus className="w-4 h-4" /> {t('admin.forge_button')}</button></div>
          {isForging && (
            <form onSubmit={handleForgeProduct} className="bg-[#1c120d] border border-amber-600/30 rounded-xl p-8 mb-8 shadow-2xl relative">
              <button type="button" onClick={() => setIsForging(false)} className="absolute top-4 right-4 text-zinc-600"><X /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input className="bg-[#0f0a08] border border-zinc-800 rounded p-4 text-white outline-none" placeholder={t('admin.artifact_name')} value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} required />
                <input type="number" className="bg-[#0f0a08] border border-zinc-800 rounded p-4 text-white outline-none" placeholder={t('admin.new_qty_label')} value={newProd.stock_quantity} onChange={e => setNewProd({...newProd, stock_quantity: parseInt(e.target.value)})} required />
                <input type="number" className="bg-[#0f0a08] border border-zinc-800 rounded p-4 text-white outline-none" placeholder={t('admin.gold_label')} value={newProd.price} onChange={e => setNewProd({...newProd, price: parseInt(e.target.value)})} required />
                <input className="bg-[#0f0a08] border border-zinc-800 rounded p-4 text-white outline-none md:col-span-2" placeholder={t('admin.image_label')} value={newProd.image} onChange={e => setNewProd({...newProd, image: e.target.value})} required />
              </div>
              <button type="submit" className="mt-6 w-full py-4 bg-amber-600 text-[#0f0a08] font-bold uppercase text-xs tracking-widest rounded">{t('admin.add_to_armory')}</button>
            </form>
          )}
          <div className="grid grid-cols-1 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-[#1c120d] border border-zinc-800 rounded-lg p-6 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-10 h-10 rounded object-cover grayscale opacity-50" />
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 medieval-font uppercase">
                       {t(`shop.items.${p.id}.name`, { defaultValue: p.name })}
                    </h3>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                      {p.price}g • {t('admin.tabs.shop')}: <span className={p.stock_quantity > 0 ? "text-green-500" : "text-red-500"}>{p.stock_quantity}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button title="Replenish Stock" onClick={() => { setRestockingProduct(p); setNewStockValue(p.stock_quantity); }} className="p-3 bg-zinc-900 border border-zinc-800 rounded text-zinc-500 hover:text-amber-500 transition-colors">
                    <PlusCircle className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleBanishProduct(p.id)} className="p-3 text-red-900 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold medieval-font text-zinc-300 uppercase tracking-widest flex items-center gap-3"><ScrollText className="w-5 h-5 text-amber-500" /> {t('admin.tabs.posts')}</h2>
          <div className="grid grid-cols-1 gap-4">{posts.map(p => (<div key={p.id} className="bg-[#1c120d] border border-zinc-800 rounded-lg p-6 flex items-center justify-between shadow-sm"><div className="flex-grow"><span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">{p.author} • {p.date}</span><h3 className="text-xl font-bold text-zinc-100 mt-1 uppercase tracking-wide">{p.title}</h3></div><button onClick={() => handleBanishPost(p.id)} className="p-4 text-red-600 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button></div>))}</div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;