
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCw, Home, Star, Lock, Zap, Clock, Coins } from 'lucide-react';
import { playError, playWin, playLevelUp, playCoin, playSuccess } from '../services/audioService';

// --- CONFIGURACIÓN DE NIVELES (Arcos de Fe) ---

const LEVELS = [
  {
    level: 1,
    name: 'Shahada (Fe)',
    size: 15,
    mechanic: 'illusion',
    desc: 'Algunos muros son ilusiones. Ten fe y atraviésalos para encontrar el camino.',
    goalEmoji: '☝️',
    timeLimit: null
  },
  {
    level: 2,
    name: 'Salat (Oración)',
    size: 19,
    mechanic: 'sand',
    desc: 'La arena de la distracción intenta detenerte. Mantén la concentración (paciencia en el movimiento).',
    goalEmoji: '🕌',
    timeLimit: null
  },
  {
    level: 3,
    name: 'Zakat (Caridad)',
    size: 21,
    mechanic: 'coins',
    desc: 'La puerta está cerrada. Recolecta 5 monedas por todo el mapa para abrirla. ¡Hay múltiples caminos!',
    goalEmoji: '💰',
    timeLimit: 120
  },
  {
    level: 4,
    name: 'Sawm (Ayuno)',
    size: 25,
    mechanic: 'stamina',
    desc: 'Tu energía es limitada. Llega a la meta antes de que se agote tu fuerza.',
    goalEmoji: '🌙',
    timeLimit: null
  },
  {
    level: 5,
    name: 'Hajj (Peregrinación)',
    size: 29,
    mechanic: 'teleport',
    desc: 'Un viaje largo y misterioso. Usa los portales para cruzar grandes distancias.',
    goalEmoji: '🕋',
    timeLimit: 180
  }
];

// IDs de Celda
// 0: Camino, 1: Muro, 2: Start, 3: Goal
// 4: Muro Ilusión (L1), 5: Arena (L2), 6: Moneda (L3), 7: Puerta (L3), 8: Portal A (L5), 9: Portal B (L5)

interface GameProps {
  onExit: () => void;
  addPoints?: (amount: number) => void;
}

// --- GENERADOR DE LABERINTOS ---
const generateMaze = (levelIdx: number) => {
    const config = LEVELS[levelIdx];
    const size = config.size;
    const grid: number[][] = Array(size).fill(null).map(() => Array(size).fill(1));
    
    // Recursive Backtracker
    const directions = [{ dx: 0, dy: -2 }, { dx: 2, dy: 0 }, { dx: 0, dy: 2 }, { dx: -2, dy: 0 }];
    const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

    const carve = (x: number, y: number) => {
        grid[y][x] = 0;
        const dirs = shuffle([...directions]);
        for (const { dx, dy } of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 1) {
                grid[y + dy / 2][x + dx / 2] = 0;
                carve(nx, ny);
            }
        }
    };

    carve(1, 1);
    grid[1][1] = 2; // Start

    // --- BRAIDING (ELIMINAR CALLEJONES SIN SALIDA) ---
    // Esto es crucial para el Nivel 3 (Monedas) para asegurar múltiples rutas
    // y evitar que el jugador tenga que retroceder demasiado.
    const braidingFactor = config.mechanic === 'coins' ? 0.7 : 0.1; // 70% de eliminación en nivel de monedas

    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            if (grid[y][x] === 0) {
                // Contar muros alrededor (Arriba, Abajo, Izq, Der)
                const neighbors = [
                    {x: x, y: y-1}, {x: x, y: y+1}, {x: x-1, y: y}, {x: x+1, y: y}
                ];
                const walls = neighbors.filter(n => grid[n.y][n.x] === 1);

                // Si hay 3 muros, es un callejon sin salida
                if (walls.length === 3 && Math.random() < braidingFactor) {
                    // Elegir un muro válido para derribar (que no sea borde del mapa)
                    const validWallsToRemove = walls.filter(w => w.x > 0 && w.x < size - 1 && w.y > 0 && w.y < size - 1);
                    
                    if (validWallsToRemove.length > 0) {
                        const remove = validWallsToRemove[Math.floor(Math.random() * validWallsToRemove.length)];
                        grid[remove.y][remove.x] = 0; // Abrir camino
                    }
                }
            }
        }
    }

    // Find Goal (furthest open point bottom-right)
    let gx = size - 2, gy = size - 2;
    while(grid[gy][gx] !== 0) { 
        if (gx > 1) gx--; 
        else { gx = size - 2; gy--; } 
    }
    grid[gy][gx] = 3; // Goal

    // --- APLICAR MECÁNICAS ESPECÍFICAS ---
    
    // Nivel 1: Muros de Ilusión
    if (config.mechanic === 'illusion') {
        for(let y=1; y<size-1; y++) {
            for(let x=1; x<size-1; x++) {
                if(grid[y][x] === 1 && Math.random() < 0.15) {
                    if (x > 0 && x < size-1 && y > 0 && y < size-1) {
                        grid[y][x] = 4;
                    }
                }
            }
        }
    }

    // Nivel 2: Arena (Slow)
    if (config.mechanic === 'sand') {
        for(let y=1; y<size-1; y++) {
            for(let x=1; x<size-1; x++) {
                if(grid[y][x] === 0 && Math.random() < 0.2) {
                    grid[y][x] = 5;
                }
            }
        }
    }

    // Nivel 3: Monedas y Puerta
    if (config.mechanic === 'coins') {
        // Colocar Puerta adyacente a la meta (bloqueo final)
        const adj = [{dx:0, dy:1}, {dx:0, dy:-1}, {dx:1, dy:0}, {dx:-1, dy:0}];
        
        // Buscar un punto adyacente a la meta que sea camino
        for(let d of adj) {
            const px = gx + d.dx; 
            const py = gy + d.dy;
            if (px > 0 && px < size && py > 0 && py < size && grid[py][px] === 0) {
                grid[py][px] = 7; // Gate
                // Solo una puerta es suficiente generalmente, pero aseguramos que bloquee el acceso directo
                // Al ser un laberinto "braided", el jugador puede rodear, pero la meta es única.
                break; 
            }
        }
        
        // Colocar 5 monedas dispersas
        let coinsPlaced = 0;
        let attempts = 0;
        while(coinsPlaced < 5 && attempts < 2000) {
            attempts++;
            const rx = Math.floor(Math.random() * size);
            const ry = Math.floor(Math.random() * size);
            
            // Condiciones: Espacio vacío, lejos del inicio y LEJOS de la meta (para no quedar detrás de la puerta)
            // Distancia Manhattan
            const distStart = Math.abs(rx-1) + Math.abs(ry-1);
            const distGoal = Math.abs(rx-gx) + Math.abs(ry-gy);

            if(grid[ry][rx] === 0 && distStart > 5 && distGoal > 3) {
                grid[ry][rx] = 6;
                coinsPlaced++;
            }
        }
    }

    // Nivel 5: Portales
    if (config.mechanic === 'teleport') {
        let p1 = {x:0, y:0}, p2 = {x:0, y:0};
        let attempts = 0;
        while((grid[p1.y][p1.x] !== 0) && attempts < 1000) { 
            p1.x = Math.floor(Math.random()*(size/2)) + 1; 
            p1.y = Math.floor(Math.random()*size); 
            attempts++;
        }
        attempts = 0;
        while((grid[p2.y][p2.x] !== 0) && attempts < 1000) { 
            p2.x = Math.floor(Math.random()*(size/2)) + Math.floor(size/2) - 1; 
            p2.y = Math.floor(Math.random()*size); 
            attempts++;
        }
        
        if (grid[p1.y][p1.x] === 0) grid[p1.y][p1.x] = 8; // Portal A
        if (grid[p2.y][p2.x] === 0) grid[p2.y][p2.x] = 9; // Portal B
    }

    return grid;
};

export const GameMaze: React.FC<GameProps> = ({ onExit, addPoints }) => {
  // --- STATE ---
  const [levelIdx, setLevelIdx] = useState(0);
  const [grid, setGrid] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'level_complete'>('playing');
  
  // Mechanics State
  const [coins, setCoins] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSlowed, setIsSlowed] = useState(false); // For Sand mechanic

  const config = LEVELS[levelIdx];
  const timerRef = useRef<number | null>(null);

  // --- INIT LEVEL ---
  useEffect(() => {
    startLevel(levelIdx);
    return () => stopTimer();
  }, [levelIdx]);

  const stopTimer = () => {
      if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
      }
  };

  const startLevel = (idx: number) => {
      if (idx >= LEVELS.length) {
          handleWinGame();
          return;
      }

      const newGrid = generateMaze(idx);
      setGrid(newGrid);
      
      // Find Start
      let start = {x:1, y:1};
      for(let y=0; y<newGrid.length; y++) {
          for(let x=0; x<newGrid[0].length; x++) {
              if(newGrid[y][x] === 2) start = {x, y};
          }
      }
      setPlayerPos(start);
      setGameState('playing');
      setCoins(0);
      setStamina(100);
      setIsSlowed(false);

      stopTimer();
      if (LEVELS[idx].timeLimit) {
          setTimeLeft(LEVELS[idx].timeLimit);
          timerRef.current = window.setInterval(() => {
              setTimeLeft(prev => {
                  if (prev !== null && prev <= 1) {
                      handleGameOver('¡Se acabó el tiempo!');
                      return 0;
                  }
                  return prev !== null ? prev - 1 : null;
              });
          }, 1000);
      } else {
          setTimeLeft(null);
      }
  };

  // --- CONTROLS ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (gameState !== 'playing') return;
          
          if (['ArrowUp', 'w', 'W'].includes(e.key)) move(0, -1);
          if (['ArrowDown', 's', 'S'].includes(e.key)) move(0, 1);
          if (['ArrowLeft', 'a', 'A'].includes(e.key)) move(-1, 0);
          if (['ArrowRight', 'd', 'D'].includes(e.key)) move(1, 0);

           // Prevent scrolling
           if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playerPos, isSlowed, coins, stamina]);

  const move = (dx: number, dy: number) => {
      if (gameState !== 'playing') return;

      // Sand Mechanic: Skip turn 50% of time if slowed
      if (isSlowed && Math.random() > 0.5) {
          return; 
      }

      const nx = playerPos.x + dx;
      const ny = playerPos.y + dy;
      
      // Bounds check
      if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) return;

      const cell = grid[ny][nx];

      // Logic per cell type
      if (cell === 1) {
          playError(); // Wall hit
          return;
      }

      // Check Gate (Level 3)
      if (cell === 7) {
          if (coins >= 5) {
              playSuccess();
              // Open gate visually
              const newGrid = [...grid];
              newGrid[ny][nx] = 0;
              setGrid(newGrid);
              setPlayerPos({x: nx, y: ny});
          } else {
              playError(); // Locked
              // Show hint?
          }
          return;
      }

      // Valid Move
      let nextPos = { x: nx, y: ny };
      let newSlowed = false;

      // Handle Mechanics
      if (cell === 3) { // Goal
          handleLevelComplete();
          return;
      }
      else if (cell === 4) { // Illusion Wall
          playSuccess(); // Sound clue
      }
      else if (cell === 5) { // Sand
          newSlowed = true;
      }
      else if (cell === 6) { // Coin
          playCoin();
          setCoins(c => c + 1);
          // Remove coin
          const newGrid = [...grid];
          newGrid[ny][nx] = 0;
          setGrid(newGrid);
      }
      else if (cell === 8) { // Portal A -> Find B (9)
          playSuccess();
          const target = findCell(9);
          if (target) nextPos = target;
      }
      else if (cell === 9) { // Portal B -> Find A (8)
          playSuccess();
          const target = findCell(8);
          if (target) nextPos = target;
      }

      setPlayerPos(nextPos);
      setIsSlowed(newSlowed);

      // Stamina Drain (Level 4)
      if (config.mechanic === 'stamina') {
          setStamina(prev => {
              const next = prev - 2;
              if (next <= 0) {
                  handleGameOver('¡Te quedaste sin energía!');
                  return 0;
              }
              return next;
          });
      }
  };

  const findCell = (id: number) => {
      for(let y=0; y<grid.length; y++) {
          for(let x=0; x<grid[0].length; x++) {
              if(grid[y][x] === id) return {x, y};
          }
      }
      return null;
  };

  const handleLevelComplete = () => {
      stopTimer();
      setGameState('level_complete');
      playLevelUp();
      if (addPoints) addPoints(30);
  };

  const handleNextLevel = () => {
      setLevelIdx(prev => prev + 1);
  };

  const handleGameOver = (msg: string = 'Inténtalo de nuevo') => {
      stopTimer();
      setGameState('lost');
      playError();
  };

  const handleWinGame = () => {
      setGameState('won');
      playWin();
      if (addPoints) addPoints(100);
  };

  const restartLevel = () => {
      startLevel(levelIdx);
  };

  // --- RENDER ---
  const cellSize = Math.min(30, 600 / config.size); // Responsive cell size

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-white p-4 font-mono select-none">
        
        {/* HUD */}
        <div className="w-full max-w-2xl flex justify-between items-center mb-4 bg-black text-white p-3 rounded-xl shadow-lg">
            <div>
                <h2 className="text-xl font-bold">{config.name}</h2>
                <div className="flex gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Home size={14}/> Nivel {levelIdx + 1}/5</span>
                    {timeLeft !== null && (
                        <span className={`flex items-center gap-1 ${timeLeft < 30 ? 'text-red-500 animate-pulse' : ''}`}>
                            <Clock size={14}/> {timeLeft}s
                        </span>
                    )}
                </div>
            </div>

            {/* MECHANIC HUD */}
            <div className="flex items-center gap-4">
                {config.mechanic === 'coins' && (
                    <div className="flex items-center gap-2 text-yellow-400 font-bold text-xl">
                        <Coins className="animate-pulse" /> {coins}/5
                    </div>
                )}
                {config.mechanic === 'stamina' && (
                    <div className="flex flex-col w-32">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Energía</span>
                            <span>{stamina}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full">
                            <div className={`h-full rounded-full transition-all ${stamina < 30 ? 'text-red-500' : 'bg-green-500'}`} style={{width: `${stamina}%`}}></div>
                        </div>
                    </div>
                )}
                <button onClick={onExit} className="bg-red-600 hover:bg-red-700 p-2 rounded-full"><Home size={16}/></button>
            </div>
        </div>

        {/* MAZE GRID */}
        <div className="relative bg-white border-4 border-black p-2 shadow-2xl">
            <div 
                className="grid gap-0"
                style={{
                    gridTemplateColumns: `repeat(${config.size}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${config.size}, ${cellSize}px)`,
                }}
            >
                {grid.map((row, y) => (
                    row.map((cell, x) => {
                        const isPlayer = playerPos.x === x && playerPos.y === y;
                        let cellClass = "bg-white"; // 0: Path
                        let content = null;

                        if (cell === 1) cellClass = "bg-black"; // Wall
                        else if (cell === 2) content = "🏁"; // Start
                        else if (cell === 3) content = config.goalEmoji; // Goal
                        else if (cell === 4) cellClass = "bg-gray-800 opacity-90 border border-gray-600"; // Illusion (looks like wall)
                        else if (cell === 5) cellClass = "bg-yellow-100 opacity-50"; // Sand
                        else if (cell === 6) content = "🪙"; // Coin
                        else if (cell === 7) content = <Lock size={cellSize*0.8} className="text-red-500"/>; // Gate
                        else if (cell === 8 || cell === 9) content = <Zap size={cellSize*0.8} className="text-purple-500 animate-pulse"/>; // Portal

                        return (
                            <div 
                                key={`${x}-${y}`} 
                                className={`relative flex items-center justify-center ${cellClass}`} 
                                style={{width: cellSize, height: cellSize}}
                            >
                                {content}
                                {isPlayer && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="w-2/3 h-2/3 bg-blue-600 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ))}
            </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-4 text-center max-w-lg">
            <p className="text-lg font-bold text-gray-800">{config.desc}</p>
            <p className="text-sm text-gray-500 mt-2">Usa las flechas para moverte.</p>
        </div>

        {/* OVERLAYS */}
        {gameState === 'level_complete' && (
             <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-20 animate-fade-in">
                 <h2 className="text-4xl font-bold text-yellow-400 mb-4">¡Pilar Completado!</h2>
                 <div className="text-6xl mb-6">{config.goalEmoji}</div>
                 <button onClick={handleNextLevel} className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-full text-xl font-bold flex items-center gap-2">
                     Siguiente Pilar <ArrowRight />
                 </button>
             </div>
        )}

        {gameState === 'lost' && (
             <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-20 animate-fade-in">
                 <h2 className="text-4xl font-bold text-red-500 mb-4">¡Inténtalo de nuevo!</h2>
                 <p className="mb-6 text-gray-300">No te rindas, la paciencia es clave.</p>
                 <button onClick={restartLevel} className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-full text-xl font-bold flex items-center gap-2">
                     <RefreshCw /> Reintentar
                 </button>
             </div>
        )}

        {gameState === 'won' && (
             <div className="absolute inset-0 bg-yellow-400 flex flex-col items-center justify-center text-black z-20 animate-fade-in p-8 text-center">
                 <Star size={100} className="text-white mb-6 animate-spin-slow drop-shadow-lg" />
                 <h1 className="text-5xl font-black mb-4">¡Laberinto Completado!</h1>
                 <p className="text-xl font-bold mb-8">Has recorrido los 5 Pilares de la Fe con éxito.</p>
                 <button onClick={onExit} className="bg-white text-yellow-600 px-10 py-4 rounded-full text-2xl font-bold shadow-xl hover:scale-105 transition-transform">
                     Volver al Menú
                 </button>
             </div>
        )}
    </div>
  );
};
