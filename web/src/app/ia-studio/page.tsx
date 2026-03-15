"use client";

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';

export default function IAStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) throw new Error('Error al generar música');

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!result) return;
    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          song: {
            id: result.id,
            title: result.title,
            artist: result.artist,
            coverUrl: result.coverUrl
          }, 
          action: 'like' 
        })
      });
      if (res.ok) {
        alert("¡Añadida a tu playlist!");
      }
    } catch (e) {
      alert("Error al guardar");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white selection:bg-[#D000FF]/30 font-inter">
      <Navigation />
      
      <main className="max-w-4xl mx-auto pt-24 pb-20 px-6 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-[#D000FF]/10 to-transparent -z-10 blur-[120px]"></div>
        
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            IA <span className="text-[#D000FF]">STUDIO</span>
          </h1>
          <p className="text-gray-400 font-medium tracking-wide">Transforma tus ideas en ritmos únicos</p>
        </div>

        <div className="bg-[#1A1A1A] rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Form */}
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase ml-2">Describe tu visión</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Un track de Phonk melódico con bajos profundos y atmósfera espacial para entrenar..."
                className="w-full h-40 bg-black/40 border border-white/5 rounded-3xl p-6 text-lg font-medium placeholder:text-white/10 focus:border-[#D000FF] focus:ring-1 focus:ring-[#D000FF] outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-6 bg-gradient-to-r from-[#D000FF] to-[#8000FF] text-white font-black text-xl tracking-widest uppercase rounded-2xl shadow-[0_10px_40px_rgba(208,0,255,0.3)] hover:shadow-[0_15px_60px_rgba(208,0,255,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center justify-center gap-3">
                {isGenerating ? (
                   <span className="flex gap-1 items-center">
                     <span className="w-1.5 h-6 bg-white animate-[bounce_1s_infinite_0ms]"></span>
                     <span className="w-1.5 h-6 bg-white animate-[bounce_1s_infinite_100ms]"></span>
                     <span className="w-1.5 h-6 bg-white animate-[bounce_1s_infinite_200ms]"></span>
                   </span>
                ) : (
                  <>
                    <span>Generar Track</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Results Area */}
          {(isGenerating || result || error) && (
            <div className="mt-12 pt-12 border-t border-white/5 animate-in fade-in slide-in-from-bottom-5 duration-500">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center space-y-6 py-10">
                   <div className="flex gap-2 items-end h-16">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-2 bg-[#D000FF] animate-[bounce_0.8s_infinite]" 
                          style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }}
                        />
                      ))}
                   </div>
                   <p className="text-white/60 font-bold animate-pulse">La IA está componiendo tu música...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
                   <p className="text-red-500 font-bold">⚠️ {error}</p>
                </div>
              ) : result && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-[#D000FF] rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                      <img src={result.coverUrl} className="relative w-48 h-48 rounded-3xl object-cover border border-white/10" alt="Generated" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-3">
                       <h3 className="text-3xl font-black">{result.title}</h3>
                       <p className="text-[#D000FF] font-bold tracking-widest uppercase text-sm">Artista: {result.artist}</p>
                       <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                             <span className="text-[10px] text-white/40 block uppercase font-bold mb-1">Mood</span>
                             <span className="text-sm font-bold text-white">{result.mood}</span>
                          </div>
                          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                             <span className="text-[10px] text-white/40 block uppercase font-bold mb-1">Tempo</span>
                             <span className="text-sm font-bold text-white">{result.bpm} BPM</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="bg-black/60 p-6 rounded-3xl border border-white/5 space-y-6">
                    <audio controls className="w-full accent-[#D000FF]">
                       <source src={result.audioUrl} type="audio/mpeg" />
                    </audio>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleAddToPlaylist}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 font-bold transition-all flex items-center justify-center gap-2"
                      >
                        ❤️ Añadir a Mi Playlist
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        audio::-webkit-media-controls-panel {
          background-color: transparent;
        }
        audio::-webkit-media-controls-play-button,
        audio::-webkit-media-controls-current-time-display,
        audio::-webkit-media-controls-time-remaining-display,
        audio::-webkit-media-controls-timeline,
        audio::-webkit-media-controls-volume-slider {
          filter: invert(100%) sepia(100%) saturate(1000%) hue-rotate(240deg);
        }
      `}</style>
    </div>
  );
}
