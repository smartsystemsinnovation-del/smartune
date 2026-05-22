'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  getPendingApplications, 
  approveTeacherApplication, 
  rejectTeacherApplication,
  PendingApplication,
  ApplicationFilters
} from '@/actions/adminActions';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Search, 
  Calendar, 
  GraduationCap, 
  Loader2, 
  ShieldAlert,
  ArrowUpRight,
  User
} from 'lucide-react';

export default function AdminSolicitudesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // applicationId
  
  // Filtros
  const [nombre, setNombre] = useState('');
  const [certifica, setCertifica] = useState('');
  const [escuela, setEscuela] = useState('');
  const [fecha, setFecha] = useState('');

  // Modal de Rechazo
  const [rejectingApp, setRejectingApp] = useState<{ id: string, userId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const supabase = createClient();

  // Verificar rol de Administrador al cargar
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/');
          return;
        }

        const { data: profile } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', session.user.id)
          .single();

        if (profile?.rol === 'administrador') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error al verificar admin:', err);
        router.push('/');
      }
    };
    verifyAdmin();
  }, [supabase, router]);

  // Cargar solicitudes con filtros
  const fetchApplications = async () => {
    if (isAdmin === null || !isAdmin) return;
    
    setLoading(true);
    const filters: ApplicationFilters = {};
    if (nombre.trim()) filters.nombre = nombre.trim();
    if (certifica.trim()) filters.certifica = certifica.trim();
    if (escuela.trim()) filters.escuela = escuela.trim();
    if (fecha) filters.fecha = fecha;

    const res = await getPendingApplications(filters);
    if (res.success && res.data) {
      setApplications(res.data);
    } else {
      console.error('Error al cargar solicitudes:', res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [isAdmin, nombre, certifica, escuela, fecha]);

  const handleApprove = async (appId: string, userId: string) => {
    if (window.confirm('¿Estás seguro de que deseas aprobar esta certificación y habilitar la cuenta como Profesor?')) {
      setActionLoading(appId);
      const res = await approveTeacherApplication(appId, userId);
      if (res.success) {
        setApplications(prev => prev.filter(app => app.id !== appId));
      } else {
        alert('Error al aprobar: ' + res.error);
      }
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingApp) return;
    if (!rejectReason.trim()) {
      alert('Debes ingresar un motivo de rechazo');
      return;
    }

    setActionLoading(rejectingApp.id);
    const res = await rejectTeacherApplication(rejectingApp.id, rejectingApp.userId, rejectReason.trim());
    if (res.success) {
      setApplications(prev => prev.filter(app => app.id !== rejectingApp.id));
      setRejectingApp(null);
      setRejectReason('');
    } else {
      alert('Error al rechazar: ' + res.error);
    }
    setActionLoading(null);
  };

  if (isAdmin === null || loading && applications.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090909',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'var(--font-inter), sans-serif'
      }}>
        <Loader2 className="animate-spin text-[#f6339a]" size={36} />
        <span style={{ marginLeft: '12px', fontSize: '1.2rem', fontWeight: 600 }}>Cargando Panel...</span>
      </div>
    );
  }

  if (isAdmin === false) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #1c102a 0%, #090909 60%)',
      color: '#fff',
      padding: '2.5rem 2rem',
      fontFamily: 'var(--font-inter), sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* HEADER PANEL */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            margin: 0,
            letterSpacing: '-0.05em',
            textShadow: '0 0 30px rgba(246,51,154,0.15)'
          }}>
            Solicitudes de <span style={{
              background: 'linear-gradient(90deg, #f6339a 0%, #00ffaa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Profesores</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0.4rem 0 0', fontSize: '0.95rem' }}>
            Gestiona, filtra y valida los certificados subidos por alumnos para adquirir el rol docente.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 255, 170, 0.1)',
          border: '1px solid rgba(0, 255, 170, 0.2)',
          padding: '8px 16px',
          borderRadius: '20px',
          color: '#00ffaa',
          fontWeight: 'bold',
          fontSize: '0.85rem'
        }}>
          <ShieldAlert size={16} />
          Sesión Administrador Habilitada
        </div>
      </header>

      {/* FILTROS DE BÚSQUEDA */}
      <section style={{
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.2rem',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
      }}>
        {/* Filtro Nombre */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Postulante</label>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px 12px 10px 38px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
        </div>

        {/* Filtro Certificado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certificado</label>
          <div style={{ position: 'relative' }}>
            <FileText style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={16} />
            <input
              type="text"
              placeholder="Ej: Licenciatura..."
              value={certifica}
              onChange={(e) => setCertifica(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px 12px 10px 38px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Filtro Escuela */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escuela / Institución</label>
          <div style={{ position: 'relative' }}>
            <GraduationCap style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={16} />
            <input
              type="text"
              placeholder="Ej: Berklee..."
              value={escuela}
              onChange={(e) => setEscuela(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px 12px 10px 38px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Filtro Fecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha Publicación</label>
          <div style={{ position: 'relative' }}>
            <Calendar style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} size={16} />
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px 12px 8px 38px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </section>

      {/* LISTADO DE APLICACIONES */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.4)' }}>
          <Loader2 className="animate-spin text-[#f6339a] mb-3" size={28} />
          <span>Buscando solicitudes pendientes...</span>
        </div>
      ) : applications.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          background: 'rgba(255,255,255,0.01)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '16px',
          color: 'rgba(255,255,255,0.4)'
        }}>
          <CheckCircle size={48} style={{ color: '#00ffaa', opacity: 0.6, marginBottom: '1rem' }} />
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>¡No hay solicitudes pendientes!</h3>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem' }}>Todos los aplicantes han sido procesados o no coinciden con los filtros.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {applications.map((app) => (
            <article 
              key={app.id} 
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}
            >
              {/* Contenido */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      background: 'rgba(246, 51, 154, 0.1)',
                      border: '1px solid rgba(246, 51, 154, 0.2)',
                      padding: '8px',
                      borderRadius: '50%',
                      color: '#f6339a'
                    }}>
                      <User size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{app.usuarios?.nombre}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', wordBreak: 'break-all' }}>{app.usuarios?.correo}</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '4px 8px',
                    borderRadius: '12px'
                  }}>
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid rgba(255,255,255,0.03)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <FileText size={16} style={{ color: '#00ffaa', marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>Título / Certificación</strong>
                      {app.document_title}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <GraduationCap size={16} style={{ color: '#f6339a', marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>Escuela / Institución</strong>
                      {app.issuing_institution}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={app.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    transition: 'background 0.2s'
                  }}
                >
                  Ver Certificado <ArrowUpRight size={14} />
                </a>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleRejectApp(app.id, app.user_id)}
                    disabled={actionLoading !== null}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'rgba(255, 0, 122, 0.1)',
                      border: '1px solid rgba(255, 0, 122, 0.2)',
                      borderRadius: '10px',
                      color: '#ff007a',
                      padding: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <XCircle size={16} />
                    Rechazar
                  </button>

                  <button
                    onClick={() => handleApprove(app.id, app.user_id)}
                    disabled={actionLoading !== null}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'rgba(0, 255, 170, 0.1)',
                      border: '1px solid rgba(0, 255, 170, 0.2)',
                      borderRadius: '10px',
                      color: '#00ffaa',
                      padding: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    {actionLoading === app.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Aprobar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MODAL DE MOTIVO DE RECHAZO */}
      {rejectingApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0e0e0e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.4rem', fontWeight: 800 }}>Motivo de Rechazo</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
              Especifica brevemente el motivo del rechazo. Este mensaje será enviado al alumno para que pueda corregir los datos.
            </p>
            
            <form onSubmit={handleRejectSubmit}>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: El archivo adjunto no es legible o no corresponde a una institución acreditada."
                required
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '1.5rem',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setRejectingApp(null);
                    setRejectReason('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#ff007a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  Enviar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function handleRejectApp(id: string, userId: string) {
    setRejectingApp({ id, userId });
  }
}
