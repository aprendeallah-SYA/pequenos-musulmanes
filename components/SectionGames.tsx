import React, { useState } from 'react';
import { GameType } from '../types';
import { GameHalalHaram } from './GameHalalHaram';
import { GameJihad } from './GameJihad';
import { GameMaze } from './GameMaze';
import { GameObstacle } from './GameObstacle';
import { Play, Lock } from 'lucide-react';

interface SectionGamesProps {
  addPoints?: (amount: number) => void;
}

export const SectionGames: React.FC<SectionGamesProps> = ({ addPoints }) => {
    const [activeGame, setActiveGame] = useState<GameType>(GameType.NONE);

    const games = [
        { id: GameType.HALAL_HARAM, title: 'Come Galletas', desc: '¡Elige comida Halal!', color: 'bg-green-400', locked: false },
        { id: GameType.JIHAD, title: 'Batalla Interior', desc: 'Vence a la pereza y el enojo', color: 'bg-red-400', locked: false },
        { id: GameType.MAZE, title: 'Laberinto de Pilares', desc: 'Encuentra el camino a la Kaaba', color: 'bg-yellow-400', locked: false }, 
        { id: GameType.OBSTACLE, title: 'Camino a la Mezquita', desc: 'Supera obstáculos para llegar al Salat', color: 'bg-blue-400', locked: false },
    ];

    if (activeGame === GameType.HALAL_HARAM) {
        return <div className="p-4"><GameHalalHaram onExit={() => setActiveGame(GameType.NONE)} addPoints={addPoints} /></div>;
    }

    if (activeGame === GameType.JIHAD) {
        return <div className="p-4"><GameJihad onExit={() => setActiveGame(GameType.NONE)} addPoints={addPoints} /></div>;
    }

    if (activeGame === GameType.MAZE) {
        return <GameMaze onExit={() => setActiveGame(GameType.NONE)} addPoints={addPoints} />;
    }

    if (activeGame === GameType.OBSTACLE) {
        return <GameObstacle onExit={() => setActiveGame(GameType.NONE)} addPoints={addPoints} />;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-screen">
            <h1 className="text-4xl font-bold text-center text-sky-500 mb-8">Sala de Juegos</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map(game => (
                    <div key={game.id} className={`${game.color} rounded-3xl p-6 shadow-xl relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Play size={100} fill="white" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2 relative z-10">{game.title}</h3>
                        <p className="text-white text-opacity-90 mb-6 relative z-10">{game.desc}</p>
                        
                        {game.locked ? (
                            <button disabled className="bg-black/20 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 cursor-not-allowed">
                                <Lock size={16} /> Próximamente
                            </button>
                        ) : (
                            <button 
                                onClick={() => setActiveGame(game.id)}
                                className="bg-white text-gray-800 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-md"
                            >
                                ¡Jugar Ahora!
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};