'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function AdsterraInterstitialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inicializar el tiempo del último anuncio si no existe
    if (!sessionStorage.getItem('adsterra-last-ad-time')) {
      sessionStorage.setItem('adsterra-last-ad-time', Date.now().toString());
    }

    const checkInterval = setInterval(() => {
      if (isOpen) return;

      const lastAdTime = Number(sessionStorage.getItem('adsterra-last-ad-time') || Date.now());
      const elapsed = Date.now() - lastAdTime;

      const delay = 120000; // Aumentado a 2 minutos (120,000 ms)

      if (elapsed >= delay) {
        setTimeLeft(5);
        setCanClose(false);
        setIsOpen(true);
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [pathname, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (timeLeft > 0) {
      const countdownInterval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdownInterval);
    } else {
      setCanClose(true);
    }
  }, [isOpen, timeLeft]);

  const directLinkUrl = 'https://www.effectivecpmnetwork.com/phk1ph6f?key=eb4d8fd22913b0ed673d6707ef8cbf84';

  const handleClose = () => {
    if (canClose) {
      sessionStorage.setItem('adsterra-last-ad-time', Date.now().toString());
      setIsOpen(false);
    }
  };

  const handleCtaClick = () => {
    window.open(directLinkUrl, '_blank', 'noopener,noreferrer');
    sessionStorage.setItem('adsterra-last-ad-time', Date.now().toString());
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              background: '#161616',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 24,
              padding: '36px 32px 32px',
              overflow: 'hidden',
            }}
          >
            {/* Subtle top accent line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 32,
                right: 32,
                height: 1,
                background: 'linear-gradient(90deg, transparent, var(--neon-pink, #f6339a), var(--neon-purple, #9810fa), transparent)',
                opacity: 0.4,
              }}
            />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--neon-pink, #f6339a)',
                    opacity: 0.6,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.12em',
                    color: 'rgba(255, 255, 255, 0.25)',
                  }}
                >
                  Contenido patrocinado
                </span>
              </div>

              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.2)', fontVariantNumeric: 'tabular-nums' }}>
                {!canClose ? (
                  <span>{timeLeft}s</span>
                ) : (
                  <button
                    onClick={handleClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255, 255, 255, 0.35)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.35)';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.4,
                  letterSpacing: '-0.02em',
                  marginBottom: 12,
                }}
              >
                Librería premium de loops y presets
              </h3>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.3)',
                  lineHeight: 1.6,
                }}
              >
                Accede gratis a recursos de producción cortesía de nuestro partner. Disponible por tiempo limitado.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleCtaClick}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#ffffff',
                  background: 'rgba(246, 51, 154, 0.12)',
                  border: '1px solid rgba(246, 51, 154, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(246, 51, 154, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(246, 51, 154, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(246, 51, 154, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(246, 51, 154, 0.2)';
                }}
              >
                <span style={{ color: 'var(--neon-pink, #f6339a)' }}>Acceder al contenido</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink, #f6339a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button
                onClick={handleClose}
                disabled={!canClose}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 500,
                  color: canClose ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                  background: 'transparent',
                  border: 'none',
                  cursor: canClose ? 'pointer' : 'not-allowed',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (canClose) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  if (canClose) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                {!canClose ? `Continuar en ${timeLeft}s` : 'No, gracias'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
