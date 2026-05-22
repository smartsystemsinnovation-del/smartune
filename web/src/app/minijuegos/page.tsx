"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { 
  getStudentStats, 
  getTeacherStudentsStats, 
  toggleStatSharing 
} from "@/actions/minigameActions";
import { 
  Share2, 
  Lock, 
  Eye, 
  Check, 
  Calendar, 
  Award, 
  BarChart2, 
  Star, 
  Zap, 
  User, 
  ArrowRight,
  TrendingUp
} from "lucide-react";

// Animaciones Framer Motion
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

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

interface MinigameStat {
  id: string;
  game_id: string;
  score: number;
  accuracy: number | null;
  difficulty: string | null;
  played_at: string;
  shared: boolean;
}

interface ConnectedStudent {
  id: string;
  nombre: string;
  correo: string;
  avatar_url?: string;
}

export default function ArcadeLobbyPage() {
  const [activeTab, setActiveTab] = useState<"lobby" | "stats" | "teacher-stats">("lobby");
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados del Alumno
  const [studentStats, setStudentStats] = useState<MinigameStat[]>([]);
  const [sharingLoadingId, setSharingLoadingId] = useState<string | null>(null);

  // Estados del Profesor
  const [teacherStudents, setTeacherStudents] = useState<ConnectedStudent[]>([]);
  const [teacherSharedStats, setTeacherSharedStats] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          const { data: usuario } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', currentUser.id)
            .single();
          
          const role = usuario?.rol || 'estudiante';
          setUserRole(role);

          // Cargar datos según rol
          if (role === 'profesor') {
            await loadTeacherData();
          } else {
            await loadStudentData();
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRole();
  }, [supabase]);

  // Cargar datos del alumno
  const loadStudentData = async () => {
    const res = await getStudentStats();
    if (res.success && res.data) {
      setStudentStats(res.data as MinigameStat[]);
    }
  };

  // Cargar datos del profesor
  const loadTeacherData = async () => {
    const res = await getTeacherStudentsStats();
    if (res.success && res.students && res.stats) {
      setTeacherStudents(res.students);
      setTeacherSharedStats(res.stats);
      if (res.students.length > 0) {
        setSelectedStudentId(res.students[0].id);
      }
    }
  };

  // Alternar visibilidad de estadística
  const handleToggleShare = async (statId: string, currentShared: boolean) => {
    setSharingLoadingId(statId);
    const newShared = !currentShared;
    const res = await toggleStatSharing(statId, newShared);
    if (res.success) {
      setStudentStats(prev => 
        prev.map(stat => stat.id === statId ? { ...stat, shared: newShared } : stat)
      );
    }
    setSharingLoadingId(null);
  };

  // Auxiliares para formatear nombres de minijuegos y fechas
  const getGameLabel = (gameId: string) => {
    if (gameId === 'pitch-finder') return 'Pitch Finder';
    if (gameId === 'sight-reading-dash') return 'Sight-Reading Dash';
    if (gameId === 'smar-tiles') return 'Smar-Tiles';
    return gameId;
  };

  const getDifficultyLabel = (diff: string | null) => {
    if (!diff) return '-';
    if (diff === 'easy') return 'Fácil';
    if (diff === 'medium') return 'Medio';
    if (diff === 'hard') return 'Difícil';
    return diff;
  };

  const getGameColor = (gameId: string) => {
    if (gameId === 'pitch-finder') return '#f6339a'; // Pink
    if (gameId === 'sight-reading-dash') return '#0e9eef'; // Cyan
    return '#c084fc'; // Purple
  };

  // Calcular mejores marcas del Alumno
  const getBestScore = (gameId: string) => {
    const scores = studentStats.filter(s => s.game_id === gameId);
    if (scores.length === 0) return 0;
    return Math.max(...scores.map(s => s.score));
  };

  const getBestAccuracy = (gameId: string) => {
    const scores = studentStats.filter(s => s.game_id === gameId && s.accuracy !== null);
    if (scores.length === 0) return null;
    return Math.max(...scores.map(s => Number(s.accuracy || 0)));
  };

  // Filtrar estadísticas compartidas por el alumno seleccionado
  const filteredTeacherStats = teacherSharedStats.filter(s => s.user_id === selectedStudentId);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-[#f6339a]/30 selection:text-white relative font-sans flex flex-col items-center">
      
      {/* ── Fondo de Neón sutil ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-[#f6339a] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.07]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00ffff] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05]"></div>
      </div>

      <div 
        className="w-full max-w-[1000px] mx-auto px-4 sm:px-8 md:px-12 pb-12 relative z-10"
        style={{ paddingTop: "240px" }}
      >
        
        {/* ── Cabecera Principal ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 flex flex-col items-center"
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
          <p className="text-[16px] md:text-[18px] text-white/50 font-light max-w-2xl mx-auto leading-relaxed mb-8">
            Aprende, compite y domina la música jugando. Pon a prueba tus reflejos y tu oído musical.
          </p>

          {/* ── Navegación interna (Tabs con Glassmorphic Style) ── */}
          {user && !loading && (
            <div className="flex p-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <button
                onClick={() => setActiveTab("lobby")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "lobby"
                    ? "bg-gradient-to-r from-[#f6339a] to-[#9810fa] text-white shadow-lg shadow-[#f6339a]/20"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                🎮 Minijuegos
              </button>

              {userRole !== 'profesor' ? (
                <button
                  onClick={() => { setActiveTab("stats"); loadStudentData(); }}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeTab === "stats"
                      ? "bg-gradient-to-r from-[#f6339a] to-[#9810fa] text-white shadow-lg shadow-[#f6339a]/20"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  📊 Mis Estadísticas
                </button>
              ) : (
                <button
                  onClick={() => { setActiveTab("teacher-stats"); loadTeacherData(); }}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeTab === "teacher-stats"
                      ? "bg-gradient-to-r from-[#0e9eef] to-[#9810fa] text-white shadow-lg shadow-[#0e9eef]/20"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  👨‍🏫 Estadísticas Alumnos
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Renderizado Dinámico de Vistas con AnimatePresence ── */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: LOBBY DE MINIJUEGOS */}
          {activeTab === "lobby" && (
            <motion.div
              key="lobby"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 15 }}
              className="flex flex-col gap-8"
            >
              {/* Juego Destacado: Smar-Tiles (Tarjeta Horizontal) */}
              <motion.div variants={itemVariants}>
                <div className="relative group rounded-[28px] overflow-hidden bg-[#0f0f0f] border border-white/[0.05] shadow-2xl transition-colors hover:border-white/[0.1]">
                  <div className="flex flex-col md:flex-row items-center p-8 md:p-10 gap-10">
                    
                    {/* Visual de Arcade */}
                    <div className="w-full md:w-[40%] h-56 md:h-64 rounded-xl bg-black overflow-hidden relative border border-[#00ffff]/10 shadow-inner flex-shrink-0 group-hover:border-[#00ffff]/30 transition-colors duration-500">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none z-10"></div>
                      
                      <motion.div animate={{ y: [0, 200, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} className="absolute -top-10 left-[25%] w-6 h-20 bg-gradient-to-b from-[#f6339a]/0 to-[#f6339a] rounded-sm shadow-[0_5px_15px_#f6339a]"></motion.div>
                      <motion.div animate={{ y: [-100, 150, -100] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute -top-10 left-[50%] w-6 h-24 bg-gradient-to-b from-[#00ffff]/0 to-[#00ffff] rounded-sm shadow-[0_5px_15px_#00ffff]"></motion.div>
                      <motion.div animate={{ y: [100, -100, 100] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute -top-10 left-[75%] w-6 h-16 bg-gradient-to-b from-[#9810fa]/0 to-[#9810fa] rounded-sm shadow-[0_5px_15px_#9810fa] opacity-80"></motion.div>
                      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent z-10"></div>
                    </div>

                    {/* Contenido */}
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

              {/* Cuadrícula de otros juegos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Juego 2: Pitch Finder */}
                <motion.div variants={itemVariants} className="h-full">
                  <div className="h-full bg-[#0f0f0f] rounded-[24px] p-7 border border-white/[0.04] flex flex-col group transition-all duration-300 hover:border-[#f6339a]/15">
                    <div className="w-full h-40 bg-black/40 rounded-xl mb-5 flex items-center justify-center border border-white/[0.04] relative overflow-hidden group-hover:border-[#f6339a]/15 transition-colors duration-500">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(246,51,154,0.06)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div className="flex items-center gap-[5px] relative z-10">
                        {[0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 0.3, 0.85, 0.55].map((h, i) => (
                          <motion.div
                            key={i}
                            className="w-[3px] rounded-full"
                            style={{
                              background: `linear-gradient(to top, rgba(246,51,154,${0.25 + h * 0.35}), rgba(152,16,250,${0.15 + h * 0.2}))`,
                              height: `${h * 48}px`,
                            }}
                            animate={{ scaleY: [1, 0.5 + h * 0.6, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 + i * 0.15, ease: "easeInOut", delay: i * 0.08 }}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="text-[18px] font-bold text-white mb-1.5 flex items-center justify-between">
                      Pitch Finder
                      <span className="px-2 py-0.5 rounded text-[7px] uppercase tracking-[0.15em] font-black text-[#f6339a]/70">Nuevo</span>
                    </h3>
                    <p className="text-[14px] text-white/35 mb-6 line-clamp-2 leading-relaxed font-light">Entrena tu oído absoluto e identifica las notas musicales generadas en tiempo real.</p>
                    <div className="mt-auto">
                      <Link href="/minijuegos/pitch-finder" className="w-full inline-block">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          className="w-full flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95"
                          style={{
                            background: 'linear-gradient(90deg, #f6339a 0%, #9810fa 100%)',
                            color: '#ffffff',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            border: 'none',
                            boxShadow: '0 0 20px rgba(246,51,154,0.2)',
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
                  <div className="h-full bg-[#0f0f0f] rounded-[24px] p-7 border border-white/[0.04] flex flex-col group transition-all duration-300 hover:border-[#0e9eef]/15">
                    <div className="w-full h-40 bg-black/40 rounded-xl mb-5 flex items-center justify-center border border-white/[0.04] relative overflow-hidden group-hover:border-[#0e9eef]/15 transition-colors duration-500">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,158,239,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <svg viewBox="0 0 160 80" className="w-[140px] relative z-10 overflow-visible">
                        {[20, 30, 40, 50, 60].map((y) => (
                          <line key={y} x1="10" y1={y} x2="150" y2={y} stroke="rgba(14,158,239,0.15)" strokeWidth="1" />
                        ))}
                        <line x1="10" y1="20" x2="10" y2="60" stroke="rgba(14,158,239,0.25)" strokeWidth="1.5" />
                        <line x1="150" y1="20" x2="150" y2="60" stroke="rgba(14,158,239,0.25)" strokeWidth="1.5" />
                        <motion.ellipse
                          cx="80" cy="40" rx="7" ry="4.5"
                          fill="rgba(14,158,239,0.5)"
                          stroke="rgba(14,158,239,0.7)"
                          strokeWidth="0.8"
                          style={{ transformOrigin:"80px 40px", transform:"rotate(-15deg)" }}
                          animate={{ cy: [40, 30, 50, 40] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        />
                        <motion.line
                          x1="87" x2="87" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"
                          animate={{ y1: [40, 30, 50, 40], y2: [12, 2, 22, 12] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        />
                      </svg>
                    </div>

                    <h3 className="text-[18px] font-bold text-white mb-1.5 flex items-center justify-between">
                      Sight-Reading Dash
                      <span className="px-2 py-0.5 rounded text-[7px] uppercase tracking-[0.15em] font-black text-[#0e9eef]/70">Nuevo</span>
                    </h3>
                    <p className="text-[14px] text-white/35 mb-6 line-clamp-2 leading-relaxed font-light">Aprende a leer notas en el pentagrama al instante con velocidad y precisión visual.</p>
                    <div className="mt-auto">
                      <Link href="/minijuegos/sight-reading-dash" className="w-full inline-block">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          className="w-full flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95"
                          style={{
                            background: 'linear-gradient(90deg, #0e9eef 0%, #9810fa 100%)',
                            color: '#ffffff',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            border: 'none',
                            boxShadow: '0 0 20px rgba(14,158,239,0.2)',
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

                {/* Enviar sugerencia */}
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
          )}

          {/* TAB 2: VISTA ALUMNO (MIS ESTADÍSTICAS) */}
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col gap-10"
            >
              
              {/* Tarjetas de mejores puntajes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'smar-tiles', name: 'Smar-Tiles', color: '#c084fc', icon: '🎹' },
                  { id: 'pitch-finder', name: 'Pitch Finder', color: '#f6339a', icon: '🎛️' },
                  { id: 'sight-reading-dash', name: 'Sight-Reading Dash', color: '#0e9eef', icon: '🎼' }
                ].map(game => {
                  const best = getBestScore(game.id);
                  const acc = getBestAccuracy(game.id);
                  return (
                    <div 
                      key={game.id}
                      className="p-6 rounded-[22px] bg-white/[0.02] border border-white/[0.04] relative overflow-hidden backdrop-blur-md"
                      style={{
                        boxShadow: `0 8px 30px rgba(0,0,0,0.5), inset 0 0 1px 1px ${game.color}15`
                      }}
                    >
                      <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full filter blur-[40px] opacity-[0.1]" style={{ background: game.color }}></div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{game.icon}</span>
                        <h4 className="text-[15px] font-bold text-white/95">{game.name}</h4>
                      </div>
                      <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mb-1">Récord de Puntos</p>
                      <p className="text-3xl font-black mb-3 font-headline" style={{ color: game.color }}>{best.toLocaleString()}</p>
                      
                      {acc !== null && (
                        <>
                          <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mb-1">Mejor Precisión</p>
                          <p className="text-lg font-bold text-white/80">{acc}%</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Registro de partidas y panel para compartir */}
              <div className="bg-[#0c0c0c] border border-white/[0.04] rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-[#f6339a]" /> Historial de Partidas
                    </h3>
                    <p className="text-white/40 text-xs mt-1">Elige cuáles estadísticas compartir con tus profesores conectados.</p>
                  </div>
                </div>

                {studentStats.length === 0 ? (
                  <div className="py-16 text-center text-white/30 font-light flex flex-col items-center gap-3">
                    <TrendingUp className="w-12 h-12 stroke-[1]" />
                    <p>No tienes partidas registradas aún.</p>
                    <button 
                      onClick={() => setActiveTab("lobby")}
                      className="text-xs text-[#f6339a] font-bold hover:underline"
                    >
                      ¡Juega tu primera partida ahora!
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.04] text-white/30 uppercase tracking-widest text-[9px] font-black">
                          <th className="py-3 px-4">Juego</th>
                          <th className="py-3 px-4">Dificultad</th>
                          <th className="py-3 px-4">Puntaje</th>
                          <th className="py-3 px-4">Precisión</th>
                          <th className="py-3 px-4">Fecha</th>
                          <th className="py-3 px-4 text-center">Privacidad y Profesores</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentStats.map((stat) => (
                          <tr key={stat.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-4 font-bold flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: getGameColor(stat.game_id) }}></span>
                              {getGameLabel(stat.game_id)}
                            </td>
                            <td className="py-4 px-4 text-white/60">{getDifficultyLabel(stat.difficulty)}</td>
                            <td className="py-4 px-4 font-extrabold text-white">{stat.score.toLocaleString()}</td>
                            <td className="py-4 px-4 text-white/60 font-semibold">{stat.accuracy !== null ? `${stat.accuracy}%` : '-'}</td>
                            <td className="py-4 px-4 text-white/40">
                              {new Date(stat.played_at).toLocaleDateString(undefined, { 
                                day: 'numeric', 
                                month: 'short', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => handleToggleShare(stat.id, stat.shared)}
                                disabled={sharingLoadingId === stat.id}
                                className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 border backdrop-blur-md ${
                                  stat.shared
                                    ? "bg-[#f6339a]/10 border-[#f6339a]/30 text-[#f6339a] shadow-[0_0_15px_rgba(246,51,154,0.15)]"
                                    : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                                }`}
                              >
                                {sharingLoadingId === stat.id ? (
                                  <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin inline-block"></span>
                                ) : stat.shared ? (
                                  <>
                                    <Eye className="w-3 h-3 text-[#f6339a]" />
                                    Compartido 🟢
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3" />
                                    Privado 🔒
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* TAB 3: VISTA PROFESOR (ESTADÍSTICAS DE ALUMNOS) */}
          {activeTab === "teacher-stats" && (
            <motion.div
              key="teacher-stats"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col md:flex-row gap-8 items-start"
            >
              
              {/* Selector de alumnos (Panel izquierdo) */}
              <div className="w-full md:w-[30%] bg-[#0c0c0c] border border-white/[0.04] rounded-3xl p-5 shrink-0 flex flex-col gap-4">
                <h3 className="text-[13px] font-black uppercase tracking-widest text-white/40 px-2">Mis Alumnos Conectados</h3>
                
                {teacherStudents.length === 0 ? (
                  <p className="text-xs text-white/20 italic p-4 text-center">No tienes alumnos conectados todavía.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {teacherStudents.map(student => (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 ${
                          selectedStudentId === student.id
                            ? "bg-gradient-to-r from-[#0e9eef]/10 to-[#9810fa]/10 border border-[#0e9eef]/30 text-white"
                            : "bg-transparent border border-transparent text-white/50 hover:bg-white/[0.02]"
                        }`}
                      >
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                            {student.nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{student.nombre}</p>
                          <p className="text-[10px] text-white/40 truncate mt-0.5">{student.correo}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Estadísticas del alumno seleccionado (Panel derecho) */}
              <div className="flex-1 w-full bg-[#0c0c0c] border border-white/[0.04] rounded-3xl p-6 sm:p-8">
                {selectedStudentId ? (() => {
                  const student = teacherStudents.find(s => s.id === selectedStudentId);
                  
                  return (
                    <div className="flex flex-col gap-8">
                      {/* Cabecera del alumno */}
                      <div className="flex items-center gap-4 pb-6 border-b border-white/[0.04]">
                        {student?.avatar_url ? (
                          <img src={student.avatar_url} alt="" className="w-12 h-12 rounded-full border border-[#0e9eef]/20 p-0.5" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-lg font-bold text-[#0e9eef] border border-[#0e9eef]/20">
                            {student?.nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-white">{student?.nombre}</h3>
                          <p className="text-xs text-white/40">{student?.correo}</p>
                        </div>
                      </div>

                      {/* Marcas compartidas */}
                      {filteredTeacherStats.length === 0 ? (
                        <div className="py-16 text-center text-white/20 italic flex flex-col items-center gap-3">
                          <Lock className="w-10 h-10 stroke-[1]" />
                          <p>El alumno no ha compartido ninguna estadística de minijuegos contigo aún.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#0e9eef]">Récords Compartidos</h4>
                          
                          {/* Tabla de registros compartidos */}
                          <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-white/[0.04] text-white/30 uppercase tracking-widest text-[9px] font-black">
                                  <th className="py-3 px-4">Minijuego</th>
                                  <th className="py-3 px-4">Dificultad</th>
                                  <th className="py-3 px-4">Puntaje Máximo</th>
                                  <th className="py-3 px-4">Precisión</th>
                                  <th className="py-3 px-4">Fecha</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredTeacherStats.map((stat) => (
                                  <tr key={stat.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                                    <td className="py-4 px-4 font-bold flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: getGameColor(stat.game_id) }}></span>
                                      {getGameLabel(stat.game_id)}
                                    </td>
                                    <td className="py-4 px-4 text-white/60">{getDifficultyLabel(stat.difficulty)}</td>
                                    <td className="py-4 px-4 font-extrabold text-[#00ffaa]">{stat.score.toLocaleString()} pts</td>
                                    <td className="py-4 px-4 text-white/70 font-semibold">{stat.accuracy !== null ? `${stat.accuracy}%` : '-'}</td>
                                    <td className="py-4 px-4 text-white/40">
                                      {new Date(stat.played_at).toLocaleDateString(undefined, { 
                                        day: 'numeric', 
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div className="py-20 text-center text-white/20 italic">
                    Selecciona un alumno para consultar sus estadísticas de minijuegos compartidas.
                  </div>
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}