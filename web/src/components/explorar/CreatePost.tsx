'use client';
import { useState, useRef } from 'react';
import { createPost } from '@/actions/socialActions';
import Image from 'next/image';

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
      
      // Simple Toast Simulation
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-[#f6339a] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
      toast.innerText = '¡Publicación creada con éxito!';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
      
    } else {
      alert('Error al publicar: ' + (res.error || 'Intenta de nuevo'));
    }
  };

  return (
    <div className="bg-[#1a1a24] rounded-2xl p-5 shadow-[0_0_15px_rgba(246,51,154,0.1)] border border-[#2a2a35] w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f6339a] to-[#0e9eef] flex-shrink-0 overflow-hidden relative">
            {avatarUrl ? (
               // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Tu Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-full h-full text-white p-2 text-opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            )}
          </div>
          <textarea 
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none pt-2"
            rows={Math.max(2, content.split('\n').length)}
            placeholder="¿Qué estás escuchando o tocando hoy...?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        {imagePreview && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[#f6339a]/30 mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={() => { setImage(null); setImagePreview(null); }}
              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-[#f6339a] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-[#2a2a35]">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[#0e9eef] hover:text-[#0c8add] hover:bg-[#0e9eef]/10 p-2 rounded-full transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span className="text-sm font-medium">Foto</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange}
            />
          </div>
          
          <button 
            type="submit"
            disabled={(!content.trim() && !image) || isSubmitting}
            className={`px-6 py-2 rounded-full font-bold shadow-[0_0_10px_rgba(246,51,154,0.4)] transition-all ${((!content.trim() && !image) || isSubmitting) ? 'bg-[#f6339a]/50 text-white/50 cursor-not-allowed shadow-none' : 'bg-[#f6339a] text-white hover:bg-[#ff4db8] hover:scale-105'}`}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}
