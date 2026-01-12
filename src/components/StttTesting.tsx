
import React, { useState } from 'react';
import { TherapistData, STTT_OPTIONS, StttJointData, StttMoveResult } from '../types';
import { Portal } from './Input';

export const StttTesting = ({ tData, setTData }: { tData: TherapistData; setTData: React.Dispatch<React.SetStateAction<TherapistData>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const addStttJoint = (joint: string) => {
        const defaultMoves: StttJointData = {};
        const moves = STTT_OPTIONS[joint];
        if (moves) moves.forEach(move => { defaultMoves[move] = {}; });
        
        setTData(prev => ({
            ...prev,
            sttt: { ...(prev.sttt || {}), [joint]: defaultMoves }
        }));
        setIsModalOpen(false);
    };

    const toggleStttValue = (joint: string, move: string, key: keyof StttMoveResult) => {
        setTData(prev => {
            const currentSttt = prev.sttt || {};
            const currentJoint = currentSttt[joint] || {};
            const currentMove = currentJoint[move] || {};
            
            return {
                ...prev,
                sttt: {
                    ...currentSttt,
                    [joint]: {
                        ...currentJoint,
                        [move]: {
                            ...currentMove,
                            [key]: !currentMove[key]
                        }
                    }
                }
            };
        });
    };

    const removeStttJoint = (joint: string) => {
        const newSttt = { ...(tData.sttt || {}) };
        delete newSttt[joint];
        setTData(prev => ({ ...prev, sttt: newSttt }));
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-red-500 rounded-full"></span>
                    選擇性組織張力測試(STTT)
                </h4>
                <button 
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-[11px] bg-red-50 text-red-700 px-2.5 py-1 rounded-lg font-bold border border-red-200 shadow-sm hover:bg-red-100 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                    新增部位
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
                        <div className="relative z-10 bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800">選擇 STTT 測試部位</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-1">✕</button>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                                {Object.keys(STTT_OPTIONS).map(joint => (
                                    <button 
                                        key={joint} 
                                        onClick={() => addStttJoint(joint)}
                                        className="px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all text-left"
                                    >
                                        {joint}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            <div className="p-3 space-y-4">
                {!tData.sttt || Object.keys(tData.sttt).length === 0 ? (
                    <div onClick={() => setIsModalOpen(true)} className="text-center py-4 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-300"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="font-bold">點擊新增部位 STTT 測試資料</span>
                    </div>
                ) : (
                    Object.entries(tData.sttt).map(([joint, moves]) => (
                        <div key={joint} className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                <h5 className="font-bold text-slate-800 text-xs">{joint}</h5>
                                <button onClick={() => removeStttJoint(joint)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(moves).map(([move, result]) => (
                                    <div key={move} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                                        <div className="text-[11px] font-bold text-slate-700 mb-2">{move}</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => toggleStttValue(joint, move, 'activePain')}
                                                className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all flex items-center gap-1
                                                ${result.activePain ? 'bg-blue-600 text-white border-blue-700 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                            >
                                                Active Pain
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleStttValue(joint, move, 'passivePain')}
                                                className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all flex items-center gap-1
                                                ${result.passivePain ? 'bg-green-600 text-white border-green-700 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                            >
                                                Passive Pain
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleStttValue(joint, move, 'resistedPain')}
                                                className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all flex items-center gap-1
                                                ${result.resistedPain ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                            >
                                                Resisted Pain
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleStttValue(joint, move, 'resistedWeak')}
                                                className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all flex items-center gap-1
                                                ${result.resistedWeak ? 'bg-orange-600 text-white border-orange-700 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                            >
                                                Weakness (W)
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
