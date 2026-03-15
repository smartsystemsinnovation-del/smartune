import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function MinijuegosPage() {
  return (
    <>
      <main className={styles.container}>
        <div className={styles.content}>
          
          <div className={styles.header}>
            <h1 className={styles.title}>SmarTune Arcade</h1>
            <p className={styles.subtitle}>Entrena tu ritmo, oído y agilidad con nuestros minijuegos interactivos.</p>
          </div>

          <div className={styles.grid}>
            
            {/* Game Card 1: Smar-Tiles */}
            <Link href="/minijuegos/smar-tiles" className={styles.card}>
              <div className={styles.cardImage}>
                <div className={styles.fauxPreview}>
                   <div className={styles.fauxCol}><div className={`${styles.fauxTile} ${styles.pink}`}></div></div>
                   <div className={styles.fauxCol}><div className={`${styles.fauxTile} ${styles.cyan}`}></div></div>
                   <div className={styles.fauxCol}><div className={`${styles.fauxTile} ${styles.purple}`}></div></div>
                   <div className={styles.fauxCol}><div className={`${styles.fauxTile} ${styles.pink}`} style={{marginBottom: '20px'}}></div></div>
                </div>
                <div className={styles.gradientOverlay}></div>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h2>Smar-Tiles</h2>
                  <span className={styles.badge}>NUEVO</span>
                </div>
                <p>
                  Pon a prueba tu agilidad y ritmo tocando las notas correctas al compás de la música. ¡No dejes que se escapen!
                </p>
                
                <div className={styles.playNow}>
                  JUGAR AHORA 
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </Link>
            
            {/* Placeholder Card 2 */}
            <div className={`${styles.card} ${styles.disabled}`}>
              <div className={styles.cardImage}>
                 <div className={styles.placeholderImage}>
                   <svg width="48" height="48" style={{color: 'rgba(255,255,255,0.2)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                 </div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h2 style={{color: 'rgba(255,255,255,0.5)'}}>Perfect Pitch</h2>
                </div>
                <p style={{color: 'rgba(255,255,255,0.4)'}}>Entrenamiento auditivo avanzado. Adivina la nota exacta con solo escucharla.</p>
                <span className={styles.comingSoon}>Próximamente</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
