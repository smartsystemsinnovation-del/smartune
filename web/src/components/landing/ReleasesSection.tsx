'use client';

import styles from "../../app/page.module.css";

interface ReleasesSectionProps {
  releases: any[];
}

export default function ReleasesSection({ releases }: ReleasesSectionProps) {
  return (
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
  );
}
