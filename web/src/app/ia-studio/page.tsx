"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function IAStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<{message: string, details?: string} | null>(null);
  const [mode, setMode] = useState<'generate' | 'chat'>('generate');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isGenerating]);

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
        if (data.error) throw data;
        setChatHistory(prev => [...prev, { role: 'ai', text: data.text }]);
      } catch (err: any) {
        setError({ message: err.error || err.message, details: err.details });
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

        const data = await res.json();
        if (data.error) throw data;
        setResult(data);
      } catch (err: any) {
        setError({ message: err.error || err.message, details: err.details });
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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#D000FF]/30 font-sans overflow-x-hidden">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D000FF]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8000FF]/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      </div>
            
      <main className="max-w-4xl mx-auto pt-20 pb-20 px-6 relative z-10">
        
        <header className="text-center mb-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#D000FF]">Next-Gen Creator</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter"
          >
            IA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D000FF] to-[#8000FF]">STUDIO</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 font-medium tracking-wide flex items-center justify-center gap-2"
          >
            Potenciado por Gemini 1.5 Flash
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
          </motion.p>
        </header>

        {/* Mode Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-1 backdrop-blur-md">
            {(['generate', 'chat'] as const).map((m) => (
              <button 
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`relative px-6 py-2.5 rounded-xl font-bold text-sm transition-all overflow-hidden ${mode === m ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                {mode === m && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#D000FF] shadow-[0_0_20px_rgba(208,0,255,0.3)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{m === 'generate' ? '🪄 Compositor' : '💬 Productor Chat'}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          layout
          className="bg-[#111] rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col min-h-[550px]"
        >
          <AnimatePresence mode="wait">
            {mode === 'chat' ? (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col p-6 md:p-10"
              >
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto max-h-[400px] space-y-6 pr-2 custom-scrollbar mb-6"
                >
                  {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4 pt-10">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-2xl">🎹</div>
                      <p className="font-bold text-sm tracking-tight">Pregúntame sobre armonía,<br/>mezcla o teoría musical.</p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-[#D000FF] font-bold text-white shadow-lg' 
                        : 'bg-white/5 border border-white/10 text-white/80 font-medium'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#D000FF] rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-[#D000FF] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-[#D000FF] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleAction} className="relative">
                  <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Escribe tu duda musical..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 pr-16 text-[15px] font-medium focus:border-[#D000FF] focus:bg-black/60 outline-none transition-all placeholder:text-white/20"
                  />
                  <button 
                    type="submit" 
                    disabled={isGenerating || !prompt.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white text-black rounded-xl flex items-center justify-center hover:bg-[#D000FF] hover:text-white transition-all disabled:opacity-30 active:scale-95"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="generate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 md:p-12 space-y-10"
              >
                <form onSubmit={handleAction} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black tracking-[0.4em] text-[#D000FF] uppercase ml-1">Prompt de Composición</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ej: Un beat de Lo-fi melancólico con piano eléctrico y lluvia de fondo..."
                      className="w-full h-36 bg-black/40 border border-white/10 rounded-[2rem] p-7 text-xl font-bold placeholder:text-white/5 focus:border-[#D000FF] outline-none transition-all resize-none overflow-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-6 bg-white text-black font-black text-xl tracking-[0.2em] uppercase rounded-2xl hover:bg-[#D000FF] hover:text-white transition-all active:scale-[0.98] disabled:opacity-30 group shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                  >
                    {isGenerating ? "Procesando..." : "Materializar Música"}
                  </button>
                </form>

                <AnimatePresence>
                  {(isGenerating || result) && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-12 pt-12 border-t border-white/10 flex flex-col items-center"
                    >
                      {isGenerating ? (
                        <div className="flex flex-col items-center space-y-8 py-10">
                           <div className="flex gap-2 items-end h-20">
                              {[...Array(12)].map((_, i) => (
                                <motion.div 
                                  key={i} 
                                  animate={{ height: ["20%", "100%", "20%"] }}
                                  transition={{ repeat: Infinity, duration: 0.6 + Math.random(), ease: "easeInOut", delay: i * 0.05 }}
                                  className="w-2.5 bg-[#D000FF] rounded-full" 
                                />
                              ))}
                           </div>
                           <p className="text-[#D000FF] font-black tracking-widest animate-pulse text-sm uppercase">Codificando Frecuencias AI...</p>
                        </div>
                      ) : result && (
                        <div className="w-full space-y-10">
                          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <motion.div 
                              initial={{ rotate: -5, scale: 0.9 }}
                              animate={{ rotate: 0, scale: 1 }}
                              className="relative group shrink-0"
                            >
                              <div className="absolute inset-0 bg-[#D000FF] rounded-[2.5rem] blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
                              <img src={result.coverUrl} className="relative w-56 h-56 rounded-[2.5rem] object-cover border border-white/20 shadow-2xl" alt="Generated" />
                            </motion.div>
                            
                            <div className="flex-1 space-y-5 pt-4">
                               <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-none">{result.title}</h3>
                               <div className="flex items-center justify-center md:justify-start gap-3">
                                  <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase text-white/60">Artista</span>
                                  <p className="text-white font-bold">{result.artist}</p>
                               </div>
                               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                  <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                                     <span className="text-[9px] text-white/30 block uppercase font-black mb-1.5 tracking-tighter">Vibe</span>
                                     <span className="text-[13px] font-black text-white uppercase">{result.mood}</span>
                                  </div>
                                  <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                                     <span className="text-[9px] text-white/30 block uppercase font-black mb-1.5 tracking-tighter">Energía</span>
                                     <span className="text-[13px] font-black text-white">{result.bpm} BPM</span>
                                  </div>
                               </div>
                            </div>
                          </div>

                          <div className="bg-black/40 p-8 rounded-[2rem] border border-white/10 space-y-6">
                            <audio controls className="w-full h-12">
                               <source src={result.audioUrl} type="audio/mpeg" />
                            </audio>
                            <button 
                              onClick={handleAddToPlaylist}
                              className="w-full py-5 bg-[#D000FF] hover:bg-[#8000FF] text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(208,0,255,0.2)]"
                            >
                              <span>Añadir a Mis Creaciones</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border-t border-red-500/20 p-6 text-center"
              >
                 <p className="text-red-500 text-sm font-bold flex items-center justify-center gap-2">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   {error.message}
                 </p>
                 {error.details && (
                   <div className="mt-4 p-4 bg-black/40 rounded-xl text-left overflow-hidden">
                      <p className="text-[10px] text-white/20 font-black uppercase mb-2">Internal API Log</p>
                      <pre className="text-[10px] text-red-400 opacity-60 overflow-x-auto whitespace-pre-wrap max-h-32 font-mono">
                        {error.details}
                      </pre>
                   </div>
                 )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(208, 0, 255, 0.2);
          border-radius: 10px;
        }
        audio::-webkit-media-controls-panel {
          background-color: #111;
          border-radius: 1rem;
        }
        audio::-webkit-media-controls-play-button,
        audio::-webkit-media-controls-current-time-display,
        audio::-webkit-media-controls-time-remaining-display,
        audio::-webkit-media-controls-timeline,
        audio::-webkit-media-controls-volume-slider {
          filter: invert(100%) sepia(100%) saturate(2000%) hue-rotate(240deg);
        }
      `}</style>
    </div>
  );
}
