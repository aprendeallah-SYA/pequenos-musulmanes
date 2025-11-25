import React, { useState } from 'react';
import { generateStory } from '../services/geminiService';
import { Book, Loader2 } from 'lucide-react';

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

  const handleSelectTopic = async (topic: string) => {
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
          <div className="bg-orange-100 p-4 flex justify-between items-center border-b border-orange-200">
            <button 
              onClick={() => setSelectedTopic(null)}
              className="text-orange-600 font-bold hover:underline"
            >
              ← Volver
            </button>
            <h2 className="font-bold text-xl text-orange-800">{selectedTopic}</h2>
            <div className="w-10"></div>
          </div>
          
          <div className="p-8 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-orange-400" />
                <p className="text-gray-500 animate-pulse">Escribiendo una historia mágica...</p>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none text-gray-700 leading-loose whitespace-pre-line">
                {storyContent}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};