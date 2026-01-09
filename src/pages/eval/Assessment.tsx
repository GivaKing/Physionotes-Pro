
import React from 'react';
import { Button, TextArea } from '../../components/Input';
import { ListIconSet, insertAtCursorHelper, toggleListFormatHelper } from '../../components/EvalShared';
import { TherapistData, VisitData } from '../../types';
import { RomTesting } from '../../components/RomTesting';
import { MmtTesting } from '../../components/MmtTesting';
import { StttTesting } from '../../components/StttTesting';
import { NeuralTensionTesting } from '../../components/NeuralTensionTesting';
import { SpecialTests } from '../../components/SpecialTests';
import { NeuroTesting } from '../../components/NeuroTesting';
import { JointMobilityTesting } from '../../components/JointMobilityTesting';
import { AiClinicalInsight } from '../../components/AiClinicalInsight';
import { AiGapAnalysis } from '../../components/AiGapAnalysis';
import { useApp } from '../../store';

interface AssessmentProps {
    tData: TherapistData;
    setTData: React.Dispatch<React.SetStateAction<TherapistData>>;
    goNext: () => void;
    scrollToTop: () => void;
}

export const AssessmentSection: React.FC<AssessmentProps> = ({ tData, setTData, goNext, scrollToTop }) => {
    const { activeCase, user } = useApp();
    
    // We need subjective data for the AI to cross-reference
    // In a real app, this would come from a context or props
    const currentVisit: VisitData = activeCase?.records[activeCase.records.length - 1]?.visit || { vasEntries: [] };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-8 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-4"><h3 className="text-lg font-bold text-slate-900">Assessment (評估與臨床推理)</h3></div>

            {/* --- Modular ROM Section --- */}
            <RomTesting tData={tData} setTData={setTData} />

            {/* --- Modular MMT Section --- */}
            <MmtTesting tData={tData} setTData={setTData} />

            {/* --- Modular STTT Section --- */}
            <StttTesting tData={tData} setTData={setTData} />

            {/* --- Modular Joint Mobility Section (New) --- */}
            <JointMobilityTesting tData={tData} setTData={setTData} />

            {/* --- Modular Neural Tension Section --- */}
            <NeuralTensionTesting tData={tData} setTData={setTData} />

            {/* --- Modular Neuro Examination Section --- */}
            <NeuroTesting tData={tData} setTData={setTData} />

            {/* --- Modular Special Tests Section --- */}
            <SpecialTests tData={tData} setTData={setTData} />

            {/* --- Soft Tissue / Palpation Card --- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-pink-500 rounded-full"></span>
                    <h4 className="font-bold text-slate-700">軟組織與觸診 (Soft Tissue / Palpation)</h4>
                </div>
                <div className="p-4">
                    <TextArea
                        value={tData.softTissue}
                        onChange={e => setTData({ ...tData, softTissue: e.target.value })}
                        className="h-32 bg-slate-50 focus:bg-white transition-colors"
                        placeholder="Muscle tone, tenderness, swelling, scar tissue..."
                    />
                </div>
            </div>

            {/* --- Clinical Reasoning Card --- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-violet-500 rounded-full"></span>
                        臨床推理 (Clinical Reasoning)
                    </h4>
                    <div className="flex items-center">
                        <ListIconSet
                            onNumberClick={() => toggleListFormatHelper('clinical-reasoning-input', 'number', tData.reasoning, (v) => setTData({ ...tData, reasoning: v }))}
                            onBulletClick={() => toggleListFormatHelper('clinical-reasoning-input', 'bullet', tData.reasoning, (v) => setTData({ ...tData, reasoning: v }))}
                        />
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    {/* Arrow Helpers */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 inline-flex shadow-sm">
                            {['→', '←', '⮂', '↑', '↓', '⮃'].map(arrow => (
                                <button 
                                    key={arrow} 
                                    onClick={() => insertAtCursorHelper('clinical-reasoning-input', arrow, tData.reasoning, (v) => setTData({ ...tData, reasoning: v }))} 
                                    className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all text-sm font-bold text-slate-700"
                                >
                                    {arrow}
                                </button>
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">Symbol Helper</span>
                    </div>
                    
                    <TextArea 
                        id="clinical-reasoning-input" 
                        value={tData.reasoning} 
                        onChange={e => setTData({ ...tData, reasoning: e.target.value })} 
                        className="h-64 text-base bg-slate-50 focus:bg-white transition-colors leading-relaxed" 
                        placeholder="請輸入詳細推論過程，可使用上方符號輔助..." 
                    />
                </div>
            </div>
            
            {/* --- AI Integrations (Admin Only) --- */}
            {activeCase && user?.role === 'admin' && (
                <>
                    {/* 1. Quick Gap Analysis (Lightweight) */}
                    <AiGapAnalysis 
                        client={activeCase.client}
                        visit={currentVisit}
                        tData={tData}
                    />

                    {/* 2. Deep Clinical Insight (Heavyweight) */}
                    <AiClinicalInsight 
                        client={activeCase.client} 
                        visit={currentVisit} 
                        tData={tData} 
                    />
                </>
            )}
            
            {/* Standardized Footer with Centered Back to Top */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 pt-8 mt-4 border-t border-slate-100">
                <div className="hidden md:block"></div>
                <div className="flex justify-center order-2 md:order-none">
                    <button onClick={scrollToTop} className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-50 px-4 py-2 rounded-full transition-colors">↑ 回到頂部</button>
                </div>
                <div className="flex justify-end order-1 md:order-none">
                    <Button onClick={() => goNext()} variant="secondary" className="!bg-slate-900 !text-white !border-slate-900 hover:!bg-slate-800 px-6 font-bold w-full md:w-auto shadow-md">Next: Plan {'>'}</Button>
                </div>
            </div>
        </div>
    );
};
