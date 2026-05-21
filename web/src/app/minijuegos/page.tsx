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
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CodeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

export default function ArcadeLobbyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-[#f6339a]/30 selection:text-white relative font-sans flex flex-col items-center">

      {/* ── Background Ambience (Neon Glows sutiles) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-[#f6339a] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.07]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00ffff] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05]"></div>
      </div>

      <div 
        className="w-full max-w-[1000px] mx-auto px-4 sm:px-8 md:px-12 pb-12 relative z-10"
        style={{ paddingTop: "240px" }}
      >

        {/* ── Hero Section (Proporcionado) ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <h1 className="text-5xl md:text-[62px] font-extrabold tracking-tight mb-4">
            <span style={{
              background: 'linear-gradient(90deg, #f6339a 0%, #9810fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>SmarTune</span>{' '}
            <span className="text-white">Arcade</span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/50 font-light max-w-2xl mx-auto leading-relaxed">
            Aprende, compite y domina la música jugando. Pon a prueba tus reflejos y tu oído musical.
          </p>
        </motion.div>

        {/* ── Contenido Principal ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8"
        >
          {/* ── Juego Destacado: Smar-Tiles (Tarjeta Horizontal) ── */}
          <motion.div variants={itemVariants}>
            <div className="relative group rounded-[28px] overflow-hidden bg-[#0f0f0f] border border-white/[0.05] shadow-2xl transition-colors hover:border-white/[0.1]">
 
              <div className="flex flex-col md:flex-row items-center p-8 md:p-10 gap-10">
 
                {/* Visual Representation (Abstract Arcade) */}
                <div className="w-full md:w-[40%] h-56 md:h-64 rounded-xl bg-black overflow-hidden relative border border-[#00ffff]/10 shadow-inner flex-shrink-0 group-hover:border-[#00ffff]/30 transition-colors duration-500">
                  {/* Grid overlay & Scanlines */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none z-10"></div>
 
                  {/* Abstract Falling Keys (Proporcionadas) */}
                  <motion.div animate={{ y: [0, 200, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} className="absolute -top-10 left-[25%] w-6 h-20 bg-gradient-to-b from-[#f6339a]/0 to-[#f6339a] rounded-sm shadow-[0_5px_15px_#f6339a]"></motion.div>
                  <motion.div animate={{ y: [-100, 150, -100] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute -top-10 left-[50%] w-6 h-24 bg-gradient-to-b from-[#00ffff]/0 to-[#00ffff] rounded-sm shadow-[0_5px_15px_#00ffff]"></motion.div>
                  <motion.div animate={{ y: [100, -100, 100] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute -top-10 left-[75%] w-6 h-16 bg-gradient-to-b from-[#9810fa]/0 to-[#9810fa] rounded-sm shadow-[0_5px_15px_#9810fa] opacity-80"></motion.div>
 
                  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent z-10"></div>
                </div>
 
                {/* Contenido Destacado */}
                <div className="w-full md:w-[60%] flex flex-col items-start text-left">
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-white flex items-center gap-3">
                    Smar-Tiles
                    <span className="px-2.5 py-0.5 rounded text-[11px] uppercase tracking-widest font-bold bg-[#00ffff]/10 text-[#00ffff] border border-[#00ffff]/20">Nuevo</span>
                  </h2>
 
                  <p className="text-white/60 text-[16px] md:text-[17.5px] mb-6 leading-relaxed font-light">
                    Toca las notas al ritmo de tus canciones favoritas. Siente la música y mejora tu precisión en este adictivo desafío estilo Rhythm Game.
                  </p>
 
                  <div className="flex flex-wrap gap-2.5 mb-7">
                    <span className="px-4 py-1.5 text-[13px] font-semibold text-white/50 bg-white/5 rounded-full border border-white/5">Ritmo</span>
                    <span className="px-4 py-1.5 text-[13px] font-semibold text-white/50 bg-white/5 rounded-full border border-white/5">Reflejos</span>
                  </div>
 
                  <Link href="/minijuegos/smar-tiles" className="w-full sm:w-auto inline-block">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className={`flex items-center justify-center gap-2.5 transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] active:scale-95`}
                      style={{
                        background: 'linear-gradient(90deg, #f6339a 0%, #9810fa 100%)',
                        color: '#ffffff',
                        padding: '11px 26px',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        boxShadow: '0 0 20px rgba(246,51,154,0.35)',
                        border: 'none',
                      }}
                    >
                      <PlayIcon />
                      Jugar ahora <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
 
          {/* ── Cuadrícula de Otros Juegos ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 
            {/* Juego 2: Pitch Finder */}
            <motion.div variants={itemVariants} className="h-full">
              <div className="h-full bg-[#0f0f0f] rounded-[24px] p-7 border border-white/[0.05] flex flex-col group transition-all duration-300 hover:border-white/[0.1] hover:bg-[#151515]">
                <div className="w-full h-40 bg-black/50 rounded-xl mb-5 flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:border-[#f6339a]/20 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-14 h-14 text-[#f6339a] opacity-40 group-hover:opacity-80 transition-opacity group-hover:scale-110 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                  Pitch Finder
                  <span className="px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black bg-[#f6339a]/10 text-[#f6339a] border border-[#f6339a]/20">Nuevo</span>
                </h3>
                <p className="text-[15px] text-white/40 mb-5 line-clamp-2 leading-relaxed">Entrena tu oído absoluto e identifica las notas musicales generadas en tiempo real por la IA.</p>
                <div className="mt-auto">
                  <Link href="/minijuegos/pitch-finder" className="w-full inline-block">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className="w-full flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95"
                      style={{
                        background: 'linear-gradient(90deg, #f6339a 0%, #9810fa 100%)',
                        color: '#ffffff',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: 'none',
                        boxShadow: '0 0 15px rgba(246,51,154,0.25)',
                        cursor: 'pointer'
                      }}
                    >
                      <PlayIcon />
                      Jugar ahora <span style={{ fontSize: '15px', fontWeight: 'bold' }}>+</span>
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
 
            {/* Juego 3: Sight-Reading Dash */}
            <motion.div variants={itemVariants} className="h-full">
              <div className="h-full bg-[#0f0f0f] rounded-[24px] p-7 border border-white/[0.05] flex flex-col group transition-all duration-300 hover:border-white/[0.1] hover:bg-[#151515]">
                <div className="w-full h-40 bg-black/50 rounded-xl mb-5 flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:border-[#00ffff]/20 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-14 h-14 text-[#00ffff] opacity-40 group-hover:opacity-80 transition-opacity group-hover:scale-110 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                  Sight-Reading Dash
                  <span className="px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black bg-[#00ffff]/10 text-[#00ffff] border border-[#00ffff]/20">Nuevo</span>
                </h3>
                <p className="text-[15px] text-white/40 mb-5 line-clamp-2 leading-relaxed">Aprende a leer notas en el pentagrama al instante con este juego de velocidad y precisión visual.</p>
                <div className="mt-auto">
                  <Link href="/minijuegos/sight-reading-dash" className="w-full inline-block">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className="w-full flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95"
                      style={{
                        background: 'linear-gradient(90deg, #00ffff 0%, #9810fa 100%)',
                        color: '#ffffff',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: 'none',
                        boxShadow: '0 0 15px rgba(0,255,255,0.25)',
                        cursor: 'pointer'
                      }}
                    >
                      <PlayIcon />
                      Jugar ahora <span style={{ fontSize: '15px', fontWeight: 'bold' }}>+</span>
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
 
            {/* Tarjeta de Sugerencias — click abre correo */}
            <motion.div variants={itemVariants} className="h-full">
              <a
                href="mailto:smartsystemsinnovation@gmail.com?subject=Sugerencia%20de%20Minijuego%20-%20SmarTune&body=Hola%20equipo%20SmarTune%2C%20tengo%20una%20idea%20para%20un%20minijuego%3A%0A%0A"
                className="block h-full"
              >
                <div className="h-full bg-white/[0.02] rounded-[24px] p-7 border border-dashed border-white/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-white/[0.04] hover:border-[#f6339a]/30 cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#f6339a]/10 transition-colors">
                    <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  </div>
                  <h3 className="text-[16px] font-bold text-white/70 mb-2">¿Tienes una idea?</h3>
                  <p className="text-[13.5px] text-white/30 px-2 leading-relaxed">Sugiere un nuevo minijuego para la comunidad.</p>
                  <span className="mt-4 text-[13px] font-semibold text-[#f6339a]/60">Enviar sugerencia →</span>
                </div>
              </a>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}