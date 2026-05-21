"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Definición de la nota del pentagrama
interface StaffNote {
  english: string;
  spanish: string;
  freq: number;
  y: number; // Y en coordenadas SVG
  accidental?: "sharp" | null;
}

const ALL_NOTES: StaffNote[] = [
  // Notas Graves ( ledger lines abajo )
  { english: "G3", spanish: "Sol3", freq: 196.00, y: 190 },
  { english: "G#3", spanish: "Sol#3", freq: 207.65, y: 190, accidental: "sharp" },
  { english: "A3", spanish: "La3", freq: 220.00, y: 180 },
  { english: "A#3", spanish: "La#3", freq: 233.08, y: 180, accidental: "sharp" },
  { english: "B3", spanish: "Si3", freq: 246.94, y: 170 },
  
  // Notas del pentagrama medio
  { english: "C4", spanish: "Do4", freq: 261.63, y: 160 },
  { english: "C#4", spanish: "Do#4", freq: 277.18, y: 160, accidental: "sharp" },
  { english: "D4", spanish: "Re4", freq: 293.66, y: 150 },
  { english: "D#4", spanish: "Re#4", freq: 311.13, y: 150, accidental: "sharp" },
  { english: "E4", spanish: "Mi4", freq: 329.63, y: 140 },
  { english: "F4", spanish: "Fa4", freq: 349.23, y: 130 },
  { english: "F#4", spanish: "Fa#4", freq: 369.99, y: 130, accidental: "sharp" },
  { english: "G4", spanish: "Sol4", freq: 392.00, y: 120 },
  { english: "G#4", spanish: "Sol#4", freq: 415.30, y: 120, accidental: "sharp" },
  { english: "A4", spanish: "La4", freq: 440.00, y: 110 },
  { english: "A#4", spanish: "La#4", freq: 466.16, y: 110, accidental: "sharp" },
  { english: "B4", spanish: "Si4", freq: 493.88, y: 100 },
  { english: "C5", spanish: "Do5", freq: 523.25, y: 90 },
  { english: "C#5", spanish: "Do#5", freq: 554.37, y: 90, accidental: "sharp" },
  { english: "D5", spanish: "Re5", freq: 587.33, y: 80 },
  { english: "D#5", spanish: "Re#5", freq: 622.25, y: 80, accidental: "sharp" },
  { english: "E5", spanish: "Mi5", freq: 659.25, y: 70 },
  { english: "F5", spanish: "Fa5", freq: 698.46, y: 60 },
  { english: "F#5", spanish: "Fa#5", freq: 739.99, y: 60, accidental: "sharp" },
  
  // Notas Agudas ( ledger lines arriba )
  { english: "G5", spanish: "Sol5", freq: 783.99, y: 50 },
  { english: "G#5", spanish: "Sol#5", freq: 830.61, y: 50, accidental: "sharp" },
  { english: "A5", spanish: "La5", freq: 880.00, y: 40 },
  { english: "A#5", spanish: "La#5", freq: 932.33, y: 40, accidental: "sharp" },
  { english: "B5", spanish: "Si5", freq: 987.77, y: 30 },
  { english: "C6", spanish: "Do6", freq: 1046.50, y: 20 },
  { english: "C#6", spanish: "Do#6", freq: 1108.73, y: 20, accidental: "sharp" }
];

export default function SightReadingDashPage() {
  const [gameState, setGameState] = useState<"lobby" | "playing" | "gameover">("lobby");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [notation, setNotation] = useState<"english" | "spanish">("spanish");

  const [currentNote, setCurrentNote] = useState<StaffNote | null>(null);
  const [options, setOptions] = useState<StaffNote[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Historial pedagógico
  const [adivinados, setAdivinados] = useState<string[]>([]);
  const [errados, setErrados] = useState<string[]>([]);
  const [noteAttempts, setNoteAttempts] = useState<{ [key: string]: { correct: number; total: number } }>({});

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Temporizador de ronda
  const [timeLeft, setTimeLeft] = useState(6);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const roundStartTimeRef = useRef<number>(0);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Cargar High Score desde LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHighScore = localStorage.getItem(`sight_reading_highscore_${difficulty}`);
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore));
      } else {
        setHighScore(0);
      }
    }
  }, [difficulty]);

  // Temporizador interactivo contrarreloj
  useEffect(() => {
    if (gameState === "playing" && !selectedAnswer) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft((prev) => +(prev - 0.1).toFixed(1));
        }, 100);
      } else {
        handleAnswer(null);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameState, selectedAnswer]);

  // Sintetizar tono de la nota
  const playTone = (freq: number, duration = 0.7, forceSynth = false) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  const getFilteredPool = (diff = difficulty) => {
    if (diff === "easy") {
      // Solo notas dentro del pentagrama natural (E4 a F5)
      return ALL_NOTES.filter((n) => n.y >= 60 && n.y <= 140 && !n.accidental);
    } else if (diff === "medium") {
      // Notas naturales con líneas adicionales simples (C4 a A5)
      return ALL_NOTES.filter((n) => n.y >= 40 && n.y <= 160 && !n.accidental);
    } else {
      // Escala completa cromática incluyendo sostenidos
      return ALL_NOTES;
    }
  };

  const startNewRound = (nextDifficulty = difficulty) => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(6);

    const pool = getFilteredPool(nextDifficulty);
    const randomNote = pool[Math.floor(Math.random() * pool.length)];
    setCurrentNote(randomNote);

    // Preparar opciones de respuesta
    let numOptions = nextDifficulty === "hard" ? 6 : 4;
    const others = pool.filter((n) => n.english !== randomNote.english);
    const shuffledOthers = others.sort(() => 0.5 - Math.random());
    const finalOptions = [randomNote, ...shuffledOthers.slice(0, numOptions - 1)].sort(() => 0.5 - Math.random());

    setOptions(finalOptions);
    roundStartTimeRef.current = Date.now();
  };

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setRoundCount(0);
    setCorrectAnswers(0);
    setAdivinados([]);
    setErrados([]);
    setNoteAttempts({});
    setGameState("playing");
    startNewRound(difficulty);
  };

  const handleAnswer = (answerNote: StaffNote | null) => {
    if (selectedAnswer !== null || !currentNote) return;

    const answerName = answerNote ? answerNote.english : "timeout";
    setSelectedAnswer(answerName);

    const isAnswerCorrect = answerName === currentNote.english;
    setIsCorrect(isAnswerCorrect);

    const currentNoteLabel = currentNote[notation];
    setNoteAttempts((prev) => {
      const existing = prev[currentNoteLabel] || { correct: 0, total: 0 };
      return {
        ...prev,
        [currentNoteLabel]: {
          correct: existing.correct + (isAnswerCorrect ? 1 : 0),
          total: existing.total + 1,
        },
      };
    });

    if (isAnswerCorrect) {
      const timeTaken = (Date.now() - roundStartTimeRef.current) / 1000;
      const speedBonus = Math.max(0, Math.floor((6 - timeTaken) * 50));
      const pointsEarned = 100 + speedBonus;

      setScore((prev) => prev + pointsEarned);
      setCombo((prev) => {
        const next = prev + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setCorrectAnswers((prev) => prev + 1);
      setAdivinados((prev) => [...prev, currentNoteLabel]);

      // Feedback auditivo de éxito
      playTone(523.25, 0.15, true);
      setTimeout(() => playTone(659.25, 0.25, true), 100);
    } else {
      setCombo(0);
      setErrados((prev) => [...prev, currentNoteLabel]);

      // Feedback auditivo de error
      playTone(196.00, 0.18, true);
      setTimeout(() => playTone(146.83, 0.35, true), 120);
    }

    setRoundCount((prev) => prev + 1);

    setTimeout(() => {
      if (roundCount + 1 >= 10) {
        setGameState("gameover");
        // Evaluar Highscore
        const finalScore = score + (isAnswerCorrect ? 100 : 0);
        const storedHighScore = localStorage.getItem(`sight_reading_highscore_${difficulty}`);
        const currentHighScore = storedHighScore ? parseInt(storedHighScore) : 0;
        if (finalScore > currentHighScore) {
          localStorage.setItem(`sight_reading_highscore_${difficulty}`, finalScore.toString());
          setHighScore(finalScore);
        }
      } else {
        startNewRound(difficulty);
      }
    }, 1800);
  };

  const getLedgerLines = (noteY: number) => {
    const lines = [];
    if (noteY <= 40) {
      for (let y = 40; y >= noteY; y -= 20) {
        lines.push(y);
      }
    } else if (noteY >= 160) {
      for (let y = 160; y <= noteY; y += 20) {
        lines.push(y);
      }
    }
    return lines;
  };

  const getCleanPercentage = () => {
    if (roundCount === 0) return 0;
    return Math.round((correctAnswers / roundCount) * 100);
  };

  return (
    <div
      className="relative min-h-screen text-white overflow-hidden flex flex-col items-center select-none"
      style={{
        background: "linear-gradient(160deg, #070712 0%, #0c0b1f 50%, #070710 100%)",
        paddingTop: "240px",
      }}
    >
      {/* ── Background Ambience ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,255,255,0.08) 0%, rgba(152,16,250,0.03) 50%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div className="w-full max-w-[800px] mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Enlace de regreso */}
        <Link href="/minijuegos" className="self-start mb-6 inline-flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a SmarTune Arcade
        </Link>

        <AnimatePresence mode="wait">
          {/* LOBBY / CONFIGURACIÓN */}
          {gameState === "lobby" && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[10px] tracking-widest font-black uppercase bg-[#00ffff]/10 text-[#00ffff] border border-[#00ffff]/20 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffff] animate-pulse"></span>
                LECTURA A PRIMERA VISTA
              </div>

              <h1 className="text-4xl sm:text-[54px] font-extrabold tracking-tight mb-4 font-headline leading-none">
                Sight-Reading Dash<br />
                <span style={{
                  background: "linear-gradient(90deg, #00ffff 0%, #9810fa 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>Ráfaga de Lectura</span>
              </h1>

              <p className="text-[15px] sm:text-[16px] text-white/50 font-light max-w-lg mb-10 leading-relaxed">
                Aprende a leer notas musicales en clave de sol de forma instantánea. Observa el pentagrama neón y pulsa la nota correcta antes de que se acabe el tiempo.
              </p>

              {/* Contenedor de Configuración */}
              <div className="w-full max-w-[480px] bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8 mb-10 text-left backdrop-blur-md">
                {/* 1. Selección de Dificultad */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Rango y Dificultad</h3>
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                        difficulty === d
                          ? "bg-white text-black border-white shadow-xl scale-[1.03]"
                          : "bg-white/[0.02] text-white/40 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                    >
                      {d === "easy" ? "Fácil (Mi4-Fa5)" : d === "medium" ? "Medio (Do4-La5)" : "Difícil (Sol3-Do6 #)"}
                    </button>
                  ))}
                </div>

                {/* 2. Tipo de Notación */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Notación musical</h3>
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {(["english", "spanish"] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => setNotation(n)}
                      className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                        notation === n
                          ? "bg-white text-black border-white shadow-xl scale-[1.03]"
                          : "bg-white/[0.02] text-white/40 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                    >
                      {n === "english" ? "C, D, E (Inglés)" : "Do, Re, Mi (Latino)"}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs text-white/30 pt-3 border-t border-white/[0.05]">
                  <span>Puntuación máxima actual:</span>
                  <span className="font-extrabold text-[#00ffff]">{highScore} pts</span>
                </div>
              </div>

              {/* Botón de inicio */}
              <button
                onClick={startGame}
                className="px-10 py-4.5 rounded-2xl text-[16px] font-black uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-95 duration-200"
                style={{
                  background: "linear-gradient(90deg, #00ffff 0%, #9810fa 100%)",
                  boxShadow: "0 8px 30px rgba(0, 255, 255, 0.3)",
                  border: "none",
                }}
              >
                Comenzar Desafío
              </button>
            </motion.div>
          )}

          {/* JUEGO EN PROGRESO */}
          {gameState === "playing" && currentNote && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {/* Header de Info */}
              <div className="w-full flex justify-between items-center mb-6 border-b border-white/[0.05] pb-5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Puntuación</span>
                  <span className="text-2xl font-black text-white leading-none font-headline">{score}</span>
                </div>

                {/* Estatus / Ronda */}
                <div className="flex items-center gap-6">
                  {combo > 0 && (
                    <motion.div
                      key={combo}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-end"
                    >
                      <span className="text-[9px] font-bold text-[#f6339a] tracking-widest uppercase">Racha 🔥</span>
                      <span className="text-xl font-black text-[#f6339a] leading-none">x{combo}</span>
                    </motion.div>
                  )}

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Ronda</span>
                    <span className="text-2xl font-black text-white leading-none font-headline">{roundCount + 1}/10</span>
                  </div>
                </div>
              </div>

              {/* PENTAGRAMA INTERACTIVO SVG */}
              <div className="w-full max-w-[500px] bg-black/60 border border-white/[0.08] rounded-3xl p-6 mb-8 flex flex-col items-center relative overflow-hidden backdrop-blur-md shadow-2xl">
                
                {/* Indicador de Temporizador superior */}
                <div className="absolute top-0 left-0 h-1 bg-[#00ffff]" style={{ width: `${(timeLeft / 6) * 100}%`, transition: "width 0.1s ease" }} />

                <svg viewBox="0 0 500 220" className="w-full overflow-visible">
                  <defs>
                    <radialGradient id="noteGrad" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ff7ec3" />
                      <stop offset="70%" stopColor="#f6339a" />
                      <stop offset="100%" stopColor="#a10d54" />
                    </radialGradient>
                  </defs>

                  {/* 5 Líneas del Pentagrama */}
                  {[60, 80, 100, 120, 140].map((yVal) => (
                    <line
                      key={yVal}
                      x1="20"
                      y1={yVal}
                      x2="480"
                      y2={yVal}
                      stroke="rgba(0, 255, 255, 0.25)"
                      strokeWidth="2.5"
                      style={{ filter: "drop-shadow(0 0 3px rgba(0, 255, 255, 0.15))" }}
                    />
                  ))}

                  {/* Líneas divisorias verticales sutiles */}
                  <line x1="20" y1="60" x2="20" y2="140" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="3" />
                  <line x1="480" y1="60" x2="480" y2="140" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="3" />

                  {/* Clave de Sol estilizada (Circuit/Neon style trace) */}
                  <g style={{ filter: "drop-shadow(0 0 5px rgba(152, 16, 250, 0.6))" }}>
                    {/* Línea vertical principal */}
                    <path
                      d="M 50 15 L 50 165 C 50 185, 30 185, 30 172"
                      stroke="#9810fa"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Bucle superior */}
                    <path
                      d="M 50 15 C 68 15, 68 55, 50 55 C 32 55, 32 15, 50 15"
                      stroke="#9810fa"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Bucle en Sol4 (Y = 120) */}
                    <path
                      d="M 50 55 C 10 55, 5 135, 50 135 C 80 135, 80 95, 50 95 C 35 95, 25 110, 50 120"
                      stroke="#9810fa"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Líneas Adicionales (Ledger Lines) Dinámicas */}
                  {getLedgerLines(currentNote.y).map((yVal) => (
                    <line
                      key={yVal}
                      x1="236"
                      y1={yVal}
                      x2="284"
                      y2={yVal}
                      stroke="rgba(0, 255, 255, 0.75)"
                      strokeWidth="2.5"
                      style={{ filter: "drop-shadow(0 0 4px rgba(0, 255, 255, 0.4))" }}
                    />
                  ))}

                  {/* Plica (Tallo) de la Nota */}
                  {currentNote.y >= 100 ? (
                    <line
                      x1="273"
                      y1={currentNote.y}
                      x2="273"
                      y2={currentNote.y - 52}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                  ) : (
                    <line
                      x1="247"
                      y1={currentNote.y}
                      x2="247"
                      y2={currentNote.y + 52}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Cabeza de la Nota Ovalada con Glow */}
                  <ellipse
                    cx="260"
                    cy={currentNote.y}
                    rx="14"
                    ry="9"
                    fill="url(#noteGrad)"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    style={{
                      filter: "drop-shadow(0 0 10px rgba(246, 51, 154, 0.85))",
                      transformOrigin: "260px " + currentNote.y + "px",
                      transform: "rotate(-18deg)"
                    }}
                  />

                  {/* Alteración Accidental (Sostenido ♯ si aplica) */}
                  {currentNote.accidental === "sharp" && (
                    <text
                      x="222"
                      y={currentNote.y + 9}
                      fill="#f6339a"
                      fontSize="30"
                      fontWeight="bold"
                      textAnchor="middle"
                      style={{ filter: "drop-shadow(0 0 6px rgba(246, 51, 154, 0.8))", fontFamily: "sans-serif" }}
                    >
                      ♯
                    </text>
                  )}
                </svg>

                {/* Botón de reproducción de audio sutil */}
                <button
                  onClick={() => playTone(currentNote.freq, 0.8)}
                  className="mt-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all text-xs font-bold rounded-xl flex items-center gap-2 text-white/70 hover:text-white"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  Escuchar Nota
                </button>
              </div>

              {/* Instrucción Visual */}
              <div className="h-6 mb-6 text-center">
                <AnimatePresence mode="wait">
                  {selectedAnswer === null ? (
                    <motion.p
                      key="inst"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-white/40 uppercase tracking-widest font-semibold"
                    >
                      Identifica la nota dibujada en el pentagrama
                    </motion.p>
                  ) : (
                    <motion.div
                      key="feedback"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {isCorrect ? (
                        <span className="text-sm font-black tracking-wide text-[#00ffaa] uppercase">
                          ¡Correcto! Nota {currentNote[notation]}
                        </span>
                      ) : (
                        <span className="text-sm font-black tracking-wide text-[#ff3366] uppercase">
                          Incorrecto (Era {currentNote[notation]})
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cuadrícula de opciones de respuestas */}
              <div className={`grid w-full ${options.length <= 4 ? "grid-cols-2" : "grid-cols-3"} gap-3.5 max-w-[620px]`}>
                {options.map((option) => {
                  const isSelected = selectedAnswer === option.english;
                  const isThisCorrect = option.english === currentNote.english;

                  let btnBg = "bg-white/[0.03]";
                  let btnBorder = "border-white/[0.06]";
                  let btnText = "text-white";

                  if (selectedAnswer !== null) {
                    if (isThisCorrect) {
                      btnBg = "bg-[#00ffaa]/10";
                      btnBorder = "border-[#00ffaa]/40";
                      btnText = "text-[#00ffaa] font-black";
                    } else if (isSelected) {
                      btnBg = "bg-[#ff3366]/10";
                      btnBorder = "border-[#ff3366]/40";
                      btnText = "text-[#ff3366] font-black";
                    } else {
                      btnBg = "bg-white/[0.01]";
                      btnBorder = "border-white/[0.03]";
                      btnText = "text-white/20";
                    }
                  }

                  return (
                    <motion.button
                      key={option.english}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      whileHover={{ scale: selectedAnswer ? 1 : 1.03 }}
                      whileTap={{ scale: selectedAnswer ? 1 : 0.97 }}
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        boxShadow: selectedAnswer && isThisCorrect ? "0 0 20px rgba(0, 255, 170, 0.15)" : "none",
                      }}
                      className={`h-16 rounded-2xl flex items-center justify-center text-[18px] font-semibold border transition-all ${btnBg} ${btnBorder} ${btnText}`}
                    >
                      {option[notation]}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* FIN DEL JUEGO / RESULTADOS */}
          {gameState === "gameover" && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[10px] tracking-widest font-black uppercase bg-[#00ffff]/10 text-[#00ffff] border border-[#00ffff]/20 mb-5">
                LECTURA MÚSICAL COMPLETADA
              </div>

              <h2 className="text-3xl sm:text-[44px] font-extrabold tracking-tight mb-8 font-headline">
                Tus Resultados
              </h2>

              {/* Estadísticas */}
              <div className="w-full max-w-[540px] bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 sm:p-8 mb-10 backdrop-blur-md">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col items-center p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <span className="text-[10px] font-bold text-white/30 uppercase mb-1">Puntos</span>
                    <span className="text-2xl font-black text-[#00ffff] font-headline">{score}</span>
                  </div>

                  <div className="flex flex-col items-center p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <span className="text-[10px] font-bold text-white/30 uppercase mb-1">Precisión</span>
                    <span className="text-2xl font-black text-[#f6339a] font-headline">{getCleanPercentage()}%</span>
                  </div>

                  <div className="flex flex-col items-center p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <span className="text-[10px] font-bold text-white/30 uppercase mb-1">Max Racha</span>
                    <span className="text-2xl font-black text-[#c084fc] font-headline">{maxCombo}🔥</span>
                  </div>
                </div>

                {/* Desglose Pedagógico de Notas */}
                <h3 className="text-xs font-black uppercase tracking-wider text-white/40 mb-4 text-left">
                  Desglose de precisión de lectura
                </h3>
                <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                  {Object.entries(noteAttempts).map(([note, stats]) => {
                    const pct = Math.round((stats.correct / stats.total) * 100);
                    let color = "text-[#ff3366]";
                    if (pct >= 80) color = "text-[#00ffaa]";
                    else if (pct >= 50) color = "text-[#f0b100]";

                    return (
                      <div key={note} className="flex justify-between items-center text-xs bg-white/[0.01] border border-white/[0.03] px-4 py-2.5 rounded-xl">
                        <span className="font-bold">Nota {note}</span>
                        <span className="text-white/40">
                          Aciertos: <span className={`${color} font-black`}>{stats.correct}</span> / {stats.total} (<span className={color}>{pct}%</span>)
                        </span>
                      </div>
                    );
                  })}
                  {Object.keys(noteAttempts).length === 0 && (
                    <p className="text-xs text-white/20 italic py-4 text-center">No hay datos de lectura disponibles.</p>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[480px]">
                <button
                  onClick={startGame}
                  className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-95 duration-200"
                  style={{
                    background: "linear-gradient(90deg, #00ffff 0%, #9810fa 100%)",
                    boxShadow: "0 4px 20px rgba(0, 255, 255, 0.2)",
                    border: "none",
                  }}
                >
                  Volver a Jugar
                </button>

                <button
                  onClick={() => setGameState("lobby")}
                  className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white/70 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white transition-all duration-200"
                >
                  Cambiar Dificultad
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
