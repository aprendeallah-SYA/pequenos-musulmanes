
import React, { useState } from 'react';
import { GameType } from '../types';
import { GameHalalHaram } from './GameHalalHaram';
import { GameJihad } from './GameJihad';
import { GameMaze } from './GameMaze';
import { GameZakatRun } from './GameZakatRun';
import { Play, Lock } from 'lucide-react';

interface SectionGamesProps {
  addPoints?: (amount: number) => void;
  points: number;
}

export const SectionGames: React.FC<SectionGamesProps> = ({ addPoints, points }) => {
    const [activeGame, setActiveGame] = useState<GameType>(GameType.NONE);

    // Definición de juegos con umbral de puntos
    const games = [
        { 
            id: GameType.HALAL_HARAM, 
            title: 'Come Galletas', 
            desc: '¡Elige comida Halal!', 
            color: 'bg-green-400', 
            threshold: 0 
        },
        { 
            id: GameType.JIHAD, 
            title: 'Batalla Interior', 
            desc: 'Vence a la pereza y el enojo', 
            color: 'bg-red-400', 
            threshold: 0 
        },
        { 
            id: GameType.ZAKAT_RUN, 
            title: 'Carrera del Zakat', 
            desc: 'Corre, calcula y ayuda a los pobres', 
            color: 'bg-emerald-500', 
            threshold: 10 // Desbloqueo temprano
        },
        { 
            id: GameType.MAZE, 
            title: 'Laberinto de Pilares', 
            desc: 'Encuentra el camino a la Kaaba', 
            color: 'bg-yellow-400', 
            threshold: 30 // Bloqueado hasta 30 puntos
        }
    ];

    if (activeGame === GameType.HALAL_HARAM) {
        return <div className="p-4"><GameHalalHaram onExit={() => setActiveGame(GameType.NONE)} addPoints={addPoints} /></div>;
    }

    if (activeGame === GameType.JIHAD) {
        return <div className="p-4"><GameJihad onExit={() => setActiveGame(GameType.NONE)} addPoints={addPoints} /></div>;
    }
    
    if (activeGame === GameType.ZAKAT_RUN) {
        return <div className="p-4"><GameZakatRun onExit={() => setActiveGame(GameType.NONE)} addPoints={addPoints} /></div>;
    }

    if (activeGame === GameType.MAZE) {
        return <GameMaze onExit={() => setActiveGame(GameType.NONE)} addPoints={addPoints} />;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-screen">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-sky-500 mb-2">Sala de Juegos</h1>
                <p className="text-gray-500">¡Gana puntos aprendiendo para desbloquear más juegos!</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map(game => {
                    const isLocked = points < game.threshold;
                    
                    return (
                        <div key={game.id} className={`${game.color} rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-all`}>
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Play size={100} fill="white" />
                            </div>
                            
                            <h3 className="text-3xl font-bold text-white mb-2 relative z-10">{game.title}</h3>
                            <p className="text-white text-opacity-90 mb-6 relative z-10">{game.desc}</p>
                            
                            {isLocked ? (
                                <div className="mt-4">
                                    <button disabled className="bg-black/40 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 cursor-not-allowed w-full justify-center">
                                        <Lock size={18} /> Bloqueado
                                    </button>
                                    <p className="text-white text-xs font-bold text-center mt-2 bg-black/20 rounded py-1 px-2 inline-block">
                                        Necesitas {game.threshold} puntos
                                    </p>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setActiveGame(game.id)}
                                    className="bg-white text-gray-800 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-md flex items-center gap-2"
                                >
                                    <Play size={20} className="fill-current" /> ¡Jugar Ahora!
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
