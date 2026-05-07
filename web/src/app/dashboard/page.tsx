import { getDailyTasks } from "@/actions/practiceActions";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Video, Calendar } from 'lucide-react';
import LocalTime from '@/components/LocalTime';
import DeleteClassButton from '@/components/teacher/DeleteClassButton';
import styles from './page.module.css';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?login=true');
  }

  // Fetch the user's profile to check their role and name
  const { data: userProfile } = await supabase
    .from('usuarios')
    .select('rol, nombre')
    .eq('id', user.id)
    .single();

  // If the user is a teacher, redirect them to the teacher dashboard
  if (userProfile?.rol === 'profesor') {
    redirect('/teacher/dashboard');
  }

  const tasksResponse = await getDailyTasks(user.id);
  const tasks = tasksResponse.data || [];

  // Fetch classes for this student
  const { data: classes } = await supabase
    .from('classes')
    .select('*, teacher:usuarios!classes_teacher_id_fkey(nombre)')
    .eq('student_id', user.id)
    .order('scheduled_at', { ascending: true });

  return (
    <main className={styles.main}>
            
      <div className={styles.dashboardContainer}>
        <div className={styles.headerArea}>
          <h1 className={styles.greetingTitle}>
            Bienvenido de vuelta, <span>{userProfile?.nombre?.split(' ')[0] || 'Estudiante'}</span>
          </h1>
          <p className={styles.greetingSubtitle}>
            Tienes <span className={styles.highlight}>{tasks.length} tareas</span> programadas para hoy según tu Curva de Aprendizaje.
          </p>
        </div>

        <section className={styles.tasksSection}>
          <h2 className={styles.sectionTitle}>Tus Prácticas Pendientes (SRS)</h2>
          
          {tasks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>¡Todo al día! Has completado tus repasos espaciados.</p>
            </div>
          ) : (
            <div className={styles.gridContainer}>
              {tasks.map((task: any) => (
                <div key={task.id} className={styles.practiceCard}>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.songTitle}>{task.canciones.titulo}</h3>
                    <p className={styles.songArtist}>{task.canciones.artista}</p>
                    <div className={styles.badgeContainer}>
                      <span className={styles.difficultyBadge}>{task.canciones.dificultad}</span>
                      <span className={styles.repBadge}>Repaso #{task.repeticiones + 1}</span>
                    </div>
                  </div>
                  <div className={styles.cardAction}>
                    <a href={`/practica/${task.cancion_id}`} className={styles.btnPracticar}>
                      Practicar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Nueva sección de Clases */}
        <section className={styles.tasksSection} style={{ marginTop: '40px' }}>
          <h2 className={styles.sectionTitle}>Mis Clases Magistrales (Google Meet)</h2>
          
          {!classes || classes.length === 0 ? (
            <div className={styles.emptyState} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 20px' }}>
              <Calendar size={48} color="rgba(255,255,255,0.2)" />
              <p>Aún no tienes clases agendadas. Conecta con un profesor desde su perfil para empezar.</p>
              <a href="/profesores" style={{ color: 'var(--neon-cyan)', fontWeight: 600, textDecoration: 'none' }}>Ver Directorio de Profesores</a>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              {classes.map(cls => {
                const teacherName = Array.isArray(cls.teacher) ? cls.teacher[0]?.nombre : cls.teacher?.nombre;
                
                return (
                  <div key={cls.id} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(0, 255, 170, 0.2)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '24px'
                  }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <span style={{ fontSize: '12px', background: 'rgba(0, 255, 170, 0.1)', color: 'var(--neon-cyan)', padding: '4px 12px', borderRadius: '100px', fontWeight: 600, marginBottom: '12px', display: 'inline-block' }}>
                        Profesor: {teacherName || 'Desconocido'}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'white' }}>{cls.title}</h3>
                      {cls.instrument && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                          Instrumento: {cls.instrument}
                        </p>
                      )}
                      
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '16px' }}>
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
                           padding: '12px 20px',
                           background: 'var(--neon-pink)',
                           color: 'white',
                           borderRadius: '8px',
                           textDecoration: 'none',
                           fontWeight: 600,
                           fontSize: '14px',
                           boxShadow: '0 4px 15px rgba(255, 0, 122, 0.3)',
                           transition: 'all 0.3s'
                         }}>
                            <Video size={16} /> Unirse a la Clase
                         </a>
                       ) : (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                            <Video size={16} /> Enlace pendiente
                         </div>
                       )}
                       <DeleteClassButton classId={cls.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
