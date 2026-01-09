
import React from 'react';
import { CAPSULAR_PATTERNS, ROM_OPTIONS } from '../types';

// --- Constants ---
export const KALTENBORN_GRADES = [
    { val: '0', label: '0: Ankylosed', desc: 'No Movement', color: 'bg-slate-800 text-white border-slate-800' },
    { val: '1', label: '1: Hypo--', desc: 'Considerable Hypo', color: 'bg-red-50 text-red-700 border-red-200' },
    { val: '2', label: '2: Hypo-', desc: 'Slight Hypo', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { val: '3', label: '3: Normal', desc: 'Normal', color: 'bg-green-50 text-green-700 border-green-300' },
    { val: '4', label: '4: Hyper+', desc: 'Slight Hyper', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { val: '5', label: '5: Hyper++', desc: 'Considerable Hyper', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { val: '6', label: '6: Unstable', desc: 'Unstable', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export const END_FEEL_TYPES = ['Soft', 'Firm', 'Hard', 'Empty', 'Spasm', 'Springy', 'Capsular'];

// --- Helper Functions ---
const getGradeDesc = (val: string) => KALTENBORN_GRADES.find(g => g.val === val)?.desc || '';

// --- 1. Capsular Pattern Analysis ---
interface CapsularProps {
    region: string;
    romData: any; // Full ROM object for the region
    compact?: boolean; // True = Card view icon, False = Full Modal Analysis
}

export const CapsularAnalysis: React.FC<CapsularProps> = ({ region, romData, compact = false }) => {
    const patternRule = CAPSULAR_PATTERNS[region];
    
    // If no rule exists for this region or no ROM data, return nothing (or placeholder in modal)
    if (!patternRule) return null;
    if (!romData && compact) return null; 

    const calculateLoss = (valStr?: string, maxNorm?: number) => {
        if (!valStr || !maxNorm) return 0;
        const matches = valStr.match(/-?[\d\.]+/g);
        let current = 0;
        if (matches && matches.length >= 2) {
            let v2 = parseFloat(matches[1]);
            if (v2 < 0 && !valStr.includes('--')) v2 = Math.abs(v2);
            current = v2;
        } else if (matches && matches.length === 1) {
            current = parseFloat(matches[0]);
        }
        if (current >= maxNorm) return 0;
        return (maxNorm - current) / maxNorm;
    };

    const losses: Record<string, number> = {};
    let hasData = false;

    // Calculate losses if ROM data exists
    if (romData) {
        Object.keys(ROM_OPTIONS[region] || {}).forEach(move => {
            const norm = ROM_OPTIONS[region][move][1];
            // Prefer PROM, fallback to AROM
            const valStr = romData[move]?.prom?.l || romData[move]?.arom?.l; // Using Left side as primary check for now, ideally check affected side
            if (valStr) hasData = true;
            losses[move] = calculateLoss(valStr, norm);
        });
    }

    const isMatch = hasData ? patternRule.check(losses) : false;

    // --- Compact View (Icon for Card) ---
    if (compact) {
        if (!isMatch) return null;
        return (
            <div className="absolute top-3 right-3 group cursor-help z-10">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="absolute right-0 top-7 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                    <div className="font-bold text-orange-300 mb-1 uppercase tracking-wider">Capsular Pattern</div>
                    <div>Possible restriction detected based on ROM data.</div>
                    <div className="mt-1 text-slate-400 font-mono">{patternRule.pattern}</div>
                </div>
            </div>
        );
    }

    // --- Detailed View (Inside Modal) ---
    if (!hasData) return (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-400 italic mb-4 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            填寫 ROM 數據以啟用關節囊受限分析
        </div>
    );

    return (
        <div className={`p-3 rounded-xl border mb-4 flex items-center justify-between shadow-sm transition-all
            ${isMatch ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMatch ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                    <div className={`text-xs font-bold ${isMatch ? 'text-orange-800' : 'text-green-800'}`}>
                        {isMatch ? '可能符合關節囊受限模式' : '未發現明顯關節囊受限'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Rule: {patternRule.pattern}
                    </div>
                </div>
            </div>
            {isMatch && (
                <div className="bg-white/80 px-2 py-1 rounded text-[10px] font-black text-orange-600 border border-orange-100 shadow-sm">
                    POSITIVE
                </div>
            )}
        </div>
    );
};

// --- 2. Joint Play Row Component ---
interface JointPlayRowProps {
    joint: string;
    data: { grade: string; painful?: boolean };
    onUpdate: (grade: string) => void;
    onTogglePain: () => void;
}

export const JointPlayRow: React.FC<JointPlayRowProps> = ({ joint, data, onUpdate, onTogglePain }) => {
    return (
        <div className="border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition-colors bg-white">
            <div className="flex justify-between items-center mb-2.5">
                <div className="text-xs font-bold text-slate-700 truncate mr-2">{joint}</div>
                {data.grade && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black shrink-0 ${
                        data.grade === '3' ? 'bg-green-100 text-green-700' : 
                        (data.grade === '0' || data.grade === '6') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                        {getGradeDesc(data.grade)}
                    </span>
                )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-y-2">
                <div className="flex flex-wrap gap-1">
                    {KALTENBORN_GRADES.map(g => {
                        const isSelected = data.grade === g.val;
                        return (
                            <button
                                key={g.val}
                                onClick={() => onUpdate(g.val)}
                                className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all border-2 flex items-center justify-center
                                ${isSelected 
                                    ? g.color // Active state (Background + Text color defined in const)
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600' // Inactive state
                                }`}
                                title={g.label}
                            >
                                {g.val}
                            </button>
                        );
                    })}
                </div>
                
                <div className="w-full sm:w-auto flex items-center sm:pl-2 sm:border-l sm:border-slate-100 mt-1 sm:mt-0">
                    <button
                        onClick={onTogglePain}
                        className={`h-8 w-full sm:w-auto px-3 rounded-lg text-[10px] font-bold border-2 transition-all flex items-center justify-center gap-1.5
                        ${data.painful 
                            ? 'bg-red-50 text-red-600 border-red-200' 
                            : 'bg-white text-slate-400 border-slate-100 hover:text-red-400 hover:border-red-100'}`}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        Pain
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 3. End Feel Row Component ---
interface EndFeelRowProps {
    motion: string;
    data: { type: string; isAbnormal: boolean; painful?: boolean };
    normalTypes: string[];
    onUpdate: (type: string, isNormal: boolean) => void;
    onTogglePain: () => void;
}

export const EndFeelRow: React.FC<EndFeelRowProps> = ({ motion, data, normalTypes, onUpdate, onTogglePain }) => {
    return (
        <div className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Motion Name */}
            <div className="w-full sm:w-24 shrink-0 flex justify-between sm:block">
                <span className="text-xs font-bold text-slate-700 block">{motion}</span>
                {data.isAbnormal && <span className="text-[9px] text-red-500 font-bold sm:hidden">Abnormal</span>}
                {data.isAbnormal && <span className="text-[9px] text-red-500 font-bold hidden sm:inline">Abn</span>}
            </div>
            
            {/* Options */}
            <div className="flex-1 flex flex-wrap gap-1.5">
                {END_FEEL_TYPES.map(type => {
                    const isNormalType = normalTypes.includes(type);
                    const isSelected = data.type === type;
                    
                    let btnClass = "bg-white text-slate-400 border border-slate-200 hover:border-slate-300";
                    
                    if (isSelected) {
                        if (isNormalType) btnClass = "bg-green-500 text-white border-green-600 shadow-sm font-black"; // Active Normal
                        else btnClass = "bg-red-500 text-white border-red-600 shadow-sm font-black"; // Active Abnormal
                    } else if (isNormalType) {
                        // Suggestion style for normal types
                        btnClass = "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 font-bold";
                    }

                    return (
                        <button
                            key={type}
                            onClick={() => onUpdate(type, isNormalType)}
                            className={`px-3 py-1.5 rounded-md text-[10px] transition-all border ${btnClass}`}
                        >
                            {type}
                        </button>
                    );
                })}
            </div>

            {/* Pain Toggle - Far Right */}
            <div className="flex items-center pl-0 sm:pl-2 sm:border-l sm:border-slate-100 ml-0 sm:ml-auto w-full sm:w-auto mt-1 sm:mt-0">
                <button
                    onClick={onTogglePain}
                    className={`h-7 w-full sm:w-auto px-3 rounded-md text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5
                    ${data.painful 
                        ? 'bg-red-50 text-red-600 border-red-200' 
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white hover:text-red-400 hover:border-red-200'}`}
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    Pain
                </button>
            </div>
        </div>
    );
};
