'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { toggleFollow } from '@/actions/socialActions';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '@/components/explorar/PostCard';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=2e1e42&color=fff&bold=true&size=150&name=';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes_count: number;
}

interface ProfileData {
  id: string;
  nombre: string;
  avatar_url?: string;
  instrumento?: string;
  gustos_musicales?: string[];
  rol?: string;
}

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState('grid');
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const supabase = createClient();

  useEffect(() => {
    params.then(({ userId: uid }) => setUserId(uid));
  }, [params]);

  useEffect(() => {
    if (!userId) return;
    async function fetchProfile() {
      try {
        // Get auth user info
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setAuthUserId(authUser?.id || null);

        const { data: profileData } = await supabase
          .from('usuarios')
          .select('id, nombre, avatar_url, instrumento, gustos_musicales, rol')
          .eq('id', userId)
          .single();

        if (!profileData) {
          setLoading(false);
          return;
        }
        setProfile(profileData);

        // Fetch followers count
        const { count: fCount } = await supabase
          .from('seguidores')
          .select('*', { count: 'exact', head: true })
          .eq('seguido_id', userId);
        
        setFollowersCount(fCount || 0);

        // Check if authenticated user follows this profile
        if (authUser) {
          const { data: followDoc } = await supabase
            .from('seguidores')
            .select('id')
            .match({ seguidor_id: authUser.id, seguido_id: userId })
            .maybeSingle();
          
          setIsFollowing(!!followDoc);
        }

        // Fetch user's own posts
        const { data: postsData } = await supabase
          .from('vw_posts_with_details')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        const mappedPosts = (postsData || []).map((p: any) => ({
          ...p,
          rol: p.rol || profileData.rol
        }));
        setPosts(mappedPosts);

        // Fetch posts LIKED by this user
        const { data: likedIdsData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', userId);

        if (likedIdsData && likedIdsData.length > 0) {
          const likedIds = likedIdsData.map((l: { post_id: string }) => l.post_id);
          const { data: likedPostsData } = await supabase
            .from('vw_posts_with_details')
            .select('*')
            .in('id', likedIds)
            .order('created_at', { ascending: false });
          
          let finalLikedPosts = likedPostsData || [];
          if (finalLikedPosts.length > 0) {
            const authorIds = Array.from(new Set(finalLikedPosts.map((p: any) => p.user_id)));
            const { data: authors } = await supabase.from('usuarios').select('id, rol').in('id', authorIds);
            const roleMap = new Map(authors?.map((a: any) => [a.id, a.rol]) || []);
            finalLikedPosts = finalLikedPosts.map((p: any) => ({ ...p, rol: p.rol || roleMap.get(p.user_id) }));
          }
          
          setLikedPosts(finalLikedPosts);
        } else {
          setLikedPosts([]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId, supabase]);

  const handleFollowToggle = async () => {
    if (!authUserId || !userId) return;
    
    // Optimistic update
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    setFollowersCount(prev => newFollowingState ? prev + 1 : prev - 1);

    const res = await toggleFollow(userId, isFollowing);
    if (!res.success) {
      // Rollback on error
      setIsFollowing(isFollowing);
      setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1);
      alert('Error: ' + res.error);
    }
  };

  const avatarSrc = profile?.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(profile?.nombre || 'U')}`;
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);

  if (loading) {
    return (
      <div className="w-full flex-1 min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-[#f6339a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full flex-1 min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
        <p className="text-white/50 mb-4">Usuario no encontrado</p>
        <Link href="/explorar" className="text-[#f6339a] font-bold text-sm tracking-wide hover:underline">
          ← Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 min-h-screen bg-[#0a0a0a] text-white antialiased font-sans pb-20 flex flex-col items-center overflow-x-hidden">

      {/* --- Banner / Cover --- */}
      <div className="relative h-32 md:h-48 w-full bg-gradient-to-r from-[#1a0b2e] via-[#2d0a1f] to-[#120518] flex-shrink-0">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#f6339a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#0a0a0a]"></div>
      </div>

      <div className="w-full flex justify-center px-4 sm:px-6">
        <div className="w-full max-w-[700px] relative -mt-16 md:-mt-20 flex flex-col items-center">

          {/* --- Header / Info de Perfil --- */}
          <header className="flex flex-col items-center text-center w-full">

            {/* Avatar */}
            <div className="relative mb-4 group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#f6339a] via-[#9810fa] to-[#f6339a] rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-[#0a0a0a] p-1.5 rounded-full">
                <img
                  src={avatarSrc}
                  alt={profile.nombre}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-2 ring-white/10"
                />
              </div>
            </div>

            {/* Nombre y Rol */}
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
              {profile.nombre}
            </h1>
            <p className="text-sm font-medium text-white/50 mb-4">
              @{profile.nombre.toLowerCase().replace(/\s+/g, '')} • {profile.rol || 'Músico'}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-6 w-full max-w-sm">
              <div className="flex flex-col items-center">
                <span className="text-lg md:text-xl font-bold">{posts.length}</span>
                <span className="text-[11px] text-white/50 font-medium uppercase tracking-wider">Posts</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-lg md:text-xl font-bold">{followersCount}</span>
                <span className="text-[11px] text-white/50 font-medium uppercase tracking-wider">Seguidores</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-lg md:text-xl font-bold">{totalLikes}</span>
                <span className="text-[11px] text-white/50 font-medium uppercase tracking-wider">Me gusta</span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2 w-full max-w-sm mb-6">
              {authUserId !== userId && (
                <button
                  onClick={handleFollowToggle}
                  className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(246,51,154,0.1)] active:scale-95 ${
                    isFollowing 
                    ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20' 
                    : 'bg-gradient-to-r from-[#f6339a] to-[#9810fa] text-white hover:brightness-110'
                  }`}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              )}
            </div>

            {/* Bio / Etiquetas */}
            <div className="w-full flex flex-col items-center">
              {profile.instrumento && (
                <p className="text-sm text-white/80 mb-3 flex items-center gap-2">
                  <span className="text-[#f6339a]">🎸</span> {profile.instrumento}
                </p>
              )}
              {profile.gustos_musicales && (
                <div className="flex flex-wrap justify-center gap-2">
                  {profile.gustos_musicales.map(genre => (
                    <span key={genre} className="px-3 py-1 bg-[#1a1a1a] border border-white/5 rounded-full text-xs font-semibold text-white/70">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* --- Pestañas --- */}
          <div className="flex border-b border-white/10 mt-10 mb-2 w-full">
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex-1 py-4 flex justify-center items-center gap-2 border-b-2 transition-all ${activeTab === 'grid' ? 'border-[#f6339a] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex-1 py-4 flex justify-center items-center gap-2 border-b-2 transition-all ${activeTab === 'likes' ? 'border-[#f6339a] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>

          {/* --- Grid de Posts --- */}
          {(() => {
            const displayPosts = activeTab === 'grid' ? posts : likedPosts;
            if (displayPosts.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-24 text-white/30 w-full">
                  <div className="w-16 h-16 mb-4 rounded-full border-2 border-white/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">
                    {activeTab === 'grid' ? 'Aún no hay publicaciones' : 'No hay likes todavía'}
                  </p>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-3 gap-0.5 md:gap-1 w-full">
                {displayPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="group relative aspect-[3/4] md:aspect-square bg-[#1a1a1a] cursor-pointer overflow-hidden rounded"
                  >
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
                        style={{ background: 'linear-gradient(135deg, rgba(246,51,154,0.05), rgba(152,16,250,0.05))' }}>
                        <p className="text-[10px] md:text-sm font-medium text-white/80 line-clamp-4">
                          {post.content}
                        </p>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="flex items-center gap-1.5 text-white font-bold text-sm md:text-base transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {post.likes_count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* --- Modal del Post --- */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop con Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-zoom-out"
            />
            
            {/* Contenedor del Post */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[550px] max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Botón de cerrar para mobile */}
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <PostCard post={selectedPost} currentUserId={authUserId || ''} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}