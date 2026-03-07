import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { sendMessage, listenToChat, Message } from '../services/chatService';
import { Send, User as UserIcon, Shield, Loader2 } from 'lucide-react';

const Contact: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Open the real-time bridge to the King's chambers
    const unsubscribe = listenToChat(user.id, (data) => {
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Auto-scroll to the newest message
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inputText.trim()) return;

    try {
      await sendMessage(user.id, user.id, user.username, inputText);
      setInputText("");
    } catch (err) {
      alert(t('contact.error_send'));
    }
  };

  if (!user) return (
    <div className="py-40 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-8">
        <Shield className="w-10 h-10 text-zinc-700" />
      </div>
      <h2 className="medieval-font text-zinc-100 text-3xl mb-4 uppercase tracking-widest">
        {t('contact.must_login_title')}
      </h2>
      <p className="text-zinc-500 mb-8 uppercase text-xs tracking-widest italic">
        {t('contact.must_login_subtitle')}
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 h-[80vh] flex flex-col">
      <div className="mb-8 border-b border-zinc-900 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold medieval-font text-zinc-100 uppercase tracking-tight">
            {t('contact.title_main')} <span className="text-amber-500">{t('contact.title_accent')}</span>
          </h1>
          <p className="text-zinc-500 text-[10px] mt-1 uppercase italic tracking-widest font-bold">
            {t('contact.subtitle')}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-green-900/10 border border-green-900/30 rounded-full text-green-500 text-[10px] font-bold uppercase tracking-widest">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {t('contact.status_connected')}
        </div>
      </div>

      {/* CHAT BOX */}
      <div className="flex-grow bg-[#1c120d] border border-zinc-800 rounded-t-3xl overflow-y-auto p-8 space-y-6 shadow-2xl custom-scrollbar relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a08]/20 to-transparent pointer-events-none" />
        
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-600 italic text-center px-12 uppercase text-[10px] tracking-[0.2em] leading-relaxed">
            {t('contact.empty_msg')}
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[75%] p-5 rounded-2xl ${
                msg.senderId === user.id 
                  ? 'bg-amber-600 text-[#0f0a08] rounded-tr-none shadow-xl border border-amber-500/30' 
                  : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700 shadow-lg'
              }`}>
                <div className="flex items-center gap-2 mb-2 opacity-60">
                   {msg.senderId === user.id ? <UserIcon className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                   <p className="text-[8px] font-bold uppercase tracking-widest">
                    {msg.senderId === user.id ? t('contact.label_me') : t('contact.label_king')}
                   </p>
                </div>
                <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <form onSubmit={handleSend} className="bg-[#0f0a08] border border-zinc-800 p-6 rounded-b-3xl flex gap-4 shadow-2xl">
        <input 
          className="flex-grow bg-[#160f0c] border border-zinc-800 rounded-xl px-6 py-4 text-zinc-100 outline-none text-sm focus:border-amber-600/50 transition-all"
          placeholder={t('contact.input_placeholder')}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <button type="submit" className="px-8 bg-amber-600 text-[#0f0a08] rounded-xl hover:bg-amber-500 transition-all shadow-lg active:scale-95">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default Contact;