"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Definición de Notas, Frecuencias y Notaciones
interface NoteConfig {
  english: string;
  spanish: string;
  freq: number;
}

const NOTES: NoteConfig[] = [
  { english: "C", spanish: "Do", freq: 261.63 },
  { english: "C#", spanish: "Do#", freq: 277.18 },
  { english: "D", spanish: "Re", freq: 293.66 },
  { english: "D#", spanish: "Re#", freq: 311.13 },
  { english: "E", spanish: "Mi", freq: 329.63 },
  { english: "F", spanish: "Fa", freq: 349.23 },
  { english: "F#", spanish: "Fa#", freq: 369.99 },
  { english: "G", spanish: "Sol", freq: 392.00 },
  { english: "G#", spanish: "Sol#", freq: 415.30 },
  { english: "A", spanish: "La", freq: 440.00 },
  { english: "A#", spanish: "La#", freq: 466.16 },
  { english: "B", spanish: "Si", freq: 493.88 },
];

const DIFFICULTY_MAP = {
  easy: ["C", "E", "G", "A"], // Pentatónica C Major - Muy distinguible
  medium: ["C", "D", "E", "F", "G", "A", "B"], // Diatónica C Major
  hard: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], // Cromática Completa
};

export default function PitchFinderPage() {
  const [gameState, setGameState] = useState<"lobby" | "playing" | "gameover">("lobby");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [notation, setNotation] = useState<"english" | "spanish">("spanish");
  const [instrument, setInstrument] = useState<"synth" | "piano" | "guitar" | "organ" | "flute">("synth");

  const [currentNote, setCurrentNote] = useState<NoteConfig | null>(null);
  const [options, setOptions] = useState<NoteConfig[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Historial para pantalla final
  const [adivinados, setAdivinados] = useState<string[]>([]);
  const [errados, setErrados] = useState<string[]>([]);
  const [noteAttempts, setNoteAttempts] = useState<{ [key: string]: { correct: number; total: number } }>({});

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Temporizador
  const [timeLeft, setTimeLeft] = useState(6);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const roundStartTimeRef = useRef<number>(0);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Cargar High Score de LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHighScore = localStorage.getItem(`pitch_finder_highscore_${difficulty}`);
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore));
      } else {
        setHighScore(0);
      }
    }
  }, [difficulty]);

  // Manejar cuenta regresiva del temporizador
  useEffect(() => {
    if (gameState === "playing" && !selectedAnswer) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft((prev) => +(prev - 0.1).toFixed(1));
        }, 1000 / 10); // precisión de décimas de segundo
      } else {
        // Se acabó el tiempo
        handleAnswer(null);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameState, selectedAnswer]);

  // Inicializar o reproducir tono con síntesis interactiva
  const playTone = (
    freq: number,
    duration = 0.8,
    forceInstrument?: "synth" | "piano" | "guitar" | "organ" | "flute"
  ) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const activeInst = forceInstrument || instrument;

      if (activeInst === "synth") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } else if (activeInst === "piano") {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.015);
        masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        masterGain.connect(ctx.destination);

        const harmonics = [
          { mult: 1, volume: 0.55, decayMult: 1.0 },
          { mult: 2, volume: 0.28, decayMult: 0.5 },
          { mult: 3, volume: 0.16, decayMult: 0.3 },
          { mult: 4, volume: 0.08, decayMult: 0.12 }
        ];

        harmonics.forEach((h) => {
          const oscNode = ctx.createOscillator();
          const hGain = ctx.createGain();
          oscNode.type = "triangle";
          oscNode.frequency.value = freq * h.mult;

          hGain.gain.setValueAtTime(h.volume, ctx.currentTime);
          hGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * h.decayMult);

          oscNode.connect(hGain);
          hGain.connect(masterGain);

          oscNode.start();
          oscNode.stop(ctx.currentTime + duration);
        });
      } else if (activeInst === "guitar") {
        const pluckGain = ctx.createGain();
        pluckGain.gain.setValueAtTime(0, ctx.currentTime);
        pluckGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
        pluckGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 1.4);

        const filterNode = ctx.createBiquadFilter();
        filterNode.type = "lowpass";
        filterNode.frequency.setValueAtTime(freq * 8, ctx.currentTime);
        filterNode.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.3);

        const oscTri = ctx.createOscillator();
        const oscSaw = ctx.createOscillator();
        oscTri.type = "triangle";
        oscTri.frequency.value = freq;
        oscSaw.type = "sawtooth";
        oscSaw.frequency.value = freq;

        const sawGain = ctx.createGain();
        sawGain.gain.setValueAtTime(0.12, ctx.currentTime);
        sawGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

        oscTri.connect(filterNode);
        oscSaw.connect(sawGain);
        sawGain.connect(filterNode);
        filterNode.connect(pluckGain);
        pluckGain.connect(ctx.destination);

        oscTri.start();
        oscSaw.start();
        oscTri.stop(ctx.currentTime + duration * 1.4);
        oscSaw.stop(ctx.currentTime + duration * 1.4);
      } else if (activeInst === "organ") {
        const organGain = ctx.createGain();
        organGain.gain.setValueAtTime(0, ctx.currentTime);
        organGain.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 0.03);
        organGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        const pipes = [
          { mult: 0.5, volume: 0.35 },
          { mult: 1.0, volume: 0.55 },
          { mult: 2.0, volume: 0.28 },
          { mult: 3.0, volume: 0.12 }
        ];

        pipes.forEach((p) => {
          const pipeOsc = ctx.createOscillator();
          const pipeGain = ctx.createGain();
          pipeOsc.type = "sine";
          pipeOsc.frequency.value = freq * p.mult;

          pipeGain.gain.setValueAtTime(p.volume, ctx.currentTime);

          pipeOsc.connect(pipeGain);
          pipeGain.connect(organGain);

          pipeOsc.start();
          pipeOsc.stop(ctx.currentTime + duration);
        });

        organGain.connect(ctx.destination);
      } else if (activeInst === "flute") {
        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0, ctx.currentTime);
        windGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.12);
        windGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 1.1);

        const oscFlute = ctx.createOscillator();
        oscFlute.type = "sine";
        oscFlute.frequency.value = freq;

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 5.6;
        lfoGain.gain.value = 3.5;

        lfo.connect(lfoGain);
        lfoGain.connect(oscFlute.frequency);

        oscFlute.connect(windGain);
        windGain.connect(ctx.destination);

        lfo.start();
        oscFlute.start();
        lfo.stop(ctx.currentTime + duration * 1.1);
        oscFlute.stop(ctx.currentTime + duration * 1.1);
      }
    } catch (error) {
      console.error("Error al sintetizar el tono:", error);
    }
  };

  const startNewRound = (nextDifficulty = difficulty) => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(6);

    // Seleccionar nota aleatoria de la lista de permitidas por dificultad
    const allowedNames = DIFFICULTY_MAP[nextDifficulty];
    const pool = NOTES.filter((n) => allowedNames.includes(n.english));
    const randomNote = pool[Math.floor(Math.random() * pool.length)];

    setCurrentNote(randomNote);

    // Preparar opciones de respuesta (en modo fácil son 4, en medio 7, en difícil mezclamos 6 interesantes)
    let finalOptions: NoteConfig[] = [];
    if (nextDifficulty === "easy") {
      finalOptions = [...pool];
    } else if (nextDifficulty === "medium") {
      finalOptions = [...pool];
    } else {
      // Dificultad difícil: Mezclamos la respuesta correcta con otras 5 notas aleatorias de la escala cromática
      const others = pool.filter((n) => n.english !== randomNote.english);
      const shuffledOthers = others.sort(() => 0.5 - Math.random());
      finalOptions = [randomNote, ...shuffledOthers.slice(0, 5)].sort(() => 0.5 - Math.random());
    }

    // Ordenar las opciones según su escala natural para mejor visualización
    const orderedOptions = [...finalOptions].sort((a, b) => a.freq - b.freq);
    setOptions(orderedOptions);

    // Reproducir tono automáticamente después de una breve pausa
    setTimeout(() => {
      playTone(randomNote.freq);
      roundStartTimeRef.current = Date.now();
    }, 300);
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

  const handleAnswer = (answerNote: NoteConfig | null) => {
    if (selectedAnswer !== null || !currentNote) return;

    const answerName = answerNote ? answerNote.english : "timeout";
    setSelectedAnswer(answerName);

    const isAnswerCorrect = answerName === currentNote.english;
    setIsCorrect(isAnswerCorrect);

    // Actualizar historial del alumno
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
      // Calcular bono por velocidad
      const timeTaken = (Date.now() - roundStartTimeRef.current) / 1000;
      const speedBonus = Math.max(0, Math.floor((6 - timeTaken) * 50));
      const pointsEarned = 100 + speedBonus;

      const newScore = score + pointsEarned;
      const newCombo = combo + 1;

      setScore(newScore);
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setCorrectAnswers((prev) => prev + 1);
      setAdivinados((prev) => [...prev, currentNoteLabel]);

      // Feedback de audio de acierto (dos tonos ascendentes muy sutiles)
      setTimeout(() => {
        playTone(523.25, 0.15, "synth"); // C5
        setTimeout(() => playTone(659.25, 0.25, "synth"), 100); // E5
      }, 300);
    } else {
      setCombo(0);
      setErrados((prev) => [...prev, currentNoteLabel]);

      // Feedback de audio de error (dos tonos graves descendentes sutiles)
      setTimeout(() => {
        playTone(196.00, 0.18, "synth"); // G3
        setTimeout(() => playTone(146.83, 0.35, "synth"), 120); // D3
      }, 300);
    }

    setRoundCount((prev) => prev + 1);

    // Cargar siguiente ronda tras feedback visual breve
    setTimeout(() => {
      // El juego dura 10 rondas para hacerlo dinámico y adictivo
      if (roundCount + 1 >= 10) {
        // Terminar juego y evaluar Highscore
        setGameState("gameover");
        const finalScore = score + (isAnswerCorrect ? (100 + Math.max(0, Math.floor((6 - ((Date.now() - roundStartTimeRef.current) / 1000)) * 50))) : 0);
        const storedHighScore = localStorage.getItem(`pitch_finder_highscore_${difficulty}`);
        const currentHighScore = storedHighScore ? parseInt(storedHighScore) : 0;
        if (finalScore > currentHighScore) {
          localStorage.setItem(`pitch_finder_highscore_${difficulty}`, finalScore.toString());
          setHighScore(finalScore);
        }
      } else {
        startNewRound(difficulty);
      }
    }, 1600);
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
      {/* ── Background Ambience (Neon Glows) ── */}
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
            background: "radial-gradient(circle, rgba(246,51,154,0.12) 0%, rgba(152,16,250,0.04) 50%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "300px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 75%)",
            filter: "blur(20px)",
          }}
        />
      </div>

      <div className="w-full max-w-[800px] mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Enlace de regreso al Arcade */}
        <Link href="/minijuegos" className="self-start mb-6 inline-flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a SmarTune Arcade
        </Link>

        <AnimatePresence mode="wait">
          {/* LOBBY / MENU PRINCIPAL */}
          {gameState === "lobby" && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[10px] tracking-widest font-black uppercase bg-[#f6339a]/10 text-[#f6339a] border border-[#f6339a]/20 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f6339a] animate-pulse"></span>
                ENTRENAMIENTO DE OÍDO
              </div>

              <h1 className="text-4xl sm:text-[54px] font-extrabold tracking-tight mb-4 font-headline leading-none">
                Pitch Finder<br />
                <span style={{
                  background: "linear-gradient(90deg, #f6339a 0%, #9810fa 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>Oído de Acero</span>
              </h1>

              <p className="text-[15px] sm:text-[16px] text-white/50 font-light max-w-lg mb-10 leading-relaxed">
                Escucha el tono puro generado por la IA y selecciona la nota musical correcta. Afina tu cerebro y acumula rachas perfectas en contrarreloj.
              </p>

              {/* Contenedor de Configuración */}
              <div className="w-full max-w-[480px] bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8 mb-10 text-left backdrop-blur-md">
                {/* 1. Selección de Dificultad */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Dificultad</h3>
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                        difficulty === d
                          ? "bg-white text-black border-white shadow-xl scale-[1.03]"
                          : "bg-white/[0.02] text-white/40 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                    >
                      {d === "easy" ? "Fácil (4)" : d === "medium" ? "Medio (7)" : "Difícil (12)"}
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

                {/* 3. Tipo de Instrumento */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Timbre del Instrumento</h3>
                <div className="grid grid-cols-5 gap-1.5 mb-6">
                  {([
                    { id: "synth", label: "Synth", emoji: "🎛️" },
                    { id: "piano", label: "Piano", emoji: "🎹" },
                    { id: "guitar", label: "Guitar", emoji: "🎸" },
                    { id: "organ", label: "Órgano", emoji: "⛪" },
                    { id: "flute", label: "Flauta", emoji: "🌬️" }
                  ] as const).map((instItem) => (
                    <button
                      key={instItem.id}
                      onClick={() => {
                        setInstrument(instItem.id);
                        setTimeout(() => {
                          playTone(329.63, 0.6, instItem.id); // Mi4 (E4)
                        }, 50);
                      }}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex flex-col items-center justify-center gap-1 ${
                        instrument === instItem.id
                          ? "bg-white text-black border-white shadow-xl scale-[1.03]"
                          : "bg-white/[0.02] text-white/40 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                    >
                      <span className="text-[14px]">{instItem.emoji}</span>
                      <span className="text-[9px] scale-90">{instItem.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs text-white/30 pt-3 border-t border-white/[0.05]">
                  <span>Puntuación máxima actual:</span>
                  <span className="font-extrabold text-[#f6339a]">{highScore} pts</span>
                </div>
              </div>

              {/* Botón de inicio */}
              <button
                onClick={startGame}
                className="px-10 py-4.5 rounded-2xl text-[16px] font-black uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-95 duration-200"
                style={{
                  background: "linear-gradient(90deg, #f6339a 0%, #9810fa 100%)",
                  boxShadow: "0 8px 30px rgba(246, 51, 154, 0.4)",
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
              {/* Header de Info / Puntos */}
              <div className="w-full flex justify-between items-center mb-8 border-b border-white/[0.05] pb-5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Puntuación</span>
                  <span className="text-2xl font-black text-white leading-none font-headline">{score}</span>
                </div>

                {/* Instrument Indicator (Center) */}
                <div className="hidden sm:flex flex-col items-center">
                  <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase">Instrumento</span>
                  <span className="text-xs font-black px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] mt-0.5 text-white/70 tracking-wide uppercase">
                    {instrument === "synth" ? "🎛️ Synth" : 
                     instrument === "piano" ? "🎹 Piano" : 
                     instrument === "guitar" ? "🎸 Guitar" : 
                     instrument === "organ" ? "⛪ Órgano" : 
                     "🌬️ Flauta"}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  {/* Racha / Combo */}
                  {combo > 0 && (
                    <motion.div
                      key={combo}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-end"
                    >
                      <span className="text-[9px] font-bold text-[#00ffff] tracking-widest uppercase">Racha 🔥</span>
                      <span className="text-xl font-black text-[#00ffff] leading-none">x{combo}</span>
                    </motion.div>
                  )}

                  {/* Número de Ronda */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Ronda</span>
                    <span className="text-2xl font-black text-white leading-none font-headline">{roundCount + 1}/10</span>
                  </div>
                </div>
              </div>

              {/* Botón Central de Escuchar Nota */}
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center mb-12">
                {/* Indicador de Temporizador circular flotante */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46%"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="46%"
                    stroke={selectedAnswer ? (isCorrect ? "#00ffaa" : "#ff3366") : "var(--neon-pink, #f6339a)"}
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray="289"
                    strokeDashoffset={289 - (timeLeft / 6) * 289}
                    transition={{ ease: "linear" }}
                  />
                </svg>

                {/* Speaker Central Pulsante */}
                <motion.button
                  onClick={() => playTone(currentNote.freq)}
                  disabled={selectedAnswer !== null}
                  whileHover={{ scale: selectedAnswer ? 1 : 1.05 }}
                  whileTap={{ scale: selectedAnswer ? 1 : 0.95 }}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center backdrop-blur-md transition-all shadow-inner border relative group ${
                    selectedAnswer
                      ? isCorrect
                        ? "bg-[#00ffaa]/5 border-[#00ffaa]/30 text-[#00ffaa]"
                        : "bg-[#ff3366]/5 border-[#ff3366]/30 text-[#ff3366]"
                      : "bg-white/[0.03] border-white/[0.07] hover:border-[#f6339a]/30 text-white"
                  }`}
                  style={{
                    boxShadow: selectedAnswer
                      ? isCorrect
                        ? "0 0 40px rgba(0,255,170,0.15)"
                        : "0 0 40px rgba(255,51,102,0.15)"
                      : "0 4px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <svg className="w-10 h-10 mb-2 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Escuchar</span>
                </motion.button>
              </div>

              {/* Instrucción visual */}
              <div className="h-6 mb-8 text-center">
                <AnimatePresence mode="wait">
                  {selectedAnswer === null ? (
                    <motion.p
                      key="inst"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-white/40 uppercase tracking-widest font-semibold"
                    >
                      ¿Qué nota es? Elige abajo
                    </motion.p>
                  ) : (
                    <motion.div
                      key="feedback"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center"
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
              <div className={`grid w-full ${options.length <= 4 ? "grid-cols-2" : "grid-cols-3 sm:grid-cols-4"} gap-3.5 max-w-[620px]`}>
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
                      className={`h-16 rounded-2xl flex items-center justify-center text-[18px] font-semibold border transition-all ${btnBg} ${btnBorder} ${btnText}`}
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        boxShadow: selectedAnswer && isThisCorrect ? "0 0 20px rgba(0, 255, 170, 0.15)" : "none",
                      }}
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
                DESAFÍO COMPLETADO
              </div>

              <h2 className="text-3xl sm:text-[44px] font-extrabold tracking-tight mb-8 font-headline">
                Tus Resultados
              </h2>

              {/* Estadísticas */}
              <div className="w-full max-w-[540px] bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 sm:p-8 mb-10 backdrop-blur-md">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col items-center p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <span className="text-[10px] font-bold text-white/30 uppercase mb-1">Puntos</span>
                    <span className="text-2xl font-black text-[#f6339a] font-headline">{score}</span>
                  </div>

                  <div className="flex flex-col items-center p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <span className="text-[10px] font-bold text-white/30 uppercase mb-1">Precisión</span>
                    <span className="text-2xl font-black text-[#00ffff] font-headline">{getCleanPercentage()}%</span>
                  </div>

                  <div className="flex flex-col items-center p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <span className="text-[10px] font-bold text-white/30 uppercase mb-1">Max Racha</span>
                    <span className="text-2xl font-black text-[#c084fc] font-headline">{maxCombo}🔥</span>
                  </div>
                </div>

                {/* Desglose Pedagógico de Notas */}
                <h3 className="text-xs font-black uppercase tracking-wider text-white/40 mb-4 text-left">
                  Desglose de precisión por nota
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
                    <p className="text-xs text-white/20 italic py-4 text-center">No hay datos de notas disponibles.</p>
                  )}
                </div>
              </div>

              {/* Botones de acción final */}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[480px]">
                <button
                  onClick={startGame}
                  className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-95 duration-200"
                  style={{
                    background: "linear-gradient(90deg, #f6339a 0%, #9810fa 100%)",
                    boxShadow: "0 4px 20px rgba(246, 51, 154, 0.25)",
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
