
import React, { useState, useEffect, useRef } from 'react';
import { generateStory } from '../services/geminiService';
import { Book, Loader2, Pause, Square, Play } from 'lucide-react';

const PROPHETS = [
  "Adam", "Idris", "Nuh", "Hud", "Saleh", "Ibrahim", "Ismail", "Ishaq",
  "Yaqub", "Yusuf", "Ayyub", "Shuaib", "Musa", "Harun", "Dhul-Kifl",
  "Dawud", "Sulaiman", "Ilyas", "Al-Yasa", "Yunus", "Zakariya", "Yahya",
  "Isa", "Muhammad (SAW)"
];

const TOPICS = [
  "El Respeto a los Padres", "Cuidar el Medio Ambiente", "Ser Honesto", 
  "La Importancia de la Oración", "Ayudar a los Vecinos", "La Paciencia"
];

interface SectionStoriesProps {
  addPoints?: (amount: number) => void;
}

export const SectionStories: React.FC<SectionStoriesProps> = ({ addPoints }) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [storyContent, setStoryContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize synth
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    
    // Cleanup on unmount or topic change
    return () => {
      stopAudio();
    };
  }, [selectedTopic]);

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handlePlayPause = () => {
    if (!synthRef.current) return;

    if (isSpeaking && !isPaused) {
      // Pause
      synthRef.current.pause();
      setIsPaused(true);
    } else if (isPaused) {
      // Resume
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      // Start fresh - CANCELAR CUALQUIER AUDIO PREVIO PRIMERO
      synthRef.current.cancel();

      const u = new SpeechSynthesisUtterance(storyContent);
      u.lang = 'es-ES'; // Default fallback lang
      u.rate = 0.9; // Ritmo narrativo calmado
      u.pitch = 1.0; // Tono natural (1.0 es lo más humano, 1.1 o más suena robótico/infantil)
      u.volume = 1.0;

      // Obtener voces disponibles
      const voices = synthRef.current.getVoices();
      
      // Lógica de selección de voz para máxima naturalidad:
      // 1. Google Español (Alta calidad en Android/Chrome)
      // 2. Microsoft Español (Voces Neurales en Edge/Windows)
      // 3. Cualquier voz en español
      let preferredVoice = 
        voices.find(v => v.name.includes("Google") && v.lang.includes("es")) || 
        voices.find(v => v.name.includes("Microsoft") && v.lang.includes("es")) || 
        voices.find(v => v.lang.includes("es-MX")) || // Español latino suele ser suave
        voices.find(v => v.lang.includes("es"));

      if (preferredVoice) {
        u.voice = preferredVoice;
        console.log("Voz seleccionada:", preferredVoice.name);
      }

      u.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      u.onerror = (e) => {
        console.error("Error TTS:", e);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = u;
      synthRef.current.speak(u);
      setIsSpeaking(true);
    }
  };

  const handleSelectTopic = async (topic: string) => {
    stopAudio(); // Stop any previous audio
    setSelectedTopic(topic);
    setLoading(true);
    setStoryContent("");
    
    const story = await generateStory(topic);
    setStoryContent(story);
    setLoading(false);
    
    if (addPoints && story.length > 50) {
      addPoints(20);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <h1 className="text-4xl font-bold text-center text-kids-orange mb-8">Cuentos y Profetas</h1>
      
      {!selectedTopic ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-emerald-600 mb-4 flex items-center gap-2">
              <Book className="w-6 h-6"/> Historias de los Profetas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {PROPHETS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSelectTopic(`La historia del Profeta ${p}`)}
                  className="p-4 bg-white rounded-xl shadow border-b-4 border-emerald-200 hover:border-emerald-400 hover:-translate-y-1 transition-all text-sm font-semibold text-center text-gray-700"
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-sky-600 mb-4 flex items-center gap-2">
              <Book className="w-6 h-6"/> Cuentos sobre Buenos Modales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => handleSelectTopic(t)}
                  className="p-6 bg-sky-50 rounded-2xl border-2 border-sky-100 hover:bg-sky-100 text-sky-800 font-bold shadow-sm transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          <div className="bg-amber-100 p-6 rounded-2xl text-center border-2 border-amber-300">
            <h3 className="font-bold text-amber-800 text-lg">La Ummah (Comunidad)</h3>
            <p className="text-amber-900">Recuerda: Todos somos parte de una gran familia llamada Ummah. ¡Debemos respetarnos y cuidarnos!</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl mx-auto border-4 border-orange-100">
          <div className="bg-orange-100 p-4 flex justify-between items-center border-b border-orange-200 sticky top-24 z-20">
            <button 
              onClick={() => {
                  stopAudio();
                  setSelectedTopic(null);
              }}
              className="text-orange-600 font-bold hover:underline"
            >
              ← Volver
            </button>
            <h2 className="font-bold text-xl text-orange-800 truncate px-2">{selectedTopic}</h2>
            
            {/* Audio Controls */}
            {!loading && storyContent && (
               <div className="flex items-center gap-2">
                   {isSpeaking && !isPaused && (
                       <div className="flex gap-1 mr-2 h-4 items-end">
                           <div className="w-1 bg-orange-500 animate-[bounce_1s_infinite] h-full"></div>
                           <div className="w-1 bg-orange-500 animate-[bounce_1.2s_infinite] h-2/3"></div>
                           <div className="w-1 bg-orange-500 animate-[bounce_0.8s_infinite] h-full"></div>
                       </div>
                   )}
                   
                   <button 
                      onClick={handlePlayPause}
                      className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-transform active:scale-95 shadow-md"
                      title={isSpeaking && !isPaused ? "Pausar" : "Escuchar Cuento"}
                   >
                      {isSpeaking && !isPaused ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                   </button>
                   
                   {isSpeaking && (
                       <button 
                          onClick={stopAudio}
                          className="bg-red-400 hover:bg-red-500 text-white p-2 rounded-full transition-transform active:scale-95 shadow-md"
                          title="Detener"
                       >
                          <Square size={16} fill="white" />
                       </button>
                   )}
               </div>
            )}
          </div>
          
          <div className="p-8 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6">
                <div className="relative">
                   {/* Glow effect behind loader */}
                   <div className="absolute inset-0 bg-yellow-200 blur-2xl opacity-60 animate-pulse rounded-full scale-150"></div>
                   <Loader2 className="w-16 h-16 animate-spin text-orange-500 relative z-10" />
                </div>
                
                <div className="text-xl text-gray-600 font-medium flex flex-col sm:flex-row items-center gap-2">
                  <span>Escribiendo una historia</span>
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-pulse text-3xl drop-shadow-sm font-serif italic">
                    ✨ Mágica ✨
                  </span>
                  <div className="flex gap-1 mt-2 sm:mt-0">
                    <span className="animate-bounce [animation-delay:-0.3s] text-orange-500 text-2xl">.</span>
                    <span className="animate-bounce [animation-delay:-0.15s] text-purple-500 text-2xl">.</span>
                    <span className="animate-bounce text-pink-500 text-2xl">.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none text-gray-700 leading-loose whitespace-pre-line animate-fade-in">
                {storyContent}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};