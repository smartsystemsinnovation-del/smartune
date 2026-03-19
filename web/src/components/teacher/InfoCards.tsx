import { Info, Lightbulb, GraduationCap } from 'lucide-react';
import styles from '@/app/hazte-profesor/page.module.css';

export default function InfoCards() {
  return (
    <div className={styles.infoSidebar}>
      <div className={styles.infoCard}>
        <h3 className={styles.cardTitle}>
          <Info size={20} className={styles.bullet} />
          Requisitos del documento
        </h3>
        <ul className={styles.cardList}>
          <li>
            <span className={styles.bullet}>•</span>
            <span>Tamaño máximo de <span className={styles.strong}>10MB</span> por archivo.</span>
          </li>
          <li>
            <span className={styles.bullet}>•</span>
            <span>Solo formatos <span className={styles.strong}>PDF, JPG o PNG</span>.</span>
          </li>
          <li>
            <span className={styles.bullet}>•</span>
            <span>Asegúrate de que el texto sea <span className={styles.strong}>legible</span> y el documento esté vigente.</span>
          </li>
          <li>
            <li>
              <span className={styles.bullet}>•</span>
              <span>Incluye tu <span className={styles.strong}>identificación oficial</span> si el título no tiene foto.</span>
            </li>
          </li>
        </ul>
      </div>

      <div className={styles.infoCard}>
        <h3 className={styles.cardTitle}>
          <Lightbulb size={20} className={styles.bullet} />
          Consejo Profesional
        </h3>
        <p className={styles.cardList} style={{ display: 'block' }}>
          Los perfiles con certificaciones verificadas académicamente tienen un <span className={styles.strong} style={{color: '#ff007a'}}>40% más de probabilidad</span> de ser seleccionados por estudiantes premium.
        </p>
      </div>

      <div className={`${styles.infoCard} ${styles.hubCard}`}>
        <h3 className={styles.cardTitle}>
          <GraduationCap size={20} className={styles.bullet} />
          SMARTUNE TEACHER HUB
        </h3>
        <p className={styles.cardSubtitle} style={{ fontSize: '0.8rem', color: '#999ba1' }}>
          Únete a nuestra comunidad global de educadores musicales.
        </p>
      </div>
    </div>
  );
}
