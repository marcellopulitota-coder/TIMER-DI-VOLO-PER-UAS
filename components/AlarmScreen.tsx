import React, { useEffect, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';
import { playAudioFromBase64 } from '../utils/audioUtils';

interface AlarmScreenProps {
    onAcknowledge: () => void;
}

const ALARM_TEXT = "Il tempo di volo è scaduto. Marcello, devi atterrare quanto prima.";

const AlarmScreen: React.FC<AlarmScreenProps> = ({ onAcknowledge }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioDataRef = useRef<string | null>(null);

    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        // Pre-generate speech
        generateSpeech(ALARM_TEXT).then(data => {
            audioDataRef.current = data;
            // Play immediately once loaded
            if (data && audioContextRef.current) {
                playAudioFromBase64(audioContextRef.current, data);
            }
        });

        const interval = setInterval(() => {
            if (audioDataRef.current && audioContextRef.current) {
                playAudioFromBase64(audioContextRef.current, audioDataRef.current);
            }
        }, 10000); // Repeat every 10 seconds

        return () => {
            clearInterval(interval);
        };
    }, []);

    const handleAcknowledge = () => {
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        onAcknowledge();
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-8 p-8 bg-red-900/50 rounded-lg animate-pulse">
            <div className="text-center">
                <h2 className="text-4xl font-extrabold text-red-300">TEMPO SCADUTO</h2>
                <p className="text-lg text-white mt-2">Procedere con l'atterraggio immediatamente.</p>
            </div>
            <button
                onClick={handleAcknowledge}
                className="w-full py-4 text-xl font-bold text-white bg-red-600 rounded-lg transition-colors hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-400"
            >
                HO CAPITO
            </button>
        </div>
    );
};

export default AlarmScreen;
