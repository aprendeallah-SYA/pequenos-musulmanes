import React, { useState } from 'react';
import { Star, Heart, Cloud, Sun, Volume2 } from 'lucide-react';

export const SectionLearn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'prophet' | 'deeds' | 'arabic'>('pillars');
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const pillars = [
    { name: 'Shahada', desc: 'La Fe: No hay dios más que Allah.', icon: '☝️' },
    { name: 'Salat', desc: 'La Oración: Rezamos 5 veces al día.', icon: '🕌' },
    { name: 'Zakat', desc: 'La Caridad: Compartimos con los pobres.', icon: '💰' },
    { name: 'Sawm', desc: 'El Ayuno: En Ramadán no comemos de día.', icon: '🌙' },
    { name: 'Hajj', desc: 'La Peregrinación: Viaje a la Meca.', icon: '🕋' },
  ];

  const arabicWords = [
    { word: 'Allah', arabic: 'الله', meaning: 'Dios', audio: 'Al-lah' },
    { word: 'Assalamu Alaykum', arabic: 'السَّلامُ عَلَيْكُمْ', meaning: 'La paz sea contigo', audio: 'As-sa-la-mu A-lay-kum' },
    { word: 'Bismillah', arabic: 'بِسْمِ الله', meaning: 'En nombre de Allah', audio: 'Bis-mil-lah' },
    { word: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', meaning: 'Gracias a Dios', audio: 'Al-ham-du-lil-lah' },
    { word: 'SubhanAllah', arabic: 'سُبْحَانَ ٱللَّٰهِ', meaning: 'Gloria a Allah', audio: 'Sub-han-Al-lah' },
    { word: 'Allahu Akbar', arabic: 'ٱللَّٰهُ أَكْبَرُ', meaning: 'Allah es el más Grande', audio: 'Al-la-hu Ak-bar' },
    { word: 'Jazakallahu Khair', arabic: 'جَزَاكَ ٱللَّٰهُ خَيْرًا', meaning: 'Que Allah te recompense', audio: 'Ja-za-ka-lah Khai-ran' },
    { word: 'InshaAllah', arabic: 'إِنْ شَاءَ ٱللَّٰهُ', meaning: 'Si Allah quiere', audio: 'In-sha-Al-lah' },
    { word: 'MashAllah', arabic: 'مَا شَاءَ ٱللَّٰهُ', meaning: 'Lo que Allah quiso', audio: 'Ma-sha-Al-lah' },
    { word: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', meaning: 'Perdóname Allah', audio: 'As-tag-fi-rul-lah' },
  ];

  const handlePlayAudio = (textToRead: string, wordId: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous audio
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'ar-SA'; // Set language to Arabic
      utterance.rate = 0.8; // Slower for learning
      
      utterance.onstart = () => setPlayingWord(wordId);
      utterance.onend = () => setPlayingWord(null);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Tu navegador no soporta la reproducción de audio.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-islamic-green mb-2">Aprende Allah</h1>
        <p className="text-xl text-gray-600">Descubre la belleza de nuestra fe</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {[
          { id: 'pillars', label: 'Los 5 Pilares' },
          { id: 'prophet', label: 'Nuestro Profeta' },
          { id: 'deeds', label: 'Buenas Acciones' },
          { id: 'arabic', label: 'Usa el Árabe' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-full font-bold text-lg shadow-sm transition-all ${
              activeTab === tab.id 
              ? 'bg-sand-gold text-white transform scale-105' 
              : 'bg-white text-gray-500 hover:bg-orange-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-sky-100">
        
        {activeTab === 'pillars' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-sky-500 mb-6">El Techo de mi Casa Musulmana</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {pillars.map((p, idx) => (
                <div key={idx} className="flex flex-col items-center p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100 hover:shadow-lg transition-shadow">
                  <span className="text-5xl mb-3">{p.icon}</span>
                  <h3 className="font-bold text-xl text-emerald-700">{p.name}</h3>
                  <p className="text-center text-sm text-gray-600 mt-2">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'prophet' && (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 bg-green-100 rounded-full mx-auto flex items-center justify-center text-4xl border-4 border-green-300">
              ﷺ
            </div>
            <h2 className="text-3xl font-bold text-emerald-600">Muhammad (S.A.W)</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Es la mejor persona para imitar. Él nos enseñó a ser amables, a decir la verdad y a cuidar a nuestros vecinos.
              ¡Amamos a nuestro Profeta!
            </p>
          </div>
        )}

        {activeTab === 'deeds' && (
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="flex-1 bg-blue-50 p-6 rounded-3xl border-2 border-blue-200 text-center">
              <div className="text-4xl mb-4">😇</div>
              <h3 className="text-2xl font-bold text-blue-600 mb-2">Ángel (Derecha)</h3>
              <p>Escribe todas tus <strong>Buenas Acciones</strong>.</p>
              <ul className="text-left mt-4 space-y-2 list-disc pl-5">
                <li>Ayudar a mamá</li>
                <li>Decir la verdad</li>
                <li>Compartir juguetes</li>
              </ul>
            </div>
            <div className="flex-1 bg-red-50 p-6 rounded-3xl border-2 border-red-200 text-center">
              <div className="text-4xl mb-4">😈</div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Shaitan (Izquierda)</h3>
              <p>Quiere que hagas <strong>Malas Acciones</strong>.</p>
              <ul className="text-left mt-4 space-y-2 list-disc pl-5">
                <li>Mentir</li>
                <li>Pegar</li>
                <li>No escuchar</li>
              </ul>
              <p className="mt-4 font-bold text-red-500">¡Dí "A'udhu billah" para alejarlo!</p>
            </div>
          </div>
        )}

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
