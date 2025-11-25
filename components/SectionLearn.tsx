import React, { useState } from 'react';
import { Star, Heart, Cloud, Sun } from 'lucide-react';

export const SectionLearn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'prophet' | 'deeds' | 'arabic'>('pillars');

  const pillars = [
    { name: 'Shahada', desc: 'La Fe: No hay dios más que Allah.', icon: '☝️' },
    { name: 'Salat', desc: 'La Oración: Rezamos 5 veces al día.', icon: '🕌' },
    { name: 'Zakat', desc: 'La Caridad: Compartimos con los pobres.', icon: '💰' },
    { name: 'Sawm', desc: 'El Ayuno: En Ramadán no comemos de día.', icon: '🌙' },
    { name: 'Hajj', desc: 'La Peregrinación: Viaje a la Meca.', icon: '🕋' },
  ];

  const arabicWords = [
    { word: 'Allah', meaning: 'Dios', audio: 'All-lah' },
    { word: 'Salam', meaning: 'Paz', audio: 'Sa-lam' },
    { word: 'Bismillah', meaning: 'En nombre de Allah', audio: 'Bis-mil-lah' },
    { word: 'Alhamdulillah', meaning: 'Gracias a Dios', audio: 'Al-ham-du-lil-lah' },
  ];

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {arabicWords.map((word, idx) => (
              <div key={idx} className="bg-yellow-50 p-6 rounded-2xl border-dashed border-2 border-yellow-400 flex flex-col items-center hover:bg-yellow-100 cursor-pointer transition-colors group">
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{word.word}</h3>
                <span className="text-sm text-gray-500 font-mono bg-white px-2 py-1 rounded mb-2">{word.audio}</span>
                <p className="text-xl text-yellow-700">{word.meaning}</p>
                <div className="mt-2 text-xs text-gray-400 group-hover:text-yellow-600">¡Haz clic y repite!</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};