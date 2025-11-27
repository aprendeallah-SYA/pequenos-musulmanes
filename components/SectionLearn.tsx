
import React, { useState } from 'react';
import { Volume2, CheckCircle2, Sparkles, HandHeart, BookHeart } from 'lucide-react';
import { playSuccess, playCoin } from '../services/audioService';

interface SectionLearnProps {
  addPoints?: (amount: number) => void;
}

export const SectionLearn: React.FC<SectionLearnProps> = ({ addPoints }) => {
  const [activeTab, setActiveTab] = useState<'prophet' | 'deeds' | 'arabic'>('prophet');
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  
  // State for interactive deeds (to disable after clicking)
  const [completedDeeds, setCompletedDeeds] = useState<number[]>([]);

  // Hadith + Quran Connection Data
  const prophetTeachings = [
    {
       topic: "La Amabilidad",
       hadith: "«Quien no es misericordioso con los demás, Allah no será misericordioso con él.» (Sahih Muslim)",
       quran: "«...y hablad a la gente de buena manera...»",
       surah: "Sura Al-Baqarah 2:83",
       icon: "🤝",
       color: "bg-blue-50 border-blue-200"
    },
    {
       topic: "Los Padres",
       hadith: "«El Paraíso está bajo los pies de las madres.» (An-Nasai)",
       quran: "«Y tu Señor ha decretado... que seáis benévolos con los padres.»",
       surah: "Sura Al-Isra 17:23",
       icon: "❤️",
       color: "bg-pink-50 border-pink-200"
    },
    {
       topic: "La Limpieza",
       hadith: "«La pureza es la mitad de la fe.» (Sahih Muslim)",
       quran: "«...y purifica tus vestimentas.»",
       surah: "Sura Al-Muddathir 7:4",
       icon: "✨",
       color: "bg-emerald-50 border-emerald-200"
    },
    {
        topic: "La Verdad",
        hadith: "«La verdad guía hacia la piedad, y la piedad guía hacia el Paraíso.» (Bukhari)",
        quran: "«¡Oh creyentes! Temed a Allah y estad con los veraces.»",
        surah: "Sura At-Tawbah 9:119",
        icon: "🗣️",
        color: "bg-yellow-50 border-yellow-200"
    }
  ];

  // Interactive Deeds Data
  const deedsList = [
      { id: 1, title: "Sonreír", desc: "Es Sunnah", icon: "😊", points: 5, color: "bg-yellow-100" },
      { id: 2, title: "Ayudar en casa", desc: "Limpia tu cuarto", icon: "🧹", points: 10, color: "bg-blue-100" },
      { id: 3, title: "Compartir", desc: "Presta un juguete", icon: "🎁", points: 10, color: "bg-purple-100" },
      { id: 4, title: "Decir Salam", desc: "Saluda a todos", icon: "👋", points: 5, color: "bg-green-100" },
      { id: 5, title: "Quitar obstáculos", desc: "Limpia el camino", icon: "🪨", points: 5, color: "bg-gray-100" },
      { id: 6, title: "Dar de comer", desc: "Alimenta una mascota", icon: "🐈", points: 10, color: "bg-orange-100" },
  ];

  const arabicWords = [
    { word: 'Allah', arabic: 'الله', meaning: 'Dios', audio: 'Al-lah' },
    { word: 'Assalamu Alaykum', arabic: 'السَّلامُ عَلَيْكُمْ', meaning: 'La paz sea contigo', audio: 'As-sa-la-mu A-lay-kum' },
    { word: 'Bismillah', arabic: 'بِسْمِ الله', meaning: 'En nombre de Allah', audio: 'Bis-mil-lah' },
    { word: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', meaning: 'Gracias a Dios', audio: 'Al-ham-du-lil-lah' },
    { word: 'SubhanAllah', arabic: 'سُبْحَانَ ٱللَّٰهِ', meaning: 'Gloria a Allah', audio: 'Sub-han-Al-lah' },
    { word: 'Allahu Akbar', arabic: 'ٱللَّٰهُ أَكْبَرُ', meaning: 'Allah es el más Grande', audio: 'Al-la-hu Ak-bar' },
    { word: 'Jazakallahu Khair', arabic: 'جَزَاكَ ٱللَّٰهُ خَيْرًا', meaning: 'Que Allah te recompense', audio: 'Ja-za-ka-lah Khai-ran' },
    { word: 'InshaAllah', arabic: 'إِنْ شَاءَ ٱللَّٰهِ', meaning: 'Si Allah quiere', audio: 'In-sha-Al-lah' },
    { word: 'MashAllah', arabic: 'مَا شَاءَ ٱللَّٰهُ', meaning: 'Lo que Allah quiso', audio: 'Ma-sha-Al-lah' },
    { word: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', meaning: 'Perdóname Allah', audio: 'As-tag-fi-rul-lah' },
  ];

  const handlePlayAudio = (textToRead: string, wordId: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      
      utterance.onstart = () => setPlayingWord(wordId);
      utterance.onend = () => setPlayingWord(null);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Tu navegador no soporta la reproducción de audio.");
    }
  };

  const handleDeedClick = (id: number, points: number) => {
      if (completedDeeds.includes(id)) return;
      
      playSuccess();
      playCoin();
      
      setCompletedDeeds([...completedDeeds, id]);
      if (addPoints) addPoints(points);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-islamic-green mb-2">Aprende Allah</h1>
        <p className="text-xl text-gray-600">Conoce al Profeta, haz el bien y habla árabe</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {[
          { id: 'prophet', label: 'El Profeta y el Corán', icon: <BookHeart size={20}/> },
          { id: 'deeds', label: 'Mis Buenas Acciones', icon: <HandHeart size={20}/> },
          { id: 'arabic', label: 'Palabras Mágicas', icon: <Volume2 size={20}/> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-full font-bold text-lg shadow-sm transition-all flex items-center gap-2 ${
              activeTab === tab.id 
              ? 'bg-sand-gold text-white transform scale-105' 
              : 'bg-white text-gray-500 hover:bg-orange-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-sky-100 min-h-[500px]">
        
        {/* TAB: PROPHET & QURAN */}
        {activeTab === 'prophet' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
               <div className="w-24 h-24 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-5xl border-4 border-emerald-300 shadow-inner">
                 📖
               </div>
               <h2 className="text-3xl font-bold text-emerald-700">El Corán confirma al Profeta ﷺ</h2>
               <p className="max-w-2xl mx-auto text-gray-500">
                 Lo que nuestro amado Profeta Muhammad (SAW) nos enseñó en los Hadices, Allah ya nos lo había dicho en el Sagrado Corán. ¡Mira cómo se conectan!
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {prophetTeachings.map((item, idx) => (
                   <div key={idx} className={`rounded-2xl p-6 border-2 ${item.color} relative overflow-hidden group hover:shadow-lg transition-all`}>
                       <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl group-hover:scale-110 transition-transform">{item.icon}</div>
                       
                       <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                           <span className="text-3xl">{item.icon}</span> {item.topic}
                       </h3>
                       
                       <div className="bg-white/80 p-4 rounded-xl mb-4 shadow-sm">
                           <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">El Profeta ﷺ dijo:</span>
                           <p className="text-gray-800 italic mt-1">"{item.hadith}"</p>
                       </div>

                       <div className="bg-white/90 p-4 rounded-xl shadow-sm border-l-4 border-sand-gold">
                           <span className="text-xs font-bold text-sand-gold uppercase tracking-wider">Allah dice en el Corán:</span>
                           <p className="text-gray-800 font-serif text-lg mt-1">{item.quran}</p>
                           <p className="text-right text-xs text-gray-400 mt-2 font-bold">{item.surah}</p>
                       </div>
                   </div>
               ))}
            </div>
          </div>
        )}

        {/* TAB: INTERACTIVE DEEDS */}
        {activeTab === 'deeds' && (
          <div className="text-center">
             <h2 className="text-3xl font-bold text-purple-600 mb-2">¡A recolectar Buenas Acciones!</h2>
             <p className="text-gray-500 mb-8">Haz clic en las acciones que hiciste hoy para ganar recompensas.</p>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {deedsList.map((deed) => {
                    const isDone = completedDeeds.includes(deed.id);
                    return (
                        <button
                            key={deed.id}
                            onClick={() => handleDeedClick(deed.id, deed.points)}
                            disabled={isDone}
                            className={`
                                relative p-6 rounded-3xl border-b-8 transition-all duration-300 flex flex-col items-center group
                                ${isDone 
                                    ? 'bg-gray-100 border-gray-200 cursor-default grayscale opacity-70' 
                                    : `${deed.color} border-black/10 hover:-translate-y-2 hover:shadow-xl active:translate-y-0 active:border-b-0`
                                }
                            `}
                        >
                            {isDone && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center animate-bounce-in">
                                    <CheckCircle2 className="text-green-500 w-16 h-16 drop-shadow-lg bg-white rounded-full" />
                                </div>
                            )}

                            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">{deed.icon}</div>
                            <h3 className="text-xl font-bold text-gray-800">{deed.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{deed.desc}</p>
                            
                            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isDone ? 'bg-gray-200 text-gray-500' : 'bg-white text-yellow-600 shadow-sm'}`}>
                                <Sparkles size={12} /> {deed.points} Puntos
                            </div>
                        </button>
                    );
                })}
             </div>
             
             {completedDeeds.length === deedsList.length && (
                 <div className="mt-8 p-6 bg-green-100 rounded-2xl border-2 border-green-300 animate-bounce-in">
                     <h3 className="text-2xl font-bold text-green-700">¡MashaAllah! ¡Eres increíble!</h3>
                     <p>Has completado todas las buenas acciones de hoy.</p>
                 </div>
             )}
          </div>
        )}

        {/* TAB: ARABIC */}
        {activeTab === 'arabic' && (
          <div>
            <div className="text-center mb-6">
               <h3 className="text-2xl font-bold text-yellow-600 mb-2">Palabras Mágicas</h3>
               <p className="text-gray-500">Haz clic en el botón de audio para escuchar cómo se dice en árabe.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {arabicWords.map((item, idx) => (
                <div key={idx} className="bg-yellow-50 p-6 rounded-2xl border-dashed border-2 border-yellow-400 flex flex-col items-center hover:bg-yellow-100 transition-colors group relative">
                  <div className="w-full flex justify-between items-start mb-2">
                     <span className="text-xs bg-white px-2 py-1 rounded text-gray-400 font-mono border border-gray-100">
                       {item.audio}
                     </span>
                     <button 
                       onClick={() => handlePlayAudio(item.arabic, item.word)}
                       className={`p-2 rounded-full transition-all ${
                         playingWord === item.word 
                           ? 'bg-yellow-500 text-white scale-110 shadow-lg' 
                           : 'bg-yellow-200 text-yellow-700 hover:bg-yellow-300'
                       }`}
                       title="Escuchar pronunciación"
                     >
                       <Volume2 size={20} className={playingWord === item.word ? 'animate-pulse' : ''} />
                     </button>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{item.word}</h3>
                  <p className="text-3xl font-serif text-emerald-700 my-2" lang="ar" dir="rtl">{item.arabic}</p>
                  <p className="text-lg text-yellow-800 font-medium text-center">{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};