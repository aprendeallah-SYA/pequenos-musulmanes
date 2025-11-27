
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { playCoin, playError, playWin, playJump, playLevelUp } from '../services/audioService';

interface GameProps {
  onExit: () => void;
  addPoints?: (amount: number) => void;
}

// --- CONSTANTES ADAPTADAS DEL CÓDIGO PYTHON ---
const MAX_CONCENTRACION = 100;

type ObstacleType = 'Salto' | 'Deslizarse' | 'Desvio' | 'Susurro' | 'Coin';

interface ObstacleDef {
    name: string;
    type: ObstacleType;
    prob: number;
    emoji: string;
}

interface WaqtTheme {
    id: string; // Fajr, Dhuhr, etc
    themeName: string; // 'Sueño y Pereza'
    skyClass: string; // CSS gradient
    floorClass: string; // CSS color
    atmosphereEmoji: string;
    obstacles: ObstacleDef[];
}

const WAQT_TEMAS: WaqtTheme[] = [
    {
        id: 'Fajr',
        themeName: 'Sueño y Pereza',
        skyClass: 'from-indigo-900 via-purple-800 to-pink-500', // Amanecer
        floorClass: 'bg-blue-900',
        atmosphereEmoji: '💤',
        obstacles: [
            { name: 'Almohada Gigante', type: 'Deslizarse', prob: 0.35, emoji: '🛌' }, // Muro
            { name: 'Cama Bloqueadora', type: 'Salto', prob: 0.30, emoji: '🛏️' },      // Valla
            { name: 'Botón Snooze', type: 'Desvio', prob: 0.20, emoji: '⏰' },        // Muro
            { name: 'Susurro Pereza', type: 'Susurro', prob: 0.15, emoji: '😴' },      // Enemigo
        ]
    },
    {
        id: 'Dhuhr',
        themeName: 'Mundo Laboral',
        skyClass: 'from-sky-400 to-blue-200', // Día brillante
        floorClass: 'bg-gray-400', // Cemento/Oficina
        atmosphereEmoji: '☀️',
        obstacles: [
            { name: 'Pila de Papeles', type: 'Salto', prob: 0.40, emoji: '📑' },
            { name: 'Smartphone', type: 'Deslizarse', prob: 0.25, emoji: '📱' },
            { name: 'Colega', type: 'Desvio', prob: 0.20, emoji: '👔' },
            { name: 'Susurro Dinero', type: 'Susurro', prob: 0.15, emoji: '💸' },
        ]
    },
    {
        id: 'Maghrib',
        themeName: 'Tráfico y Prisas',
        skyClass: 'from-orange-500 via-red-500 to-purple-900', // Atardecer
        floorClass: 'bg-slate-700', // Asfalto
        atmosphereEmoji: '🌇',
        obstacles: [
            { name: 'Coche Acelerado', type: 'Desvio', prob: 0.35, emoji: '🚗' },
            { name: 'Luz Roja', type: 'Salto', prob: 0.30, emoji: '🚦' },
            { name: 'Masa Gente', type: 'Deslizarse', prob: 0.20, emoji: '👥' },
            { name: 'Susurro Enojo', type: 'Susurro', prob: 0.15, emoji: '😡' },
        ]
    },
    {
        id: 'Isha',
        themeName: 'Fatiga y Cansancio',
        skyClass: 'from-gray-900 to-black', // Noche cerrada
        floorClass: 'bg-indigo-950',
        atmosphereEmoji: '🌌',
        obstacles: [
            { name: 'Niebla Mental', type: 'Desvio', prob: 0.40, emoji: '☁️' },
            { name: 'Sombra Lenta', type: 'Deslizarse', prob: 0.25, emoji: '👻' },
            { name: 'Piedra Tropiezo', type: 'Salto', prob: 0.20, emoji: '🪨' },
            { name: 'Susurro Duda', type: 'Susurro', prob: 0.15, emoji: '❓' },
        ]
    }
];

interface Entity {
  id: number;
  lane: number; // -1, 0, 1
  z: number; // 0 to 100
  def: ObstacleDef; // Definición completa
  collected?: boolean;
}

export const GameObstacle: React.FC<GameProps> = ({ onExit, addPoints }) => {
  // --- STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [concentration, setConcentration] = useState(MAX_CONCENTRACION);
  const [currentWaqtIndex, setCurrentWaqtIndex] = useState(0);
  const [playerLane, setPlayerLane] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [message, setMessage] = useState("¡Mantén tu Concentración!");
  const [highScore, setHighScore] = useState(0);
  
  // State to force render on every frame
  const [, setTick] = useState(0);

  // Derived state for theme
  const currentTheme = WAQT_TEMAS[currentWaqtIndex];

  // --- REFS ---
  const gameState = useRef({
    speed: 0.6,
    distance: 0,
    entities: [] as Entity[],
    lastSpawnZ: 0,
    isJumping: false,
    playerLane: 0,
    score: 0,
    concentration: MAX_CONCENTRACION,
    waqtIndex: 0
  });

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // --- CONTROLS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerLane(prev => {
          const newLane = Math.max(-1, prev - 1);
          gameState.current.playerLane = newLane;
          return newLane;
        });
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerLane(prev => {
          const newLane = Math.min(1, prev + 1);
          gameState.current.playerLane = newLane;
          return newLane;
        });
      } else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        if (!gameState.current.isJumping) {
          triggerJump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  const triggerJump = () => {
    setIsJumping(true);
    gameState.current.isJumping = true;
    playJump();
    setTimeout(() => {
      setIsJumping(false);
      gameState.current.isJumping = false;
    }, 600);
  };

  // --- GAME LOOP ---
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setConcentration(MAX_CONCENTRACION);
    setCurrentWaqtIndex(0);
    setPlayerLane(0);
    setMessage(WAQT_TEMAS[0].themeName);
    
    gameState.current = {
      speed: 0.7,
      distance: 0,
      entities: [],
      lastSpawnZ: 0,
      isJumping: false,
      playerLane: 0,
      score: 0,
      concentration: MAX_CONCENTRACION,
      waqtIndex: 0
    };

    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const spawnEntity = () => {
    const lanes = [-1, 0, 1];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const theme = WAQT_TEMAS[gameState.current.waqtIndex];
    
    const rand = Math.random();
    
    // 20% Chance of Coin (Hasanat)
    if (rand < 0.2) {
         gameState.current.entities.push({
            id: performance.now(),
            lane,
            z: 0,
            def: { name: 'Hasanat', type: 'Coin', prob: 0, emoji: '🌟' }
         });
         return;
    }

    let selectedObstacle = theme.obstacles[0];
    const roll = Math.random(); // 0 to 1
    let cumulativeProb = 0;

    for (const obs of theme.obstacles) {
        cumulativeProb += obs.prob;
        if (roll <= cumulativeProb) {
            selectedObstacle = obs;
            break;
        }
    }

    gameState.current.entities.push({
      id: performance.now(),
      lane,
      z: 0,
      def: selectedObstacle
    });
  };

  const gameLoop = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    // CLAMP DELTA TIME (Max 100ms) to prevent huge jumps on tab switch
    const deltaTime = Math.min(time - lastTimeRef.current, 100); 
    lastTimeRef.current = time;

    // 1. Update Game State
    gameState.current.speed += 0.00005 * deltaTime; 
    // Cap Speed
    if (gameState.current.speed > 1.5) gameState.current.speed = 1.5;

    gameState.current.distance += gameState.current.speed;

    // WAQT PROGRESSION LOGIC (Every 500 distance units)
    const nextWaqtThreshold = (gameState.current.waqtIndex + 1) * 500;
    if (gameState.current.distance > nextWaqtThreshold && gameState.current.waqtIndex < WAQT_TEMAS.length - 1) {
        gameState.current.waqtIndex++;
        setCurrentWaqtIndex(gameState.current.waqtIndex);
        playLevelUp();
        gameState.current.concentration = Math.min(MAX_CONCENTRACION, gameState.current.concentration + 20);
        setConcentration(gameState.current.concentration);
    }

    // 2. Spawn
    if (gameState.current.distance - gameState.current.lastSpawnZ > 40) {
      spawnEntity();
      gameState.current.lastSpawnZ = gameState.current.distance;
    }

    // 3. Move & Collision
    const playerZ = 90;
    const collisionThreshold = 5;

    // Move entities
    for(const entity of gameState.current.entities) {
        entity.z += gameState.current.speed * (deltaTime / 10);
    }

    // Filter and check collisions (In-place filtering optimization could be done, but simple filter is ok for size)
    gameState.current.entities = gameState.current.entities.filter(entity => {
      if (entity.z > 110) return false; // Remove if passed

      const distZ = Math.abs(entity.z - playerZ);
      const sameLane = entity.lane === gameState.current.playerLane;

      if (distZ < collisionThreshold && sameLane && !entity.collected) {
        if (entity.def.type === 'Coin') {
          playCoin();
          entity.collected = true;
          gameState.current.score += 10;
          setScore(gameState.current.score);
          gameState.current.concentration = Math.min(MAX_CONCENTRACION, gameState.current.concentration + 5);
          setConcentration(gameState.current.concentration);
          return false; // Remove coin
        } else {
            // OBSTACLE HIT
            let avoided = false;

            if (entity.def.type === 'Salto' && gameState.current.isJumping) {
                avoided = true;
            }

            if (!avoided) {
                playError();
                entity.collected = true; 
                
                // Reduce Concentration
                const damage = 25;
                gameState.current.concentration -= damage;
                setConcentration(gameState.current.concentration);

                if (gameState.current.concentration <= 0) {
                    handleGameOver(`¡Te distrajiste con: ${entity.def.name}!`);
                    return false;
                }
                return true; 
            }
        }
      }
      return true;
    });

    // 4. Force Render
    setTick(t => t + 1);

    if (!gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const handleGameOver = (msg: string) => {
      setGameOver(true);
      setIsPlaying(false);
      setMessage(msg);
      if (gameState.current.score > highScore) setHighScore(gameState.current.score);
      if (addPoints) addPoints(Math.floor(gameState.current.score / 10));
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  // --- RENDER HELPERS ---
  const getPerspectiveStyle = (entity: Entity) => {
    const scale = 0.2 + (entity.z / 100) * 1.0;
    const top = 40 + (entity.z * 0.55); 
    const spread = 20 * (scale); 
    const left = 50 + (entity.lane * spread);

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-50%, -50%) scale(${scale})`,
      zIndex: Math.floor(entity.z)
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 font-sans select-none">
      
      {/* GAME CONTAINER */}
      <div className="relative w-full max-w-lg h-full md:h-[90vh] md:rounded-3xl overflow-hidden bg-gray-800 shadow-2xl border-4 border-white/20">
        
        {/* DYNAMIC SKY */}
        <div className={`absolute top-0 w-full h-[40%] bg-gradient-to-b ${currentTheme.skyClass} transition-colors duration-1000`}>
             <div className="absolute bottom-10 left-10 text-6xl opacity-30 animate-pulse">{currentTheme.atmosphereEmoji}</div>
             <div className="absolute top-10 right-10 text-6xl opacity-30 animate-pulse delay-700">{currentTheme.atmosphereEmoji}</div>
        </div>

        {/* HORIZON */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 text-8xl z-0 opacity-80 filter drop-shadow-lg">
            🕌
        </div>

        {/* DYNAMIC GROUND */}
        <div className={`absolute top-[40%] w-full h-[60%] ${currentTheme.floorClass} overflow-hidden transition-colors duration-1000`}>
             {/* ROAD */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gray-800/80" 
                  style={{ clipPath: 'polygon(45% 0, 55% 0, 100% 100%, 0% 100%)' }}>
                 <div className="absolute top-0 left-[33%] w-1 h-full bg-dashed-line opacity-30"></div>
                 <div className="absolute top-0 right-[33%] w-1 h-full bg-dashed-line opacity-30"></div>
             </div>
        </div>

        {/* ENTITIES */}
        {gameState.current.entities.map(entity => (
          <div
            key={entity.id}
            className={`absolute transition-transform duration-75 ease-linear flex flex-col items-center justify-end ${entity.collected && entity.def.type !== 'Coin' ? 'opacity-50 grayscale' : ''}`}
            style={getPerspectiveStyle(entity)}
          >
             {entity.def.type === 'Coin' ? (
                 <span className="text-4xl filter drop-shadow-[0_0_10px_gold] animate-spin">🌟</span>
             ) : (
                 <>
                    <span className="text-6xl filter drop-shadow-2xl">{entity.def.emoji}</span>
                    <span className="text-xs bg-black/50 text-white px-1 rounded whitespace-nowrap mt-1">{entity.def.name}</span>
                 </>
             )}
          </div>
        ))}

        {/* PLAYER */}
        <div 
           className={`absolute transition-all duration-100 ease-out z-50 flex flex-col items-center justify-end
             ${isJumping ? 'scale-110 -translate-y-16' : 'scale-100'}
           `}
           style={{
             top: '85%',
             left: `${50 + (playerLane * 25)}%`,
             transform: 'translate(-50%, -50%)',
             width: '80px',
             height: '80px'
           }}
        >
           {/* Visual Feedback for low concentration */}
           <div className="text-7xl filter drop-shadow-2xl relative">
              🏃🏽
              {concentration < 30 && <span className="absolute -top-4 left-0 text-2xl animate-ping">⚠️</span>}
           </div>
           <div className={`w-12 h-3 bg-black/30 rounded-full blur-sm transition-all ${isJumping ? 'scale-50 opacity-20 translate-y-12' : ''}`}></div>
        </div>

        {/* HUD */}
        <div className="absolute top-0 w-full p-4 z-50 flex flex-col gap-2">
            <div className="flex justify-between items-start text-white font-bold drop-shadow-md">
                {/* Score */}
                <div className="bg-black/40 px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                    <Trophy className="text-yellow-400" size={20} /> {score}
                </div>
                
                {/* Current Waqt */}
                <div className="flex flex-col items-end">
                    <div className="text-xl">{currentTheme.id}</div>
                    <div className="text-xs opacity-80">{currentTheme.themeName}</div>
                </div>
            </div>

            {/* Concentration Bar */}
            <div className="w-full max-w-xs mx-auto">
                <div className="flex justify-between text-white text-xs mb-1 font-bold">
                    <span>Concentración (Khushu)</span>
                    <span className={concentration < 30 ? 'text-red-400 animate-pulse' : 'text-green-400'}>{Math.round(concentration)}%</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full border border-gray-500 overflow-hidden relative">
                    <div 
                        className={`h-full transition-all duration-300 ${concentration < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${concentration}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* OVERLAYS */}
        {!isPlaying && !gameOver && (
           <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-50 p-6 text-center animate-fade-in">
              <h1 className="text-3xl font-bold text-yellow-300 mb-2">Camino a la Mezquita</h1>
              <p className="mb-6 opacity-80">Evita las distracciones de cada oración.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-white/10 p-4 rounded-xl text-sm">
                 <div className="flex items-center gap-2"><span className="text-xl">🛏️</span> <b>Salto:</b> Saltar</div>
                 <div className="flex items-center gap-2"><span className="text-xl">🛌</span> <b>Deslizarse:</b> Esquivar</div>
                 <div className="flex items-center gap-2"><span className="text-xl">🚗</span> <b>Desvío:</b> Esquivar</div>
                 <div className="flex items-center gap-2"><span className="text-xl">👻</span> <b>Susurro:</b> Esquivar</div>
              </div>

              <button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-3 px-10 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                 <RefreshCw /> ¡Empezar el Día!
              </button>
           </div>
        )}

        {gameOver && (
           <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-50 p-6 text-center animate-bounce-in">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">{message}</h2>
              <p className="text-lg mb-6">Perdiste tu concentración.</p>
              <p className="text-xl mb-6">Puntuación: <span className="text-yellow-300 font-bold">{score}</span></p>
              
              <button onClick={startGame} className="bg-yellow-500 hover:bg-yellow-600 text-black text-xl font-bold py-3 px-8 rounded-full shadow-lg mb-4 w-full max-w-xs">
                 Reintentar
              </button>
              <button onClick={onExit} className="text-gray-400 hover:text-white underline">
                 Volver al Menú
              </button>
           </div>
        )}

        {/* MOBILE CONTROLS */}
        <div className="absolute bottom-4 w-full px-4 flex justify-between md:hidden z-40 pointer-events-none">
            <button 
                className="pointer-events-auto w-20 h-20 bg-white/20 backdrop-blur rounded-full border border-white/40 flex items-center justify-center active:bg-white/40"
                onTouchStart={(e) => { e.preventDefault(); setPlayerLane(l => Math.max(-1, l - 1)); }}
            >
                ⬅️
            </button>
            <button 
                className="pointer-events-auto w-20 h-20 bg-green-500/50 backdrop-blur rounded-full border border-green-300/40 flex items-center justify-center active:bg-green-500/70"
                onTouchStart={(e) => { e.preventDefault(); if(!isJumping) triggerJump(); }}
            >
                ⬆️
            </button>
            <button 
                className="pointer-events-auto w-20 h-20 bg-white/20 backdrop-blur rounded-full border border-white/40 flex items-center justify-center active:bg-white/40"
                onTouchStart={(e) => { e.preventDefault(); setPlayerLane(l => Math.min(1, l + 1)); }}
            >
                ➡️
            </button>
        </div>
      </div>
      
      <style>{`
        .bg-dashed-line {
            background-image: linear-gradient(to bottom, transparent 50%, white 50%);
            background-size: 100% 40px;
        }
      `}</style>
    </div>
  );
};