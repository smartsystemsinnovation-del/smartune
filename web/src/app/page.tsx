'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "@/components/AuthModal";
import styles from "./page.module.css";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login'|'register'>('login');
  const [ctaMode, setCtaMode] = useState<'login'|'register'>('register');
  const [user, setUser] = useState<any>(null);
  
  // New States for Dynamic Modules
  const [topInstMode, setTopInstMode] = useState<'alumnos'|'profesores'>('alumnos');
  const [stats, setStats] = useState<{topInstrumentos: {name: string, count: number}[], topEnsenanzas: {name: string, count: number}[]}>({ topInstrumentos: [], topEnsenanzas: [] });
  const [releases, setReleases] = useState<any[]>([]);

  const instrumentImages: Record<string, string> = {
    'Guitarra': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&q=80',
    'Piano': 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=500&q=80',
    'Flauta': 'https://images.unsplash.com/photo-1573871666457-fa274191c4d4?w=500&q=80',
    'Violín': 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=500&q=80',
    'Batería': 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=500&q=80',
    'Voz': 'https://images.unsplash.com/photo-1516280440502-65f6c8d1976a?w=500&q=80',
    'Bajo': 'https://images.unsplash.com/photo-1514649923863-ceaf75b770dd?w=500&q=80',
    'Ukelele': 'https://images.unsplash.com/photo-1556012018-50c5c0da73b9?w=500&q=80',
    'Saxofón': 'https://images.unsplash.com/photo-1573887034934-8c01b1a7d6bc?w=500&q=80',
  };

  const getInstrumentImage = (name: string) => {
    return instrumentImages[name] || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&q=80';
  };
  
  const supabase = createClient();

  useEffect(() => {
    // Fetch stats and new releases independently
    fetch('/api/public/stats').then(r => r.json()).then(data => setStats(data)).catch(console.error);
    fetch('/api/public/releases').then(r => r.json()).then(data => setReleases(data)).catch(console.error);

    let currentUser: any = null;

    const checkUserAndParams = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      currentUser = session?.user;

      if (!currentUser && searchParams.get('login') === 'true') {
        const timer = setTimeout(() => {
          setModalMode('login');
          setShowModal(true);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    };
    checkUserAndParams();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: unknown, session: { user: any } | null) => {
        setUser(session?.user || null);
        if (session?.user) {
          setShowModal(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [searchParams, supabase]);

  const openAuth = (mode: 'login'|'register') => {
    setModalMode(mode);
    setShowModal(true);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/meetings.space.created'
      }
    });
  };

  return (
    <main className={styles.main}>
      {showModal && (
        <AuthModal 
          initialMode={modalMode} 
          onClose={() => setShowModal(false)} 
        />
      )}

      {/* HERO SECTION */}
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

      {/* TOP INSTRUMENTOS SECTION */}
      <section className={`${styles.section} fade-in`} style={{ animationDelay: "0.2s" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 className={styles.sectionHeader} style={{ margin: 0 }}>
            {topInstMode === 'alumnos' ? 'Top ' : 'Top '}
            <span>{topInstMode === 'alumnos' ? 'Instrumentos' : 'Enseñanzas'}</span>
          </h2>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span 
              onClick={() => setTopInstMode('alumnos')}
              style={{ padding: '6px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', background: topInstMode === 'alumnos' ? '#f6339a' : 'transparent', color: topInstMode === 'alumnos' ? 'white' : 'rgba(255,255,255,0.6)' }}
            >
              Alumnos
            </span>
            <span 
              onClick={() => setTopInstMode('profesores')}
              style={{ padding: '6px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', background: topInstMode === 'profesores' ? '#00ffaa' : 'transparent', color: topInstMode === 'profesores' ? '#111' : 'rgba(255,255,255,0.6)' }}
            >
              Profesores
            </span>
          </div>
        </div>
        <div className={styles.carousel}>
          {(topInstMode === 'alumnos' ? (stats?.topInstrumentos ?? []) : (stats?.topEnsenanzas ?? [])).map((inst, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardImgContainer} style={{ overflow: 'hidden' }}>
                 <img src={getInstrumentImage(inst.name)} alt={inst.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>{inst.name}</h3>
                <p className={styles.cardSubtitle}>{inst.count} {topInstMode === 'alumnos' ? (inst.count === 1 ? 'persona' : 'personas') : (inst.count === 1 ? 'profesor' : 'profesores')}</p>
              </div>
            </div>
          ))}
          {(topInstMode === 'alumnos' ? (stats?.topInstrumentos ?? []) : (stats?.topEnsenanzas ?? [])).length === 0 && (
             <div style={{ color: '#888', fontStyle: 'italic', padding: '20px' }}>Ningún dato registrado aún.</div>
          )}
        </div>
      </section>

      {/* NUEVOS LANZAMIENTOS SECTION */}
      <section className={`${styles.section} fade-in`} style={{ animationDelay: "0.4s" }}>
        <h2 className={styles.sectionHeader}>Nuevos <span style={{ color: "var(--neon-pink)" }}>Lanzamientos</span></h2>
        <div className={styles.carousel}>
          {Array.isArray(releases) && releases.map((song, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardImgContainer} style={{ overflow: 'hidden' }}>
                 <img src={song.coverUrl} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '12px 0' }}>
                <h3 className={styles.cardTitle} style={{ fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                  {song.title}
                </h3>
                <p className={styles.cardSubtitle} style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
          {(!Array.isArray(releases) || releases.length === 0) && (
             <div style={{ color: '#888', fontStyle: 'italic', padding: '20px' }}>Buscando tendencias en YouTube Music...</div>
          )}
        </div>
      </section>

      {/* UNETE A NUESTRO EQUIPO (CTA) - SOLO PARA GUESTS */}
      {!user && (
      <section id="contacto" className={`${styles.ctaSection} fade-in`} style={{ animationDelay: "0.6s" }}>
        <div className={styles.ctaText}>
          <h2>Únete a Nuestro<br/>Equipo</h2>
          <p>Puedes unirte a <span className={styles.hlPink}>SmarTune</span> o simplemente añadiendo la información necesaria. Si ya tienes una cuenta en nuestro sitio web, simplemente haz clic en el botón <span className={styles.hlBlue} onClick={() => setCtaMode('login')}>Iniciar Sesión</span></p>
        </div>
        
        <div className={styles.ctaFormBox}>
          <div className={styles.ctaTabs}>
            <div className={`${styles.ctaTab} ${ctaMode === 'register' ? styles.active : ''}`} onClick={() => setCtaMode('register')}>Sign Up</div>
            <div className={`${styles.ctaTab} ${ctaMode === 'login' ? styles.active : ''}`} onClick={() => setCtaMode('login')}>Login</div>
          </div>
          
          <div className={styles.ctaAvatar}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7.07 18.28C7.5 17.38 10.12 16.5 12 16.5C13.88 16.5 16.51 17.38 16.93 18.28C15.57 19.36 13.86 20 12 20C10.14 20 8.43 19.36 7.07 18.28ZM18.36 16.83C16.93 15.09 13.46 14.5 12 14.5C10.54 14.5 7.07 15.09 5.64 16.83C4.62 15.49 4 13.82 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 13.82 19.38 15.49 18.36 16.83ZM12 6C10.06 6 8.5 7.56 8.5 9.5C8.5 11.44 10.06 13 12 13C13.94 13 15.5 11.44 15.5 9.5C15.5 7.56 13.94 6 12 6ZM12 11C11.17 11 10.5 10.33 10.5 9.5C10.5 8.67 11.17 8 12 8C12.83 8 13.5 8.67 13.5 9.5C13.5 10.33 12.83 11 12 11Z" fill="white"/>
            </svg>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '20px' }}>
             <button className={styles.ctaSubmitBtn} onClick={() => openAuth(ctaMode)} style={{ width: '100%', padding: '12px 10px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                {ctaMode === 'register' ? 'REGISTER' : 'LOGIN'}
             </button>
             <button onClick={signInWithGoogle} style={{ width: '100%', padding: '10px 10px', background: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                Continuar con Google
             </button>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>
            O completa tus datos para {ctaMode === 'register' ? 'registrarte' : 'iniciar sesión'}
          </p>
        </div>
      </section>
      )}

      {/* FOOTER (NOSOTROS) */}
      <footer id="nosotros" className={`${styles.footer} fade-in`} style={{ animationDelay: "0.8s" }}>
        <div className={styles.footerTop}>
           <div className={styles.footerLeft}>
             <h3>Nosotros</h3>
             <p>SmarTune is a website that has been created for over <span className={styles.hlPink}>5 year&apos;s</span> now and it is one of the most famous music player website&apos;s in the world. in this website you can listen, practice and learn songs tracking with Ebbinghaus algorithm. If you want no limitation you can try our <span className={styles.hlBlue}>premium pass&apos;s.</span></p>
           </div>
           
           <div className={styles.footerRight}>
             <div className={styles.footerLogo}>SmarTune</div>
             <div className={styles.socialIcons}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12C2 16.991 5.657 21.128 10.438 21.881V14.89H7.898V12H10.438V9.797C10.438 7.274 11.943 5.882 14.214 5.882C15.311 5.882 16.457 6.078 16.457 6.078V8.543H15.192C13.95 8.543 13.562 9.315 13.562 10.11V12H16.344L15.899 14.89H13.562V21.881C18.343 21.128 22 16.991 22 12C22 6.477 17.523 2 12 2Z"/></svg>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163C15.204 2.163 15.584 2.175 16.85 2.233C18.014 2.286 18.647 2.482 19.068 2.646C19.627 2.863 20.026 3.125 20.445 3.544C20.865 3.963 21.127 4.362 21.343 4.921C21.508 5.342 21.704 5.976 21.757 7.14C21.815 8.406 21.827 8.786 21.827 11.99V12.01C21.827 15.214 21.815 15.594 21.757 16.86C21.704 18.024 21.508 18.658 21.343 19.079C21.127 19.638 20.865 20.037 20.445 20.456C20.026 20.875 19.627 21.137 19.068 21.354C18.647 21.518 18.014 21.714 16.85 21.767C15.584 21.825 15.204 21.837 12 21.837H11.98C8.776 21.837 8.396 21.825 7.13 21.767C5.966 21.714 5.333 21.518 4.912 21.354C4.353 21.137 3.954 20.875 3.535 20.456C3.115 20.037 2.853 19.638 2.637 19.079C2.472 18.658 2.276 18.024 2.223 16.86C2.165 15.594 2.153 15.214 2.153 12.01V11.99C2.153 8.786 2.165 8.406 2.223 7.14C2.276 5.976 2.472 5.342 2.637 4.921C2.853 4.362 3.115 3.963 3.535 3.544C3.954 3.125 4.353 2.863 4.912 2.646C5.333 2.482 5.966 2.286 7.13 2.233C8.396 2.175 8.776 2.163 11.98 2.163H12ZM12 0C8.741 0 8.333 0.014 7.053 0.072C5.775 0.13 4.902 0.334 4.14 0.63C3.354 0.936 2.688 1.336 2.022 2.002C1.356 2.668 0.956 3.334 0.65 4.12C0.354 4.882 0.15 5.755 0.092 7.033C0.034 8.313 0.02 8.721 0.02 11.98C0.02 15.239 0.034 15.647 0.092 16.927C0.15 18.205 0.354 19.078 0.65 19.84C0.956 20.626 1.356 21.292 2.022 21.958C2.688 22.624 3.354 23.024 4.14 23.33C4.902 23.626 5.775 23.83 7.053 23.888C8.333 23.946 8.741 23.96 12 23.96C15.259 23.96 15.667 23.946 16.947 23.888C18.225 23.83 19.098 23.626 19.86 23.33C20.646 23.024 21.312 22.624 21.978 21.958C22.644 21.292 23.044 20.626 23.35 19.84C23.646 19.078 23.85 18.205 23.908 16.927C23.966 15.647 23.98 15.239 23.98 11.98C23.98 8.721 23.966 8.313 23.908 7.033C23.85 5.755 23.646 4.882 23.35 4.12C23.044 3.334 22.644 2.668 21.978 2.002C21.312 1.336 20.646 0.936 19.86 0.63C19.098 0.334 18.225 0.13 16.947 0.072C15.667 0.014 15.259 0 12 0ZM12 5.838C8.597 5.838 5.838 8.597 5.838 12C5.838 15.403 8.597 18.162 12 18.162C15.403 18.162 18.162 15.403 18.162 12C18.162 8.597 15.403 5.838 12 5.838ZM12 15.998C9.792 15.998 8.002 14.208 8.002 12C8.002 9.792 9.792 8.002 12 8.002C14.208 8.002 15.998 9.792 15.998 12C15.998 14.208 14.208 15.998 12 15.998ZM18.406 4.155C17.61 4.155 16.965 4.8 16.965 5.596C16.965 6.392 17.61 7.037 18.406 7.037C19.202 7.037 19.847 6.392 19.847 5.596C19.847 4.8 19.202 4.155 18.406 4.155Z"/></svg>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.5701C23.054 4.9651 22.076 5.2261 21.039 5.3521C22.106 4.7131 22.923 3.6991 23.308 2.4931C22.348 3.0631 21.282 3.4751 20.147 3.6981C19.231 2.7151 17.925 2.0911 16.48 2.0911C13.684 2.0911 11.417 4.3581 11.417 7.1551C11.417 7.5521 11.462 7.9401 11.549 8.3151C7.33096 8.1041 3.59396 6.0771 1.09696 2.9731C0.660965 3.7221 0.409965 4.5961 0.409965 5.5181C0.409965 7.2751 1.30396 8.8241 2.66096 9.7321C1.84196 9.7061 1.06696 9.4811 0.366965 9.0971C0.365965 9.1181 0.365965 9.1391 0.365965 9.1611C0.365965 11.614 2.11296 13.67 4.43096 14.135C4.00496 14.251 3.55696 14.312 3.09096 14.312C2.76396 14.312 2.44396 14.28 2.13396 14.221C2.77896 16.231 4.64696 17.694 6.86596 17.734C5.13196 19.092 2.94696 19.897 0.583965 19.897C0.174965 19.897 -0.231035 19.873 -0.633035 19.825C1.61396 21.265 4.31296 22.1 7.21496 22.1C16.632 22.1 21.782 14.295 21.782 7.5301C21.782 7.3081 21.777 7.0871 21.767 6.8671C22.767 6.1451 23.639 5.2341 24.322 4.1951L23.953 4.5701Z"/></svg>
             </div>
           </div>
        </div>
      </footer>

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#181818' }} />}>
      <HomeContent />
    </Suspense>
  );
}
