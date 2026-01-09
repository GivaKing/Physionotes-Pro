
import React, { useState } from 'react';
import { TherapistData, MMT_OPTIONS, MmtJointData } from '../types';
import { MmtSlider, isCentralAxis } from './EvalShared';
import { Portal } from './Input';

export const MmtTesting = ({ tData, setTData }: { tData: TherapistData; setTData: React.Dispatch<React.SetStateAction<TherapistData>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const addJoint = (joint: string) => {
        const defaultMoves: MmtJointData = {};
        const moves = MMT_OPTIONS[joint];
        if (moves) moves.forEach(move => { defaultMoves[move] = { l: 5, r: 5 }; });
        setTData(prev => ({ ...prev, mmt: { ...(prev.mmt || {}), [joint]: defaultMoves } }));
        setIsModalOpen(false);
    };

    const updateMmt = (joint: string, movement: string, side: 'l' | 'r', val: number) => {
        setTData(prev => ({
            ...prev,
            mmt: {
                ...prev.mmt,
                [joint]: {
                    ...(prev.mmt[joint] || {}),
                    [movement]: { ...(prev.mmt[joint]?.[movement] || { l: 5, r: 5 }), [side]: val }
                }
            }
        }));
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>徒手肌力測試 (MMT)
                </h4>
                <button onClick={() => setIsModalOpen(true)} className="text-[11px] bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg font-bold border border-orange-200 shadow-sm hover:bg-orange-100 transition-colors">+ 新增關節</button>
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
                                <h3 className="font-bold text-slate-800">選擇 MMT 測試部位</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-1">✕</button>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                                {Object.keys(MMT_OPTIONS).map(joint => (
                                    <button 
                                        key={joint} 
                                        onClick={() => addJoint(joint)}
                                        className="px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all text-left"
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
                {!tData.mmt || Object.keys(tData.mmt).length === 0 ? (
                    <div onClick={() => setIsModalOpen(true)} className="text-center py-4 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-300"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="font-bold">點擊新增關節 MMT 測試資料</span>
                    </div>
                ) : (
                    Object.entries(tData.mmt).map(([joint, moves]) => (
                        <div key={joint} className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                <h5 className="font-bold text-slate-800 text-xs">{joint}</h5>
                                <button onClick={() => {
                                    const newMmt = { ...tData.mmt };
                                    delete newMmt[joint];
                                    setTData(prev => ({ ...prev, mmt: newMmt }));
                                }} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {Object.keys(moves).map(move => {
                                    const val = moves[move] || { l: 5, r: 5 };
                                    const isCentral = isCentralAxis(joint, move);
                                    return (
                                        <div key={move} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="text-[11px] font-bold text-slate-600">{move}</div>
                                                <button onClick={() => { updateMmt(joint, move, 'l', 5); updateMmt(joint, move, 'r', 5); }} className="text-slate-300 hover:text-orange-600 transition-colors p-1 rounded hover:bg-slate-100" title="Reset">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                                </button>
                                            </div>
                                            {isCentral ? (
                                                <div className="mt-0.5">
                                                    <MmtSlider value={val.l} onChange={(v) => { updateMmt(joint, move, 'l', v); updateMmt(joint, move, 'r', v); }} />
                                                </div>
                                            ) : (
                                                <div className="flex gap-2.5 mt-0.5">
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[9px] font-bold text-slate-400 mb-0.5 block">L</span>
                                                        <MmtSlider value={val.l} onChange={(v) => updateMmt(joint, move, 'l', v)} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[9px] font-bold text-slate-400 mb-0.5 block">R</span>
                                                        <MmtSlider value={val.r} onChange={(v) => updateMmt(joint, move, 'r', v)} />
                                                    </div>
                                                </div>
                                            )}
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
