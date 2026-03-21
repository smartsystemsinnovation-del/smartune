'use client';
import { useState, useRef } from 'react';
import { createPost } from '@/actions/socialActions';

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

  const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=f6339a&color=fff&bold=true&size=128&name=U';

  return (
    <div className={`bg-[#1a1a22] rounded-2xl overflow-hidden border transition-all duration-300 ${isFocused ? 'border-[#f6339a]/20 shadow-[0_0_30px_rgba(246,51,154,0.06)]' : 'border-white/[0.04]'}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 p-4">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <textarea
              className="w-full bg-transparent resize-none text-[15px] text-white placeholder:text-white/25 focus:outline-none leading-relaxed"
              placeholder="¿Qué está pulsando hoy?"
              rows={isFocused || content ? 3 : 1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
            />
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mx-4 mb-3 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full max-h-[200px] object-cover" />
            <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-[#f6339a] transition-colors">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Action Row */}
        {(isFocused || content || imagePreview) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-[#0e9eef] hover:bg-[#0e9eef]/10 transition-all">
                <span className="material-symbols-outlined text-xl">image</span>
              </button>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-[#0e9eef] hover:bg-[#0e9eef]/10 transition-all">
                <span className="material-symbols-outlined text-xl">gif_box</span>
              </button>
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-[#0e9eef] hover:bg-[#0e9eef]/10 transition-all">
                <span className="material-symbols-outlined text-xl">mood</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={(!content.trim() && !image) || isSubmitting}
              className={`px-6 py-2 rounded-full font-bold text-[13px] transition-all duration-200 ${
                ((!content.trim() && !image) || isSubmitting)
                  ? 'bg-white/[0.06] text-white/20 cursor-not-allowed'
                  : 'bg-[#f6339a] text-white hover:bg-[#ff4db8] hover:shadow-[0_0_20px_rgba(246,51,154,0.3)] active:scale-95'
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
