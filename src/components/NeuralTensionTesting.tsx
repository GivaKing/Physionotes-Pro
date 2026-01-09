
import React, { useState } from 'react';
import { TherapistData, NEURAL_TESTS_LIST, NeuralTensionData, NeuralTensionSide, NEURAL_GRADES } from '../types';
import { Portal } from './Input';

export const NeuralTensionTesting = ({ tData, setTData }: { tData: TherapistData; setTData: React.Dispatch<React.SetStateAction<TherapistData>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const neuralData: NeuralTensionData = tData.neuralTension || {};

    const addTest = (testId: string) => {
        if (!neuralData[testId]) {
            const defaultSide: NeuralTensionSide = { grade: '', positive: false, angle: '' };
            const newData = { 
                ...neuralData, 
                [testId]: { l: { ...defaultSide }, r: { ...defaultSide } } 
            };
            setTData({ ...tData, neuralTension: newData });
        }
        setIsModalOpen(false);
    };

    const removeTest = (testId: string) => {
        const newData = { ...neuralData };
        delete newData[testId];
        setTData({ ...tData, neuralTension: newData });
    };

    const updateSide = (testId: string, side: 'l' | 'r', field: keyof NeuralTensionSide, value: any) => {
        const defaultSide: NeuralTensionSide = { grade: '', positive: false, angle: '' };
        const currentTest = neuralData[testId] || { l: { ...defaultSide }, r: { ...defaultSide } };
        const currentSide = currentTest[side];
        
        const newData = {
            ...neuralData,
            [testId]: {
                ...currentTest,
                [side]: { ...currentSide, [field]: value }
            }
        };
        setTData({ ...tData, neuralTension: newData });
    };

    // Extract unique categories for grouping
    const categories = Array.from(new Set(NEURAL_TESTS_LIST.map(t => t.category)));

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-teal-500 rounded-full"></span>
                    神經張力測試 (Neural Tension)
                </h4>
                <button 
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-[11px] bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg font-bold border border-teal-200 shadow-sm hover:bg-teal-100 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
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
                        <div className="relative z-10 bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800">選擇神經張力測試</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-1">✕</button>
                            </div>
                            <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
                                {categories.map(cat => (
                                    <div key={cat} className="mb-3 last:mb-0">
                                        <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cat}</div>
                                        <div className="space-y-1">
                                            {NEURAL_TESTS_LIST.filter(t => t.category === cat).map(test => (
                                                <button 
                                                    key={test.id} 
                                                    onClick={() => addTest(test.id)}
                                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 bg-white hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-all border border-transparent hover:border-teal-100"
                                                >
                                                    {test.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            <div className="p-3 space-y-4">
                {Object.keys(neuralData).length === 0 ? (
                    <div onClick={() => setIsModalOpen(true)} className="text-center py-4 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal-300"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="font-bold">點擊新增神經張力測試</span>
                    </div>
                ) : (
                    Object.entries(neuralData).map(([testId, sides]) => {
                        const testInfo = NEURAL_TESTS_LIST.find(t => t.id === testId);
                        return (
                            <div key={testId} className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                    <h5 className="font-bold text-slate-800 text-xs">{testInfo?.label || testId}</h5>
                                    <button type="button" onClick={() => removeTest(testId)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {['l', 'r'].map((side) => {
                                        const sData = (sides as any)[side] as NeuralTensionSide;
                                        return (
                                            <div key={side} className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-400 w-4 uppercase">{side}</span>
                                                
                                                {/* Grade Section */}
                                                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 pl-2">
                                                    <span className="text-[9px] font-bold text-slate-500">Grade</span>
                                                    <div className="group relative cursor-help mr-1">
                                                        <span className="text-[8px] text-slate-400 border border-slate-300 rounded-full w-3 h-3 flex items-center justify-center">?</span>
                                                        <div className="absolute left-4 top-[-10px] w-40 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 leading-relaxed">
                                                            <div className="font-bold mb-1 border-b border-slate-600 pb-1">Tsai's (2008) Grading</div>
                                                            <div>0: Initial Range</div>
                                                            <div>I: No End Feel (Linear)</div>
                                                            <div>II: End Feel (Plastic)</div>
                                                            <div>III: Anatomic Block</div>
                                                        </div>
                                                    </div>
                                                    {NEURAL_GRADES.map(g => (
                                                        <button
                                                            key={g.val}
                                                            onClick={() => updateSide(testId, side as 'l'|'r', 'grade', g.val)}
                                                            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${sData.grade === g.val ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                            title={g.desc}
                                                        >
                                                            {g.label}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Positive/Negative */}
                                                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                                    <button
                                                        onClick={() => updateSide(testId, side as 'l'|'r', 'positive', true)}
                                                        className={`w-8 py-1 rounded text-[10px] font-black transition-all ${sData.positive === true ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title="Positive (+)"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() => updateSide(testId, side as 'l'|'r', 'positive', false)}
                                                        className={`w-8 py-1 rounded text-[10px] font-black transition-all ${sData.positive === false ? 'bg-green-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title="Negative (-)"
                                                    >
                                                        -
                                                    </button>
                                                </div>

                                                {/* Note/Angle */}
                                                <input 
                                                    type="text" 
                                                    placeholder="Angle / Note..." 
                                                    value={sData.angle || ''}
                                                    onChange={e => updateSide(testId, side as 'l'|'r', 'angle', e.target.value)}
                                                    className="flex-1 min-w-[80px] px-2 py-1 text-[10px] border border-slate-200 rounded bg-slate-50 focus:bg-white outline-none"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
