"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Iconos Básicos ── */
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18m9-9H3m15.364-6.364l-12.728 12.728m12.728 0L6.636 6.636" opacity="0.3" />
    <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="currentColor" stroke="none" />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

export default function IAStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<{ message: string, details?: string } | null>(null);
  const [mode, setMode] = useState<'generate' | 'chat'>('generate');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll
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
          song: { id: result.id, title: result.title, artist: result.artist, coverUrl: result.coverUrl },
          action: 'like'
        })
      });
      if (res.ok) alert("¡Añadida a tu playlist!");
    } catch (e) {
      alert("Error al guardar");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden flex flex-col relative selection:bg-[#00ffff]/30">

      {/* ── Background Sutil ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#00ffff] to-[#f6339a] rounded-full mix-blend-screen blur-[200px] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#9810fa] rounded-full mix-blend-screen blur-[150px] opacity-10"></div>
      </div>

      {/* ── Header Principal (Fijo arriba) ── */}
      <header className="w-full relative z-20 py-6 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#f6339a] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <SparklesIcon className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">SmarTune <span className="font-light opacity-50">Studio</span></h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffff] animate-pulse shadow-[0_0_5px_#00ffff]"></span>
              Powered by Gemini 1.5
            </p>
          </div>
        </div>

        {/* Selector de Modo */}
        <div className="bg-[#151515] p-1 rounded-full border border-white/5 flex gap-1 shadow-inner">
          {(['generate', 'chat'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`relative px-6 py-2 rounded-full font-bold text-[12px] transition-all duration-300 ${mode === m ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              {mode === m && (
                <motion.div
                  layoutId="modeTab"
                  className="absolute inset-0 bg-white/[0.08] border border-white/[0.05] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {m === 'generate' ? '🎶 Generador' : '💬 Asistente'}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Área de Contenido Principal ── */}
      <main className="flex-1 relative z-10 flex flex-col w-full max-w-[1000px] mx-auto px-4 sm:px-6 h-[calc(100vh-88px)]">
        <AnimatePresence mode="wait">

          {/* =========================================
              MODO: COMPOSITOR (GENERAR)
              ========================================= */}
          {mode === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col justify-center gap-10 py-10 w-full max-w-3xl mx-auto"
            >
              {/* Formulario (La "Consola") */}
              <div className="flex flex-col items-center text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 tracking-tight">
                  ¿Qué música quieres crear hoy?
                </h2>

                <form onSubmit={handleAction} className="w-full relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#00ffff] via-[#f6339a] to-[#9810fa] rounded-[32px] blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
                  <div className="relative bg-[#111] border border-white/10 rounded-[32px] p-2 flex shadow-2xl transition-all group-focus-within:border-white/20">

                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ej: Un beat Lo-fi relajante con piano eléctrico, a 85 BPM, ideal para estudiar en una tarde de lluvia..."
                      className="flex-1 bg-transparent border-none text-[15px] sm:text-[17px] text-white/90 placeholder:text-white/20 font-light resize-none h-32 p-4 outline-none custom-scrollbar"
                    />

                    <div className="absolute bottom-4 right-4 flex items-end">
                      <button
                        type="submit"
                        disabled={isGenerating || !prompt.trim()}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-gradient-to-r hover:from-[#00ffff] hover:to-[#f6339a] hover:text-white hover:scale-105 transition-all disabled:opacity-20 disabled:grayscale active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      >
                        {isGenerating ? (
                          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                          <SparklesIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Sugerencias (Chips) */}
                {!result && !isGenerating && (
                  <div className="flex flex-wrap justify-center gap-2 mt-4 opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-[11px] font-medium mr-2 self-center">Probar:</span>
                    {["Synthwave Cyberpunk", "Acústico de Fogata", "Trap Latino Oscuro"].map((sug) => (
                      <button key={sug} onClick={() => setPrompt(sug)} className="px-3 py-1.5 rounded-full border border-white/10 text-[11px] bg-white/5 hover:bg-white/10 transition-colors">
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Resultado (Tarjeta Musical Elegante) ── */}
              <AnimatePresence>
                {result && !isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full bg-[#151515]/80 backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-4 sm:p-6 shadow-2xl mx-auto"
                  >
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-stretch">

                      {/* Cover y Animación de Vinilo/CD */}
                      <div className="relative shrink-0 w-32 h-32 sm:w-40 sm:h-40 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00ffff] to-[#f6339a] rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <img src={result.coverUrl} className="relative w-full h-full object-cover rounded-xl border border-white/10 shadow-lg z-10" alt="Cover" />
                        {/* Pequeño disco simulado asomando */}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-3/4 h-[90%] rounded-full bg-black border border-white/10 shadow-inner -z-0 group-hover:-right-8 transition-all duration-500 flex items-center justify-center">
                          <div className="w-1/3 h-1/3 rounded-full border-2 border-[#111]"></div>
                        </div>
                      </div>

                      {/* Info y Controles */}
                      <div className="flex-1 flex flex-col justify-center min-w-0 w-full text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-[#00ffff]/10 text-[#00ffff] border border-[#00ffff]/20 rounded text-[9px] uppercase tracking-widest font-bold">Generado</span>
                          <span className="text-white/40 text-[11px] font-mono">{result.bpm} BPM • {result.mood}</span>
                        </div>

                        <h3 className="text-2xl font-black truncate text-white mb-1">{result.title}</h3>
                        <p className="text-white/50 text-sm mb-6">{result.artist}</p>

                        <div className="flex items-center gap-4 w-full mt-auto">
                          <button
                            onClick={handleAddToPlaylist}
                            className="w-11 h-11 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[#f6339a] hover:bg-white/10 transition-all active:scale-95"
                          >
                            <HeartIcon className="w-5 h-5" />
                          </button>

                          {/* Reproductor Nativo modificado por CSS */}
                          <audio controls className="h-11 flex-1 custom-audio">
                            <source src={result.audioUrl} type="audio/mpeg" />
                          </audio>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* =========================================
              MODO: CHAT ASISTENTE
              ========================================= */}
          {mode === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col w-full max-w-4xl mx-auto h-full pb-6"
            >
              {/* Historial de Chat Flotante */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-6 space-y-6 custom-scrollbar">

                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 mb-2">
                      <SparklesIcon className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-bold text-white tracking-tight">IA Musical</p>
                    <p className="text-sm font-light max-w-xs">Hazme cualquier pregunta sobre teoría, mezcla o cómo tocar ese acorde imposible.</p>
                  </div>
                )}

                {chatHistory.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-4 text-[15px] font-light leading-relaxed rounded-3xl ${msg.role === 'user'
                        ? 'bg-[#222] text-white border border-white/5 rounded-tr-sm'
                        : 'bg-transparent text-white/90'
                      }`}>
                      {/* Icono de la IA para respuestas */}
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-2 mb-2 opacity-50">
                          <SparklesIcon className="w-4 h-4 text-[#00ffff]" />
                          <span className="text-[10px] uppercase tracking-wider font-bold">Asistente</span>
                        </div>
                      )}
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Indicador de "Escribiendo" */}
                {isGenerating && (
                  <div className="flex justify-start px-5">
                    <div className="flex gap-1.5 items-center h-8 opacity-50">
                      <span className="w-2 h-2 bg-[#00ffff] rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-[#f6339a] rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-2 h-2 bg-[#9810fa] rounded-full animate-bounce [animation-delay:0.3s]"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Box Flotante */}
              <div className="shrink-0 pt-2 px-2">
                <form onSubmit={handleAction} className="relative max-w-3xl mx-auto flex items-center bg-[#151515] border border-white/[0.08] rounded-full focus-within:border-[#00ffff]/40 focus-within:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all px-2 py-2">
                  <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Pregúntale al Asistente..."
                    className="flex-1 bg-transparent py-2.5 px-4 text-[15px] outline-none text-white placeholder:text-white/30 font-light"
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="w-10 h-10 shrink-0 bg-white text-black rounded-full flex items-center justify-center hover:bg-[#00ffff] transition-all disabled:opacity-20 disabled:bg-white active:scale-95"
                  >
                    <SendIcon className="w-5 h-5 ml-0.5" />
                  </button>
                </form>
                <p className="text-center text-[10px] text-white/20 mt-3 font-light">Gemini puede cometer errores. Verifica la información importante.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Toast de Errores Flotante ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] sm:w-[400px] bg-[#2a0812] border border-red-500/30 rounded-2xl p-4 shadow-[0_10px_40px_rgba(255,0,0,0.2)] z-50 flex items-start gap-3"
            >
              <div className="pt-0.5 text-red-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <div className="flex-1">
                <p className="text-red-400 text-[13px] font-bold mb-0.5">{error.message}</p>
                {error.details && <p className="text-[11px] text-red-400/60 font-mono line-clamp-1">{error.details}</p>}
              </div>
              <button onClick={() => setError(null)} className="text-red-500/50 hover:text-red-500 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* ── Estilos Globales Ocultos para Customización ── */}
      <style jsx global>{`
        /* Scrollbar sutil e invisible hasta que haces hover */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
        
        /* Modificando el reproductor de audio nativo para que parezca de Spotify/Apple Music */
        .custom-audio {
          height: 44px;
        }
        .custom-audio::-webkit-media-controls-panel {
          background-color: transparent;
          padding: 0;
        }
        .custom-audio::-webkit-media-controls-play-button,
        .custom-audio::-webkit-media-controls-current-time-display,
        .custom-audio::-webkit-media-controls-time-remaining-display,
        .custom-audio::-webkit-media-controls-mute-button {
          filter: invert(100%);
          opacity: 0.8;
        }
        .custom-audio::-webkit-media-controls-timeline,
        .custom-audio::-webkit-media-controls-volume-slider {
          filter: invert(100%) sepia(100%) saturate(10000%) hue-rotate(240deg) brightness(1.5);
        }
      `}</style>
    </div>
  );
}