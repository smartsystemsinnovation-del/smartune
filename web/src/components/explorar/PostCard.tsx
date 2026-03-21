'use client';
import { useState, useRef, useCallback } from 'react';
import { toggleLike, getComments, addComment } from '@/actions/socialActions';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=f6339a&color=fff&bold=true&size=128&name=';

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
    return `hace ${days} días`;
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  };

  const performLike = useCallback(async () => {
    if (hasLiked) return; // Double-tap only adds likes
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
      // Double tap detected
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
    <article className="card-appear bg-[#1a1a22] rounded-2xl overflow-hidden border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar with story-like ring */}
          <div className="w-[42px] h-[42px] rounded-full story-ring p-[2px]">
            <div className="w-full h-full rounded-full bg-[#1a1a22] p-[1.5px]">
              <div className="w-full h-full rounded-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[14px] text-white leading-tight">{post.username || 'Usuario'}</span>
              <span className="material-symbols-outlined text-[#0e9eef] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-white/40 text-xs font-medium">{timeAgo(post.created_at)}</span>
            </div>
            {currentUserId !== post.user_id && (
              <button className="text-[#0e9eef] text-[12px] font-bold hover:text-[#f6339a] transition-colors text-left mt-0.5">
                Seguir
              </button>
            )}
          </div>
        </div>
        <button className="text-white/40 hover:text-white transition-colors p-1">
          <span className="material-symbols-outlined text-xl">more_horiz</span>
        </button>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-3">
        <p className="text-[14px] text-white/90 leading-relaxed">{post.content}</p>
      </div>

      {/* ── Image (double-tap to like) ── */}
      {post.image_url && (
        <div className="relative cursor-pointer select-none" onClick={handleDoubleTap}>
          <div className="bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt=""
              className="w-full max-h-[480px] object-cover"
              draggable={false}
            />
          </div>
          {/* Heart burst overlay on double-tap */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-24 h-24 text-white drop-shadow-2xl heart-burst" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* ── Action Bar (Instagram-style) ── */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button onClick={handleLikeButton} className="hover:opacity-70 transition-opacity">
              <span
                className={`material-symbols-outlined text-2xl transition-colors ${likeAnimating ? 'like-pop' : ''} ${hasLiked ? 'text-[#f6339a]' : 'text-white'}`}
                style={hasLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
            </button>
            {/* Comment */}
            <button onClick={loadComments} className="hover:opacity-70 transition-opacity">
              <span className="material-symbols-outlined text-2xl text-white">chat_bubble_outline</span>
            </button>
            {/* Share */}
            <button className="hover:opacity-70 transition-opacity">
              <span className="material-symbols-outlined text-2xl text-white">send</span>
            </button>
          </div>
          {/* Bookmark */}
          <button onClick={() => setSaved(!saved)} className="hover:opacity-70 transition-opacity">
            <span
              className={`material-symbols-outlined text-2xl ${saved ? 'text-white' : 'text-white'}`}
              style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              bookmark
            </span>
          </button>
        </div>

        {/* Like count */}
        <p className="font-bold text-[14px] text-white mt-2">{formatCount(likesCount)} Me gusta</p>

        {/* Caption with username */}
        {!post.image_url && (
          <div className="mt-1">
            <span className="font-bold text-[14px] text-white mr-1.5">{post.username || 'Usuario'}</span>
            <span className="text-[14px] text-white/80">{post.content}</span>
          </div>
        )}

        {/* View all comments link */}
        {Number(post.comments_count) > 0 && (
          <button onClick={loadComments} className="text-white/40 text-[14px] mt-1 block hover:text-white/60 transition-colors">
            Ver los {post.comments_count} comentarios
          </button>
        )}
      </div>

      {/* ── Comments Section ── */}
      {showComments && (
        <div className="px-4 pb-4 pt-2 border-t border-white/[0.04] mt-2">
          <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto no-scrollbar">
            {comments.map((comment, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#2a2a35]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comment.usuarios?.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(comment.usuarios?.nombre || 'U')}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px]">
                    <span className="font-bold text-white mr-1.5">{comment.usuarios?.nombre || 'Usuario'}</span>
                    <span className="text-white/70">{comment.content}</span>
                  </p>
                  <span className="text-[11px] text-white/30 mt-0.5 block">{timeAgo(comment.created_at)}</span>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-white/30 text-sm py-2 text-center">Sin comentarios aún</p>
            )}
          </div>
          {/* Add comment */}
          <form onSubmit={handleAddComment} className="mt-3 flex items-center gap-3 border-t border-white/[0.04] pt-3">
            <span className="material-symbols-outlined text-white/30 text-xl">mood</span>
            <input
              type="text"
              placeholder="Añade un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/25 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmittingComment}
              className={`text-[14px] font-bold transition-colors ${!newComment.trim() || isSubmittingComment ? 'text-[#0e9eef]/30 cursor-not-allowed' : 'text-[#0e9eef] hover:text-white'}`}
            >
              Publicar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
