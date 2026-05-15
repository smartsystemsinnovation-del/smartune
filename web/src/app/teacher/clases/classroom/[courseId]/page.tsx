"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

interface Student {
  googleId: string;
  name: string;
  email: string;
  photoUrl?: string;
  isRegistered: boolean;
  isAlreadyConnected: boolean;
  smartuneId: string | null;
}

interface NetworkStudent {
  smartuneId: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.courseId;

  const [students, setStudents] = useState<Student[]>([]);
  const [networkStudents, setNetworkStudents] = useState<NetworkStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // States para Importación
  const [selectedImportIds, setSelectedImportIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  // States para Invitación
  const [selectedInviteEmails, setSelectedInviteEmails] = useState<Set<string>>(new Set());
  const [inviting, setInviting] = useState(false);

  const [activeTab, setActiveTab] = useState<'import' | 'invite'>('import');

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/classroom/students?courseId=${courseId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al obtener alumnos');
      }

      setStudents(data.students || []);
      setNetworkStudents(data.networkStudents || []);
      
      // Auto-seleccionar los que se pueden importar
      const importable = new Set<string>();
      data.students?.forEach((s: Student) => {
        if (s.isRegistered && !s.isAlreadyConnected && s.smartuneId) {
          importable.add(s.smartuneId);
        }
      });
      setSelectedImportIds(importable);
      
      // Limpiar selección de invitación al recargar
      setSelectedInviteEmails(new Set());

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  // Manejo de Importación
  const toggleImportSelection = (smartuneId: string | null) => {
    if (!smartuneId) return;
    const newSelected = new Set(selectedImportIds);
    if (newSelected.has(smartuneId)) newSelected.delete(smartuneId);
    else newSelected.add(smartuneId);
    setSelectedImportIds(newSelected);
  };

  const handleImport = async () => {
    if (selectedImportIds.size === 0) return;
    setImporting(true); setSuccessMsg(null); setError(null);
    try {
      const res = await fetch('/api/classroom/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: Array.from(selectedImportIds) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al importar');
      setSuccessMsg(data.message || 'Importación exitosa');
      await fetchStudents();
    } catch (err: any) { setError(err.message); } 
    finally { setImporting(false); }
  };

  // Manejo de Invitación
  const toggleInviteSelection = (email: string) => {
    const newSelected = new Set(selectedInviteEmails);
    if (newSelected.has(email)) newSelected.delete(email);
    else newSelected.add(email);
    setSelectedInviteEmails(newSelected);
  };

  const handleInvite = async () => {
    if (selectedInviteEmails.size === 0) return;
    setInviting(true); setSuccessMsg(null); setError(null);
    try {
      const res = await fetch('/api/classroom/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, emails: Array.from(selectedInviteEmails) })
      });
      const data = await res.json();
      if (!res.ok && res.status !== 207) throw new Error(data.error || 'Error al invitar');
      
      setSuccessMsg(data.message || data.error || 'Invitaciones enviadas');
      await fetchStudents();
    } catch (err: any) { setError(err.message); } 
    finally { setInviting(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-[#FBBC05]/30 selection:text-white relative font-sans flex flex-col items-center w-full">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FBBC05] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05]"></div>
      </div>

      <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-8 md:px-12 py-4 sm:py-8 md:py-12 relative z-10 mt-16 md:mt-24">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/teacher/clases/classroom">
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <BackIcon />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                Gestión de Alumnos
              </h1>
              <p className="text-white/40 text-sm">Sincroniza tus listas entre SmarTune y Google Classroom.</p>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        {error && (
          <div className="bg-[#ff4b4b]/10 border border-[#ff4b4b]/20 text-[#ff4b4b] rounded-xl p-4 mb-6 text-sm font-medium">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853] rounded-xl p-4 mb-6 text-sm font-medium flex items-center gap-2">
            <CheckIcon /> {successMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('import')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'import' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
          >
            Importar a SmarTune
          </button>
          <button 
            onClick={() => setActiveTab('invite')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'invite' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
          >
            Invitar a Classroom
          </button>
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#FBBC05]/20 border-t-[#FBBC05] rounded-full animate-spin mb-4"></div>
            <p className="text-white/50">Cargando datos...</p>
          </div>
        ) : activeTab === 'import' ? (
          /* TAB IMPORTAR */
          <div className="bg-[#0f0f0f] border border-white/5 rounded-[20px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="font-bold text-white/80 text-sm">Alumnos en Google Classroom</h3>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleImport}
                disabled={importing || selectedImportIds.size === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedImportIds.size > 0 
                    ? 'bg-[#FBBC05] text-black hover:brightness-110 shadow-[0_0_15px_rgba(251,188,5,0.2)]' 
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                {importing ? 'Importando...' : `Vincular ${selectedImportIds.size}`}
              </motion.button>
            </div>
            
            {students.length === 0 ? (
              <div className="p-12 text-center text-white/40 text-sm">El curso en Classroom está vacío.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">Sel</th>
                    <th className="p-4">Alumno</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Estado en SmarTune</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                  {students.map((student) => {
                    const canImport = student.isRegistered && !student.isAlreadyConnected && student.smartuneId;
                    return (
                      <motion.tr variants={itemVariants} key={student.googleId} className={`border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02] ${!canImport ? 'opacity-60' : ''}`}>
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            disabled={!canImport}
                            checked={student.smartuneId ? selectedImportIds.has(student.smartuneId) : false}
                            onChange={() => toggleImportSelection(student.smartuneId)}
                            className="w-4 h-4 rounded border-white/20 bg-black/50 text-[#FBBC05] focus:ring-[#FBBC05]/50 focus:ring-offset-0 disabled:opacity-30 cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {student.photoUrl ? (
                              <img src={student.photoUrl} alt={student.name} className="w-8 h-8 rounded-full bg-white/10" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#FBBC05]/20 flex items-center justify-center text-[#FBBC05] font-bold text-xs">{student.name.charAt(0)}</div>
                            )}
                            <span className="font-semibold text-sm text-white/90">{student.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-white/50">{student.email}</td>
                        <td className="p-4">
                          {student.isAlreadyConnected ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#34A853]/10 text-[#34A853]"><CheckIcon /> Vinculado</span>
                          ) : student.isRegistered ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#4285F4]/10 text-[#4285F4]">Listo para vincular</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/5 text-white/40">Pendiente de registro</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </table>
            )}
          </div>
        ) : (
          /* TAB INVITAR */
          <div className="bg-[#0f0f0f] border border-white/5 rounded-[20px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="font-bold text-white/80 text-sm">Alumnos de tu red (SmarTune)</h3>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleInvite}
                disabled={inviting || selectedInviteEmails.size === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedInviteEmails.size > 0 
                    ? 'bg-white text-black hover:brightness-90 shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                {inviting ? 'Enviando...' : <><SendIcon /> Invitar {selectedInviteEmails.size}</>}
              </motion.button>
            </div>

            {networkStudents.length === 0 ? (
              <div className="p-12 text-center text-white/40 text-sm">Todos tus alumnos ya están en este curso de Classroom o no tienes alumnos en tu red.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">Sel</th>
                    <th className="p-4">Alumno</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Acción</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                  {networkStudents.map((student) => (
                    <motion.tr variants={itemVariants} key={student.smartuneId} className={`border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02]`}>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedInviteEmails.has(student.email)}
                          onChange={() => toggleInviteSelection(student.email)}
                          className="w-4 h-4 rounded border-white/20 bg-black/50 text-white focus:ring-white/50 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt={student.name} className="w-8 h-8 rounded-full bg-white/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">{student.name.charAt(0)}</div>
                          )}
                          <span className="font-semibold text-sm text-white/90">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-white/50">{student.email}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-white">
                          No está en Classroom
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
