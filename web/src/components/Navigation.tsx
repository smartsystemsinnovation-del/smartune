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
  const [profile, setProfile] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Fetch extended profile data
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: unknown, session: { user: any } | null) => {
        setUser(session?.user || null);
        if (!session) setProfile(null);
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
    setShowDropdown(false);
    router.push('/');
    router.refresh();
  };
  
  // Format the username to show
  const getUsername = () => {
    if (profile?.nombre) return profile.nombre;
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
          
            <Link href="/" className="hover:text-[#f6339a] transition-colors">Inicio</Link>
            <Link href="/favoritos" className="hover:text-[#f6339a] transition-colors">MusicSwipe</Link>
            <Link href="/ia-studio" className="hover:text-[#f6339a] transition-colors flex items-center gap-1">
              <span>IA Studio</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </Link>
          </div>

          {!loading && (
            user ? (
              <div className={styles.profileContainer}>
                <div 
                  className={styles.avatarCircle}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className={styles.avatarImg} />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>

                {showDropdown && (
                  <div className={styles.dropdownMenu}>
                    <div className="px-4 py-2 border-bottom border-white/5 mb-1">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Conectado como</p>
                      <p className="text-white font-bold truncate">@{getUsername()}</p>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link href="/profile" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" />
                      </svg>
                      Mi Perfil
                    </Link>
                    <Link href="/profile" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Ajustes
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
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
