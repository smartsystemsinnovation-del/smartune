"use client";

import { useRef, useState } from 'react';

interface StoriesRowProps {
  currentUserAvatar?: string;
}

export default function StoriesRow({ currentUserAvatar }: StoriesRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // In a production setup, this sends the file to Supabase Storage first.
      // We simulate the successful backend call to our functional API endpoint.
      await fetch('/api/social/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_url: URL.createObjectURL(file) })
      });
      alert('¡Historia subida exitosamente!');
    } catch (error) {
      console.error(error);
      alert('Error subiendo historia');
    } finally {
      setIsUploading(false);
    }
  };

  const stories = [
    { id: 1, name: 'Lucia M.', img: 'https://images.unsplash.com/photo-1549834125-82d3c48159a3?w=150&q=80', active: true },
    { id: 2, name: 'Marc Beat', img: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=150&q=80', active: true },
    { id: 3, name: 'Alex R.', img: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=150&q=80', active: false },
    { id: 4, name: 'SynthWave', img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150&q=80', active: false },
  ];

  const defaultAvatar = 'https://utfs.io/f/cd2bb812-a1f9-4675-9257-238b6c0fe1b8-c906oz.png';

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-2 pt-4">
      <div className="flex gap-4 px-4 min-w-max">
        
        {/* Upload Story Button (Tu Historia) - Placed FIRST to match Figma */}
        <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`flex flex-col items-center gap-2 cursor-pointer group relative ${isUploading ? 'opacity-50' : ''}`}>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*" 
            onChange={handleStoryUpload} 
          />
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#f6339a] to-[#ff4db8] shadow-lg group-hover:scale-105 transition-transform relative">
            <div className="w-full h-full bg-[#121216] rounded-full overflow-hidden border-[3px] border-[#121216]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentUserAvatar || defaultAvatar} alt="Tu historia" className="w-full h-full object-cover" />
            </div>
            
            {/* The small overlapping + badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#f6339a] border-2 border-[#121216] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              {isUploading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-[11px] font-bold tracking-wide text-white">
            {isUploading ? 'Subiendo...' : 'Tu historia'}
          </span>
        </div>

        {stories.map(story => (
          <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className={`w-16 h-16 rounded-full p-[2px] ${story.active ? 'bg-gradient-to-tr from-[#f6339a] via-[#9810fa] to-[#0e9eef]' : 'bg-[#2a2a35]'} shadow-lg group-hover:scale-105 transition-transform`}>
              <div className="w-full h-full bg-[#121216] rounded-full overflow-hidden border-[3px] border-[#121216]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className={`text-[11px] font-medium tracking-wide ${story.active ? 'text-white' : 'text-gray-400'}`}>
              {story.name}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
}
