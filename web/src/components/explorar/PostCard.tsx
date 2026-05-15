'use client';

// REDISEÑO FINAL — basado en foto de referencia (imagen 2):
// HEADER: avatar redondo | nombre bold + subtítulo "Rol · Fecha" | ••• verticales derecha
// CONTENIDO: texto blanco/85 con hashtags #f6339a, imagen redondeada con margen lateral
// STATS ROW: 👍 {n} likes  💬 {n} comentarios  ↗ 187 share  |  🔖 extremo derecho
// COMMENT INPUT: avatar "T" + pill azul (#5C67D6) + 3 botones circulares oscuros (📎 😊 ➤azul)

import { useState, useRef, useCallback } from 'react';
import { toggleLike, getComments, addComment, toggleFollow, deletePost } from '@/actions/socialActions';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=1a1d23&color=fff&bold=true&size=128&name=';

/* ── Modern Icons (Trazo 1.5) ── */
const ThumbUpIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill={filled ? 'url(#likeGrad)' : 'none'} stroke={filled ? '#f6339a' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <linearGradient id="likeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f6339a" />
        <stop offset="100%" stopColor="#9810fa" />
      </linearGradient>
    </defs>
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);
const CommentBubbleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);
const ForwardIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 5a3 3 0 0 0-3 3v2a4 4 0 0 0-4 4h0v4c0 .6.4 1 1 1h0c.6 0 1-.4 1-1h0v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2h0v4c0 .6.4 1 1 1h0c.6 0 1-.4 1-1h0v-4" />
    <polyline points="15 3 21 8 15 13" />
  </svg>
);
const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);
const MoreDotsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
  </svg>
);
const ClipIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.234 20.252a16.896 16.896 0 0 1-5.566-6.504" />
    <path d="M13.234 20.252a16.896 16.896 0 0 0 5.566-6.504" />
    <path d="M10.766 3.748a16.896 16.896 0 0 1 5.566 6.504" />
    <path d="M10.766 3.748a16.896 16.896 0 0 0-5.566 6.504" />
    <path d="M21.44 11.05a8 8 0 1 1-16-5 8 8 0 0 1 16 5Z" />
    <line x1="8.16" y1="13.75" x2="15.84" y2="10.25" />
    <line x1="15.84" y1="13.75" x2="8.16" y2="10.25" />
  </svg>
);
const EmojiIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);
const MicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" />
  </svg>
);
const PlayIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5 ml-0.5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;

/* ── Audio Player ── */
function AudioPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const fmt = (s: number) => isFinite(s) ? `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}` : '0:00';
  const toggle = (e: React.MouseEvent) => { e.stopPropagation(); if (!ref.current) return; playing ? ref.current.pause() : ref.current.play(); setPlaying(!playing); };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => { e.stopPropagation(); if (!ref.current) return; const b = e.currentTarget.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)); const t = p * ref.current.duration; if (isFinite(t)) { ref.current.currentTime = t; setProg(p * 100); } };
  return (
    <div className="flex items-center gap-3 bg-[#0d0f12] rounded-xl px-3 py-2.5" onClick={e => e.stopPropagation()}>
      <audio ref={ref} src={src} className="hidden"
        onTimeUpdate={() => { if (ref.current) { setCur(ref.current.currentTime); if (ref.current.duration > 0) setProg((ref.current.currentTime / ref.current.duration) * 100); } }}
        onLoadedMetadata={() => { if (ref.current) setDur(ref.current.duration); }}
        onEnded={() => { setPlaying(false); setProg(0); }}
      />
      <button onClick={toggle} className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f6339a] to-[#9810fa] flex items-center justify-center text-white flex-shrink-0 hover:scale-105 active:scale-95 transition-transform">
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="flex-1">
        <div className="w-full h-1 bg-white/10 rounded-full cursor-pointer" onClick={seek}>
          <div className="h-full bg-gradient-to-r from-[#f6339a] to-[#9810fa] rounded-full transition-all duration-75" style={{ width: `${prog}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-white/30 font-mono mt-1"><span>{fmt(cur)}</span><span>{fmt(dur)}</span></div>
      </div>
    </div>
  );
}

const fmtCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

/* ── PostCard ── */
export default function PostCard({ post, currentUserId, currentUserAvatar }: { post: any; currentUserId: string; currentUserAvatar?: string }) {
  const isOwnPost = post.user_id === currentUserId;
  const [hasLiked, setHasLiked] = useState(post.hasLiked ?? false);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count) || 0);
  const [isFollowing, setIsFollowing] = useState(post.isFollowing ?? false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentImageFile, setCommentImageFile] = useState<File | null>(null);
  const [commentAudioFile, setCommentAudioFile] = useState<File | null>(null);
  const commentImageRef = useRef<HTMLInputElement>(null);
  const commentAudioRef = useRef<HTMLInputElement>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const avatarSrc = post.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(post.username || 'U')}`;
  const isProfesor = post.rol?.toLowerCase() === 'profesor';
  const dateStr = post.created_at ? new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';

  const handleLike = useCallback(async () => {
    setHasLiked((p: boolean) => !p);
    setLikesCount((p: number) => p + (hasLiked ? -1 : 1));
    await toggleLike(post.id);
  }, [post.id, hasLiked]);

  const loadComments = async () => {
    if (!showComments && comments.length === 0) {
      const res = await getComments(post.id);
      if (res.success && res.data) setComments(res.data);
    }
    setShowComments(v => !v);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && !commentImageFile && !commentAudioFile) return;
    setIsSubmittingComment(true);

    let uploadedImageUrl = null;
    let uploadedAudioUrl = null;
    const supabase = createClient();

    if (commentImageFile) {
      const ext = commentImageFile.name.split('.').pop();
      const fileName = `${currentUserId}-comment-${Date.now()}.${ext}`;
      const { data } = await supabase.storage.from('posts_images').upload(fileName, commentImageFile);
      if (data) {
        uploadedImageUrl = supabase.storage.from('posts_images').getPublicUrl(fileName).data.publicUrl;
      }
    }

    if (commentAudioFile) {
      const ext = commentAudioFile.name.split('.').pop();
      const fileName = `${currentUserId}-comment-audio-${Date.now()}.${ext}`;
      const { data } = await supabase.storage.from('posts_images').upload(fileName, commentAudioFile);
      if (data) {
        uploadedAudioUrl = supabase.storage.from('posts_images').getPublicUrl(fileName).data.publicUrl;
      }
    }

    const res = await addComment(post.id, newComment, uploadedImageUrl, uploadedAudioUrl);
    if (res.success) {
      setComments(prev => [...prev, {
        id: 'tmp-' + Date.now(),
        content: newComment,
        image_url: uploadedImageUrl,
        audio_url: uploadedAudioUrl,
        created_at: new Date().toISOString(),
        usuarios: { nombre: 'Tú', avatar_url: currentUserAvatar || '' }
      }]);
      setNewComment('');
      setCommentImageFile(null);
      setCommentAudioFile(null);
    }
    setIsSubmittingComment(false);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Publicación de ${post.username || 'Usuario'}`,
          text: post.content ? post.content.substring(0, 100) : 'Mira esta publicación en SmarTune',
          url: `${window.location.origin}/explorar#post-${post.id}`
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/explorar#post-${post.id}`);
        alert('Enlace copiado al portapapeles');
      }
    } catch (e) {
      console.log('Error sharing', e);
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFollowing((v: boolean) => !v);
    await toggleFollow(post.user_id);
  };

  const handleDelete = async () => {
    if (!confirm('¿Borrar esta publicación?')) return;
    setIsDeleting(true);
    const res = await deletePost(post.id);
    if (res.success) setIsDeleted(true);
    else { setIsDeleting(false); alert('Error al borrar'); }
  };

  if (isDeleted) return null;

  return (
    // Card: fondo oscuro #16181c, sin borde — igual a foto 2
    <article className="w-full bg-[#16181c] rounded-2xl overflow-visible shadow-xl border border-white/5">

      {/* ══ HEADER ══ */}
      <div className="flex items-center justify-between px-4 pt-4 pb-4">
        <Link href={`/profile/${post.user_id}`} className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div className={`w-11 h-11 rounded-full flex-shrink-0 p-[2px] ${isProfesor ? 'bg-gradient-to-tr from-[#f6339a] to-[#9810fa]' : 'bg-white/[0.08]'}`}>
            <div className="w-full h-full rounded-full overflow-hidden bg-[#16181c]">
              <img src={avatarSrc} alt={post.username} className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Nombre + Rol · Fecha */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[15px] font-bold text-white leading-tight">{post.username || 'Usuario'}</span>
              {isProfesor && (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              )}
              {!isOwnPost && !isFollowing && (
                <button onClick={handleFollow} className="text-[12px] font-bold text-[#f6339a] hover:opacity-70 transition-opacity">
                  · Seguir
                </button>
              )}
            </div>
            <p className="text-[13px] text-white/40 leading-tight mt-0.5">
              {isProfesor ? 'Profesor' : 'Estudiante'}{dateStr ? ` · ${dateStr}` : ''}
            </p>
          </div>
        </Link>

        {/* ••• menú */}
        <div className="relative flex-shrink-0 ml-2">
          <button onClick={() => setShowMenu(v => !v)} className="w-8 h-8 flex items-center justify-center text-white/35 hover:text-white/70 rounded-full hover:bg-white/5 transition-colors">
            <MoreDotsIcon />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="absolute right-[-3px] top-10 z-50"
                style={{
                  background: '#16181d',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px',
                  boxShadow: '0 24px 56px rgba(0,0,0,0.7)',
                  minWidth: '180px',
                  padding: '10px 0',
                }}
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  className="w-full text-left px-5 py-3.5 transition-colors hover:bg-white/[0.04]"
                  onClick={() => setShowMenu(false)}
                  style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                >
                  Guardar
                </button>

                <button
                  className="w-full text-left px-5 py-3.5 transition-colors hover:bg-white/[0.04]"
                  onClick={() => setShowMenu(false)}
                  style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                >
                  Reportar
                </button>

                {isOwnPost && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 16px' }} />

                    <button
                      className="w-full text-left px-5 py-3.5 transition-colors hover:bg-white/[0.04]"
                      onClick={() => setShowMenu(false)}
                      style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => { setShowMenu(false); handleDelete(); }}
                      disabled={isDeleting}
                      className="w-full text-left px-5 py-3.5 transition-colors hover:bg-red-500/[0.08]"
                      style={{ color: '#f87171', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ══ TEXTO con hashtags coloreados ══ */}
      {post.content && (
        <div className="px-4 pb-4">
          <p className="text-[14px] text-white/85 leading-relaxed whitespace-pre-wrap break-words">
            {post.content.split(' ').map((word: string, i: number) =>
              word.startsWith('#')
                ? <span key={i} className="text-[#f6339a] hover:underline cursor-pointer">{word} </span>
                : word + ' '
            )}
          </p>
        </div>
      )}

      {/* ══ IMAGEN — click abre lightbox ══ */}
      {post.image_url && (
        <div className="px-4 pb-5">
          <div
            className="w-full rounded-xl overflow-hidden bg-black/40 max-h-[500px] cursor-zoom-in"
            onClick={() => setLightboxImg(post.image_url)}
          >
            <img src={post.image_url} alt="Post media" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
          </div>
        </div>
      )}

      {/* Audio */}
      {post.audio_url && (
        <div className="px-4 pb-5">
          <AudioPlayer src={post.audio_url} />
        </div>
      )}

      {/* ══ STATS ROW — centrado con padding vertical ══ */}
      <div className="relative border-t border-white/[0.06] flex items-center justify-center" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="flex items-center justify-center gap-10">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 transition-all duration-200"
            style={hasLiked ? {
              background: 'linear-gradient(90deg, #f6339a, #9810fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 6px rgba(246,51,154,0.5))'
            } : { color: 'rgba(255,255,255,0.45)' }}
          >
            <ThumbUpIcon filled={hasLiked} />
            <span className="text-[13px] font-medium tracking-tight">{fmtCount(likesCount)} LIKES</span>
          </button>
          {/* Comments */}
          <button
            onClick={loadComments}
            className="flex items-center gap-2 transition-all duration-200"
            style={showComments ? {
              background: 'linear-gradient(90deg, #f6339a, #9810fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 6px rgba(246,51,154,0.5))'
            } : { color: 'rgba(255,255,255,0.45)' }}
          >
            <CommentBubbleIcon />
            <span className="text-[13px] font-medium tracking-tight">{fmtCount(Number(post.comments_count) || 0)} COMENTARIOS</span>
          </button>
          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 transition-all duration-200 hover:text-white/80"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            <ForwardIcon />
            <span className="text-[13px] font-medium tracking-tight hidden sm:inline">SHARE</span>
          </button>
        </div>
        {/* Bookmark */}
        <button className="absolute right-5 text-white/35 hover:text-white/70 transition-colors">
          <BookmarkIcon />
        </button>
      </div>

      {/* ══ COMMENT INPUT — separado con margen superior (mt-3) ══
          [avatar] [─── entrada con clip/emoji ───] [➤]
      */}
      <div className="px-5 pb-6 mt-3">
        <form onSubmit={handleAddComment} className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#0d0f12]">
            <img src={currentUserAvatar || DEFAULT_AVATAR + 'Tú'} alt="Tú" className="w-full h-full object-cover" />
          </div>

          {/* Campo de entrada con iconos internos */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {/* Previsualización de archivos adjuntos */}
            {(commentImageFile || commentAudioFile) && (
              <div className="flex items-center gap-2 px-2">
                {commentImageFile && (
                  <span className="text-[11px] bg-white/10 px-2 py-1 rounded text-white/70 truncate max-w-[120px] flex items-center gap-1">
                    📸 {commentImageFile.name}
                    <button type="button" onClick={() => setCommentImageFile(null)} className="ml-1 text-[#f6339a] hover:text-white">✕</button>
                  </span>
                )}
                {commentAudioFile && (
                  <span className="text-[11px] bg-white/10 px-2 py-1 rounded text-white/70 truncate max-w-[120px] flex items-center gap-1">
                    🎵 {commentAudioFile.name}
                    <button type="button" onClick={() => setCommentAudioFile(null)} className="ml-1 text-[#9810fa] hover:text-white">✕</button>
                  </span>
                )}
              </div>
            )}

            <div className="bg-[#1e2229] border border-white/5 rounded-full px-4 py-2.5 flex items-center gap-2.5 min-w-0 transition-colors focus-within:border-white/10">
              {/* Input */}
              <input
                type="text"
                placeholder="Escribe tu comentario..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/40 leading-none"
              />
              {/* Iconos de entrada: clip y mic */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button type="button" onClick={() => commentImageRef.current?.click()} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-[#f6339a] transition-colors" title="Adjuntar Imagen">
                  <ClipIcon />
                </button>
                <input type="file" accept="image/*" className="hidden" ref={commentImageRef} onChange={e => { if (e.target.files?.[0]) setCommentImageFile(e.target.files[0]) }} />

                <button type="button" onClick={() => commentAudioRef.current?.click()} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-[#9810fa] transition-colors" title="Adjuntar Audio">
                  <MicIcon />
                </button>
                <input type="file" accept="audio/*" className="hidden" ref={commentAudioRef} onChange={e => { if (e.target.files?.[0]) setCommentAudioFile(e.target.files[0]) }} />
              </div>
            </div>
          </div>

          {/* Botón: Send — con degradado */}
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmittingComment}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#f6339a] to-[#9810fa] flex items-center justify-center text-white hover:opacity-90 disabled:opacity-35 transition-opacity flex-shrink-0"
          >
            {isSubmittingComment
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <SendIcon />}
          </button>
        </form>
      </div>

      {/* ══ COMENTARIOS EXPANDIDOS ══ */}
      <AnimatePresence>
        {showComments && comments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/[0.05] bg-[#0d0f12] overflow-hidden rounded-b-2xl"
          >
            <div className="max-h-[300px] overflow-y-auto p-4 flex flex-col gap-3">
              {comments.map((c: any, i: number) => (
                <div key={i} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-[#16181c] mt-0.5">
                    <img src={c.usuarios?.avatar_url || DEFAULT_AVATAR + 'C'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#1e2229] rounded-[14px] rounded-tl-sm px-3 py-2 inline-block min-w-[120px]">
                      <p className="text-[11px] font-bold text-white mb-0.5">{c.usuarios?.nombre}</p>
                      {c.content && <p className="text-[13px] text-white/85 leading-snug whitespace-pre-wrap">{c.content}</p>}
                      {c.image_url && <img src={c.image_url} alt="Comentario media" className="mt-2 w-full max-w-[200px] rounded-lg border border-white/5" />}
                      {c.audio_url && <audio controls src={c.audio_url} className="mt-2 w-full max-w-[200px] h-8" />}
                    </div>
                    <div className="flex gap-4 mt-2 ml-2 text-[11px] text-white/35">
                      <span>Ahora</span>
                      <button className="hover:text-white/60 transition-colors">Like</button>
                      <button className="hover:text-white/60 transition-colors">Responder</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ LIGHTBOX ══ */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setLightboxImg(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={lightboxImg}
                alt="Imagen ampliada"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              />
              {/* Cerrar */}
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}