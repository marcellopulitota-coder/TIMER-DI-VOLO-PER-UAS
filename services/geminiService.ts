
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. TTS features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateSpeech = async (text: string): Promise<string | null> => {
    if (!process.env.API_KEY) {
        console.error("Cannot generate speech: API_KEY is not configured.");
        return null;
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A versatile female voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        }
        return null;
    } catch (error) {
        console.error("Error generating speech with Gemini API:", error);
        return null;
    }
};
