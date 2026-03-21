'use client';
import { useState, useRef } from 'react';
import { createPost } from '@/actions/socialActions';

export default function CreatePost({ onPostCreated, avatarUrl }: { onPostCreated: (post: any) => void, avatarUrl?: string }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
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
      onPostCreated({
        ...res.data,
        username: 'Tú',
        avatar_url: avatarUrl,
        likes_count: 0,
        comments_count: 0,
        hasLiked: false
      });
      setContent('');
      setImage(null);
      setImagePreview(null);
    } else {
      alert('Error al publicar: ' + (res.error || 'Intenta de nuevo'));
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5" id="create-post-section">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Tu Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#f6339a] to-[#0e9eef] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <textarea
              className="w-full bg-transparent border-none resize-none text-lg text-white placeholder:text-gray-500/60 focus:ring-0 focus:outline-none p-0"
              placeholder="¿Qué está pulsando hoy?"
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#f6339a]/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-[#f6339a] transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* Bottom Action Bar — Figma exact: icons left, Postear button right */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-4 text-gray-400">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-[#f6339a] transition-colors flex items-center">
                  <span className="material-symbols-outlined text-xl">image</span>
                </button>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                <button type="button" className="hover:text-[#f6339a] transition-colors flex items-center">
                  <span className="material-symbols-outlined text-xl">gif_box</span>
                </button>
                <button type="button" className="hover:text-[#f6339a] transition-colors flex items-center">
                  <span className="material-symbols-outlined text-xl">bar_chart</span>
                </button>
                <button type="button" className="hover:text-[#f6339a] transition-colors flex items-center">
                  <span className="material-symbols-outlined text-xl">mood</span>
                </button>
              </div>
              <button
                type="submit"
                disabled={(!content.trim() && !image) || isSubmitting}
                className={`px-8 py-2 font-bold rounded-full transition-all ${
                  ((!content.trim() && !image) || isSubmitting)
                    ? 'bg-[#2a2a35] text-gray-500 cursor-not-allowed'
                    : 'bg-[#f6339a] text-white hover:shadow-[0_0_15px_rgba(246,51,154,0.4)] hover:scale-[1.02] active:scale-95'
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {isSubmitting ? 'Posteando...' : 'Postear'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
