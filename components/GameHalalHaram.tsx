import React, { useState, useEffect } from 'react';

const ITEMS = [
    { name: 'Manzana', type: 'halal', icon: '🍎' },
    { name: 'Cerdo', type: 'haram', icon: '🐷' },
    { name: 'Pollo (Halal)', type: 'halal', icon: '🍗' },
    { name: 'Vino', type: 'haram', icon: '🍷' },
    { name: 'Agua', type: 'halal', icon: '💧' },
    { name: 'Galleta', type: 'halal', icon: '🍪' },
];

interface GameProps {
  onExit: () => void;
  addPoints?: (amount: number) => void;
}

export const GameHalalHaram: React.FC<GameProps> = ({ onExit, addPoints }) => {
    const [score, setScore] = useState(0);
    const [currentItem, setCurrentItem] = useState(ITEMS[0]);
    const [message, setMessage] = useState("¡Ayuda al Come-Galletas Musulmán!");
    const [animation, setAnimation] = useState('');

    const generateNewItem = () => {
        const random = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        setCurrentItem(random);
    };

    const handleChoice = (choice: 'halal' | 'haram') => {
        if (choice === currentItem.type) {
            setScore(s => s + 10);
            setMessage("¡Correcto! MashaAllah.");
            setAnimation('scale-125 text-green-500');
            if (addPoints) addPoints(5); // Add 5 global points per correct answer
        } else {
            setScore(s => Math.max(0, s - 5));
            setMessage(currentItem.type === 'haram' ? "¡Oh no! Eso es Haram." : "¡Espera! Eso sí es Halal.");
            setAnimation('shake text-red-500');
        }
        
        setTimeout(() => {
            setAnimation('');
            generateNewItem();
        }, 800);
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-400">
            <div className="bg-blue-400 p-4 flex justify-between items-center text-white">
                <button onClick={onExit}>Salir</button>
                <h2 className="font-bold text-xl">Puntos: {score}</h2>
            </div>
            
            <div className="p-8 text-center space-y-8">
                <div className="text-xl font-bold text-gray-700 h-8">{message}</div>
                
                <div className={`transition-transform duration-300 transform ${animation}`}>
                    <div className="text-9xl mb-4">{currentItem.icon}</div>
                    <div className="text-2xl font-bold">{currentItem.name}</div>
                </div>

                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => handleChoice('halal')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1"
                    >
                        HALAL (Comer)
                    </button>
                    <button 
                        onClick={() => handleChoice('haram')}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
                    >
                        HARAM (Evitar)
                    </button>
                </div>
            </div>
        </div>
    );
};