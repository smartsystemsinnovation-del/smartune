'use client';
import { useState, useRef, useCallback } from 'react';
import { toggleLike, getComments, addComment, toggleFollow } from '@/actions/socialActions';
import { motion, AnimatePresence } from 'framer-motion';

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

const SmileIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
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
    
    // Optimistic toggle
    const prevState = following;
    setFollowing(!prevState);
    
    const res = await toggleFollow(userId, prevState);
    if (!res.success) {
      // Revert if error
      setFollowing(prevState);
    }
    setLoading(false);
  };

  return (
    <motion.button
      onClick={handleFollow}
      whileTap={{ scale: 0.95 }}
      className={`
        relative flex items-center gap-1.5 px-3 py-0.5 rounded-lg text-[12px] font-semibold
        transition-all duration-200 select-none border leading-tight
        ${following
          ? 'bg-transparent text-white/40 border-white/10'
          : 'bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/40'
        }
      `}
    >
      <AnimatePresence mode="wait" initial={false}>
        {following ? (
          <motion.span
            key="following"
            className="flex items-center gap-1"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <CheckIcon className="w-3 h-3" />
            Siguiendo
          </motion.span>
        ) : (
          <motion.span
            key="follow"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            Seguir
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── Main PostCard ── */
export default function PostCard({
  post,
  currentUserId,
}: {
  post: any;
  currentUserId: string;
}) {
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
      setHasLiked(hasLiked);
      setLikesCount(prev => (hasLiked ? prev + 1 : prev - 1));
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
      setComments(prev => [
        ...prev,
        {
          id: 'temp-' + Date.now(),
          content: newComment,
          created_at: new Date().toISOString(),
          usuarios: { nombre: 'Tú', avatar_url: '' },
        },
      ]);
      setNewComment('');
    }
    setIsSubmittingComment(false);
  };

  const avatarSrc =
    post.avatar_url ||
    `${DEFAULT_AVATAR}${encodeURIComponent(post.username || 'U')}`;

  return (
    <motion.article
      className="px-20 overflow-hidden transition-all duration-300 relative group"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 24
      }}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
    >
      {/* ── Header ── */}
      <div className="pt-14 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-7">
            {/* Avatar with subtle ring */}
            <div
              className="flex-shrink-0 rounded-full p-[1.5px] relative"
              style={{
                background: 'linear-gradient(135deg, rgba(246, 51, 154, 0.5), rgba(152, 16, 250, 0.5))',
                width: 56,
                height: 56,
              }}
            >
              <div
                className="w-full h-full rounded-full overflow-hidden border-[1.5px] border-[#181818]"
                style={{ background: '#1f1f1f' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarSrc}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-2">
                <p
                  className="font-bold tracking-tight text-white leading-none"
                  style={{ fontSize: 16 }}
                >
                  {post.username || 'Usuario'}
                </p>
                {!isOwnPost && <FollowButton userId={post.user_id} initialFollowing={post.isFollowing} />}
              </div>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                {timeAgo(post.created_at)}
              </p>
            </div>
          </div>

          {/* Right side: Options */}
          <div className="flex items-center gap-4">
            {isOwnPost && (
              <button
                className="flex items-center justify-center transition-all bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 rounded-xl p-3.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <MoreIcon className="w-6.5 h-6.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Post Content Text ── */}
      {post.content && (
        <div className="pb-10 pl-[5px]">
          <p
            className="leading-relaxed whitespace-pre-wrap break-words"
            style={{ fontSize: 16.5, color: 'rgba(255,255,255,0.9)' }}
          >
            {post.content}
          </p>
        </div>
      )}

      {/* ── Image ── */}
      {post.image_url && (
        <div
          className="relative cursor-pointer select-none pb-10"
          onClick={handleDoubleTap}
        >
          <div style={{ borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt=""
              className="w-full h-auto"
              style={{ display: 'block' }}
              draggable={false}
            />
          </div>
          <AnimatePresence>
            {showHeartBurst && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.35 }}
              >
                <HeartIcon
                  filled
                  className="w-24 h-24"
                  style={{ color: '#f6339a', filter: 'drop-shadow(0 0 32px rgba(246, 51, 154, 0.6))' } as any}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Action Bar (Boxed Layout) ── */}
      <div className="pt-4 pb-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like Pill */}
          <button
            onClick={handleLikeButton}
            className={`flex items-center gap-3 px-6 py-3 rounded-[1.25rem] border transition-all active:scale-95 ${hasLiked
              ? 'bg-[#f6339a]/10 border-[#f6339a]/30'
              : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
              }`}
          >
            <motion.div
              animate={likeAnimating ? { scale: [1, 1.4, 0.9, 1] } : {}}
              transition={{ duration: 0.35 }}
            >
              <HeartIcon
                filled={hasLiked}
                className="w-[19px] h-[19px]"
                style={
                  {
                    color: hasLiked ? '#f6339a' : 'rgba(255,255,255,0.4)',
                    filter: hasLiked ? 'drop-shadow(0 0 8px rgba(246, 51, 154, 0.4))' : 'none',
                  } as any
                }
              />
            </motion.div>
            <span
              className="font-bold"
              style={{
                fontSize: 13.5,
                color: hasLiked ? '#f6339a' : 'rgba(255,255,255,0.4)',
              }}
            >
              {likesCount > 0 ? formatCount(likesCount) : 'Me gusta'}
            </span>
          </button>

          {/* Comment Pill */}
          <button
            onClick={loadComments}
            className="flex items-center gap-3 px-6 py-3 rounded-[1.25rem] bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all active:scale-95"
          >
            <CommentIcon
              className="w-[19px] h-[19px]"
              style={{ color: 'rgba(255,255,255,0.4)' } as any}
            />
            <span
              className="font-bold"
              style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)' }}
            >
              {Number(post.comments_count) > 0
                ? post.comments_count
                : 'Comentar'}
            </span>
          </button>
        </div>

        {/* Share Pill */}
        <button
          className="flex items-center justify-center w-[52px] h-[52px] rounded-[1.25rem] bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all active:scale-95"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <ShareIcon className="w-[20px] h-[20px]" />
        </button>
      </div>

      {/* ── Comments Panel ── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="px-6 pb-6 pt-4">
              {/* Comments list */}
              <div
                className="flex flex-col gap-4 overflow-y-auto mb-5 no-scrollbar"
                style={{ maxHeight: 220 }}
              >
                {comments.map((comment, idx) => (
                  <div key={idx} className="flex gap-3 items-start card-appear">
                    <div
                      className="flex-shrink-0 rounded-full overflow-hidden border border-white/10"
                      style={{
                        width: 28,
                        height: 28,
                        background: '#2a2a2a',
                      }}
                    >
                      <img
                        src={
                          comment.usuarios?.avatar_url ||
                          `${DEFAULT_AVATAR}${encodeURIComponent(
                            comment.usuarios?.nombre || 'U'
                          )}`
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: 13, lineHeight: 1.5 }}>
                        <span
                          className="font-bold mr-2 text-white"
                        >
                          {comment.usuarios?.nombre || 'Usuario'}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {comment.content}
                        </span>
                      </p>
                      <p className="mt-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                        Responder
                      </p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p
                    className="text-center py-6"
                    style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}
                  >
                    Sin comentarios aún
                  </p>
                )}
              </div>

              {/* Comment input */}
              <form
                onSubmit={handleAddComment}
                className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1.5 focus-within:border-white/20 transition-all"
              >
                <input
                  type="text"
                  placeholder="Escribe un comentario…"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-2 text-white outline-none"
                  style={{ fontSize: 13 }}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="rounded-xl px-5 py-2 font-bold text-white transition-all active:scale-95 disabled:opacity-30"
                  style={{
                    fontSize: 12,
                    background: 'linear-gradient(135deg, #f6339a, #9810fa)',
                  }}
                >
                  {isSubmittingComment ? '...' : 'Enviar'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
