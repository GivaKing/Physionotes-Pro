
import React, { useState } from 'react';
import { TherapistData, ROM_OPTIONS, RomJointData } from '../types';
import { DualRangeSlider, isCentralAxis } from './EvalShared';
import { Portal } from './Input';

export const RomTesting = ({ tData, setTData }: { tData: TherapistData; setTData: React.Dispatch<React.SetStateAction<TherapistData>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const addJoint = (joint: string) => {
        const defaultMoves: RomJointData = {};
        const norms = ROM_OPTIONS[joint];
        if (norms) Object.entries(norms).forEach(([move, [min, max]]) => {
            const ns = `${min},${max}`;
            defaultMoves[move] = { arom: { l: ns, r: ns }, prom: { l: ns, r: ns } };
        });
        setTData(prev => ({ ...prev, rom: { ...(prev.rom || {}), [joint]: defaultMoves } }));
        setIsModalOpen(false);
    };

    const updateRom = (joint: string, movement: string, type: 'arom' | 'prom', side: 'l' | 'r', val: string) => {
        setTData(prev => {
            const currentJoint = prev.rom[joint] || {};
            const currentMove = currentJoint[movement] || { arom: { l: '', r: '' }, prom: { l: '', r: '' } };
            return {
                ...prev,
                rom: {
                    ...prev.rom,
                    [joint]: {
                        ...currentJoint,
                        [movement]: {
                            ...currentMove,
                            [type]: { ...currentMove[type], [side]: val }
                        }
                    }
                }
            };
        });
    };

    const resetMovement = (joint: string, movement: string, min: number, max: number) => {
        const ns = `${min},${max}`;
        setTData(prev => ({
            ...prev,
            rom: {
                ...prev.rom,
                [joint]: {
                    ...(prev.rom[joint] || {}),
                    [movement]: { arom: { l: ns, r: ns }, prom: { l: ns, r: ns } }
                }
            }
        }));
    };

    const getRomColor = (valStr: string, normMin: number, normMax: number, type: 'arom' | 'prom') => {
        if (!valStr) return type === 'arom' ? 'bg-blue-500' : 'bg-green-500';
        
        let currentMin = normMin;
        let currentMax = normMax;

        // Parse values carefully
        const matches = valStr.match(/-?[\d\.]+/g);
        if (matches && matches.length >= 2) {
            currentMin = parseFloat(matches[0]);
            let v2 = parseFloat(matches[1]);
            if (v2 < 0 && !valStr.includes('--')) v2 = Math.abs(v2);
            currentMax = v2;
        } else if (matches && matches.length === 1) {
            // Fallback for single value (usually treat as max, min assumed 0 or normMin)
            currentMax = parseFloat(matches[0]);
        }

        // Ensure min/max are sorted
        if (currentMin > currentMax) [currentMin, currentMax] = [currentMax, currentMin];

        // Determine deviation tolerance (e.g. 15% of total range)
        const totalRange = normMax - normMin;
        const tolerance = Math.max(5, totalRange * 0.15); 

        // Check deviations on BOTH ends
        // 1. Is the start angle significantly higher than normal? (e.g. extension deficit)
        const minDev = currentMin - normMin;
        
        // 2. Is the end angle significantly lower than normal? (e.g. flexion deficit)
        const maxDev = normMax - currentMax;

        const isMinBad = minDev > tolerance;
        const isMaxBad = maxDev > tolerance;

        if (isMinBad || isMaxBad) {
            // Logic for severity: if either deviation is very large (> 30%), red. Else orange.
            const severeTolerance = Math.max(10, totalRange * 0.3);
            if (minDev > severeTolerance || maxDev > severeTolerance) {
                return 'bg-red-500';
            }
            return 'bg-orange-500';
        }

        return type === 'arom' ? 'bg-blue-500' : 'bg-green-500';
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-primary-500 rounded-full"></span>關節活動度 (ROM)
                </h4>
                <button onClick={() => setIsModalOpen(true)} className="text-[11px] bg-primary-50 text-primary-700 px-2.5 py-1 rounded-lg font-bold border border-primary-200 shadow-sm hover:bg-primary-100 transition-colors">+ 新增關節</button>
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
                                <h3 className="font-bold text-slate-800">選擇 ROM 測試部位</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-1">✕</button>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                                {Object.keys(ROM_OPTIONS).map(joint => (
                                    <button 
                                        key={joint} 
                                        onClick={() => addJoint(joint)}
                                        className="px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all text-left"
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
                {!tData.rom || Object.keys(tData.rom).length === 0 ? (
                    <div onClick={() => setIsModalOpen(true)} className="text-center py-4 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary-300"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="font-bold">點擊新增關節 ROM 測試資料</span>
                    </div>
                ) : (
                    Object.entries(tData.rom).map(([joint, moves]) => (
                        <div key={joint} className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                <h5 className="font-bold text-slate-800 text-xs">{joint}</h5>
                                <button onClick={() => {
                                    const newRom = { ...tData.rom };
                                    delete newRom[joint];
                                    setTData(prev => ({ ...prev, rom: newRom }));
                                }} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                                {Object.keys(ROM_OPTIONS[joint] || {}).map(move => {
                                    const jointData = moves[move] || { arom: { l: '', r: '' }, prom: { l: '', r: '' } };
                                    const [normMin, normMax] = ROM_OPTIONS[joint]?.[move] || [0, 100];
                                    const isCentral = isCentralAxis(joint, move);
                                    return (
                                        <div key={move} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-[11px] font-bold text-slate-700">{move}</div>
                                                <button onClick={() => resetMovement(joint, move, normMin, normMax)} className="text-slate-300 hover:text-primary-600 transition-colors p-1 rounded hover:bg-slate-100" title="Reset">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                                </button>
                                            </div>
                                            {isCentral ? (
                                                <div className="space-y-2.5">
                                                    <div>
                                                        <span className="text-[8px] font-black text-blue-600 uppercase tracking-wider block text-center mb-0.5">AROM</span>
                                                        <DualRangeSlider min={normMin} max={normMax} valueStr={jointData.arom?.l} onChange={(v) => { updateRom(joint, move, 'arom', 'l', v); updateRom(joint, move, 'arom', 'r', v); }} trackColor={getRomColor(jointData.arom?.l, normMin, normMax, 'arom')} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[8px] font-black text-green-600 uppercase tracking-wider block text-center mb-0.5">PROM</span>
                                                        <DualRangeSlider min={normMin} max={normMax} valueStr={jointData.prom?.l} onChange={(v) => { updateRom(joint, move, 'prom', 'l', v); updateRom(joint, move, 'prom', 'r', v); }} trackColor={getRomColor(jointData.prom?.l, normMin, normMax, 'prom')} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2.5">
                                                    <div>
                                                        <div className="flex justify-between items-end mb-0.5"><span className="text-[8px] font-black text-blue-600 uppercase tracking-wider">AROM</span><span className="text-[8px] text-slate-400">L / R</span></div>
                                                        <div className="flex gap-1.5">
                                                            <div className="flex-1 min-w-0"><DualRangeSlider min={normMin} max={normMax} valueStr={jointData.arom?.l} onChange={(v) => updateRom(joint, move, 'arom', 'l', v)} trackColor={getRomColor(jointData.arom?.l, normMin, normMax, 'arom')} /></div>
                                                            <div className="flex-1 min-w-0"><DualRangeSlider min={normMin} max={normMax} valueStr={jointData.arom?.r} onChange={(v) => updateRom(joint, move, 'arom', 'r', v)} trackColor={getRomColor(jointData.arom?.r, normMin, normMax, 'arom')} /></div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-2 border-t border-dashed border-slate-100">
                                                        <div className="flex justify-between items-end mb-0.5"><span className="text-[8px] font-black text-green-600 uppercase tracking-wider">PROM</span><span className="text-[8px] text-slate-400">L / R</span></div>
                                                        <div className="flex gap-1.5">
                                                            <div className="flex-1 min-w-0"><DualRangeSlider min={normMin} max={normMax} valueStr={jointData.prom?.l} onChange={(v) => updateRom(joint, move, 'prom', 'l', v)} trackColor={getRomColor(jointData.prom?.l, normMin, normMax, 'prom')} /></div>
                                                            <div className="flex-1 min-w-0"><DualRangeSlider min={normMin} max={normMax} valueStr={jointData.prom?.r} onChange={(v) => updateRom(joint, move, 'prom', 'r', v)} trackColor={getRomColor(jointData.prom?.r, normMin, normMax, 'prom')} /></div>
                                                        </div>
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
