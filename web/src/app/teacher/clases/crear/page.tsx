import { createClient } from '@/utils/supabase/server';
import CreateClassForm from './CreateClassForm';
import styles from '@/app/dashboard/page.module.css';
import { redirect } from 'next/navigation';

export default async function CreateClassPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Traer los alumnos conectados a este profesor
  const { data: students } = await supabase
    .from('teacher_students_view')
    .select('*')
    .eq('teacher_id', user.id);

  return (
    <main className={styles.main}>
            <div className={styles.dashboardContainer} style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div className={styles.headerSection} style={{ marginBottom: '32px' }}>
          <h1 className={styles.greetingTitle}>
             <span style={{color: 'var(--neon-pink)', marginRight: '12px'}}>📅</span>
             Programar Nueva <span>Clase</span>
          </h1>
          <p className={styles.greetingSubtitle}>Agenda videollamadas con tus alumnos usando Google Meet.</p>
        </div>

        <CreateClassForm students={students || []} teacherId={user.id} />
      </div>
    </main>
  );
}
