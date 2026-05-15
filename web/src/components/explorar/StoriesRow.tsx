"use client";

import { useRef, useState, useEffect, useCallback } from 'react';

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
const STORY_DURATION = 5000; // 5 segundos por historia

interface Story {
  id: string;
  media_url: string;
  created_at: string;
}

interface StoryUser {
  userId: string;
  nombre: string;
  avatar_url: string;
  stories: Story[];
  isOwn: boolean;
}

interface StoriesRowProps {
  currentUserAvatar?: string;
}

export default function StoriesRow({ currentUserAvatar }: StoriesRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingStory, setViewingStory] = useState<{ user: StoryUser; index: number } | null>(null);
  const [progress, setProgress] = useState(0);

  // ── Fetch stories ──────────────────────────────────────────────────
  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch('/api/social/stories');
      const json = await res.json();
      if (json.success && json.data) setStoryUsers(json.data);
    } catch (e) {
      console.error('Error fetching stories:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  // ── Auto-progress timer ────────────────────────────────────────────
  useEffect(() => {
    if (!viewingStory) { setProgress(0); return; }

    setProgress(0);
    const startTime = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        // Advance to next story or close
        const { user, index } = viewingStory;
        if (index < user.stories.length - 1) {
          setViewingStory({ user, index: index + 1 });
        } else {
          setViewingStory(null);
        }
      }
    }, 50);

    return () => clearInterval(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingStory?.user.userId, viewingStory?.index]);

  // ── Upload ──────────────────────────────────────────────────────────
  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/social/stories', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success) {
        await fetchStories();
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
    if (user.stories.length > 0) setViewingStory({ user, index: 0 });
  };
  const closeStory = () => setViewingStory(null);

  const ownStory = storyUsers.find(u => u.isOwn);
  const othersStories = storyUsers.filter(u => !u.isOwn && u.stories.length > 0);
  const hasOwnStory = ownStory && ownStory.stories.length > 0;

  if (loading) return (
    <div className="flex gap-4 pb-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 animate-pulse">
          <div className="w-14 h-14 rounded-full bg-white/5" />
          <div className="h-2 w-10 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 pt-1">

        {/* ── Tu historia ── */}
        <div
          onClick={() => {
            if (hasOwnStory) openStory(ownStory!);
            else if (!isUploading) fileInputRef.current?.click();
          }}
          className={`flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleStoryUpload}
          />
          <div className="relative">
            <div className={`w-14 h-14 rounded-full p-[2px] ${hasOwnStory ? 'bg-gradient-to-tr from-[#f6339a] to-[#9810fa]' : 'bg-white/10'}`}>
              <div className="w-full h-full rounded-full overflow-hidden border-[2px] border-[#111315] bg-[#111315]">
                <img
                  src={currentUserAvatar || DEFAULT_AVATAR}
                  alt="Tu historia"
                  className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
                />
              </div>
            </div>
            {!hasOwnStory && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#f6339a] rounded-full flex items-center justify-center border-2 border-[#111315] shadow z-10">
                {isUploading
                  ? <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                }
              </div>
            )}
          </div>
          <span className="text-[10px] font-semibold text-white/70 tracking-wide">
            {hasOwnStory ? 'Mi historia' : 'Add Story'}
          </span>
        </div>

        {/* ── Historias de seguidos ── */}
        {othersStories.map((storyUser) => (
          <div
            key={storyUser.userId}
            onClick={() => openStory(storyUser)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#f6339a] to-[#9810fa]">
                <div className="w-full h-full rounded-full overflow-hidden border-[2px] border-[#111315] bg-[#111315]">
                  <img
                    src={storyUser.avatar_url || DEFAULT_AVATAR}
                    alt={storyUser.nombre}
                    className="w-full h-full object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
                  />
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-white/70 tracking-wide truncate max-w-[56px] text-center">
              {storyUser.nombre.split(' ')[0]}
            </span>
          </div>
        ))}


      </div>

      {/* ── Visor de Historia (fullscreen) ── */}
      {viewingStory && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={closeStory}
        >
          <div
            className="relative w-full mx-4 rounded-2xl overflow-hidden bg-[#0d0f12] shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '420px', maxHeight: '92vh', aspectRatio: '9/16' }}
          >
            {/* Barras de progreso */}
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
              {viewingStory.user.stories.map((_, idx) => (
                <div key={idx} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-none"
                    style={{
                      width: idx < viewingStory.index ? '100%'
                        : idx === viewingStory.index ? `${progress}%`
                          : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-0 right-0 z-20 px-4 py-2 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                  <img
                    src={viewingStory.user.avatar_url || DEFAULT_AVATAR}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
                  />
                </div>
                <div>
                  <p className="text-white text-[13px] font-bold leading-tight">{viewingStory.user.nombre}</p>
                  <p className="text-white/50 text-[10px]">
                    {new Date(viewingStory.user.stories[viewingStory.index].created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button onClick={closeStory} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Imagen/Video */}
            <img
              src={viewingStory.user.stories[viewingStory.index].media_url}
              alt="Historia"
              className="w-full h-full object-cover"
            />

            {/* Navegación táctil — izquierda/derecha */}
            <button
              className="absolute left-0 top-0 w-1/3 h-full z-10 opacity-0"
              onClick={e => {
                e.stopPropagation();
                const { user, index } = viewingStory;
                if (index > 0) setViewingStory({ user, index: index - 1 });
                else closeStory();
              }}
            />
            <button
              className="absolute right-0 top-0 w-2/3 h-full z-10 opacity-0"
              onClick={e => {
                e.stopPropagation();
                const { user, index } = viewingStory;
                if (index < user.stories.length - 1) setViewingStory({ user, index: index + 1 });
                else closeStory();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
