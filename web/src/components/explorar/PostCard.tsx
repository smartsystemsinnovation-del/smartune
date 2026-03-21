'use client';
import { useState } from 'react';
import { toggleLike, getComments, addComment } from '@/actions/socialActions';
import Image from 'next/image';

// MOCk components closely matching Figma (Since DB only drops plain text)
const AudioSnippet = () => (
  <div className="mt-3 bg-gradient-to-r from-[#21172a] to-[#151a28] rounded-xl p-3 border border-[#30213d] flex items-center gap-4 relative overflow-hidden">
    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#f6339a] to-[#2a2a35] w-full" />
    <button className="w-12 h-12 bg-[#f6339a] rounded-full flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(246,51,154,0.6)]">
      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
    </button>
    <div className="flex-1">
      <p className="text-[#f6339a] text-[10px] font-black uppercase tracking-widest mb-1">Snippet</p>
      <p className="text-white font-bold text-sm">Midnight Neon (Intro)</p>
    </div>
  </div>
);

const FileAttachment = () => (
  <div className="mt-3 bg-[#121216] rounded-xl p-4 border border-[#1e1e24] flex items-center justify-between">
    <div className="flex items-center gap-3">
      <svg className="w-6 h-6 text-[#0e9eef]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      <span className="text-white text-sm font-medium">Kick_Test_v2.mp3</span>
    </div>
    <button className="text-gray-400 hover:text-white transition-colors">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
    </button>
  </div>
);

const PollAttachment = () => (
  <div className="mt-3 flex flex-col gap-2">
    <div className="relative h-10 w-full bg-[#1e1424] rounded-lg overflow-hidden flex items-center px-4 border border-[#301a35]">
      <div className="absolute top-0 left-0 h-full bg-[#5d164d] w-[65%]" />
      <div className="relative z-10 w-full flex justify-between text-sm font-bold text-white">
        <span>Deep House</span>
        <span>65%</span>
      </div>
    </div>
    <div className="relative h-10 w-full bg-[#1e1424] rounded-lg overflow-hidden flex items-center px-4 border border-[#301a35]">
      <div className="absolute top-0 left-0 h-full bg-[#3d1341] w-[35%]" />
      <div className="relative z-10 w-full flex justify-between text-sm font-bold text-gray-300">
        <span>Tech Trance</span>
        <span>35%</span>
      </div>
    </div>
    <p className="text-[11px] text-gray-500 mt-1">842 votes • 2 days left</p>
  </div>
);

const NewsAttachment = () => (
  <div className="mt-3 flex items-start gap-4">
    <div className="w-12 h-12 bg-[#3b0a2a] rounded-xl flex items-center justify-center flex-shrink-0 text-[#f6339a]">
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
    </div>
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-[#f6339a] text-[10px] font-black uppercase tracking-widest">Music News</p>
        <p className="text-[10px] text-gray-500">2h</p>
      </div>
      <h4 className="text-white font-bold text-sm leading-tight mb-1">Grammy Awards 2024 Nominees Announced</h4>
      <p className="text-xs text-gray-400">Check out the full list and see if your favorites made the cut...</p>
    </div>
  </div>
);

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
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
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

  // Determine which mock attachment to show based on content keywords for Demo purposes
  const lcContent = post.content.toLowerCase();
  const hasAudio = lcContent.includes('synth') || lcContent.includes('snippet') || lcContent.includes('audio');
  const hasFile = lcContent.includes('beat') || lcContent.includes('kick') || lcContent.includes('file');
  const hasPoll = lcContent.includes('poll') || lcContent.includes('genre') || lcContent.includes('masterclass');
  const hasNews = lcContent.includes('news') || lcContent.includes('grammy');

  return (
    <div className="bg-[#130d17] rounded-2xl p-4 border border-[#2a1a2e] w-full text-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 rounded-full border-[2px] border-[#f6339a] p-[1px] shadow-[0_0_10px_rgba(246,51,154,0.4)] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
              {post.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-full h-full text-white p-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[15px] leading-tight text-white">
                {post.username || 'Usuario'}
              </h3>
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              {currentUserId !== post.user_id && (
                <button className="px-3 py-0.5 bg-[#f6339a] text-white text-[10px] font-bold rounded-full hover:bg-[#ff4db8] transition-colors ml-1 shadow-sm">
                  Seguir
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              @{post.username?.replace(/\s+/g, '_').toLowerCase() || 'usuario'} • {timeAgo(post.created_at)}
            </p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white pb-2 px-1">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="mb-4">
        <p className="text-[14px] text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {post.image_url && !hasAudio && !hasFile && !hasPoll && !hasNews && (
          <div className="mt-3 rounded-xl overflow-hidden border border-[#2a2a35] bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="Post media" className="w-full max-h-[400px] object-cover" />
          </div>
        )}

        {/* Mock Attachments based on content matching Figma design */}
        {hasAudio && <AudioSnippet />}
        {hasFile && !hasAudio && <FileAttachment />}
        {hasPoll && !hasFile && !hasAudio && <PollAttachment />}
        {hasNews && !hasPoll && !hasFile && !hasAudio && <NewsAttachment />}
      </div>

      {/* Action Row */}
      <div className="flex justify-between items-center pt-3 mt-1 border-t border-[#26172a] text-[#8e8499] text-xs font-semibold px-1">
        {/* Comments */}
        <button onClick={loadComments} className="flex items-center gap-1.5 hover:text-white transition-colors">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>
          {Number(post.comments_count) || 0}
        </button>
        
        {/* Repost */}
        <button className="flex items-center gap-1.5 hover:text-[#00e676] transition-colors">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/></svg>
          {Math.floor(Math.random() * 10) + 2} {/* Mock repost count since DB doesn't have it */}
        </button>

        {/* Like */}
        <button onClick={handleLike} className={`group flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-[#f6339a]' : 'hover:text-[#f6339a]'}`}>
          <svg className={`w-5 h-5 transition-transform duration-200 group-active:scale-125 ${hasLiked ? 'fill-current' : 'fill-none stroke-current stroke-2'}`} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className={hasLiked ? 'text-[#f6339a]' : ''}>{likesCount}</span>
        </button>

        {/* Share */}
        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-1.34 3-3 3c-.04 0-.08-.01-.12-.01L6.8 9.38C6.34 8.65 5.51 8 4.5 8 2.57 8 1 9.57 1 11.5S2.57 15 4.5 15c1.01 0 1.84-.65 2.3-1.38l7.08 4.13c.04.01.08.01.12.01 1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3s1.34-3 3-3z"/></svg>
          {Math.floor(Math.random() * 5) + 1}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#2a2a35]">
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment, idx) => (
              <div key={idx} className="bg-[#211825] p-3 rounded-lg flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f6339a] to-[#0e9eef] overflow-hidden flex-shrink-0">
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
          
          <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
            <input 
              type="text" 
              placeholder="Escribe un comentario..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-[#160d1b] border border-[#2a1a2e] rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#f6339a] transition-colors"
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || isSubmittingComment}
              className={`px-4 py-2 rounded-full font-bold text-sm ${!newComment.trim() || isSubmittingComment ? 'bg-[#3d2946] text-gray-400 cursor-not-allowed' : 'bg-[#f6339a] text-white hover:bg-[#ff4db8] hover:scale-105 transition-transform'}`}
            >
               Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
