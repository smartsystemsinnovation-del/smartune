'use client';
import { useState, useRef, useCallback } from 'react';
import { toggleLike, getComments, addComment } from '@/actions/socialActions';
import { motion } from 'framer-motion';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=ea88ff&color=fff&bold=true&size=128&name=';

/* ── SVG Icon Components ── */
const HeartIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const CommentIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const MoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
  </svg>
);

const SmileIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

export default function PostCard({ post, currentUserId }: { post: any, currentUserId: string }) {
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const lastTapRef = useRef(0);

  const timeAgo = (dateString: string) => {
    const diffInMs = new Date().getTime() - new Date(dateString).getTime();
    if (isNaN(diffInMs)) return 'JUST NOW';
    const diffMins = Math.floor(diffInMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)} MINUTES AGO`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} HOURS AGO`;
    const days = Math.floor(diffHours / 24);
    if (days === 1) return '1 DAY AGO';
    return `${days} DAYS AGO`;
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  };

  const performLike = useCallback(async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikesCount(prev => prev + 1);
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
    const res = await toggleLike(post.id, false);
    if (!res.success) { setHasLiked(false); setLikesCount(prev => prev - 1); }
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
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
    const res = await toggleLike(post.id, hasLiked);
    if (!res.success) {
      setHasLiked(hasLiked);
      setLikesCount(prev => hasLiked ? prev + 1 : prev - 1);
    }
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
      setComments([...comments, { id: 'temp-' + Date.now(), content: newComment, created_at: new Date().toISOString(), usuarios: { nombre: 'Tú', avatar_url: '' } }]);
      setNewComment('');
    }
    setIsSubmittingComment(false);
  };

  const avatarSrc = post.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(post.username || 'U')}`;

  return (
    <motion.article
      className="relative rounded-[24px] p-[1px] overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(152,16,250,0.4) 0%, rgba(46,30,66,0.3) 50%, rgba(152,16,250,0.2) 100%)' }}
      whileHover={{
        y: -4,
        boxShadow: "0 8px 40px rgba(152, 16, 250, 0.15)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Inner card */}
      <div className="bg-[#1a1025]/80 backdrop-blur-xl rounded-[23px] p-5 lg:p-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-[#9810fa]/60 bg-[#2a2040] flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] text-white">{post.username || 'Usuario'}</span>
              <span className="text-white/35 text-[11px] tracking-widest font-medium">{timeAgo(post.created_at)}</span>
            </div>
          </div>
          <button className="text-white/30 hover:text-white/70 transition-colors p-2">
            <MoreIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── Content Text ── */}
        {post.content && (
          <div className="mb-4">
            <p className="text-[14px] text-white/80 leading-relaxed">{post.content}</p>
          </div>
        )}

        {/* ── Image ── */}
        {post.image_url && (
          <div className="relative cursor-pointer select-none mb-4 rounded-[16px] overflow-hidden group" onClick={handleDoubleTap}>
            <div className="bg-[#0d0714] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt="" className="w-full max-h-[420px] object-cover" draggable={false} />
            </div>

            {/* Reaction overlay - bottom right */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <div className="bg-[#f6b93b] rounded-full px-3 py-1 text-black font-bold text-[12px] flex items-center gap-1 shadow-lg">
                🔥 Woow!!! 😊
              </div>
            </div>

            {/* Heart Burst animation */}
            {showHeartBurst && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                <HeartIcon filled className="w-24 h-24 text-[#ea88ff] drop-shadow-[0_0_40px_rgba(234,136,255,0.8)] heart-burst" />
              </div>
            )}
          </div>
        )}

        {/* ── Action Bar ── Exactly like the image: Eye 6355 | Heart Like | Comment Comment */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-white/50">
              <EyeIcon className="w-[18px] h-[18px]" />
              <span className="text-[13px] font-medium">6355</span>
            </div>

            <button onClick={handleLikeButton} className="flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-all group">
              <HeartIcon filled={hasLiked} className={`w-[18px] h-[18px] transition-colors ${likeAnimating ? 'like-pop' : ''} ${hasLiked ? 'text-[#ea88ff]' : 'text-white/50 group-hover:text-[#ea88ff]'}`} />
              <span className={`text-[13px] font-medium transition-colors ${hasLiked ? 'text-[#ea88ff]' : 'text-white/50 group-hover:text-[#ea88ff]'}`}>Like</span>
            </button>

            <button onClick={loadComments} className="flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-all group">
              <CommentIcon className="w-[18px] h-[18px] text-white/50 group-hover:text-white/80 transition-colors" />
              <span className="text-[13px] font-medium text-white/50 group-hover:text-white/80 transition-colors">Comment</span>
            </button>
          </div>
        </div>

        {/* ── Comments Section ── */}
        {showComments && (
          <div className="pb-2 pt-4 border-t border-white/[0.06] mt-4">
            <div className="flex flex-col gap-4 max-h-[250px] overflow-y-auto no-scrollbar pt-2">
              {comments.map((comment, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#2a2040]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={comment.usuarios?.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(comment.usuarios?.nombre || 'U')}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 bg-white/[0.03] p-3 rounded-2xl rounded-tl-none">
                    <p className="text-[13px]">
                      <span className="font-bold text-white mr-2">{comment.usuarios?.nombre || 'Usuario'}</span>
                      <span className="text-white/60">{comment.content}</span>
                    </p>
                    <span className="text-[11px] text-white/25 mt-1 block">{timeAgo(comment.created_at)}</span>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-white/30 text-sm py-4 text-center">Sin comentarios aún</p>
              )}
            </div>
            <form onSubmit={handleAddComment} className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#2a2040] hidden sm:block">
                 <img src={`${DEFAULT_AVATAR}Tu`} alt="Tú" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Añade un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-white/[0.04] border border-[#9810fa]/20 text-[14px] text-white rounded-full py-2.5 pl-4 pr-12 focus:outline-none focus:border-[#9810fa]/50 transition-colors placeholder:text-white/25"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#ea88ff] transition-colors">
                  <SmileIcon className="w-5 h-5 flex-shrink-0" />
                </button>
              </div>
              <button type="submit" disabled={!newComment.trim() || isSubmittingComment}
                className={`text-[13px] font-bold px-5 py-2 rounded-full transition-all ${!newComment.trim() || isSubmittingComment ? 'bg-white/[0.04] text-white/15 cursor-not-allowed' : 'bg-white text-[#0d0714] hover:bg-white/90'}`}>
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </motion.article>
  );
}
