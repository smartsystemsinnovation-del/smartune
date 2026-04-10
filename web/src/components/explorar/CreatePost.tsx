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
    <div className={`bg-[#1a1a22] rounded-[32px] overflow-hidden border transition-all duration-300 p-4 ${isFocused ? 'border-white/10 shadow-lg' : 'border-white/[0.02] shadow-xl'}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 bg-[#111116] rounded-full p-2 pl-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              className="w-full bg-transparent text-[15px] text-white placeholder:text-white/30 focus:outline-none"
              placeholder="Share something"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
            />
          </div>
          <div className="pr-2 text-white/30 hover:text-white/60 cursor-pointer">
            <SmileIcon className="w-5 h-5 flex-shrink-0" />
          </div>
        </div>

        {imagePreview && (
          <div className="relative mt-4 rounded-2xl overflow-hidden bg-black max-w-[200px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full object-cover" />
            <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-[#f6339a] transition-colors">
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-4 text-white/50">
            {/* Actions mocked up as in the image */}
            <button type="button" className="flex items-center gap-1.5 hover:text-white transition-colors" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="w-5 h-5" />
              <span className="text-[13px] font-bold">Image</span>
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            
            <button type="button" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <GifIcon className="w-5 h-5" />
              <span className="text-[13px] font-bold">File</span>
            </button>

            <button type="button" className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-[13px] font-bold">Location</span>
            </button>
          </div>

          <button type="submit" disabled={(!content.trim() && !image) || isSubmitting}
            className={`px-6 py-2.5 rounded-full font-bold text-[14px] transition-all duration-200 ${
              ((!content.trim() && !image) || isSubmitting)
                ? 'bg-white/[0.04] text-white/15 cursor-not-allowed'
                : 'bg-white text-[#130921] hover:bg-gray-200 active:scale-95'
            }`}>
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
