'use client';

// CAMBIOS:
// - Tabs "Para ti" / "Amigos" con línea indicadora al estilo X (Twitter) — más delgada y centrada
// - Cards uniformes: mismo gap entre todas las publicaciones (gap-0 + border-b interno)
// - Slot de anuncio Google AdSense insertado cada N posts (configurable con AD_EVERY)
// - Spinner de carga más minimalista
// - Estado vacío rediseñado

import { useState, useEffect, useRef } from 'react';
import PostCard from './PostCard';
import { motion, Variants } from 'framer-motion';
import { getFeed } from '@/actions/socialActions';

const POSTS_PER_PAGE = 5;
// CAMBIO: Insertar slot de anuncio cada 5 posts para monetización con Google AdSense
const AD_EVERY = 5;

const tabs = ['Para ti', 'Amigos'] as const;
type Tab = typeof tabs[number];

/* ── Empty State Icon ── */
const EmptyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

/* ── Ad Slot Component ── */
// CAMBIO: Componente reutilizable para slots de anuncio in-feed
// Para activar: reemplaza el contenido interior con tu script de AdSense nativo/in-feed
// Documentación AdSense in-feed: https://support.google.com/adsense/answer/7533986
function AdSlot({ index }: { index: number }) {
  return (
    <div
      id={`ad-slot-feed-${index}`}
      className="w-full bg-[#1a1d23] border border-white/[0.05] rounded-2xl min-h-[90px] flex items-center justify-center"
      aria-label="Espacio publicitario"
    >
      {/* INSERT GOOGLE ADSENSE IN-FEED SCRIPT HERE */}
      <span className="text-[10px] text-white/10 select-none uppercase tracking-widest">Publicidad</span>
    </div>
  );
}

export default function Feed({
  initialPosts,
  currentUserId,
  currentUserAvatar,
}: {
  initialPosts: any[];
  currentUserId: string;
  currentUserAvatar?: string;
}) {
  const [allPosts, setAllPosts] = useState(initialPosts);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [activeTab, setActiveTab] = useState<Tab>('Para ti');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refs para scroll estable
  const allPostsRef = useRef(allPosts);
  const visibleCountRef = useRef(visibleCount);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const isLoadingRef = useRef(isLoading);
  allPostsRef.current = allPosts;
  visibleCountRef.current = visibleCount;
  isLoadingMoreRef.current = isLoadingMore;
  isLoadingRef.current = isLoading;

  const visiblePosts = allPosts.slice(0, visibleCount);

  // Re-fetch al cambiar tab
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setIsLoading(true);
      setVisibleCount(POSTS_PER_PAGE);
      const backendTab = activeTab === 'Para ti' ? 'Recientes' : activeTab;
      const res = await getFeed(backendTab);
      if (mounted && res.success && res.data) setAllPosts(res.data);
      if (mounted) setIsLoading(false);
    };
    fetch();
    return () => { mounted = false; };
  }, [activeTab]);

  // Infinite scroll por window scroll
  useEffect(() => {
    const onScroll = () => {
      if (isLoadingMoreRef.current || isLoadingRef.current) return;
      if (visibleCountRef.current >= allPostsRef.current.length) return;
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 400) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(p => p + POSTS_PER_PAGE);
          setIsLoadingMore(false);
        }, 600);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  };

  return (
    <div className="w-full">

      <div className="flex border-b border-white/[0.06] mb-5">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative flex-1 py-3.5 text-[14px] font-bold transition-all duration-200"
            style={activeTab === tab ? {
              background: 'linear-gradient(90deg, #f6339a, #9810fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 8px rgba(246,51,154,0.45))'
            } : { color: 'rgba(255,255,255,0.3)' }}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="tabLine"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full"
                style={{ background: 'linear-gradient(90deg, #f6339a, #9810fa)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Lista de posts ── */}
      <motion.div
        className="flex flex-col gap-6 relative"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        key={activeTab}
      >
        {/* Overlay de carga al cambiar tab */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex justify-center pt-16 bg-[#111315]/60 backdrop-blur-[2px] rounded-2xl">
            <div className="w-7 h-7 rounded-full border-2 border-t-white/80 border-white/10 animate-spin" />
          </div>
        )}

        {visiblePosts.length > 0 ? (
          visiblePosts.map((post, idx) => (
            <React.Fragment key={post.id}>
              <motion.div variants={itemVariants}>
                <PostCard post={post} currentUserId={currentUserId} currentUserAvatar={currentUserAvatar} />
              </motion.div>

              {/* CAMBIO: Slot de anuncio in-feed cada AD_EVERY publicaciones */}
              {(idx + 1) % AD_EVERY === 0 && idx < visiblePosts.length - 1 && (
                <motion.div variants={itemVariants}>
                  <AdSlot index={idx} />
                </motion.div>
              )}
            </React.Fragment>
          ))
        ) : (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center text-center py-20 bg-[#1a1d23] border border-white/[0.05] rounded-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-3">
              <EmptyIcon />
            </div>
            <p className="text-[14px] text-white/30 font-semibold mb-1">Nada por aquí aún</p>
            <p className="text-[12px] text-white/15">Sé el primero en compartir algo</p>
          </motion.div>
        )}
      </motion.div>

      {/* ── Spinner de carga infinita ── */}
      <div className="flex justify-center py-10 min-h-[60px]">
        {isLoadingMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full border-2 border-t-white/70 border-white/10 animate-spin" />
            <span className="text-[12px] text-white/25 font-medium">Cargando más...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// CAMBIO: Importar React para usar Fragment en el map
import React from 'react';