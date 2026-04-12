'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=2e1e42&color=fff&bold=true&size=128&name=';

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

export default function PublicProfilePage({ params }: { params: { userId: string } }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('usuarios')
          .select('id, nombre, avatar_url, instrumento, gustos_musicales, rol')
          .eq('id', params.userId)
          .single();

        if (profileError || !profileData) {
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch user posts
        const { data: postsData } = await supabase
          .from('vw_posts_with_details')
          .select('*')
          .eq('user_id', params.userId)
          .order('created_at', { ascending: false });

        setPosts(postsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [params.userId, supabase]);

  const avatarSrc = profile?.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(profile?.nombre || 'U')}`;

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#181818', fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="flex justify-center items-center" style={{ height: '60vh' }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-[#f6339a] border-white/10 animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#181818', fontFamily: "'Space Grotesk', sans-serif" }}>
        <p className="text-white/40 text-lg font-semibold">Usuario no encontrado</p>
        <Link href="/explorar" className="mt-4 text-sm" style={{ color: '#f6339a' }}>
          ← Volver al Explorar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#181818', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-[540px] mx-auto px-4 pt-8 pb-24">

        {/* ─── Header del Perfil ─── */}
        <div className="flex items-center gap-4 mb-8 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Avatar */}
          <div
            className="flex-shrink-0 rounded-full p-[2px]"
            style={{
              background: 'linear-gradient(135deg, rgba(246,51,154,0.6), rgba(152,16,250,0.6))',
              width: 56,
              height: 56,
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden" style={{ background: '#1f1f1f' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarSrc} alt={profile.nombre} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="font-bold text-white leading-tight" style={{ fontSize: 17 }}>
              {profile.nombre}
            </p>
            {profile.instrumento && profile.instrumento !== 'Ninguno' && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                {profile.instrumento}
              </p>
            )}
            {profile.gustos_musicales && profile.gustos_musicales.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.gustos_musicales.slice(0, 3).map(genre => (
                  <span
                    key={genre}
                    className="rounded-full px-2 py-0.5"
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      background: 'rgba(246,51,154,0.10)',
                      color: '#f6339a',
                      border: '1px solid rgba(246,51,154,0.18)',
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Stats ─── */}
        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <p className="font-bold text-white" style={{ fontSize: 18 }}>{posts.length}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-white" style={{ fontSize: 18 }}>
              {posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Likes</p>
          </div>
        </div>

        {/* ─── Grid de Posts ─── */}
        {posts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl"
            style={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'rgba(255,255,255,0.12)' }}>
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <p className="mt-4 font-semibold" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              Aún no hay publicaciones
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[3px]">
            {posts.map(post => (
              <div
                key={post.id}
                className="relative cursor-pointer overflow-hidden"
                style={{ aspectRatio: '1 / 1', background: '#1f1f1f', borderRadius: 4 }}
                onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              >
                {post.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: expandedPost === post.id ? 'brightness(0.4)' : 'brightness(0.85)' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3">
                    {/* Gradient background for text posts */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, 
                          hsl(${((post.id.charCodeAt(0) * 37) % 360)}, 25%, 14%), 
                          hsl(${((post.id.charCodeAt(1) * 53) % 360)}, 30%, 10%))`,
                      }}
                    />
                    {expandedPost === post.id ? (
                      <p
                        className="relative z-10 text-center leading-snug"
                        style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}
                      >
                        {post.content}
                      </p>
                    ) : (
                      <svg className="relative z-10" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        <rect x="3" y="3" width="18" height="18" rx="4" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Hover overlay */}
                {expandedPost === post.id && post.image_url && (
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <p className="text-center text-white text-xs leading-snug line-clamp-4">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Likes overlay en esquina */}
                {post.likes_count > 0 && expandedPost !== post.id && (
                  <div
                    className="absolute bottom-1.5 left-1.5 flex items-center gap-1"
                    style={{ opacity: 0.7 }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#f6339a">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>{post.likes_count}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
