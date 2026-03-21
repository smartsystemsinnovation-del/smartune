import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Video, Calendar, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import LocalTime from '@/components/LocalTime';
import InstantCallButton from '@/components/teacher/InstantCallButton';

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Verificar si es profesor
  const { data: userProfile } = await supabase
    .from('usuarios')
    .select('rol, nombre, avatar_url')
    .eq('id', user.id)
    .single();

  if (userProfile?.rol !== 'profesor') {
    redirect('/dashboard');
  }

  // Traer clases agendadas creadas por este profesor
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('*, student:usuarios!classes_student_id_fkey(nombre, correo, avatar_url)')
    .eq('teacher_id', user.id)
    .order('scheduled_at', { ascending: true });

  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: 'white', padding: '60px 20px', fontFamily: 'var(--font-inter)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Header Dashboard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700 }}>
              Panel del <span style={{ color: 'var(--neon-cyan)' }}>Profesor</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '8px', fontSize: '16px' }}>
              Bienvenido, {userProfile?.nombre}. Gestiona tus alumnos y videoconferencias.
            </p>
          </div>
          
          <Link href="/teacher/clases/crear" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 24px',
            background: 'var(--neon-pink)',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '15px',
            boxShadow: '0 8px 30px rgba(255, 0, 122, 0.4)',
            transition: 'all 0.3s'
          }}>
            <PlusCircle size={20} /> Programar Nueva Clase
          </Link>
        </div>

        {/* Lista de Clases Creadas */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '40px',
        }}>
          <h2 style={{ fontSize: '24px', margin: '0 0 32px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
            Todas tus Clases Activas
          </h2>

          {!classes || classes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Calendar size={64} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 24px' }} />
              <h3 style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 12px 0', fontSize: '20px' }}>No tienes clases programadas.</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>
                Revisa tu red de alumnos y empieza a programar clases usando Google Meet.
              </p>
              <Link href="/teacher/clases/crear" style={{ color: 'var(--neon-cyan)', fontWeight: 600, display: 'inline-block', marginTop: '16px' }}>
                Crear mi primera clase
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              {classes.map(cls => {
                const student = Array.isArray(cls.student) ? cls.student[0] : cls.student;

                return (
                  <div key={cls.id} style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(0, 255, 170, 0.2)',
                    borderRadius: '20px',
                    padding: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '24px',
                    boxShadow: 'inset 0 0 20px rgba(0, 255, 170, 0.03)'
                  }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '4px 12px', borderRadius: '100px', fontWeight: 600, marginBottom: '12px', display: 'inline-block' }}>
                        Alumno: {student?.nombre || 'Desconocido'}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'white' }}>{cls.title}</h3>
                      
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', marginTop: '16px', width: 'fit-content' }}>
                        <LocalTime dateIso={cls.scheduled_at} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: '0 0 auto' }}>
                       {cls.meet_link ? (
                         <a href={cls.meet_link} target="_blank" rel="noopener noreferrer" style={{
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           gap: '8px',
                           padding: '14px 24px',
                           background: 'var(--neon-cyan)',
                           color: 'black',
                           borderRadius: '12px',
                           textDecoration: 'none',
                           fontWeight: 700,
                           fontSize: '15px',
                           boxShadow: '0 4px 20px rgba(0, 255, 170, 0.3)',
                         }}>
                            <Video size={18} /> Google Meet Programado
                         </a>
                       ) : (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', borderRadius: '12px', fontSize: '15px', fontWeight: 600 }}>
                            <Video size={18} /> Error de enlace
                         </div>
                       )}

                       {student && (
                         <InstantCallButton 
                            targetUserId={cls.student_id} 
                            teacherName={userProfile.nombre} 
                            teacherAvatar={userProfile.avatar_url}
                         />
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
