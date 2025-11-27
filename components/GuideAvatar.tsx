
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Trophy, BookOpen, Gamepad2 } from 'lucide-react';

export const GuideAvatar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  const messages = [
    { text: "¡Salam! Soy Robo-Muslim 🤖. ¡Estoy aquí para ayudarte a aprender!", icon: <MessageCircle size={16}/> },
    { text: "¡Gana 20 Puntos leyendo una Historia de los Profetas!", icon: <BookOpen size={16}/> },
    { text: "¡Completa los Juegos para ganar hasta 100 Puntos!", icon: <Gamepad2 size={16}/> },
    { text: "¡En la sección 'Aprende', haz buenas acciones para sumar puntos extra!", icon: <Trophy size={16}/> },
    { text: "¡Explora la galería para colorear dibujos hermosos!", icon: <MessageCircle size={16}/> }
  ];

  useEffect(() => {
    // Cycle messages every 8 seconds
    const interval = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 1000);
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-white p-3 rounded-full shadow-xl border-4 border-sky-400 hover:scale-110 transition-transform group"
      >
        <span className="text-3xl group-hover:animate-spin">🤖</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end gap-2 animate-fade-in max-w-[300px]">
      {/* Speech Bubble */}
      <div className="bg-white p-4 rounded-2xl rounded-br-none shadow-2xl border-2 border-sky-200 mb-8 relative flex-1 animate-bounce-in">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full p-1 hover:bg-red-500"
        >
          <X size={12} />
        </button>
        
        <div className="flex items-start gap-2">
            <span className="text-sky-500 mt-1">{messages[messageIndex].icon}</span>
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              {messages[messageIndex].text}
            </p>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-2">
            {messages.map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === messageIndex ? 'bg-sky-500' : 'bg-gray-200'}`}></div>
            ))}
        </div>
      </div>

      {/* Robot Character */}
      <div 
        className={`relative w-20 h-24 flex flex-col items-center justify-end cursor-pointer transition-transform ${isBouncing ? 'animate-bounce' : ''}`}
        onClick={() => setMessageIndex((prev) => (prev + 1) % messages.length)}
      >
        <div className="text-6xl drop-shadow-lg z-10 relative hover:scale-110 transition-transform duration-300">
            🤖
        </div>
        {/* Glow effect */}
        <div className="absolute bottom-2 w-12 h-4 bg-black/20 blur-md rounded-[100%]"></div>
      </div>
    </div>
  );
};
