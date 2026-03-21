"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface LikedSong {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
}

export default function MyPlaylistPage() {
  const [playlist, setPlaylist] = useState<LikedSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await fetch('/api/swipe'); // GET returns liked songs
        const data = await res.json();
        setPlaylist(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
            
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="flex items-end gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#f6339a] to-[#9810fa] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">Mi Playlist</h1>
                <p className="text-gray-400 font-medium">Tus descubrimientos en YouTube</p>
              </div>
            </div>

            <Link href="/favoritos" className="px-6 py-3 bg-[#f6339a] text-white font-bold rounded-xl hover:bg-[#ee10b0] transition-all shadow-lg active:scale-95 text-center">
              Descubrir más
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : playlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {playlist.map((song) => (
                <div key={song.id} className="group bg-[#1f1f1f] p-4 rounded-2xl shadow-sm hover:shadow-2xl transition-all border border-white/5 hover:border-[#f6339a]/30">
                  <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
                    <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={`https://www.youtube.com/watch?v=${song.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center pl-1 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                      >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                           <path d="M8 5v14l11-7z" />
                         </svg>
                      </a>
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-sm truncate">{song.title}</h3>
                  <p className="text-gray-500 text-xs font-semibold truncate">{song.artist}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-[#1f1f1f] rounded-[3rem] border border-dashed border-white/5">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" strokeLinecap="round" />
                  <path d="M12 16h.01" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Tu playlist está vacía</h2>
              <p className="text-gray-500 max-w-xs mb-10">Empieza a descubrir canciones increíbles en YouTube Music.</p>
              <Link href="/favoritos" className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95">
                ¡EMPEZAR AHORA!
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
