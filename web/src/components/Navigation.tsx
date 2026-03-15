'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import AuthModal from './AuthModal';
import styles from './Navigation.module.css';

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const openAuth = (mode: 'login' | 'register') => {
    setModalMode(mode);
    setShowModal(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };
  
  // Format the username to show after @
  const getUsername = () => {
    if (!user) return 'Usuario';
    return user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Usuario';
  };

  return (
    <>
      {showModal && (
        <AuthModal 
          initialMode={modalMode} 
          onClose={() => setShowModal(false)} 
        />
      )}
      
      <nav className={styles.navbar}>
        <div className={styles.authNavbar}>
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input type="text" className={styles.searchInput} placeholder="Buscar lecciones, artistas o géneros..." />
          </div>
          
          <div className={styles.navLinksAuth}>
            <span style={{ cursor: 'pointer' }}>Contacto</span>
          </div>

          {!loading && (
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div 
                  className={styles.userBadge} 
                  onClick={() => router.push('/perfil')}
                  title="Ir al Perfil"
                >
                  @{getUsername()}
                </div>
                <button 
                  onClick={handleLogout} 
                  className={styles.btnLogoutModern}
                  title="Cerrar sesión"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                 <button className={styles.btnLogout} onClick={() => openAuth('register')}>Regístrate</button>
                 <button className={styles.userBadge} onClick={() => openAuth('login')} style={{ background: 'white', color: '#0e9eef' }}>Iniciar</button>
              </div>
            )
          )}
        </div>
      </nav>
    </>
  );
}
