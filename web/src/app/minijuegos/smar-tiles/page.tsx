"use client";

import React, { useState, useEffect, useRef } from 'react';

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
}

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

             {/* Song Selection Modal */}
             {showModal && (
               <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                 <div className="bg-[#151515] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                   
                   <div className="flex justify-between items-center mb-6">
                     <div>
                       <h2 className="text-2xl font-black text-white flex items-center gap-2">
                         Tu Playlist <span className="text-[#f6339a]">MusiSwipe</span>
                       </h2>
                       <p className="text-white/40 text-sm mt-1">Elige una pista para jugar en Smar-Tiles</p>
                     </div>
                     <button 
                       onClick={() => setShowModal(false)}
                       className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                     >
                       ✕
                     </button>
                   </div>

                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     {loadingSongs ? (
                       <div className="h-40 flex items-center justify-center text-white/50">Cargando pistas...</div>
                     ) : likedSongs.length === 0 ? (
                       <div className="h-40 flex flex-col items-center justify-center text-center">
                         <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-white/30">🎵</div>
                         <p className="text-white/60 font-medium">Aún no tienes canciones favoritas.</p>
                         <p className="text-white/40 text-sm mt-1">Ve a Explorar y desliza algunas canciones en MusiSwipe.</p>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {likedSongs.map((song) => (
                           <button
                             key={song.id}
                             onClick={() => startGame(song)}
                             className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#f6339a]/50 hover:bg-white/[0.06] transition-all text-left group"
                           >
                             <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-lg object-cover shadow-md group-hover:scale-105 transition-transform" />
                             <div className="flex-1 min-w-0">
                               <p className="text-white font-bold text-sm truncate">{song.title}</p>
                               <p className="text-white/40 text-xs truncate">{song.artist}</p>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-[#f6339a]/10 text-[#f6339a] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               ▶
                             </div>
                           </button>
                         ))}
                       </div>
                     )}
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
