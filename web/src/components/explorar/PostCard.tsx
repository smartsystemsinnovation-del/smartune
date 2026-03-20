'use client';
import { useState } from 'react';
import { toggleLike, getComments, addComment } from '@/actions/socialActions';
import Image from 'next/image';

export default function PostCard({ post, currentUserId }: { post: any, currentUserId: string }) {
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Parse date appropriately based on locale
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    
    // Fallback if bad date
    if (isNaN(diffInMs)) return 'Recientemente';

    const diffMins = Math.floor(diffInMs / 60000);
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} d`;
  };

  const handleLike = async () => {
    // Optimistic UI update
    setHasLiked(!hasLiked);
    setLikesCount(prev => hasLiked ? prev - 1 : prev + 1);

    const res = await toggleLike(post.id, hasLiked);
    if (!res.success) {
      // Revert if error
      setHasLiked(hasLiked);
      setLikesCount(prev => hasLiked ? prev + 1 : prev - 1);
    }
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    
    setShowComments(true);
    if (comments.length === 0) {
      setIsLoadingComments(true);
      const res = await getComments(post.id);
      setIsLoadingComments(false);
      if (res.success && res.data) {
        setComments(res.data);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const res = await addComment(post.id, newComment);
    if (res.success) {
      // Optimistic comment addition
      setComments([...comments, {
        id: 'temp-' + Date.now(),
        content: newComment,
        created_at: new Date().toISOString(),
        usuarios: { nombre: 'Tú', avatar_url: '' }
      }]);
      setNewComment('');
    } else {
      alert('Error publicando el comentario: ' + res.error);
    }
    setIsSubmittingComment(false);
  };

  return (
    <div className="bg-[#1a1a24] rounded-2xl p-5 border border-[#2a2a35] w-full text-white overflow-hidden transition-all hover:border-[#0e9eef]/30 shadow-md">
      {/* Header */}
      <div className="flex gap-3 items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f6339a] to-[#0e9eef] overflow-hidden flex-shrink-0 relative">
          {post.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.avatar_url} alt={post.username} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-full h-full text-white p-2.5 text-opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          )}
        </div>
        <div>
          <h3 className="font-bold text-[1.05rem]">{post.username || 'Usuario'}</h3>
          <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-200 whitespace-pre-wrap mb-3 leading-relaxed">{post.content}</p>
        
        {post.image_url && (
          <div className="rounded-xl overflow-hidden border border-[#2a2a35] bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="Post image" className="w-full max-h-[500px] object-contain" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-6 pt-3 border-t border-[#2a2a35] text-gray-400 font-medium">
        <button 
          onClick={handleLike} 
          className={`flex items-center gap-2 transition-colors ${hasLiked ? 'text-[#f6339a]' : 'hover:text-[#f6339a]'}`}
        >
          <svg className={`w-6 h-6 ${hasLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          <span>{likesCount}</span>
        </button>

        <button 
          onClick={loadComments}
          className="flex items-center gap-2 hover:text-[#0e9eef] transition-colors"
        >
          <svg className="w-6 h-6 fill-none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <span>Comentar</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#2a2a35]">
          {isLoadingComments ? (
            <div className="text-center py-4 text-[#0e9eef] animate-pulse">Cargando comentarios...</div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment, idx) => (
                <div key={idx} className="bg-[#242430] p-3 rounded-lg flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 overflow-hidden flex-shrink-0">
                     {comment.usuarios?.avatar_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={comment.usuarios.avatar_url} alt="" className="w-full h-full object-cover" />
                     )}
                   </div>
                   <div className="flex-1">
                     <p className="text-sm">
                       <span className="font-bold text-gray-200">{comment.usuarios?.nombre || 'Usuario'}</span>
                       <span className="text-gray-400 text-xs ml-2">{timeAgo(comment.created_at)}</span>
                     </p>
                     <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                   </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-2">No hay comentarios aún. ¡Sé el primero!</p>
              )}
            </div>
          )}
          
          <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
            <input 
              type="text" 
              placeholder="Escribe un comentario..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-[#121216] border border-[#2a2a35] rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#0e9eef] transition-colors"
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || isSubmittingComment}
              className={`px-4 py-2 rounded-full font-bold text-sm ${!newComment.trim() || isSubmittingComment ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-[#0e9eef] text-white hover:bg-[#1fb0ff] hover:scale-105 transition-transform'}`}
            >
               Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
