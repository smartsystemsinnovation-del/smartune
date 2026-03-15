import { createClient } from '@/utils/supabase/server';
import Navigation from '@/components/Navigation';
import AuthGatekeeper from '@/components/AuthGatekeeper';
import styles from '../dashboard/page.module.css';

export default async function FavoritosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <main className={styles.main}>
      <Navigation />
      <div className={styles.dashboardContainer}>
        <div className={styles.headerSection} style={{ marginBottom: '24px' }}>
          <h1 className={styles.greetingTitle}>
            <span style={{color: 'var(--neon-pink)', marginRight: '12px'}}>♥</span>
            Tus <span>Favoritos</span>
          </h1>
          <p className={styles.greetingSubtitle}>Guarda tus canciones y cursos favoritos</p>
        </div>

        {!isAuthenticated ? (
          <AuthGatekeeper 
            iconNode={
              <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--neon-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <div style={{ position: 'absolute', top: -4, right: -4, background: 'var(--neon-pink)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </div>
              </div>
            }
            titlePath1="Crea una cuenta para acceder a"
            titleHighlight="Favoritos"
            subtitle="Inicia sesión o regístrate para guardar tus canciones y cursos favoritos. Accede a ellos desde cualquier dispositivo en cualquier momento."
            cardIcon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>}
            cardTitle="Beneficios de tener una cuenta:"
            benefits={[
              { text: "Guarda tus canciones y cursos favoritos ilimitadamente" },
              { text: "Sincroniza tu progreso en todos tus dispositivos" },
              { text: "Crea playlists personalizadas" },
              { text: "Participa en la comunidad y comparte tu progreso" }
            ]}
          />
        ) : (
          <div className={styles.emptyState}>
            <p>Aún no tienes elementos en favoritos. ¡Explora el catálogo!</p>
          </div>
        )}
      </div>
    </main>
  );
}
