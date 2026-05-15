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
const MeetIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 72 72" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Fondo cuadrado redondeado */}
    <rect width="52" height="52" x="2" y="10" rx="8" fill="#EA4335"/>
    <rect width="26" height="26" x="2" y="10" rx="0" fill="#EA4335"/>
    <rect width="26" height="26" x="28" y="10" rx="0" fill="#FBBC05"/>
    <rect width="26" height="26" x="2" y="36" rx="0" fill="#4285F4"/>
    <rect width="26" height="26" x="28" y="36" rx="0" fill="#34A853"/>
    {/* Cuadrado blanco central */}
    <rect x="16" y="22" width="24" height="26" rx="2" fill="white"/>
    {/* Triángulo verde (cámara) */}
    <path d="M54 28 L70 20 L70 52 L54 44 Z" fill="#34A853" rx="4"/>
    {/* Sombra interna */}
    <rect x="2" y="10" width="52" height="52" rx="8" fill="black" opacity="0.04"/>
  </svg>
);

const ClassroomIcon = () => (
  <svg className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2z" fill="#fbb040" />
    <rect x="5" y="5" width="14" height="10" rx="1" fill="#1b5e20" />
    <circle cx="12" cy="11" r="2" fill="#ffffff" opacity="0.8"/>
    <path d="M14 15c0-1.1-1.8-2-2-2s-2 .9-2 2h4z" fill="#ffffff" opacity="0.8"/>
  </svg>
);

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

export default function TeacherClasesHubPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-[#34A853]/30 selection:text-white relative font-sans flex flex-col items-center w-full">

      {/* ── Background Ambience (Neon Glows sutiles adaptados) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#34A853] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.06]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#FBBC05] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.04]"></div>
      </div>

      <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-8 md:px-12 py-4 sm:py-8 md:py-12 relative z-10 mt-16 md:mt-24">

        {/* ── Hero Section ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 flex flex-col items-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span style={{
              background: 'linear-gradient(90deg, #34A853 0%, #FBBC05 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>SmartRoom</span>
          </h1>
          <p className="text-sm md:text-base text-white/50 font-light max-w-xl mx-auto leading-relaxed">
            Gestiona tus clases, programa videollamadas con Meet e intégrate con Google Classroom. Todo desde un solo lugar.
          </p>
        </motion.div>

        {/* ── Contenido Principal ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* ── Tarjeta Horizontal: Sesiones Meet (Funcionalidad actual) ── */}
          <motion.div variants={itemVariants}>
            <div className="relative group rounded-[24px] overflow-hidden bg-[#0f0f0f] border border-white/[0.05] shadow-2xl transition-colors hover:border-[#34A853]/30">

              <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-8">

                {/* Visual Representation (Meet Abstract) */}
                <div className="w-full md:w-[40%] h-48 md:h-56 rounded-xl bg-black overflow-hidden relative border border-[#34A853]/10 shadow-inner flex-shrink-0 group-hover:border-[#34A853]/40 transition-colors duration-500">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(52,168,83,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(52,168,83,0.03)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none z-10"></div>

                  <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-[30%] left-[35%] w-24 h-24 bg-[#34A853] rounded-full mix-blend-screen filter blur-[40px]"></motion.div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                     <svg className="w-16 h-16 text-[#34A853]" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                  </div>
                </div>

                {/* Contenido */}
                <div className="w-full md:w-[60%] flex flex-col items-start text-left">
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-white flex items-center gap-3">
                    Sesiones Meet
                  </h2>

                  <p className="text-white/60 text-sm md:text-[15px] mb-5 leading-relaxed font-light">
                    Programa masterclasses, sesiones uno a uno o reuniones grupales. SmarTune genera y comparte automáticamente los enlaces de Google Meet con tus alumnos.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 text-[11px] font-semibold text-white/50 bg-white/5 rounded-full border border-white/5">Videollamadas</span>
                    <span className="px-3 py-1 text-[11px] font-semibold text-[#34A853]/80 bg-[#34A853]/10 rounded-full border border-[#34A853]/20">Disponible</span>
                  </div>

                  <Link href="/teacher/clases/meet" className="w-full sm:w-auto inline-block">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className={`flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] active:scale-95`}
                      style={{
                        background: 'linear-gradient(90deg, #34A853 0%, #1e8e3e 100%)',
                        color: '#ffffff',
                        padding: '8px 20px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        boxShadow: '0 0 20px rgba(52,168,83,0.35)',
                        border: 'none',
                      }}
                    >
                      <MeetIcon />
                      Programar Clase <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Tarjeta Horizontal: Google Classroom (Próximamente) ── */}
          <motion.div variants={itemVariants}>
            <div className="relative group rounded-[24px] overflow-hidden bg-[#0f0f0f] border border-white/[0.05] shadow-2xl transition-colors hover:border-[#FBBC05]/30">

              <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-8">

                {/* Visual Representation (Classroom Abstract) */}
                <div className="w-full md:w-[40%] h-48 md:h-56 rounded-xl bg-black overflow-hidden relative border border-[#FBBC05]/10 shadow-inner flex-shrink-0 group-hover:border-[#FBBC05]/40 transition-colors duration-500">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(251,188,5,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,188,5,0.03)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none z-10"></div>

                  <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-[20%] left-[40%] w-32 h-32 bg-[#FBBC05] rounded-full mix-blend-screen filter blur-[50px]"></motion.div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                     <svg className="w-16 h-16 text-[#FBBC05]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                     </svg>
                  </div>
                </div>

                {/* Contenido */}
                <div className="w-full md:w-[60%] flex flex-col items-start text-left">
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-white flex items-center gap-3">
                    Clases (Classroom)
                  </h2>

                  <p className="text-white/60 text-sm md:text-[15px] mb-5 leading-relaxed font-light">
                    Sincroniza tus cursos de Google Classroom. Importa automáticamente a tus estudiantes y asigna tareas interactivas de SmarTune directamente al tablón.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 text-[11px] font-semibold text-white/50 bg-white/5 rounded-full border border-white/5">Gestión</span>
                    <span className="px-3 py-1 text-[11px] font-semibold text-white/50 bg-white/5 rounded-full border border-white/5">Sincronización</span>
                  </div>

                  <Link href="/teacher/clases/classroom" className="w-full sm:w-auto inline-block">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className={`flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] active:scale-95`}
                      style={{
                        background: 'linear-gradient(90deg, #FBBC05 0%, #f29900 100%)',
                        color: '#000000',
                        padding: '8px 20px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        boxShadow: '0 0 20px rgba(251,188,5,0.35)',
                        border: 'none',
                      }}
                    >
                      <ClassroomIcon />
                      Ir a Classroom <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
