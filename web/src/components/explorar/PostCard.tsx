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
    <article className="bg-white rounded-[2rem] overflow-hidden mb-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-gray-100">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 ring-2 ring-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px] text-gray-900">{post.username || 'Usuario'}</span>
              <VerifiedIcon className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-gray-500 text-[12px] font-medium">{timeAgo(post.created_at)}</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-700 transition-colors p-2">
          <MoreIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ── Content (Text) ── */}
      {post.content && (
        <div className="px-5 pb-3">
          <p className="text-[15px] text-gray-800 leading-relaxed font-medium">{post.content}</p>
        </div>
      )}

      {/* ── Image ── */}
      {post.image_url && (
        <div className="px-3" onClick={handleDoubleTap}>
          <div className="relative cursor-pointer select-none rounded-[2rem] overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="" className="w-full max-h-[500px] object-cover" draggable={false} />
            {showHeartBurst && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
                <HeartIcon filled className="w-24 h-24 text-white drop-shadow-xl heart-burst" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={handleLikeButton} className="flex items-center gap-2 hover:opacity-70 active:scale-95 transition-all group">
              <HeartIcon filled={hasLiked} className={`w-[26px] h-[26px] transition-all duration-300 ${likeAnimating ? 'like-pop' : ''} ${hasLiked ? 'text-[#f6339a]' : 'text-gray-700 group-hover:text-[#f6339a]'}`} />
              <span className="text-[15px] font-bold text-gray-700">{formatCount(likesCount)}</span>
            </button>
            <button onClick={loadComments} className="flex items-center gap-2 hover:opacity-70 active:scale-95 transition-all group">
              <CommentIcon className="w-[26px] h-[26px] text-gray-700 group-hover:text-gray-900 transition-colors" />
              <span className="text-[15px] font-bold text-gray-700">{post.comments_count > 0 ? formatCount(Number(post.comments_count)) : ''}</span>
            </button>
            <button className="hover:opacity-70 active:scale-95 transition-all">
              <SendIcon className="w-[26px] h-[26px] text-gray-700 hover:text-gray-900 transition-colors" />
            </button>
          </div>
          <button onClick={() => setSaved(!saved)} className="hover:opacity-70 active:scale-95 transition-all">
            <BookmarkIcon filled={saved} className={`w-[26px] h-[26px] transition-all duration-300 ${saved ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'}`} />
          </button>
        </div>

        {Number(post.comments_count) > 0 && !showComments && (
          <button onClick={loadComments} className="text-gray-500 text-[14px] font-medium mt-3 block hover:text-gray-700 transition-colors">
            Ver los {post.comments_count} comentarios
          </button>
        )}
      </div>

      {/* ── Comments ── */}
      {showComments && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          <div className="flex flex-col gap-4 max-h-[250px] overflow-y-auto no-scrollbar pt-3">
            {comments.map((comment, idx) => (
               <div key={idx} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={comment.usuarios?.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(comment.usuarios?.nombre || 'U')}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px]">
                    <span className="font-bold text-gray-900 mr-2">{comment.usuarios?.nombre || 'Usuario'}</span>
                    <span className="text-gray-800">{comment.content}</span>
                  </p>
                  <span className="text-[12px] text-gray-400 mt-0.5 block font-medium">{timeAgo(comment.created_at)}</span>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-gray-400 text-sm py-4 text-center">Sin comentarios aún</p>
            )}
          </div>
          <form onSubmit={handleAddComment} className="mt-4 flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${DEFAULT_AVATAR}Tu`} alt="Tú" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Añade un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-gray-100/80 text-[14px] text-gray-900 placeholder:text-gray-500 rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <SmileIcon className="w-5 h-5 flex-shrink-0" />
              </button>
            </div>
            <button type="submit" disabled={!newComment.trim() || isSubmittingComment}
              className={`text-[14px] font-bold transition-all px-2 ${!newComment.trim() || isSubmittingComment ? 'text-blue-300 cursor-not-allowed' : 'text-blue-500 hover:text-blue-600'}`}>
              Publicar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
