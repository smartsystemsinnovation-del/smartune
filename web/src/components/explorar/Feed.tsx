'use client';
import { useState, useEffect, useRef } from 'react';
import PostCard from './PostCard';
import { motion, Variants } from 'framer-motion';
import { getFeed } from '@/actions/socialActions';
 
const POSTS_PER_PAGE = 4;

const tabs = ['Recientes', 'Amigos', 'Populares'] as const;
type Tab = typeof tabs[number];
 
const EmptyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'rgba(255,255,255,0.12)' }}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);
 
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
  const [activeTab, setActiveTab] = useState<Tab>('Recientes');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Derived values -- use refs so scroll handler always sees latest
  const allPostsRef = useRef(allPosts);
  const visibleCountRef = useRef(visibleCount);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const isLoadingRef = useRef(isLoading);

  allPostsRef.current = allPosts;
  visibleCountRef.current = visibleCount;
  isLoadingMoreRef.current = isLoadingMore;
  isLoadingRef.current = isLoading;

  const visiblePosts = allPosts.slice(0, visibleCount);
  const hasMore = visibleCount < allPosts.length;

  // Re-fetch posts when the tab changes
  useEffect(() => {
    let isMounted = true;
    const fetchTabPosts = async () => {
      setIsLoading(true);
      setVisibleCount(POSTS_PER_PAGE); // Reset pagination on tab change
      const res = await getFeed(activeTab);
      if (isMounted && res.success && res.data) {
        setAllPosts(res.data);
      }
      if (isMounted) setIsLoading(false);
    };

    fetchTabPosts();
    return () => { isMounted = false; };
  }, [activeTab]);

  // Window scroll-based infinite scroll (stable: uses refs to avoid stale closures)
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMoreRef.current || isLoadingRef.current) return;
      const hasMoreNow = visibleCountRef.current < allPostsRef.current.length;
      if (!hasMoreNow) return;

      const scrolled = window.scrollY + window.innerHeight;
      const threshold = document.documentElement.scrollHeight - 300;

      if (scrolled >= threshold) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + POSTS_PER_PAGE);
          setIsLoadingMore(false);
        }, 700);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // ← Empty deps: uses refs so never goes stale

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 280, damping: 26 },
    },
  };

  return (
    <div className="w-full mb-24" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Header ── */}
      <div className="px-1 mb-10">
        {/* Title row */}
        <div className="flex items-baseline justify-between mb-16">
          <h1
            className="font-bold tracking-tight"
            style={{ fontSize: 22, color: '#e8e8e8', letterSpacing: '-0.5px' }}
          >
            Explorar
          </h1>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-3 p-1.5 rounded-xl"
          style={{ background: '#1f1f1f', width: 'fit-content' }}
        >
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative rounded-lg transition-colors duration-150"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 14px',
                color: activeTab === tab ? '#e8e8e8' : 'rgba(255,255,255,0.28)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: '#2c2c2c', zIndex: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed list ── */}
      <motion.div
        className="flex flex-col relative"
        style={{ gap: 8 }}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        key={activeTab}
      >
        {/* Tab-switch loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex justify-center items-start pt-10" style={{ background: 'rgba(24, 24, 24, 0.4)', backdropFilter: 'blur(4px)', borderRadius: 24 }}>
            <div className="w-8 h-8 rounded-full border-2 border-t-[#f6339a] border-white/10 animate-spin" />
          </div>
        )}
        
        {visiblePosts.length > 0 ? (
          visiblePosts.map(post => (
            <motion.div key={post.id} variants={itemVariants}>
              <PostCard post={post} currentUserId={currentUserId} />
            </motion.div>
          ))
        ) : (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center text-center py-20 rounded-2xl"
            style={{
              background: '#1f1f1f',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-2xl mb-4"
              style={{
                width: 56,
                height: 56,
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              <EmptyIcon />
            </div>
            <p
              className="font-semibold mb-1"
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}
            >
              Nada por aquí aún
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
              Sé el primero en compartir algo
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* ── Infinite Scroll Spinner (visible cuando hay más posts) ── */}
      <div ref={loaderRef} className="flex justify-center py-10 min-h-[80px]">
        {isLoadingMore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full border-2 border-t-[#f6339a] border-white/10 animate-spin" />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
              Cargando más...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
