"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ia-studio.module.css';

/* ── Iconos ── */
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="currentColor" stroke="none" />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

/* ── Suggestion chips para el chat vacío ── */
const CHAT_SUGGESTIONS = [
  "¿Cómo mejorar mis mezclas de audio?",
  "Estructura de un beat trap profesional",
  "Progresiones de acordes para lo-fi",
  "Tips de masterización para Spotify",
];

/* ── Inspiration chips para el compositor ── */
const INSPIRATION_CHIPS = ["Synthwave Cyberpunk", "Lo-fi Acústico", "Trap Oscuro", "R&B Melódico"];

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

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
  };

  return (
    <div
      className={`min-h-screen text-white font-sans overflow-hidden flex flex-col relative selection:bg-[#f6339a]/20 ${styles.bgGradient}`}
      style={{ backgroundColor: '#181818' }}
    >

      {/* ── Header Compacto ── */}
      <header className="w-full relative z-20 flex items-center justify-between px-5 sm:px-8 border-b border-white/[0.04]" style={{ height: '56px' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f6339a, #9810fa)' }}>
            <SparklesIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">
            Studio
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-medium text-white/25 uppercase tracking-widest ml-2">
            <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: '#f6339a', boxShadow: '0 0 6px #f6339a' }}></span>
            Gemini
          </span>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center">
          {(['chat', 'generate'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`${styles.modeTab} ${mode === m ? styles.modeTabActive : ''}`}
            >
              {mode === m && (
                <motion.div
                  layoutId="activeTab"
                  className={styles.tabUnderline}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              {m === 'chat' ? 'Asistente' : 'Compositor'}
            </button>
          ))}
        </div>
      </header>

      {/* ── Contenido Principal ── */}
      <main className={`flex-1 relative z-10 flex flex-col w-full max-w-[860px] mx-auto px-4 sm:px-6 ${mode === 'generate' ? 'items-center justify-center' : ''}`} style={{ height: 'calc(100vh - 56px)' }}>
        <AnimatePresence mode="wait">

          {/* ═══════ MODO: COMPOSITOR ═══════ */}
          {mode === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col items-center gap-8 py-8 w-full max-w-2xl"
            >
              {/* Title */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white/90">
                  Crea tu próxima obra
                </h2>
                <p className="text-sm text-white/35 font-light">
                  Describe el estilo, mood y estructura de tu canción
                </p>
              </div>

              {/* Textarea */}
              <form onSubmit={handleAction} className="w-full">
                <div className={styles.composerWrapper}>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Un beat Lo-fi relajante con piano eléctrico, a 85 BPM, ideal para estudiar..."
                    className={`w-full bg-transparent text-[15px] sm:text-[16px] text-white/85 placeholder:text-white/20 font-light resize-none p-5 sm:p-6 outline-none leading-relaxed ${styles.customScrollbar}`}
                    style={{ height: '140px' }}
                  />
                  <div className="flex justify-between items-center px-5 pb-4 pt-1">
                    <span className="text-[11px] text-white/20 font-mono tracking-wider">{prompt.length} caracteres</span>
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className={styles.composerSendButton}
                    >
                      {isGenerating ? (
                        <svg className="shrink-0 animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <SparklesIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Inspiration Chips */}
              {!result && !isGenerating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap justify-center gap-2">
                  {INSPIRATION_CHIPS.map((chip) => (
                    <button key={chip} onClick={() => setPrompt(chip)} className={styles.inspirationChip}>
                      {chip}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Result Card */}
              <AnimatePresence>
                {result && !isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 28, stiffness: 220 }}
                    className={`w-full ${styles.resultCard}`}
                  >
                    <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-center relative z-10">
                      {/* Cover Art */}
                      <div className="shrink-0 w-28 h-28 sm:w-36 sm:h-36 relative group">
                        <img
                          src={result?.coverUrl}
                          className="w-full h-full object-cover rounded-2xl border border-white/[0.08] shadow-lg"
                          alt="Cover"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-center min-w-0 w-full text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2">
                          <span className={styles.statusBadge}>Completado</span>
                          <span className="text-white/30 text-[12px] font-mono tracking-wide truncate">{result.bpm} BPM · {result.mood}</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight break-words line-clamp-2 mb-0.5">{result.title}</h3>
                        <p className="text-white/35 text-sm font-light break-words line-clamp-1 mb-5">{result.artist}</p>

                        <div className="flex items-center gap-3 w-full">
                          <button onClick={handleAddToPlaylist} className={styles.heartButton}>
                            <HeartIcon className="w-4 h-4" />
                          </button>
                          <div className="flex-1 min-w-0 bg-white/[0.02] rounded-xl border border-white/[0.05] p-1">
                            <audio controls className={styles.audioPlayer}>
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

          {/* ═══════ MODO: CHAT ═══════ */}
          {mode === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex-1 flex flex-col w-full h-full"
            >
              {chatHistory.length === 0 ? (
                /* ── Empty State ── */
                <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-8 px-4">
                  {/* Icon + Title */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(246,51,154,0.1), rgba(152,16,250,0.08))', border: '1px solid rgba(246,51,154,0.1)' }}>
                      <SparklesIcon className="w-6 h-6 text-[#f6339a]/60" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white/90 mb-1.5">
                        Asistente de Producción Musical
                      </h2>
                      <p className="text-[13px] text-white/35 font-light max-w-sm leading-relaxed">
                        Consulta sobre teoría musical, técnicas de mezcla, estructura armónica y producción.
                      </p>
                    </div>
                  </div>

                  {/* Suggestion Chips Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                    {CHAT_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        onClick={() => handleSuggestionClick(sug)}
                        className={styles.suggestionChip}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <form onSubmit={handleAction} className={`w-full max-w-lg ${styles.inputWrapper}`}>
                    <input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Escribe tu consulta..."
                      className="flex-1 min-w-0 bg-transparent py-3 px-5 text-[14px] sm:text-[15px] outline-none text-white placeholder:text-white/25 font-light"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className={styles.sendButton}
                    >
                      <SendIcon className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                /* ── Chat with messages ── */
                <>
                  <div ref={scrollRef} className={`flex-1 overflow-y-auto px-2 sm:px-4 py-4 scroll-smooth flex flex-col gap-3.5 ${styles.customScrollbar}`}>
                    {chatHistory.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'user' ? (
                          <div className={styles.userBubble}>
                            {msg.text}
                          </div>
                        ) : (
                          <div className={styles.aiBubble}>
                            <div className={styles.aiAvatar}>
                              <SparklesIcon className="w-3 h-3 text-[#f6339a]" />
                            </div>
                            <p className={styles.aiText}>{msg.text}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {isGenerating && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-2.5">
                        <div className={styles.aiAvatar}>
                          <SparklesIcon className="w-3 h-3 text-[#f6339a]" />
                        </div>
                        <div className="flex gap-1.5 items-center py-2">
                          <span className={styles.typingDot}></span>
                          <span className={styles.typingDot}></span>
                          <span className={styles.typingDot}></span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Input bar */}
                  <div className="shrink-0 px-1 pb-4 pt-2">
                    <form onSubmit={handleAction} className={`w-full max-w-3xl mx-auto ${styles.inputWrapper}`}>
                      <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Escribe tu consulta..."
                        className="flex-1 min-w-0 bg-transparent py-3 px-5 text-[14px] sm:text-[15px] outline-none text-white placeholder:text-white/25 font-light"
                      />
                      <button
                        type="submit"
                        disabled={isGenerating || !prompt.trim()}
                        className={styles.sendButton}
                      >
                        <SendIcon className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error Toast ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-[400px] backdrop-blur-2xl border rounded-2xl p-4 shadow-lg z-50 flex items-start gap-3"
              style={{
                background: 'rgba(30, 8, 15, 0.9)',
                borderColor: 'rgba(246, 51, 154, 0.15)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div className="shrink-0 pt-0.5 p-1.5 rounded-full flex items-center justify-center" style={{ color: '#f6339a', background: 'rgba(246,51,154,0.1)' }}>
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold mb-0.5 tracking-tight break-words" style={{ color: '#f6339a' }}>Se detectó un error</p>
                <p className="text-[12px] font-light leading-relaxed break-words" style={{ color: 'rgba(246,51,154,0.7)' }}>{error.message}</p>
                {error.details && <p className="text-[10px] font-mono mt-2 p-2 rounded-lg break-words line-clamp-3" style={{ color: 'rgba(246,51,154,0.5)', background: 'rgba(246,51,154,0.05)' }}>{error.details}</p>}
              </div>
              <button onClick={() => setError(null)} className="shrink-0 p-1 flex items-center justify-center transition-colors" style={{ color: 'rgba(246,51,154,0.3)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#f6339a'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(246,51,154,0.3)'}>
                <svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}