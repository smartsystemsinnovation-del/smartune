'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function PracticaPage({ params }: { params: { id: string } }) {
  const [sessionScore, setSessionScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000"; 
  const songId = params.id;

  const finishPractice = async (score: number) => {
    setLoading(true);
    try {
      // Usar Supabase Edge Function invocada vía API local
      const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/ebbinghaus-scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          id_usuario: fakeUserId,
          id_cancion: songId,
          calidad_respuesta: score
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error syncing practice:", error);
      setResult({ error: "No se pudo sincronizar la progresión SRS." });
    }
    setLoading(false);
  };

  return (
    <main className={styles.main}>
      
      <div className={styles.practiceContainer}>
        {/* INTERFAZ DEL MINIJUEGO SIMULADA */}
        <div className={styles.gameArea}>
          <div className={styles.gameTitle}>
            Sesión de Práctica <span className={styles.songId}>#{songId}</span>
          </div>
          
          {!result ? (
             <div className={styles.playingState}>
               <div className={styles.visualizer}>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
               </div>
               <p>Reproduciendo partitura interactiva...</p>
               
               <div className={styles.gradingSection}>
                 <p className={styles.gradingTitle}>Simular Calificación de Desempeño (0 - 5)</p>
                 <div className={styles.scoreButtons}>
                   {[0, 1, 2, 3, 4, 5].map(score => (
                     <button 
                      key={score} 
                      className={`${styles.scoreBtn} ${sessionScore === score ? styles.activeScore : ''}`}
                      onClick={() => setSessionScore(score)}
                     >
                       {score}
                     </button>
                   ))}
                 </div>
                 <button 
                  className={styles.finishBtn} 
                  disabled={sessionScore === null || loading}
                  onClick={() => finishPractice(sessionScore!)}
                 >
                   {loading ? 'Sincronizando SRS...' : 'Terminar Sesión'}
                 </button>
               </div>
             </div>
          ) : (
            <div className={styles.resultState}>
               <div className={styles.successIcon}>✓</div>
               <h2>¡Práctica Sincronizada!</h2>
               <div className={styles.srsStats}>
                 <div className={styles.statBox}>
                   <span>Factor Facilidad</span>
                   <strong>{result.factor_facilidad?.toFixed(2)}</strong>
                 </div>
                 <div className={styles.statBox}>
                   <span>Intervalo</span>
                   <strong>{result.intervalo} días</strong>
                 </div>
               </div>
               <p className={styles.nextPractice}>
                 Próxima práctica: {new Date(result.next_practice).toLocaleDateString()}
               </p>
               <a href="/dashboard" className={styles.btnBack}>Volver al Dashboard</a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
