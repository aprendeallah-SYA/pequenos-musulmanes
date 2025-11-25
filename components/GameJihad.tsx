import React, { useState } from 'react';
import { Heart, Shield, Zap } from 'lucide-react';

interface Enemy {
    name: string;
    hp: number;
    maxHp: number;
    icon: string;
    weakness: string; // The action that defeats it
}

interface GameProps {
  onExit: () => void;
  addPoints?: (amount: number) => void;
}

export const GameJihad: React.FC<GameProps> = ({ onExit, addPoints }) => {
    const [level, setLevel] = useState(1);
    const [playerHp, setPlayerHp] = useState(100);
    const [enemy, setEnemy] = useState<Enemy>({ name: 'Monstruo Pereza', hp: 50, maxHp: 50, icon: '🦥', weakness: 'prayer' });
    const [log, setLog] = useState<string[]>(["¡El Monstruo ha aparecido!"]);
    const [hasWon, setHasWon] = useState(false);

    const actions = [
        { id: 'prayer', label: 'Hacer Salat', cost: 10, damage: 20, desc: 'Rezar aleja la pereza' },
        { id: 'dua', label: 'Hacer Dua', cost: 5, damage: 15, desc: 'Pedir ayuda a Allah' },
        { id: 'smile', label: 'Sonreír', cost: 5, damage: 10, desc: 'Es Sunnah sonreír' },
        { id: 'patience', label: 'Paciencia', cost: 0, damage: 5, desc: 'Sabr es fuerza' },
    ];

    const handleAction = (action: typeof actions[0]) => {
        let dmg = action.damage;
        
        // Critical hit logic
        if (enemy.weakness === action.id) {
            dmg *= 2;
            setLog(prev => [`¡Super efectivo! Usaste ${action.label}!`, ...prev.slice(0, 2)]);
        } else {
            setLog(prev => [`Usaste ${action.label}.`, ...prev.slice(0, 2)]);
        }

        const newEnemyHp = Math.max(0, enemy.hp - dmg);
        setEnemy({ ...enemy, hp: newEnemyHp });

        if (newEnemyHp === 0) {
            setTimeout(nextLevel, 1000);
        } else {
            // Enemy attacks back
            setTimeout(() => {
                const enemyDmg = Math.floor(Math.random() * 10) + 5;
                setPlayerHp(h => Math.max(0, h - enemyDmg));
                setLog(prev => [`${enemy.name} te susurró cosas malas. -${enemyDmg} HP`, ...prev.slice(0, 2)]);
            }, 500);
        }
    };

    const nextLevel = () => {
        if (level === 3) {
            setLog(["¡Ganaste la batalla interior! MashaAllah."]);
            if (!hasWon) {
                setHasWon(true);
                if (addPoints) addPoints(50);
            }
            return;
        }
        setLevel(l => l + 1);
        setPlayerHp(100);
        if (level === 1) setEnemy({ name: 'Monstruo Ira', hp: 80, maxHp: 80, icon: '😡', weakness: 'patience' });
        if (level === 2) setEnemy({ name: 'Monstruo Egoísmo', hp: 120, maxHp: 120, icon: '👺', weakness: 'smile' });
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-900 text-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-500 relative">
             <button onClick={onExit} className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded text-sm z-10">Salir</button>
            
            {/* Battle Scene */}
            <div className="h-64 bg-gradient-to-b from-indigo-900 to-purple-900 flex items-center justify-between px-12 relative">
                {/* Player */}
                <div className="text-center relative top-8">
                    <div className="text-6xl mb-2">🧕</div>
                    <div className="bg-green-500 h-2 w-20 rounded-full mx-auto">
                        <div className="bg-green-300 h-full rounded-full" style={{ width: `${playerHp}%` }}></div>
                    </div>
                    <p className="text-sm mt-1">HP: {playerHp}</p>
                </div>

                {/* VS */}
                <div className="text-4xl font-bold text-yellow-400 opacity-50">VS</div>

                {/* Enemy */}
                <div className="text-center relative top-8">
                     <div className={`text-8xl mb-2 transition-transform ${enemy.hp === 0 ? 'scale-0' : 'animate-bounce'}`}>
                         {enemy.icon}
                     </div>
                     <div className="bg-red-500 h-2 w-20 rounded-full mx-auto">
                        <div className="bg-red-300 h-full rounded-full" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                    </div>
                     <p className="text-sm mt-1">{enemy.name}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="p-6 bg-gray-800">
                <div className="bg-black/30 p-2 rounded mb-4 text-center text-yellow-300 min-h-[3rem] flex items-center justify-center">
                    {log[0]}
                </div>

                {level <= 3 && enemy.hp > 0 && playerHp > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {actions.map(act => (
                            <button
                                key={act.id}
                                onClick={() => handleAction(act)}
                                className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 p-4 rounded-xl flex flex-col items-center transition-all active:scale-95"
                            >
                                <span className="font-bold text-lg text-white">{act.label}</span>
                                <span className="text-xs text-gray-400">{act.desc}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        {playerHp === 0 ? (
                            <div className="text-red-400 font-bold text-2xl mb-4">¡Intenta de nuevo! Di Astaghfirullah.</div>
                        ) : (
                            <div className="text-green-400 font-bold text-2xl mb-4">¡Jihad completado! Has vencido a tu nafs.</div>
                        )}
                        <button onClick={onExit} className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold">Volver</button>
                    </div>
                )}
                
                <div className="mt-4 text-xs text-gray-500 text-center">
                    *El Jihad al-Nafs es la lucha interna por ser mejor musulmán.
                </div>
            </div>
        </div>
    );
};