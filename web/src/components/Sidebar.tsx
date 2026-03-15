"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
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
            <Link href="/profesores" className={`${styles.navItem} ${isPrefixActive('/profesores') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
              <span className={styles.icon}>👨‍🏫</span>
              Profesores
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
                <Link href="/clases" className={`${styles.navItem} ${isPrefixActive('/clases') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                  <span className={styles.icon}>📚</span>
                  Clases
                </Link>
                <Link href="/ia" className={`${styles.navItem} ${isPrefixActive('/ia') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                  <span className={styles.icon}>🤖</span>
                  IA
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Playlist and favorite</p>
          <nav className={styles.navGroup}>
            <Link href="/favoritos" className={`${styles.navItem} ${isPrefixActive('/favoritos') ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
              <span className={styles.icon}>❤️</span>
              Favoritos
            </Link>
            <Link href="/playlist" className={`${styles.navItem} ${pathname === '/playlist' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
              <span className={styles.icon}>🎵</span>
              Mi playlist
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

        <div className={styles.bottomSection}>
          <Link href="/hazte-profesor" className={styles.premiumLink} onClick={() => setIsOpen(false)}>
            HAZTE PROFESOR
          </Link>
        </div>
      </aside>
      
      {/* Overlay to dim background when sidebar is open on mobile */}
      {isOpen && <div className={styles.overlay} onClick={toggleSidebar} />}
    </>
  );
}
