"use client";

import React, { useState, useEffect, useRef } from 'react';
import AuthGatekeeper from '@/components/AuthGatekeeper';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import styles from './page.module.css';

interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
}

/** Decode HTML entities from YouTube titles */
function decodeHtml(html: string): string {
  if (typeof document === 'undefined') return html;
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export default function MusicSwipePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(undefined);
  const [counts, setCounts] = useState({ likes: 0, views: 0, discards: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [swipeAnim, setSwipeAnim] = useState<'left' | 'right' | null>(null);
  
  const playerRef = useRef<any>(null);
  const supabase = createClient();

  // Load YouTube IFrame API
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        console.log("YouTube API Ready");
      };
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        fetchSongs();
        updateCounts();
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const fetchSongs = async (genre?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = genre ? `/api/songs?genre=${genre}` : '/api/songs';
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else if (Array.isArray(data)) {
        setSongs(data);
        setCurrentIndex(0);
      }
    } catch (err: any) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (genre: string) => {
    const newGenre = selectedGenre === genre ? '' : genre;
    setSelectedGenre(newGenre);
    fetchSongs(newGenre);
  };

  const updateCounts = async () => {
    try {
      const res = await fetch('/api/swipe', { method: 'PATCH' });
      const data = await res.json();
      if (data && !data.error) {
        setCounts(data);
      }
    } catch (e) {
      console.error("Error updating counts:", e);
    }
  };

  const handleSwipe = async (action: 'like' | 'discard') => {
    const currentSong = songs[currentIndex];
    if (!currentSong) return;

    setSwipeAnim(action === 'like' ? 'right' : 'left');

    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song: currentSong, action })
      });
      const data = await res.json();
      if (data && data.counts) {
        setCounts(data.counts);
      }
    } catch (e) {
      console.error("Error updating counts on swipe:", e);
    }

    if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
      try {
        playerRef.current.stopVideo();
      } catch (e) {
        console.warn("YouTube Player error on stop:", e);
      }
    }
    setIsPlaying(false);

    setTimeout(() => {
      setSwipeAnim(null);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (nextIndex >= songs.length - 3) {
        fetchMoreSongs();
      }
    }, 300);
  };

  const fetchMoreSongs = async () => {
    try {
      const url = selectedGenre ? `/api/songs?genre=${selectedGenre}` : '/api/songs';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSongs(prev => {
          const newSongs = data.filter(s => !prev.find(p => p.id === s.id));
          return [...prev, ...newSongs];
        });
      }
    } catch (e) {}
  };

  // YouTube Player Logic
  useEffect(() => {
    const song = songs[currentIndex];
    let timeoutId: any = null;

    if (song && (window as any).YT && (window as any).YT.Player) {
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById(song.id);
          playerRef.current.playVideo();
        } catch (e) {
          console.error("YouTube Player load error:", e);
        }
      } else {
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: song.id,
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onReady: (event: any) => {
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                if (timeoutId) clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                  try {
                    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function' && playerRef.current.getPlayerState() === (window as any).YT.PlayerState.PLAYING) {
                      playerRef.current.pauseVideo();
                      setIsPlaying(false);
                    }
                  } catch (e) {}
                }, 8000);
              } else if (event.data === (window as any).YT.PlayerState.PAUSED || event.data === (window as any).YT.PlayerState.ENDED) {
                setIsPlaying(false);
              }
            }
          }
        });
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentIndex, songs.length]); 

  const togglePlay = () => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    if (state === (window as any).YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  if (user === undefined) {
    return (
      <div className={styles.loaderWrap}>
        <div className={styles.loader} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '40px 0' }}>
        <AuthGatekeeper 
          iconNode={
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--neon-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          }
          titlePath1="Inicia sesión para usar"
          titleHighlight="MusicSwipe"
          subtitle="Descubre nueva música con el poder de YouTube Music. Guarda tus favoritas en tu perfil personalizado."
          cardTitle="¿Qué puedes hacer?"
          benefits={[
            { text: "Descubre canciones por energía y ritmo" },
            { text: "Guarda tus favoritas al instante" },
            { text: "Crea tu propia playlist de entrenamiento" }
          ]}
        />
      </div>
    );
  }

  const currentSong = songs[currentIndex];
  const genres = ['Pop', 'Phonk', 'Trap', 'Rock', 'R&B'];

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            Music<span>Swipe</span>
          </h1>
          <p className={styles.subtitle}>Descubre · Escucha · Guarda</p>
        </div>
        <Link href="/favoritos/playlist" className={styles.playlistBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
          Mi Playlist
        </Link>
      </header>

      {/* Genre Pills */}
      <div className={styles.genreRow}>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreChange(genre)}
            className={`${styles.genrePill} ${selectedGenre === genre ? styles.genreActive : ''}`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* YouTube Hidden Player */}
      <div id="youtube-player" className={styles.hidden} />

      {/* Main Card Area */}
      <div className={styles.cardArea}>
        {loading ? (
          <div className={styles.emptyCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.loader} />
          </div>
        ) : error ? (
          <div className={styles.errorCard}>
            <span className={styles.errorIcon}>⚠</span>
            <p className={styles.errorText}>{error}</p>
            <button onClick={() => fetchSongs()} className={styles.retryBtn}>
              Reintentar
            </button>
          </div>
        ) : currentSong ? (
          <div
            className={`${styles.card} ${swipeAnim === 'left' ? styles.swipeLeft : ''} ${swipeAnim === 'right' ? styles.swipeRight : ''}`}
          >
            {/* Cover */}
            <div className={styles.coverWrap}>
              <img src={currentSong.coverUrl} alt={currentSong.title} className={styles.coverImg} />
              <div className={styles.coverOverlay} />

              {/* Play Button */}
              <button onClick={togglePlay} className={styles.playBtn}>
                <div className={`${styles.playCircle} ${isPlaying ? styles.playing : ''}`}>
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Sound wave indicator */}
              {isPlaying && (
                <div className={styles.soundWave}>
                  <span /><span /><span /><span />
                </div>
              )}

              {/* Song Info on Cover */}
              <div className={styles.songInfo}>
                <h2 className={styles.songTitle}>{decodeHtml(currentSong.title)}</h2>
                <p className={styles.songArtist}>{decodeHtml(currentSong.artist)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                onClick={() => handleSwipe('discard')}
                className={styles.actionBtn}
                aria-label="Descartar"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <button
                onClick={() => handleSwipe('like')}
                className={`${styles.actionBtn} ${styles.likeBtn}`}
                aria-label="Me gusta"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>¡Todo explorado!</p>
            <p className={styles.emptySubtitle}>Vuelve a cargar para descubrir más música</p>
            <button onClick={() => fetchSongs()} className={styles.reloadBtn}>
              Cargar más
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue} style={{ color: 'var(--neon-pink)' }}>{counts?.likes ?? 0}</span>
          <span className={styles.statLabel}>Likes</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{counts?.views ?? 0}</span>
          <span className={styles.statLabel}>Vistas</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue} style={{ color: 'var(--text-secondary)' }}>{counts?.discards ?? 0}</span>
          <span className={styles.statLabel}>Pasadas</span>
        </div>
      </div>
    </div>
  );
}
