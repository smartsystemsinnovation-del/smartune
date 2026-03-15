'use client';

import { useState } from 'react';
import AuthModal from './AuthModal';
import styles from './AuthGatekeeper.module.css';

interface Benefit {
  text: string;
}

interface AuthGatekeeperProps {
  iconNode?: React.ReactNode;
  titlePath1: string;
  titleHighlight: string;
  titlePath2?: string;
  subtitle: string;
  cardIcon?: React.ReactNode;
  cardTitle: string;
  benefits: Benefit[];
}

export default function AuthGatekeeper({
  iconNode,
  titlePath1,
  titleHighlight,
  titlePath2,
  subtitle,
  cardIcon,
  cardTitle,
  benefits
}: AuthGatekeeperProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setModalMode(mode);
    setShowModal(true);
  };

  return (
    <div className={`${styles.gatekeeperContainer} fade-in`}>
      {showModal && (
        <AuthModal 
          initialMode={modalMode} 
          onClose={() => setShowModal(false)} 
        />
      )}

      {iconNode && <div className={styles.iconWrapper}>{iconNode}</div>}

      <h2 className={styles.title}>
        {titlePath1} <span>{titleHighlight}</span> {titlePath2}
      </h2>

      <p className={styles.subtitle}>{subtitle}</p>

      <div className={styles.benefitsCard}>
        <div className={styles.cardHeader}>
          {cardIcon}
          <h3 className={styles.cardTitle}>{cardTitle}</h3>
        </div>
        <ul className={styles.benefitsList}>
          {benefits.map((b, i) => (
            <li key={i}>
              <span className={styles.bullet}>•</span>
              {b.text}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnRegister} onClick={() => openAuth('register')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Registrarse Gratis
        </button>
        <button className={styles.btnLogin} onClick={() => openAuth('login')}>
          Iniciar Sesión
        </button>
      </div>

      <p className={styles.loginHint}>
        ¿Ya tienes una cuenta? <span onClick={() => openAuth('login')}>Inicia sesión aquí</span>
      </p>
    </div>
  );
}
