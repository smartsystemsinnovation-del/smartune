'use client';
import { useState, useRef } from 'react';
import { createPost } from '@/actions/socialActions';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=ea88ff&color=fff&bold=true&size=128&name=U';

/* SVG Icons */
const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Icons matching the reference image exactly
const FileIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const PublicIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
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
    <div className="relative rounded-[24px] p-[1px] overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(152,16,250,0.3) 0%, rgba(46,30,66,0.2) 50%, rgba(152,16,250,0.15) 100%)' }}>
      <div className="bg-[#1a1025]/80 backdrop-blur-xl rounded-[23px] p-5">
        <form onSubmit={handleSubmit}>
          {/* Input row with avatar */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#9810fa]/40 bg-[#2a2040]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                className="w-full bg-transparent text-[14px] text-white placeholder:text-white/30 focus:outline-none"
                placeholder="Share something"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-4 rounded-xl overflow-hidden bg-black max-w-[180px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full object-cover" />
              <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-[#ea88ff] transition-colors">
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Action bar - EXACTLY matching Foto 2: File | Image | Location | Public ... [Send] */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-5 text-white/40">
              <button type="button" className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
                <FileIcon className="w-[18px] h-[18px]" />
                <span className="text-[12px] font-medium hidden sm:inline">File</span>
              </button>

              <button type="button" className="flex items-center gap-1.5 hover:text-white/70 transition-colors" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="w-[18px] h-[18px]" />
                <span className="text-[12px] font-medium hidden sm:inline">Image</span>
              </button>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

              <button type="button" className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
                <LocationIcon className="w-[18px] h-[18px]" />
                <span className="text-[12px] font-medium hidden sm:inline">Location</span>
              </button>

              <button type="button" className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
                <PublicIcon className="w-[18px] h-[18px]" />
                <span className="text-[12px] font-medium hidden sm:inline">Public</span>
              </button>
            </div>

            <button type="submit" disabled={(!content.trim() && !image) || isSubmitting}
              className={`px-6 py-2 rounded-xl font-bold text-[13px] transition-all duration-200 ${
                ((!content.trim() && !image) || isSubmitting)
                  ? 'bg-white/[0.04] text-white/15 cursor-not-allowed'
                  : 'bg-white text-[#0d0714] hover:bg-white/90 active:scale-95'
              }`}>
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
