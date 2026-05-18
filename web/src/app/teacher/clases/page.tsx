"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 22 } },
};

export default function TeacherClasesHubPage() {
  return (
    <div className="min-h-screen text-white font-sans flex flex-col items-center w-full">
      <div className="w-full max-w-[900px] mx-auto px-4 sm:px-8 py-10 md:py-16">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span style={{
              background: 'linear-gradient(90deg, var(--neon-pink), var(--neon-purple))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>SmartRoom</span>
          </h1>
          <p className="text-[14px] text-white/40 max-w-lg leading-relaxed">
            Gestiona tus clases, programa videollamadas con Meet e intégrate con Google Classroom.
          </p>
        </motion.div>

        {/* ── Cards Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >

          {/* ─── Card: Sesiones Meet ─── */}
          <motion.div variants={itemVariants}>
            <Link href="/teacher/clases/meet" className="block h-full">
              <div className="group h-full rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-3px]"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(52,168,83,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(52,168,83,0.1)', border: '1px solid rgba(52,168,83,0.15)' }}>
                  <svg className="w-5 h-5" style={{ color: '#34A853' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-white mb-2">Sesiones Meet</h2>

                {/* Description */}
                <p className="text-[13px] text-white/40 leading-relaxed mb-5">
                  Programa masterclasses, sesiones uno a uno o reuniones grupales. Genera enlaces automáticamente.
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}>
                    Videollamadas
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full" style={{ color: '#34A853', background: 'rgba(52,168,83,0.1)' }}>
                    Disponible
                  </span>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-[13px] font-semibold transition-colors" style={{ color: '#34A853' }}>
                  Programar Clase
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* ─── Card: Google Classroom ─── */}
          <motion.div variants={itemVariants}>
            <Link href="/teacher/clases/classroom" className="block h-full">
              <div className="group h-full rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-3px]"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(251,188,5,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(251,188,5,0.1)', border: '1px solid rgba(251,188,5,0.15)' }}>
                  <svg className="w-5 h-5" style={{ color: '#FBBC05' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-white mb-2">Clases (Classroom)</h2>

                {/* Description */}
                <p className="text-[13px] text-white/40 leading-relaxed mb-5">
                  Sincroniza tus cursos de Google Classroom. Importa estudiantes y asigna tareas interactivas.
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}>
                    Gestión
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}>
                    Sincronización
                  </span>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-[13px] font-semibold transition-colors" style={{ color: '#FBBC05' }}>
                  Ir a Classroom
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
