'use client';
import { useState, useRef, useEffect } from 'react';
import { createPost } from '@/actions/socialActions';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=121212&color=fff&bold=true&size=128&name=U';

/* ── Icons ── */
const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18m9-9H3m15.364-6.364l-12.728 12.728m12.728 0L6.636 6.636" opacity="0.3" />
    <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="currentColor" stroke="none" />
  </svg>
);

const MusicNoteIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export default function CreatePost({ onPostCreated, avatarUrl }: { onPostCreated?: (post: any) => void, avatarUrl?: string }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputImageRef = useRef<HTMLInputElement>(null);
  const fileInputAudioRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      removeAudio(); // Only 1 type of media for now to keep it simple, or allow both? Let's allow both if needed, but typically it's image OR audio.
      // Wait, let's keep them separate but allow both or remove audio.
      // I'll leave them separate so user can attach image AND audio if they want.
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudio(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputImageRef.current) fileInputImageRef.current.value = '';
  };

  const removeAudio = () => {
    setAudio(null);
    if (fileInputAudioRef.current) fileInputAudioRef.current.value = '';
  };

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image && !audio) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);
    if (audio) formData.append('audio', audio);

    const res = await createPost(formData);
    setIsSubmitting(false);

    if (res.success) {
      onPostCreated?.({
        username: 'Tú',
        avatar_url: avatarUrl,
        likes_count: 0,
        comments_count: 0,
        hasLiked: false,
        created_at: new Date().toISOString(),
        id: 'temp-' + Date.now()
      });
      setContent('');
      removeImage();
      removeAudio();
    } else {
      alert('Error al publicar: ' + (res.error || 'Intenta de nuevo'));
    }
  };

  const isPostable = content.trim().length > 0 || image !== null || audio !== null;

  return (
    <div className="w-full max-w-[540px] mx-auto mb-10">
      {/* Contenedor de la Tarjeta */}
      <motion.div
        animate={{
          borderColor: isFocused ? 'rgba(246, 51, 154, 0.6)' : 'rgba(246, 51, 154, 0.15)',
          backgroundColor: isFocused ? '#0c0c0c' : '#0f0f0f',
          boxShadow: isFocused 
            ? '0 0 25px rgba(246,51,154,0.2), 0 10px 40px -10px rgba(0,0,0,0.5)' 
            : '0 0 15px rgba(246,51,154,0.08), 0 8px 32px rgba(0,0,0,0.4)'
        }}
        transition={{ duration: 0.4 }}
        className="rounded-[28px] border relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col p-5">

          <div className="flex gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={avatarUrl || DEFAULT_AVATAR}
                alt="Tu avatar"
                className="relative w-12 h-12 rounded-full object-cover border-[1.5px] border-[#0f0f0f]"
              />
            </div>

            <div className="flex-1 pt-1.5 min-w-0">
              <textarea
                ref={textareaRef}
                className="w-full bg-transparent text-[16px] md:text-[18px] text-white/95 placeholder:text-white/30 focus:outline-none resize-none font-light leading-relaxed custom-scrollbar"
                placeholder="¿Qué ritmo traes hoy?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                rows={1}
                style={{ minHeight: '50px' }}
              />

              <AnimatePresence>
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="relative mt-2 mb-2 rounded-[16px] overflow-hidden border border-white/10 shadow-lg group max-w-full sm:max-w-[80%]"
                  >
                    <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-[300px]" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#f6339a] hover:scale-110 transition-all duration-300 z-10"
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
                
                {audio && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="relative mt-2 mb-2 rounded-[12px] bg-white/[0.03] border border-[#9810fa]/30 p-3 flex items-center gap-3 shadow-[0_0_15px_rgba(152,16,250,0.1)]"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f6339a] to-[#9810fa] flex items-center justify-center flex-shrink-0 animate-pulse">
                      <MusicNoteIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-white font-semibold truncate">{audio.name}</p>
                      <p className="text-[11px] text-white/50">{(audio.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeAudio}
                      className="w-7 h-7 bg-black/40 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors"
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full h-px bg-white/[0.06] mt-4 mb-4"></div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputImageRef.current?.click()}
                className="flex items-center justify-center w-9 h-9 rounded-full text-[#f6339a] bg-[#f6339a]/10 hover:bg-[#f6339a]/20 transition-colors"
                title="Añadir Imagen"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input type="file" accept="image/*" className="hidden" ref={fileInputImageRef} onChange={handleImageChange} />

              <button 
                type="button" 
                onClick={() => fileInputAudioRef.current?.click()}
                className="flex items-center justify-center w-9 h-9 rounded-full text-[#9810fa] bg-[#9810fa]/10 hover:bg-[#9810fa]/20 transition-colors" 
                title="Ritmo / Audio"
              >
                <MusicNoteIcon className="w-5 h-5" />
              </button>
              <input type="file" accept="audio/mpeg, audio/mp3" className="hidden" ref={fileInputAudioRef} onChange={handleAudioChange} />

            </div>

            <button
              type="submit"
              disabled={!isPostable || isSubmitting}
              className={`flex items-center justify-center px-6 py-2.5 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 ${!isPostable || isSubmitting
                  ? 'bg-white/[0.05] text-white/20 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#f6339a] to-[#9810fa] text-white hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(246,51,154,0.3)]'
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Publicando...
                </span>
              ) : 'Publicar'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}