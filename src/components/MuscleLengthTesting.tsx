
import React, { useState } from 'react';
import { TherapistData, MUSCLE_LENGTH_DB, MuscleLengthData, MuscleLengthEntry } from '../types';
import { Portal } from './Input';

export const MuscleLengthTesting = ({ tData, setTData }: { tData: TherapistData; setTData: React.Dispatch<React.SetStateAction<TherapistData>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Normalize data: support legacy string or new object structure
    const muscleData: MuscleLengthData = typeof tData.muscleLength === 'object' && tData.muscleLength !== null
        ? tData.muscleLength 
        : {};

    const addTest = (testName: string) => {
        if (!muscleData[testName]) {
            const defaultEntry: MuscleLengthEntry = { result: '', value: '', note: '' };
            const newData = { 
                ...muscleData, 
                [testName]: { l: { ...defaultEntry }, r: { ...defaultEntry } } 
            };
            setTData({ ...tData, muscleLength: newData });
        }
        setIsModalOpen(false);
        setSearchTerm('');
    };

    const removeTest = (testName: string) => {
        const newData = { ...muscleData };
        delete newData[testName];
        setTData({ ...tData, muscleLength: newData });
    };

    const updateSide = (testName: string, side: 'l' | 'r', field: keyof MuscleLengthEntry, value: any) => {
        const defaultEntry: MuscleLengthEntry = { result: '', value: '', note: '' };
        const currentTest = muscleData[testName] || { l: { ...defaultEntry }, r: { ...defaultEntry } };
        const currentSide = currentTest[side];
        
        const newData = {
            ...muscleData,
            [testName]: {
                ...currentTest,
                [side]: { ...currentSide, [field]: value }
            }
        };
        setTData({ ...tData, muscleLength: newData });
    };

    // Filter tests based on search term
    const filteredDB = MUSCLE_LENGTH_DB.map(group => ({
        ...group,
        tests: group.tests.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    })).filter(g => g.tests.length > 0);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-pink-500 rounded-full"></span>
                    肌肉長度測試 (Muscle Length)
                </h4>
                <button 
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-[11px] bg-pink-50 text-pink-700 px-2.5 py-1 rounded-lg font-bold border border-pink-200 shadow-sm hover:bg-pink-100 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                    新增測試
                </button>
            </div>

            {/* Selection Modal */}
            {isModalOpen && (
                <Portal>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
                            onClick={() => setIsModalOpen(false)}
                        />
                        
                        {/* Content */}
                        <div className="relative z-10 bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                                <h3 className="font-bold text-slate-800">選擇肌肉長度測試</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-1">✕</button>
                            </div>
                            
                            <div className="px-4 py-2 border-b border-slate-50 bg-white shrink-0">
                                <input 
                                    type="text" 
                                    placeholder="搜尋測試項目..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                                    autoFocus
                                />
                            </div>

                            <div className="p-2 space-y-1 overflow-y-auto no-scrollbar flex-1">
                                {filteredDB.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-xs">無符合項目</div>
                                ) : (
                                    filteredDB.map(categoryGroup => (
                                        <div key={categoryGroup.category} className="mb-3 last:mb-0">
                                            <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{categoryGroup.category}</div>
                                            <div className="space-y-1">
                                                {categoryGroup.tests.map(testName => (
                                                    <button 
                                                        key={testName} 
                                                        onClick={() => addTest(testName)}
                                                        className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 bg-white hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-all border border-transparent hover:border-pink-100"
                                                    >
                                                        {testName}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            <div className="p-3 space-y-4">
                {Object.keys(muscleData).length === 0 ? (
                    <div onClick={() => setIsModalOpen(true)} className="text-center py-4 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-pink-300"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="font-bold">點擊新增肌肉長度測試</span>
                    </div>
                ) : (
                    Object.entries(muscleData).map(([testName, sides]) => (
                        <div key={testName} className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                <h5 className="font-bold text-slate-800 text-xs">{testName}</h5>
                                <button type="button" onClick={() => removeTest(testName)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="space-y-2">
                                {['l', 'r'].map((side) => {
                                    const sData = (sides as any)[side] as MuscleLengthEntry;
                                    return (
                                        <div key={side} className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 w-4 uppercase">{side}</span>
                                            
                                            {/* Result Selection - Reordered: Hyper, Normal, Tight */}
                                            <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                                <button
                                                    onClick={() => updateSide(testName, side as 'l'|'r', 'result', 'Hyper')}
                                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${sData.result === 'Hyper' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Hyper
                                                </button>
                                                <button
                                                    onClick={() => updateSide(testName, side as 'l'|'r', 'result', 'Normal')}
                                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${sData.result === 'Normal' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Normal
                                                </button>
                                                <button
                                                    onClick={() => updateSide(testName, side as 'l'|'r', 'result', 'Tight')}
                                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${sData.result === 'Tight' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Tight
                                                </button>
                                            </div>

                                            {/* Pain Toggle */}
                                            <button
                                                onClick={() => updateSide(testName, side as 'l'|'r', 'painful', !sData.painful)}
                                                className={`h-7 px-2.5 rounded-md text-[10px] font-bold border transition-all flex items-center justify-center gap-1
                                                ${sData.painful 
                                                    ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' 
                                                    : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-red-400'}`}
                                            >
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                Pain
                                            </button>

                                            {/* Value/Note */}
                                            <input 
                                                type="text" 
                                                placeholder="Value/Note (e.g. -10°)" 
                                                value={sData.value || ''}
                                                onChange={e => updateSide(testName, side as 'l'|'r', 'value', e.target.value)}
                                                className="flex-1 min-w-[80px] px-2 py-1 text-[10px] border border-slate-200 rounded bg-slate-50 focus:bg-white outline-none font-medium"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
