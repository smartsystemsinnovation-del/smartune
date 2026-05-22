"use client";

import React, { useState, useEffect, useRef } from 'react';
import { saveMinigameStat } from '@/actions/minigameActions';

// Constants
const LANES = 4;
const TILE_SPEED_START = 5;
const TILE_SPEED_ACCEL = 0.005;
const TILE_SPAWN_RATE = 400; // ms between spawns
const KEYS = ['a', 's', 'd', 'f'];

interface Tile {
  id: number;
  lane: number;
  y: number;
  hit: boolean;
  missed: boolean;
}

interface Song {
  id: string; // youtube_id
  title: string;
  artist: string;
  coverUrl: string;
  genre?: string;
}

const ALL_GENRES = ['Todas', 'Pop', 'Rock', 'Clásica', 'Jazz', 'Latino', 'Electrónica'];

export default function SmarTilesGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // MusiSwipe Integration State
  const [showModal, setShowModal] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todas');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const playerRef = useRef<any>(null);

  // Refs for Game Loop state to prevent constant re-renders breaking things
  const requestRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);
  const tilesRef = useRef<Tile[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize highest score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smartiles_highscore');
    if (saved) setHighScore(parseInt(saved, 10));

    // Load YouTube API
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = () => {
        console.log("YouTube API Ready in Smar-Tiles");
      };
    }
  }, []);

  const openSongSelection = async () => {
    setShowModal(true);
    setLoadingSongs(true);
    try {
      const res = await fetch('/api/swipe');
      if (res.ok) {
        const data = await res.json();
        setLikedSongs(data);
      }
    } catch (e) {
      console.error("Error fetching liked songs:", e);
    } finally {
      setLoadingSongs(false);
    }
  };

  const startGame = (song?: Song) => {
    if (song) {
      setSelectedSong(song);
      setShowModal(false);
      
      // Initialize or play YouTube player
      if ((window as any).YT && (window as any).YT.Player) {
        if (!playerRef.current) {
          playerRef.current = new (window as any).YT.Player('youtube-player-smartiles', {
            height: '0',
            width: '0',
            videoId: song.id,
            playerVars: { autoplay: 1, controls: 0, disablekb: 1 },
            events: {
              onReady: (e: any) => e.target.playVideo(),
              onStateChange: (e: any) => {
                 if (e.data === (window as any).YT.PlayerState.ENDED) {
                    endGame(); // Game over when song ends
                 }
              }
            }
          });
        } else {
          playerRef.current.loadVideoById(song.id);
          playerRef.current.playVideo();
        }
      }
    } else if (selectedSong && playerRef.current) {
       // Playing again with same song
       playerRef.current.seekTo(0);
       playerRef.current.playVideo();
    }

    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setSpeedMultiplier(1);
    tilesRef.current = [];
    lastSpawnTime.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    // Stop audio
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo();
    }
    
    // Guardar estadísticas en base de datos
    saveMinigameStat("smar-tiles", score, null, null);

    // Check Top Score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('smartiles_highscore', score.toString());
    }
  };

  const gameLoop = (time: number) => {
    if (!containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight;

    // 1. Spawn logic
    if (time - lastSpawnTime.current > (TILE_SPAWN_RATE / speedMultiplier)) {
      const newTile: Tile = {
        id: time,
        lane: Math.floor(Math.random() * LANES),
        y: -100, // spawn offscreen
        hit: false,
        missed: false
      };
      tilesRef.current.push(newTile);
      lastSpawnTime.current = time;
    }

    // 2. Movement Logic
    let gameOverTriggered = false;
    
    tilesRef.current = tilesRef.current.map(tile => {
      if (tile.hit) return tile; // don't move hit tiles (they fade out instead)
      
      const nextY = tile.y + (TILE_SPEED_START * speedMultiplier);
      
      // If un-hit tile falls off screen
      if (nextY > containerHeight && !tile.hit && !tile.missed) {
        tile.missed = true;
        gameOverTriggered = true;
      }
      
      return { ...tile, y: nextY };
    }).filter(tile => tile.y < containerHeight + 150); // Clean up tiles way off screen

    // 3. React Engine Updates
    if (gameOverTriggered) {
      endGame();
    } else {
      // Force a fast re-render with the latest positions
      // Usually better handled with Canvas, but for DOM we force state carefully
      window.dispatchEvent(new Event('render-tiles'));
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  // State bridge for RequestAnimationFrame -> React DOM
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleRender = () => setTick(t => t + 1);
    window.addEventListener('render-tiles', handleRender);
    return () => {
      window.removeEventListener('render-tiles', handleRender);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Controls Setup (Mouse + Keyboard)
  const handleHit = (laneIndex: number) => {
    if (!isPlaying || isGameOver) return;
    
    // Find lowest unhit tile in this lane
    const targetTile = [...tilesRef.current]
      .filter(t => t.lane === laneIndex && !t.hit && !t.missed)
      .sort((a, b) => b.y - a.y)[0];

    // If there's a tile inside the "Hittable Area" (bottom 25% of screen)
    if (targetTile && containerRef.current) {
       const cH = containerRef.current.clientHeight;
       // Valid Hit zone: Bottom 30% of screen
       if (targetTile.y > cH * 0.70 && targetTile.y < cH) {
         // Valid Hit
         targetTile.hit = true;
         const newScore = score + 10;
         setScore(newScore);
         
         // Increase speed slightly
         setSpeedMultiplier(prev => prev + TILE_SPEED_ACCEL);
         return;
       }
    }
    
    // If clicked empty lane or wrong timing (Penalty could be added here, but Piano Tiles usually Game Overs)
    // For SmarTune, a misclick = Game Over
    endGame();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const laneIndex = KEYS.indexOf(key);
      if (laneIndex !== -1) {
        handleHit(laneIndex);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, score, speedMultiplier]);


  return (
    <div className="flex min-h-screen bg-[#111]">
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 flex items-center justify-center p-4 relative" style={{ background: '#0a0a0a' }}>
           {/* Game preview background */}
           <div className="absolute inset-0 z-0 overflow-hidden">
             <img 
               src={selectedSong ? selectedSong.coverUrl : "/smartiles-preview.png"} 
               alt="" 
               className="w-full h-full object-cover opacity-20 transition-all duration-1000" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]/40" />
           </div>

           {/* Hidden YouTube Player */}
           <div id="youtube-player-smartiles" className="hidden"></div>

           {/* Game Board Surface */}
           <div 
             ref={containerRef}
             className="relative z-10 w-full max-w-lg h-[80vh] bg-gray-900/90 border-2 border-pink-500/30 rounded-lg shadow-[0_0_50px_rgba(238,16,176,0.2)] overflow-hidden flex"
           >
             
             {/* Score Header UI */}
             <div className="absolute top-4 w-full text-center z-20 pointer-events-none">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 shadow-xl drop-shadow-[0_0_10px_rgba(238,16,176,0.8)]">
                  {score}
                </span>
             </div>

             {/* The 4 Lanes */}
             {Array.from({ length: LANES }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 border-r border-white/5 relative cursor-pointer active:bg-white/5 transition-colors"
                  onClick={() => handleHit(i)}
                  onTouchStart={(e) => { e.preventDefault(); handleHit(i); }}
                >
                  {/* Keyboard Hint at bottom */}
                  <div className="absolute bottom-4 w-full text-center pb-8 border-b-4 border-pink-500/0">
                     <span className="inline-block w-10 h-10 leading-10 border border-white/20 rounded-md text-white/50 font-bold uppercase pointer-events-none">
                       {KEYS[i]}
                     </span>
                  </div>

                  {/* Hit Zone Line */}
                  <div className="absolute bottom-[10%] w-full h-[20%] bg-gradient-to-t from-pink-500/10 to-transparent border-b-2 border-pink-500/50 pointer-events-none z-10"></div>
                </div>
             ))}

             {/* Falling Tiles Layer */}
             <div className="absolute inset-0 pointer-events-none">
               {tilesRef.current.map(tile => (
                 <div
                   key={tile.id}
                   className={`absolute w-1/4 px-1 transition-opacity duration-200 ${tile.hit ? 'opacity-0 scale-110' : 'opacity-100'} ${tile.missed ? 'bg-red-500 grayscale' : ''}`}
                   style={{
                     left: `${(tile.lane * 25)}%`,
                     top: `${tile.y}px`,
                     height: '140px', // Tile height
                   }}
                 >
                   <div className={`w-full h-full rounded-md shadow-lg ${tile.hit ? 'bg-white shadow-[0_0_30px_#fff]' : tile.missed ? 'bg-red-600' : 'bg-gradient-to-b from-cyan-500 to-pink-500 shadow-[0_0_15px_rgba(238,16,176,0.6)]'}`}></div>
                 </div>
               ))}
             </div>

             {/* Overlays (Start / Game Over) */}
             {!isPlaying && (
               <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-30 px-6">
                 {/* Logo */}
                 <div className="mb-3">
                   <span style={{
                     background: 'linear-gradient(90deg, #f6339a 0%, #9810fa 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     backgroundClip: 'text',
                     fontSize: '16px',
                     fontWeight: 700,
                     letterSpacing: '0.18em',
                     textTransform: 'uppercase',
                   }}>SmarTune</span>
                 </div>

                 <h1 className="text-5xl font-black text-white mb-2 tracking-tighter" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                   SMAR-TILES
                 </h1>

                 {isGameOver ? (
                   <>
                     <div className="mt-5 mb-7 text-center">
                       <p className="text-[#f6339a] font-bold text-2xl mb-2">¡Fin del juego!</p>
                       <p className="text-white/60 text-base">Puntuación: <span className="text-white font-black text-3xl">{score}</span></p>
                       {score > highScore && <p className="text-[#9810fa] text-xs font-bold mt-2 tracking-widest uppercase">¡Nuevo récord! 🎉</p>}
                     </div>
                     <button
                       onClick={openSongSelection}
                       className="flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] active:scale-95"
                       style={{
                         background: 'linear-gradient(90deg, #f6339a 0%, #9810fa 100%)',
                         color: '#ffffff',
                         padding: '13px 36px',
                         borderRadius: '12px',
                         fontSize: '15px',
                         fontWeight: 700,
                         letterSpacing: '0.05em',
                         boxShadow: '0 0 28px rgba(246,51,154,0.45)',
                         border: 'none',
                       }}
                     >
                       Elegir otra pista <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
                     </button>
                   </>
                 ) : (
                   <>
                     <p className="text-white/40 mt-4 mb-10 max-w-[300px] text-center text-[15px] leading-relaxed">
                       Toca las teclas con el mouse, o presiona{' '}
                       <strong className="text-white/70 font-bold">A S D F</strong>. ¡No falles ninguna!
                     </p>
                     <button
                       onClick={openSongSelection}
                       className="flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] active:scale-95"
                       style={{
                         background: 'linear-gradient(90deg, #f6339a 0%, #9810fa 100%)',
                         color: '#ffffff',
                         padding: '13px 36px',
                         borderRadius: '12px',
                         fontSize: '15px',
                         fontWeight: 700,
                         letterSpacing: '0.05em',
                         boxShadow: '0 0 28px rgba(246,51,154,0.45)',
                         border: 'none',
                       }}
                     >
                       Elegir pista <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
                     </button>
                   </>
                 )}

                 {highScore > 0 && (
                   <div className="mt-8 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                     <span className="text-white/30 text-[12px] uppercase tracking-widest">Récord </span>
                     <span className="text-white font-black text-lg">{highScore}</span>
                   </div>
                 )}
               </div>
             )}

              {/* ── Song Selection Modal ── */}
              {showModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
                  <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-2xl w-full max-w-[520px] max-h-[82vh] flex flex-col overflow-hidden shadow-2xl shadow-black/60">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between px-6 pt-5 pb-1">
                      <div>
                        <h2 className="text-lg font-semibold text-white tracking-tight leading-none">Elige tu canción</h2>
                        <p className="text-zinc-500 text-xs mt-1.5 font-normal">{likedSongs.length} pistas disponibles</p>
                      </div>
                      <button
                        onClick={() => { setShowModal(false); setSearchQuery(''); setSelectedGenre('Todas'); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200 -mt-0.5"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </div>

                    {/* ── Search Bar ── */}
                    <div className="px-6 pt-3 pb-1">
                      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] focus-within:border-[#f6339a]/20 transition-colors duration-300">
                        <svg className="shrink-0 text-zinc-600" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input
                          type="text"
                          placeholder="Buscar por nombre o artista..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-white text-[13px] placeholder:text-zinc-600 font-normal"
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white transition-colors text-xs">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Genre Tabs ── */}
                    <div className="px-6 pt-2 pb-3 flex gap-1 overflow-x-auto no-scrollbar">
                      {ALL_GENRES.map(genre => (
                        <button
                          key={genre}
                          onClick={() => setSelectedGenre(genre)}
                          className={`relative px-3 py-1.5 text-[11px] font-medium tracking-wide whitespace-nowrap transition-all duration-200 rounded-md ${
                            genre === selectedGenre
                              ? 'text-[#f6339a]'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {genre}
                          {genre === selectedGenre && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-[2px] rounded-full bg-[#f6339a]" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* ── Separator ── */}
                    <div className="h-px bg-white/[0.03] mx-5" />

                    {/* ── Song List ── */}
                    <div className="relative flex-1 min-h-0 overflow-hidden">
                      <div className="h-full overflow-y-auto no-scrollbar px-4 pt-2 pb-10">
                        {loadingSongs ? (
                          <div className="h-40 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full border-2 border-white/[0.06] border-t-[#f6339a] animate-spin" />
                          </div>
                        ) : (() => {
                          const decodeHTML = (str: string) => {
                            const txt = document.createElement('textarea');
                            txt.innerHTML = str;
                            return txt.value;
                          };
                          const q = searchQuery.toLowerCase().trim();
                          const filtered = likedSongs.filter(song => {
                            const matchGenre = selectedGenre === 'Todas' || (song.genre || '').toLowerCase() === selectedGenre.toLowerCase();
                            const matchSearch = !q || song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q);
                            return matchGenre && matchSearch;
                          });

                          if (likedSongs.length === 0) return (
                            <div className="h-44 flex flex-col items-center justify-center text-center gap-2">
                              <div className="w-11 h-11 rounded-full bg-white/[0.03] flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                              </div>
                              <p className="text-zinc-400 text-[13px] font-medium">Sin canciones favoritas</p>
                              <p className="text-zinc-600 text-[11px]">Desliza canciones en MusiSwipe primero</p>
                            </div>
                          );

                          if (filtered.length === 0) return (
                            <div className="h-44 flex flex-col items-center justify-center text-center gap-2">
                              <p className="text-zinc-400 text-[13px] font-medium">Sin resultados</p>
                              <p className="text-zinc-600 text-[11px]">Prueba con otro término</p>
                              <button
                                onClick={() => { setSearchQuery(''); setSelectedGenre('Todas'); }}
                                className="mt-1 text-[#f6339a] text-[12px] font-medium hover:underline bg-transparent border-none cursor-pointer"
                              >Limpiar filtros</button>
                            </div>
                          );

                          return (
                            <div className="flex flex-col gap-0.5">
                              {filtered.map(song => (
                                <button
                                  key={song.id}
                                  onClick={() => startGame(song)}
                                  className="group flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl bg-transparent hover:bg-white/[0.03] transition-all duration-200 cursor-pointer border-none font-[inherit]"
                                >
                                  {/* Cover with fallback */}
                                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white/[0.04] shrink-0">
                                    <img
                                      src={song.coverUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                                    />
                                    <div className="hidden absolute inset-0 flex items-center justify-center bg-white/[0.03]">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                                    </div>
                                  </div>

                                  {/* Song info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-white truncate leading-tight">{decodeHTML(song.title)}</p>
                                    <p className="text-[11px] text-zinc-500 truncate mt-0.5 leading-tight">{decodeHTML(song.artist)}{song.genre ? ` · ${song.genre}` : ''}</p>
                                  </div>

                                  {/* Play button */}
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f6339a] to-[#9810fa] flex items-center justify-center shrink-0 opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 shadow-lg shadow-[#f6339a]/10">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                                  </div>
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      {/* ── Bottom fade ── */}
                      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none z-10" />
                    </div>
                  </div>
                </div>
              )}
            </div>
         </div>
       </div>
     </div>
   );
}
