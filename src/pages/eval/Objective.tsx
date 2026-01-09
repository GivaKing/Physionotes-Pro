import React from 'react';
import { Button, Label, TextArea } from '../../components/Input';
import { TherapistData } from '../../types';
import { PostureScreening } from '../../components/PostureScreening';
import { GaitAnalysis } from '../../components/GaitAnalysis';

interface ObjectiveProps {
    tData: TherapistData;
    setTData: React.Dispatch<React.SetStateAction<TherapistData>>;
    goNext: () => void;
    scrollToTop: () => void;
}

export const ObjectiveSection: React.FC<ObjectiveProps> = ({ tData, setTData, goNext, scrollToTop }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-8 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-bold text-slate-900">Objective (客觀資料)</h3>
            </div>

            {/* --- Posture Section (Includes internal Notes) --- */}
            <PostureScreening tData={tData} setTData={setTData} />

            {/* --- Gait Section (Includes internal Notes) --- */}
            <GaitAnalysis tData={tData} setTData={setTData} />

            <div className="space-y-6">
                <div className="w-full">
                    <Label>動作分析 (Movement Analysis)</Label>
                    <TextArea 
                        value={tData.movementAnalysis} 
                        onChange={e => setTData({ ...tData, movementAnalysis: e.target.value })} 
                        className="h-40" 
                        placeholder="例：深蹲右側偏移，下蹲至 60 度時出現膝蓋內扣；單腳蹲穩定度差..." 
                    />
                </div>
            </div>

            {/* Standardized Footer with Centered Back to Top */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 pt-8 mt-4 border-t border-slate-100">
                <div className="hidden md:block"></div>
                <div className="flex justify-center order-2 md:order-none">
                    <button onClick={scrollToTop} className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-50 px-4 py-2 rounded-full transition-colors">↑ 回到頂部</button>
                </div>
                <div className="flex justify-end order-1 md:order-none">
                    <Button onClick={() => goNext()} variant="secondary" className="!bg-slate-900 !text-white !border-slate-900 hover:!bg-slate-800 px-6 font-bold w-full md:w-auto shadow-md">Next: Assessment {'>'}</Button>
                </div>
            </div>
        </div>
    );
};