import React, { useState } from 'react';
import { Download, Printer, Palette, BookOpen, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AlphabetWorkbook, PrayerPage } from './WorkbookComponents';
import { ArabicLetter } from '../types';
import { generateImage } from '../services/geminiService';

const COLORING_THEMES = [
  { id: 'ramadan', label: 'Ramadán', icon: '🌙', prompt: 'coloring page for kids about Ramadan lantern and crescent moon, simple black and white line art, no shading, white background' },
  { id: 'salat', label: 'El Salat (Oración)', icon: '🤲', prompt: 'coloring page for kids of a muslim child praying on a rug, simple black and white line art, no shading, white background' },
  { id: 'mosque', label: 'La Mezquita', icon: '🕌', prompt: 'coloring page for kids of a beautiful simple mosque, simple black and white line art, no shading, white background' },
  { id: 'manners', label: 'Buenos Modales', icon: '🤝', prompt: 'coloring page for kids showing two children sharing toys or shaking hands kindly, muslim context, simple black and white line art, no shading, white background' },
  { id: 'quran', label: 'Leyendo Corán', icon: '📖', prompt: 'coloring page for kids of an open Quran book on a wooden stand (rehal), simple black and white line art, no shading, white background' },
  { id: 'kaaba', label: 'La Kaaba', icon: '🕋', prompt: 'coloring page for kids of the Kaaba in Mecca, simple black and white line art, no shading, white background' },
  { id: 'respect', label: 'Respeto a los Mayores', icon: '👵', prompt: 'coloring page for kids showing a child helping an elderly person, muslim context, simple black and white line art, no shading, white background' },
  { id: 'family', label: 'La Familia', icon: '👨‍👩‍👧‍👦', prompt: 'coloring page for kids showing a happy muslim family standing together, father mother and children, wearing modest islamic clothing, simple black and white line art, no shading, white background' },
  { id: 'happiness', label: 'Felicidad', icon: '✨', prompt: 'coloring page for kids showing a very happy muslim child smiling and looking at the sky, expressing gratitude to Allah, nature background with sun and clouds, simple black and white line art, no shading, white background' },
  { id: 'helping', label: 'Ayudar', icon: '🎁', prompt: 'coloring page for kids showing a child helping someone else carrying a bag or sharing food, islamic concept of charity and kindness, simple black and white line art, no shading, white background' },
];

interface SectionGalleryProps {
  addPoints?: (amount: number) => void;
}

export const SectionGallery: React.FC<SectionGalleryProps> = ({ addPoints }) => {
  const [activeTab, setActiveTab] = useState<'images' | 'coloring' | 'workbooks'>('images');
  const [selectedWorkbook, setSelectedWorkbook] = useState<string | null>(null);
  
  // Coloring State
  const [generatedColoringImage, setGeneratedColoringImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedThemeLabel, setSelectedThemeLabel] = useState<string>("");

  // Mock Data for Standard Gallery
  const galleryImages = [
    { title: 'Ramadán Kareem', url: 'https://picsum.photos/seed/ramadan/400/300' },
    { title: 'La Mezquita', url: 'https://picsum.photos/seed/mosque/400/300' },
    { title: 'Orando Juntos', url: 'https://picsum.photos/seed/praying/400/300' },
    { title: 'La Kaaba', url: 'https://picsum.photos/seed/kaaba/400/300' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateColoring = async (theme: typeof COLORING_THEMES[0]) => {
    setIsGenerating(true);
    setGeneratedColoringImage(null);
    setSelectedThemeLabel(theme.label);

    // Add extra instruction for clear line art
    const fullPrompt = `${theme.prompt}. Ensure it is high contrast, strictly black lines on white background, cartoon style suitable for primary school children.`;
    
    const url = await generateImage(fullPrompt);
    if (url) {
        setGeneratedColoringImage(url);
        if (addPoints) addPoints(15);
    }
    setIsGenerating(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <header className="text-center mb-8 no-print">
        <h1 className="text-4xl font-bold text-kids-purple mb-4">Galería y Cuadernos</h1>
        <div className="flex justify-center gap-4 flex-wrap">
          <button onClick={() => setActiveTab('images')} className={`px-4 py-2 rounded-full font-bold transition-colors ${activeTab === 'images' ? 'bg-kids-purple text-white' : 'bg-gray-200 text-gray-600'}`}>Imágenes</button>
          <button onClick={() => setActiveTab('coloring')} className={`px-4 py-2 rounded-full font-bold transition-colors ${activeTab === 'coloring' ? 'bg-kids-purple text-white' : 'bg-gray-200 text-gray-600'}`}>Para Colorear (IA)</button>
          <button onClick={() => setActiveTab('workbooks')} className={`px-4 py-2 rounded-full font-bold transition-colors ${activeTab === 'workbooks' ? 'bg-kids-purple text-white' : 'bg-gray-200 text-gray-600'}`}>Cuadernos</button>
        </div>
      </header>

      {/* VIEW: IMAGES */}
      {activeTab === 'images' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 no-print">
          {galleryImages.map((img, i) => (
            <div key={i} className="bg-white p-3 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <img src={img.url} alt={img.title} className="w-full h-48 object-cover rounded-lg mb-3" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">{img.title}</span>
                <button className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"><Download size={20}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: COLORING (GENERATIVE AI) */}
      {activeTab === 'coloring' && (
        <div className="animate-fade-in no-print">
          <div className="text-center mb-8">
             <h2 className="text-2xl font-bold text-gray-700 mb-2">¡Crea tu propio dibujo para pintar!</h2>
             <p className="text-gray-500">Elige un tema y la magia dibujará una lámina única para ti.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
             {COLORING_THEMES.map((theme) => (
                 <button
                    key={theme.id}
                    onClick={() => handleGenerateColoring(theme)}
                    disabled={isGenerating}
                    className="flex flex-col items-center p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-kids-purple hover:bg-purple-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-wait"
                 >
                    <span className="text-4xl mb-2">{theme.icon}</span>
                    <span className="text-sm font-bold text-gray-700 text-center">{theme.label}</span>
                 </button>
             ))}
          </div>

          {/* Generator Output Area */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-dashed border-gray-300 min-h-[400px] flex flex-col items-center justify-center relative">
             {isGenerating ? (
                 <div className="text-center">
                     <RefreshCw className="w-16 h-16 text-kids-purple animate-spin mx-auto mb-4" />
                     <p className="text-xl font-bold text-gray-600 animate-pulse">Dibujando {selectedThemeLabel}...</p>
                 </div>
             ) : generatedColoringImage ? (
                 <div className="w-full flex flex-col items-center">
                     <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                         <Sparkles className="text-yellow-400" /> Tu dibujo de: {selectedThemeLabel}
                     </h3>
                     <div className="bg-white p-2 border border-gray-200 shadow-inner mb-6 max-w-lg w-full">
                        <img src={generatedColoringImage} alt="Para colorear" className="w-full h-auto" />
                     </div>
                     <button 
                        onClick={() => {
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                                printWindow.document.write(`
                                    <html>
                                    <head><title>Imprimir - Pequeño Musulmán</title></head>
                                    <body style="text-align:center;">
                                        <h1>${selectedThemeLabel}</h1>
                                        <img src="${generatedColoringImage}" style="max-width:100%; height:auto; border:1px solid #ccc;" />
                                        <script>window.onload = function() { window.print(); }</script>
                                    </body>
                                    </html>
                                `);
                                printWindow.document.close();
                            }
                        }}
                        className="bg-kids-purple hover:bg-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 shadow-lg hover:scale-105 transition-transform"
                     >
                         <Printer size={24} /> ¡Imprimir Dibujo!
                     </button>
                 </div>
             ) : (
                 <div className="text-center text-gray-400">
                     <Palette size={64} className="mx-auto mb-4 opacity-30" />
                     <p>Selecciona un botón arriba para empezar</p>
                 </div>
             )}
          </div>
        </div>
      )}

      {/* VIEW: WORKBOOKS */}
      {activeTab === 'workbooks' && !selectedWorkbook && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
           <div onClick={() => setSelectedWorkbook('alphabet')} className="cursor-pointer bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-2xl border-2 border-green-200 hover:shadow-xl transition-all text-center group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">ا ب ت</div>
              <h3 className="text-2xl font-bold text-green-800">Alfabeto Árabe Completo</h3>
              <p className="text-green-600 mb-4">Todas las letras con vocabulario y planas.</p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">Abrir Cuaderno (28 Páginas)</button>
           </div>
           <div onClick={() => setSelectedWorkbook('prayer')} className="cursor-pointer bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-xl transition-all text-center group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🕌</div>
              <h3 className="text-2xl font-bold text-blue-800">Las 5 Oraciones</h3>
              <p className="text-blue-600 mb-4">Guía paso a paso.</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Abrir Cuaderno</button>
           </div>
           <div className="opacity-50 cursor-not-allowed bg-gray-100 p-6 rounded-2xl border-2 border-gray-200 text-center">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-2xl font-bold text-gray-500">Buenos Modales (Pronto)</h3>
           </div>
        </div>
      )}

      {/* WORKBOOK PREVIEW / PRINT MODE */}
      {selectedWorkbook && (
        <div className="animate-fade-in">
            <div className="mb-6 flex justify-between items-center bg-gray-800 text-white p-4 rounded-lg sticky top-24 z-40 no-print shadow-xl">
                <button onClick={() => setSelectedWorkbook(null)} className="hover:text-gray-300">← Volver a la lista</button>
                <span className="font-bold">Modo Vista Previa ({selectedWorkbook === 'alphabet' ? '29 Páginas' : '1 Página'})</span>
                <button onClick={handlePrint} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-bold flex items-center gap-2">
                    <Printer size={20} /> Imprimir Cuaderno
                </button>
            </div>

            <div className="print-container bg-gray-500 p-8 print:p-0 print:bg-white overflow-y-auto min-h-screen">
                {selectedWorkbook === 'alphabet' && <AlphabetWorkbook />}
                {selectedWorkbook === 'prayer' && <PrayerPage />}
            </div>
        </div>
      )}
    </div>
  );
};