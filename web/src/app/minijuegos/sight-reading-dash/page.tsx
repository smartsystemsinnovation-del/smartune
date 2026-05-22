"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { saveMinigameStat } from "@/actions/minigameActions";

interface StaffNote {
  english: string;
  spanish: string;
  freq: number;
  y: number;
  accidental?: "sharp" | null;
}

const ALL_NOTES: StaffNote[] = [
  { english:"G3",  spanish:"Sol3",  freq:196.00, y:190 },
  { english:"G#3", spanish:"Sol#3", freq:207.65, y:190, accidental:"sharp" },
  { english:"A3",  spanish:"La3",   freq:220.00, y:180 },
  { english:"A#3", spanish:"La#3",  freq:233.08, y:180, accidental:"sharp" },
  { english:"B3",  spanish:"Si3",   freq:246.94, y:170 },
  { english:"C4",  spanish:"Do4",   freq:261.63, y:160 },
  { english:"C#4", spanish:"Do#4",  freq:277.18, y:160, accidental:"sharp" },
  { english:"D4",  spanish:"Re4",   freq:293.66, y:150 },
  { english:"D#4", spanish:"Re#4",  freq:311.13, y:150, accidental:"sharp" },
  { english:"E4",  spanish:"Mi4",   freq:329.63, y:140 },
  { english:"F4",  spanish:"Fa4",   freq:349.23, y:130 },
  { english:"F#4", spanish:"Fa#4",  freq:369.99, y:130, accidental:"sharp" },
  { english:"G4",  spanish:"Sol4",  freq:392.00, y:120 },
  { english:"G#4", spanish:"Sol#4", freq:415.30, y:120, accidental:"sharp" },
  { english:"A4",  spanish:"La4",   freq:440.00, y:110 },
  { english:"A#4", spanish:"La#4",  freq:466.16, y:110, accidental:"sharp" },
  { english:"B4",  spanish:"Si4",   freq:493.88, y:100 },
  { english:"C5",  spanish:"Do5",   freq:523.25, y:90  },
  { english:"C#5", spanish:"Do#5",  freq:554.37, y:90,  accidental:"sharp" },
  { english:"D5",  spanish:"Re5",   freq:587.33, y:80  },
  { english:"D#5", spanish:"Re#5",  freq:622.25, y:80,  accidental:"sharp" },
  { english:"E5",  spanish:"Mi5",   freq:659.25, y:70  },
  { english:"F5",  spanish:"Fa5",   freq:698.46, y:60  },
  { english:"F#5", spanish:"Fa#5",  freq:739.99, y:60,  accidental:"sharp" },
  { english:"G5",  spanish:"Sol5",  freq:783.99, y:50  },
  { english:"G#5", spanish:"Sol#5", freq:830.61, y:50,  accidental:"sharp" },
  { english:"A5",  spanish:"La5",   freq:880.00, y:40  },
  { english:"A#5", spanish:"La#5",  freq:932.33, y:40,  accidental:"sharp" },
  { english:"B5",  spanish:"Si5",   freq:987.77, y:30  },
  { english:"C6",  spanish:"Do6",   freq:1046.50,y:20  },
  { english:"C#6", spanish:"Do#6",  freq:1108.73,y:20,  accidental:"sharp" },
];

const DIFF_LABELS = { easy:"Fácil (Mi4–Fa5)", medium:"Medio (Do4–La5)", hard:"Difícil (Sol3–Do6 ♯)" };

function getPool(diff: "easy" | "medium" | "hard") {
  if (diff === "easy")   return ALL_NOTES.filter(n => n.y >= 60  && n.y <= 140 && !n.accidental);
  if (diff === "medium") return ALL_NOTES.filter(n => n.y >= 40  && n.y <= 160 && !n.accidental);
  return ALL_NOTES;
}

function getRandomNoteAndOptions(difficulty: "easy" | "medium" | "hard") {
  const pool = getPool(difficulty);
  const randomNote = pool[Math.floor(Math.random() * pool.length)];
  const numOpts = difficulty === "hard" ? 6 : 4;
  const others = pool.filter(n => n.english !== randomNote.english);
  const opts = [
    randomNote,
    ...others
      .map(x => ({ x, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(o => o.x)
      .slice(0, numOpts - 1)
  ]
  .map(x => ({ x, r: Math.random() }))
  .sort((a, b) => a.r - b.r)
  .map(o => o.x);
  return { randomNote, opts };
}

function getElapsedTime(startTime: number) {
  return (Date.now() - startTime) / 1000;
}

export default function SightReadingDashPage() {
  const [gameState, setGameState] = useState<"lobby" | "playing" | "gameover">("lobby");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [notation,   setNotation]   = useState<"english" | "spanish">("spanish");

  const [currentNote, setCurrentNote] = useState<StaffNote | null>(null);
  const [options,     setOptions]     = useState<StaffNote[]>([]);
  const [score,       setScore]       = useState(0);
  const [highScore,   setHighScore]   = useState(0);
  const [combo,       setCombo]       = useState(0);
  const [maxCombo,    setMaxCombo]    = useState(0);
  const [roundCount,  setRoundCount]  = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const [noteAttempts, setNoteAttempts] = useState<{ [key: string]: { correct: number; total: number } }>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect,      setIsCorrect]      = useState<boolean | null>(null);
  const [noteAppear,     setNoteAppear]     = useState(false);

  const [timeLeft, setTimeLeft]   = useState(6);
  const timerRef         = useRef<NodeJS.Timeout | null>(null);
  const roundStartTimeRef = useRef<number>(0);
  const audioCtxRef      = useRef<AudioContext | null>(null);

  const handleAnswerRef  = useRef<(answerNote: StaffNote | null) => void>(() => {});

  const playTone = (freq: number, duration = 0.7) => {
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = "triangle"; osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + duration);
    } catch (e) { console.error(e); }
  };

  const startNewRound = (nextDiff = difficulty) => {
    setSelectedAnswer(null); setIsCorrect(null); setTimeLeft(6); setNoteAppear(false);
    const { randomNote, opts } = getRandomNoteAndOptions(nextDiff);
    setCurrentNote(randomNote);
    setOptions(opts);
    setTimeout(() => {
      roundStartTimeRef.current = Date.now();
      setNoteAppear(true);
    }, 80);
  };

  const startGame = () => {
    setScore(0); setCombo(0); setMaxCombo(0); setRoundCount(0); setCorrectAnswers(0);
    setNoteAttempts({});
    setGameState("playing"); startNewRound(difficulty);
  };

  const handleAnswer = (answerNote: StaffNote | null) => {
    if (selectedAnswer !== null || !currentNote) return;
    const name = answerNote ? answerNote.english : "timeout";
    setSelectedAnswer(name);
    const ok = name === currentNote.english;
    setIsCorrect(ok);
    const label = currentNote[notation];
    setNoteAttempts(prev => {
      const e = prev[label] || { correct: 0, total: 0 };
      return { ...prev, [label]: { correct: e.correct + (ok ? 1 : 0), total: e.total + 1 } };
    });
    if (ok) {
      const taken = getElapsedTime(roundStartTimeRef.current);
      const bonus = Math.max(0, Math.floor((6 - taken) * 50));
      const pts = 100 + bonus;
      const ns = score + pts, nc = combo + 1;
      setScore(ns); setCombo(nc); if (nc > maxCombo) setMaxCombo(nc);
      setCorrectAnswers(p => p + 1);
      playTone(523.25, 0.15); setTimeout(() => playTone(659.25, 0.25), 100);
    } else {
      setCombo(0);
      playTone(196.00, 0.18); setTimeout(() => playTone(146.83, 0.35), 120);
    }
    setRoundCount(p => p + 1);
    setTimeout(() => {
      if (roundCount + 1 >= 10) {
        setGameState("gameover");
        const takenAtEnd = getElapsedTime(roundStartTimeRef.current);
        const fs = score + (ok ? 100 + Math.max(0, Math.floor((6 - takenAtEnd) * 50)) : 0);

        // Guardar estadísticas en base de datos
        const finalCorrect = correctAnswers + (ok ? 1 : 0);
        const finalAccuracy = Math.round((finalCorrect / 10) * 100);
        saveMinigameStat("sight-reading-dash", fs, finalAccuracy, difficulty);

        const stored = localStorage.getItem(`sight_reading_highscore_${difficulty}`);
        if (fs > (stored ? parseInt(stored) : 0)) {
          localStorage.setItem(`sight_reading_highscore_${difficulty}`, fs.toString());
          setHighScore(fs);
        }
      } else { startNewRound(difficulty); }
    }, 1800);
  };

  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem(`sight_reading_highscore_${difficulty}`);
      setTimeout(() => setHighScore(s ? parseInt(s) : 0), 0);
    }
  }, [difficulty]);

  useEffect(() => {
    if (gameState === "playing" && !selectedAnswer) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => setTimeLeft(p => +(p - 0.1).toFixed(1)), 100);
      } else {
        setTimeout(() => handleAnswerRef.current(null), 0);
      }
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, gameState, selectedAnswer]);

  const getLedgerLines = (noteY: number) => {
    const lines: number[] = [];
    if (noteY <= 40) for (let y = 40; y >= noteY; y -= 20) lines.push(y);
    else if (noteY >= 160) for (let y = 160; y <= noteY; y += 20) lines.push(y);
    return lines;
  };

  const getCleanPercentage = () => roundCount === 0 ? 0 : Math.round((correctAnswers / roundCount) * 100);
  const timerRatio = timeLeft / 6;
  const timerColor = timerRatio > 0.5 ? "#0e9eef" : timerRatio > 0.25 ? "#f0b100" : "#ff3366";

  return (
    <div
      className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col items-center select-none"
      style={{ paddingTop: "240px" }}
    >
      <div className="w-full max-w-[820px] mx-auto px-5 relative z-10 flex flex-col items-center pb-16">
        {/* Back link */}
        <Link
          href="/minijuegos"
          className="self-start mb-8 inline-flex items-center gap-2 text-xs font-bold text-white/30 hover:text-[#0e9eef] transition-all duration-300 group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
               className="group-hover:-translate-x-0.5 transition-transform">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a SmarTune Arcade
        </Link>

        <AnimatePresence mode="wait">

          {/* ═══════════════════════ LOBBY ═══════════════════════ */}
          {gameState === "lobby" && (
            <motion.div
              key="lobby"
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-20 }} transition={{ duration:0.45 }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-3 font-headline">
                Sight-Reading
              </h1>
              <h2
                className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-5 font-headline"
                style={{
                  background: "linear-gradient(90deg, #0e9eef 0%, #9810fa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Ráfaga de Lectura
              </h2>

              <p className="text-[15px] text-white/50 font-light max-w-lg mb-12 leading-relaxed">
                Aprende a leer notas en el pentagrama al instante. Observa el pentagrama
                y pulsa la nota correcta antes de que el tiempo se acabe.
              </p>

              {/* Config card */}
              <motion.div
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
                className="w-full max-w-[500px] bg-white/[0.03] border border-white/[0.04] rounded-2xl p-7 mb-10 text-left"
              >
                {/* Difficulty */}
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Rango y dificultad</p>
                <div className="grid grid-cols-3 gap-2 mb-7">
                  {(["easy","medium","hard"] as const).map(d => (
                    <motion.button
                      key={d} whileTap={{ scale:0.96 }}
                      onClick={() => setDifficulty(d)}
                      className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border"
                      style={difficulty === d ? {
                        background:"linear-gradient(90deg,#0e9eef,#9810fa)",
                        color:"#fff", border:"1px solid transparent",
                        boxShadow:"0 0 20px rgba(14,158,239,0.3)",
                      } : {
                        background:"rgba(255,255,255,0.03)",
                        color:"rgba(255,255,255,0.4)",
                        border:"1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {DIFF_LABELS[d]}
                    </motion.button>
                  ))}
                </div>

                {/* Notation */}
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Notación musical</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {(["english","spanish"] as const).map(n => (
                    <motion.button
                      key={n} whileTap={{ scale:0.96 }}
                      onClick={() => setNotation(n)}
                      className="py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border"
                      style={notation === n ? {
                        background:"linear-gradient(90deg,#0e9eef,#9810fa)",
                        color:"#fff", border:"1px solid transparent",
                        boxShadow:"0 0 20px rgba(14,158,239,0.3)",
                      } : {
                        background:"rgba(255,255,255,0.03)",
                        color:"rgba(255,255,255,0.4)",
                        border:"1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {n === "english" ? "C, D, E (Inglés)" : "Do, Re, Mi (Latino)"}
                    </motion.button>
                  ))}
                </div>

                {/* Highscore */}
                <div className="flex justify-between items-center pt-4 border-t border-white/[0.04]">
                  <span className="text-[11px] text-white/30">Récord personal ({DIFF_LABELS[difficulty]})</span>
                  <span className="text-[13px] font-extrabold" style={{ color:"#0e9eef" }}>{highScore.toLocaleString()} pts</span>
                </div>
              </motion.div>

              {/* Start button */}
              <motion.button
                onClick={startGame}
                whileHover={{ scale:1.03 }}
                whileTap={{ scale:0.97 }}
                className="px-12 py-4 rounded-2xl text-[15px] font-black uppercase tracking-[0.1em] text-white transition-all"
                style={{
                  background:"linear-gradient(90deg, #0e9eef 0%, #9810fa 100%)",
                  boxShadow:"0 0 20px rgba(14,158,239,0.3)", border:"none",
                }}
              >
                Comenzar Desafío →
              </motion.button>
            </motion.div>
          )}

          {/* ═══════════════════════ PLAYING ═══════════════════════ */}
          {gameState === "playing" && currentNote && (
            <motion.div
              key="playing"
              initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.97 }} transition={{ duration:0.35 }}
              className="w-full flex flex-col items-center"
            >
              {/* HUD */}
              <div className="w-full flex justify-between items-center mb-7 pb-5 border-b border-white/[0.06]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Puntuación</span>
                  <motion.span
                    key={score}
                    initial={{ scale:1.25, color:"#0e9eef" }} animate={{ scale:1, color:"#ffffff" }}
                    transition={{ duration:0.4 }}
                    className="text-2xl font-black font-headline"
                  >
                    {score.toLocaleString()}
                  </motion.span>
                </div>

                <div className="flex items-center gap-5">
                  <AnimatePresence>
                    {combo > 0 && (
                      <motion.div
                        key={combo}
                        initial={{ scale:0.6, opacity:0, y:6 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ opacity:0 }}
                        className="flex flex-col items-end"
                      >
                        <span className="text-[8px] font-black uppercase tracking-[0.15em]" style={{ color:"#0e9eef" }}>Racha 🔥</span>
                        <span className="text-xl font-black leading-none font-headline" style={{ color:"#0e9eef" }}>×{combo}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Ronda</span>
                    <span className="text-2xl font-black font-headline">{roundCount + 1}<span className="text-white/30 text-base">/10</span></span>
                  </div>
                </div>
              </div>

              {/* Staff card */}
              <div
                className="w-full max-w-[520px] bg-black/60 border border-white/[0.06] rounded-2xl p-5 mb-7 flex flex-col items-center relative overflow-hidden"
              >
                {/* Timer bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl overflow-hidden"
                     style={{ background:"rgba(255,255,255,0.04)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${timerRatio * 100}%`,
                      background: timerColor,
                      transition:"width 0.1s linear, background 0.3s",
                    }}
                  />
                </div>

                {/* Timer countdown */}
                <div className="absolute top-4 right-5 flex items-center gap-1.5">
                  <span className="text-[10px] font-black tabular-nums"
                        style={{ color: timerColor }}>
                    {timeLeft.toFixed(1)}s
                  </span>
                </div>

                {/* Staff SVG */}
                <svg viewBox="0 0 500 230" className="w-full overflow-visible">
                  <defs>
                    <radialGradient id="noteGradSR" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor={isCorrect === null ? "#5ecfff" : isCorrect ? "#00ffaa" : "#ff6688"} />
                      <stop offset="60%" stopColor={isCorrect === null ? "#0e9eef" : isCorrect ? "#00cc88" : "#ff3366"} />
                      <stop offset="100%" stopColor={isCorrect === null ? "#0570b0" : isCorrect ? "#008855" : "#aa1133"} />
                    </radialGradient>
                  </defs>

                  {/* Staff lines */}
                  {[60, 80, 100, 120, 140].map(y => (
                    <line key={y} x1="20" y1={y} x2="480" y2={y}
                          stroke="rgba(14,158,239,0.25)" strokeWidth="2" />
                  ))}

                  {/* Barlines */}
                  <line x1="20"  y1="60" x2="20"  y2="140" stroke="rgba(14,158,239,0.4)" strokeWidth="3" strokeLinecap="round" />
                  <line x1="480" y1="60" x2="480" y2="140" stroke="rgba(14,158,239,0.4)" strokeWidth="3" strokeLinecap="round" />

                  {/* Treble clef (purple) */}
                  <g>
                    <path d="M 50 15 L 50 165 C 50 185, 30 185, 30 172"
                          stroke="#9810fa" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    <path d="M 50 15 C 68 15, 68 55, 50 55 C 32 55, 32 15, 50 15"
                          stroke="#9810fa" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    <path d="M 50 55 C 10 55, 5 135, 50 135 C 80 135, 80 95, 50 95 C 35 95, 25 110, 50 120"
                          stroke="#9810fa" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  </g>

                  {/* Ledger lines */}
                  {getLedgerLines(currentNote.y).map(y => (
                    <line key={y} x1="234" y1={y} x2="286" y2={y}
                          stroke={isCorrect === null ? "rgba(14,158,239,0.8)" : isCorrect ? "rgba(0,255,170,0.8)" : "rgba(255,51,102,0.8)"}
                          strokeWidth="2.5" />
                  ))}

                  {/* Note stem */}
                  {currentNote.y >= 100 ? (
                    <line x1="274" y1={currentNote.y} x2="274" y2={currentNote.y - 54}
                          stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" />
                  ) : (
                    <line x1="246" y1={currentNote.y} x2="246" y2={currentNote.y + 54}
                          stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" />
                  )}

                  {/* Note head */}
                  <motion.ellipse
                    cx="260" cy={currentNote.y} rx="14" ry="9"
                    fill="url(#noteGradSR)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={noteAppear ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ type:"spring", stiffness:280, damping:20 }}
                    style={{
                      transformOrigin:"260px " + currentNote.y + "px",
                      transform:"rotate(-18deg)",
                    }}
                  />

                  {/* Accidental */}
                  {currentNote.accidental === "sharp" && (
                    <motion.text
                      x="220" y={currentNote.y + 9}
                      fill="#f6339a" fontSize="30" fontWeight="bold" textAnchor="middle"
                      initial={{ opacity:0, x:230 }} animate={{ opacity:1, x:220 }}
                      style={{ fontFamily:"sans-serif" }}
                    >
                      ♯
                    </motion.text>
                  )}
                </svg>

                {/* Listen button */}
                <motion.button
                  onClick={() => playTone(currentNote.freq, 0.8)}
                  whileHover={{ scale:1.04 }} whileTap={{ scale:0.95 }}
                  className="mt-1 px-5 py-2 rounded-xl flex items-center gap-2 text-[11px] font-bold transition-all bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/70"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  Escuchar nota
                </motion.button>
              </div>

              {/* Feedback */}
              <div className="h-7 mb-6 text-center">
                <AnimatePresence mode="wait">
                  {selectedAnswer === null ? (
                    <motion.p key="inst" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
                              className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold">
                      Identifica la nota en el pentagrama
                    </motion.p>
                  ) : (
                    <motion.p key="fb" initial={{opacity:0,scale:0.88}} animate={{opacity:1,scale:1}}
                              className="text-sm font-black tracking-wide uppercase"
                              style={{ color: isCorrect ? "#00ffaa" : "#ff3366" }}>
                      {isCorrect ? `¡Correcto! Era ${currentNote[notation]}` : `Era ${currentNote[notation]}`}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Answer buttons */}
              <div className={`grid w-full ${options.length <= 4 ? "grid-cols-2" : "grid-cols-3"} gap-3 max-w-[620px]`}>
                {options.map(opt => {
                  const isSel   = selectedAnswer === opt.english;
                  const isRight = opt.english === currentNote.english;
                  const revealed = selectedAnswer !== null;
                  return (
                    <motion.button
                      key={opt.english}
                      onClick={() => handleAnswer(opt)}
                      disabled={revealed}
                      whileHover={{ scale: revealed ? 1 : 1.04 }}
                      whileTap={{ scale: revealed ? 1 : 0.96 }}
                      className="h-16 rounded-2xl flex items-center justify-center text-[18px] font-bold border transition-all font-headline hover:bg-white/[0.05]"
                      style={
                        !revealed
                          ? { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", color:"#fff" }
                          : isRight
                          ? { background:"rgba(0,255,170,0.10)", border:"1px solid rgba(0,255,170,0.4)", color:"#00ffaa", fontWeight:900 }
                          : isSel
                          ? { background:"rgba(255,51,102,0.10)", border:"1px solid rgba(255,51,102,0.4)", color:"#ff3366", fontWeight:900 }
                          : { background:"rgba(255,255,255,0.01)", border:"1px solid rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.18)" }
                      }
                    >
                      {opt[notation]}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════ GAMEOVER ═══════════════════════ */}
          {gameState === "gameover" && (
            <motion.div
              key="gameover"
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-20 }} transition={{ duration:0.45 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h2 className="text-4xl font-black tracking-tight mb-10 font-headline">
                Tus Resultados
              </h2>

              {/* Stats card */}
              <div className="w-full max-w-[540px] bg-white/[0.03] border border-white/[0.04] rounded-2xl p-7 mb-10">
                {/* Main stats */}
                <div className="grid grid-cols-3 gap-3.5 mb-8">
                  {[
                    { label:"Puntos",    val: score.toLocaleString(),    color:"#0e9eef" },
                    { label:"Precisión", val: `${getCleanPercentage()}%`, color:"#f6339a" },
                    { label:"Max Racha", val: `${maxCombo}🔥`,            color:"#c084fc" },
                  ].map(s => (
                    <motion.div
                      key={s.label}
                      initial={{ scale:0.85, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.1 }}
                      className="flex flex-col items-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1.5">{s.label}</span>
                      <span className="text-2xl font-black font-headline" style={{ color:s.color }}>{s.val}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Note breakdown */}
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 text-left">
                  Desglose de lectura por nota
                </h3>
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto no-scrollbar">
                  {Object.entries(noteAttempts).map(([note, stats]) => {
                    const pct = Math.round((stats.correct / stats.total) * 100);
                    const col = pct >= 80 ? "#00ffaa" : pct >= 50 ? "#f0b100" : "#ff3366";
                    return (
                      <div key={note} className="flex justify-between items-center text-xs px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full" style={{ background:col }} />
                          <span className="font-bold">Nota {note}</span>
                        </div>
                        <span className="text-white/40">
                          <span className="font-black" style={{ color:col }}>{stats.correct}</span>
                          /{stats.total} (<span style={{ color:col }}>{pct}%</span>)
                        </span>
                      </div>
                    );
                  })}
                  {Object.keys(noteAttempts).length === 0 && (
                    <p className="text-xs text-white/20 italic py-4">No hay datos disponibles.</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-[480px]">
                <motion.button
                  onClick={startGame}
                  whileHover={{ scale:1.02 }}
                  whileTap={{ scale:0.97 }}
                  className="flex-1 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.12em] text-white transition-all"
                  style={{ background:"linear-gradient(90deg,#0e9eef,#9810fa)", boxShadow:"0 0 20px rgba(14,158,239,0.3)", border:"none" }}
                >
                  Volver a Jugar
                </motion.button>
                <motion.button
                  onClick={() => setGameState("lobby")}
                  whileTap={{ scale:0.97 }}
                  className="flex-1 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.12em] text-white/50 hover:text-white transition-all bg-white/[0.03] border border-white/[0.05]"
                >
                  Cambiar Dificultad
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
