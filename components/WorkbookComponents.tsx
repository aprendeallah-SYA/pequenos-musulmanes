import React from 'react';
import { ArabicLetter } from '../types';

// Full Arabic Alphabet Data
const ARABIC_ALPHABET: ArabicLetter[] = [
  { letter: 'ا', name: 'Alif', start: 'ا', middle: 'ـا', end: 'ـا', pronunciation: 'A', word: 'أَرْنَب', translation: 'Conejo (Arnab)', icon: '🐰' },
  { letter: 'ب', name: 'Ba', start: 'بـ', middle: 'ـبـ', end: 'ـب', pronunciation: 'B', word: 'بَيت', translation: 'Casa (Bayt)', icon: '🏠' },
  { letter: 'ت', name: 'Ta', start: 'تـ', middle: 'ـتـ', end: 'ـت', pronunciation: 'T', word: 'تُفَّاحَة', translation: 'Manzana (Tuffaha)', icon: '🍎' },
  { letter: 'ث', name: 'Tha', start: 'ثـ', middle: 'ـثـ', end: 'ـث', pronunciation: 'Th', word: 'ثَعْلَب', translation: 'Zorro (Tha\'lab)', icon: '🦊' },
  { letter: 'ج', name: 'Jeem', start: 'جـ', middle: 'ـجـ', end: 'ـج', pronunciation: 'J', word: 'جَمَل', translation: 'Camello (Jamal)', icon: '🐪' },
  { letter: 'ح', name: 'Ha', start: 'حـ', middle: 'ـحـ', end: 'ـح', pronunciation: 'H (fuerte)', word: 'حِصَان', translation: 'Caballo (Hisan)', icon: '🐎' },
  { letter: 'خ', name: 'Kha', start: 'خـ', middle: 'ـخـ', end: 'ـخ', pronunciation: 'Kh', word: 'خَرُوف', translation: 'Oveja (Kharouf)', icon: '🐑' },
  { letter: 'د', name: 'Dal', start: 'د', middle: 'ـد', end: 'ـد', pronunciation: 'D', word: 'دِيك', translation: 'Gallo (Dik)', icon: '🐓' },
  { letter: 'ذ', name: 'Dhal', start: 'ذ', middle: 'ـذ', end: 'ـذ', pronunciation: 'Dh', word: 'ذُرَة', translation: 'Maíz (Dura)', icon: '🌽' },
  { letter: 'ر', name: 'Ra', start: 'ر', middle: 'ـر', end: 'ـر', pronunciation: 'R', word: 'رُمَّان', translation: 'Granada (Rumman)', icon: '🍎' },
  { letter: 'ز', name: 'Zay', start: 'ز', middle: 'ـز', end: 'ـز', pronunciation: 'Z', word: 'زَرَافَة', translation: 'Jirafa (Zarafa)', icon: '🦒' },
  { letter: 'س', name: 'Seen', start: 'سـ', middle: 'ـسـ', end: 'ـس', pronunciation: 'S', word: 'سَمَكَة', translation: 'Pez (Samaka)', icon: '🐟' },
  { letter: 'ش', name: 'Sheen', start: 'شـ', middle: 'ـشـ', end: 'ـش', pronunciation: 'Sh', word: 'شَمْس', translation: 'Sol (Shams)', icon: '☀️' },
  { letter: 'ص', name: 'Sad', start: 'صـ', middle: 'ـصـ', end: 'ـص', pronunciation: 'S (fuerte)', word: 'صَقْر', translation: 'Halcón (Saqr)', icon: '🦅' },
  { letter: 'ض', name: 'Dad', start: 'ضـ', middle: 'ـضـ', end: 'ـض', pronunciation: 'D (fuerte)', word: 'ضِفْدَع', translation: 'Rana (Difda)', icon: '🐸' },
  { letter: 'ط', name: 'Ta', start: 'طـ', middle: 'ـطـ', end: 'ـط', pronunciation: 'T (fuerte)', word: 'طَائِرَة', translation: 'Avión (Taira)', icon: '✈️' },
  { letter: 'ظ', name: 'Za', start: 'ظـ', middle: 'ـظـ', end: 'ـظ', pronunciation: 'Z (fuerte)', word: 'ظَرْف', translation: 'Sobre (Zarf)', icon: '✉️' },
  { letter: 'ع', name: 'Ain', start: 'عـ', middle: 'ـعـ', end: 'ـع', pronunciation: '‘A', word: 'عِنَب', translation: 'Uvas (Inab)', icon: '🍇' },
  { letter: 'غ', name: 'Ghain', start: 'غـ', middle: 'ـغـ', end: 'ـغ', pronunciation: 'Gh', word: 'غَزَال', translation: 'Gacela (Ghazal)', icon: '🦌' },
  { letter: 'ف', name: 'Fa', start: 'فـ', middle: 'ـفـ', end: 'ـف', pronunciation: 'F', word: 'فِيل', translation: 'Elefante (Fil)', icon: '🐘' },
  { letter: 'ق', name: 'Qaf', start: 'قـ', middle: 'ـقـ', end: 'ـق', pronunciation: 'Q', word: 'قَمَر', translation: 'Luna (Qamar)', icon: '🌙' },
  { letter: 'ك', name: 'Kaf', start: 'كـ', middle: 'ـكـ', end: 'ـك', pronunciation: 'K', word: 'كِتَاب', translation: 'Libro (Kitab)', icon: '📖' },
  { letter: 'ل', name: 'Lam', start: 'لـ', middle: 'ـلـ', end: 'ـل', pronunciation: 'L', word: 'لَيْمُون', translation: 'Limón (Laymun)', icon: '🍋' },
  { letter: 'م', name: 'Meem', start: 'مـ', middle: 'ـمـ', end: 'ـم', pronunciation: 'M', word: 'مَسْجِد', translation: 'Mezquita (Masjid)', icon: '🕌' },
  { letter: 'ن', name: 'Noon', start: 'نـ', middle: 'ـنـ', end: 'ـن', pronunciation: 'N', word: 'نَجْمَة', translation: 'Estrella (Najma)', icon: '⭐' },
  { letter: 'ه', name: 'Ha', start: 'هـ', middle: 'ـهـ', end: 'ـه', pronunciation: 'H', word: 'هِلال', translation: 'Creciente (Hilal)', icon: '🌙' },
  { letter: 'و', name: 'Waw', start: 'و', middle: 'ـو', end: 'ـو', pronunciation: 'W', word: 'وَرْدَة', translation: 'Rosa (Warda)', icon: '🌹' },
  { letter: 'ي', name: 'Ya', start: 'يـ', middle: 'ـيـ', end: 'ـي', pronunciation: 'Y', word: 'يَد', translation: 'Mano (Yad)', icon: '✋' },
];

export const AlphabetPage: React.FC<{ letter: ArabicLetter }> = ({ letter }) => (
  <div className="border-4 border-black p-6 h-[29.7cm] w-[21cm] page-break mb-8 bg-white print:border-2 print:mb-0 print:mx-auto relative flex flex-col justify-between">
    <div>
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-gray-300 pb-2 mb-4">
          <span className="text-gray-500 text-sm">Cuaderno de Árabe - Pequeño Musulmán</span>
          <h2 className="text-2xl font-bold uppercase">Letra {letter.name}</h2>
        </div>
        
        {/* Hero Section */}
        <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-xl print:bg-transparent border border-gray-200">
          <div className="text-center w-1/3">
            <span className="block text-sm text-gray-500">Nombre</span>
            <span className="text-2xl font-bold text-emerald-600">{letter.name}</span>
          </div>
          <div className="text-8xl font-sans font-bold text-black w-1/3 text-center">{letter.letter}</div>
          <div className="text-center w-1/3">
            <span className="block text-sm text-gray-500">Sonido</span>
            <span className="text-2xl font-bold text-emerald-600">{letter.pronunciation}</span>
          </div>
        </div>

        {/* Forms Section */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div className="border-2 border-dashed border-gray-300 p-2 rounded-lg">
            <span className="text-gray-400 text-xs uppercase tracking-wide">Final</span>
            <div className="text-4xl mt-1 font-bold">{letter.end}</div>
          </div>
          <div className="border-2 border-dashed border-gray-300 p-2 rounded-lg">
            <span className="text-gray-400 text-xs uppercase tracking-wide">Medio</span>
            <div className="text-4xl mt-1 font-bold">{letter.middle}</div>
          </div>
          <div className="border-2 border-dashed border-gray-300 p-2 rounded-lg">
            <span className="text-gray-400 text-xs uppercase tracking-wide">Inicio</span>
            <div className="text-4xl mt-1 font-bold">{letter.start}</div>
          </div>
        </div>

        {/* Vocabulary/Drawing Section */}
        <div className="flex items-center gap-6 mb-6 p-4 border-2 border-black rounded-xl">
            <div className="text-6xl">{letter.icon}</div>
            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">Aprende una palabra:</h3>
                <p className="text-3xl font-bold text-emerald-700 font-sans mt-1">{letter.word}</p>
                <p className="text-lg text-gray-600 italic">{letter.translation}</p>
            </div>
            <div className="w-32 h-24 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-center text-xs text-gray-400">
                Dibuja aquí<br/>{letter.translation}
            </div>
        </div>

        {/* Writing Practice (Planas) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold mb-2">¡A practicar! Traza y escribe:</h3>
          
          {/* Row 1: Large Tracing */}
          <div className="h-14 border-b border-black flex items-center justify-end gap-6 px-4 relative">
             <div className="absolute left-0 text-xs text-gray-400">Traza</div>
             {Array(6).fill(letter.letter).map((l, i) => (
                 <span key={i} className="text-4xl text-gray-200 font-sans z-10">{l}</span>
             ))}
             {/* Guide Lines */}
             <div className="absolute top-1/2 w-full border-t border-dashed border-gray-300 left-0 -z-0"></div>
          </div>

          {/* Row 2: Medium Tracing */}
          <div className="h-14 border-b border-black flex items-center justify-end gap-8 px-4 relative">
             {Array(8).fill(letter.letter).map((l, i) => (
                 <span key={i} className="text-3xl text-gray-200 font-sans z-10">{l}</span>
             ))}
             <div className="absolute top-1/2 w-full border-t border-dashed border-gray-300 left-0 -z-0"></div>
          </div>

           {/* Row 3: Forms Mix */}
           <div className="h-14 border-b border-black flex items-center justify-end gap-6 px-4 relative opacity-40">
             <span className="text-2xl font-sans">{letter.start}</span>
             <span className="text-2xl font-sans">{letter.middle}</span>
             <span className="text-2xl font-sans">{letter.end}</span>
             <span className="text-2xl font-sans">{letter.start}</span>
             <span className="text-2xl font-sans">{letter.middle}</span>
             <span className="text-2xl font-sans">{letter.end}</span>
             <div className="absolute top-1/2 w-full border-t border-dashed border-gray-300 left-0 -z-0"></div>
          </div>

          {/* Row 4: Empty Practice */}
          <div className="h-14 border-b border-black flex items-center relative">
              <div className="absolute top-1/2 w-full border-t border-dashed border-gray-200 left-0"></div>
          </div>
        </div>

        {/* Big Tracing Field (New Addition) */}
        <div className="mt-4 border-4 border-dashed border-gray-200 rounded-2xl h-36 flex items-center justify-around bg-gray-50 print:bg-white relative">
            <span className="absolute top-2 left-3 text-xs text-gray-400 uppercase tracking-widest font-bold">Traza Grande</span>
            {Array(4).fill(letter.letter).map((l, i) => (
                <span key={i} className="text-8xl text-gray-100 font-sans font-bold select-none z-10">{l}</span>
            ))}
        </div>
    </div>
    
    <div className="pt-2 text-center text-xs text-gray-400">
      www.pequeñomusulman.com | ¡Bismillah, empieza con la derecha!
    </div>
  </div>
);

export const AlphabetWorkbook: React.FC = () => {
    return (
        <div className="flex flex-col items-center bg-gray-600 p-8 print:p-0 print:bg-white">
            <div className="bg-white p-8 mb-8 text-center max-w-[21cm] w-full rounded-xl shadow-xl print:shadow-none print:mb-0 page-break h-[29.7cm] flex flex-col justify-center border-4 border-double border-emerald-600">
                <div className="text-9xl mb-8">📖</div>
                <h1 className="text-6xl font-bold text-emerald-800 mb-4">Mi Primer Cuaderno de Árabe</h1>
                <p className="text-2xl text-gray-600 mb-12">Alfabeto, Vocabulario y Escritura</p>
                <div className="border-t-2 border-b-2 border-gray-200 py-8">
                    <p className="text-xl">Este cuaderno pertenece a:</p>
                    <div className="mt-4 border-b-2 border-black w-3/4 mx-auto h-8"></div>
                </div>
            </div>
            
            {ARABIC_ALPHABET.map((letter, index) => (
                <AlphabetPage key={index} letter={letter} />
            ))}
        </div>
    );
};


export const PrayerPage: React.FC = () => (
    <div className="border-4 border-black p-8 h-[29.7cm] w-[21cm] page-break mb-8 bg-white print:border-2 print:mb-0 mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Las 5 Oraciones Diarias</h1>
        <div className="space-y-6">
            {[
                { name: 'Fajr', time: 'Antes del amanecer', rakats: 2, icon: '🌅' },
                { name: 'Dhuhr', time: 'Mediodía', rakats: 4, icon: '☀️' },
                { name: 'Asr', time: 'La Tarde', rakats: 4, icon: '🌤️' },
                { name: 'Maghrib', time: 'Puesta de sol', rakats: 3, icon: '🌇' },
                { name: 'Isha', time: 'La Noche', rakats: 4, icon: '🌌' }
            ].map(prayer => (
                <div key={prayer.name} className="flex border-2 border-black rounded-lg p-4 items-center">
                    <div className="text-5xl mr-6">{prayer.icon}</div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold">{prayer.name}</h2>
                        <p className="text-xl">{prayer.time}</p>
                    </div>
                    <div className="text-center border-l-2 border-black pl-6">
                        <span className="block text-4xl font-bold">{prayer.rakats}</span>
                        <span>Rakats</span>
                    </div>
                </div>
            ))}
        </div>
        <div className="mt-12 border-2 border-dashed border-black p-8 text-center h-64 flex items-center justify-center">
            <p className="text-2xl text-gray-400">Dibuja aquí tu alfombra de oración favorita</p>
        </div>
    </div>
);