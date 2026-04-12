'use client';

import { useState, useRef, useCallback } from 'react';
import { toggleLike, getComments, addComment, toggleFollow } from '@/actions/socialActions';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=121212&color=fff&bold=true&size=128&name=';

/* ── Icons ── */
const HeartIcon = ({ filled, className, style }: { filled: boolean; className?: string; style?: React.CSSProperties }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? '#f6339a' : 'currentColor'} style={style}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CommentIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);

const MoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

/* ── Custom Neon Audio Player ── */
function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const pct = Math.max(0, Math.min(1, x / bounds.width));
      const newTime = pct * audioRef.current.duration;
      if (isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
        setProgress(pct * 100);
      }
    }
  };

  return (
    <div 
      className="w-full flex items-center gap-3 bg-white/[0.03] border border-[#f6339a]/30 rounded-[16px] px-4 py-3 mt-3 shadow-[0_4px_20px_rgba(246,51,154,0.1)] transition-all hover:bg-white/[0.05]"
      onClick={(e) => e.preventDefault()}
    >
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={handleEnded} 
        className="hidden" 
      />
      
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f6339a] to-[#9810fa] flex items-center justify-center flex-shrink-0 text-white shadow-[0_0_15px_rgba(246,51,154,0.4)] hover:scale-105 active:scale-95 transition-all"
      >
        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-1" />}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1.5 cursor-pointer py-2" onClick={handleSeek}>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#f6339a] to-[#9810fa] rounded-full transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(246,51,154,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="flex-shrink-0 ml-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#f6339a] opacity-80">
           <path d="M9 18V5l12-2v13" />
           <circle cx="6" cy="18" r="3" />
           <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
    </div>
  );
}

/* ── Componente de Lista de Comentarios (Reutilizable) ── */
function CommentsList({ comments, newComment, setNewComment, handleAddComment, isSubmittingComment }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-4 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-sm py-8">
            <CommentIcon className="w-10 h-10 mb-2 opacity-50" />
            <p>Sé el primero en comentar</p>
          </div>
        ) : (
          comments.map((comment: any, idx: number) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} className="flex gap-3 group">
              <img src={comment.usuarios?.avatar_url || DEFAULT_AVATAR} alt="" className="w-8 h-8 rounded-full border border-white/5 object-cover mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[13px] text-white/80 font-bold">{comment.usuarios?.nombre}</span>
                  <span className="text-[10px] text-white/30">Ahora</span>
                </div>
                <div className="bg-white/[0.04] border border-white/[0.05] rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block max-w-[90%]">
                  <p className="text-[14px] text-white/90 leading-snug font-light">{comment.content}</p>
                </div>
                <div className="flex gap-4 mt-1.5 ml-1">
                  <button className="text-[11px] text-white/40 font-semibold hover:text-white transition-colors">Responder</button>
                </div>
              </div>
              <button className="pt-2 px-2 text-white/20 hover:text-[#f6339a] transition-colors flex-shrink-0">
                <HeartIcon filled={false} className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-4 sm:px-6 border-t border-white/5 bg-gradient-to-t from-[#0a0a0a] to-transparent">
        <form onSubmit={handleAddComment} className="flex gap-2 items-center bg-[#1a1a1a] border border-white/10 rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-[#f6339a]/60 focus-within:shadow-[0_0_15px_rgba(246,51,154,0.15)] transition-all">
          <input type="text" placeholder="Añade un comentario..." value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder:text-white/30 font-light" />
          <button type="submit" disabled={!newComment.trim() || isSubmittingComment} className="bg-gradient-to-r from-[#f6339a] to-[#9810fa] text-white rounded-full px-4 py-1.5 text-xs font-bold disabled:opacity-30 disabled:grayscale transition-all active:scale-95">
            {isSubmittingComment ? '...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Main PostCard ── */
export default function PostCard({ post, currentUserId }: { post: any; currentUserId: string }) {
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const [isFollowing, setIsFollowing] = useState(post.isFollowing || false);
  const isOwnPost = post.user_id === currentUserId;
  const lastTapRef = useRef(0);
  const hasMedia = !!post.image_url;

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
    return String(n);
  };

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
      if (!hasLiked) handleLikeButton();
    }
    lastTapRef.current = now;
  }, [hasLiked]);

  const handleLikeButton = async () => {
    const newLiked = !hasLiked;
    setHasLiked(newLiked);
    setLikesCount(prev => (newLiked ? prev + 1 : prev - 1));
    const res = await toggleLike(post.id, hasLiked);
    if (!res.success) {
      setHasLiked(!newLiked);
      setLikesCount(prev => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevState = isFollowing;
    setIsFollowing(true);
    const res = await toggleFollow(post.user_id, prevState);
    if (!res.success) setIsFollowing(prevState);
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
      setComments(prev => [...prev, { id: 'temp-' + Date.now(), content: newComment, created_at: new Date().toISOString(), usuarios: { nombre: 'Tú', avatar_url: '' } }]);
      setNewComment('');
    }
    setIsSubmittingComment(false);
  };

  const avatarSrc = post.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(post.username || 'U')}`;

  /* =========================================
     DISEÑO 1: POST DE TEXTO (MEJORADO - CENTRADO Y PREMIUM)
     ========================================= */
  if (!hasMedia) {
    return (
      <article className="w-full max-w-[540px] mx-auto mb-6 bg-[#0f0f0f] border border-white/[0.05] rounded-[28px] overflow-hidden shadow-lg transition-colors hover:border-white/[0.08]">
        <div className="p-7 flex flex-col items-center gap-6">

          {/* Header y Contenido Clickable */}
          <Link href={`/profile/${post.user_id}`} className="flex flex-col items-center w-full group/content">
            <header className="flex flex-col items-center text-center w-full mb-2">
              <div className="relative mb-4 group">
                <div className="absolute inset-[-10px] bg-[#f6339a] blur-3xl opacity-30 rounded-full animate-pulse transition-opacity"></div>
                <img src={avatarSrc} alt="" className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-[#f6339a]/50 p-1 shadow-[0_0_35px_rgba(246,51,154,0.6)] transition-transform duration-500 group-hover/content:scale-105" />
              </div>

              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-1 group-hover/content:text-[#f6339a] transition-colors">
                {post.username || 'Usuario'}
              </h3>

              <div className="flex items-center justify-center gap-2 mb-4">
                {(post.rol || '').toLowerCase() === 'profesor' ? (
                  <span className="text-[10px] text-[#FFD700] font-black uppercase tracking-[0.12em] px-2 py-0.5 rounded-md bg-[#FFD700]/10 border border-[#FFD700]/20 w-fit shadow-[0_0_10px_rgba(255,215,0,0.1)]">
                    PROFESOR
                  </span>
                ) : (
                  <span className="text-[10px] text-[#f6339a] font-black uppercase tracking-[0.12em] px-2 py-0.5 rounded-md bg-[#f6339a]/10 border border-[#f6339a]/20 w-fit shadow-[0_0_10px_rgba(246,51,154,0.1)]">
                    ESTUDIANTE
                  </span>
                )}
              </div>
            </header>

            <div className="px-2 text-center mb-2 w-full">
              <p className="text-[17px] md:text-[18px] leading-relaxed text-white/95 whitespace-pre-wrap break-words font-light group-hover/content:text-white transition-colors">
                {post.content}
              </p>
              
              {/* Reproductor de Audio Neón */}
              {post.audio_url && (
                <div className="mt-4 w-full">
                  <AudioPlayer src={post.audio_url} />
                </div>
              )}
            </div>
          </Link>

          {!isOwnPost && !isFollowing && (
            <button onClick={handleFollow} className="px-5 py-2 bg-gradient-to-r from-[#f6339a] to-[#9810fa] rounded-full text-white text-[12px] font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(246,51,154,0.3)]">
              Seguir
            </button>
          )}

          {/* Acciones Inline Contenidas */}
          <div className="w-full flex justify-center gap-4 pt-4 border-t border-white/[0.03]">
            <button onClick={handleLikeButton} 
              className={`flex items-center gap-3 px-7 py-3 rounded-full transition-all active:scale-95 shadow-lg bg-white/10 text-white hover:bg-white/20`}
            >
              <motion.div whileTap={{ scale: 0.8 }}>
                <HeartIcon filled={hasLiked} className="w-[22px] h-[22px]" />
              </motion.div>
              <span className={`font-extrabold text-[14px] tracking-wide ${hasLiked ? 'text-[#f6339a]' : 'text-white'}`}>{formatCount(likesCount)}</span>
            </button>

            <button onClick={loadComments} 
              className="flex items-center gap-3 px-7 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 shadow-lg"
            >
              <CommentIcon className="w-[22px] h-[22px]" />
              <span className="font-extrabold text-[14px] tracking-wide">{formatCount(Number(post.comments_count) || 0)}</span>
            </button>
          </div>
        </div>

        {/* Comentarios Expansibles */}
        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 bg-black/20 overflow-hidden rounded-b-[24px]">
              <div className="max-h-[350px]">
                <CommentsList comments={comments} newComment={newComment} setNewComment={setNewComment} handleAddComment={handleAddComment} isSubmittingComment={isSubmittingComment} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    );
  }

  /* =========================================
     DISEÑO 2: POST MEDIA (ESTILO TIKTOK/REELS)
     ========================================= */
  return (
    <article className="w-full max-w-[420px] sm:max-w-md mx-auto mb-8 relative bg-[#0a0a0a] rounded-[32px] overflow-hidden shadow-2xl">
      <div className="relative w-full aspect-[4/5] sm:aspect-[9/16] max-h-[85vh] cursor-pointer group flex items-center justify-center bg-black" onClick={handleDoubleTap}>

        <Link href={`/profile/${post.user_id}`} className="absolute inset-0 z-0">
          <img src={post.image_url} alt="" className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20 pointer-events-none" />
        </Link>

        <AnimatePresence>
          {showHeartBurst && (
            <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1.2, rotate: [-10, 10, 0] }} exit={{ opacity: 0, scale: 1.5 }} transition={{ type: 'spring', damping: 15 }}>
              <HeartIcon filled className="w-32 h-32 text-[#f6339a] drop-shadow-[0_0_40px_rgba(246,51,154,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Acciones Laterales */}
        <div className="absolute bottom-6 right-3 flex flex-col items-center gap-6 z-20">
          <div className="relative mb-2">
            <Link href={`/profile/${post.user_id}`} className="relative block">
              <div className="absolute inset-[-6px] bg-[#f6339a] blur-xl opacity-50 rounded-full"></div>
              <img src={avatarSrc} className="relative w-12 h-12 rounded-full object-cover border-2 border-[#f6339a] shadow-[0_0_20px_rgba(246,51,154,0.7)] transition-transform hover:scale-110" alt="" />
            </Link>
            {!isOwnPost && !isFollowing && (
              <button onClick={handleFollow} className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#f6339a] text-white rounded-full w-[24px] h-[24px] flex items-center justify-center text-sm font-bold border-2 border-[#0a0a0a] hover:scale-110 transition-transform shadow-lg">
                +
              </button>
            )}
          </div>

          <button onClick={handleLikeButton} className="flex flex-col items-center gap-1 group">
            <motion.div whileTap={{ scale: 0.8 }} 
              className={`p-3 rounded-full shadow-2xl transition-colors bg-white/10 text-white backdrop-blur-md hover:bg-white/20`}
            >
              <HeartIcon filled={hasLiked} className="w-7 h-7" />
            </motion.div>
            <span className={`text-xs font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${hasLiked ? 'text-[#f6339a]' : 'text-white'}`}>{formatCount(likesCount)}</span>
          </button>

          <button onClick={loadComments} className="flex flex-col items-center gap-1 group">
            <div className="p-3 rounded-full bg-white/10 text-white backdrop-blur-md shadow-2xl group-hover:bg-white/20 transition-all">
              <CommentIcon className="w-7 h-7" />
            </div>
            <span className="text-white text-xs font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{formatCount(Number(post.comments_count) || 0)}</span>
          </button>
        </div>

        {/* Info Inferior */}
        <div className="absolute bottom-6 left-4 right-16 z-10 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${post.user_id}`} className="text-white font-extrabold text-[16px] hover:underline drop-shadow-md">
              @{post.username || 'usuario'}
            </Link>
            {(post.rol || '').toLowerCase() === 'profesor' ? (
              <span className="text-[9px] text-[#FFD700] font-black uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-[#FFD700]/20 border border-[#FFD700]/40 backdrop-blur-md">
                PROFESOR
              </span>
            ) : (
              <span className="text-[9px] text-[#f6339a] font-black uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-[#f6339a]/20 border border-[#f6339a]/40 backdrop-blur-md">
                ESTUDIANTE
              </span>
            )}
          </div>

          {post.content && (
            <p className="text-white/95 text-[14px] line-clamp-2 leading-snug drop-shadow-md font-light mb-1">
              {post.content}
            </p>
          )}
        </div>
      </div>

      {/* Cajón de Comentarios (BottomSheet) */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute bottom-0 left-0 w-full h-[65%] bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 z-50 flex flex-col rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <span className="text-white font-bold text-[15px]">Comentarios <span className="text-white/40 ml-1">{post.comments_count}</span></span>
              <button onClick={() => setShowComments(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <CommentsList comments={comments} newComment={newComment} setNewComment={setNewComment} handleAddComment={handleAddComment} isSubmittingComment={isSubmittingComment} />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}