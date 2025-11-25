import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, ArrowLeft, ArrowRight, Play } from 'lucide-react';

interface LevelData {
  id: number;
  title: string;
  bgGradient: string;
  speed: number;
}

const LEVELS: LevelData[] = [
  { id: 1, title: "Nivel 1: El Despertar", bgGradient: "from-indigo-900 to-blue-800", speed: 0.8 },
  { id: 2, title: "Nivel 2: Wudu Limpio", bgGradient: "from-blue-400 to-cyan-300", speed: 1.0 },
  { id: 3, title: "Nivel 3: Buenas Palabras", bgGradient: "from-purple-400 to-pink-400", speed: 1.2 },
  { id: 4, title: "Nivel 4: Paciencia en el Camino", bgGradient: "from-gray-500 to-gray-700", speed: 1.4 },
  { id: 5, title: "Nivel 5: Llegada a la Mezquita", bgGradient: "from-emerald-500 to-green-700", speed: 1.6 },
];

interface GameItem {
  id: number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  type: 'good' | 'bad';
  icon: string;
  label: string;
}

const GOOD_ITEMS = [
  { icon: '📖', label: 'Corán' },
  { icon: '💧', label: 'Wudu' },
  { icon: '📿', label: 'Dhikr' },
  { icon: '🤲', label: 'Dua' },
  { icon: '❤️', label: 'Amor' },
];

const BAD_ITEMS = [
  { icon: '😈', label: 'Shaitan' },
  { icon: '📺', label: 'Distracción' },
  { icon: '😡', label: 'Ira' },
  { icon: '💤', label: 'Pereza' },
  { icon: '🗣️', label: 'Chisme' },
];

interface GameProps {
  onExit: () => void;
  addPoints?: (amount: number) => void;
}

export const GameObstacle: React.FC<GameProps> = ({ onExit, addPoints }) => {
  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [levelIdx, setLevelIdx] = useState(0);
  const [iman, setIman] = useState(100);
  const [distance, setDistance] = useState(0);
  const [message, setMessage] = useState("¡Usa las flechas para moverte!");
  const [items, setItems] = useState<GameItem[]>([]);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 80 });

  // Refs for Game Loop Logic (To avoid stale closures)
  const playerPosRef = useRef(playerPos);
  const gameStateRef = useRef({ isPlaying, gameOver, showLevelComplete, levelIdx, iman });
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const spawnTimerRef = useRef<number>(0);
  const levelRewardGiven = useRef<boolean>(false);

  // Constants
  const PLAYER_SIZE = 8;
  const ITEM_SIZE = 8;
  const currentLevel = LEVELS[levelIdx];

  // Sync State to Refs
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  useEffect(() => {
    gameStateRef.current = { isPlaying, gameOver, showLevelComplete, levelIdx, iman };
  }, [isPlaying, gameOver, showLevelComplete, levelIdx, iman]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStateRef.current.isPlaying || gameStateRef.current.showLevelComplete) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      const speed = 7;
      setPlayerPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        if (e.key === 'ArrowLeft') newX = Math.max(5, prev.x - speed);
        if (e.key === 'ArrowRight') newX = Math.min(95, prev.x + speed);
        if (e.key === 'ArrowUp') newY = Math.max(10, prev.y - speed);
        if (e.key === 'ArrowDown') newY = Math.min(90, prev.y + speed);
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Game Logic Function
  const updateGame = useCallback((deltaTime: number) => {
    const state = gameStateRef.current;
    if (!state.isPlaying || state.gameOver || state.showLevelComplete) return;

    const level = LEVELS[state.levelIdx];

    // 1. Advance Distance
    setDistance(prev => {
      const newDist = prev + (0.03 * level.speed);
      if (newDist >= 100) {
        setShowLevelComplete(true);
        if (!levelRewardGiven.current) {
            levelRewardGiven.current = true;
            if (addPoints) addPoints(30);
        }
        return 100;
      }
      return newDist;
    });

    // 2. Spawn Items
    spawnTimerRef.current += deltaTime;
    if (spawnTimerRef.current > 1200 / level.speed) {
      spawnTimerRef.current = 0;
      spawnItem();
    }

    // 3. Move Items & Check Collisions
    setItems(prevItems => {
      const nextItems: GameItem[] = [];
      let collisionDetected = false;
      let collisionItem: GameItem | null = null;

      prevItems.forEach(item => {
        const newY = item.y + (0.5 * level.speed); // Move item down
        
        // Collision Check using REF for player position (latest)
        const p = playerPosRef.current;
        const dx = Math.abs(p.x - item.x);
        const dy = Math.abs(p.y - newY);

        if (dx < (PLAYER_SIZE + ITEM_SIZE) / 1.5 && dy < (PLAYER_SIZE + ITEM_SIZE) / 1.5) {
          collisionDetected = true;
          collisionItem = item;
        } else if (newY < 120) {
           nextItems.push({ ...item, y: newY });
        }
      });

      if (collisionDetected && collisionItem) {
          handleCollisionEffect(collisionItem);
      }

      return nextItems;
    });
  }, [addPoints]);

  const handleCollisionEffect = (item: GameItem) => {
      if (item.type === 'good') {
          setMessage(`¡Bien! ${item.label}`);
          setIman(prev => Math.min(100, prev + 5));
      } else {
          setMessage(`¡Mal! ${item.label}`);
          setIman(prev => {
              const newIman = prev - 15;
              if (newIman <= 0) setGameOver(true);
              return newIman;
          });
      }
  };

  const spawnItem = () => {
    const isGood = Math.random() > 0.4;
    const template = isGood 
      ? GOOD_ITEMS[Math.floor(Math.random() * GOOD_ITEMS.length)]
      : BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)];

    setItems(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        y: -10,
        type: isGood ? 'good' : 'bad',
        icon: template.icon,
        label: template.label
      }
    ]);
  };

  // Game Loop
  const gameLoop = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    updateGame(deltaTime);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setDistance(0);
    setIman(100);
    setItems([]);
    setLevelIdx(0);
    setPlayerPos({ x: 50, y: 80 });
    levelRewardGiven.current = false;
    lastTimeRef.current = undefined;
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const nextLevel = () => {
    if (levelIdx < LEVELS.length - 1) {
      setLevelIdx(l => l + 1);
      setDistance(0);
      setItems([]);
      setIman(100);
      setShowLevelComplete(false);
      levelRewardGiven.current = false;
      lastTimeRef.current = undefined;
      // Loop continues automatically via ref checks
    } else {
      setGameOver(true); // Victory state handled in render
    }
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // --- RENDER ---

  if (gameOver) {
    const isVictory = distance >= 100 && levelIdx === LEVELS.length - 1;
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
        <div className={`bg-white max-w-md w-full p-8 rounded-3xl text-center border-4 ${isVictory ? 'border-green-500' : 'border-red-500'}`}>
          <div className="text-8xl mb-4">{isVictory ? '🕌' : '😢'}</div>
          <h1 className="text-4xl font-bold mb-2">{isVictory ? '¡Llegaste a la Mezquita!' : '¡Juego Terminado!'}</h1>
          <p className="text-xl text-gray-600 mb-8">
            {isVictory 
              ? 'Has completado el camino con éxito. ¡Allah acepte tu esfuerzo!' 
              : 'Te has quedado sin Iman. Inténtalo de nuevo.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={startGame} className="bg-yellow-400 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">Jugar de Nuevo</button>
            <button onClick={onExit} className="bg-gray-300 px-6 py-3 rounded-full font-bold hover:bg-gray-400 transition-colors">Salir</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden bg-gradient-to-b ${currentLevel.bgGradient} flex flex-col items-center justify-center`}>
      
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 text-white bg-black/20 backdrop-blur-sm">
        <div>
          <h2 className="font-bold text-lg md:text-2xl drop-shadow-md">{currentLevel.title}</h2>
          <div className="flex items-center gap-2 mt-2">
             <div className="w-32 md:w-48 h-4 bg-gray-700 rounded-full overflow-hidden border border-white/30">
                <div className="h-full bg-green-400 transition-all duration-300" style={{ width: `${distance}%` }}></div>
             </div>
             <span className="text-xs md:text-sm font-bold">Meta 🕌</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold drop-shadow-md">
                <Heart className={`fill-red-500 text-red-500 ${iman < 30 ? 'animate-pulse' : ''}`} /> {iman}%
            </div>
            <div className="text-yellow-300 text-sm md:text-lg font-bold mt-1 shadow-black drop-shadow-md text-right max-w-[200px]">
                {message}
            </div>
        </div>
      </div>

      {/* START SCREEN */}
      {!isPlaying && !gameOver && !showLevelComplete && (
        <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white p-6 md:p-8 rounded-3xl text-center max-w-sm w-full border-4 border-blue-400 animate-bounce-in shadow-2xl">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">Camino a la Mezquita</h1>
                <div className="space-y-3 text-left bg-gray-100 p-4 rounded-xl mb-6 text-sm">
                    <p className="flex items-center gap-2">🕹️ <strong>Usa las Flechas</strong> para moverte.</p>
                    <p className="flex items-center gap-2">✅ Recoge cosas <strong>Buenas</strong> (+Iman).</p>
                    <p className="flex items-center gap-2">❌ Evita cosas <strong>Malas</strong> (-Iman).</p>
                    <p className="flex items-center gap-2">🕌 ¡Llega a la <strong>Mezquita</strong>!</p>
                </div>
                <button 
                    onClick={startGame}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-xl transition-all hover:scale-105"
                >
                    <Play fill="white"/> ¡Correr!
                </button>
                <button onClick={onExit} className="mt-4 text-gray-400 hover:text-gray-600 underline text-sm">Volver al menú</button>
            </div>
        </div>
      )}

      {/* LEVEL COMPLETE */}
      {showLevelComplete && (
          <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-3xl text-center border-4 border-yellow-400 animate-fade-in shadow-2xl">
                  <div className="text-6xl mb-4">⭐</div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">¡Nivel Superado!</h2>
                  <p className="mb-6 text-gray-600 font-medium">Has avanzado un paso más hacia Allah.</p>
                  <button onClick={nextLevel} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform">
                      Siguiente Nivel ➡️
                  </button>
              </div>
          </div>
      )}

      {/* GAME AREA */}
      <div className="relative w-full max-w-2xl h-full bg-gray-800/50 border-x-8 border-white/10 overflow-hidden shadow-2xl">
          {/* Road Animation */}
          <div className="absolute inset-0 flex justify-center opacity-30 pointer-events-none">
              <div className="w-2 h-full bg-dashed-line animate-road-scroll"></div> 
              <div className="w-2 h-full bg-dashed-line animate-road-scroll ml-24"></div> 
              <div className="w-2 h-full bg-dashed-line animate-road-scroll -ml-24"></div> 
          </div>

          {/* Items */}
          {items.map(item => (
              <div 
                key={item.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-transform"
                style={{ 
                    left: `${item.x}%`, 
                    top: `${item.y}%`,
                    width: `${ITEM_SIZE}%`,
                    height: `${ITEM_SIZE}%`
                }}
              >
                  <span className="text-4xl drop-shadow-md filter">{item.icon}</span>
              </div>
          ))}

          {/* Player */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-linear"
            style={{ 
                left: `${playerPos.x}%`, 
                top: `${playerPos.y}%` 
            }}
          >
              <div className="text-6xl filter drop-shadow-2xl relative z-10">🏃🏽</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/40 rounded-full blur-md"></div>
          </div>
      </div>

      {/* Mobile Controls Overlay */}
      <div className="absolute bottom-6 inset-x-0 flex justify-between px-8 md:hidden z-40 pointer-events-none">
           <button 
             className="pointer-events-auto bg-white/20 backdrop-blur-md p-6 rounded-full active:bg-white/40 border border-white/30 shadow-lg"
             onTouchStart={(e) => { e.preventDefault(); setPlayerPos(p => ({...p, x: Math.max(5