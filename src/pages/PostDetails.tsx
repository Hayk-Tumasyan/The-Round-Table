import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPostById, getComments, addComment } from '../services/postService';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, MessageSquare, Reply as ReplyIcon, Loader2, User } from 'lucide-react';

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [post, setPost] = useState<Post | null>(null);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{id: string, name: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const postData = await getPostById(id);
      if (postData) {
        setPost(postData);
        const commentData = await getComments(id);
        setAllComments(commentData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!id || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Send with replyTo ID if it exists
      await addComment(id, user.username, newComment, replyTo?.id || null);
      setNewComment('');
      setReplyTo(null);
      await loadData(); // Refresh
    } catch (err) {
      alert(t('community.error_comment'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-40 text-center text-amber-500 animate-pulse uppercase tracking-widest">{t('common.loading')}</div>;
  if (!post) return <div className="p-40 text-center text-zinc-500 uppercase tracking-widest">{t('post.not_found')}</div>;

  // Logic to separate root comments from replies
  const rootComments = allComments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => allComments.filter(c => c.parent_id === parentId);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <Link to="/community" className="text-zinc-600 hover:text-amber-500 mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
        <ChevronLeft className="w-4 h-4" /> {t('common.back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-8 space-y-6">
          <article className="bg-[#1c120d] border border-zinc-800 rounded-lg shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-amber-500 border border-zinc-800"><User className="w-5 h-5" /></div>
              <div>
                <p className="text-zinc-100 font-bold text-sm tracking-wide">{t('common.knight')} {post.author}</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em]">{post.date}</p>
              </div>
            </div>
            <h1 className="text-4xl font-bold medieval-font text-zinc-100 mb-8 leading-tight uppercase border-b border-zinc-900 pb-8">{post.title}</h1>
            <p className="text-xl text-zinc-400 leading-relaxed font-light italic mb-10">"{post.content}"</p>
            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-zinc-900/50 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
               <span>{post.likes} {t('common.fealty')}</span>
               <span>{allComments.length} {t('common.scrolls')}</span>
            </div>
          </article>

          {/* Comment Engine */}
          <section className="bg-[#1c120d] border border-zinc-800 rounded-lg p-8 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 mb-8">{t('community.voices')}</h3>
            
            {user ? (
              <form onSubmit={handleSendComment} className="mb-12">
                {replyTo && (
                  <div className="flex justify-between items-center bg-amber-900/10 border border-amber-900/30 p-3 mb-2 rounded text-[10px] uppercase text-amber-500 font-bold tracking-widest">
                    <span>Replying to Sir {replyTo.name}</span>
                    <button onClick={() => setReplyTo(null)} className="text-zinc-500 hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                )}
                <textarea className="w-full bg-[#0f0a08] border border-zinc-800 rounded-lg p-5 text-zinc-300 outline-none text-sm focus:border-amber-600/50 transition-colors" rows={3} placeholder={replyTo ? "Write your reply..." : t('community.comment_placeholder')} value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
                <div className="flex justify-end mt-4">
                  <button disabled={isSubmitting} className="px-10 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded font-bold uppercase text-[10px] tracking-widest transition-all">
                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : t('community.comment_button')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-12 p-6 bg-[#0f0a08] border border-zinc-800 rounded-lg text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-widest">{t('community.must_login')}</p>
              </div>
            )}

            {/* Threaded List */}
            <div className="space-y-8">
              {rootComments.map(comment => (
                <div key={comment.id} className="space-y-6">
                  {/* ROOT COMMENT */}
                  <div className="flex gap-4 group">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-zinc-200 text-sm">Sir {comment.author}</span>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{comment.timestamp}</span>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed">{comment.text}</p>
                      <button 
                        onClick={() => { setReplyTo({id: comment.id, name: comment.author}); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                        className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest hover:text-amber-500 transition-colors"
                      >
                        <ReplyIcon className="w-3 h-3" /> Reply to Scribe
                      </button>
                    </div>
                  </div>

                  {/* REPLIES (NESTED) */}
                  {getReplies(comment.id).map(reply => (
                    <div key={reply.id} className="ml-10 pl-6 border-l border-zinc-900 flex gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-zinc-300 text-xs">{reply.author}</span>
                          <span className="text-[9px] text-zinc-700 uppercase tracking-widest">{reply.timestamp}</span>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Tiny X icon for clearing replies
const X = ({className}: {className: string}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
);

export default PostDetails;