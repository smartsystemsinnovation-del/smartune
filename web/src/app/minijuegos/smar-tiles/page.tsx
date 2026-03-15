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

export default function SmarTilesGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Refs for Game Loop state to prevent constant re-renders breaking things
  const requestRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);
  const tilesRef = useRef<Tile[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize highest score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smartiles_highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const startGame = () => {
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
        <div className="flex-1 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
           {/* Dark Overlay over Background image */}
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>

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
               <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-30">
                 <h1 className="text-5xl font-black text-white mb-2 tracking-tighter" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                   SMAR-TILES
                 </h1>
                 
                 {isGameOver ? (
                   <>
                    <p className="text-pink-500 font-bold text-2xl mb-1">¡FIN DEL JUEGO!</p>
                    <p className="text-white text-lg mb-6">Puntuación: <span className="text-cyan-400 font-black">{score}</span></p>
                    <button 
                      onClick={startGame}
                      className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold text-white text-lg tracking-wide hover:scale-105 transition-transform shadow-[0_0_20px_rgba(238,16,176,0.5)]"
                    >
                      JUGAR OTRA VEZ
                    </button>
                   </>
                 ) : (
                   <>
                    <p className="text-gray-300 mb-8 max-w-xs text-center text-sm leading-relaxed">
                      Usa el mouse para tocar las teclas luminosas, o presiona las letras <strong className="text-white bg-white/10 px-1 rounded">A S D F</strong>. ¡No falles ninguna!
                    </p>
                    <button 
                      onClick={startGame}
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-white text-lg tracking-wide hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                    >
                      INICIAR JUEGO
                    </button>
                   </>
                 )}
                 
                 {highScore > 0 && (
                   <div className="mt-8 text-white/50 text-sm font-medium">
                     Récord Actual: <span className="text-white">{highScore}</span>
                   </div>
                 )}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
