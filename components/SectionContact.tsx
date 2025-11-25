import React from 'react';

export const SectionContact: React.FC = () => {
    return (
        <div className="p-6 max-w-2xl mx-auto min-h-screen">
            <h1 className="text-4xl font-bold text-center text-red-400 mb-8">Buzón de Sugerencias</h1>
            <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-red-300">
                <p className="text-gray-600 mb-6 text-center text-lg">
                    ¿Tienes una idea para mejorar Pequeño Musulmán? ¡Escríbenos!
                </p>
                <div className="bg-gray-100 p-4 rounded-xl text-center mb-6">
                    <span className="text-gray-500">Correo Electrónico:</span>
                    <a href="mailto:aprendeallah@gmail.com" className="block text-2xl font-bold text-red-500 hover:underline">aprendeallah@gmail.com</a>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Tu Nombre</label>
                        <input type="text" className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-red-300 outline-none" placeholder="¿Cómo te llamas?" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Mensaje</label>
                        <textarea className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-red-300 outline-none h-32" placeholder="Escribe tu mensaje aquí..."></textarea>
                    </div>
                    <button className="w-full bg-red-400 text-white font-bold py-3 rounded-xl hover:bg-red-500 transition-colors">
                        Enviar Mensaje
                    </button>
                </form>
            </div>
        </div>
    )
}