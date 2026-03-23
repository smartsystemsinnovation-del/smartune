"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Composiciones de animación para Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function ArcadeLobbyPage() {
  return (
    <div className="min-h-screen bg-[#130921] text-white p-6 md:p-12 overflow-hidden selection:bg-[#ea88ff] selection:text-white relative">
      {/* Background Ambience (Neon Glows) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ea88ff] rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00ffff] rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section: Título y Subtítulo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 mt-8"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ea88ff] to-[#00ffff]">
            SmarTune Arcade
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto">
            Aprende, compite y domina la música jugando.
          </p>
        </motion.div>

        {/* Contenido Principal con Stagger Animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-12"
        >
          {/* Juego Destacado: Smar-Tiles (Hero Card) */}
          <motion.div variants={itemVariants}>
            <div className="relative group rounded-[2rem] p-[2px] overflow-hidden transition-all duration-300">
              {/* Borde Animado de Neón */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff] via-[#ea88ff] to-[#00ffff] opacity-40 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500 animate-gradient-xy"></div>

              <div className="relative bg-[#2e1e42] bg-opacity-80 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 h-full w-full flex flex-col lg:flex-row items-center gap-10 border border-white/5 shadow-[0_0_30px_rgba(0,255,255,0.1)] group-hover:shadow-[0_0_50px_rgba(0,255,255,0.25)] transition-all duration-300 transform group-hover:-translate-y-2">
                
                {/* Visual Representation (Abstract Background) */}
                <div className="w-full lg:w-[45%] h-64 md:h-80 rounded-2xl bg-black/40 overflow-hidden relative border border-[#00ffff]/20 shadow-inner flex-shrink-0">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  
                  {/* Abstract Falling Keys */}
                  <motion.div 
                    animate={{ y: [0, 100, 0] }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute top-0 left-[20%] w-8 h-24 bg-[#ea88ff] rounded-md shadow-[0_0_15px_#ea88ff]"
                  ></motion.div>
                  <motion.div 
                    animate={{ y: [-50, 50, -50] }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute top-[30%] left-[50%] w-8 h-32 bg-[#00ffff] rounded-md shadow-[0_0_15px_#00ffff]"
                  ></motion.div>
                  <motion.div 
                    animate={{ y: [50, -50, 50] }} 
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="absolute top-[10%] left-[80%] w-8 h-16 bg-[#ea88ff] rounded-md shadow-[0_0_15px_#ea88ff] opacity-80"
                  ></motion.div>
                  
                  {/* Bottom Fade out */}
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#2e1e42] to-transparent"></div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-[55%] flex flex-col items-start text-left">
                  <h2 className="text-4xl md:text-6xl font-black mb-4 text-white drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
                    Smar-Tiles
                  </h2>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-4 py-1.5 text-sm font-bold text-[#00ffff] bg-[#00ffff]/10 border border-[#00ffff]/30 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                      Ritmo
                    </span>
                    <span className="px-4 py-1.5 text-sm font-bold text-[#ea88ff] bg-[#ea88ff]/10 border border-[#ea88ff]/30 rounded-full shadow-[0_0_10px_rgba(234,136,255,0.2)]">
                      Reflejos
                    </span>
                  </div>
                  <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
                    Toca las notas al ritmo de tus canciones favoritas. Siente la música y mejora tu precisión en este adictivo desafío musical.
                  </p>
                  
                  <Link href="/minijuegos/smar-tiles" className="w-full md:w-auto inline-block">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-[#00ffff] to-[#ea88ff] text-[#130921] font-bold text-xl rounded-full transition-transform duration-300 shadow-[0_0_20px_rgba(0,255,255,0.4)] group-hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] flex items-center justify-center gap-3"
                    >
                      <span>Jugar Ahora</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </motion.button>
                  </Link>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Cuadrícula de Otros Juegos (Grid Section) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Juego 2: Adivina el Acorde */}
            <motion.div variants={itemVariants}>
              <div className="h-full bg-[#2e1e42]/60 backdrop-blur-md rounded-[1.5rem] p-6 border border-white/5 opacity-70 flex flex-col group transition-all duration-300 hover:border-white/10">
                <div className="w-full h-48 bg-black/40 rounded-xl mb-6 flex items-center justify-center border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                     <svg className="w-24 h-24 text-[#00ffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Adivina el Acorde</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 text-xs font-semibold text-white/80 bg-white/10 rounded-full">Oído Musical</span>
                  <span className="px-3 py-1 text-xs font-semibold text-white/80 bg-white/10 rounded-full">Teoría</span>
                </div>
                <div className="mt-auto">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/30 text-white/60 font-medium text-sm rounded-lg border border-white/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Próximamente
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Juego 3: Batalla de Escalas */}
            <motion.div variants={itemVariants}>
              <div className="h-full bg-[#2e1e42]/60 backdrop-blur-md rounded-[1.5rem] p-6 border border-white/5 opacity-70 flex flex-col group transition-all duration-300 hover:border-white/10">
                <div className="w-full h-48 bg-black/40 rounded-xl mb-6 flex items-center justify-center border border-white/5 relative overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <svg className="w-24 h-24 text-[#ea88ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                   </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Batalla de Escalas</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 text-xs font-semibold text-white/80 bg-white/10 rounded-full">Multijugador</span>
                  <span className="px-3 py-1 text-xs font-semibold text-white/80 bg-white/10 rounded-full">Velocidad</span>
                </div>
                <div className="mt-auto">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/30 text-white/60 font-medium text-sm rounded-lg border border-white/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    En Desarrollo
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Espacio extra (opcional) para equilibrio visual de las 3 columnas en Desktop */}
             <motion.div variants={itemVariants}>
               <div className="h-full min-h-[300px] bg-black/10 rounded-[1.5rem] p-6 border-2 border-dashed border-white/10 opacity-40 flex items-center justify-center flex-col text-center transition-all duration-300 hover:opacity-60">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                   <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                 </div>
                 <span className="text-white/50 font-medium tracking-wider text-sm uppercase">Más Modos Pronto</span>
               </div>
             </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
