'use client';
import { useState, useRef, useCallback } from 'react';
import { toggleLike, getComments, addComment, toggleFollow } from '@/actions/socialActions';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=2e1e42&color=fff&bold=true&size=128&name=';

/* ── Iconos Estilizados ── */
const HeartIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? '#f6339a' : 'none'} stroke={filled ? '#f6339a' : 'currentColor'} strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CommentIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6L15.316 7.342m1.368 1.316a3 3 0 100-2.684 3 3 0 000 2.684zm0 9.316a3 3 0 100-2.684 3 3 0 000 2.684z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12" />
  </svg>
);

/* ── Follow Button (Manteniendo funcionalidad) ── */
function FollowButton({ userId, initialFollowing }: { userId: string, initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const prevState = following;
    setFollowing(!prevState);
    const res = await toggleFollow(userId, prevState);
    if (!res.success) setFollowing(prevState);
    setLoading(false);
  };

  return (
    <motion.button
      onClick={handleFollow}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center gap-1.5 px-3 py-0.5 rounded-lg text-[11px] font-semibold transition-all duration-200 border leading-tight ${following ? 'bg-transparent text-white/40 border-white/10' : 'bg-white/5 text-white border-white/20 hover:bg-white/10'
        }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {following ? (
          <motion.span key="following" className="flex items-center gap-1" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            <CheckIcon className="w-3 h-3" /> Siguiendo
          </motion.span>
        ) : (
          <motion.span key="follow" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            Seguir
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function PostCard({ post, currentUserId }: { post: any; currentUserId: string }) {
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const lastTapRef = useRef(0);

  const isOwnPost = post.user_id === currentUserId;

  const handleLikeButton = async () => {
    const newLiked = !hasLiked;
    setHasLiked(newLiked);
    setLikesCount(prev => (newLiked ? prev + 1 : prev - 1));
    await toggleLike(post.id, hasLiked);
  };

  const loadComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      const res = await getComments(post.id);
      if (res.success && res.data) setComments(res.data);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    const res = await addComment(post.id, newComment);
    if (res.success) {
      setComments(prev => [...prev, { id: 'temp-' + Date.now(), content: newComment, created_at: new Date().toISOString(), usuarios: { nombre: 'Tú', avatar_url: '' } }]);
      setNewComment('');
    }
    setIsSubmittingComment(false);
  };

  const avatarSrc = post.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(post.username || 'U')}`;

  return (
    <motion.article
      className="mb-10 overflow-hidden transition-all duration-300 relative"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 32
      }}
    >
      {/* ── CONTENEDOR MAESTRO (Padding de seguridad) ── */}
      <div className="p-6 lg:p-9 flex flex-col gap-6">
        
        {/* Header: Usuario */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 ring-2 ring-white/5">
              <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <Link href={`/profile/${post.user_id}`} className="font-bold text-white text-[16px] hover:text-[#f6339a] transition-colors leading-tight">
                  {post.username || 'Usuario'}
                </Link>
                {!isOwnPost && <FollowButton userId={post.user_id} initialFollowing={post.isFollowing} />}
              </div>
              {post.rol === 'profesor' ? (
                <span className="text-[10px] text-[#FFD700] font-black uppercase tracking-[0.12em] mt-1.5 px-2 py-0.5 rounded-md bg-[#FFD700]/10 border border-[#FFD700]/20 w-fit">
                  PROFESOR
                </span>
              ) : (
                <span className="text-[10px] text-[#f6339a] font-black uppercase tracking-[0.12em] mt-1.5 px-2 py-0.5 rounded-md bg-[#f6339a]/10 border border-[#f6339a]/20 w-fit">
                  ESTUDIANTE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Texto del Post: Con aire lateral alineado */}
        {post.content && (
          <div className="px-1">
            <p className="text-[16px] lg:text-[17px] leading-relaxed text-white/80 whitespace-pre-wrap font-light">
              {post.content}
            </p>
          </div>
        )}

        {/* Imagen: Con bordes suavizados e interna a la tarjeta */}
        {post.image_url && (
          <div className="rounded-[24px] overflow-hidden border border-white/5 shadow-2xl bg-black/20">
            <img src={post.image_url} alt="" className="w-full h-auto block max-h-[550px] object-contain mx-auto" />
          </div>
        )}

        {/* Barra de Acciones: Minimalista tipo Cápsula */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={handleLikeButton}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all active:scale-95 ${
                hasLiked ? 'bg-[#f6339a]/10 text-[#f6339a]' : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              <HeartIcon filled={hasLiked} className="w-5 h-5" />
              <span className="font-bold text-[14px]">{likesCount > 0 ? likesCount : 'Like'}</span>
            </button>

            {/* Comentar */}
            <button
              onClick={loadComments}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 text-white/40 hover:bg-white/10 transition-all active:scale-95"
            >
              <CommentIcon className="w-5 h-5" />
              <span className="font-bold text-[14px]">{Number(post.comments_count) > 0 ? post.comments_count : 'Reply'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Comentarios (Si se abre) */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/10 border-t border-white/[0.05] p-6 lg:p-9"
          >
            <div className="flex flex-col gap-4 max-h-[250px] overflow-y-auto no-scrollbar mb-6">
                {comments.map((comment, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <img src={comment.usuarios?.avatar_url || DEFAULT_AVATAR} alt="" className="w-7 h-7 rounded-full border border-white/10" />
                    <div className="flex-1 bg-white/[0.03] rounded-2xl p-3 rounded-tl-none">
                      <p className="text-[13px] text-white/90"><span className="font-bold mr-2 text-white">{comment.usuarios?.nombre}</span>{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-1.5 focus-within:border-[#f6339a]/50 transition-colors">
                <input type="text" placeholder="Escribe un comentario…" value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1 bg-transparent px-3 py-1.5 text-white text-sm outline-none" />
                <button type="submit" disabled={!newComment.trim() || isSubmittingComment} className="bg-gradient-to-r from-[#f6339a] to-[#9810fa] rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-30">
                  {isSubmittingComment ? '...' : 'Publicar'}
                </button>
              </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}