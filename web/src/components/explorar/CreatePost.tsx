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
      const newPost = {
         ...res.data,
         username: 'Tú', 
         avatar_url: avatarUrl,
         likes_count: 0,
         comments_count: 0,
         hasLiked: false
      };
      onPostCreated(newPost);
      setContent('');
      setImage(null);
      setImagePreview(null);
    } else {
      alert('Error al publicar: ' + (res.error || 'Intenta de nuevo'));
    }
  };

  return (
    <div className="w-full" id="create-post-section">
      <form onSubmit={handleSubmit}>
        {/* Input Row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f6339a] to-[#0e9eef] flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Tu Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-full h-full text-white p-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            )}
          </div>
          <input 
            type="text"
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-[14px] focus:outline-none"
            placeholder="¿Qué está pulsando hoy?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#f6339a]/30 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={() => { setImage(null); setImagePreview(null); }}
              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-[#f6339a] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        )}

        {/* Bottom Action Row - Matches Figma exactly: icons on left, Postear button on right */}
        <div className="flex justify-between items-center pt-3 border-t border-[#2a2a35]/40">
          <div className="flex items-center gap-1">
            {/* Image Upload */}
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-[#0e9eef] transition-colors rounded-lg hover:bg-[#0e9eef]/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            
            {/* Video */}
            <button type="button" className="p-2 text-gray-500 hover:text-[#0e9eef] transition-colors rounded-lg hover:bg-[#0e9eef]/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            
            {/* Poll */}
            <button type="button" className="p-2 text-gray-500 hover:text-[#0e9eef] transition-colors rounded-lg hover:bg-[#0e9eef]/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </button>
            
            {/* Emoji */}
            <button type="button" className="p-2 text-gray-500 hover:text-[#0e9eef] transition-colors rounded-lg hover:bg-[#0e9eef]/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </div>

          <button 
            type="submit"
            disabled={(!content.trim() && !image) || isSubmitting}
            className={`px-6 py-2 rounded-full font-bold text-[13px] transition-all ${
              ((!content.trim() && !image) || isSubmitting)
                ? 'bg-[#2a2a35] text-gray-500 cursor-not-allowed'
                : 'bg-[#f6339a] text-white hover:bg-[#ff4db8] hover:shadow-[0_0_15px_rgba(246,51,154,0.5)]'
            }`}
          >
            {isSubmitting ? 'Posteando...' : 'Postear'}
          </button>
        </div>
      </form>
    </div>
  );
}
