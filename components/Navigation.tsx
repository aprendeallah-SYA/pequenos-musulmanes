import React from 'react';
import { Section } from '../types';
import { BookOpen, Gamepad2, Image, Mail, Home, Star, Trophy } from 'lucide-react';

interface NavigationProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
  points?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentSection, onNavigate, points = 0 }) => {
  const navItems = [
    { id: Section.HOME, label: 'Inicio', icon: Home, color: 'bg-islamic-green' },
    { id: Section.LEARN, label: 'Aprende Allah', icon: Star, color: 'bg-sand-gold' },
    { id: Section.STORIES, label: 'Historias', icon: BookOpen, color: 'bg-kids-orange' },
    { id: Section.GALLERY, label: 'Galería', icon: Image, color: 'bg-kids-purple' },
    { id: Section.GAMES, label: 'Juegos', icon: Gamepad2, color: 'bg-sky-blue' },
    { id: Section.CONTACT, label: 'Contacto', icon: Mail, color: 'bg-red-400' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg border-b-4 border-blue-100 no-print">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-24">
          
          {/* Logo Area */}
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => onNavigate(Section.HOME)}>
              <span className="text-3xl mr-2 transform group-hover:rotate-12 transition-transform duration-300">🕌</span>
              <span className="text-2xl font-black text-islamic-green tracking-wider drop-shadow-sm group-hover:text-emerald-600 transition-colors hidden sm:block">
                Pequeño Musulmán
              </span>
              <span className="text-xl font-black text-islamic-green tracking-wider drop-shadow-sm sm:hidden">
                Pequeño M.
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden sm:block sm:ml-auto">
              <div className="flex space-x-3 items-center h-full">
                
                {/* Points Display Desktop */}
                <div className="mr-4 px-4 py-2 bg-yellow-100 rounded-full border-2 border-yellow-300 flex items-center gap-2 shadow-sm animate-pulse-slow">
                   <Trophy className="text-yellow-600 w-5 h-5" />
                   <span className="font-black text-yellow-700">{points} Puntos</span>
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`
                        relative px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex flex-col items-center gap-1 group border-2
                        ${isActive 
                          ? `${item.color} text-white scale-110 shadow-xl ring-4 ring-offset-2 ring-gray-100 border-transparent z-10` 
                          : 'bg-white text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700 hover:scale-105'
                        }
                      `}
                    >
                      <Icon 
                        size={isActive ? 26 : 22} 
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`transition-all duration-300 ${isActive ? 'text-white drop-shadow-md' : item.color.replace('bg-', 'text-')}`} 
                      />
                      <span className={`hidden lg:block transition-all ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                        {item.label}
                      </span>
                      
                      {/* Active Indicator Dot */}
                      {isActive && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-gray-200"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Points Display Mobile (Absolute Position Top Right) */}
          <div className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2">
             <div className="px-3 py-1 bg-yellow-100 rounded-full border-2 border-yellow-300 flex items-center gap-1 shadow-sm">
                <Trophy className="text-yellow-600 w-4 h-4" />
                <span className="font-black text-yellow-700 text-sm">{points}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Bar (Enhanced) */}
      <div className="sm:hidden flex justify-around items-end pb-4 pt-2 bg-white border-t border-gray-100 shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.1)] fixed bottom-0 w-full z-50 px-2">
          {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = currentSection === item.id;
             return (
               <button 
                 key={item.id} 
                 onClick={() => onNavigate(item.id)} 
                 className={`
                    flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 relative
                    ${isActive 
                      ? `${item.color} text-white shadow-lg -translate-y-4 scale-110 ring-4 ring-white` 
                      : 'text-gray-400 hover:bg-gray-50'
                    }
                 `}
               >
                 <Icon 
                    size={isActive ? 28 : 24} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-white' : item.color.replace('bg-', 'text-')} 
                 />
                 {isActive && (
                    <span className="text-[10px] font-bold mt-1 absolute -bottom-6 text-gray-600 bg-white px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap">
                        {item.label}
                    </span>
                 )}
               </button>
             )
          })}
      </div>
    </nav>
  );
};