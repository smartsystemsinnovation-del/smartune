"use client";

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';

export default function IAStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'generate' | 'chat'>('generate');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const router = useRouter();

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (mode === 'chat') {
      const userMsg = prompt;
      setPrompt('');
      setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsGenerating(true);
      setError(null);

      try {
        const res = await fetch('/api/generate-music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMsg, mode: 'chat' })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setChatHistory(prev => [...prev, { role: 'ai', text: data.text }]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setIsGenerating(true);
      setResult(null);
      setError(null);

      try {
        const res = await fetch('/api/generate-music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, mode: 'generate' })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error al generar música');
        }

        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsGenerating(false);
      }
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
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-[#D000FF]/10 to-transparent -z-10 blur-[120px]"></div>
        
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            IA <span className="text-[#D000FF]">STUDIO</span>
          </h1>
          <p className="text-gray-400 font-medium tracking-wide">Crea música o consulta con tu productor IA</p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#1A1A1A] p-2 rounded-2xl border border-white/5 flex gap-2">
            <button 
              onClick={() => { setMode('generate'); setError(null); }}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${mode === 'generate' ? 'bg-[#D000FF] shadow-[0_0_20px_rgba(208,0,255,0.4)] text-white' : 'text-gray-500 hover:text-white'}`}
            >
              🪄 Crear Música
            </button>
            <button 
              onClick={() => { setMode('chat'); setError(null); }}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${mode === 'chat' ? 'bg-[#D000FF] shadow-[0_0_20px_rgba(208,0,255,0.4)] text-white' : 'text-gray-500 hover:text-white'}`}
            >
              💬 Consultar IA
            </button>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
          
          {mode === 'chat' ? (
            <div className="flex-1 flex flex-col h-full space-y-6">
              <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4 pr-2 custom-scrollbar">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4 pt-10">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">💬</div>
                    <p className="font-medium text-sm">Pregúntame lo que quieras sobre<br/>producción musical o teoría.</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl font-medium text-sm ${msg.role === 'user' ? 'bg-[#D000FF]/20 border border-[#D000FF]/30 text-white' : 'bg-white/5 border border-white/10 text-gray-300'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleAction} className="relative mt-auto">
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Escribe tu duda aquí..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:border-[#D000FF] outline-none transition-all"
                />
                <button 
                  type="submit" 
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#D000FF] rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8 h-full">
              <form onSubmit={handleAction} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase ml-2">Describe tu visión musical</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ej: Un track de K-pop energético o un Jazz suave para leer..."
                    className="w-full h-32 bg-black/40 border border-white/5 rounded-3xl p-6 text-lg font-medium placeholder:text-white/10 focus:border-[#D000FF] outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-6 bg-gradient-to-r from-[#D000FF] to-[#8000FF] text-white font-black text-xl tracking-widest uppercase rounded-2xl shadow-[0_10px_40px_rgba(208,0,255,0.3)] hover:shadow-[0_15px_60px_rgba(208,0,255,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 group"
                >
                  <div className="flex items-center justify-center gap-3">
                    {isGenerating ? "Generando..." : "Generar Track"}
                  </div>
                </button>
              </form>

              {(isGenerating || result) && (
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
                       <p className="text-white/60 font-bold animate-pulse">Componiendo...</p>
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
                                 <span className="text-sm font-bold text-white uppercase">{result.mood}</span>
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
                        <button 
                          onClick={handleAddToPlaylist}
                          className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 font-bold transition-all flex items-center justify-center gap-2"
                        >
                          ❤️ Añadir a Mi Playlist
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
               <p className="text-red-500 text-sm font-bold">⚠️ {error}</p>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(208, 0, 255, 0.2);
          border-radius: 10px;
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
