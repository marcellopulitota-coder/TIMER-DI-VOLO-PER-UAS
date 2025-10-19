import React, { useState, useEffect, useRef } from 'react';
import type { UAS } from '../types';
import { generateSpeech } from '../services/geminiService';
import { playAudioFromBase64, playBeep } from '../utils/audioUtils';

interface TimerScreenProps {
    uas: UAS;
    onTimerEnd: () => void;
    onCancel: () => void;
}

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const TimerScreen: React.FC<TimerScreenProps> = ({ uas, onTimerEnd, onCancel }) => {
    const [remainingTime, setRemainingTime] = useState(uas.flightTime);
    const audioContextRef = useRef<AudioContext | null>(null);
    const lastMinuteAnnounced = useRef<number | null>(null);

    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        // Resume AudioContext on user interaction if needed, though starting the timer is one.
        const resumeAudio = () => {
            if(audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            document.removeEventListener('click', resumeAudio);
        }
        document.addEventListener('click', resumeAudio);

        const timer = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onTimerEnd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            document.removeEventListener('click', resumeAudio);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onTimerEnd]);

    useEffect(() => {
        const audioContext = audioContextRef.current;
        if (!audioContext) return;

        const currentMinute = Math.ceil(remainingTime / 60);

        // Announce remaining minutes
        if (remainingTime > 15 && remainingTime % 60 === 0 && remainingTime > 0) {
            if (lastMinuteAnnounced.current !== currentMinute) {
                lastMinuteAnnounced.current = currentMinute;
                const plural = currentMinute > 1 ? 'minuti' : 'minuto';
                const text = `Tempo rimanente del tuo ${uas.name}: ${currentMinute} ${plural} per l'atterraggio.`;
                generateSpeech(text).then(audioData => {
                    if (audioData) playAudioFromBase64(audioContext, audioData);
                });
            }
        }

        // Beep for the last 15 seconds
        if (remainingTime > 0 && remainingTime <= 15) {
            playBeep(audioContext);
        }
    }, [remainingTime, uas.name]);

    const progressPercentage = (remainingTime / uas.flightTime) * 100;

    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-xl font-bold text-blue-300">{uas.name}</h2>
            <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                        className="text-gray-700"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                    />
                    <circle
                        className="text-blue-500 transition-all duration-1000 ease-linear"
                        strokeWidth="8"
                        strokeDasharray="282.6"
                        strokeDashoffset={282.6 - (progressPercentage / 100) * 282.6}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                </svg>
                <div className="absolute font-mono text-6xl font-bold tracking-tighter">
                    {formatTime(remainingTime)}
                </div>
            </div>
            <p className="text-gray-400">Tempo di volo rimanente</p>
            <button
                onClick={onCancel}
                className="mt-4 px-8 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
                Annulla
            </button>
        </div>
    );
};

export default TimerScreen;