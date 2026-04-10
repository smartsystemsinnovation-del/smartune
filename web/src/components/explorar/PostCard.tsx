'use client';
import { useState, useRef, useCallback } from 'react';
import { toggleLike, getComments, addComment } from '@/actions/socialActions';
import { motion } from 'framer-motion';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=2e1e42&color=fff&bold=true&size=128&name=';

/* ── Icons ── */
const HeartIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const CommentIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
    if (isNaN(diffInMs)) return 'Just now';
    const diffMins = Math.floor(diffInMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const days = Math.floor(diffHours / 24);
    return `${days}d ago`;
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
      className="bg-[#17102a] rounded-2xl border border-[#2e1e42] overflow-hidden"
      whileHover={{ y: -3, borderColor: 'rgba(152, 16, 250, 0.35)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2e1e42] flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-[14px] text-white leading-none mb-1">{post.username || 'Usuario'}</p>
              <p className="text-[11px] text-white/30 font-medium">{timeAgo(post.created_at)}</p>
            </div>
          </div>
          <button className="text-white/20 hover:text-white/50 transition-colors p-1">
            <MoreIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content text */}
        {post.content && (
          <p className="text-[14px] text-white/75 leading-relaxed mb-4">{post.content}</p>
        )}
      </div>

      {/* Image - full width, no padding */}
      {post.image_url && (
        <div className="relative cursor-pointer select-none" onClick={handleDoubleTap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="" className="w-full max-h-[450px] object-cover" draggable={false} />
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
              <HeartIcon filled className="w-20 h-20 text-[#f6339a] drop-shadow-[0_0_30px_rgba(246,51,154,0.8)] heart-burst" />
            </div>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-5">
          <button onClick={handleLikeButton} className="flex items-center gap-1.5 transition-all active:scale-90 group">
            <HeartIcon filled={hasLiked} className={`w-[18px] h-[18px] transition-colors ${likeAnimating ? 'like-pop' : ''} ${hasLiked ? 'text-[#f6339a]' : 'text-white/30 group-hover:text-[#f6339a]/70'}`} />
            <span className={`text-[13px] transition-colors ${hasLiked ? 'text-[#f6339a]' : 'text-white/30 group-hover:text-white/50'}`}>{likesCount > 0 ? formatCount(likesCount) : 'Like'}</span>
          </button>

          <button onClick={loadComments} className="flex items-center gap-1.5 transition-all active:scale-90 group">
            <CommentIcon className="w-[18px] h-[18px] text-white/30 group-hover:text-white/50 transition-colors" />
            <span className="text-[13px] text-white/30 group-hover:text-white/50 transition-colors">{Number(post.comments_count) > 0 ? `${post.comments_count}` : 'Comment'}</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-5 pb-5 pt-2 border-t border-[#2e1e42]">
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto no-scrollbar">
            {comments.map((comment, idx) => (
              <div key={idx} className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-[#2e1e42]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={comment.usuarios?.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(comment.usuarios?.nombre || 'U')}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px]">
                    <span className="font-semibold text-white mr-1.5">{comment.usuarios?.nombre || 'Usuario'}</span>
                    <span className="text-white/50">{comment.content}</span>
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-white/20 text-[12px] py-3 text-center">No comments yet</p>
            )}
          </div>
          <form onSubmit={handleAddComment} className="mt-3 flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-[#0d0714] border border-[#2e1e42] text-[13px] text-white rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:border-[#9810fa]/50 transition-colors placeholder:text-white/20"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">
                <SmileIcon className="w-4 h-4" />
              </button>
            </div>
            <button type="submit" disabled={!newComment.trim() || isSubmittingComment}
              className={`text-[12px] font-semibold px-4 py-2 rounded-lg transition-all ${!newComment.trim() || isSubmittingComment ? 'bg-[#2e1e42]/50 text-white/15 cursor-not-allowed' : 'bg-[#9810fa] text-white hover:bg-[#7a0dd4]'}`}>
              Send
            </button>
          </form>
        </div>
      )}
    </motion.article>
  );
}
