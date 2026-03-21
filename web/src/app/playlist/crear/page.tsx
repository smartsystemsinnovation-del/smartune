import { createClient } from '@/utils/supabase/server';
import AuthGatekeeper from '@/components/AuthGatekeeper';
import styles from '../../dashboard/page.module.css';

export default async function CreatePlaylistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <main className={styles.main}>
            <div className={styles.dashboardContainer}>
        <div className={styles.headerSection} style={{ marginBottom: '24px' }}>
          <h1 className={styles.greetingTitle}>
             <span style={{color: 'var(--neon-pink)', marginRight: '12px'}}>➕</span>
             Añadir <span>Playlist</span>
          </h1>
          <p className={styles.greetingSubtitle}>Crea una nueva colección de música a tu medida.</p>
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
              </div>
            }
            titlePath1="Crea una cuenta para añadir"
            titleHighlight="Playlists"
            subtitle="Inicia sesión o regístrate para crear tus propias playlists personalizadas. Comienza a organizar tu música favorita ahora."
            cardIcon={<div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--neon-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div>}
            cardTitle="Características de las playlists:"
            benefits={[
              { text: "Añade portadas personalizadas a tus playlists" },
              { text: "Selecciona y organiza tus canciones favoritas" },
              { text: "Comparte tus creaciones con la comunidad" },
              { text: "Edita y actualiza tus playlists cuando quieras" }
            ]}
          />
        ) : (
          <div className={styles.emptyState}>
            <p>El creador de playlists estará disponible próximamente.</p>
          </div>
        )}
      </div>
    </main>
  );
}
