"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { saveMinigameStat } from "@/actions/minigameActions";

interface NoteConfig {
  english: string;
  spanish: string;
  freq: number;
}

const NOTES: NoteConfig[] = [
  { english: "C",  spanish: "Do",   freq: 261.63 },
  { english: "C#", spanish: "Do#",  freq: 277.18 },
  { english: "D",  spanish: "Re",   freq: 293.66 },
  { english: "D#", spanish: "Re#",  freq: 311.13 },
  { english: "E",  spanish: "Mi",   freq: 329.63 },
  { english: "F",  spanish: "Fa",   freq: 349.23 },
  { english: "F#", spanish: "Fa#",  freq: 369.99 },
  { english: "G",  spanish: "Sol",  freq: 392.00 },
  { english: "G#", spanish: "Sol#", freq: 415.30 },
  { english: "A",  spanish: "La",   freq: 440.00 },
  { english: "A#", spanish: "La#",  freq: 466.16 },
  { english: "B",  spanish: "Si",   freq: 493.88 },
];

const DIFFICULTY_MAP = {
  easy:   ["C", "E", "G", "A"],
  medium: ["C", "D", "E", "F", "G", "A", "B"],
  hard:   ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
};

const DIFFICULTY_LABELS = { easy: "Fácil (4)", medium: "Medio (7)", hard: "Difícil (12)" };

function getRandomNoteAndOptions(difficulty: "easy" | "medium" | "hard") {
  const allowed = DIFFICULTY_MAP[difficulty];
  const pool = NOTES.filter(n => allowed.includes(n.english));
  const randomNote = pool[Math.floor(Math.random() * pool.length)];

  let finalOptions: NoteConfig[] = [];
  if (difficulty === "easy" || difficulty === "medium") {
    finalOptions = [...pool];
  } else {
    const others = pool.filter(n => n.english !== randomNote.english);
    finalOptions = [
      randomNote,
      ...others
        .map(x => ({ x, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(o => o.x)
        .slice(0, 5)
    ];
  }
  const sortedOptions = [...finalOptions]
    .map(x => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(o => o.x)
    .sort((a, b) => a.freq - b.freq);
  return { randomNote, sortedOptions };
}

function getElapsedTime(startTime: number) {
  return (Date.now() - startTime) / 1000;
}

export default function PitchFinderPage() {
  const [gameState, setGameState] = useState<"lobby" | "playing" | "gameover">("lobby");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [notation, setNotation]     = useState<"english" | "spanish">("spanish");
  const [instrument, setInstrument] = useState<"synth" | "piano" | "guitar" | "organ" | "flute">("synth");

  const [currentNote, setCurrentNote] = useState<NoteConfig | null>(null);
  const [options, setOptions]         = useState<NoteConfig[]>([]);
  const [score, setScore]             = useState(0);
  const [highScore, setHighScore]     = useState(0);
  const [combo, setCombo]             = useState(0);
  const [maxCombo, setMaxCombo]       = useState(0);
  const [roundCount, setRoundCount]   = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const [noteAttempts, setNoteAttempts] = useState<{ [key: string]: { correct: number; total: number } }>({});

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect,      setIsCorrect]      = useState<boolean | null>(null);

  const [timeLeft, setTimeLeft] = useState(6);
  const timerRef         = useRef<NodeJS.Timeout | null>(null);
  const roundStartTimeRef = useRef<number>(0);
  const audioCtxRef      = useRef<AudioContext | null>(null);

  const handleAnswerRef = useRef<(answerNote: NoteConfig | null) => void>(() => {});

  /* ── Audio synthesis ── */
  const playTone = (freq: number, duration = 0.8, forceInstrument?: typeof instrument) => {
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const activeInst = forceInstrument || instrument;

      if (activeInst === "synth") {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = "triangle"; osc.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + duration);
      } else if (activeInst === "piano") {
        const mg = ctx.createGain();
        mg.gain.setValueAtTime(0, ctx.currentTime);
        mg.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.015);
        mg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        mg.connect(ctx.destination);
        [{ mult:1, vol:0.55, dec:1.0 }, { mult:2, vol:0.28, dec:0.5 }, { mult:3, vol:0.16, dec:0.3 }, { mult:4, vol:0.08, dec:0.12 }]
          .forEach(h => {
            const o = ctx.createOscillator(), hg = ctx.createGain();
            o.type = "triangle"; o.frequency.value = freq * h.mult;
            hg.gain.setValueAtTime(h.vol, ctx.currentTime);
            hg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * h.dec);
            o.connect(hg); hg.connect(mg); o.start(); o.stop(ctx.currentTime + duration);
          });
      } else if (activeInst === "guitar") {
        const pg = ctx.createGain(), f = ctx.createBiquadFilter();
        pg.gain.setValueAtTime(0, ctx.currentTime);
        pg.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
        pg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 1.4);
        f.type = "lowpass"; f.frequency.setValueAtTime(freq * 8, ctx.currentTime);
        f.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.3);
        const t = ctx.createOscillator(), s = ctx.createOscillator(), sg = ctx.createGain();
        t.type = "triangle"; t.frequency.value = freq;
        s.type = "sawtooth"; s.frequency.value = freq;
        sg.gain.setValueAtTime(0.12, ctx.currentTime);
        sg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        t.connect(f); s.connect(sg); sg.connect(f); f.connect(pg); pg.connect(ctx.destination);
        t.start(); s.start(); t.stop(ctx.currentTime + duration * 1.4); s.stop(ctx.currentTime + duration * 1.4);
      } else if (activeInst === "organ") {
        const og = ctx.createGain();
        og.gain.setValueAtTime(0, ctx.currentTime);
        og.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 0.03);
        og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        [{ mult:0.5, vol:0.35 }, { mult:1.0, vol:0.55 }, { mult:2.0, vol:0.28 }, { mult:3.0, vol:0.12 }]
          .forEach(p => {
            const o = ctx.createOscillator(), pg = ctx.createGain();
            o.type = "sine"; o.frequency.value = freq * p.mult;
            pg.gain.setValueAtTime(p.vol, ctx.currentTime);
            o.connect(pg); pg.connect(og); o.start(); o.stop(ctx.currentTime + duration);
          });
        og.connect(ctx.destination);
      } else {
        const wg = ctx.createGain(), o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        wg.gain.setValueAtTime(0, ctx.currentTime);
        wg.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.12);
        wg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 1.1);
        o.type = "sine"; o.frequency.value = freq;
        lfo.frequency.value = 5.6; lg.gain.value = 3.5;
        lfo.connect(lg); lg.connect(o.frequency);
        o.connect(wg); wg.connect(ctx.destination);
        lfo.start(); o.start(); lfo.stop(ctx.currentTime + duration * 1.1); o.stop(ctx.currentTime + duration * 1.1);
      }
    } catch (e) { console.error(e); }
  };

  const startNewRound = (nextDiff = difficulty) => {
    setSelectedAnswer(null); setIsCorrect(null); setTimeLeft(6);
    const { randomNote, sortedOptions } = getRandomNoteAndOptions(nextDiff);
    setCurrentNote(randomNote);
    setOptions(sortedOptions);
    setTimeout(() => { playTone(randomNote.freq); roundStartTimeRef.current = Date.now(); }, 300);
  };

  const startGame = () => {
    setScore(0); setCombo(0); setMaxCombo(0); setRoundCount(0); setCorrectAnswers(0);
    setNoteAttempts({});
    setGameState("playing"); startNewRound(difficulty);
  };

  const handleAnswer = (answerNote: NoteConfig | null) => {
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
      setTimeout(() => { playTone(523.25, 0.15, "synth"); setTimeout(() => playTone(659.25, 0.25, "synth"), 100); }, 300);
    } else {
      setCombo(0);
      setTimeout(() => { playTone(196.00, 0.18, "synth"); setTimeout(() => playTone(146.83, 0.35, "synth"), 120); }, 300);
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
        saveMinigameStat("pitch-finder", fs, finalAccuracy, difficulty);

        const stored = localStorage.getItem(`pitch_finder_highscore_${difficulty}`);
        if (fs > (stored ? parseInt(stored) : 0)) {
          localStorage.setItem(`pitch_finder_highscore_${difficulty}`, fs.toString());
          setHighScore(fs);
        }
      } else { startNewRound(difficulty); }
    }, 1600);
  };

  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem(`pitch_finder_highscore_${difficulty}`);
      setTimeout(() => setHighScore(s ? parseInt(s) : 0), 0);
    }
  }, [difficulty]);

  useEffect(() => {
    if (gameState === "playing" && !selectedAnswer) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => setTimeLeft((p) => +(p - 0.1).toFixed(1)), 100);
      } else {
        setTimeout(() => handleAnswerRef.current(null), 0);
      }
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, gameState, selectedAnswer]);

  const getCleanPercentage = () => roundCount === 0 ? 0 : Math.round((correctAnswers / roundCount) * 100);

  const timerRatio = timeLeft / 6;
  const timerColor = timerRatio > 0.5 ? "#f6339a" : timerRatio > 0.25 ? "#f0b100" : "#ff3366";

  return (
    <div
      className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col items-center select-none"
      style={{ paddingTop: "240px" }}
    >
      <div className="w-full max-w-[820px] mx-auto px-5 relative z-10 flex flex-col items-center pb-16">
        {/* Back link */}
        <Link
          href="/minijuegos"
          className="self-start mb-8 inline-flex items-center gap-2 text-xs font-bold text-white/30 hover:text-[#f6339a] transition-all duration-300 group"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Title */}
              <h1 className="text-4xl font-black tracking-tight leading-none mb-3 font-headline">
                Pitch Finder
              </h1>
              <h2
                className="text-2xl font-black tracking-tight leading-none mb-5 font-headline"
                style={{
                  background: "linear-gradient(90deg, #f6339a 0%, #9810fa 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}
              >
                Oído de Acero
              </h2>

              <p className="text-[15px] text-white/50 font-light max-w-lg mb-12 leading-relaxed">
                Escucha el tono puro generado por la IA y selecciona la nota musical correcta.
                Afina tu cerebro y acumula rachas perfectas en contrarreloj.
              </p>

              {/* Config card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-[500px] bg-white/[0.03] border border-white/[0.04] rounded-2xl p-7 mb-10 text-left"
              >
                {/* Difficulty */}
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Dificultad</p>
                <div className="grid grid-cols-3 gap-2 mb-7">
                  {(["easy","medium","hard"] as const).map(d => (
                    <motion.button
                      key={d} whileTap={{ scale: 0.96 }}
                      onClick={() => setDifficulty(d)}
                      className="py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border"
                      style={difficulty === d ? {
                        background: "linear-gradient(90deg,#f6339a,#9810fa)",
                        color: "#fff", border: "1px solid transparent",
                        boxShadow: "0 0 20px rgba(246,51,154,0.3)",
                      } : {
                        background: "rgba(255,255,255,0.03)",
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {DIFFICULTY_LABELS[d]}
                    </motion.button>
                  ))}
                </div>

                {/* Notation */}
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Notación musical</p>
                <div className="grid grid-cols-2 gap-2 mb-7">
                  {(["english","spanish"] as const).map(n => (
                    <motion.button
                      key={n} whileTap={{ scale: 0.96 }}
                      onClick={() => setNotation(n)}
                      className="py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border"
                      style={notation === n ? {
                        background: "linear-gradient(90deg,#f6339a,#9810fa)",
                        color: "#fff", border: "1px solid transparent",
                        boxShadow: "0 0 20px rgba(246,51,154,0.3)",
                      } : {
                        background: "rgba(255,255,255,0.03)",
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {n === "english" ? "C, D, E (Inglés)" : "Do, Re, Mi (Latino)"}
                    </motion.button>
                  ))}
                </div>

                {/* Instrument */}
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Timbre del instrumento</p>
                <div className="grid grid-cols-5 gap-1.5 mb-6">
                  {([
                    { id:"synth", label:"Synth",  emoji:"🎛️" },
                    { id:"piano", label:"Piano",  emoji:"🎹" },
                    { id:"guitar",label:"Guitar", emoji:"🎸" },
                    { id:"organ", label:"Órgano", emoji:"⛪" },
                    { id:"flute", label:"Flauta", emoji:"🌬️" },
                  ] as const).map(it => (
                    <motion.button
                      key={it.id} whileTap={{ scale: 0.94 }}
                      onClick={() => { setInstrument(it.id); setTimeout(() => playTone(329.63, 0.6, it.id), 50); }}
                      className="py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border flex flex-col items-center gap-1"
                      style={instrument === it.id ? {
                        background: "linear-gradient(90deg,#f6339a,#9810fa)",
                        color: "#fff", border: "1px solid transparent",
                        boxShadow: "0 0 20px rgba(246,51,154,0.3)",
                      } : {
                        background: "rgba(255,255,255,0.03)",
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <span className="text-[15px]">{it.emoji}</span>
                      <span>{it.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Highscore */}
                <div className="flex justify-between items-center pt-4 border-t border-white/[0.04]">
                  <span className="text-[11px] text-white/30">Récord personal ({DIFFICULTY_LABELS[difficulty]})</span>
                  <span className="text-[13px] font-extrabold" style={{ color:"#f6339a" }}>{highScore.toLocaleString()} pts</span>
                </div>
              </motion.div>

              {/* Start button */}
              <motion.button
                onClick={startGame}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-12 py-4 rounded-2xl text-[15px] font-black uppercase tracking-[0.1em] text-white transition-all"
                style={{
                  background: "linear-gradient(90deg, #f6339a 0%, #9810fa 100%)",
                  boxShadow: "0 0 20px rgba(246,51,154,0.3)",
                  border: "none",
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
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col items-center"
            >
              {/* HUD */}
              <div className="w-full flex justify-between items-center mb-8 pb-5 border-b border-white/[0.06]">
                {/* Score */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Puntuación</span>
                  <motion.span
                    key={score}
                    initial={{ scale: 1.25, color: "#f6339a" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    transition={{ duration: 0.4 }}
                    className="text-2xl font-black font-headline"
                  >
                    {score.toLocaleString()}
                  </motion.span>
                </div>

                <div className="flex items-center gap-5">
                  {/* Combo */}
                  <AnimatePresence>
                    {combo > 0 && (
                      <motion.div
                        key={combo}
                        initial={{ scale: 0.6, opacity: 0, y: 6 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-end"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color:"#f6339a" }}>Racha 🔥</span>
                        <span className="text-xl font-black leading-none font-headline" style={{ color:"#f6339a" }}>×{combo}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Round */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Ronda</span>
                    <span className="text-2xl font-black font-headline">{roundCount + 1}<span className="text-white/30 text-base">/10</span></span>
                  </div>
                </div>
              </div>

              {/* Central listen button + circular timer */}
              <div className="relative w-44 h-44 flex items-center justify-center mb-10">
                {/* SVG timer ring — thin 3px stroke */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="46%" stroke="rgba(255,255,255,0.04)" strokeWidth="3" fill="transparent" />
                  <motion.circle
                    cx="50%" cy="50%" r="46%"
                    stroke={timerColor}
                    strokeWidth="3" fill="transparent"
                    strokeDasharray="274"
                    strokeDashoffset={274 - timerRatio * 274}
                    strokeLinecap="round"
                    transition={{ ease:"linear" }}
                  />
                </svg>

                {/* Speaker button — simple, no glow, no pulse rings */}
                <motion.button
                  onClick={() => playTone(currentNote.freq)}
                  disabled={selectedAnswer !== null}
                  whileHover={{ scale: selectedAnswer ? 1 : 1.06 }}
                  whileTap={{ scale: selectedAnswer ? 1 : 0.93 }}
                  className="w-32 h-32 rounded-full flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] transition-colors"
                  style={selectedAnswer ? {
                    background: isCorrect ? "rgba(0,255,170,0.05)" : "rgba(255,51,102,0.05)",
                    borderColor: isCorrect ? "rgba(0,255,170,0.2)" : "rgba(255,51,102,0.2)",
                  } : undefined}
                >
                  <svg className="w-9 h-9 mb-1.5" fill="none" stroke={
                    selectedAnswer ? (isCorrect ? "#00ffaa" : "#ff3366") : "rgba(255,255,255,0.5)"
                  } strokeWidth="1.8" viewBox="0 0 24 24">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    {selectedAnswer ? (isCorrect ? "¡Correcto!" : "Incorrecto") : "Escuchar"}
                  </span>
                </motion.button>
              </div>

              {/* Feedback */}
              <div className="h-7 mb-8 text-center">
                <AnimatePresence mode="wait">
                  {selectedAnswer === null ? (
                    <motion.p key="inst" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
                              className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold">
                      ¿Qué nota es? — Elige abajo
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

              {/* Answer grid */}
              <div className={`grid w-full ${options.length <= 4 ? "grid-cols-2" : "grid-cols-3 sm:grid-cols-4"} gap-3 max-w-[620px]`}>
                {options.map(opt => {
                  const isSel = selectedAnswer === opt.english;
                  const isRight = opt.english === currentNote.english;
                  const revealed = selectedAnswer !== null;

                  return (
                    <motion.button
                      key={opt.english}
                      onClick={() => handleAnswer(opt)}
                      disabled={selectedAnswer !== null}
                      whileHover={{ scale: revealed ? 1 : 1.04 }}
                      whileTap={{ scale: revealed ? 1 : 0.96 }}
                      className="h-16 rounded-2xl flex items-center justify-center text-[18px] font-bold transition-all font-headline"
                      style={
                        !revealed
                          ? { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)", color:"#fff" }
                          : isRight
                          ? { background:"rgba(0,255,170,0.08)", border:"1px solid rgba(0,255,170,0.3)", color:"#00ffaa", fontWeight:900 }
                          : isSel
                          ? { background:"rgba(255,51,102,0.08)", border:"1px solid rgba(255,51,102,0.3)", color:"#ff3366", fontWeight:900 }
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="w-full flex flex-col items-center text-center"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                Desafío Completado
              </p>

              <h2 className="text-4xl font-black tracking-tight mb-10 font-headline">
                Tus Resultados
              </h2>

              {/* Stats card */}
              <div className="w-full max-w-[540px] bg-white/[0.03] border border-white/[0.04] rounded-2xl p-7 mb-10">
                {/* Main stats */}
                <div className="grid grid-cols-3 gap-3.5 mb-8">
                  {[
                    { label:"Puntos",    val: score.toLocaleString(),     color:"#f6339a" },
                    { label:"Precisión", val: `${getCleanPercentage()}%`,  color:"#0e9eef" },
                    { label:"Max Racha", val: `${maxCombo}🔥`,             color:"#c084fc" },
                  ].map(s => (
                    <motion.div
                      key={s.label}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col items-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1.5">{s.label}</span>
                      <span className="text-2xl font-black font-headline" style={{ color: s.color }}>{s.val}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Note breakdown */}
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 text-left">
                  Desglose por nota
                </h3>
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto no-scrollbar">
                  {Object.entries(noteAttempts).map(([note, stats]) => {
                    const pct = Math.round((stats.correct / stats.total) * 100);
                    const col = pct >= 80 ? "#00ffaa" : pct >= 50 ? "#f0b100" : "#ff3366";
                    return (
                      <div key={note} className="flex justify-between items-center text-xs px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: col }} />
                          <span className="font-bold">Nota {note}</span>
                        </div>
                        <span className="text-white/40">
                          <span className="font-black" style={{ color: col }}>{stats.correct}</span>
                          /{stats.total} (<span style={{ color: col }}>{pct}%</span>)
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
                  style={{ background:"linear-gradient(90deg,#f6339a,#9810fa)", boxShadow:"0 0 20px rgba(246,51,154,0.3)", border:"none" }}
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
