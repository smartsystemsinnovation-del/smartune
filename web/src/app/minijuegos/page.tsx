"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// Composiciones de animación para Framer Motion
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

/* ── Íconos ── */
const PlayIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CodeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

export default function ArcadeLobbyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 md:p-12 overflow-hidden selection:bg-[#f6339a]/30 selection:text-white relative font-sans">

      {/* ── Background Ambience (Neon Glows sutiles) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#f6339a] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.07]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00ffff] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05]"></div>
      </div>

      <div className="max-w-[1000px] mx-auto relative z-10">

        {/* ── Hero Section (Proporcionado) ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 mt-4 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00ffff] shadow-[0_0_8px_#00ffff] animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/70">Modo Arcade</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
            SmarTune <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#f6339a]">Arcade</span>
          </h1>
          <p className="text-sm md:text-base text-white/50 font-light max-w-xl mx-auto leading-relaxed">
            Aprende, compite y domina la música jugando. Pon a prueba tus reflejos y tu oído musical.
          </p>
        </motion.div>

        {/* ── Contenido Principal ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* ── Juego Destacado: Smar-Tiles (Tarjeta Horizontal) ── */}
          <motion.div variants={itemVariants}>
            <div className="relative group rounded-[24px] overflow-hidden bg-[#0f0f0f] border border-white/[0.05] shadow-2xl transition-colors hover:border-white/[0.1]">

              <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-8">

                {/* Visual Representation (Abstract Arcade) */}
                <div className="w-full md:w-[40%] h-48 md:h-56 rounded-xl bg-black overflow-hidden relative border border-[#00ffff]/10 shadow-inner flex-shrink-0 group-hover:border-[#00ffff]/30 transition-colors duration-500">
                  {/* Grid overlay & Scanlines */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none z-10"></div>

                  {/* Abstract Falling Keys (Proporcionadas) */}
                  <motion.div animate={{ y: [0, 200, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} className="absolute -top-10 left-[25%] w-5 h-16 bg-gradient-to-b from-[#f6339a]/0 to-[#f6339a] rounded-sm shadow-[0_5px_15px_#f6339a]"></motion.div>
                  <motion.div animate={{ y: [-100, 150, -100] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute -top-10 left-[50%] w-5 h-20 bg-gradient-to-b from-[#00ffff]/0 to-[#00ffff] rounded-sm shadow-[0_5px_15px_#00ffff]"></motion.div>
                  <motion.div animate={{ y: [100, -100, 100] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute -top-10 left-[75%] w-5 h-12 bg-gradient-to-b from-[#9810fa]/0 to-[#9810fa] rounded-sm shadow-[0_5px_15px_#9810fa] opacity-80"></motion.div>

                  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent z-10"></div>
                </div>

                {/* Contenido Destacado */}
                <div className="w-full md:w-[60%] flex flex-col items-start text-left">
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-white flex items-center gap-3">
                    Smar-Tiles
                    <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-bold bg-[#00ffff]/10 text-[#00ffff] border border-[#00ffff]/20">Nuevo</span>
                  </h2>

                  <p className="text-white/60 text-sm md:text-[15px] mb-5 leading-relaxed font-light">
                    Toca las notas al ritmo de tus canciones favoritas. Siente la música y mejora tu precisión en este adictivo desafío estilo Rhythm Game.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 text-[11px] font-semibold text-white/50 bg-white/5 rounded-full border border-white/5">Ritmo</span>
                    <span className="px-3 py-1 text-[11px] font-semibold text-white/50 bg-white/5 rounded-full border border-white/5">Reflejos</span>
                  </div>

                  <Link href="/minijuegos/smar-tiles" className="w-full sm:w-auto inline-block">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#00ffff] to-[#00bfff] text-black font-extrabold text-[13px] rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] flex items-center justify-center gap-2"
                    >
                      <PlayIcon />
                      JUGAR AHORA
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Cuadrícula de Otros Juegos ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Juego 2: Adivina el Acorde */}
            <motion.div variants={itemVariants} className="h-full">
              <div className="h-full bg-[#0f0f0f] rounded-[20px] p-5 border border-white/[0.05] flex flex-col group transition-all duration-300 hover:border-white/[0.1] hover:bg-[#151515]">
                <div className="w-full h-36 bg-black/50 rounded-xl mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:border-[#f6339a]/20 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#f6339a] opacity-40 group-hover:opacity-80 transition-opacity group-hover:scale-110 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">Adivina el Acorde</h3>
                <p className="text-[13px] text-white/40 mb-4 line-clamp-2 leading-relaxed">Entrena tu oído absoluto adivinando acordes complejos en contrarreloj.</p>
                <div className="mt-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/40 font-semibold text-[11px] rounded-lg border border-white/5">
                    <ClockIcon /> Próximamente
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Juego 3: Batalla de Escalas */}
            <motion.div variants={itemVariants} className="h-full">
              <div className="h-full bg-[#0f0f0f] rounded-[20px] p-5 border border-white/[0.05] flex flex-col group transition-all duration-300 hover:border-white/[0.1] hover:bg-[#151515]">
                <div className="w-full h-36 bg-black/50 rounded-xl mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:border-[#9810fa]/20 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#9810fa] opacity-40 group-hover:opacity-80 transition-opacity group-hover:scale-110 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">Batalla de Escalas</h3>
                <p className="text-[13px] text-white/40 mb-4 line-clamp-2 leading-relaxed">Compite contra tus amigos para ver quién digita las escalas más rápido.</p>
                <div className="mt-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/40 font-semibold text-[11px] rounded-lg border border-white/5">
                    <CodeIcon /> En Desarrollo
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tarjeta de Sugerencias (Equilibrio visual) */}
            <motion.div variants={itemVariants} className="h-full">
              <div className="h-full bg-white/[0.02] rounded-[20px] p-5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-white/[0.04]">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
                <h3 className="text-[14px] font-bold text-white/70 mb-1">¿Tienes una idea?</h3>
                <p className="text-[12px] text-white/30 px-2">Sugiere un nuevo minijuego para la comunidad.</p>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}