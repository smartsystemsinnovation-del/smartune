'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Video, Search, Loader2 } from 'lucide-react';

export default function CreateClassForm({ teacherId }: { students?: any[], teacherId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    instrument: '',
    description: '',
    studentId: '',
    date: '',
    time: ''
  });

  // Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    // Si ya seleccionamos a alguien y el input muestra su nombre, no buscamos de nuevo
    if (formData.studentId && searchQuery.includes('(')) return;

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search-users?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || []);
        }
      } catch (err) {
        console.error("Error buscando usuarios:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, formData.studentId]);

  const handleStudentSelect = (student: any) => {
    setFormData({ ...formData, studentId: student.id });
    setSearchQuery(`${student.nombre} (${student.correo})`);
    setShowSuggestions(false);
  };

  // Calcular la fecha mínima "Hoy a las 00:00" en el huso horario local del usuario
  const getMinDateTime = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!formData.studentId) throw new Error("Debes buscar y seleccionar un alumno de la lista");
      if (!formData.date || !formData.time) throw new Error("Debes elegir una fecha y hora");
      const scheduledAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();

      const response = await fetch('/api/create-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          studentId: formData.studentId,
          title: formData.title,
          instrument: formData.instrument,
          description: formData.description,
          scheduledAt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Ocurrió un error al agendar la clase.';
        const detailsMsg = data.details ? ` (Razón técnica: ${data.details})` : '';
        throw new Error(errorMsg + detailsMsg);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/teacher/dashboard');
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(0, 255, 170, 0.05)', border: '1px solid var(--neon-cyan)', borderRadius: '16px' }}>
        <Video size={48} color="var(--neon-cyan)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ color: 'white', marginBottom: '8px' }}>¡Clase Creada!</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>El enlace de Google Meet se generó con éxito.</p>
        <p style={{ fontSize: '12px', marginTop: '16px', color: 'var(--neon-cyan)' }}>Redirigiendo a tu dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ 
      background: 'rgba(255, 255, 255, 0.03)', 
      padding: '32px', 
      borderRadius: '20px', 
      border: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      
      {error && (
        <div style={{ padding: '12px', background: 'rgba(255, 0, 122, 0.1)', border: '1px solid var(--neon-pink)', color: 'var(--neon-pink)', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Titulo y Descripcion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>Título de la Clase *</label>
        <input 
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleChange}
          required
          placeholder="Ej. Técnica de Arpegios"
          style={{ width: '100%', padding: '14px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '8px', fontSize: '16px' }} 
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>Instrumento *</label>
        <input 
          type="text" 
          name="instrument" 
          value={formData.instrument} 
          onChange={handleChange}
          required
          placeholder="Ej. Guitarra, Piano, Canto..."
          style={{ width: '100%', padding: '14px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '8px', fontSize: '16px' }} 
        />
      </div>

      {/* Autocomplete Alumno */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} ref={dropdownRef}>
        <label style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>Buscar Alumno (Nombre o Correo) *</label>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFormData({ ...formData, studentId: '' }); // Reset ID if user types something new
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Escribe para buscar cualquier estudiante..."
            required={!formData.studentId}
            style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '8px', fontSize: '16px' }}
          />
          {showSuggestions && searchQuery.length >= 2 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: '#1A1A1A',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              {isSearching ? (
                <div style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} /> Buscando...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(student => (
                  <div 
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: 'white', fontWeight: 600 }}>{student.nombre}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{student.correo}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                  No se encontraron alumnos con ese nombre o correo
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Date & Time Premium Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '8px' }}>
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.4)', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid rgba(0, 255, 170, 0.2)',
          boxShadow: 'inset 0 0 20px rgba(0, 255, 170, 0.05)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(0, 255, 170, 0.15)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(0, 255, 170, 0.05)'}
        >
          <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Calendar size={20} color="var(--neon-cyan)"/> Día de la Clase
          </h4>
          <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange}
            required
            min={getMinDateTime().split('T')[0]} // Extrae solo YYYY-MM-DD
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: 'none', 
              borderRadius: '8px', 
              color: 'white', 
              fontSize: '18px', 
              fontFamily: 'inherit',
              outline: 'none',
              cursor: 'pointer'
            }} 
          />
        </div>

        <div style={{ 
          background: 'rgba(0, 0, 0, 0.4)', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid rgba(255, 0, 122, 0.2)',
          boxShadow: 'inset 0 0 20px rgba(255, 0, 122, 0.05)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(255, 0, 122, 0.15)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(255, 0, 122, 0.05)'}
        >
          <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Clock size={20} color="var(--neon-pink)"/> Hora de Inicio
          </h4>
          <input 
            type="time" 
            name="time" 
            value={formData.time} 
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: 'none', 
              borderRadius: '8px', 
              color: 'white', 
              fontSize: '18px', 
              fontFamily: 'inherit',
              outline: 'none',
              cursor: 'text'
            }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>Descripción / Temario (Opcional)</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange}
          rows={3}
          placeholder="Notas o material requerido para la clase..."
          style={{ width: '100%', padding: '14px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '8px', fontSize: '16px', resize: 'vertical' }} 
        />
      </div>

      <button 
        type="submit" 
        disabled={loading || !formData.studentId}
        style={{
          marginTop: '16px',
          padding: '16px',
          background: 'var(--neon-pink)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: loading || !formData.studentId ? 'not-allowed' : 'pointer',
          opacity: loading || !formData.studentId ? 0.7 : 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 0 20px rgba(255, 0, 122, 0.4)'
        }}
      >
        {loading ? 'Generando Enlace con Google...' : <><Video size={20} /> Crear Clase Online</>}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
