import { createClient } from '@/utils/supabase/server';
import AuthGatekeeper from '@/components/AuthGatekeeper';
import styles from '../dashboard/page.module.css';

export default async function NovedadesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <main className={styles.main}>
            <div className={styles.dashboardContainer}>
        <div className={styles.headerSection} style={{ marginBottom: '24px' }}>
          <h1 className={styles.greetingTitle}>
             <span style={{color: 'var(--neon-pink)', marginRight: '12px'}}>🕒</span>
             Centro de <span>Novedades</span>
          </h1>
          <p className={styles.greetingSubtitle}>Las últimas actualizaciones y nuevos lanzamientos de Smartune.</p>
        </div>

        {!isAuthenticated ? (
          <AuthGatekeeper 
            iconNode={
              <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--neon-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            }
            titlePath1="Crea una cuenta para ver las"
            titleHighlight="Novedades"
            subtitle="Inicia sesión o regístrate para mantenerte al tanto de los últimos lanzamientos y actualizaciones de nuestra plataforma musical."
            cardIcon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2"><path d="M22 11.08V12a10.00 10.00 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
            cardTitle="Beneficios de estar actualizado:"
            benefits={[
              { text: "Acceso anticipado a nuevas partituras" },
              { text: "Notificaciones de tus profesores favoritos" },
              { text: "Actualizaciones del algoritmo de aprendizaje" }
            ]}
          />
        ) : (
          <div className={styles.emptyState}>
            <p>Estás al día con todo. ¡Sigue practicando!</p>
          </div>
        )}
      </div>
    </main>
  );
}
