import { createClient } from '@/utils/supabase/server';
import Navigation from '@/components/Navigation';
import AuthGatekeeper from '@/components/AuthGatekeeper';
import TeacherCard from './TeacherCard';
import styles from '../dashboard/page.module.css';

export default async function ProfesoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  let teachers: any[] = [];
  let connectedTeacherIds = new Set<string>();

  if (isAuthenticated) {
    const { data: perfiles_profesores } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, avatar_url, instrumento')
      .eq('rol', 'profesor');
    
    if (perfiles_profesores) teachers = perfiles_profesores;

    const { data: conexiones } = await supabase
      .from('student_teacher_connections')
      .select('teacher_id')
      .eq('student_id', user.id)
      .eq('status', 'accepted');
    
    if (conexiones) {
      conexiones.forEach(c => connectedTeacherIds.add(c.teacher_id));
    }
  }

  return (
    <main className={styles.main}>
      <Navigation />
      <div className={styles.dashboardContainer}>
        <div className={styles.headerSection} style={{ marginBottom: '24px' }}>
          <h1 className={styles.greetingTitle}>
             <span style={{color: 'var(--neon-pink)', marginRight: '12px'}}>👨‍🏫</span>
             Directorio de <span>Profesores</span>
          </h1>
          <p className={styles.greetingSubtitle}>Encuentra al mentor ideal para perfeccionar tu técnica.</p>
        </div>

        {!isAuthenticated ? (
          <AuthGatekeeper 
            iconNode={
              <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--neon-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            }
            titlePath1="Crea una cuenta para contactar a"
            titleHighlight="Profesores"
            subtitle="Inicia sesión o regístrate para conectar con mentores verificados y agilizar tu aprendizaje musical a tu ritmo."
            cardIcon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>}
            cardTitle="Beneficios de los Profesores Smartune:"
            benefits={[
              { text: "Recibe retroalimentación personalizada sobre tu técnica" },
              { text: "Accede a partituras y ejercicios privados" },
              { text: "Consulta tus dudas directamente desde la plataforma" }
            ]}
          />
        ) : teachers.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
            marginTop: '32px'
          }}>
            {teachers.map(teacher => (
              <TeacherCard 
                key={teacher.id} 
                teacher={teacher} 
                alreadyConnected={connectedTeacherIds.has(teacher.id)} 
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>La lista de profesores verificados estará disponible pronto. ¡Sé el primero en unirte desde "Hazte Profesor"!</p>
          </div>
        )}
      </div>
    </main>
  );
}
