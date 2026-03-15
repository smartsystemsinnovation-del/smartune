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
  previewUrl: string;
}

export default function MusicSwipePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [counts, setCounts] = useState({ likes: 0, views: 0, discards: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createClient();

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

  const [error, setError] = useState<string | null>(null);

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
      console.error("Error loading songs", err);
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

    setCurrentIndex(prev => prev + 1);
  };

  useEffect(() => {
    if (songs[currentIndex]) {
      const previewUrl = songs[currentIndex].previewUrl;
      console.log(`DEBUG: Attempting to play audio for: ${songs[currentIndex].title}`, previewUrl);
      
      if (audioRef.current) {
        audioRef.current.volume = 0.5; // Ensure volume is audible
        audioRef.current.src = previewUrl;
        
        // Play and handle results
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log("DEBUG: Audio playing successfully"))
            .catch(e => {
              console.warn("DEBUG: Autoplay failed. Browser policy usually requires a click.", e);
            });
        }
        
        const timer = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            console.log("DEBUG: Auto-pause after 8s");
          }
        }, 8000);
        
        return () => {
          clearTimeout(timer);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
          }
        };
      }
    }
  }, [currentIndex, songs]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f6339a]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '40px 0' }}>
        <Navigation />
        <AuthGatekeeper 
          iconNode={
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--neon-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          }
          titlePath1="Inicia sesión para usar"
          titleHighlight="MusicSwipe"
          subtitle="Descubre nueva música deslizando hacia la derecha. Guarda tus favoritas en tu perfil personalizado."
          cardTitle="¿Qué puedes hacer?"
          benefits={[
            { text: "Descubre canciones por energía y ritmo" },
            { text: "Guarda tus favoritas al instante" },
            { text: "Crea tu propia playlist de entrenamiento" }
          ]}
        />
      </div>
    );
  }

  const currentSong = songs[currentIndex];

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
        
        <div className="w-full max-w-4xl flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Music<span className="text-[#f6339a]">Swipe</span>
            </h1>
            <p className="text-gray-400 font-medium">Tinder de Música • SmarTune</p>
          </div>
          <Link href="/favoritos/playlist" className="px-6 py-2 bg-[#1f1f1f] border border-white/10 rounded-full text-sm font-bold text-white hover:border-[#f6339a] transition-all shadow-lg">
            Mi Playlist 🎵
          </Link>
        </div>

        {/* Swipe Card */}
        <div className="w-full max-w-sm relative">
          {error ? (
            <div className="text-center p-8 bg-red-500/10 rounded-3xl border border-red-500/20">
              <p className="text-red-500 font-bold mb-4">⚠️ {error}</p>
              <button 
                onClick={fetchSongs} 
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold"
              >
                Reintentar
              </button>
            </div>
          ) : currentSong ? (
            <div className="bg-[#1f1f1f] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 transform transition-all duration-300">
              <div className="aspect-square w-full relative">
                <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f1f] via-transparent to-transparent"></div>
                
                <div className="absolute bottom-8 left-8 right-8">
                  <h2 className="text-white text-2xl font-bold truncate mb-1">{currentSong.title}</h2>
                  <p className="text-gray-400 font-medium">{currentSong.artist}</p>
                </div>
              </div>

              <div className="p-8 flex justify-between items-center gap-6">
                <button 
                  onClick={() => handleSwipe('discard')}
                  className="flex-1 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/50 group transition-all"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 group-hover:text-red-500 transition-colors" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
                
                <button 
                  onClick={() => handleSwipe('like')}
                  className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-[#f6339a] to-[#9810fa] flex items-center justify-center shadow-[0_10px_20px_rgba(246,51,154,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 bg-[#1f1f1f] rounded-3xl border border-dashed border-white/10">
              <p className="text-gray-500 font-medium mb-6">¡Descubrimientos agotados!</p>
              <button 
                onClick={fetchSongs} 
                className="px-8 py-3 bg-[#f6339a] text-white font-bold rounded-xl hover:bg-[#ee10b0] transition-colors"
              >
                Volver a cargar
              </button>
            </div>
          )}
          
          <audio ref={audioRef} hidden />
        </div>

        {/* Stats Bar */}
        <div className="mt-12 flex items-center gap-8 bg-[#1f1f1f] px-10 py-5 rounded-full border border-white/5 shadow-xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Likes</span>
            <span className="text-xl font-black text-[#f6339a]">{counts.likes}</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Vistas</span>
            <span className="text-xl font-black text-white">{counts.views}</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Pasadas</span>
            <span className="text-xl font-black text-gray-400">{counts.discards}</span>
          </div>
        </div>

      </main>
    </div>
  );
}
