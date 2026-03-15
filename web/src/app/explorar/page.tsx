import Navigation from '@/components/Navigation';
import styles from './page.module.css';

export default function ExplorarPage() {
  const exploreCatalog = [
    { id: 101, title: 'Sonata Claro de Luna', artist: 'Beethoven', category: 'Clásica', color: 'rgba(152, 16, 250, ' },
    { id: 102, title: 'Riffs de Blues Nivel 1', artist: 'B.B. King', category: 'Blues', color: 'rgba(14, 158, 239, ' },
    { id: 103, title: 'Escalas Pentatónicas', artist: 'Técnica', category: 'Ejercicio', color: 'rgba(246, 51, 154, ' },
    { id: 104, title: 'Acordes de Jazz (2-5-1)', artist: 'Técnica', category: 'Jazz', color: 'rgba(14, 158, 239, ' },
    { id: 105, title: 'Nocturne Op.9 No.2', artist: 'Chopin', category: 'Clásica', color: 'rgba(152, 16, 250, ' },
    { id: 106, title: 'Fingerpicking Básico', artist: 'Acústica', category: 'Ejercicio', color: 'rgba(246, 51, 154, ' },
  ];

  return (
    <main className={styles.main}>
      <Navigation />
      
      <div className={styles.exploreContainer}>
        <div className={styles.headerArea}>
          <h1 className={styles.pageTitle}>
            Explora <span>Nueva Música</span>
          </h1>
          <p className={styles.subtitle}>
            Descubre partituras interactivas y ejercicios. (Próximamente conectaremos el buscador al catálogo de Supabase).
          </p>
        </div>

        <div className={styles.placeholderGrid}>
          {exploreCatalog.map(item => (
            <div key={item.id} className={styles.exploreCard}>
              <div 
                className={styles.cardCover} 
                style={{ background: `linear-gradient(135deg, ${item.color}0.2), ${item.color}0.6))` }} 
              >
                <div className={styles.categoryTag}>{item.category}</div>
              </div>
              <div className={styles.cardMeta}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardArtist}>{item.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
