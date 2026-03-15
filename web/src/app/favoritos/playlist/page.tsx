"use client";

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Playlist</h1>
              <p className="text-gray-500">Tus favoritos de YouTube</p>
            </div>
            <Link href="/favoritos" className="px-6 py-2 bg-red-600 text-white font-bold rounded-full text-sm shadow-lg shadow-red-100 transition-all active:scale-95">
              Descubrir más
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white/50 animate-pulse rounded-2xl border border-gray-100" />
              ))}
            </div>
          ) : playlist.length > 0 ? (
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {playlist.map((song) => (
                  <div key={song.id} className="group flex items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-14 h-14 rounded-xl overflow-hidden mr-4 shadow-sm">
                      <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 font-bold truncate text-base">{song.title}</h3>
                      <p className="text-gray-500 text-sm">{song.artist}</p>
                    </div>
                    <a 
                      href={`https://www.youtube.com/watch?v=${song.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-300" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tu playlist está vacía</h2>
              <p className="text-gray-500 max-w-xs mb-8">Usa MusicSwipe para encontrar tus canciones favoritas.</p>
              <Link href="/favoritos" className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-95">
                ¡EMPEZAR A DESCUBRIR!
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
