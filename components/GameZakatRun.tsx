
import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Coins, Play, RefreshCw, Trophy, Zap, Activity } from 'lucide-react';
import { playCoin, playJump, playError, playSuccess, playWin, playLevelUp } from '../services/audioService';

interface GameProps {
  onExit: () => void;
  addPoints?: (amount: number) => void;
}

// --- CONFIGURACIÓN DE NIVELES Y ESCENARIOS ---

const LEVELS = [
    { id: 1, name: "Ciudad Neón", theme: 'NEON', goal: 200, speed: 0.6, question: "¿Cuánto es el 2.5% de 2000 (Zakat)?", answer: 50 },
    { id: 2, name: "Atardecer Halal", theme: 'SUNSET', goal: 400, speed: 0.7, question: "Tienes 4000 monedas. El Zakat es...", answer: 100 },
    { id: 3, name: "Autopista Zakat", theme: 'NEON', goal: 600, speed: 0.8, question: "3000 ahorrados - 1000 deuda = 2000. Tu Zakat es...", answer: 50 },
    { id: 4, name: "Oasis Urbano", theme: 'DAY', goal: 800, speed: 0.9, question: "Zakat al-Fitr: 3 personas x 10 monedas. Total:", answer: 30 },
    { id: 5, name: "Velocidad Luz", theme: 'NEON', goal: 1000, speed: 1.0, question: "10000 monedas dividido por 40 es:", answer: 250 },
    { id: 6, name: "Ciudad Dorada", theme: 'GOLD', goal: 1200, speed: 1.1, question: "Zakat al-Fitr: 6 personas x 15 monedas. Total:", answer: 90 },
    { id: 7, name: "Imperio Ummah", theme: 'GOLD', goal: 1500, speed: 1.2, question: "Negocio: 40,000 monedas. El 2.5% es...", answer: 1000 },
    { id: 8, name: "Corazón Puro", theme: 'SUNSET', goal: 2000, speed: 1.4, question: "¿Zakat si tienes menos del mínimo (Nisab)? (1=Sí, 0=No)", answer: 0 }
];

// Temas visuales para el fondo
const THEMES: Record<string, { sky: string, floor: string, buildings: string }> = {
    NEON: {
        sky: "bg-gradient-to-b from-slate-900 via-purple-900 to-black",
        floor: "bg-grid-neon", // Clase CSS personalizada abajo
        buildings: "bg-indigo-900"
    },
    SUNSET: {
        sky: "bg-gradient-to-b from-orange-600 via-red-700 to-purple-900",
        floor: "bg-grid-sunset",
        buildings: "bg-red-950"
    },
    DAY: {
        sky: "bg-gradient-to-b from-sky-400 via-blue-300 to-white",
        floor: "bg-grid-day",
        buildings: "bg-slate-300"
    },
    GOLD: {
        sky: "bg-gradient-to-b from-yellow-600 via-amber-500 to-yellow-100",
        floor: "bg-grid-gold",
        buildings: "bg-amber-800"
    }
};

// Tipos de Obstáculos
type ObstacleType = 'LOW' | 'HIGH' | 'FULL'; 

interface Entity {
    id: number;
    type: 'OBSTACLE' | 'COIN';
    lane: number; // -1, 0, 1
    z: number; // 0 (lejos) a 100 (cerca)
    subtype?: ObstacleType;
    collected?: boolean;
}

// --- COMPONENTE AVATAR ---
const RunnerAvatar: React.FC<{ action: 'RUN' | 'JUMP' | 'DUCK' }> = ({ action }) => {
    return (
        <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible drop-shadow-2xl">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            {/* Sombra */}
            <ellipse cx="50" cy="115" rx="30" ry="8" fill="rgba(0,0,0,0.5)" className={`transition-all duration-200 ${action === 'JUMP' ? 'opacity-30 scale-50' : ''}`} />

            <g transform={`translate(0, ${action === 'JUMP' ? -20 : action === 'DUCK' ? 20 : 0})`} className="transition-transform duration-200">
                {/* Capa/Ropa Trasera */}
                <path d="M30,80 Q50,110 70,80 L70,50 L30,50 Z" fill="#1e293b" />

                {/* Pierna Izquierda (Animada) */}
                <g className={action === 'RUN' ? 'animate-leg-l' : ''}>
                    <rect x="35" y="80" width="12" height="25" rx="5" fill="#334155" />
                    <path d="M35,105 L47,105 L47,110 L35,110 Z" fill="#0f172a" />
                </g>

                {/* Pierna Derecha (Animada) */}
                <g className={action === 'RUN' ? 'animate-leg-r' : ''}>
                    <rect x="53" y="80" width="12" height="25" rx="5" fill="#334155" />
                    <path d="M53,105 L65,105 L65,110 L53,110 Z" fill="#0f172a" />
                </g>

                {/* Cuerpo / Túnica */}
                <path d="M30,40 Q50,35 70,40 L75,85 Q50,95 25,85 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                
                {/* Cabeza */}
                <circle cx="50" cy="30" r="18" fill="#e2c9a6" /> 
                {/* Kufi (Gorro) */}
                <path d="M32,25 Q50,10 68,25 L68,28 Q50,22 32,28 Z" fill="#ffffff" stroke="#cbd5e1" />
                
                {/* Cara */}
                {action === 'JUMP' ? (
                     <g>
                        <circle cx="45" cy="28" r="2" fill="#000" />
                        <circle cx="55" cy="28" r="2" fill="#000" />
                        <path d="M46,35 Q50,30 54,35" stroke="#000" strokeWidth="1.5" fill="none" /> {/* O boca O */}
                     </g>
                ) : (
                    <g>
                        <circle cx="45" cy="30" r="1.5" fill="#000" />
                        <circle cx="55" cy="30" r="1.5" fill="#000" />
                        <path d="M45,36 Q50,38 55,36" stroke="#000" strokeWidth="1.5" fill="none" />
                    </g>
                )}

                {/* Brazos */}
                <g className={action === 'RUN' ? 'animate-arm-l' : ''}>
                    <path d="M28,45 Q20,60 30,70" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" fill="none" />
                </g>
                 <g className={action === 'RUN' ? 'animate-arm-r' : ''}>
                    <path d="M72,45 Q80,60 70,70" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" fill="none" />
                </g>
                
                {/* Bufanda/Detalle */}
                <path d="M35,42 Q50,55 65,42" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />
            </g>
        </svg>
    );
};

export const GameZakatRun: React.FC<GameProps> = ({ onExit, addPoints }) => {
    // --- ESTADOS ---
    const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'MATH' | 'GAMEOVER' | 'WIN'>('INTRO');
    const [levelIdx, setLevelIdx] = useState(0);
    const [coinsCollected, setCoinsCollected] = useState(0);
    const [score, setScore] = useState(0);
    
    // Math Phase
    const [inputVal, setInputVal] = useState("");
    const [feedback, setFeedback] = useState("");

    // Player Physics State
    const [playerLane, setPlayerLane] = useState(0); // -1, 0, 1
    const [playerAction, setPlayerAction] = useState<'RUN' | 'JUMP' | 'DUCK'>('RUN');

    // Refs
    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const gameStateRef = useRef({
        entities: [] as Entity[],
        distance: 0,
        lastSpawn: 0,
        speed: 0.5,
        lane: 0,
        action: 'RUN' as 'RUN' | 'JUMP' | 'DUCK',
        isGameOver: false,
        isPaused: false
    });

    const currentLevel = LEVELS[levelIdx];
    const currentTheme = THEMES[currentLevel.theme];

    // --- CONTROLES ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'PLAYING') return;

            const state = gameStateRef.current;
            
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                if (state.lane > -1) {
                    state.lane--;
                    setPlayerLane(state.lane);
                }
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                if (state.lane < 1) {
                    state.lane++;
                    setPlayerLane(state.lane);
                }
            } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && state.action === 'RUN') {
                state.action = 'JUMP';
                setPlayerAction('JUMP');
                playJump();
                setTimeout(() => {
                    if (gameStateRef.current.action === 'JUMP') {
                        gameStateRef.current.action = 'RUN';
                        setPlayerAction('RUN');
                    }
                }, 700); // Salto dura 700ms
            } else if ((e.key === 'ArrowDown' || e.key === 's') && state.action === 'RUN') {
                state.action = 'DUCK';
                setPlayerAction('DUCK');
                setTimeout(() => {
                    if (gameStateRef.current.action === 'DUCK') {
                        gameStateRef.current.action = 'RUN';
                        setPlayerAction('RUN');
                    }
                }, 700);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    // --- GAME LOOP ---
    const startGame = () => {
        setGameState('PLAYING');
        setCoinsCollected(0);
        setFeedback("");
        setInputVal("");
        
        gameStateRef.current = {
            entities: [],
            distance: 0,
            lastSpawn: 0,
            speed: currentLevel.speed,
            lane: 0,
            action: 'RUN',
            isGameOver: false,
            isPaused: false
        };
        setPlayerLane(0);
        setPlayerAction('RUN');

        lastTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(loop);
    };

    const loop = (time: number) => {
        const deltaTime = Math.min(time - lastTimeRef.current, 100);
        lastTimeRef.current = time;
        const state = gameStateRef.current;

        if (state.isPaused || state.isGameOver) return;

        // 1. Spawn Entities
        state.distance += state.speed;
        if (state.distance - state.lastSpawn > 40) { // Spawn rate
            spawnPattern(state);
            state.lastSpawn = state.distance;
        }

        // 2. Move Entities
        state.entities.forEach(ent => {
            ent.z += state.speed * (deltaTime / 16); 
        });

        // 3. Remove off-screen entities
        state.entities = state.entities.filter(ent => ent.z < 110);

        // 4. Check Collisions
        checkCollisions(state);

        // 5. Check Level Goal
        if (state.coins >= currentLevel.goal) {
            // Wait for animation frame to finish updates
            state.isPaused = true;
            setCoinsCollected(state.coins || 0);
            setGameState('MATH');
            playSuccess();
            return;
        }
        
        // Update coins state for UI less frequently to save renders
        if (Math.floor(state.distance) % 5 === 0) {
            setCoinsCollected((state as any).coins || 0);
        }

        requestRef.current = requestAnimationFrame(loop);
    };

    const spawnPattern = (state: any) => {
        const lanes = [-1, 0, 1];
        const chosenLane = lanes[Math.floor(Math.random() * lanes.length)];
        
        if (Math.random() < 0.4) {
            // Spawn Coins
            for (let i = 0; i < 3; i++) {
                state.entities.push({
                    id: performance.now() + i,
                    type: 'COIN',
                    lane: chosenLane,
                    z: -i * 8 // Closer together
                });
            }
        } else {
            // Spawn Obstacle
            const types: ObstacleType[] = ['LOW', 'HIGH', 'FULL'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            state.entities.push({
                id: performance.now(),
                type: 'OBSTACLE',
                lane: chosenLane,
                z: 0,
                subtype: type
            });
        }
    };

    const checkCollisions = (state: any) => {
        const PLAYER_Z = 90; // Player position fixed near camera
        const HIT_BOX_DEPTH = 8; // Wider hitbox

        if (!state.coins) state.coins = 0;

        state.entities.forEach((ent: Entity) => {
            if (ent.collected) return;

            // Check collision depth
            if (ent.z > PLAYER_Z - HIT_BOX_DEPTH && ent.z < PLAYER_Z + HIT_BOX_DEPTH) {
                if (ent.lane === state.lane) {
                    if (ent.type === 'COIN') {
                        ent.collected = true; // Flag for loop logic
                        
                        // Force a visual update hack by mutating a property React might see later or handling in render
                        // Note: React render loop filters 'collected' entities to 'display:none' immediately.
                        
                        state.coins += 10;
                        playCoin();
                    } else if (ent.type === 'OBSTACLE') {
                        let hit = true;
                        
                        if (ent.subtype === 'LOW' && state.action === 'JUMP') hit = false;
                        if (ent.subtype === 'HIGH' && state.action === 'DUCK') hit = false;

                        if (hit) {
                            handleCrash();
                        }
                    }
                }
            }
        });
    };

    const handleCrash = () => {
        gameStateRef.current.isGameOver = true;
        playError();
        setGameState('GAMEOVER');
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    // --- MATH PHASE ---
    const handleMathSubmit = () => {
        const val = parseFloat(inputVal);
        if (val === currentLevel.answer) {
            playLevelUp();
            setFeedback("¡Acceso Concedido!");
            setScore(s => s + coinsCollected);
            if (addPoints) addPoints(20);
            
            setTimeout(() => {
                if (levelIdx < LEVELS.length - 1) {
                    setLevelIdx(prev => prev + 1);
                    setGameState('INTRO');
                } else {
                    setGameState('WIN');
                    playWin();
                    if (addPoints) addPoints(100);
                }
            }, 1500);
        } else {
            playError();
            setFeedback("Error de Cálculo.");
        }
    };

    // --- 3D PERSPECTIVE CALCULATIONS ---
    const getPerspective = (lane: number, z: number) => {
        const clampedZ = Math.min(Math.max(z, -50), 120);
        const progress = clampedZ / 100; // 0 (far) to 1 (near)
        
        // Scale increases as it gets closer
        const scale = 0.3 + Math.pow(progress, 2) * 1.5; 
        
        // Y Position moves from Horizon to Bottom
        const top = 35 + (progress * 65);
        
        // X Spread based on lane and depth (perspective spread)
        const spread = 80 * progress; 
        const left = 50 + (lane * (spread / 2));

        return {
            left: `${left}%`,
            top: `${top}%`,
            transform: `translate(-50%, -100%) scale(${scale})`,
            zIndex: Math.floor(clampedZ),
            opacity: clampedZ < 0 ? 0 : 1
        };
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 font-mono select-none p-4 overflow-hidden">
            
            {/* GAME VIEWPORT */}
            <div className="relative w-full max-w-4xl h-[600px] bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-slate-700 group">
                
                {/* --- WORLD LAYER --- */}
                
                {/* DYNAMIC SKY */}
                <div className={`absolute inset-0 ${currentTheme.sky} transition-colors duration-1000 z-0`}>
                    <div className="absolute inset-0 opacity-20" 
                         style={{ 
                             backgroundImage: 'radial-gradient(white 1px, transparent 1px)', 
                             backgroundSize: '30px 30px' 
                         }}>
                    </div>
                    {/* Horizon Glow */}
                    <div className="absolute bottom-[40%] w-full h-32 bg-white/20 blur-3xl"></div>
                </div>

                {/* SIDE BUILDINGS (PARALLAX) */}
                <div className="absolute bottom-0 w-full h-[60%] perspective-container z-0 overflow-hidden opacity-80">
                    <div className="absolute inset-0 origin-bottom transform-gpu rotate-x-60">
                        {/* Moving Buildings Left */}
                        <div className={`absolute left-[-20%] w-[40%] h-[300%] ${currentTheme.buildings} ${gameState === 'PLAYING' ? 'animate-city-scroll' : ''} opacity-80 border-r-4 border-black/50`}></div>
                        {/* Moving Buildings Right */}
                        <div className={`absolute right-[-20%] w-[40%] h-[300%] ${currentTheme.buildings} ${gameState === 'PLAYING' ? 'animate-city-scroll' : ''} opacity-80 border-l-4 border-black/50`}></div>
                    </div>
                </div>

                {/* ROAD (3D PLANE) */}
                <div className="absolute bottom-0 w-full h-[60%] perspective-container z-10 overflow-hidden">
                    <div className="absolute inset-0 origin-bottom transform-gpu rotate-x-60">
                         {/* Moving Grid Floor */}
                         <div className={`w-full h-[200%] absolute bottom-0 ${currentTheme.floor} ${gameState === 'PLAYING' ? 'animate-grid-scroll' : ''}`}></div>
                         
                         {/* Lane Lines */}
                         <div className="absolute top-0 bottom-0 left-[33%] w-2 bg-white/30 shadow-[0_0_10px_white]"></div>
                         <div className="absolute top-0 bottom-0 right-[33%] w-2 bg-white/30 shadow-[0_0_10px_white]"></div>
                    </div>
                </div>

                {/* --- ENTITIES LAYER --- */}
                
                {gameStateRef.current.entities.map(ent => (
                    <div 
                        key={ent.id}
                        className={`absolute flex items-end justify-center pointer-events-none ${ent.collected ? 'hidden' : ''}`} // HIDE INSTANTLY
                        style={getPerspective(ent.lane, ent.z)}
                    >
                        {ent.type === 'COIN' ? (
                            <div className="relative animate-spin-slow">
                                <div className="text-6xl text-yellow-300 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">🪙</div>
                            </div>
                        ) : (
                            <div className="relative flex flex-col items-center">
                                {/* OBSTACLE VISUALS */}
                                <div className={`
                                    relative border-4 border-white/20 rounded-lg flex items-center justify-center shadow-xl
                                    ${ent.subtype === 'LOW' ? 'w-32 h-16 bg-red-600/90' : ''}
                                    ${ent.subtype === 'HIGH' ? 'w-32 h-32 bg-purple-600/90 mb-16' : ''} // Floating high
                                    ${ent.subtype === 'FULL' ? 'w-32 h-32 bg-slate-800/90' : ''}
                                `}>
                                    {/* Icon/Symbol on Obstacle */}
                                    <span className="text-4xl">
                                        {ent.subtype === 'LOW' && '🚧'}
                                        {ent.subtype === 'HIGH' && '🦅'}
                                        {ent.subtype === 'FULL' && '🛑'}
                                    </span>

                                    {/* 3D Depth Side (Fake 3D) */}
                                    <div className="absolute -right-2 top-2 w-2 h-full bg-black/40 skew-y-12 rounded-r"></div>
                                    <div className="absolute -bottom-2 left-2 w-full h-2 bg-black/40 skew-x-12 rounded-b"></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* --- PLAYER LAYER --- */}
                <div 
                    className={`absolute transition-all duration-100 ease-linear z-30 flex flex-col items-center`}
                    style={{
                        ...getPerspective(playerLane, 90),
                        transform: `translate(-50%, -100%) scale(1.6) ${playerAction === 'JUMP' ? 'translateY(-80px)' : ''} ${playerAction === 'DUCK' ? 'scaleY(0.7)' : ''}`
                    }}
                >
                    <div className="w-24 h-24">
                        <RunnerAvatar action={playerAction} />
                    </div>
                </div>

                {/* --- HUD LAYER --- */}
                <div className="absolute top-0 w-full p-6 z-50 flex justify-between items-start pointer-events-none">
                     {/* Score Box */}
                     <div className="flex flex-col gap-2">
                         <div className={`bg-black/70 border-2 border-yellow-400 px-6 py-2 rounded-xl text-yellow-400 font-bold text-2xl flex items-center gap-3 shadow-lg`}>
                             <Coins /> {coinsCollected} <span className="text-sm opacity-70">/ {currentLevel.goal}</span>
                         </div>
                         <div className="bg-black/60 px-4 py-1 rounded-lg text-white text-sm font-bold flex items-center gap-2 w-fit">
                             <Activity size={14}/> VEL: {currentLevel.speed.toFixed(1)}x
                         </div>
                     </div>

                     {/* Level Box */}
                     <div className="text-right bg-black/40 p-2 rounded-xl backdrop-blur-sm">
                         <h2 className="text-4xl font-black text-white drop-shadow-md tracking-wider">
                             NIVEL {levelIdx + 1}
                         </h2>
                         <p className="text-yellow-300 text-sm uppercase tracking-widest font-bold">{currentLevel.name}</p>
                     </div>
                </div>

                {/* --- OVERLAYS --- */}
                
                {/* INTRO */}
                {gameState === 'INTRO' && (
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8 border-4 border-cyan-500/20 m-4 rounded-xl">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-6 shadow-[0_0_30px_cyan] animate-bounce">
                            <Zap size={64} className="text-white" />
                        </div>
                        <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">ZAKAT RUNNER</h1>
                        <p className="text-cyan-300 text-xl font-bold mb-8 uppercase tracking-widest">{currentLevel.name}</p>
                        
                        <div className="grid grid-cols-3 gap-8 mb-10 text-white/80">
                            <div className="flex flex-col items-center">
                                <span className="text-4xl mb-2">⬆️</span>
                                <span className="text-xs font-bold bg-cyan-900 px-2 py-1 rounded">SALTAR</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl mb-2">⬇️</span>
                                <span className="text-xs font-bold bg-purple-900 px-2 py-1 rounded">AGACHAR</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl mb-2">⬅️➡️</span>
                                <span className="text-xs font-bold bg-pink-900 px-2 py-1 rounded">MOVER</span>
                            </div>
                        </div>

                        <button onClick={startGame} className="group relative px-10 py-4 bg-cyan-500 text-black font-black text-2xl rounded-sm hover:bg-cyan-400 transition-all clip-path-slant">
                            <span className="relative z-10 flex items-center gap-2"><Play fill="black" /> INICIAR CARRERA</span>
                        </button>
                    </div>
                )}

                {/* MATH HACKING */}
                {gameState === 'MATH' && (
                    <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-8 font-mono">
                        <div className="w-full max-w-lg border-2 border-green-500 p-8 rounded bg-black/50 shadow-[0_0_30px_rgba(0,255,0,0.2)]">
                             <h2 className="text-green-500 text-xl mb-6 border-b border-green-500/30 pb-2 flex items-center gap-2">
                                <Calculator size={20}/> CALCULAR ZAKAT
                             </h2>
                             <p className="text-white text-lg mb-8 leading-relaxed">
                                 {currentLevel.question}
                             </p>
                             
                             <div className="flex gap-4">
                                 <input 
                                     type="number"
                                     value={inputVal}
                                     onChange={(e) => setInputVal(e.target.value)}
                                     className="bg-black border-2 border-green-500 text-green-500 p-3 text-2xl w-full focus:outline-none focus:shadow-[0_0_15px_green]"
                                     placeholder="_"
                                     autoFocus
                                 />
                                 <button onClick={handleMathSubmit} className="bg-green-600 text-black font-bold px-6 py-3 hover:bg-green-500">
                                     PAGAR
                                 </button>
                             </div>

                             {feedback && (
                                 <div className={`mt-6 p-3 text-center font-bold ${feedback.includes('Concedido') ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'}`}>
                                     {`> ${feedback}`}
                                 </div>
                             )}
                        </div>
                    </div>
                )}

                {/* GAME OVER */}
                {gameState === 'GAMEOVER' && (
                    <div className="absolute inset-0 bg-red-950/90 z-50 flex flex-col items-center justify-center p-8 text-center animate-pulse">
                        <h2 className="text-6xl font-black text-red-500 mb-2">¡CHOQUE!</h2>
                        <p className="text-red-200 mb-8 text-xl">Cuidado con los obstáculos Haram.</p>
                        <button onClick={startGame} className="px-8 py-3 border-2 border-white text-white font-bold hover:bg-white hover:text-red-900 transition-colors flex items-center gap-2">
                            <RefreshCw /> REINTENTAR
                        </button>
                        <button onClick={onExit} className="mt-4 text-red-400 hover:text-white text-sm">SALIR</button>
                    </div>
                )}

                {/* WIN */}
                {gameState === 'WIN' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-purple-900 z-50 flex flex-col items-center justify-center p-8 text-center">
                        <Trophy size={100} className="text-yellow-300 mb-6 drop-shadow-[0_0_20px_gold] animate-bounce" />
                        <h1 className="text-5xl font-black text-white mb-4">¡MAESTRO ZAKAT!</h1>
                        <p className="text-xl text-yellow-100 mb-8 max-w-md">Has purificado tu riqueza y ayudado a la Ummah.</p>
                        <button onClick={onExit} className="bg-white text-purple-900 px-10 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl">
                            MENÚ PRINCIPAL
                        </button>
                    </div>
                )}

                {/* MOBILE CONTROLS OVERLAY */}
                <div className="absolute bottom-0 w-full h-32 flex md:hidden z-40">
                    <div className="w-1/3 h-full border-r border-white/10 active:bg-white/10" onTouchStart={() => { if(playerLane > -1) setPlayerLane(l => l-1) }}></div>
                    <div className="w-1/3 h-full flex flex-col">
                        <div className="h-1/2 border-b border-white/10 active:bg-white/10" onTouchStart={() => { setPlayerAction('JUMP'); playJump(); }}></div>
                        <div className="h-1/2 active:bg-white/10" onTouchStart={() => { setPlayerAction('DUCK'); }}></div>
                    </div>
                    <div className="w-1/3 h-full border-l border-white/10 active:bg-white/10" onTouchStart={() => { if(playerLane < 1) setPlayerLane(l => l+1) }}></div>
                </div>

            </div>

            {/* STYLES FOR 3D & ANIMATION */}
            <style>{`
                .perspective-container {
                    perspective: 600px;
                }
                .rotate-x-60 {
                    transform: rotateX(60deg) scale(2);
                }
                /* NEON THEME */
                .bg-grid-neon {
                    background-image: 
                        linear-gradient(rgba(139, 92, 246, 0.5) 2px, transparent 2px),
                        linear-gradient(90deg, rgba(139, 92, 246, 0.5) 2px, transparent 2px);
                    background-size: 80px 80px;
                    background-color: #0f172a;
                }
                /* SUNSET THEME */
                .bg-grid-sunset {
                     background-image: 
                        linear-gradient(rgba(255, 165, 0, 0.5) 2px, transparent 2px),
                        linear-gradient(90deg, rgba(255, 165, 0, 0.5) 2px, transparent 2px);
                    background-size: 80px 80px;
                    background-color: #451a03;
                }
                /* DAY THEME */
                .bg-grid-day {
                     background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.8) 2px, transparent 2px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.8) 2px, transparent 2px);
                    background-size: 80px 80px;
                    background-color: #0ea5e9;
                }
                /* GOLD THEME */
                .bg-grid-gold {
                     background-image: 
                        linear-gradient(rgba(255, 215, 0, 0.6) 2px, transparent 2px),
                        linear-gradient(90deg, rgba(255, 215, 0, 0.6) 2px, transparent 2px);
                    background-size: 80px 80px;
                    background-color: #78350f;
                }

                @keyframes gridScroll {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(80px); }
                }
                .animate-grid-scroll {
                    animation: gridScroll 0.4s linear infinite;
                }

                @keyframes cityScroll {
                     0% { transform: translateY(0); }
                    100% { transform: translateY(200px); }
                }
                .animate-city-scroll {
                     animation: cityScroll 2s linear infinite;
                }
                
                @keyframes legL {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes legR {
                    0%, 100% { transform: translateY(-10px); }
                    50% { transform: translateY(0); }
                }
                .animate-leg-l { animation: legL 0.3s infinite; }
                .animate-leg-r { animation: legR 0.3s infinite; }

                @keyframes armL {
                    0%, 100% { transform: rotate(-20deg); }
                    50% { transform: rotate(20deg); }
                }
                @keyframes armR {
                    0%, 100% { transform: rotate(20deg); }
                    50% { transform: rotate(-20deg); }
                }
                .animate-arm-l { transform-origin: 30px 45px; animation: armL 0.3s infinite; }
                .animate-arm-r { transform-origin: 70px 45px; animation: armR 0.3s infinite; }

                .clip-path-slant {
                    clip-path: polygon(10% 0, 100% 0, 90% 100%, 0% 100%);
                }
            `}</style>
        </div>
    );
};
