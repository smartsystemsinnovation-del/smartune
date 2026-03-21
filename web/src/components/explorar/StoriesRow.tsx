"use client";

import { useRef, useState } from 'react';

interface StoriesRowProps {
  currentUserAvatar?: string;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=f6339a&color=fff&bold=true&size=128&name=U';

export default function StoriesRow({ currentUserAvatar }: StoriesRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await fetch('/api/social/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_url: URL.createObjectURL(file) })
      });
      alert('¡Historia subida exitosamente!');
    } catch {
      alert('Error subiendo historia');
    } finally {
      setIsUploading(false);
    }
  };

  const stories = [
    { id: 1, name: 'Lucía M.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80', hasNew: true },
    { id: 2, name: 'Marc Beat', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', hasNew: true },
    { id: 3, name: 'Alex R.', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80', hasNew: false },
    { id: 4, name: 'SynthWave', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', hasNew: false },
    { id: 5, name: 'DJ Nova', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80', hasNew: true },
  ];

  return (
    <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2">
      {/* ── Tu historia ── */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`flex-shrink-0 flex flex-col items-center gap-2.5 cursor-pointer group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleStoryUpload} />
        <div className="relative">
          {/* Static gradient ring */}
          <div className="w-[72px] h-[72px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#f6339a] via-[#9810fa] to-[#0e9eef]">
            <div className="w-full h-full rounded-full bg-[#181818] p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUserAvatar || DEFAULT_AVATAR}
                  alt="Tu historia"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
          {/* Plus badge */}
          <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-[#0e9eef] border-[2.5px] border-[#181818] rounded-full flex items-center justify-center shadow-lg">
            {isUploading ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            )}
          </div>
        </div>
        <span className="text-[11px] font-semibold text-white/70 group-hover:text-white transition-colors">
          {isUploading ? 'Subiendo...' : 'Tu historia'}
        </span>
      </div>

      {/* ── Other Stories ── */}
      {stories.map(story => (
        <div key={story.id} className="flex-shrink-0 flex flex-col items-center gap-2.5 cursor-pointer group">
          <div className={`w-[72px] h-[72px] rounded-full p-[2.5px] ${story.hasNew ? 'bg-gradient-to-tr from-[#f6339a] via-[#9810fa] to-[#0e9eef]' : 'bg-white/[0.08]'}`}>
            <div className="w-full h-full rounded-full bg-[#181818] p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.img}
                  alt={story.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
          <span className={`text-[11px] font-medium transition-colors ${story.hasNew ? 'text-white/80' : 'text-white/30'} group-hover:text-white`}>
            {story.name}
          </span>
        </div>
      ))}
    </div>
  );
}
