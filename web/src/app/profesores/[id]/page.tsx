import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Video, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LocalTime from '@/components/LocalTime';
import ConnectTeacherButton from '@/components/teacher/ConnectTeacherButton';
import DeleteClassButton from '@/components/teacher/DeleteClassButton';

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
    .from('usuarios')
    .select('nombre, correo, avatar_url, instrumento')
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
    .from('student_teacher_connections')
    .select('id')
    .eq('student_id', user.id)
    .eq('teacher_id', teacherId)
    .maybeSingle();

  // 3. Obtener clases agendadas
  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('student_id', user.id)
    .eq('teacher_id', teacherId)
    .order('scheduled_at', { ascending: true });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '80px 20px', fontFamily: 'var(--font-inter)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <Link href="/profesores" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '40px', fontSize: '15px', transition: '0.3s' }}>
          <ArrowLeft size={18} /> Volver al Directorio
        </Link>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '50px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '30px', marginBottom: '50px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', overflow: 'hidden', border: '2px solid var(--neon-cyan)', boxShadow: '0 0 20px rgba(0,255,170,0.2)' }}>
                <img 
                  src={teacher.avatar_url || `https://ui-avatars.com/api/?name=${teacher.nombre}&background=00ffaa&color=000`} 
                  alt={teacher.nombre} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800 }}>{teacher.nombre}</h1>
                <p style={{ margin: '4px 0 0 0', color: 'var(--neon-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
                  Profesor de {teacher.instrumento || 'Música'}
                </p>
              </div>
            </div>
            <ConnectTeacherButton 
              teacherId={teacherId} 
              studentId={user.id} 
              hasConnection={!!connection} 
            />
          </div>

          <h2 style={{ fontSize: '22px', margin: '0 0 30px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={22} color="var(--neon-pink)" /> Mis Clases Programadas
          </h2>

          {!classes || classes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>No tienes clases agendadas con este profesor.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {classes.map(cls => {
                return (
                  <div key={cls.id} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    boxShadow: 'inset 0 0 40px rgba(255, 0, 122, 0.03)'
                  }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'white' }}>{cls.title}</h3>
                      {cls.instrument && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--neon-cyan)', fontWeight: 600 }}>
                          Instrumento: {cls.instrument}
                        </p>
                      )}
                      {cls.description && <p style={{ margin: '12px 0 0 0', fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{cls.description}</p>}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderRadius: '12px' }}>
                      <LocalTime dateIso={cls.scheduled_at} />
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
                       
                       <DeleteClassButton classId={cls.id} />
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
