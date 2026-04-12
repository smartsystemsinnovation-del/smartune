'use client';
import { useState, useRef, useCallback } from 'react';
import { toggleLike, getComments, addComment, toggleFollow } from '@/actions/socialActions';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=2e1e42&color=fff&bold=true&size=128&name=';

/* ── Icons ── */
const HeartIcon = ({ filled, className, style }: { filled: boolean; className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill={filled ? '#f6339a' : 'none'}
    stroke={filled ? '#f6339a' : 'currentColor'}
    strokeWidth={filled ? 0 : 1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </svg>
);

const CommentIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const MoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
  </svg>
);

const ShareIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
    <polyline strokeLinecap="round" points="16 6 12 2 8 6" />
    <line strokeLinecap="round" x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12" />
  </svg>
);

/* ── Follow Button ── */
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
      className={`relative flex items-center gap-1.5 px-3 py-0.5 rounded-lg text-[12px] font-semibold transition-all duration-200 border leading-tight ${following ? 'bg-transparent text-white/40 border-white/10' : 'bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/40'
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

/* ── Main PostCard ── */
export default function PostCard({ post, currentUserId }: { post: any; currentUserId: string }) {
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const lastTapRef = useRef(0);

  const isOwnPost = post.user_id === currentUserId;

  const timeAgo = (dateString: string) => {
    const diffInMs = new Date().getTime() - new Date(dateString).getTime();
    if (isNaN(diffInMs)) return 'Ahora';
    const diffMins = Math.floor(diffInMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
    return String(n);
  };

  const performLike = useCallback(async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikesCount(prev => prev + 1);
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
    const res = await toggleLike(post.id, false);
    if (!res.success) {
      setHasLiked(false);
      setLikesCount(prev => prev - 1);
    }
  }, [hasLiked, post.id]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
      performLike();
    }
    lastTapRef.current = now;
  }, [performLike]);

  const handleLikeButton = async () => {
    const newLiked = !hasLiked;
    setHasLiked(newLiked);
    setLikesCount(prev => (newLiked ? prev + 1 : prev - 1));
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
    const res = await toggleLike(post.id, hasLiked);
    if (!res.success) {
      setHasLiked(!newLiked);
      setLikesCount(prev => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const loadComments = async () => {
    setShowComments(prev => !prev);
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
      className="overflow-hidden transition-all duration-300 relative group mb-8 w-full"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 32 // Borde redondeado elegante
      }}
    >
      <div className="p-6 lg:p-7 flex flex-col gap-6">
        
        {/* ── Header (Usuario) ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-[#f6339a] to-[#9810fa]">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#181818] bg-[#1f1f1f]">
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link href={isOwnPost ? '#' : `/profile/${post.user_id}`} className="font-bold text-white text-[15px] hover:text-[#f6339a] transition-colors">
                  {post.username || 'Usuario'}
                </Link>
                <span className="text-white/20 text-[10px]">•</span>
                <span className="text-white/40 text-[12px]">{timeAgo(post.created_at)}</span>
              </div>
              <p className="text-[11px] text-white/20 uppercase tracking-tight">Verified Post</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {!isOwnPost && <FollowButton userId={post.user_id} initialFollowing={post.isFollowing} />}
            <button className="text-white/30 p-1 hover:bg-white/5 rounded-lg transition-colors">
              <MoreIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ── Texto del Post ── */}
        {post.content && (
          <div className="px-1">
            <p className="text-[16px] leading-relaxed text-white/90 whitespace-pre-wrap break-words font-light">
              {post.content}
            </p>
          </div>
        )}

        {/* ── Imagen (si existe) ── */}
        {post.image_url && (
          <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-xl cursor-pointer" onClick={handleDoubleTap}>
            <img src={post.image_url} alt="" className="w-full h-auto block" />
            <AnimatePresence>
              {showHeartBurst && (
                <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.3 }}>
                  <HeartIcon filled className="w-20 h-20 text-[#f6339a] drop-shadow-[0_0_20px_rgba(246,51,154,0.5)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Action Bar (Botones) ── */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {/* Botón Like */}
            <button
              onClick={handleLikeButton}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border transition-all active:scale-95 ${
                hasLiked 
                ? 'bg-[#f6339a]/10 border-[#f6339a]/30 text-[#f6339a]' 
                : 'bg-white/[0.04] border-white/[0.05] text-white/40 hover:bg-white/[0.08]'
              }`}
            >
              <motion.div animate={likeAnimating ? { scale: [1, 1.4, 1] } : {}}>
                <HeartIcon filled={hasLiked} className="w-5 h-5" />
              </motion.div>
              <span className="font-bold text-[13px]">
                {likesCount > 0 ? formatCount(likesCount) : 'Me gusta'}
              </span>
            </button>

            {/* Botón Comentar */}
            <button
              onClick={loadComments}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.05] text-white/40 hover:bg-white/[0.08] transition-all active:scale-95"
            >
              <CommentIcon className="w-5 h-5" />
              <span className="font-bold text-[13px]">
                {Number(post.comments_count) > 0 ? post.comments_count : 'Comentar'}
              </span>
            </button>
          </div>

          <button className="p-3 rounded-2xl bg-white/[0.04] text-white/30 hover:text-white transition-all border border-white/[0.05]">
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Comentarios ── */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="bg-white/[0.02] border-t border-white/[0.05]"
          >
            <div className="p-6 lg:p-8">
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
              <form onSubmit={handleAddComment} className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-1.5">
                <input type="text" placeholder="Escribe un comentario…" value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1 bg-transparent px-3 py-1.5 text-white text-sm outline-none" />
                <button type="submit" disabled={!newComment.trim() || isSubmittingComment} className="bg-gradient-to-r from-[#f6339a] to-[#9810fa] rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-30">
                  {isSubmittingComment ? '...' : 'Publicar'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}