
import React, { useState, useEffect, useMemo } from 'react';
import type { UAS } from '../types';
import UasFormModal from './UasFormModal';
import { EditIcon, DeleteIcon, PlusIcon } from './icons';

const initialUasList: UAS[] = [
    { id: 'dji-mini-3', name: 'DJI Mini 3 Pro', flightTime: 1800 },
    { id: 'dji-mavic-3', name: 'DJI Mavic 3', flightTime: 2700 },
    { id: 'autel-evo-2', name: 'Autel Evo II Pro', flightTime: 2400 },
    { id: 'dji-air-2s', name: 'DJI Air 2S', flightTime: 1860 },
    { id: 'parrot-anafi', name: 'Parrot Anafi', flightTime: 1500 },
    { id: 'skydio-2', name: 'Skydio 2', flightTime: 1380 },
    { id: 'dji-fpv', name: 'DJI FPV', flightTime: 1200 },
    { id: 'yuneec-typhoon', name: 'Yuneec Typhoon H', flightTime: 1500 },
    { id: 'ryze-tello', name: 'Ryze Tello', flightTime: 780 },
    { id: 'hubsan-zino', name: 'Hubsan Zino Pro', flightTime: 1380 },
];

const STORAGE_KEY = 'uasFlightTimers';

const UasListScreen: React.FC<{ onStartTimer: (uas: UAS) => void }> = ({ onStartTimer }) => {
    const [uasList, setUasList] = useState<UAS[]>(() => {
        try {
            const items = window.localStorage.getItem(STORAGE_KEY);
            return items ? JSON.parse(items) : initialUasList;
        } catch (error) {
            console.error("Failed to load UAS list from localStorage", error);
            return initialUasList;
        }
    });

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [customMinutes, setCustomMinutes] = useState(15);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUas, setEditingUas] = useState<UAS | null>(null);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(uasList));
    }, [uasList]);

    const handleSelect = (id: string) => {
        setSelectedId(id === selectedId ? null : id);
    };

    const handleStart = () => {
        if (!selectedId) return;

        if (selectedId === 'LIBERO') {
            if (customMinutes > 0) {
                onStartTimer({
                    id: 'LIBERO',
                    name: 'LIBERO',
                    flightTime: customMinutes * 60,
                });
            }
        } else {
            const selected = uasList.find(u => u.id === selectedId);
            if (selected) {
                onStartTimer(selected);
            }
        }
    };

    const handleSaveUas = (uasToSave: UAS) => {
        if (editingUas) {
            setUasList(uasList.map(u => u.id === uasToSave.id ? uasToSave : u));
        } else {
            setUasList([...uasList, uasToSave]);
        }
        setIsModalOpen(false);
        setEditingUas(null);
    };

    const handleDeleteUas = (id: string) => {
        if (window.confirm("Sei sicuro di voler eliminare questo UAS?")) {
            setUasList(uasList.filter(u => u.id !== id));
        }
    };

    const openEditModal = (uas: UAS) => {
        setEditingUas(uas);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingUas(null);
        setIsModalOpen(true);
    };

    const uasLibero: UAS = useMemo(() => ({ id: 'LIBERO', name: 'LIBERO', flightTime: customMinutes * 60 }), [customMinutes]);

    const allOptions = [uasLibero, ...uasList];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-300">Seleziona UAS</h3>
                <button
                    onClick={openAddModal}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Aggiungi</span>
                </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {allOptions.map(uas => (
                    <div
                        key={uas.id}
                        onClick={() => handleSelect(uas.id)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${selectedId === uas.id ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        <div className="flex flex-col">
                            <span className="font-semibold text-white">{uas.name}</span>
                            {uas.id !== 'LIBERO' && <span className="text-sm text-gray-400">{Math.floor(uas.flightTime / 60)} min</span>}
                        </div>
                        {uas.id !== 'LIBERO' && (
                            <div className="flex space-x-2">
                                <button onClick={(e) => { e.stopPropagation(); openEditModal(uas); }} className="text-gray-400 hover:text-white p-1"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteUas(uas.id); }} className="text-gray-400 hover:text-red-400 p-1"><DeleteIcon className="w-5 h-5"/></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedId === 'LIBERO' && (
                <div className="p-4 bg-gray-700/50 rounded-lg">
                    <label htmlFor="custom-time" className="block text-sm font-medium text-gray-300 mb-2">
                        Tempo di volo personalizzato (minuti)
                    </label>
                    <input
                        id="custom-time"
                        type="number"
                        min="1"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-gray-900 text-white border border-gray-600 rounded-md px-3 py-2 text-center text-lg"
                    />
                </div>
            )}

            <button
                onClick={handleStart}
                disabled={!selectedId}
                className="w-full py-3 text-lg font-bold text-white bg-green-600 rounded-lg transition-colors hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                OK
            </button>

            {isModalOpen && <UasFormModal uas={editingUas} onSave={handleSaveUas} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default UasListScreen;
