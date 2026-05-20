'use client';

// Feed minimalista — tabs limpios, gaps reducidos, animaciones sutiles

import { useState, useEffect, useRef } from 'react';
import PostCard from './PostCard';
import { motion, Variants } from 'framer-motion';
import { getFeed } from '@/actions/socialActions';
import React from 'react';
import AdsterraSponsoredCard from '../AdsterraSponsoredCard';

const POSTS_PER_PAGE = 5;
const AD_EVERY = 5;

const tabs = ['Para ti', 'Amigos'] as const;
type Tab = typeof tabs[number];

/* ── Empty State Icon ── */
const EmptyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/10">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

/* ── Ad Slot Component ── */
function AdSlot({ index }: { index: number }) {
  return (
    <AdsterraSponsoredCard isFeed={true} />
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
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
  };

  return (
    <div className="w-full">

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative flex-1 py-2.5 text-[13px] font-semibold transition-all duration-200 rounded-lg"
            style={activeTab === tab ? {
              color: 'white',
              background: 'rgba(255,255,255,0.06)',
            } : { color: 'rgba(255,255,255,0.35)' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Lista de posts ── */}
      <motion.div
        className="flex flex-col gap-5 relative"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        key={activeTab}
      >
        {/* Overlay de carga */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex justify-center pt-16 rounded-2xl" style={{ background: 'rgba(24,24,24,0.6)', backdropFilter: 'blur(2px)' }}>
            <div className="w-6 h-6 rounded-full border-2 border-t-[var(--neon-pink)] border-white/10 animate-spin" />
          </div>
        )}

        {visiblePosts.length > 0 ? (
          visiblePosts.map((post, idx) => (
            <React.Fragment key={post.id}>
              <motion.div variants={itemVariants}>
                <PostCard post={post} currentUserId={currentUserId} currentUserAvatar={currentUserAvatar} />
              </motion.div>

              {/* Ad slot cada AD_EVERY posts */}
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
            className="flex flex-col items-center justify-center text-center py-20 border border-white/[0.04] rounded-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.02] flex items-center justify-center mb-3">
              <EmptyIcon />
            </div>
            <p className="text-[14px] text-white/30 font-medium mb-1">Nada por aquí aún</p>
            <p className="text-[12px] text-white/15">Sé el primero en compartir algo</p>
          </motion.div>
        )}
      </motion.div>

      {/* Spinner de carga infinita */}
      <div className="flex justify-center py-10 min-h-[60px]">
        {isLoadingMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded-full border-2 border-t-[var(--neon-pink)] border-white/10 animate-spin" />
            <span className="text-[11px] text-white/20 font-medium">Cargando…</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}