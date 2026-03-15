import { getDailyTasks } from "@/actions/practiceActions";
import Navigation from '@/components/Navigation';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?login=true');
  }

  const tasksResponse = await getDailyTasks(user.id);
  const tasks = tasksResponse.data || [];

  return (
    <main className={styles.main}>
      <Navigation />
      
      <div className={styles.dashboardContainer}>
        <div className={styles.headerArea}>
          <h1 className={styles.greetingTitle}>
            Bienvenido de vuelta, <span>Estudiante</span>
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
      </div>
    </main>
  );
}
