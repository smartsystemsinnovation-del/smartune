'use client';

import { useRouter } from "next/navigation";
import styles from "../../app/page.module.css";

interface HeroSectionProps {
  user: any;
  openAuth: (mode: 'login' | 'register') => void;
}

export default function HeroSection({ user, openAuth }: HeroSectionProps) {
  const router = useRouter();

  return (
    <section className={`${styles.heroSection} ${styles.glassPanel} fade-in`}>
      <div className={styles.heroImageContainer}>
        <div className={`${styles.heroImage} bg-[#2c1d3c]`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop')" }} />
        <div className={styles.heroGradient} />
      </div>
      
      <div className={styles.heroContent}>
        <header className={styles.headerNav}>
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input type="text" className={styles.searchInput} placeholder="Buscar lecciones, artistas o géneros..." />
          </div>
          
          <nav className={styles.navLinks}>
            <span className={styles.navLink} onClick={() => document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth'})}>Nosotros</span>
            <span className={styles.navLink} onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth'})}>Contacto</span>
          </nav>
          
          <div className={styles.authButtons}>
            {user ? (
               <button className={styles.btnLogin} onClick={() => router.push('/dashboard')} style={{ background: '#f6339a', color: 'white', border: 'none' }}>Ir al Dashboard</button>
            ) : (
              <>
                <button className={styles.btnRegister} onClick={() => openAuth('register')}>Regístrate</button>
                <button className={styles.btnLogin} onClick={() => openAuth('login')}>Inicia Sesión</button>
              </>
            )}
          </div>
        </header>

        <div className={styles.heroCenter}>
          <h1 className={styles.heroTitle}>
            Aprende a tu <br/><span>Ritmo</span>
          </h1>
          <p className={styles.heroDesc}>
            Acelera tu aprendizaje con nuestro probado algoritmo de Repetición Espaciada (Ebbinghaus). Accede a ejercicios interactivos, partituras premium y eleva tu nivel musical.
          </p>
          <div className={styles.heroActions}>
            {user ? (
               <button className={styles.btnPrimary} onClick={() => router.push('/dashboard')}>Continuar Aprendiendo</button>
            ) : (
               <>
                 <button className={styles.btnPrimary} onClick={() => openAuth('register')}>Comenzar YA!</button>
                 <button className={styles.btnSecondary} onClick={() => openAuth('login')}>Inicia Sesión</button>
               </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
