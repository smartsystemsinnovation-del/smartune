"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 20 } },
};

const PALETTE = [
  { accent: "#4285F4", bg: "rgba(66,133,244,0.08)", border: "rgba(66,133,244,0.15)" },
  { accent: "#EA4335", bg: "rgba(234,67,53,0.08)", border: "rgba(234,67,53,0.15)" },
  { accent: "#FBBC05", bg: "rgba(251,188,5,0.08)", border: "rgba(251,188,5,0.15)" },
  { accent: "#34A853", bg: "rgba(52,168,83,0.08)", border: "rgba(52,168,83,0.15)" },
];

// Compact Classroom logo
const ClassroomLogo = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="10" fill="#F9AB00"/>
    <rect x="5" y="5" width="54" height="54" rx="6" fill="#34A853"/>
    <circle cx="32" cy="22" r="7" fill="white"/>
    <path d="M18 42c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="white"/>
    <circle cx="14" cy="25" r="5" fill="#57BB8A"/>
    <path d="M5 42c0-4.971 4.029-9 9-9s9 4.029 9 9" fill="#57BB8A"/>
    <circle cx="50" cy="25" r="5" fill="#57BB8A"/>
    <path d="M41 42c0-4.971 4.029-9 9-9s9 4.029 9 9" fill="#57BB8A"/>
  </svg>
);

export default function ClassroomCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/classroom/courses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener cursos");
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  return (
    <div className="min-h-screen text-white font-sans">
      <div className="w-full max-w-[1000px] mx-auto px-4 md:px-8 py-10 pt-10">

        {/* ── Top bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/teacher/clases">
              <button className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white/70 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(251,188,5,0.1)', border: '1px solid rgba(251,188,5,0.15)' }}>
                <ClassroomLogo size={18} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Google <span style={{ color: '#34a853' }}>Classroom</span>
                </h1>
                <p className="text-white/30 text-[11px]">
                  {courses.length > 0 ? `${courses.length} cursos activos` : "Sincronizado con tu cuenta"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Curso
          </button>
        </div>

        {/* ── Error state ── */}
        {error && (
          <div className="rounded-2xl p-5 text-center max-w-lg mx-auto mb-8"
            style={{ background: 'rgba(234,67,53,0.06)', border: '1px solid rgba(234,67,53,0.12)' }}>
            <h3 className="font-bold mb-1" style={{ color: '#ea4335', fontSize: '14px' }}>Error de conexión</h3>
            <p className="text-white/45 text-[13px]">{error}</p>
          </div>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[var(--neon-pink)] animate-spin" />
            <p className="text-white/30 text-[12px]">Conectando con Classroom...</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <ClassroomLogo size={28} />
            </div>
            <h3 className="text-white/70 font-bold text-lg mb-2">Sin cursos activos</h3>
            <p className="text-white/35 max-w-xs text-[13px] leading-relaxed mb-6">
              Crea un curso en Google Classroom para empezar.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-[13px] transition-all"
              style={{ background: 'rgba(66,133,244,0.15)', color: '#4285F4', border: '1px solid rgba(66,133,244,0.2)' }}
            >
              Crear mi primer curso
            </button>
          </div>
        )}

        {/* ── Course grid ── */}
        {!loading && !error && courses.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {courses.map((course, i) => {
              const pal = PALETTE[i % PALETTE.length];
              return (
                <motion.div key={course.id} variants={itemVariants}>
                  <div
                    className="group flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300"
                    style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = `${pal.accent}25`}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}
                  >
                    {/* Card accent bar */}
                    <div className="h-[2px] w-full" style={{ background: pal.accent, opacity: 0.5 }} />

                    {/* Card body */}
                    <div className="flex flex-col flex-1 p-5 gap-3">
                      {/* Course icon + name */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: pal.bg, border: `1px solid ${pal.border}` }}>
                          <ClassroomLogo size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {course.section || "Sin sección"}
                          </p>
                          <h3 className="text-[14px] font-bold text-white leading-tight line-clamp-2">
                            {course.name}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-white/30 text-[12px] line-clamp-2 leading-relaxed flex-1">
                        {course.descriptionHeading || course.description || "Sin descripción"}
                      </p>

                      {/* Status + enrollment */}
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                          style={course.courseState === 'ACTIVE'
                            ? { color: '#34A853', background: 'rgba(52,168,83,0.1)' }
                            : { color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)' }
                          }>
                          {course.courseState === 'ACTIVE' ? 'Activo' : 'Archivado'}
                        </span>
                        {course.enrollmentCode && (
                          <span className="text-[10px] text-white/30 font-mono">
                            {course.enrollmentCode}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 mt-1">
                        {course.alternateLink && (
                          <a
                            href={course.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-medium transition-colors"
                            style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                          >
                            <ClassroomLogo size={14} />
                            Abrir en Classroom
                            <svg className="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        )}

                        <Link href={`/teacher/clases/classroom/${course.id}`} className="block">
                          <div className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer"
                            style={{ background: pal.bg, border: `1px solid ${pal.border}`, color: pal.accent }}>
                            <span className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              Gestionar Alumnos
                            </span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── Modal: Crear Curso ── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="p-6">
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <ClassroomLogo size={28} />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Crear un Curso</h2>
                  <p className="text-white/40 text-[13px] leading-relaxed max-w-sm mx-auto">
                    Los cursos se crean directamente en Google Classroom. Una vez creado, aparecerá aquí automáticamente.
                  </p>
                </div>

                {/* Info */}
                <div className="mb-6 flex gap-3 items-start rounded-xl p-4"
                  style={{ background: 'rgba(66,133,244,0.05)', border: '1px solid rgba(66,133,244,0.1)' }}>
                  <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#4285F4', minWidth: '16px' }}>
                    <span className="text-white text-[9px] font-bold">i</span>
                  </div>
                  <p className="text-[12px] leading-relaxed" style={{ color: '#74aaff' }}>
                    Las cuentas <span className="font-mono px-1 py-0.5 rounded text-[11px]" style={{ background: 'rgba(255,255,255,0.06)' }}>@gmail.com</span> personales no permiten crear cursos desde apps de terceros.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <a
                    href="https://classroom.google.com/h"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowCreateModal(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-[13px] transition-all"
                    style={{ background: 'rgba(66,133,244,0.12)', color: '#4285F4', border: '1px solid rgba(66,133,244,0.2)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(66,133,244,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(66,133,244,0.12)'}
                  >
                    <ClassroomLogo size={16} />
                    Abrir Google Classroom
                  </a>

                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-full py-2.5 rounded-xl text-[13px] font-medium text-white/35 hover:text-white/60 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
