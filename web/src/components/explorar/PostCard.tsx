'use client';
import { useState, useRef, useCallback } from 'react';
import { toggleLike, getComments, addComment } from '@/actions/socialActions';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=f6339a&color=fff&bold=true&size=128&name=';

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

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const BookmarkIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

const MoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
  </svg>
);

const VerifiedIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
  const [saved, setSaved] = useState(false);
  const lastTapRef = useRef(0);

  const timeAgo = (dateString: string) => {
    const diffInMs = new Date().getTime() - new Date(dateString).getTime();
    if (isNaN(diffInMs)) return 'Ahora';
    const diffMins = Math.floor(diffInMs / 60000);
    if (diffMins < 60) return `hace ${Math.max(1, diffMins)} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    const days = Math.floor(diffHours / 24);
    if (days === 1) return 'ayer';
    return `hace ${days}d`;
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
    <article className="bg-[#1a1a22] rounded-2xl overflow-hidden border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-full p-[2px] bg-gradient-to-tr from-[#f6339a] via-[#9810fa] to-[#0e9eef]">
            <div className="w-full h-full rounded-full bg-[#1a1a22] p-[1.5px]">
              <div className="w-full h-full rounded-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[14px] text-white">{post.username || 'Usuario'}</span>
              <VerifiedIcon className="w-3.5 h-3.5 text-[#0e9eef]" />
              <span className="text-white/20 text-xs">•</span>
              <span className="text-white/35 text-[12px]">{timeAgo(post.created_at)}</span>
            </div>
            {currentUserId !== post.user_id && (
              <button className="text-[#0e9eef] text-[12px] font-bold hover:text-[#f6339a] transition-colors text-left mt-0.5">Seguir</button>
            )}
          </div>
        </div>
        <button className="text-white/25 hover:text-white/60 transition-colors p-1">
          <MoreIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-3">
        <p className="text-[14px] text-white/85 leading-relaxed">{post.content}</p>
      </div>

      {/* ── Image ── */}
      {post.image_url && (
        <div className="relative cursor-pointer select-none" onClick={handleDoubleTap}>
          <div className="bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="" className="w-full max-h-[480px] object-cover" draggable={false} />
          </div>
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <HeartIcon filled className="w-24 h-24 text-white drop-shadow-2xl heart-burst" />
            </div>
          )}
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleLikeButton} className="hover:opacity-70 active:scale-90 transition-all">
              <HeartIcon filled={hasLiked} className={`w-6 h-6 transition-colors ${likeAnimating ? 'like-pop' : ''} ${hasLiked ? 'text-[#f6339a]' : 'text-white'}`} />
            </button>
            <button onClick={loadComments} className="hover:opacity-70 active:scale-90 transition-all">
              <CommentIcon className="w-6 h-6 text-white" />
            </button>
            <button className="hover:opacity-70 active:scale-90 transition-all">
              <SendIcon className="w-6 h-6 text-white" />
            </button>
          </div>
          <button onClick={() => setSaved(!saved)} className="hover:opacity-70 active:scale-90 transition-all">
            <BookmarkIcon filled={saved} className="w-6 h-6 text-white" />
          </button>
        </div>

        <p className="font-bold text-[14px] text-white mt-2.5">{formatCount(likesCount)} Me gusta</p>

        {Number(post.comments_count) > 0 && (
          <button onClick={loadComments} className="text-white/30 text-[14px] mt-1 block hover:text-white/50 transition-colors">
            Ver los {post.comments_count} comentarios
          </button>
        )}
      </div>

      {/* ── Comments ── */}
      {showComments && (
        <div className="px-4 pb-4 pt-2 border-t border-white/[0.04] mt-2">
          <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto no-scrollbar">
            {comments.map((comment, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#2a2a35]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={comment.usuarios?.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(comment.usuarios?.nombre || 'U')}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px]">
                    <span className="font-bold text-white mr-1.5">{comment.usuarios?.nombre || 'Usuario'}</span>
                    <span className="text-white/65">{comment.content}</span>
                  </p>
                  <span className="text-[11px] text-white/25 mt-0.5 block">{timeAgo(comment.created_at)}</span>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-white/25 text-sm py-2 text-center">Sin comentarios aún</p>
            )}
          </div>
          <form onSubmit={handleAddComment} className="mt-3 flex items-center gap-3 border-t border-white/[0.04] pt-3">
            <SmileIcon className="w-6 h-6 text-white/25 flex-shrink-0" />
            <input
              type="text"
              placeholder="Añade un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/20 focus:outline-none"
            />
            <button type="submit" disabled={!newComment.trim() || isSubmittingComment}
              className={`text-[14px] font-bold transition-colors ${!newComment.trim() || isSubmittingComment ? 'text-[#0e9eef]/25 cursor-not-allowed' : 'text-[#0e9eef] hover:text-white'}`}>
              Publicar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
