
import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCw, Home, Star } from 'lucide-react';
import { playError, playWin, playLevelUp } from '../services/audioService';

// 0: Camino, 1: Muro, 2: Jugador (Inicio), 3: Meta
const LEVELS = [
  {
    level: 1,
    pillar: "Shahada (Fe)",
    color: "bg-blue-50",
    wallColor: "bg-blue-200",
    playerEmoji: "👦🏻",
    goalEmoji: "☝️",
    message: "¡La Shahada es la llave! Significa creer en tu corazón que solo hay un Dios (Allah) y Muhammad es Su Mensajero.",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
  },
  {
    level: 2,
    pillar: "Salat (Oración)",
    color: "bg-emerald-50",
    wallColor: "bg-emerald-200",
    playerEmoji: "🧕",
    goalEmoji: "🕌",
    message: "¡MashaAllah! El Salat es nuestra conexión con Allah. Rezamos 5 veces al día para tener paz y recordar ser buenos.",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
  },
  {
    level: 3,
    pillar: "Zakat (Caridad)",
    color: "bg-amber-50",
    wallColor: "bg-amber-200",
    playerEmoji: "👦🏽",
    goalEmoji: "💰",
    message: "¡Excelente! El Zakat es compartir lo que tenemos con los pobres. Ayudar a los demás hace feliz a Allah.",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
  },
  {
    level: 4,
    pillar: "Sawm (Ayuno)",
    color: "bg-orange-50",
    wallColor: "bg-orange-200",
    playerEmoji: "👧",
    goalEmoji: "🌙",
    message: "¡Lo lograste! El Sawm es ayunar en Ramadán. Nos enseña paciencia y a sentir lo que sienten los que tienen hambre.",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
  },
  {
    level: 5,
    pillar: "Hajj (Peregrinación)",
    color: "bg-purple-50",
    wallColor: "bg-purple-200",
    playerEmoji: "✈️",
    goalEmoji: "🕋",
    message: "¡Alhamdulillah! El Hajj es el viaje a La Meca. Es una gran reunión donde todos los musulmanes visten igual ante Allah.",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
  }
];

interface GameProps {
  onExit: () => void;
  addPoints?: (amount: number) => void;
}

export const GameMaze: React.FC<GameProps> = ({ onExit, addPoints }) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [showModal, setShowModal] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const levelData = LEVELS[currentLevelIndex];

  // Initialize player position based on grid '2'
  useEffect(() => {
    const grid = levelData.grid;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 2) {
          setPlayerPos({ x, y });
          return;
        }
      }
    }
  }, [currentLevelIndex]);

  // Handle Keyboard Movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showModal || gameWon) return;

      // Prevent scrolling when using arrows
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp') movePlayer(0, -1);
      if (e.key === 'ArrowDown') movePlayer(0, 1);
      if (e.key === 'ArrowLeft') movePlayer(-1, 0);
      if (e.key === 'ArrowRight') movePlayer(1, 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, showModal, gameWon]);

  const movePlayer = (dx: number, dy: number) => {
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    const grid = levelData.grid;

    // Check bounds
    if (newY < 0 || newY >= grid.length || newX < 0 || newX >= grid[0].length) {
        playError();
        return;
    }

    // Check Wall (1)
    if (grid[newY][newX] === 1) {
        playError();
        return;
    }

    // Move
    setPlayerPos({ x: newX, y: newY });

    // Check Goal (3)
    if (grid[newY][newX] === 3) {
      if (addPoints) addPoints(30); // Award 30 points per level
      playLevelUp();
      setShowModal(true);
    }
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      setShowModal(false);
    } else {
      playWin();
      setShowModal(false);
      setGameWon(true);
    }
  };

  return (
    // Fixed screen container
    <div className={`fixed inset-0 z-50 h-screen w-screen overflow-hidden ${levelData.color} p-4 flex flex-col items-center justify-center animate-fade-in`}>
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-lg mb-4">
        <button onClick={onExit} className="bg-white p-2 rounded-full shadow-md text-gray-700 font-bold flex items-center gap-2 hover:bg-red-50 transition-colors">
          <Home size={18} /> Salir
        </button>
        <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Nivel {levelData.level}</h2>
            <h1 className="text-2xl font-bold text-gray-800">{levelData.pillar}</h1>
        </div>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      {/* Maze Grid */}
      <div className="bg-white p-2 rounded-xl shadow-2xl border-4 border-gray-800 relative">
        <div 
            className="grid gap-0" 
            style={{ 
                gridTemplateColumns: `repeat(${levelData.grid[0].length}, minmax(0, 1fr))`,
                width: 'min(95vw, 500px)',
                height: 'min(95vw, 500px)'
            }}
        >
          {levelData.grid.map((row, y) => (
            row.map((cell, x) => {
              const isPlayer = playerPos.x === x && playerPos.y === y;
              let cellContent = null;
              let cellClass = "";

              if (cell === 1) {
                  cellClass = `${levelData.wallColor} border-t border-l border-white/30 rounded-sm`; // Wall
              } else if (cell === 3) {
                  cellContent = levelData.goalEmoji; // Goal
                  cellClass = "bg-green-100 flex items-center justify-center text-sm md:text-2xl animate-pulse rounded-full shadow-inner";
              } else {
                  cellClass = "bg-white/40"; // Path
              }

              return (
                <div key={`${x}-${y}`} className={`${cellClass} w-full h-full relative transition-all duration-300`}>
                  {cellContent}
                  {isPlayer && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm md:text-2xl transition-all duration-100 z-10 scale-110 drop-shadow-md">
                      {levelData.playerEmoji}
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>

      {/* Controls (Mobile Friendly) */}
      <div className="mt-8 grid grid-cols-3 gap-2 max-w-[200px]">
         <div></div>
         <button className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg active:bg-gray-200 active:scale-95 transition-transform" onClick={() => movePlayer(0, -1)}><ArrowUp /></button>
         <div></div>
         <button className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg active:bg-gray-200 active:scale-95 transition-transform" onClick={() => movePlayer(-1, 0)}><ArrowLeft /></button>
         <button className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg active:bg-gray-200 active:scale-95 transition-transform" onClick={() => movePlayer(0, 1)}><ArrowDown /></button>
         <button className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg active:bg-gray-200 active:scale-95 transition-transform" onClick={() => movePlayer(1, 0)}><ArrowRight /></button>
      </div>

      {/* Level Complete Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center animate-bounce-in border-4 border-yellow-400 shadow-2xl">
            <div className="text-6xl mb-4">{levelData.goalEmoji}</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">¡Pilar Completado!</h2>
            <p className="text-gray-700 text-lg mb-6">{levelData.message}</p>
            <button 
              onClick={handleNextLevel}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg w-full transform hover:scale-105 transition-all"
            >
              {currentLevelIndex < LEVELS.length - 1 ? "Siguiente Nivel ➡️" : "Ver Resultado Final"}
            </button>
          </div>
        </div>
      )}

      {/* Game Won Screen */}
      {gameWon && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center z-50 p-4 text-center text-white">
          <div className="max-w-md bg-white/20 backdrop-blur-md p-8 rounded-3xl border border-white/30 shadow-2xl">
            <div className="flex justify-center gap-2 mb-6">
                <Star className="w-12 h-12 text-yellow-300 fill-yellow-300 animate-spin" />
                <Star className="w-16 h-16 text-yellow-300 fill-yellow-300 animate-bounce" />
                <Star className="w-12 h-12 text-yellow-300 fill-yellow-300 animate-spin" />
            </div>
            <h1 className="text-5xl font-bold mb-4 drop-shadow-md">¡Felicidades!</h1>
            <p className="text-2xl mb-8 font-medium">Has completado los 5 Pilares del Islam y reforzado tu Casa Musulmana.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                      setGameWon(false);
                      setCurrentLevelIndex(0);
                  }}
                  className="bg-white text-green-600 font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
                >
                  <RefreshCw /> Jugar de Nuevo
                </button>
                <button 
                  onClick={onExit}
                  className="bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg border-2 border-green-400 hover:bg-green-800 transition-colors"
                >
                  Volver al Menú
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
