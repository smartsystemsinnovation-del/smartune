"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Home, Compass, Users, Star, Gamepad2, BookOpen, Wand2, Heart, Music, Plus, History, LayoutDashboard, PlusCircle, Settings, Calendar, Video } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', currentUser.id)
          .single();
        
        setUserRole(usuario?.rol || 'estudiante');
      } else {
        setUserRole(null);
      }
    };

    fetchUserAndRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: unknown, session: { user: any } | null) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Funciones de ayuda para comprobar la ruta activa
  const isActive = (path: string) => pathname === path;
  const isPrefixActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      <button 
        className={`${styles.hamburger} ${isOpen ? styles.hidden : ''}`} 
        onClick={toggleSidebar}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <button className={styles.closeBtn} onClick={toggleSidebar} aria-label="Cerrar menú">
          ✕
        </button>

        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>SmarTune</h1>
        </div>
        
        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Menu</p>
          <nav className={styles.navGroup}>
            <Link href="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
              <span className={styles.icon}>🏠</span>
              Home
            </Link>
            <Link href="/explorar" className={`${styles.navItem} ${isPrefixActive('/explorar') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
              <span className={styles.icon}>🧭</span>
              Descubre
            </Link>
            <Link href="/premium" className={`${styles.navItemPremium} ${isPrefixActive('/premium') ? styles.activePremium : ''}`} onClick={() => setIsOpen(false)}>
              <span className={styles.icon}>⭐️</span>
              Premium
            </Link>
            {user && (
              <>
                <Link href="/minijuegos" className={`${styles.navItem} ${isPrefixActive('/minijuegos') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                  <span className={styles.icon}>🎮</span>
                  Minijuegos
                </Link>
                {userRole === 'profesor' && (
                  <Link href="/teacher/clases/crear" className={`${styles.navItem} ${isPrefixActive('/teacher/clases/crear') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                    <span className={styles.icon}>📚</span>
                    Crear Clases
                  </Link>
                )}
                <Link href="/ia-studio" className={`${styles.navItem} ${isPrefixActive('/ia-studio') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                  <span className={styles.icon}>🪄</span>
                  IA Studio
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Favoritos y Playlist</p>
          <nav className={styles.navGroup}>
            <Link href="/favoritos" className={`${styles.navItem} ${pathname === '/favoritos' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
              <span className={styles.icon}>❤️</span>
              MusicSwipe
            </Link>
            <Link href="/favoritos/playlist" className={`${styles.navItem} ${pathname === '/favoritos/playlist' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
              <span className={styles.icon}>🎵</span>
              Mi Playlist
            </Link>
            <Link href="/playlist/crear" className={`${styles.navItemAdd} ${pathname === '/playlist/crear' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
              <span className={styles.icon}>➕</span>
              Añadir playlist
            </Link>
          </nav>
        </div>

        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Actualizaciones</p>
          <nav className={styles.navGroup}>
            <Link href="/novedades" className={`${styles.navItem} ${isPrefixActive('/novedades') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
              <span className={styles.icon}>🕒</span>
              Novedades
            </Link>
          </nav>
        </div>

        <div className={styles.spacer} />

        {userRole === 'profesor' ? (
          <div className={styles.menuSection}>
            <p className={styles.sectionTitle}>Panel de Control Profesor</p>
            <nav className={styles.navGroup}>
              <Link href="/teacher/dashboard" className={`${styles.navItem} ${isActive('/teacher/dashboard') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                <span className={styles.icon}><LayoutDashboard size={18} /></span>
                Dashboard
              </Link>
              <Link href="/teacher/clases/crear" className={`${styles.navItem} ${isActive('/teacher/clases/crear') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                <span className={styles.icon} style={{ display: 'flex', gap: '4px' }}>
                  <PlusCircle size={18} />
                  <Calendar size={12} style={{ color: '#4285F4' }} />
                </span>
                Crear Clase
              </Link>
              <Link href="/teacher/integraciones" className={`${styles.navItem} ${isActive('/teacher/integraciones') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                <span className={styles.icon} style={{ display: 'flex', gap: '4px' }}>
                  <Settings size={18} />
                  <Video size={12} style={{ color: '#34A853' }} />
                </span>
                Integraciones
              </Link>
            </nav>
          </div>
        ) : (
          <div className={styles.bottomSection}>
            <Link href="/hazte-profesor" className={styles.premiumLink} onClick={() => setIsOpen(false)}>
              {userRole === 'profesor_pendiente' ? 'SOLICITUD PENDIENTE' : 'HAZTE PROFESOR'}
            </Link>
          </div>
        )}
      </aside>
      
      {/* Overlay to dim background when sidebar is open on mobile */}
      {isOpen && <div className={styles.overlay} onClick={toggleSidebar} />}
    </>
  );
}
