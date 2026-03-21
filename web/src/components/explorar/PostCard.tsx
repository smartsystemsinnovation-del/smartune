'use client';
import { useState } from 'react';
import { toggleLike, getComments, addComment } from '@/actions/socialActions';

export default function PostCard({ post, currentUserId }: { post: any, currentUserId: string }) {
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  };

  const handleLike = async () => {
    setHasLiked(!hasLiked);
    setLikesCount(prev => hasLiked ? prev - 1 : prev + 1);
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

  return (
    <article className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 hover:border-[#f6339a]/20 transition-all group">
      <div className="p-6">
        {/* Header — Figma exact layout */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4 flex-row">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#f6339a]/30 flex-shrink-0">
              {post.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#f6339a] to-[#0e9eef] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-white">{post.username || 'Usuario'}</h3>
                <span className="material-symbols-outlined text-[#f6339a] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <p className="text-sm text-gray-400/70">@{post.username?.replace(/\s+/g, '_').toLowerCase() || 'usuario'} • {timeAgo(post.created_at)}</p>
            </div>
            {currentUserId !== post.user_id && (
              <button className="ml-4 px-4 py-1.5 bg-gradient-to-r from-[#f6339a] to-[#0e9eef] text-white text-xs font-bold rounded-full shadow-[0_0_10px_rgba(246,51,154,0.2)] hover:scale-105 active:scale-95 transition-all self-center"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Seguir
              </button>
            )}
          </div>
          <button className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>

        {/* Content */}
        <p className="text-white leading-relaxed mb-6">{post.content}</p>

        {/* Image */}
        {post.image_url && (
          <div className="rounded-xl overflow-hidden mb-6 bg-[#1f1f1f] max-h-[400px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="Post media" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
          </div>
        )}

        {/* Interaction Bar — Figma exact: favorite, chat_bubble, repeat, share */}
        <div className="flex items-center justify-between max-w-sm text-gray-400">
          <button onClick={handleLike} className={`flex items-center gap-2 transition-colors group/btn ${hasLiked ? 'text-[#f6339a]' : 'hover:text-[#f6339a]'}`}>
            <span className="material-symbols-outlined group-hover/btn:scale-110 transition-transform" style={hasLiked ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
            <span className="text-sm font-medium">{formatCount(likesCount)}</span>
          </button>
          <button onClick={loadComments} className="flex items-center gap-2 hover:text-[#f6339a] transition-colors group/btn">
            <span className="material-symbols-outlined group-hover/btn:scale-110 transition-transform">chat_bubble</span>
            <span className="text-sm font-medium">{Number(post.comments_count) || 0}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-[#f6339a] transition-colors group/btn">
            <span className="material-symbols-outlined group-hover/btn:scale-110 transition-transform">repeat</span>
            <span className="text-sm font-medium">{Math.floor(Number(post.likes_count || 0) * 0.3)}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-[#f6339a] transition-colors group/btn">
            <span className="material-symbols-outlined group-hover/btn:scale-110 transition-transform">share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5">
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
            {comments.map((comment, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f6339a] to-[#0e9eef] overflow-hidden flex-shrink-0">
                  {comment.usuarios?.avatar_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={comment.usuarios.avatar_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 bg-[#1f1f1f] p-3 rounded-xl">
                  <p className="text-sm">
                    <span className="font-bold text-gray-200">{comment.usuarios?.nombre || 'Usuario'}</span>
                    <span className="text-gray-500 text-xs ml-2">{timeAgo(comment.created_at)}</span>
                  </p>
                  <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-2">No hay comentarios aún. ¡Sé el primero!</p>
            )}
          </div>
          <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-[#1f1f1f] border border-white/5 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#f6339a]/40 transition-all"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmittingComment}
              className={`px-4 py-2 rounded-full font-bold text-xs ${!newComment.trim() || isSubmittingComment ? 'bg-[#2a2a35] text-gray-500 cursor-not-allowed' : 'bg-[#f6339a] text-white hover:bg-[#ff4db8]'} transition-colors`}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
