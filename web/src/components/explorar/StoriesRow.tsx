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
    { id: 1, name: 'Lucía M.', img: 'https://images.unsplash.com/photo-1549834125-82d3c48159a3?w=150&q=80', ring: 'bg-[#2a2a35]' },
    { id: 2, name: 'Marc Beat', img: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=150&q=80', ring: 'bg-[#f6339a]/40' },
    { id: 3, name: 'Alex R.', img: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=150&q=80', ring: 'bg-[#0e9eef]/40' },
    { id: 4, name: 'SynthWave', img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150&q=80', ring: 'bg-[#2a2a35]' },
  ];

  const defaultAvatar = 'https://utfs.io/f/cd2bb812-a1f9-4675-9257-238b6c0fe1b8-c906oz.png';

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
      {/* Tu historia — gradient ring like Figma */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleStoryUpload} />
        <div className="p-1 rounded-full bg-gradient-to-tr from-[#f6339a] to-[#0e9eef]">
          <div className="h-16 w-16 rounded-full border-4 border-[#181818] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentUserAvatar || defaultAvatar} alt="Tu historia" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <span className="text-xs font-medium text-white">
          {isUploading ? 'Subiendo...' : 'Tu historia'}
        </span>
      </div>

      {/* Other Stories */}
      {stories.map(story => (
        <div key={story.id} className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
          <div className={`p-1 rounded-full ${story.ring}`}>
            <div className="h-16 w-16 rounded-full border-4 border-[#181818] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={story.img} alt={story.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-xs font-medium text-gray-400">{story.name}</span>
        </div>
      ))}
    </div>
  );
}
