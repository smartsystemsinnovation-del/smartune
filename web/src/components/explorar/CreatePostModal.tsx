'use client';

import { useState } from 'react';
import CreatePost from './CreatePost';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreatePostModal({ avatarUrl }: { avatarUrl?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handlePostCreated = (post: any) => {
    setIsOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <>
      {/* ── Botón principal ── */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: 'linear-gradient(90deg, #f6339a 0%, #9810fa 100%)',
          boxShadow: '0px 12.5px 18.75px 0px rgba(246,51,154,0.3), 0px 5px 7.5px 0px rgba(246,51,154,0.3)',
          color: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '15px',
          padding: '12px 24px',
          borderRadius: '10px',
          width: '100%',
          border: 'none',
          cursor: 'pointer',
          marginTop: '20px',
          transition: 'filter 0.2s ease, transform 0.2s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
      >
        Publicar post
      </button>

      {/* ── Modal de publicación ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-[#111315]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[680px] z-[101]"
            >
              <div className="absolute -top-14 right-0">
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <CreatePost avatarUrl={avatarUrl} onPostCreated={handlePostCreated} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast de éxito ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed bottom-8 left-1/2 z-[200]"
            style={{ transform: 'translateX(-50%)' }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #1a1d23 0%, #1e2229 100%)',
                border: '1px solid rgba(246,51,154,0.3)',
                borderRadius: '20px',
                padding: '18px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(246,51,154,0.1), 0 8px 24px rgba(246,51,154,0.2)',
                minWidth: '320px',
              }}
            >
              {/* Icono check con gradiente */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f6339a, #9810fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 6px 16px rgba(246,51,154,0.4)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              {/* Texto */}
              <div>
                <p style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                  ¡Post publicado! 🎵
                </p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px' }}>
                  Tu publicación ya está en el feed
                </p>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => setShowToast(false)}
                style={{
                  marginLeft: 'auto',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.4)',
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Barra de progreso */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              style={{
                height: '3px',
                background: 'linear-gradient(90deg, #f6339a, #9810fa)',
                borderRadius: '0 0 20px 20px',
                marginTop: '-3px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
