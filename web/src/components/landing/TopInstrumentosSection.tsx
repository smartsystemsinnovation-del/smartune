'use client';

import { useState } from "react";
import styles from "../../app/page.module.css";

interface TopInstrumentosSectionProps {
  stats: {
    topInstrumentos: {name: string, count: number}[];
    topEnsenanzas: {name: string, count: number}[];
  };
}

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

export default function TopInstrumentosSection({ stats }: TopInstrumentosSectionProps) {
  const [topInstMode, setTopInstMode] = useState<'alumnos'|'profesores'>('alumnos');

  const currentList = topInstMode === 'alumnos' ? stats.topInstrumentos : stats.topEnsenanzas;

  return (
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
        {currentList?.map((inst, index) => (
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
        {(!currentList || currentList.length === 0) && (
           <div style={{ color: '#888', fontStyle: 'italic', padding: '20px' }}>Ningún dato registrado aún.</div>
        )}
      </div>
    </section>
  );
}
