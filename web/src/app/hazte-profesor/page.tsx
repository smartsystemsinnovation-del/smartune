import CertificationForm from '@/components/teacher/CertificationForm';
import InfoCards from '@/components/teacher/InfoCards';
import styles from './page.module.css';

export default function BecomeTeacherPage() {
  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <span>ACCOUNT</span>
        <span>{">"}</span>
        <span>BECOME A TEACHER</span>
        <span>{">"}</span>
        <span className={styles.breadcrumbActive}>CERTIFICATIONS</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <h1 className={styles.title}>Mis Certificaciones</h1>
          <p className={styles.subtitle}>
            Sube tus títulos, certificados o diplomas que avalen tu experiencia musical.
          </p>
          <CertificationForm />
        </div>

        <aside className={styles.sideColumn}>
          <InfoCards />
        </aside>
      </div>
    </div>
  );
}
