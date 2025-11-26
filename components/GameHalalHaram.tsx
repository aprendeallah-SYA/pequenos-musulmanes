
import React, { useState, useEffect, useRef } from 'react';
import { playSuccess, playError, playLevelUp, playCoin, playWin } from '../services/audioService';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Pause, Play, RefreshCw } from 'lucide-react';

// --- CONFIGURACIÓN DEL JUEGO ---

const GRID_SIZE = 15; // 15x15 grid
const CELL_SIZE = 24; // Base size for calculations (visuals handled by CSS grid)

// 1 = Pared, 0 = Camino
const MAZE_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const HALAL_FOODS = ['🍎', '🍉', '🍇', '🍗', '🥛', '🥒', '🥥', '🥭'];
const HARAM_GHOSTS = ['🐷', '🍷', '🍺', '🥓', '🦂'];

interface Entity {
    id: number;
    x: number;
    y: number;
    icon: string;
    type: 'halal' | 'haram' | 'powerup';
}

interface GameProps {
  onExit: () => void;
  addPoints?: (amount: number) => void;
}

export const GameHalalHaram: React.FC<GameProps> = ({ onExit, addPoints }) => {
    // --- ESTADO ---
    const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
    const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [items, setItems] = useState<Entity[]>([]);
    const [enemies, setEnemies] = useState<Entity[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [message, setMessage] = useState("¡Come solo lo Halal!");
    const [powerUpActive, setPowerUpActive] = useState(false);

    // Refs for Game Loop (Prevents stale closures and loop resets)
    const playerPosRef = useRef(playerPos);
    const directionRef = useRef(direction);
    const itemsRef = useRef(items);
    const enemiesRef = useRef(enemies);
    const powerUpActiveRef = useRef(powerUpActive);
    const gameOverRef = useRef(gameOver);
    const gameWonRef = useRef(gameWon);

    const tickRef = useRef<number | null>(null);
    const ghostTickRef = useRef<number | null>(null);

    // --- SYNC REFS ---
    useEffect(() => {
        playerPosRef.current = playerPos;
        directionRef.current = direction;
        itemsRef.current = items;
        enemiesRef.current = enemies;
        powerUpActiveRef.current = powerUpActive;
        gameOverRef.current = gameOver;
        gameWonRef.current = gameWon;
    }, [playerPos, direction, items, enemies, powerUpActive, gameOver, gameWon]);

    // --- INICIALIZACIÓN ---

    useEffect(() => {
        startLevel(1);
        return () => stopGameLoop();
    }, []);

    // --- CONTROLES DE TECLADO GLOBAL ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver || gameWon) return;

            const keysToPrevent = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
            if (keysToPrevent.includes(e.key)) {
                e.preventDefault();
            }

            if (['ArrowUp', 'w', 'W'].includes(e.key)) setDirection('UP');
            else if (['ArrowDown', 's', 'S'].includes(e.key)) setDirection('DOWN');
            else if (['ArrowLeft', 'a', 'A'].includes(e.key)) setDirection('LEFT');
            else if (['ArrowRight', 'd', 'D'].includes(e.key)) setDirection('RIGHT');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameOver, gameWon]);

    const startLevel = (lvl: number) => {
        setLevel(lvl);
        setPlayerPos({ x: 1, y: 1 });
        setDirection('RIGHT');
        setGameOver(false);
        setPowerUpActive(false);
        
        // Spawn Items (Halal)
        const newItems: Entity[] = [];
        for (let i = 0; i < 10 + (lvl * 2); i++) {
            const pos = getRandomEmptyPos([...newItems]);
            if (pos) {
                newItems.push({
                    id: i,
                    x: pos.x,
                    y: pos.y,
                    icon: HALAL_FOODS[Math.floor(Math.random() * HALAL_FOODS.length)],
                    type: 'halal'
                });
            }
        }
        // Add one Power Up (Dua)
        const powerPos = getRandomEmptyPos([...newItems]);
        if (powerPos) {
            newItems.push({ id: 999, x: powerPos.x, y: powerPos.y, icon: '🤲', type: 'powerup' });
        }
        setItems(newItems);

        // Spawn Enemies (Haram Ghosts)
        const newEnemies: Entity[] = [];
        // INCREASED ENEMY COUNT: Base 3 + difficulty
        const enemyCount = 3 + Math.floor(lvl / 2);
        for (let i = 0; i < enemyCount; i++) {
             let ex = GRID_SIZE - 2 - Math.floor(Math.random() * 4);
             let ey = GRID_SIZE - 2 - Math.floor(Math.random() * 4);
             if (MAZE_MAP[ey][ex] === 0) {
                 newEnemies.push({
                     id: i + 100,
                     x: ex,
                     y: ey,
                     icon: HARAM_GHOSTS[Math.floor(Math.random() * HARAM_GHOSTS.length)],
                     type: 'haram'
                 });
             }
        }
        setEnemies(newEnemies);
        setIsPaused(false);
        // We call startGameLoop via the useEffect dependency on isPaused/level
    };

    const getRandomEmptyPos = (currentItems: Entity[]) => {
        let attempts = 0;
        while(attempts < 100) {
            const x = Math.floor(Math.random() * GRID_SIZE);
            const y = Math.floor(Math.random() * GRID_SIZE);
            if (MAZE_MAP[y][x] === 1) { attempts++; continue; }
            if (x === 1 && y === 1) { attempts++; continue; }
            if (currentItems.some(i => i.x === x && i.y === y)) { attempts++; continue; }
            return { x, y };
        }
        return null;
    };

    // --- GAME LOOP ---

    const stopGameLoop = () => {
        if (tickRef.current) clearInterval(tickRef.current);
        if (ghostTickRef.current) clearInterval(ghostTickRef.current);
    };

    const startGameLoop = () => {
        stopGameLoop();
        
        // Player Movement Tick
        tickRef.current = window.setInterval(() => {
            if (isPaused || gameOverRef.current || gameWonRef.current) return;
            movePlayer();
        }, 300);

        // Enemy Movement Tick
        ghostTickRef.current = window.setInterval(() => {
             if (isPaused || gameOverRef.current || gameWonRef.current) return;
            moveGhosts();
        }, 500 - (level * 30));
    };

    // Only restart loops if pause state, game over state or level (speed) changes.
    // We removed playerPos, direction, items, etc from dependencies to prevent stuttering.
    useEffect(() => {
        if (isPaused || gameOver || gameWon) {
            stopGameLoop();
        } else {
            startGameLoop();
        }
    }, [isPaused, gameOver, gameWon, level]);


    // --- LÓGICA DE MOVIMIENTO ---

    const isValidMove = (x: number, y: number) => {
        return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && MAZE_MAP[y][x] === 0;
    };

    const movePlayer = () => {
        // USE REF for latest state inside interval
        let { x, y } = playerPosRef.current;
        let dir = directionRef.current;
        let nextX = x;
        let nextY = y;

        if (dir === 'UP') nextY--;
        if (dir === 'DOWN') nextY++;
        if (dir === 'LEFT') nextX--;
        if (dir === 'RIGHT') nextX++;

        if (isValidMove(nextX, nextY)) {
            setPlayerPos({ x: nextX, y: nextY });
            checkCollisions(nextX, nextY);
        }
    };

    const moveGhosts = () => {
        if (powerUpActiveRef.current) return;

        // Use REF for current enemies to calculate next positions
        const currentEnemies = enemiesRef.current;
        const pPos = playerPosRef.current;

        const movedEnemies = currentEnemies.map(ghost => {
            const possibleMoves = [
                { x: ghost.x, y: ghost.y - 1 },
                { x: ghost.x, y: ghost.y + 1 },
                { x: ghost.x - 1, y: ghost.y },
                { x: ghost.x + 1, y: ghost.y }
            ].filter(pos => isValidMove(pos.x, pos.y));

            if (possibleMoves.length > 0) {
                // 40% chance to chase player
                if (Math.random() > 0.6) {
                    const bestMove = possibleMoves.reduce((prev, curr) => {
                        const distPrev = Math.abs(prev.x - pPos.x) + Math.abs(prev.y - pPos.y);
                        const distCurr = Math.abs(curr.x - pPos.x) + Math.abs(curr.y - pPos.y);
                        return distCurr < distPrev ? curr : prev;
                    });
                    return { ...ghost, x: bestMove.x, y: bestMove.y };
                } else {
                    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    return { ...ghost, x: randomMove.x, y: randomMove.y };
                }
            }
            return ghost;
        });

        setEnemies(movedEnemies);

        // Check collision after ghost move
        const hit = movedEnemies.some(e => e.x === pPos.x && e.y === pPos.y);
        if (hit && !powerUpActiveRef.current) {
            handleHitGhost();
        }
    };

    const checkCollisions = (px: number, py: number) => {
        // 1. Check Food (Use Ref)
        const currentItems = itemsRef.current;
        const itemIndex = currentItems.findIndex(i => i.x === px && i.y === py);
        
        if (itemIndex !== -1) {
            const item = currentItems[itemIndex];
            if (item.type === 'halal') {
                playCoin();
                setScore(s => s + 10);
                setMessage(`¡Yummy! ${item.icon}`);
                
                // Remove item logic
                const newItems = [...currentItems];
                newItems.splice(itemIndex, 1);
                setItems(newItems);
                // Important: Update ref manually for next immediate tick check if needed
                itemsRef.current = newItems; 
                
                // Check Level Win
                if (newItems.filter(i => i.type === 'halal').length === 0) {
                    if (level < 6) {
                        playLevelUp();
                        if (addPoints) addPoints(20);
                        setTimeout(() => startLevel(level + 1), 1000);
                    } else {
                        playWin();
                        if (addPoints) addPoints(100);
                        setGameWon(true);
                    }
                }
            } else if (item.type === 'powerup') {
                playSuccess();
                setMessage("¡Dua Poderoso! Fantasmas congelados.");
                setPowerUpActive(true);
                
                const newItems = [...currentItems];
                newItems.splice(itemIndex, 1);
                setItems(newItems);
                itemsRef.current = newItems;
                
                setTimeout(() => {
                    setPowerUpActive(false);
                    setMessage("¡Cuidado! Se mueven de nuevo.");
                }, 5000);
            }
        }

        // 2. Check Ghosts (Use Ref)
        const currentEnemies = enemiesRef.current;
        const ghostHit = currentEnemies.some(e => e.x === px && e.y === py);
        if (ghostHit) {
            handleHitGhost();
        }
    };

    const handleHitGhost = () => {
        if (powerUpActiveRef.current) return;
        playError();
        setGameOver(true);
        setMessage("¡Oh no! Eso era Haram.");
    };

    // --- RENDERIZADO ---

    return (
        <div 
            className="flex flex-col items-center justify-center bg-gray-900 p-4 rounded-3xl border-4 border-blue-500 shadow-2xl max-w-2xl mx-auto w-full outline-none select-none"
        >
            {/* HUD */}
            <div className="flex justify-between w-full mb-4 px-2 text-white font-mono">
                <div className="flex flex-col">
                    <span className="text-yellow-400 font-bold text-xl">SCORE: {score}</span>
                    <span className="text-xs text-blue-300">NIVEL {level}</span>
                </div>
                <div className="bg-blue-900/50 px-4 py-2 rounded border border-blue-500 text-center min-w-[150px]">
                    <span className="animate-pulse font-bold">{message}</span>
                </div>
                <button onClick={onExit} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold h-8">SALIR</button>
            </div>

            {/* GAME BOARD */}
            <div className="relative bg-black p-1 rounded-lg border-2 border-blue-700 shadow-[0_0_20px_rgba(0,0,255,0.3)]">
                
                {/* GRID RENDER */}
                <div 
                    className="grid gap-0"
                    style={{ 
                        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    }}
                >
                    {MAZE_MAP.map((row, y) => (
                        row.map((cell, x) => (
                            <div 
                                key={`${x}-${y}`} 
                                className={`
                                    w-full h-full 
                                    ${cell === 1 ? 'bg-blue-900 border border-blue-800 rounded-sm shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]' : 'bg-transparent'}
                                `}
                            >
                                {/* DOTS (Visual decoration for path, optional) */}
                                {cell === 0 && (
                                    <div className="w-1 h-1 bg-gray-800 rounded-full mx-auto mt-3 opacity-20"></div>
                                )}
                            </div>
                        ))
                    ))}
                </div>

                {/* ENTITIES LAYER */}
                
                {/* ITEMS */}
                {items.map(item => (
                    <div
                        key={item.id}
                        className="absolute flex items-center justify-center transition-transform"
                        style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            left: item.x * CELL_SIZE,
                            top: item.y * CELL_SIZE,
                        }}
                    >
                        <span className={`text-lg ${item.type === 'powerup' ? 'animate-bounce scale-125' : 'animate-pulse'}`}>
                            {item.icon}
                        </span>
                    </div>
                ))}

                {/* ENEMIES (GHOSTS) */}
                {enemies.map(enemy => (
                    <div
                        key={enemy.id}
                        className={`absolute flex items-center justify-center transition-all duration-500 ease-linear ${powerUpActive ? 'opacity-50 blur-[1px]' : ''}`}
                        style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            left: enemy.x * CELL_SIZE,
                            top: enemy.y * CELL_SIZE,
                        }}
                    >
                         <span className="text-xl filter drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">{enemy.icon}</span>
                    </div>
                ))}

                {/* PLAYER (PAC-MUSLIM) */}
                <div
                    className="absolute transition-all duration-300 linear bg-yellow-400 rounded-full flex items-center justify-center z-10 shadow-[0_0_10px_yellow]"
                    style={{
                        width: CELL_SIZE - 4,
                        height: CELL_SIZE - 4,
                        left: (playerPos.x * CELL_SIZE) + 2,
                        top: (playerPos.y * CELL_SIZE) + 2,
                        transform: `rotate(${direction === 'RIGHT' ? 0 : direction === 'DOWN' ? 90 : direction === 'LEFT' ? 180 : -90}deg)`
                    }}
                >
                    {/* Pacman Mouth Logic using clip-path or simple border */}
                    <div className="absolute right-0 top-1/2 -mt-[20%] w-[50%] h-[40%] bg-black clip-triangle animate-chomp"></div>
                </div>

            </div>

            {/* OVERLAYS */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 rounded-3xl text-white">
                    <h2 className="text-4xl font-bold text-red-500 mb-2">¡Astaghfirullah!</h2>
                    <p className="mb-6">Has tocado algo Haram.</p>
                    <button 
                        onClick={() => startLevel(1)} 
                        className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <RefreshCw /> Intentar de Nuevo
                    </button>
                </div>
            )}

            {gameWon && (
                <div className="absolute inset-0 bg-green-900/90 flex flex-col items-center justify-center z-20 rounded-3xl text-white text-center p-6">
                    <div className="text-6xl mb-4">🏆</div>
                    <h2 className="text-3xl font-bold text-yellow-300 mb-2">¡MashaAllah!</h2>
                    <p className="mb-6">Completaste todos los niveles comiendo solo Halal.</p>
                    <button onClick={onExit} className="bg-white text-green-800 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
                        Volver al Menú
                    </button>
                </div>
            )}

            {/* MOBILE CONTROLS */}
            <div className="mt-6 grid grid-cols-3 gap-2 w-48 md:hidden">
                <div></div>
                <button 
                    className={`bg-gray-800 p-4 rounded-xl border border-gray-600 active:bg-blue-600 ${direction === 'UP' ? 'bg-blue-800' : ''}`}
                    onTouchStart={(e) => {e.preventDefault(); setDirection('UP')}}
                    onClick={() => setDirection('UP')}
                >
                    <ArrowUp className="text-white" />
                </button>
                <div></div>
                <button 
                    className={`bg-gray-800 p-4 rounded-xl border border-gray-600 active:bg-blue-600 ${direction === 'LEFT' ? 'bg-blue-800' : ''}`}
                    onTouchStart={(e) => {e.preventDefault(); setDirection('LEFT')}}
                    onClick={() => setDirection('LEFT')}
                >
                    <ArrowLeft className="text-white" />
                </button>
                <button 
                    className={`bg-gray-800 p-4 rounded-xl border border-gray-600 active:bg-blue-600 ${direction === 'DOWN' ? 'bg-blue-800' : ''}`}
                    onTouchStart={(e) => {e.preventDefault(); setDirection('DOWN')}}
                    onClick={() => setDirection('DOWN')}
                >
                    <ArrowDown className="text-white" />
                </button>
                <button 
                    className={`bg-gray-800 p-4 rounded-xl border border-gray-600 active:bg-blue-600 ${direction === 'RIGHT' ? 'bg-blue-800' : ''}`}
                    onTouchStart={(e) => {e.preventDefault(); setDirection('RIGHT')}}
                    onClick={() => setDirection('RIGHT')}
                >
                    <ArrowRight className="text-white" />
                </button>
            </div>
            
            <div className="hidden md:block mt-4 text-gray-500 text-sm">
                Usa las ⬆️ ⬇️ ⬅️ ➡️ para moverte
            </div>

            <style>{`
                .clip-triangle {
                    clip-path: polygon(100% 0, 0 50%, 100% 100%);
                }
                @keyframes chomp {
                    0% { clip-path: polygon(100% 0, 0 50%, 100% 100%); }
                    50% { clip-path: polygon(100% 40%, 0 50%, 100% 60%); }
                    100% { clip-path: polygon(100% 0, 0 50%, 100% 100%); }
                }
                .animate-chomp {
                    animation: chomp 0.3s infinite;
                }
            `}</style>
        </div>
    );
};
