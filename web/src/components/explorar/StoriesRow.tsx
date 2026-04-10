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
      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2">
        {/* ── Tu historia (Upload / View) ── */}
        <div
          onClick={() => {
            if (hasOwnStory) {
              openStory(ownStory!);
            } else {
              if (!isUploading) fileInputRef.current?.click();
            }
          }}
          className={`flex-shrink-0 flex flex-col items-center gap-2.5 cursor-pointer group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleStoryUpload} />
          <div className="relative">
            <div className={`w-[72px] h-[72px] rounded-full p-[2.5px] ${hasOwnStory ? 'bg-gradient-to-tr from-[#f6339a] via-[#9810fa] to-[#0e9eef]' : 'bg-gray-200'}`}>
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUserAvatar || `${DEFAULT_AVATAR}U`}
                    alt="Tu historia"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
            {/* Plus badge — always shown to allow uploading new stories */}
            <div
              onClick={(e) => { e.stopPropagation(); if (!isUploading) fileInputRef.current?.click(); }}
              className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-[#0e9eef] border-[2.5px] border-white rounded-full flex items-center justify-center shadow-md hover:bg-[#f6339a] transition-colors"
            >
              {isUploading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              )}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
            {isUploading ? 'Subiendo...' : 'Tu historia'}
          </span>
        </div>

        {/* ── Stories from people you follow ── */}
        {othersStories.map(storyUser => (
          <div
            key={storyUser.userId}
            onClick={() => openStory(storyUser)}
            className="flex-shrink-0 flex flex-col items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-[72px] h-[72px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#f6339a] via-[#0e9eef] to-[#0e9eef]">
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={storyUser.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(storyUser.nombre)}`}
                    alt={storyUser.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              {storyUser.nombre.length > 10 ? storyUser.nombre.substring(0, 10) + '...' : storyUser.nombre}
            </span>
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
