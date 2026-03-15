"use client";

import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import AuthGatekeeper from '@/components/AuthGatekeeper';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
}

export default function MusicSwipePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [counts, setCounts] = useState({ likes: 0, views: 0, discards: 0 });
  const [error, setError] = useState<string | null>(null);
  
  const playerRef = useRef<any>(null);
  const supabase = createClient();

  // Load YouTube IFrame API
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        console.log("YouTube API Ready");
      };
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        fetchSongs();
        updateCounts();
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const fetchSongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/songs');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else if (Array.isArray(data)) {
        setSongs(data);
      }
    } catch (err: any) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const updateCounts = async () => {
    try {
      const res = await fetch('/api/swipe', { method: 'PATCH' });
      const data = await res.json();
      setCounts(data);
    } catch (e) {}
  };

  const handleSwipe = async (action: 'like' | 'discard') => {
    const currentSong = songs[currentIndex];
    if (!currentSong) return;

    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song: currentSong, action })
      });
      const data = await res.json();
      setCounts(data.counts);
    } catch (e) {}

    // Stop current track before moving
    if (playerRef.current) {
      playerRef.current.stopVideo();
    }
    setCurrentIndex(prev => prev + 1);
  };

  // YouTube Player Logic
  useEffect(() => {
    const song = songs[currentIndex];
    if (song && (window as any).YT && (window as any).YT.Player) {
      if (playerRef.current) {
        playerRef.current.loadVideoById(song.id);
        playerRef.current.playVideo();
      } else {
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: song.id,
          playerVars: {
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            modestbranding: 1
          },
          events: {
            onReady: (event: any) => {
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              // If playing, set timeout to pause after 8s
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setTimeout(() => {
                  if (playerRef.current && playerRef.current.getPlayerState() === (window as any).YT.PlayerState.PLAYING) {
                    playerRef.current.pauseVideo();
                  }
                }, 8000);
              }
            }
          }
        });
      }
    }
  }, [currentIndex, songs]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <AuthGatekeeper 
          titleHighlight="MusicSwipe"
          subtitle="Descubre nueva música con el poder de YouTube."
        />
      </div>
    );
  }

  const currentSong = songs[currentIndex];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        
        <div className="w-full max-w-4xl flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Music<span className="text-red-600">Swipe</span>
            </h1>
            <p className="text-gray-500">Descubre tracks vía YouTube</p>
          </div>
          <Link href="/favoritos/playlist" className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:shadow-md transition-all">
            Mi Playlist 🎥
          </Link>
        </div>

        {/* YouTube Hidden Player */}
        <div id="youtube-player" className="hidden"></div>

        {/* Swipe Card */}
        <div className="w-full max-w-sm">
          {error ? (
            <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
              <p className="text-red-600 font-medium mb-4">⚠️ {error}</p>
              <button onClick={fetchSongs} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold">Reintentar</button>
            </div>
          ) : currentSong ? (
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 transform">
              <div className="aspect-square w-full relative">
                <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-white text-xl font-bold truncate mb-1">{currentSong.title}</h2>
                  <p className="text-gray-300 text-sm font-medium">{currentSong.artist}</p>
                </div>
              </div>

              <div className="p-6 flex justify-between items-center gap-4">
                <button 
                  onClick={() => handleSwipe('discard')}
                  className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 group transition-all"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 group-hover:text-red-500" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
                
                <button 
                  onClick={() => handleSwipe('like')}
                  className="flex-1 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 mb-6">No hay más recomendaciones</p>
              <button onClick={fetchSongs} className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100">Cargar más</button>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="mt-10 flex items-center gap-6 bg-white px-8 py-4 rounded-full border border-gray-100 shadow-lg">
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Likes</span>
            <span className="text-lg font-bold text-red-500">{counts.likes}</span>
          </div>
          <div className="w-px h-6 bg-gray-100"></div>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vistas</span>
            <span className="text-lg font-bold text-gray-800">{counts.views}</span>
          </div>
          <div className="w-px h-6 bg-gray-100"></div>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pasadas</span>
            <span className="text-lg font-bold text-gray-400">{counts.discards}</span>
          </div>
        </div>

      </main>
    </div>
  );
}
