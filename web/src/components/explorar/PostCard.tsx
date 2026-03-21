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
    if (isNaN(diffInMs)) return 'Recientemente';
    const diffMins = Math.floor(diffInMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
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

  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  };

  return (
    <div className="px-5 py-5">
      {/* ─── Post Header ─── */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          <div className="w-11 h-11 rounded-full border-[2px] border-[#f6339a] p-[1px] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-[#0e0e12] overflow-hidden">
              {post.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-full h-full text-gray-400 p-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[14px] text-white leading-tight">
                {post.username || 'Usuario'}
              </h3>
              {/* Verified Badge */}
              <svg className="w-3.5 h-3.5 text-[#0e9eef]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              {/* Follow Button */}
              {currentUserId !== post.user_id && (
                <button className="px-3 py-0.5 bg-[#f6339a] text-white text-[10px] font-bold rounded-full hover:bg-[#ff4db8] transition-colors ml-1">
                  Seguir
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              @{post.username?.replace(/\s+/g, '_').toLowerCase() || 'usuario'} • {timeAgo(post.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Post Content ─── */}
      <div className="mb-4">
        <p className="text-[14px] text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {post.image_url && (
          <div className="mt-3 rounded-xl overflow-hidden border border-[#2a2a35] bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="Post media" className="w-full max-h-[400px] object-cover" />
          </div>
        )}
      </div>

      {/* ─── Action Row (Figma: ❤️ count  💬 count  🔁 count  ↗ count) ─── */}
      <div className="flex items-center gap-6 text-[13px] text-[#71717a] font-medium">
        {/* Like */}
        <button onClick={handleLike} className={`group flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-[#f6339a]' : 'hover:text-[#f6339a]'}`}>
          <svg className={`w-[18px] h-[18px] transition-transform group-active:scale-125 ${hasLiked ? 'fill-current' : 'fill-none stroke-current stroke-[1.8]'}`} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span>{formatCount(likesCount)}</span>
        </button>
        
        {/* Comment */}
        <button onClick={loadComments} className="flex items-center gap-1.5 hover:text-white transition-colors">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          <span>{Number(post.comments_count) || 0}</span>
        </button>
        
        {/* Repost */}
        <button className="flex items-center gap-1.5 hover:text-[#22c55e] transition-colors">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-7 7-7-7M5 17l7-7 7 7"/></svg>
          <span>{Math.floor(Number(post.likes_count || 0) * 0.4)}</span>
        </button>

        {/* Share */}
        <button className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-4l-4 4m0 0l-4-4m4 4V4" transform="rotate(180 12 12)"/></svg>
        </button>
      </div>

      {/* ─── Comments Section ─── */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#2a2a35]/40">
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment, idx) => (
              <div key={idx} className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f6339a] to-[#0e9eef] overflow-hidden flex-shrink-0">
                   {comment.usuarios?.avatar_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={comment.usuarios.avatar_url} alt="" className="w-full h-full object-cover" />
                   )}
                 </div>
                 <div className="flex-1 bg-[#1a1a24] p-3 rounded-xl">
                   <p className="text-[13px]">
                     <span className="font-bold text-gray-200">{comment.usuarios?.nombre || 'Usuario'}</span>
                     <span className="text-gray-500 text-[11px] ml-2">{timeAgo(comment.created_at)}</span>
                   </p>
                   <p className="text-[13px] text-gray-300 mt-1">{comment.content}</p>
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
              className="flex-1 bg-[#1a1a24] border border-[#2a2a35] rounded-full px-4 py-2 text-[13px] text-white focus:outline-none focus:border-[#f6339a]/50 transition-colors"
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || isSubmittingComment}
              className={`px-4 py-2 rounded-full font-bold text-[12px] ${!newComment.trim() || isSubmittingComment ? 'bg-[#2a2a35] text-gray-500 cursor-not-allowed' : 'bg-[#f6339a] text-white hover:bg-[#ff4db8]'} transition-colors`}
            >
               Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
