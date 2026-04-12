'use client';
import { useState, useRef } from 'react';
import { createPost } from '@/actions/socialActions';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=121212&color=fff&bold=true&size=128&name=U';

/* ── Icons ── */
const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
  </svg>
);

const FileIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

export default function CreatePost({ onPostCreated, avatarUrl }: { onPostCreated?: (post: any) => void, avatarUrl?: string }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

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
    } else {
      alert('Error al publicar: ' + (res.error || 'Intenta de nuevo'));
    }
  };

  const isPostable = content.trim().length > 0 || image !== null;

  return (
    <div
      className={`w-full max-w-[540px] mx-auto mb-8 bg-[#0f0f0f] rounded-[24px] transition-all duration-300 ${isFocused
          ? 'border-[#f6339a]/40 shadow-[0_0_25px_rgba(246,51,154,0.1)]'
          : 'border-white/[0.05] shadow-lg'
        } border`}
    >
      <form onSubmit={handleSubmit} className="p-5">

        {/* Input Text Area (Expansible) */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
          </div>

          <textarea
            className="flex-1 bg-transparent text-[16px] text-white placeholder:text-white/30 focus:outline-none resize-none pt-2.5 font-light leading-relaxed custom-scrollbar"
            placeholder="¿Qué estás pensando?"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              // Auto-resize mágico (simple)
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={1}
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* Image Preview Decorado */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="relative overflow-hidden ml-16 rounded-[16px] border border-white/10 max-w-[280px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-[300px]" />

              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 hover:text-[#f6339a] transition-all"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar (Inferior) */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05] ml-16">

          {/* Herramientas (Botones) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-[#f6339a] bg-[#f6339a]/10 hover:bg-[#f6339a]/20 transition-colors"
              title="Añadir Imagen"
            >
              <ImageIcon className="w-[18px] h-[18px]" />
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

            <button type="button" className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <FileIcon className="w-[18px] h-[18px]" />
            </button>

            <button type="button" className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <LocationIcon className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Botón Publicar */}
          <button
            type="submit"
            disabled={!isPostable || isSubmitting}
            className={`px-6 py-2 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 ${!isPostable || isSubmitting
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#f6339a] to-[#9810fa] text-white hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(246,51,154,0.3)]'
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Publicando...
              </span>
            ) : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}