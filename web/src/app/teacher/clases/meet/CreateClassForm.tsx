'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MeetLogo = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 72 72" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="52" height="52" x="2" y="10" rx="9" fill="#EA4335"/>
    <rect width="26" height="26" x="2" y="10" fill="#EA4335"/>
    <rect width="26" height="26" x="28" y="10" fill="#FBBC05"/>
    <rect width="26" height="26" x="2" y="36" fill="#4285F4"/>
    <rect width="26" height="26" x="28" y="36" fill="#34A853"/>
    <rect x="16" y="22" width="24" height="26" rx="2" fill="white"/>
    <path d="M54 28 L70 20 L70 52 L54 44 Z" fill="#34A853"/>
  </svg>
);

// Campo estilo Google Material 3 — label con color neón
const Field = ({
  label, accent = '#4285F4', children,
}: {
  label: string; accent?: string; children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] font-bold uppercase tracking-[0.14em] drop-shadow-sm"
      style={{ color: accent, textShadow: `0 0 12px ${accent}80` }}>{label}</label>
    {children}
  </div>
);

const inputStyle = (accent: string): React.CSSProperties => ({
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: `1px solid rgba(255,255,255,0.12)`,
  borderRadius: '10px',
  padding: '14px 16px',
  color: 'white',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  colorScheme: 'dark' as any,
  fontFamily: 'inherit',
});

// wrapper que agrega focus styles en JS
const StyledInput = ({ accent = '#4285F4', className = '', ...props }: any) => (
  <input
    {...props}
    className={className}
    style={inputStyle(accent)}
    onFocus={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}30, 0 0 16px ${accent}20`; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
  />
);

const StyledTextarea = ({ accent = '#4285F4', ...props }: any) => (
  <textarea
    {...props}
    style={{ ...inputStyle(accent), resize: 'vertical' }}
    onFocus={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}30, 0 0 16px ${accent}20`; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
  />
);

export default function CreateClassForm({ teacherId }: { students?: any[]; teacherId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ title: '', instrument: '', description: '', studentId: '', date: '', time: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    if (formData.studentId && searchQuery.includes('(')) return;
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search-users?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) setSearchResults((await res.json()).users || []);
      } finally { setIsSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, formData.studentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleStudentSelect = (s: any) => {
    setFormData({ ...formData, studentId: s.id });
    setSearchQuery(`${s.nombre} (${s.correo})`);
    setShowSuggestions(false);
  };

  const getMinDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (!formData.studentId) throw new Error('Selecciona un alumno de la lista');
      if (!formData.date || !formData.time) throw new Error('Elige una fecha y hora');
      const scheduledAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();
      const res = await fetch('/api/create-class', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, studentId: formData.studentId, title: formData.title, instrument: formData.instrument, description: formData.description, scheduledAt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la clase');
      setSuccess(true);
      setTimeout(() => router.push('/teacher/dashboard'), 2800);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (success) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center text-center py-16 gap-4">
      <MeetLogo size={56} />
      <h2 className="text-2xl font-bold text-white mt-2">¡Clase Creada!</h2>
      <p className="text-white/40 text-sm">El enlace de Meet fue generado y enviado al alumno.</p>
      <p className="text-[#34A853] text-xs mt-2 animate-pulse">Redirigiendo al dashboard...</p>
    </motion.div>
  );

  return (
    <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }} onSubmit={handleSubmit}
      className="flex flex-col gap-7"
    >
      {error && (
        <div className="text-[#f28b82] text-sm py-3 px-4 rounded-xl"
          style={{ background: 'rgba(234,67,53,0.08)', border: '1px solid rgba(234,67,53,0.2)' }}>
          {error}
        </div>
      )}

      {/* Título + Instrumento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Título de la clase *" accent="#4285F4">
          <StyledInput accent="#4285F4" type="text" name="title" value={formData.title}
            onChange={handleChange} required placeholder="Ej. Técnica de Arpegios" />
        </Field>
        <Field label="Instrumento *" accent="#FBBC05">
          <StyledInput accent="#FBBC05" type="text" name="instrument" value={formData.instrument}
            onChange={handleChange} required placeholder="Ej. Guitarra, Piano..." />
        </Field>
      </div>

      {/* Separador */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, #4285F420, #34A85320, transparent)' }} />

      {/* Alumno */}
      <div ref={dropdownRef} className="relative">
        <Field label="Alumno *" accent="#34A853">
          <div className="relative">
            <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(52,168,83,0.5)', pointerEvents: 'none' }} />
            <input
              type="text" value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setFormData({ ...formData, studentId: '' }); setShowSuggestions(true); }}
              onFocus={e => { setShowSuggestions(true); e.currentTarget.style.borderColor = '#34A85360'; e.currentTarget.style.boxShadow = '0 0 0 3px #34A85318'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              placeholder="Busca por nombre o correo..."
              required={!formData.studentId}
              style={{ ...inputStyle('#34A853'), paddingLeft: '40px' }}
            />
          </div>
        </Field>
        {showSuggestions && searchQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-20"
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
            {isSearching ? (
              <div className="flex items-center gap-2 px-4 py-3.5 text-white/30 text-sm">
                <Loader2 size={14} className="animate-spin" /> Buscando...
              </div>
            ) : searchResults.length > 0 ? searchResults.map(s => (
              <div key={s.id} onClick={() => handleStudentSelect(s)}
                className="flex flex-col px-4 py-3 cursor-pointer hover:bg-white/[0.05] border-b border-white/[0.04] last:border-0 transition-colors">
                <span className="text-white text-sm font-medium">{s.nombre}</span>
                <span className="text-white/35 text-xs mt-0.5">{s.correo}</span>
              </div>
            )) : (
              <div className="px-4 py-3.5 text-white/25 text-sm">Sin resultados</div>
            )}
          </div>
        )}
      </div>

      {/* Separador */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, #34A85320, #FBBC0520, transparent)' }} />

      {/* Fecha y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Fecha *" accent="#EA4335">
          <StyledInput accent="#EA4335" type="date" name="date" value={formData.date}
            onChange={handleChange} required min={getMinDate()} />
        </Field>
        <Field label="Hora de inicio *" accent="#34A853">
          <StyledInput accent="#34A853" type="time" name="time" value={formData.time}
            onChange={handleChange} required />
        </Field>
      </div>

      {/* Separador */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, #EA433520, #4285F420, transparent)' }} />

      {/* Descripción */}
      <Field label="Notas / Temario" accent="#4285F4">
        <StyledTextarea accent="#4285F4" name="description" value={formData.description}
          onChange={handleChange} rows={3}
          placeholder="Material requerido, objetivos de la sesión..." />
      </Field>

      {/* Botón estilo Google Sign-In — ancho auto, centrado */}
      <div className="flex justify-center mt-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !formData.studentId}
          className="flex items-center rounded-md overflow-hidden transition-all"
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            boxShadow: '0 1px 3px rgba(60,64,67,0.18)',
            opacity: loading || !formData.studentId ? 0.35 : 1,
            cursor: loading || !formData.studentId ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if (!loading && formData.studentId) e.currentTarget.style.boxShadow = '0 3px 10px rgba(60,64,67,0.28)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.18)'; }}
        >
          {/* Logo con separador derecho */}
          <div className="flex items-center justify-center w-12 h-12 flex-shrink-0 border-r border-[#dadce0]">
            <MeetLogo size={24} />
          </div>
          {/* Texto */}
          <span className="px-5"
            style={{
              color: '#111111',
              fontFamily: 'var(--font-roboto), Roboto, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.21px',
              whiteSpace: 'nowrap',
            }}>
            {loading ? 'Generando enlace...' : 'Crear Clase con Google Meet'}
          </span>
        </motion.button>
      </div>
    </motion.form>
  );
}
