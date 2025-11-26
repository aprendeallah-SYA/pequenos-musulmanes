
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Shield, Zap, RefreshCw, Trophy } from 'lucide-react';
import { playDamage, playWin, playLevelUp, playSpirit, playHappy, playShield, playHit } from '../services/audioService';

interface GameProps {
  onExit: () => void;
  addPoints?: (amount: number) => void;
}

// --- CONSTANTS & CONFIG ---
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const SPEED = 5;
const GROUND_Y = 300; // Pixel position of the floor
const ATTACK_COOLDOWN = 500; // ms
const ARENA_WIDTH = 800;

const ENEMIES = [
    { name: 'Monstruo Pereza', hp: 100, icon: '🦥', color: 'text-blue-400', speed: 2, damage: 5 },
    { name: 'Monstruo Ira', hp: 150, icon: '😡', color: 'text-red-500', speed: 3, damage: 8 },
    { name: 'Monstruo Ego', hp: 200, icon: '👺', color: 'text-purple-500', speed: 4, damage: 10 },
];

export const GameJihad: React.FC<GameProps> = ({ onExit, addPoints }) => {
    // --- STATE FOR UI ---
    const [level, setLevel] = useState(0);
    const [playerHp, setPlayerHp] = useState(100);
    const [enemyHp, setEnemyHp] = useState(100);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);

    // --- REFS FOR PHYSICS ENGINE (To avoid re-renders on every frame) ---
    const gameState = useRef({
        player: { x: 100, y: GROUND_Y, vx: 0, vy: 0, isGrounded: true, facing: 1, action: 'idle', cooldown: 0, hp: 100 }, // facing 1: right, -1: left
        enemy: { x: 600, y: GROUND_Y, vx: 0, vy: 0, isGrounded: true, facing: -1, action: 'idle', cooldown: 0, hp: 100 },
        keys: {} as Record<string, boolean>,
        lastTime: 0,
        levelIndex: 0
    });

    const requestRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        startLevel(0);
        
        const handleKeyDown = (e: KeyboardEvent) => {
            gameState.current.keys[e.key.toLowerCase()] = true;
            // Prevent scrolling
            if(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            gameState.current.keys[e.key.toLowerCase()] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        requestRef.current = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const startLevel = (lvlIdx: number) => {
        if (lvlIdx >= ENEMIES.length) {
            setGameWon(true);
            playWin();
            if (addPoints) addPoints(50);
            return;
        }

        gameState.current.levelIndex = lvlIdx;
        gameState.current.player = { ...gameState.current.player, x: 100, y: GROUND_Y, hp: 100 }; // Reset position
        gameState.current.enemy = { ...gameState.current.enemy, x: 600, y: GROUND_Y, hp: ENEMIES[lvlIdx].hp };
        
        setLevel(lvlIdx + 1);
        setPlayerHp(100);
        setEnemyHp(ENEMIES[lvlIdx].hp);
        setGameOver(false);
        setWinner(null);
        playLevelUp();
    };

    // --- GAME LOOP ---
    const gameLoop = (time: number) => {
        if (!gameState.current.lastTime) gameState.current.lastTime = time;
        // const deltaTime = time - gameState.current.lastTime; // Can be used for smoother delta time movement
        gameState.current.lastTime = time;

        if (!gameOver && !gameWon) {
            updatePhysics();
            updateAI();
        }
        
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const updatePhysics = () => {
        const state = gameState.current;
        const keys = state.keys;
        const player = state.player;
        const enemy = state.enemy;

        // --- PLAYER CONTROLS ---
        
        // Movement
        if (keys['arrowright'] || keys['d']) {
            player.vx = SPEED;
            player.facing = 1;
        } else if (keys['arrowleft'] || keys['a']) {
            player.vx = -SPEED;
            player.facing = -1;
        } else {
            player.vx = 0;
        }

        // Jump
        if ((keys['arrowup'] || keys['w'] || keys[' ']) && player.isGrounded) {
            player.vy = JUMP_FORCE;
            player.isGrounded = false;
        }

        // Attacks
        if (Date.now() > player.cooldown) {
            if (keys['j'] || keys['z']) performAttack('smile');
            else if (keys['k'] || keys['x']) performAttack('dua');
            else if (keys['l'] || keys['c']) performAttack('salat');
            else if (player.action !== 'hurt') player.action = player.vx !== 0 ? 'walk' : 'idle';
        }

        // Apply Physics (Player)
        player.vy += GRAVITY;
        player.x += player.vx;
        player.y += player.vy;

        // Ground Collision
        if (player.y >= GROUND_Y) {
            player.y = GROUND_Y;
            player.vy = 0;
            player.isGrounded = true;
        }
        // Wall Collision
        if (player.x < 0) player.x = 0;
        if (player.x > ARENA_WIDTH - 50) player.x = ARENA_WIDTH - 50;


        // Apply Physics (Enemy)
        enemy.vy += GRAVITY;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        if (enemy.y >= GROUND_Y) {
            enemy.y = GROUND_Y;
            enemy.vy = 0;
            enemy.isGrounded = true;
        }
        if (enemy.x < 0) enemy.x = 0;
        if (enemy.x > ARENA_WIDTH - 50) enemy.x = ARENA_WIDTH - 50;

        // Render updates (Direct DOM manipulation for performance)
        updateDOM();
    };

    const updateAI = () => {
        const state = gameState.current;
        const player = state.player;
        const enemy = state.enemy;
        const currentEnemyData = ENEMIES[state.levelIndex];

        // Simple AI: Move towards player
        const distance = Math.abs(player.x - enemy.x);
        const attackRange = 60;

        if (distance > attackRange) {
            // Move closer
            if (player.x > enemy.x) {
                enemy.vx = currentEnemyData.speed * 0.5; // Slower than player
                enemy.facing = 1;
            } else {
                enemy.vx = -currentEnemyData.speed * 0.5;
                enemy.facing = -1;
            }
            enemy.action = 'walk';
        } else {
            // Attack if close and ready
            enemy.vx = 0;
            if (Date.now() > enemy.cooldown) {
                performEnemyAttack(currentEnemyData.damage);
            } else if (enemy.action !== 'attack' && enemy.action !== 'hurt') {
                 enemy.action = 'idle';
            }
        }
    };

    const performAttack = (type: 'smile' | 'dua' | 'salat') => {
        const state = gameState.current;
        const player = state.player;
        const enemy = state.enemy;
        
        player.action = type;
        
        let range = 80;
        let damage = 5;
        let cooldownTime = 400;

        if (type === 'smile') { // Fast Attack
            playHappy();
            range = 80;
            damage = 8;
            cooldownTime = 300;
        } else if (type === 'dua') { // Block/Push
            playShield();
            range = 100;
            damage = 2;
            cooldownTime = 600;
            // Push back effect
            if (Math.abs(player.x - enemy.x) < 120) {
                 enemy.vx = player.facing * 10;
                 enemy.x += enemy.vx; 
            }
        } else if (type === 'salat') { // Heavy Attack
            playSpirit();
            range = 150;
            damage = 15;
            cooldownTime = 1000;
        }

        player.cooldown = Date.now() + cooldownTime;

        // Check Hit
        const dist = Math.abs((player.x + 25) - (enemy.x + 25)); // Center to center roughly
        // Check direction
        const facingEnemy = (player.facing === 1 && enemy.x > player.x) || (player.facing === -1 && enemy.x < player.x);

        if (dist < range && facingEnemy) {
            // HIT!
            setTimeout(() => {
                playHit();
                const newHp = Math.max(0, enemy.hp - damage);
                enemy.hp = newHp;
                setEnemyHp(newHp);
                enemy.action = 'hurt';
                enemy.cooldown = Date.now() + 500; // Stun enemy briefly
                
                if (newHp <= 0) {
                    handleWin();
                }
            }, 100); // Slight delay for animation sync
        }
    };

    const performEnemyAttack = (damage: number) => {
        const state = gameState.current;
        const enemy = state.enemy;
        const player = state.player;

        enemy.action = 'attack';
        enemy.cooldown = Date.now() + 1500; // Slow attacks

        // Check if player is blocking (Dua action reduces damage)
        const isBlocking = player.action === 'dua';
        const actualDamage = isBlocking ? 0 : damage;

        setTimeout(() => {
             // Check hit again in case player moved
            const dist = Math.abs(player.x - enemy.x);
            if (dist < 80) {
                if (isBlocking) {
                    playShield();
                } else {
                    playDamage();
                    const newHp = Math.max(0, player.hp - actualDamage);
                    player.hp = newHp;
                    setPlayerHp(newHp);
                    player.action = 'hurt';
                    if (newHp <= 0) {
                        handleGameOver();
                    }
                }
            }
        }, 200);
    };

    const handleWin = () => {
        setWinner('player');
        setTimeout(() => {
            startLevel(gameState.current.levelIndex + 1);
        }, 2000);
    };

    const handleGameOver = () => {
        setWinner('enemy');
        setGameOver(true);
    };

    // --- DOM UPDATER (Avoids React Render Cycle for 60fps) ---
    const updateDOM = () => {
        const state = gameState.current;
        if (!containerRef.current) return;

        const playerEl = document.getElementById('player-sprite');
        const enemyEl = document.getElementById('enemy-sprite');

        if (playerEl) {
            playerEl.style.transform = `translate(${state.player.x}px, ${state.player.y}px) scaleX(${state.player.facing})`;
            // Update animation class based on action is handled by React partly, but we can toggle classes here for purity if needed
            // For now, we rely on the action state variable which might lag slightly in UI render vs physics, 
            // but for this simple game, we can pass action via style or ref.
            // Let's rely on React re-rendering action prop for sprite change or use data attributes.
            playerEl.dataset.action = state.player.action;
        }
        if (enemyEl) {
            enemyEl.style.transform = `translate(${state.enemy.x}px, ${state.enemy.y}px) scaleX(${state.enemy.facing})`;
            enemyEl.dataset.action = state.enemy.action;
        }
    };

    // --- RENDER HELPERS ---
    const getPlayerEmoji = (action: string) => {
        switch(action) {
            case 'smile': return '🤜';
            case 'dua': return '🛡️';
            case 'salat': return '✨';
            case 'hurt': return '😣';
            case 'walk': return '🏃';
            default: return '🧕';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black/90 p-4 font-sans select-none">
            
            {/* GAME CONTAINER */}
            <div 
                ref={containerRef}
                className="relative bg-gray-800 rounded-lg shadow-2xl overflow-hidden border-4 border-yellow-600"
                style={{ width: ARENA_WIDTH, height: 450 }}
            >
                {/* BACKGROUND */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-purple-900 opacity-80"></div>
                <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                
                {/* HUD */}
                <div className="absolute top-0 w-full p-4 flex justify-between items-start z-20">
                    {/* Player Health */}
                    <div className="w-1/3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-10 h-10 bg-green-600 rounded-full border-2 border-white flex items-center justify-center text-xl shadow-lg z-10">🧕</div>
                            <span className="text-white font-bold text-shadow">Tú</span>
                        </div>
                        <div className="h-6 bg-gray-700 rounded-full border-2 border-gray-500 overflow-hidden relative">
                             <div 
                                className="h-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-200"
                                style={{ width: `${playerHp}%` }}
                             ></div>
                        </div>
                    </div>

                    {/* Timer / Level Info */}
                    <div className="text-center text-white">
                        <div className="text-3xl font-black text-yellow-400 drop-shadow-md">VS</div>
                        <div className="bg-black/40 px-3 py-1 rounded text-xs">Nivel {level}</div>
                    </div>

                    {/* Enemy Health */}
                    <div className="w-1/3 text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-white font-bold text-shadow">{ENEMIES[gameState.current.levelIndex]?.name}</span>
                            <div className="w-10 h-10 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-xl shadow-lg z-10">
                                {ENEMIES[gameState.current.levelIndex]?.icon}
                            </div>
                        </div>
                         <div className="h-6 bg-gray-700 rounded-full border-2 border-gray-500 overflow-hidden relative">
                             <div 
                                className="h-full bg-gradient-to-l from-red-500 to-red-300 transition-all duration-200 ml-auto"
                                style={{ width: `${(enemyHp / ENEMIES[gameState.current.levelIndex]?.hp) * 100}%` }}
                             ></div>
                        </div>
                    </div>
                </div>

                {/* GAME WORLD */}
                
                {/* Player Sprite */}
                <div 
                    id="player-sprite"
                    className="absolute w-16 h-24 flex flex-col items-center justify-end transition-transform duration-75 z-10"
                    style={{ left: 0, top: 0, width: 80, height: 100 }} // Base dimensions
                >
                     {/* Action Visual Effect */}
                     {gameState.current.player.action === 'salat' && (
                         <div className="absolute left-10 -top-4 text-4xl animate-ping">✨</div>
                     )}
                     {gameState.current.player.action === 'dua' && (
                         <div className="absolute inset-0 bg-blue-400/30 rounded-full animate-pulse border-2 border-blue-200"></div>
                     )}

                     <div className="text-7xl filter drop-shadow-2xl relative">
                         {getPlayerEmoji(gameState.current.player.action)}
                     </div>
                </div>

                {/* Enemy Sprite */}
                <div 
                    id="enemy-sprite"
                    className="absolute flex flex-col items-center justify-end transition-transform duration-75 z-10"
                    style={{ left: 0, top: 0, width: 80, height: 100 }}
                >
                    <div className={`text-7xl filter drop-shadow-2xl ${gameState.current.enemy.action === 'hurt' ? 'animate-shake grayscale' : ''}`}>
                        {ENEMIES[gameState.current.levelIndex]?.icon}
                    </div>
                </div>

                {/* Floor */}
                <div 
                    className="absolute w-full h-4 bg-gray-600 border-t-4 border-gray-400"
                    style={{ top: GROUND_Y + 90 }} // Align with sprite bottom
                ></div>


                {/* OVERLAYS */}
                {winner === 'player' && (
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                        <div className="bg-green-600 text-white font-black text-6xl px-12 py-6 rounded-xl border-4 border-white transform -rotate-3 shadow-2xl animate-bounce">
                            ¡MashaAllah!
                        </div>
                    </div>
                )}
                {winner === 'enemy' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                         <h2 className="text-red-500 text-6xl font-black mb-4 animate-pulse">¡Derrotado!</h2>
                         <button 
                            onClick={() => startLevel(0)}
                            className="bg-white text-red-600 px-8 py-3 rounded-full font-bold text-xl hover:scale-110 transition-transform flex items-center gap-2"
                         >
                            <RefreshCw /> Reintentar
                         </button>
                    </div>
                )}
                
                {gameWon && (
                     <div className="absolute inset-0 bg-yellow-500 flex flex-col items-center justify-center z-40 text-center p-8">
                         <Trophy className="w-32 h-32 text-white mb-6 animate-bounce" />
                         <h1 className="text-5xl font-black text-white mb-4">¡Jihad Completado!</h1>
                         <p className="text-white text-xl mb-8 font-bold">Has vencido a tus batallas internas con paciencia y fe.</p>
                         <button onClick={onExit} className="bg-white text-yellow-600 px-8 py-3 rounded-full font-bold text-xl shadow-xl">
                             Volver al Menú
                         </button>
                     </div>
                )}
            </div>

            {/* CONTROLS INSTRUCTIONS */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-white max-w-4xl w-full">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-600">
                    <h3 className="font-bold text-yellow-400 mb-2 border-b border-gray-600 pb-1">Movimiento</h3>
                    <div className="flex gap-4 text-sm justify-center">
                        <div className="flex flex-col items-center"><span className="kbd">W / ↑</span> Salt</div>
                        <div className="flex flex-col items-center"><span className="kbd">A / ←</span> Izq</div>
                        <div className="flex flex-col items-center"><span className="kbd">D / →</span> Der</div>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-600">
                     <h3 className="font-bold text-green-400 mb-2 border-b border-gray-600 pb-1">Combate</h3>
                     <div className="grid grid-cols-3 gap-2 text-sm text-center">
                         <div className="flex flex-col items-center">
                             <span className="text-2xl">🤜</span>
                             <span className="font-bold text-yellow-200">J / Z</span>
                             <span className="text-xs text-gray-400">Sonrisa (Rápido)</span>
                         </div>
                         <div className="flex flex-col items-center">
                             <span className="text-2xl">🛡️</span>
                             <span className="font-bold text-blue-200">K / X</span>
                             <span className="text-xs text-gray-400">Dua (Bloqueo)</span>
                         </div>
                         <div className="flex flex-col items-center">
                             <span className="text-2xl">✨</span>
                             <span className="font-bold text-purple-200">L / C</span>
                             <span className="text-xs text-gray-400">Salat (Poder)</span>
                         </div>
                     </div>
                </div>
            </div>

            {/* MOBILE CONTROLS (VISIBLE ONLY ON SMALL SCREENS) */}
            <div className="md:hidden mt-4 w-full grid grid-cols-2 gap-2">
                 {/* Left: Move */}
                 <div className="grid grid-cols-3 gap-1">
                     <div></div>
                     <button className="bg-gray-700 p-4 rounded text-white active:bg-blue-600" onTouchStart={(e) => { gameState.current.keys['arrowup'] = true; }} onTouchEnd={() => gameState.current.keys['arrowup'] = false}>↑</button>
                     <div></div>
                     <button className="bg-gray-700 p-4 rounded text-white active:bg-blue-600" onTouchStart={(e) => { gameState.current.keys['arrowleft'] = true; }} onTouchEnd={() => gameState.current.keys['arrowleft'] = false}>←</button>
                     <button className="bg-gray-700 p-4 rounded text-white active:bg-blue-600" onTouchStart={(e) => { gameState.current.keys['arrowdown'] = true; }} onTouchEnd={() => gameState.current.keys['arrowdown'] = false}>↓</button>
                     <button className="bg-gray-700 p-4 rounded text-white active:bg-blue-600" onTouchStart={(e) => { gameState.current.keys['arrowright'] = true; }} onTouchEnd={() => gameState.current.keys['arrowright'] = false}>→</button>
                 </div>
                 {/* Right: Action */}
                 <div className="flex gap-2 items-center justify-center">
                      <button className="w-16 h-16 rounded-full bg-yellow-600 text-white font-bold border-4 border-yellow-400 active:scale-95 shadow-lg" onClick={() => performAttack('smile')}>🤜</button>
                      <button className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold border-4 border-blue-400 active:scale-95 shadow-lg" onClick={() => performAttack('dua')}>🛡️</button>
                      <button className="w-16 h-16 rounded-full bg-purple-600 text-white font-bold border-4 border-purple-400 active:scale-95 shadow-lg" onClick={() => performAttack('salat')}>✨</button>
                 </div>
            </div>

            <style>{`
                .kbd {
                    background: #333;
                    border-radius: 4px;
                    border-bottom: 2px solid #000;
                    padding: 2px 6px;
                    font-family: monospace;
                    font-weight: bold;
                }
                .text-shadow {
                    text-shadow: 2px 2px 0 #000;
                }
            `}</style>
        </div>
    );
};
