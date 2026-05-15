"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.97 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 18 } },
};

// Paleta de Google ciclada para las tarjetas
const GOOGLE_PALETTE = [
  { bg: "#1a73e8", glow: "rgba(26,115,232,0.35)", label: "Azul" },
  { bg: "#ea4335", glow: "rgba(234,67,53,0.35)",  label: "Rojo" },
  { bg: "#fbbc04", glow: "rgba(251,188,4,0.35)",  label: "Amarillo" },
  { bg: "#34a853", glow: "rgba(52,168,83,0.35)",  label: "Verde" },
];

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

// Logo oficial de Google Classroom (pizarrón verde con borde amarillo)
const ClassroomLogo = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Marco amarillo */}
    <rect width="64" height="64" rx="10" fill="#F9AB00"/>
    {/* Pizarrón verde */}
    <rect x="5" y="5" width="54" height="54" rx="6" fill="#34A853"/>
    {/* Profesor (blanco) */}
    <circle cx="32" cy="22" r="7" fill="white"/>
    <path d="M18 42c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="white"/>
    {/* Estudiantes laterales (verde claro) */}
    <circle cx="14" cy="25" r="5" fill="#57BB8A"/>
    <path d="M5 42c0-4.971 4.029-9 9-9s9 4.029 9 9" fill="#57BB8A"/>
    <circle cx="50" cy="25" r="5" fill="#57BB8A"/>
    <path d="M41 42c0-4.971 4.029-9 9-9s9 4.029 9 9" fill="#57BB8A"/>
    {/* Borrador blanco */}
    <rect x="38" y="52" width="14" height="4" rx="2" fill="white" opacity="0.8"/>
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
    <div className="min-h-screen bg-[#080810] text-white font-sans flex">
      {/* Spacer para compensar el sidebar sticky */}
      <div className="hidden md:block flex-shrink-0" style={{ width: "270px" }} />

      <div className="flex-1 min-w-0 relative">

      {/* ── Ambient blobs con colores de Google ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#1a73e8] rounded-full blur-[180px] opacity-[0.06]" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-[#ea4335] rounded-full blur-[180px] opacity-[0.05]" />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-[#34a853] rounded-full blur-[160px] opacity-[0.05]" />
      </div>

      <div className="relative z-10 w-full max-w-[1100px] mx-auto px-4 md:px-8 py-8 pt-28 flex flex-col items-center">

        {/* ── Top bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 w-full">
          <div className="flex items-center gap-4">
            <Link href="/teacher/clases">
              <motion.button
                whileHover={{ x: -2, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.93 }}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/8 text-white/60 hover:text-white transition-colors"
              >
                <BackIcon />
              </motion.button>
            </Link>

            <div>
              <div className="flex items-center gap-2.5">
                <ClassroomLogo />
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Google <span className="text-[#34a853]">Classroom</span>
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[9px] uppercase tracking-widest font-bold bg-[#1a73e8]/15 text-[#74aaff] border border-[#1a73e8]/20">
                  BETA
                </span>
              </div>
              <p className="text-white/35 text-xs mt-0.5">
                {courses.length > 0 ? `${courses.length} cursos activos` : "Sincronizado con tu cuenta de Google"}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/8 hover:bg-white/12 border border-white/10 text-white transition-all self-start sm:self-auto"
          >
            <PlusIcon /> Nuevo Curso
          </motion.button>
        </div>

        {/* ── Error state ── */}
        {error && (
          <div className="bg-[#ea4335]/10 border border-[#ea4335]/20 rounded-2xl p-6 text-center max-w-lg mx-auto mb-8">
            <div className="w-11 h-11 bg-[#ea4335]/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#ea4335]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-[#ea4335] font-bold mb-1">Error de conexión</h3>
            <p className="text-white/55 text-sm">{error}</p>
            {error.includes("permiso") && (
              <button onClick={() => alert("Cierra sesión y vuelve a iniciar sesión con Google.")} className="mt-4 px-4 py-2 bg-white/8 rounded-lg text-sm font-semibold hover:bg-white/12 transition">
                Entendido
              </button>
            )}
          </div>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            {/* Spinner con los 4 colores de Google */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1a73e8] animate-spin" />
              <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-[#ea4335] animate-spin" style={{ animationDuration: "0.8s", animationDirection: "reverse" }} />
            </div>
            <p className="text-white/40 text-sm">Conectando con Google Classroom...</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-5">
              <ClassroomLogo />
            </div>
            <h3 className="text-white/70 font-bold text-xl mb-2">Sin cursos activos</h3>
            <p className="text-white/35 max-w-xs text-sm leading-relaxed">
              Aún no tienes cursos en Google Classroom. Crea uno para empezar a sincronizar tus estudiantes.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreateModal(true)}
              className="mt-6 px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1a6fd4] text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <PlusIcon /> Crear mi primer curso
            </motion.button>
          </div>
        )}

        {/* ── Course grid ── */}
        {!loading && !error && courses.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full justify-items-center"
          >
            {courses.map((course, i) => {
              const palette = GOOGLE_PALETTE[i % GOOGLE_PALETTE.length];
              return (
                <motion.div key={course.id} variants={itemVariants}>
                  <div
                    className="group relative flex flex-col h-full rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/15 transition-all duration-300 bg-[#0d0d1a]"
                    style={{ boxShadow: `0 0 0 0px ${palette.glow}` }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 40px -8px ${palette.glow}`)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 0px transparent")}
                  >

                    {/* ── Card header con color de Google ── */}
                    <div
                      className="relative h-28 flex-shrink-0 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${palette.bg}cc, ${palette.bg}99)` }}
                    >
                      {/* Patrón sutil */}
                      <div className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
                          backgroundSize: "30px 30px"
                        }}
                      />
                      {/* Orbe decorativo */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20" style={{ background: "white" }} />

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
                          {course.section || "Sin sección"}
                        </p>
                        <h3 className="text-white font-extrabold text-[15px] leading-tight line-clamp-2 drop-shadow-sm">
                          {course.name}
                        </h3>
                      </div>

                      {/* Indicador de estado top-right */}
                      <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        course.courseState === 'ACTIVE' 
                          ? 'bg-white/15 border-white/20 text-white/80' 
                          : 'bg-black/30 border-black/20 text-white/50'
                      }`}>
                        {course.courseState === 'ACTIVE' ? 'Activo' : 'Archivado'}
                      </div>
                    </div>

                    {/* ── Card body ── */}
                    <div className="flex flex-col flex-1 p-4 gap-3">
                      <p className="text-white/40 text-xs line-clamp-2 leading-relaxed flex-1">
                        {course.descriptionHeading || course.description || "Sin descripción añadida"}
                      </p>

                      {/* Enrollment code pill */}
                      {course.enrollmentCode && (
                        <div className="flex items-center gap-1.5">
                          <UsersIcon />
                          <span className="text-[10px] text-white/40 font-mono tracking-widest">
                            Código: <span className="text-white/60 font-bold">{course.enrollmentCode}</span>
                          </span>
                        </div>
                      )}

                      {/* ── Botón estilo Google Sign-In ── */}
                      {course.alternateLink && (
                        <a
                          href={course.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center w-full rounded-md overflow-hidden transition-all duration-150"
                          style={{
                            background: "#fff",
                            border: "1px solid #dadce0",
                            boxShadow: "0 1px 2px rgba(60,64,67,0.15)",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 6px rgba(60,64,67,0.25)")}
                          onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 2px rgba(60,64,67,0.15)")}
                        >
                          {/* Icono con borde derecho */}
                          <div className="flex items-center justify-center w-10 h-10 flex-shrink-0 border-r border-[#dadce0]">
                            <ClassroomLogo size={22} />
                          </div>
                          {/* Texto centrado */}
                          <span
                            className="flex-1 text-center pr-2"
                            style={{
                              color: "#3c4043",
                              fontFamily: "var(--font-roboto), 'Roboto', Arial, sans-serif",
                              fontSize: "11px",
                              fontWeight: 500,
                              letterSpacing: "0.21px",
                            }}
                          >
                            Ir a Google Classroom
                          </span>
                        </a>
                      )}

                      {/* ── Botón Importar / Invitar ── */}
                      <Link href={`/teacher/clases/classroom/${course.id}`} className="block">
                        <motion.div
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer border"
                          style={{
                            background: `${palette.bg}14`,
                            borderColor: `${palette.bg}30`,
                            color: palette.bg === "#fbbc04" ? "#e0a800" : palette.bg,
                          }}
                        >
                          <span className="flex items-center gap-1.5">
                            <UsersIcon />
                            Gestionar Alumnos
                          </span>
                          <ArrowIcon />
                        </motion.div>
                      </Link>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

      </div>

      {/* ── Modal de Crear Curso ── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl"
              style={{ background: "#0e0e18", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Top accent strip con los 4 colores de Google */}
              <div className="flex h-1 w-full">
                {GOOGLE_PALETTE.map((p, i) => (
                  <div key={i} className="flex-1" style={{ background: p.bg }} />
                ))}
              </div>

              <div className="p-8">

                {/* Icono central */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <ClassroomLogo size={36} />
                  </div>
                </div>

                {/* Título y descripción */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
                    Crear un Curso
                  </h2>
                  <p className="text-white/45 text-[13px] leading-relaxed max-w-sm mx-auto">
                    Los cursos deben crearse directamente en Google Classroom. Una vez creado, vuelve aquí y aparecerá automáticamente en tu lista.
                  </p>
                </div>

                {/* Info box minimalista */}
                <div className="mb-8 flex gap-3 items-start rounded-xl p-4"
                  style={{ background: "rgba(26,115,232,0.06)", border: "1px solid rgba(26,115,232,0.15)" }}>
                  <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "#1a73e8", minWidth: "16px" }}>
                    <span className="text-white text-[9px] font-bold">i</span>
                  </div>
                  <p className="text-[#74aaff] text-xs leading-relaxed">
                    Las cuentas <span className="font-mono bg-white/8 px-1.5 py-0.5 rounded-md text-[11px]">@gmail.com</span> personales no permiten crear cursos desde apps de terceros. Necesitas una cuenta de <span className="font-semibold text-[#a8c7fa]">Google Workspace for Education</span> para eso.
                  </p>
                </div>

                {/* Botones */}
                <div className="flex flex-col gap-2.5">
                  <a
                    href="https://classroom.google.com/h"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowCreateModal(false)}
                    className="group flex items-center w-full rounded-xl overflow-hidden transition-all duration-150"
                    style={{
                      background: "#fff",
                      border: "1px solid #dadce0",
                      boxShadow: "0 1px 3px rgba(60,64,67,0.15)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 3px 10px rgba(60,64,67,0.25)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(60,64,67,0.15)")}
                  >
                    <div className="flex items-center justify-center w-12 h-12 flex-shrink-0 border-r border-[#dadce0]">
                      <ClassroomLogo size={24} />
                    </div>
                    <span className="flex-1 text-center"
                      style={{
                        color: "#3c4043",
                        fontFamily: "var(--font-roboto), Roboto, Arial, sans-serif",
                        fontSize: "13px",
                        fontWeight: 500,
                        letterSpacing: "0.21px",
                      }}>
                      Abrir Google Classroom
                    </span>
                    <div className="w-12 flex items-center justify-center opacity-40">
                      <ExternalLinkIcon />
                    </div>
                  </a>

                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-full py-3 rounded-xl text-[13px] font-medium text-white/40 hover:text-white/70 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>{/* /flex-1 */}
    </div>
  );
}
