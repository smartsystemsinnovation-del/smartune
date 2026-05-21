"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const VideoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);
const ClassroomIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);
const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ZapIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

interface CardData {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  featured?: boolean;
}

const CARDS: CardData[] = [
  {
    href: "/teacher/clases/meet",
    icon: <VideoIcon />,
    title: "Sesiones Meet",
    description: "Crea videollamadas instantáneas para tus clases.",
    cta: "Programar sesión",
  },
  {
    href: "/teacher/clases/classroom",
    icon: <ClassroomIcon />,
    title: "Google Classroom",
    description: "Sincroniza cursos e importa alumnos fácilmente.",
    cta: "Abrir Classroom",
    featured: true,
  },
  {
    href: "/teacher/clases/meet",
    icon: <PlusIcon />,
    title: "Sesión rápida",
    description: "Lanza una clase ahora. Enlace generado al instante.",
    cta: "Empezar ahora",
  },
];

function Card({ href, icon, title, description, cta, featured }: CardData) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href} className="block">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex flex-col items-center text-center rounded-2xl px-8 pt-9 pb-8 h-full"
        style={{
          background: "rgba(18, 18, 38, 0.85)",
          border: `1px solid ${hovered ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.07)"}`,
          backdropFilter: "blur(20px)",
          transform: hovered ? "translateY(-4px)" : "none",
          boxShadow: hovered ? "0 20px 48px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.3)",
          transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Centered icon circle */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-6 flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.11)",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {icon}
        </div>

        {/* Title */}
        <h3
          className="text-[18px] font-semibold text-white mb-2 leading-snug"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className="text-[14px] leading-relaxed mb-8 flex-1"
          style={{ color: "rgba(255,255,255,0.36)" }}
        >
          {description}
        </p>

        {/* CTA */}
        {featured ? (
          <div
            className="px-8 py-2.5 rounded-xl text-[14px] font-semibold text-white text-center transition-all duration-300"
            style={{
              background: hovered
                ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                : "linear-gradient(135deg, #6d28d9, #5b21b6)",
              boxShadow: hovered ? "0 6px 22px rgba(109,40,217,0.5)" : "0 3px 12px rgba(109,40,217,0.3)",
            }}
          >
            {cta}
          </div>
        ) : (
          <span
            className="text-[14.5px] font-semibold transition-colors duration-200"
            style={{ color: hovered ? "#818cf8" : "rgba(130,140,255,0.65)" }}
          >
            {cta}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function TeacherClasesHubPage() {
  return (
    <div
      className="relative min-h-screen text-white overflow-hidden flex flex-col items-center"
      style={{ background: "linear-gradient(160deg, #0b0b1a 0%, #0e0e22 40%, #0b0b18 100%)" }}
    >
      {/* Orb */}
      <div className="pointer-events-none absolute inset-0 flex justify-center" aria-hidden>
        <div style={{
          position: "absolute", top: "100px",
          width: "560px", height: "560px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(152,16,250,0.3) 0%, rgba(246,51,154,0.07) 50%, transparent 70%)",
          filter: "blur(36px)",
        }} />
        <div style={{
          position: "absolute", top: "200px",
          width: "280px", height: "280px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(160,30,255,0.52) 0%, transparent 75%)",
          filter: "blur(10px)",
        }} />
      </div>

      {/* Hero */}
      <div 
        className="relative z-10 flex flex-col items-center text-center px-6 pb-16"
        style={{ paddingTop: "240px" }}
      >
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-[12px] font-bold uppercase tracking-[0.25em] mb-5"
          style={{ color: "rgba(200,160,255,0.6)" }}
        >
          Bienvenido a SmartRoom.
        </motion.p>
 
        <motion.h1
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-[62px] font-extrabold leading-[1.08] mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.035em" }}
        >
          Enseña sin límites,<br />
          <span style={{
            background: "linear-gradient(90deg, #c084fc, #f6339a)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            conecta en tiempo real
          </span>
        </motion.h1>
 
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="text-[16px] leading-relaxed max-w-[480px] mb-14"
          style={{ color: "rgba(255,255,255,0.34)" }}
        >
          Programa videollamadas, gestiona tus cursos e importa alumnos desde un solo panel.
        </motion.p>
 
        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.04)" }}>
            <ZapIcon />
          </div>
          <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.14), transparent)" }} />
        </motion.div>
      </div>
 
      {/* Cards grid — self-centered */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 self-center w-full max-w-[960px] px-5 sm:px-8 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-5"
      >
        {CARDS.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </motion.div>
    </div>
  );
}
