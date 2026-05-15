'use client';

// CAMBIOS:
// - Card con bg #1a1d23 y borde sutil, igual que PostCard (feed uniforme)
// - Botón submit cambiado a "Add New Post +" con color azul-violeta (#5C67D6) como en la foto
// - Textarea minimalista sin bordes extra
// - Animación de focus sutil (solo borde, sin glow pesado)
// - Separador fino entre el texto y las acciones
// - Íconos de imagen y audio más pequeños y alineados a la izquierda

import { useState, useRef, useEffect } from 'react';
import { createPost } from '@/actions/socialActions';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=1a1d23&color=fff&bold=true&size=128&name=U';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ImageIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);
const MusicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);

export default function CreatePost({ onPostCreated, avatarUrl }: { onPostCreated?: (post: any) => void; avatarUrl?: string }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileImageRef = useRef<HTMLInputElement>(null);
  const fileAudioRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [content]);

  const removeImage = () => { setImage(null); setImagePreview(null); if (fileImageRef.current) fileImageRef.current.value = ''; };
  const removeAudio = () => { setAudio(null); if (fileAudioRef.current) fileAudioRef.current.value = ''; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image && !audio) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      let imageUrl: string | null = null;
      let audioUrl: string | null = null;

      if (image && image.size > 0) {
        const ext = image.name.split('.').pop();
        const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage.from('posts_images').upload(name, image);
        if (error) throw new Error(error.message);
        imageUrl = supabase.storage.from('posts_images').getPublicUrl(data.path).data.publicUrl;
      }
      if (audio && audio.size > 0) {
        const ext = audio.name.split('.').pop();
        const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage.from('posts_audio').upload(name, audio);
        if (error) throw new Error(error.message);
        audioUrl = supabase.storage.from('posts_audio').getPublicUrl(data.path).data.publicUrl;
      }

      const fd = new FormData();
      fd.append('content', content);
      if (imageUrl) fd.append('image_url', imageUrl);
      if (audioUrl) fd.append('audio_url', audioUrl);

      const res = await createPost(fd);
      if (res.success) {
        onPostCreated?.({ username: 'Tú', avatar_url: avatarUrl, likes_count: 0, comments_count: 0, hasLiked: false, created_at: new Date().toISOString(), id: 'temp-' + Date.now() });
        setContent('');
        removeImage();
        removeAudio();
      } else {
        alert('Error al publicar: ' + (res.error || 'Intenta de nuevo'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPost = content.trim().length > 0 || image !== null || audio !== null;

  return (
    // CAMBIO: Card idéntica al PostCard — bg-[#1a1d23] + borde sutil, para feed uniforme
    <div
      className={`w-full bg-[#1a1d23] border rounded-2xl overflow-hidden transition-all duration-300 ${isFocused ? 'border-white/15' : 'border-white/[0.06]'
        }`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col p-6">

        {/* Row: avatar + textarea */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/[0.08]">
            <img src={avatarUrl || DEFAULT_AVATAR} alt="Tu avatar" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent text-[16px] text-white/90 placeholder:text-white/25 focus:outline-none resize-none leading-relaxed"
              placeholder="¿Qué ritmo traes hoy?"
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={4}
              style={{ minHeight: '120px' }}
            />

            {/* Preview imagen */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="relative mt-2 rounded-xl overflow-hidden border border-white/[0.06] max-w-[80%]"
                >
                  <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-[240px]" />
                  <button type="button" onClick={removeImage} className="absolute top-2 right-2 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#f6339a] transition-colors">
                    <CloseIcon />
                  </button>
                </motion.div>
              )}
              {audio && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2 flex items-center gap-3 bg-[#12151a] border border-white/[0.06] rounded-xl px-3 py-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f6339a] to-[#9810fa] flex items-center justify-center flex-shrink-0">
                    <MusicIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white font-semibold truncate">{audio.name}</p>
                    <p className="text-[11px] text-white/35">{(audio.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={removeAudio} className="text-white/30 hover:text-white transition-colors">
                    <CloseIcon />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="w-full h-px bg-white/[0.05] mt-3 mb-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => fileImageRef.current?.click()} className="w-8 h-8 rounded-full flex items-center justify-center text-white/35 hover:text-[#f6339a] hover:bg-[#f6339a]/10 transition-colors" title="Imagen">
              <ImageIcon />
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileImageRef} onChange={e => { const f = e.target.files?.[0]; if (f) { setImage(f); setImagePreview(URL.createObjectURL(f)); } }} />

            <button type="button" onClick={() => fileAudioRef.current?.click()} className="w-8 h-8 rounded-full flex items-center justify-center text-white/35 hover:text-[#9810fa] hover:bg-[#9810fa]/10 transition-colors" title="Audio">
              <MusicIcon />
            </button>
            <input type="file" accept="audio/mpeg,audio/mp3" className="hidden" ref={fileAudioRef} onChange={e => { const f = e.target.files?.[0]; if (f) setAudio(f); }} />
          </div>

          {/* CAMBIO: Botón corregido con color sólido #5C67D6 */}
          <button
            type="submit"
            disabled={!canPost || isSubmitting}
            className={`flex items-center justify-center gap-2 transition-all duration-200 ${!canPost || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 hover:-translate-y-[1px] active:scale-95'}`}
            style={{
              background: 'linear-gradient(90deg, #f6339a 0%, #9810fa 100%)',
              color: '#ffffff',
              padding: '8px 20px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              minWidth: '140px',
              boxShadow: '0px 12.5px 18.75px 0px rgba(246,51,154,0.3), 0px 5px 7.5px 0px rgba(246,51,154,0.3)',
              cursor: !canPost || isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ...
              </span>
            ) : (
              <>
                Publicar post <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}