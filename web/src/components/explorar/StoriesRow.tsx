"use client";

import { useRef, useState, useEffect } from 'react';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=f6339a&color=fff&bold=true&size=128&name=';

interface StoryUser {
  userId: string;
  nombre: string;
  avatar_url: string;
  stories: { id: string; media_url: string; created_at: string }[];
  isOwn: boolean;
}

interface StoriesRowProps {
  currentUserAvatar?: string;
}

export default function StoriesRow({ currentUserAvatar }: StoriesRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingStory, setViewingStory] = useState<{ user: StoryUser; index: number } | null>(null);

  // Fetch stories from followed users
  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await fetch('/api/social/stories');
        const json = await res.json();
        if (json.success && json.data) {
          setStoryUsers(json.data);
        }
      } catch (e) {
        console.error('Error fetching stories:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, []);

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/social/stories', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        // Refresh stories
        const refreshRes = await fetch('/api/social/stories');
        const refreshJson = await refreshRes.json();
        if (refreshJson.success && refreshJson.data) {
          setStoryUsers(refreshJson.data);
        }
      } else {
        alert('Error: ' + (json.error || 'No se pudo subir la historia'));
      }
    } catch {
      alert('Error subiendo historia');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openStory = (user: StoryUser) => {
    if (user.stories.length > 0 && user.stories[0].media_url) {
      setViewingStory({ user, index: 0 });
    }
  };

  const closeStory = () => setViewingStory(null);

  // Check if current user has uploaded a story
  const ownStory = storyUsers.find(u => u.isOwn);
  const othersStories = storyUsers.filter(u => !u.isOwn);
  const hasOwnStory = ownStory && ownStory.stories.length > 0;

  // Don't show anything while loading
  if (loading) return null;

  // If there are no stories at all (no own story, nobody you follow has stories), show only the upload button
  const hasAnyStories = storyUsers.length > 0;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {/* ── Tu historia (Upload / View) ── */}
        <div
          onClick={() => {
            if (hasOwnStory) {
              openStory(ownStory!);
            } else {
              if (!isUploading) fileInputRef.current?.click();
            }
          }}
          className={`flex-shrink-0 relative w-[130px] h-[200px] rounded-2xl overflow-hidden cursor-pointer group shadow-lg border border-white/5 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleStoryUpload} />
          
          {/* Background image: user avatar or own story cover */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hasOwnStory ? ownStory!.stories[0].media_url : (currentUserAvatar || `${DEFAULT_AVATAR}U`)}
            alt="Tu historia"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Plus badge or Loading */}
          {!hasOwnStory && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {isUploading ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </div>
              )}
            </div>
          )}

          {/* User badge bottom */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-white bg-[#181818]">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={currentUserAvatar || `${DEFAULT_AVATAR}U`} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] font-bold text-white tracking-wide">Add Story</span>
          </div>
        </div>

        {/* ── Stories from people you follow ── */}
        {othersStories.map(storyUser => (
          <div
            key={storyUser.userId}
            onClick={() => openStory(storyUser)}
            className="flex-shrink-0 relative w-[130px] h-[200px] rounded-2xl overflow-hidden cursor-pointer group shadow-lg border border-white/5"
          >
            {/* Background image: first story cover */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storyUser.stories.length > 0 ? storyUser.stories[0].media_url : storyUser.avatar_url}
              alt={storyUser.nombre}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
              <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-[#ea88ff] p-[1px] bg-[#11081f] shadow-[0_0_10px_rgba(234,136,255,0.4)]">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={storyUser.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(storyUser.nombre)}`} alt="" className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-wide truncate max-w-[70px]">
                {storyUser.nombre}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Full-screen Story Viewer ── */}
      {viewingStory && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center" onClick={closeStory}>
          <div className="relative max-w-lg w-full max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={viewingStory.user.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(viewingStory.user.nombre)}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{viewingStory.user.nombre}</p>
                  <p className="text-white/50 text-[10px]">
                    {new Date(viewingStory.user.stories[viewingStory.index].created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button onClick={closeStory} className="text-white/70 hover:text-white transition-colors p-1">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="absolute top-2 left-4 right-4 z-10 flex gap-1">
              {viewingStory.user.stories.map((_, idx) => (
                <div key={idx} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/20">
                  <div className={`h-full rounded-full ${idx <= viewingStory.index ? 'bg-white' : 'bg-transparent'}`} style={{ width: '100%' }} />
                </div>
              ))}
            </div>

            {/* Story content */}
            <div className="rounded-2xl overflow-hidden bg-[#1a1a22]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewingStory.user.stories[viewingStory.index].media_url}
                alt="Historia"
                className="w-full max-h-[80vh] object-contain"
              />
            </div>

            {/* Navigation arrows */}
            {viewingStory.index > 0 && (
              <button
                onClick={() => setViewingStory({ ...viewingStory, index: viewingStory.index - 1 })}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
            )}
            {viewingStory.index < viewingStory.user.stories.length - 1 && (
              <button
                onClick={() => setViewingStory({ ...viewingStory, index: viewingStory.index + 1 })}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
