'use client';
import { useState, useRef } from 'react';
import { createPost } from '@/actions/socialActions';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=f6339a&color=fff&bold=true&size=128&name=U';

/* SVG Icons */
const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
  </svg>
);

const GifIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="16" rx="2"/><text x="12" y="15" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="bold">GIF</text>
  </svg>
);

const SmileIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function CreatePost({ onPostCreated, avatarUrl }: { onPostCreated: (post: any) => void, avatarUrl?: string }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
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
    if (res.success && res.data) {
      onPostCreated({ ...res.data, username: 'Tú', avatar_url: avatarUrl, likes_count: 0, comments_count: 0, hasLiked: false });
      setContent(''); setImage(null); setImagePreview(null); setIsFocused(false);
    } else {
      alert('Error al publicar: ' + (res.error || 'Intenta de nuevo'));
    }
  };

  return (
    <div className={`bg-[#1a1a22] rounded-2xl overflow-hidden border transition-all duration-300 ${isFocused ? 'border-[#f6339a]/15 shadow-[0_0_30px_rgba(246,51,154,0.04)]' : 'border-white/[0.04]'}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 p-4">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <textarea
              className="w-full bg-transparent resize-none text-[15px] text-white placeholder:text-white/20 focus:outline-none leading-relaxed"
              placeholder="¿Qué está pulsando hoy?"
              rows={isFocused || content ? 3 : 1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
            />
          </div>
        </div>

        {imagePreview && (
          <div className="relative mx-4 mb-3 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full max-h-[200px] object-cover" />
            <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-[#f6339a] transition-colors">
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {(isFocused || content || imagePreview) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-full flex items-center justify-center text-white/25 hover:text-[#0e9eef] hover:bg-[#0e9eef]/10 transition-all">
                <ImageIcon className="w-5 h-5" />
              </button>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-white/25 hover:text-[#0e9eef] hover:bg-[#0e9eef]/10 transition-all">
                <GifIcon className="w-5 h-5" />
              </button>
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-white/25 hover:text-[#0e9eef] hover:bg-[#0e9eef]/10 transition-all">
                <SmileIcon className="w-5 h-5" />
              </button>
            </div>
            <button type="submit" disabled={(!content.trim() && !image) || isSubmitting}
              className={`px-6 py-2 rounded-full font-bold text-[13px] transition-all duration-200 ${
                ((!content.trim() && !image) || isSubmitting)
                  ? 'bg-white/[0.04] text-white/15 cursor-not-allowed'
                  : 'bg-[#f6339a] text-white hover:bg-[#ff4db8] hover:shadow-[0_0_20px_rgba(246,51,154,0.2)] active:scale-95'
              }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
