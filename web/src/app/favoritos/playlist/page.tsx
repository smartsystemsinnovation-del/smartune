"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface LikedSong {
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

export default function MyPlaylistPage() {
  const [playlist, setPlaylist] = useState<LikedSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await fetch('/api/swipe'); // GET returns liked songs
        const data = await res.json();
        setPlaylist(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, []);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Mi Playlist</h1>
            <p className={styles.subtitle}>Tus descubrimientos en YouTube</p>
          </div>
        </div>

        <Link href="/favoritos" className={styles.discoverBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          Descubrir más
        </Link>
      </header>

      {loading ? (
        <>
          <div className={styles.songCount}>Cargando...</div>
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        </>
      ) : playlist.length > 0 ? (
        <>
          <div className={styles.songCount}>{playlist.length} canciones guardadas</div>
          <div className={styles.grid}>
            {playlist.map((song, idx) => (
              <div
                key={song.id}
                className={styles.card}
                style={{ animationDelay: `${Math.min(idx * 50, 400)}ms` }}
              >
                <div className={styles.coverWrap}>
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={decodeHtml(song.title)}
                      className={styles.coverImg}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.coverFallback}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                      </svg>
                    </div>
                  )}
                  <div className={styles.playOverlay}>
                    <a
                      href={`https://www.youtube.com/watch?v=${song.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.playCircle}
                      onClick={e => e.stopPropagation()}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className={styles.songMeta}>
                  <span className={styles.songTitle}>{decodeHtml(song.title)}</span>
                  <span className={styles.songArtist}>{decodeHtml(song.artist)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>Tu playlist está vacía</p>
          <p className={styles.emptySubtitle}>
            Empieza a descubrir canciones en MusicSwipe y guárdalas aquí.
          </p>
          <Link href="/favoritos" className={styles.emptyBtn}>
            Explorar música
          </Link>
        </div>
      )}
    </div>
  );
}
