"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Iconos Básicos ── */
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18m9-9H3m15.364-6.364l-12.728 12.728m12.728 0L6.636 6.636" opacity="0.3" />
    <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="currentColor" stroke="none" />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

export default function IAStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<{ message: string, details?: string } | null>(null);
  const [mode, setMode] = useState<'generate' | 'chat'>('chat');
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

      {/* ── Background Sutil Mejorado ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-[#00ffff] to-[#f6339a] rounded-full mix-blend-screen blur-[250px] opacity-15"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#9810fa] rounded-full mix-blend-screen blur-[200px] opacity-15"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* ── Header Principal ── */}
      <header className="w-full relative z-20 pt-8 pb-6 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/[0.03] bg-gradient-to-b from-[#0a0a0a]/90 to-[#0a0a0a]/50 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00ffff] to-[#f6339a] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.25)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-500"></div>
            <SparklesIcon className="w-6 h-6 text-black relative z-10" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 break-words line-clamp-1">
              SmarTune <span className="font-light opacity-50 text-white">Studio</span>
            </h1>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.25em] font-bold flex items-center gap-2 mt-1 whitespace-nowrap">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#00ffff] animate-pulse shadow-[0_0_8px_#00ffff]"></span>
              Powered by Gemini
            </p>
          </div>
        </div>

        {/* Selector de Modo */}
        <div className="shrink-0 bg-[#111]/80 backdrop-blur-md p-1.5 rounded-full border border-white/5 flex gap-1 shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-x-auto custom-scrollbar max-w-full">
          {(['chat', 'generate'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`relative px-6 sm:px-7 py-2.5 rounded-full font-bold text-[13px] transition-all duration-300 shrink-0 ${mode === m ? 'text-white' : 'text-white/40 hover:text-white/90'}`}
            >
              {mode === m && (
                <motion.div
                  layoutId="modeTab"
                  className="absolute inset-0 bg-white/[0.06] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
                {m === 'generate' ? '🎶 Compositor' : '💬 Asistente'}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Área de Contenido Principal ── */}
      {/* ── Área de Contenido Principal ── */}
      <main className={`flex-1 relative z-10 flex flex-col w-full max-w-[1000px] mx-auto px-4 sm:px-8 h-[calc(100vh-104px)] ${mode === 'generate' ? 'items-center justify-center' : ''}`}>
        <AnimatePresence mode="wait">

          {/* MODO: COMPOSITOR */}
          {mode === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col justify-center gap-10 sm:gap-12 py-8 w-full max-w-3xl"
            >
              <div className="flex flex-col items-center text-center space-y-8 w-full">
                <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter leading-tight drop-shadow-sm px-4">
                  ¿Qué obra maestra <br className="hidden sm:block" /> crearemos hoy?
                </h2>

                <form onSubmit={handleAction} className="w-full relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00ffff] via-[#f6339a] to-[#9810fa] rounded-[36px] blur-xl opacity-10 group-focus-within:opacity-30 transition duration-700"></div>
                  <div className="relative bg-[#151515]/90 backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-3 flex flex-col shadow-2xl transition-all duration-500 group-focus-within:border-white/20 group-focus-within:bg-[#151515]">

                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ej: Un beat Lo-fi relajante con piano eléctrico, a 85 BPM, ideal para estudiar..."
                      className="flex-1 bg-transparent border-none text-[16px] sm:text-[18px] text-white/90 placeholder:text-white/20 font-light resize-none h-32 sm:h-36 p-4 sm:p-5 outline-none custom-scrollbar leading-relaxed"
                    />

                    <div className="flex justify-between items-center px-4 pb-2 pt-2 border-t border-white/[0.03]">
                      <span className="text-[11px] text-white/30 font-mono uppercase tracking-wider shrink-0">{prompt.length} caracteres</span>
                      <button
                        type="submit"
                        disabled={isGenerating || !prompt.trim()}
                        className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-gradient-to-r hover:from-[#00ffff] hover:to-[#f6339a] hover:text-white hover:scale-105 transition-all duration-300 disabled:opacity-20 disabled:grayscale active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:shadow-none"
                      >
                        {isGenerating ? (
                          <svg className="shrink-0 animate-spin w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                          <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {!result && !isGenerating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-2 opacity-70 hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[12px] font-medium shrink-0 text-white/50 uppercase tracking-widest">Inspiración:</span>
                    {["Synthwave Cyberpunk", "Acústico", "Trap Oscuro"].map((sug) => (
                      <button key={sug} onClick={() => setPrompt(sug)} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/5 text-[11px] sm:text-[12px] bg-white/[0.03] hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white/80 whitespace-nowrap">
                        {sug}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <AnimatePresence>
                {result && !isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full bg-gradient-to-br from-[#151515]/90 to-[#0a0a0a]/90 backdrop-blur-2xl border border-white/[0.06] rounded-[32px] p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mx-auto relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#f6339a] rounded-full mix-blend-screen blur-[100px] opacity-10 pointer-events-none"></div>

                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-center relative z-10">

                      <div className="shrink-0 relative w-32 h-32 sm:w-48 sm:h-48 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00ffff] to-[#f6339a] rounded-2xl blur-xl opacity-20 group-hover:opacity-50 transition-opacity duration-700"></div>
                        <img src={result?.coverUrl} className="relative w-full h-full object-cover rounded-2xl border border-white/10 shadow-2xl z-10" alt="Cover" />
                        <div className="absolute top-1/2 -translate-y-1/2 -right-6 w-[85%] h-[85%] rounded-full bg-[#050505] border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,1)] -z-0 group-hover:-right-10 group-hover:rotate-180 transition-all duration-1000 ease-in-out flex items-center justify-center">
                          <div className="w-1/3 h-1/3 rounded-full border-[3px] border-[#151515] bg-gradient-to-br from-[#00ffff]/20 to-[#f6339a]/20"></div>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-center min-w-0 w-full text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2 sm:mb-3">
                          <span className="shrink-0 px-2.5 py-1 bg-[#00ffff]/10 text-[#00ffff] border border-[#00ffff]/20 rounded-md text-[10px] uppercase tracking-[0.2em] font-black shadow-[0_0_10px_rgba(0,255,255,0.1)]">Completado</span>
                          <span className="text-white/40 text-[12px] font-mono tracking-wide truncate">{result.bpm} BPM • {result.mood}</span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight break-words line-clamp-2">{result.title}</h3>
                        <p className="text-white/40 text-sm sm:text-base mb-6 sm:mb-8 font-light break-words line-clamp-1">{result.artist}</p>

                        <div className="flex items-center gap-3 sm:gap-5 w-full mt-auto">
                          <button
                            onClick={handleAddToPlaylist}
                            className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/50 hover:text-[#f6339a] hover:bg-white/10 hover:border-[#f6339a]/30 transition-all duration-300 active:scale-90 shadow-lg"
                          >
                            <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>

                          <div className="flex-1 min-w-0 bg-white/[0.02] rounded-full border border-white/5 p-1">
                            <audio controls className="h-10 w-full custom-audio">
                              <source src={result.audioUrl} type="audio/mpeg" />
                            </audio>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* MODO: CHAT */}
          {mode === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col w-full h-full"
            >
              {chatHistory.length === 0 ? (
                /* Estado vacío: placeholder + input centrados juntos */
                <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-6" style={{ paddingLeft: 'clamp(160px, 25vw, 350px)' }}>
                  <div className="flex flex-col items-center text-center opacity-50 space-y-3">
                    <div className="shrink-0 w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/30 shadow-inner">
                      <SparklesIcon className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-black text-white tracking-tighter">Sistemas Musicales en Línea</p>
                    <p className="text-xs font-light text-white/60 max-w-xs leading-relaxed">
                      Consulte cualquier duda sobre teoría, mezcla o estructura armónica.
                    </p>
                  </div>
                  {/* Input pegado al placeholder */}
                  <form onSubmit={handleAction} className="relative w-full max-w-2xl flex items-center bg-[#151515]/90 backdrop-blur-xl border border-white/[0.08] rounded-full focus-within:border-[#f6339a]/50 focus-within:bg-[#151515] focus-within:shadow-[0_0_30px_rgba(246,51,154,0.25)] transition-all duration-500 px-2 py-2">
                    <input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ingrese su consulta, señor..."
                      className="flex-1 min-w-0 bg-transparent py-2.5 sm:py-3 px-4 sm:px-5 text-[14px] sm:text-[15px] outline-none text-white placeholder:text-white/30 font-light"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center hover:!bg-[#f6339a] hover:!text-white transition-all duration-300 active:scale-95 shadow-md"
                    >
                      <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </form>
                  <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Conectado a la base de datos principal</p>
                </div>
              ) : (
                /* Estado con mensajes */
                <>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar scroll-smooth flex flex-col gap-3">
                      {chatHistory.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role === 'user' ? (
                            <div className="max-w-[72%] sm:max-w-[60%] px-4 py-2.5 text-[14px] font-light leading-relaxed rounded-2xl rounded-tr-sm break-words bg-white/[0.08] text-white border border-white/10">
                              {msg.text}
                            </div>
                          ) : (
                            <div className="max-w-[85%] sm:max-w-[78%] flex gap-3 items-start">
                              <div className="shrink-0 w-6 h-6 mt-0.5 rounded-full bg-[#00ffff]/10 border border-[#00ffff]/20 flex items-center justify-center">
                                <SparklesIcon className="w-3 h-3 text-[#00ffff]" />
                              </div>
                              <p className="text-[14px] sm:text-[15px] font-light leading-relaxed text-white/85 break-words whitespace-pre-wrap pt-0.5">{msg.text}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {isGenerating && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-3">
                          <div className="shrink-0 w-6 h-6 rounded-full bg-[#00ffff]/10 border border-[#00ffff]/20 flex items-center justify-center">
                            <SparklesIcon className="w-3 h-3 text-[#00ffff]" />
                          </div>
                          <div className="flex gap-1.5 items-center">
                            <span className="shrink-0 w-1.5 h-1.5 bg-[#00ffff] rounded-full animate-bounce"></span>
                            <span className="shrink-0 w-1.5 h-1.5 bg-[#f6339a] rounded-full animate-bounce [animation-delay:0.15s]"></span>
                            <span className="shrink-0 w-1.5 h-1.5 bg-[#9810fa] rounded-full animate-bounce [animation-delay:0.3s]"></span>
                          </div>
                        </motion.div>
                      )}
                  </div>
                  <div className="shrink-0 px-2 pb-3 pt-2">
                    <form onSubmit={handleAction} className="relative w-full max-w-3xl mx-auto flex items-center bg-[#151515]/90 backdrop-blur-xl border border-white/[0.08] rounded-full focus-within:border-[#f6339a]/50 focus-within:bg-[#151515] focus-within:shadow-[0_0_30px_rgba(246,51,154,0.25)] transition-all duration-500 px-2 py-2">
                      <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ingrese su consulta, señor..."
                        className="flex-1 min-w-0 bg-transparent py-2.5 sm:py-3 px-4 sm:px-5 text-[14px] sm:text-[15px] outline-none text-white placeholder:text-white/30 font-light"
                      />
                      <button
                        type="submit"
                        disabled={isGenerating || !prompt.trim()}
                        style={{ backgroundColor: '#ffffff', color: '#000000' }}
                        className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center hover:!bg-[#f6339a] hover:!text-white transition-all duration-300 active:scale-95 shadow-md"
                      >
                        <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Toast de Errores Flotante ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] sm:w-[420px] bg-[#1a050a]/90 backdrop-blur-2xl border border-red-500/20 rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(255,0,0,0.15)] z-50 flex items-start gap-3 sm:gap-4"
              >
                <div className="shrink-0 pt-0.5 text-red-500 bg-red-500/10 p-1.5 rounded-full flex items-center justify-center">
                  <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-red-400 text-[13px] sm:text-[14px] font-bold mb-1 tracking-tight break-words">Detecté una anomalía, señor.</p>
                  <p className="text-[11px] sm:text-[12px] text-red-400/80 font-light leading-relaxed break-words">{error.message}</p>
                  {error.details && <p className="text-[10px] text-red-400/50 font-mono mt-2 bg-red-500/5 p-2 rounded-md break-words line-clamp-3">{error.details}</p>}
                </div>
                <button onClick={() => setError(null)} className="shrink-0 text-red-500/40 hover:text-red-500 transition-colors p-1 flex items-center justify-center">
                  <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }
        
        .custom-audio { height: 36px; outline: none; }
        .custom-audio::-webkit-media-controls-panel { background-color: transparent; padding: 0 10px; }
        .custom-audio::-webkit-media-controls-play-button,
        .custom-audio::-webkit-media-controls-current-time-display,
        .custom-audio::-webkit-media-controls-time-remaining-display,
        .custom-audio::-webkit-media-controls-mute-button {
          filter: invert(100%); opacity: 0.7; transition: opacity 0.3s;
        }
        .custom-audio::-webkit-media-controls-play-button:hover,
        .custom-audio::-webkit-media-controls-mute-button:hover { opacity: 1; }
        .custom-audio::-webkit-media-controls-timeline,
        .custom-audio::-webkit-media-controls-volume-slider {
          filter: invert(100%) sepia(100%) saturate(10000%) hue-rotate(240deg) brightness(1.2);
        }
      `}} />
    </div>
  );
}