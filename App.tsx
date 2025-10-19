
import React, { useState, useCallback } from 'react';
import UasListScreen from './components/UasListScreen';
import TimerScreen from './components/TimerScreen';
import AlarmScreen from './components/AlarmScreen';
import type { UAS } from './types';

type View = 'list' | 'timer' | 'alarm';

const App: React.FC = () => {
    const [view, setView] = useState<View>('list');
    const [activeUas, setActiveUas] = useState<UAS | null>(null);

    const handleStartTimer = useCallback((uas: UAS) => {
        setActiveUas(uas);
        setView('timer');
    }, []);

    const handleTimerEnd = useCallback(() => {
        setView('alarm');
    }, []);

    const handleAlarmAcknowledged = useCallback(() => {
        setActiveUas(null);
        setView('list');
    }, []);

    const handleCancelTimer = useCallback(() => {
        setActiveUas(null);
        setView('list');
    }, []);

    const renderView = () => {
        switch (view) {
            case 'timer':
                return activeUas && <TimerScreen uas={activeUas} onTimerEnd={handleTimerEnd} onCancel={handleCancelTimer} />;
            case 'alarm':
                return activeUas && <AlarmScreen onAcknowledge={handleAlarmAcknowledged} />;
            case 'list':
            default:
                return <UasListScreen onStartTimer={handleStartTimer} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <header className="bg-gray-900 p-4 border-b border-blue-500/30">
                    <h1 className="text-2xl font-bold text-center text-blue-300 tracking-wider">
                        TIMER DI VOLO PER UAS
                    </h1>
                </header>
                <main className="p-4 md:p-6">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default App;
