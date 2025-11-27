import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { SectionLearn } from './components/SectionLearn';
import { SectionStories } from './components/SectionStories';
import { SectionGallery } from './components/SectionGallery';
import { SectionGames } from './components/SectionGames';
import { SectionContact } from './components/SectionContact';
import { GuideAvatar } from './components/GuideAvatar';
import { Section } from './types';
import { Sparkles, RefreshCw, Image as ImageIcon, Star } from 'lucide-react';
import { generateImage } from './services/geminiService';

// CORRECCIÓN: Se elimina 'React.FC' para mejor compatibilidad con React 19.
const App = () => {
  const [currentSection, setCurrentSection] = useState<Section>(Section.HOME);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loadingLogo, setLoadingLogo] = useState<boolean>(false);
  
  // Points System State
  const [points, setPoints] = useState<number>(0);
  const [rewardNotification, setRewardNotification] = useState<{show: boolean, amount: number} | null>(null);

  // Function to add points and show a temporary notification
  const handleAddPoints = useCallback((amount: number) => {
    setPoints(prevPoints => {
      const newPoints = prevPoints + amount;
      try {
        localStorage.setItem('pm_user_points', newPoints.toString());
      } catch (e) {
        console.warn("LocalStorage not available for saving points:", e);
      }
      return newPoints;
    });

    setRewardNotification({ show: true, amount });
    // Hide notification after 3 seconds
    setTimeout(() => {
      setRewardNotification(null);
    }, 3000);
  }, []);

  // Function to generate the logo image using Gemini
  const handleGenerateLogo = useCallback(async () => {
    setLoadingLogo(true);
    setLogoUrl(null);
    try {
      // Prompt for a friendly, children's educational theme
      const prompt = "A cute, simple, and friendly mascot logo for an educational app called 'Pequeño Musulmán'. The mascot should be a cheerful young child wearing a small, green kufi cap, holding a colorful book. Use a bright, inviting, cartoon style suitable for primary school children. Minimal text. Green and gold color palette.";
      const imageUrl = await generateImage(prompt);
      setLogoUrl(imageUrl);
      
    } catch (error) {
      console.error('Error generating logo image:', error);
      // Optional: set a fallback image or a default text-based logo
      setLogoUrl(null); 
    } finally {
      setLoadingLogo(false);
    }
  }, []);

  useEffect(() => {
    try {
        // Load points from LocalStorage
        const savedPoints = localStorage.getItem('pm_user_points');
        if (savedPoints) {
          setPoints(parseInt(savedPoints, 10));
        }
    } catch (e) {
        console.warn("LocalStorage not available:", e);
    }

    // Intentar generar el logo al cargar si no existe
    if (!logoUrl && currentSection === Section.HOME) {
      handleGenerateLogo();
    }
  }, [logoUrl, currentSection, handleGenerateLogo]); // Dependencias: logoUrl, currentSection, handleGenerateLogo

  const renderSection = () => {
    switch (currentSection) {
      case Section.HOME:
        // Pasa el logoUrl, la función de manejo y el estado de carga al componente SectionLearn
        return <SectionLearn 
                  logoUrl={logoUrl} 
                  loadingLogo={loadingLogo}
                  onRegenerateLogo={handleGenerateLogo}
                  addPoints={handleAddPoints} 
                />;
      case Section.LEARN:
        return <SectionLearn 
                  logoUrl={logoUrl} 
                  loadingLogo={loadingLogo}
                  onRegenerateLogo={handleGenerateLogo}
                  addPoints={handleAddPoints} 
                />;
      case Section.STORIES:
        return <SectionStories addPoints={handleAddPoints} />;
      case Section.GALLERY:
        return <SectionGallery addPoints={handleAddPoints} />;
      case Section.GAMES:
        return <SectionGames addPoints={handleAddPoints} points={points} />;
      case Section.CONTACT:
        return <SectionContact />;
      default:
        return <SectionLearn 
                  logoUrl={logoUrl} 
                  loadingLogo={loadingLogo}
                  onRegenerateLogo={handleGenerateLogo}
                  addPoints={handleAddPoints} 
                />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 selection:bg-green-200 selection:text-green-900">
      <Navigation currentSection={currentSection} onNavigate={setCurrentSection} points={points} />
      
      {/* Guía Avatar */}
      <GuideAvatar />

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
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Pequeño Musulmán. Todos los derechos reservados. Desarrollado con ⚛️ React y ✨ Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
