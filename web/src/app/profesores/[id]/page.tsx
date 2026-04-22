import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Video, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LocalTime from '@/components/LocalTime';

export default async function TeacherClassesPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: userProfile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (userProfile?.rol === 'profesor') {
    redirect('/teacher/dashboard');
  }

  const { id: teacherId } = await params;

  // 1. Obtener datos del profesor
  const { data: teacher, error: teacherError } = await supabase
    .from('perfiles_publicos')
    .select('nombre, avatar_url, instrumento')
    .eq('id', teacherId)
    .single();

  if (!teacher || teacherError) {
    return (
      <div style={{ padding: '40px', color: 'white' }}>
        <h2>Profesor no encontrado.</h2>
        <Link href="/profesores" style={{ color: 'var(--neon-cyan)' }}>Volver al Directorio</Link>
      </div>
    );
  }

  // 2. Comprobar si están conectados
  const { data: connection } = await supabase
    .from('relaciones_profesor_alumno')
    .select('id')
    .eq('student_id', user.id)
    .eq('teacher_id', teacherId)
    .maybeSingle();

  if (!connection) {
    return (
      <div style={{ padding: '80px 20px', color: 'white', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <Link href="/profesores" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Volver a Profesores
        </Link>
        <div style={{ background: 'rgba(255, 0, 122, 0.1)', padding: '40px', borderRadius: '16px', border: '1px solid var(--neon-pink)' }}>
          <h2 style={{ margin: '0 0 16px 0', color: 'var(--neon-pink)' }}>Aún no están conectados</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>Debes pedirle a este profesor que acepte la conexión para ver las clases programadas aquí.</p>
        </div>
      </div>
    );
  }

  // 3. Traer clases agendadas
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('student_id', user.id)
    .order('scheduled_at', { ascending: true });

  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: 'white', padding: '40px 20px', fontFamily: 'var(--font-inter)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Header / Botón Volver */}
        <Link href="/profesores" style={{ color: 'var(--neon-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, width: 'fit-content' }}>
          <ArrowLeft size={16} /> Volver al Directorio de Profesores
        </Link>
        
        {/* Tarjeta del Profesor */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid rgba(0, 255, 170, 0.2)', 
          borderRadius: '24px', 
          padding: '40px',
          display: 'flex',
          gap: '32px',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: teacher.avatar_url ? `url(${teacher.avatar_url}) center/cover` : 'var(--neon-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '4px solid rgba(0, 255, 170, 0.3)'
          }}>
            {!teacher.avatar_url && (
              <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'black' }}>
                {teacher.nombre.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '16px' }}>
              {teacher.nombre} 
              <span style={{ fontSize: '12px', background: 'rgba(0,255,170,0.1)', color: 'var(--neon-cyan)', padding: '6px 16px', borderRadius: '100px', fontWeight: 700, border: '1px solid var(--neon-cyan)', letterSpacing: '0.5px' }}>CONECCION ACTIVA</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.7)', margin: '12px 0 0 0' }}>
              {teacher.instrumento || 'Profesor de Música Integral'}
            </p>
            <p style={{ marginTop: '16px', fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.6 }}>
              En este portal puedes ver todas las clases o videollamadas que este profesor ha programado contigo. Usa aquí tus enlaces de Google Meet a tiempo.
            </p>
          </div>
        </div>

        {/* Lista de Clases */}
        <div>
          <h2 style={{ fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '32px', color: 'white' }}>
            Tus Próximas Clases Magistrales
          </h2>

          {!classes || classes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Calendar size={56} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 24px' }} />
              <h3 style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 12px 0', fontSize: '20px' }}>El profesor aún no ha agendado ninguna clase contigo.</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: 0, maxWidth: '500px', marginInline: 'auto', lineHeight: 1.5 }}>
                Cuando el profesor programe una sesión desde su panel, aparecerá aquí con la fecha exacta y el enlace a Google Meet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              {classes.map(cls => {
                return (
                  <div key={cls.id} style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 0, 122, 0.3)',
                    borderRadius: '20px',
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    boxShadow: 'inset 0 0 40px rgba(255, 0, 122, 0.03)'
                  }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'white' }}>{cls.title}</h3>
                      {cls.description && <p style={{ margin: '12px 0 0 0', fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{cls.description}</p>}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderRadius: '12px' }}>
                      <LocalTime dateIso={cls.scheduled_at} />
                    </div>

                    <div style={{ marginTop: '8px' }}>
                       {cls.meet_link ? (
                         <a href={cls.meet_link} target="_blank" rel="noopener noreferrer" style={{
                           display: 'inline-flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           gap: '12px',
                           padding: '16px 32px',
                           background: 'var(--neon-pink)',
                           color: 'white',
                           borderRadius: '12px',
                           textDecoration: 'none',
                           fontWeight: 700,
                           fontSize: '16px',
                           boxShadow: '0 8px 30px rgba(255, 0, 122, 0.4)',
                           transition: 'all 0.3s ease'
                         }}>
                            <Video size={22} /> Entrar a Google Meet
                         </a>
                       ) : (
                         <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 32px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', borderRadius: '12px', fontSize: '16px', fontWeight: 600 }}>
                            <Video size={20} /> Enlace pendiente
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
