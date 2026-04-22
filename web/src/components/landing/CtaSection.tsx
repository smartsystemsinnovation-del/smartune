'use client';

import { useState } from "react";
import styles from "../../app/page.module.css";

interface CtaSectionProps {
  openAuth: (mode: 'login' | 'register') => void;
  signInWithGoogle: () => void;
}

export default function CtaSection({ openAuth, signInWithGoogle }: CtaSectionProps) {
  const [ctaMode, setCtaMode] = useState<'login'|'register'>('register');

  return (
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
  );
}
