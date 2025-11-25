import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { SectionLearn } from './components/SectionLearn';
import { SectionStories } from './components/SectionStories';
import { SectionGallery } from './components/SectionGallery';
import { SectionGames } from './components/SectionGames';
import { SectionContact } from './components/SectionContact';
import { Section } from './types';
import { Sparkles, RefreshCw, Image as ImageIcon, Star } from 'lucide-react';
import { generateImage } from './services/geminiService';

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<Section>(Section.HOME);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loadingLogo, setLoadingLogo] = useState<boolean>(false);
  
  // Points System State
  const [points, setPoints] = useState<number>(0);
  const [rewardNotification, setRewardNotification] = useState<{show: boolean, amount: number} | null>(null);

  useEffect(() => {
    // Load points from LocalStorage
    const savedPoints = localStorage.getItem('pm_user_points');
    if (savedPoints) {
      setPoints(parseInt(savedPoints, 10));
    }

    // Intentar generar el logo al cargar si no existe
    if (!logoUrl && currentSection === Section.HOME) {
      handleGenerateLogo();
    }
  }, []);

  const handleAddPoints = (amount: number) => {
    const newTotal = points + amount;
    setPoints(newTotal);
    localStorage.setItem('pm_user_points', newTotal.toString());
    
    // Trigger notification
    setRewardNotification({ show: true, amount });
    setTimeout(() => setRewardNotification(null), 2000);
  };

  const handleGenerateLogo = async () => {
    setLoadingLogo(true);
    const prompt = "Un logo estilo cartoon, vectorial y colorido para niños. Fondo: La Kaaba en La Meca. Primer plano: Niños y niñas musulmanes felices, diversos, leyendo el Corán juntos. Texto integrado que diga 'Aprende Allah' de forma artística y legible. Estilo alegre, vibrante, iluminación suave.";
    const url = await generateImage(prompt);
    if (url) {
      setLogoUrl(url);
    }
    setLoadingLogo(false);
  };

  const renderSection = () => {
    switch (currentSection) {
      case Section.HOME:
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in">
             <div className="mb-8 relative group">
                 {/* Logo Container */}
                 <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-full border-8 border-yellow-300 shadow-2xl flex items-center justify-center overflow-hidden relative">
                    {loadingLogo ? (
                      <div className="flex flex-col items-center text-yellow-600 animate-pulse">
                        <RefreshCw className="animate-spin mb-2 w-10 h-10" />
                        <span className="text-sm font-bold">Dibujando Logo...</span>
                      </div>
                    ) : logoUrl ? (
                      <img src={logoUrl} alt="Logo Aprende Allah" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center p-4 bg-gradient-to-b from-blue-100 to-yellow-100 w-full h-full justify-center">
                         <div className="text-6xl mb-2">🕌</div>
                         <div className="flex gap-2 text-4xl">
                           <span>👦🏽</span><span>📖</span><span>👧🏻</span>
                         </div>
                         <p className="text-xs text-gray-400 mt-2 text-center max-w-[150px]">
                           Configura tu API Key para ver el logo mágico generado por IA.
                         </p>
                      </div>
                    )}
                 </div>
                 
                 {/* Regenerate Button (Visible on hover or if missing) */}
                 <button 
                    onClick={handleGenerateLogo}
                    disabled={loadingLogo}
                    className="absolute -bottom-4 right-0 md:right-4 bg-white p-3 rounded-full shadow-lg border-2 border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-islamic-green transition-all z-10"
                    title="Regenerar Logo Mágico"
                 >
                    {loadingLogo ? <RefreshCw className="animate-spin w-5 h-5"/> : <ImageIcon className="w-5 h-5"/>}
                 </button>
             </div>

             <h1 className="text-5xl md:text-7xl font-extrabold text-islamic-green mb-4 tracking-tight drop-shadow-sm">
               Pequeño Musulmán
             </h1>
             <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl">
               Un lugar mágico para aprender sobre Allah, jugar y crecer con buenos modales.
             </p>
             <button 
               onClick={() => setCurrentSection(Section.LEARN)}
               className="bg-kids-orange hover:bg-orange-600 text-white text-2xl font-bold py-4 px-10 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2"
             >
               <Sparkles /> ¡Empezar Aventura!
             </button>
          </div>
        );
      case Section.LEARN:
        return <SectionLearn />;
      case Section.STORIES:
        return <SectionStories addPoints={handleAddPoints} />;
      case Section.GALLERY:
        return <SectionGallery addPoints={handleAddPoints} />;
      case Section.GAMES:
        return <SectionGames addPoints={handleAddPoints} />;
      case Section.CONTACT:
        return <SectionContact />;
      default:
        return <SectionLearn />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 selection:bg-green-200 selection:text-green-900">
      <Navigation currentSection={currentSection} onNavigate={setCurrentSection} points={points} />
      
      {/* Reward Notification Overlay */}
      {rewardNotification && (
        <div className="fixed top-24 right-4 md:right-10 z-[100] animate-bounce-in pointer-events-none">
          <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full shadow-2xl font-black text-2xl border-4 border-white flex items-center gap-2 transform rotate-3">
             <Star className="fill-white text-white w-8 h-8 animate-spin-slow" /> 
             +{rewardNotification.amount}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto">
        {renderSection()}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-center text-gray-400 no-print">
        <p>© 2024 Pequeño Musulmán. Hecho con ❤️ para la Ummah.</p>
      </footer>
    </div>
  );
};

export default App;