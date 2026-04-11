'use client';
import { useState, useRef } from 'react';
import { createPost } from '@/actions/socialActions';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=2e1e42&color=fff&bold=true&size=128&name=U';

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
      setContent(''); setImage(null); setImagePreview(null);
    } else {
      alert('Error al publicar: ' + (res.error || 'Intenta de nuevo'));
    }
  };

  return (
    <div className="bg-transparent border-b border-white/5 pb-4 mb-2">
      <form onSubmit={handleSubmit}>
        {/* Input row */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#2e1e42]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
          </div>
          <input
            type="text"
            className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/25 focus:outline-none"
            placeholder="Share something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="relative mt-4 rounded-xl overflow-hidden bg-black/30 max-w-[160px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full object-cover rounded-xl" />
            <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
              className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white">
              <CloseIcon className="w-2.5 h-2.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-4 text-white/25">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-white/50 transition-colors">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            <button type="button" className="hover:text-white/50 transition-colors">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </button>
            <button type="button" className="hover:text-white/50 transition-colors">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </button>
          </div>

          <button type="submit" disabled={(!content.trim() && !image) || isSubmitting}
            className={`px-5 py-1.5 rounded-full font-semibold text-[13px] transition-all ${
              ((!content.trim() && !image) || isSubmitting)
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-[var(--neon-purple)] text-white hover:opacity-90 active:scale-95'
            }`}>
            {isSubmitting ? '...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
