import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateStory = async (topic: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Por favor configura tu API KEY para generar historias mágicas.";

  try {
    const prompt = `Escribe una historia corta, divertida y educativa para niños de primaria sobre: ${topic}. 
    Usa un lenguaje sencillo y amigable. Enfatiza valores islámicos como la bondad, la honestidad y el respeto a la comunidad (Ummah).
    No uses formato markdown complejo, solo párrafos.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudo generar la historia. Intenta de nuevo.";
  } catch (error) {
    console.error("Error generating story:", error);
    return "Hubo un error al conectar con el narrador mágico.";
  }
};

export const generateQuizQuestion = async (topic: string): Promise<{question: string, options: string[], correct: number}> => {
     const ai = getAIClient();
     if (!ai) return { question: "Error de API", options: [], correct: 0 };
    
     // Mock return for demo purposes if API fails or isn't present, 
     // but logically this would call the API for infinite questions.
     return {
         question: `¿Cuál es una buena acción relacionada con ${topic}?`,
         options: ["Sonreír", "Gritar", "Ignorar"],
         correct: 0
     }
}

export const generateImage = async (prompt: string): Promise<string | null> => {
  const ai = getAIClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};