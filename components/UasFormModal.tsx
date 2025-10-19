
import React, { useState, useEffect } from 'react';
import type { UAS } from '../types';

interface UasFormModalProps {
    uas: UAS | null;
    onSave: (uas: UAS) => void;
    onClose: () => void;
}

const UasFormModal: React.FC<UasFormModalProps> = ({ uas, onSave, onClose }) => {
    const [name, setName] = useState('');
    const [minutes, setMinutes] = useState('15');

    useEffect(() => {
        if (uas) {
            setName(uas.name);
            setMinutes(Math.floor(uas.flightTime / 60).toString());
        } else {
            setName('');
            setMinutes('15');
        }
    }, [uas]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const flightTimeInSeconds = parseInt(minutes, 10) * 60;
        if (name.trim() && !isNaN(flightTimeInSeconds) && flightTimeInSeconds > 0) {
            onSave({
                id: uas ? uas.id : Date.now().toString(),
                name: name.trim(),
                flightTime: flightTimeInSeconds,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white">{uas ? 'Modifica UAS' : 'Aggiungi UAS'}</h2>
                    <div>
                        <label htmlFor="uas-name" className="block text-sm font-medium text-gray-300 mb-1">Nome UAS</label>
                        <input
                            id="uas-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="flight-time" className="block text-sm font-medium text-gray-300 mb-1">Tempo di Volo (minuti)</label>
                        <input
                            id="flight-time"
                            type="number"
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            min="1"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">
                            Annulla
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">
                            Salva
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UasFormModal;
