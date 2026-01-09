

import React, { useState } from 'react';
import { TherapistData, GaitDetails, PHASES } from '../types';
import { TextArea, Label } from './Input';

// --- Data Constants ---
const PHASE_DEVIATIONS: Record<string, string[]> = {
    'Trunk/Pelvis': [
        'Backward Lean', 'Forward Lean', 'Lateral Lean', 'Pelvic Drop', 'Pelvic Hike', 'Excessive Rotation'
    ],
    'Hip': [
        'Inadequate Extension', 'Excessive Flexion', 'Adduction/Scissoring', 'Abduction', 'Internal Rotation', 'External Rotation'
    ],
    'Knee': [
        'Limited Flexion', 'Excessive Flexion', 'Hyperextension', 'Wobble', 'Varus Thrust', 'Valgus Thrust'
    ],
    'Ankle/Foot': [
        'Foot Slap', 'Toes Drag', 'Low Heel Strike', 'Forefoot Contact', 'Excessive Plantarflexion', 'Excessive Dorsiflexion', 'Heel Off Early', 'No Heel Off', 'Vaulting'
    ]
};

// --- 3.0 Biomechanically Accurate SVG ---
const ClinicalGaitSvg = ({ phaseId, isSelected }: { phaseId: string, isSelected: boolean }) => {
    // Style Config
    const cTarget = isSelected ? "#ea580c" : "#64748b"; // Orange-600 (Active) vs Slate-500
    const cContra = "#cbd5e1"; // Slate-300 (Ghost leg)
    const cBody = isSelected ? "#334155" : "#94a3b8";
    
    // Stroke Widths
    const wTarget = 3;
    const wContra = 2.5;

    // ViewBox: 0 0 80 80 (Square aspect ratio for stability)
    // Ground Y = 70
    // Hip Center = (40, 25)
    const hx = 40, hy = 25; 
    
    // Helper: Draw Limb P1(Hip)->P2(Knee)->P3(Ankle)->P4(Toe)
    const drawLimb = (
        kx: number, ky: number, 
        ax: number, ay: number, 
        tx: number, ty: number, 
        color: string, width: number
    ) => (
        <g>
            <polyline points={`${hx},${hy} ${kx},${ky} ${ax},${ay} ${tx},${ty}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={kx} cy={ky} r={width * 0.5} fill={color} />
            <circle cx={ax} cy={ay} r={width * 0.5} fill={color} />
        </g>
    );

    // Coordinate Definitions (Based on standardized gait cycle photography)
    // Y-axis increases downwards. Ground is at Y=70.
    const figures: Record<string, React.ReactNode> = {
        'IC': ( // R: Heel Strike (Extended), L: Toe Off prep
            <g>
                {/* L (Back) */}
                {drawLimb(30, 45, 20, 65, 12, 70, cContra, wContra)}
                {/* Torso */}
                <line x1={hx} y1={hy} x2={hx+2} y2={10} stroke={cBody} strokeWidth={wTarget} strokeLinecap="round"/>
                <circle cx={hx+2} cy={8} r="3.5" fill={cBody} />
                {/* R (Front) - Heel Strike */}
                {drawLimb(52, 45, 60, 65, 62, 60, cTarget, wTarget)} 
            </g>
        ),
        'LR': ( // R: Foot Flat (Knee Flex), L: Swing Start
            <g>
                {/* L (Back/Lift) */}
                {drawLimb(32, 48, 22, 62, 16, 68, cContra, wContra)}
                {/* Torso */}
                <line x1={hx} y1={hy} x2={hx+3} y2={10} stroke={cBody} strokeWidth={wTarget} strokeLinecap="round"/>
                <circle cx={hx+3} cy={8} r="3.5" fill={cBody} />
                {/* R (Stance) - Knee Flex 15deg */}
                {drawLimb(48, 48, 52, 68, 58, 70, cTarget, wTarget)} 
            </g>
        ),
        'MSt': ( // R: Vertical Stance, L: Mid-Swing (Passing)
            <g>
                {/* L (Passing) - Flipped horizontally: Knee forward (48), Ankle back (38), Toe back (35) */}
                {drawLimb(48, 50, 38, 62, 35, 65, cContra, wContra)}
                {/* Torso - Vertical */}
                <line x1={hx} y1={hy} x2={hx} y2={10} stroke={cBody} strokeWidth={wTarget} strokeLinecap="round"/>
                <circle cx={hx} cy={8} r="3.5" fill={cBody} />
                {/* R (Vertical Stance) - Straight Leg bearing weight */}
                {/* Hip(40,25) -> Knee(40, 48) -> Ankle(40, 68) -> Toe(46, 70) */}
                {drawLimb(40, 48, 40, 68, 46, 70, cTarget, wTarget)} 
            </g>
        ),
        'TSt': ( // R: Heel Off (Extending), L: Terminal Swing (Heel Strike Prep)
            <g>
                {/* L (Front) - Reaching */}
                {drawLimb(55, 45, 65, 65, 65, 60, cContra, wContra)}
                {/* Torso */}
                <line x1={hx} y1={hy} x2={hx+4} y2={10} stroke={cBody} strokeWidth={wTarget} strokeLinecap="round"/>
                <circle cx={hx+4} cy={8} r="3.5" fill={cBody} />
                {/* R (Back) - Heel Off */}
                {drawLimb(30, 48, 20, 66, 12, 70, cTarget, wTarget)} 
            </g>
        ),
        'PSw': ( // R: Toe Only (Knee Flex), L: Flat Foot (Weight Bearing)
            <g>
                {/* L (Stance) */}
                {drawLimb(48, 48, 52, 68, 58, 70, cContra, wContra)}
                {/* Torso */}
                <line x1={hx} y1={hy} x2={hx} y2={10} stroke={cBody} strokeWidth={wTarget} strokeLinecap="round"/>
                <circle cx={hx} cy={8} r="3.5" fill={cBody} />
                {/* R (Push Off) - Knee Flex 40deg */}
                {drawLimb(30, 45, 20, 60, 12, 70, cTarget, wTarget)} 
            </g>
        ),
        'ISw': ( // R: Lift Off (Knee Flex 60), L: Mid Stance
            <g>
                {/* L (Vertical) */}
                {drawLimb(40, 48, 40, 68, 46, 70, cContra, wContra)}
                {/* Torso */}
                <line x1={hx} y1={hy} x2={hx} y2={10} stroke={cBody} strokeWidth={wTarget} strokeLinecap="round"/>
                <circle cx={hx} cy={8} r="3.5" fill={cBody} />
                {/* R (Swing Start) - Trailing */}
                {drawLimb(32, 45, 25, 58, 20, 65, cTarget, wTarget)} 
            </g>
        ),
        'MSw': ( // R: Passing (Knee Flex 60, Tibia Vertical), L: Heel Off
            <g>
                {/* L (Back) */}
                {drawLimb(30, 48, 20, 66, 12, 70, cContra, wContra)}
                {/* Torso */}
                <line x1={hx} y1={hy} x2={hx} y2={10} stroke={cBody} strokeWidth={wTarget} strokeLinecap="round"/>
                <circle cx={hx} cy={8} r="3.5" fill={cBody} />
                {/* R (Passing) - High flexion */}
                {drawLimb(50, 40, 52, 55, 56, 60, cTarget, wTarget)} 
            </g>
        ),
        'TSw': ( // R: Reaching (Knee Extending), L: Push Off
            <g>
                {/* L (Back) */}
                {drawLimb(30, 45, 20, 60, 12, 70, cContra, wContra)}
                {/* Torso */}
                <line x1={hx} y1={hy} x2={hx} y2={10} stroke={cBody} strokeWidth={wTarget} strokeLinecap="round"/>
                <circle cx={hx} cy={8} r="3.5" fill={cBody} />
                {/* R (Extension) */}
                {drawLimb(55, 42, 65, 62, 68, 58, cTarget, wTarget)} 
            </g>
        ),
    };

    return (
        <svg viewBox="0 0 80 80" className="w-full h-full overflow-visible drop-shadow-sm">
            {/* Ground Line - Simple and clean */}
            <line x1="-10" y1="70" x2="90" y2="70" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
            {figures[phaseId]}
        </svg>
    );
};

// --- Visual Component: Clean Gait Strip ---
const GaitCycleVisual = ({ selectedPhase, onSelect }: { selectedPhase: string; onSelect: (id: string) => void }) => {
    return (
        <div className="w-full overflow-x-auto no-scrollbar pb-2">
            {/* Height optimized to h-48 (approx 192px) - Not too tall, not squashed */}
            <div className="min-w-[800px] h-48 relative bg-white border border-slate-200 rounded-xl overflow-hidden select-none shadow-sm mt-2">
                
                {/* Top Phase Header Bar - Clear Separation */}
                <div className="absolute top-0 left-0 right-0 h-8 flex border-b border-slate-100 z-10">
                    <div className="w-[60%] h-full bg-orange-50 flex items-center px-4 border-r border-orange-100">
                        <span className="text-[10px] font-black text-orange-600 tracking-widest uppercase">Stance Phase (60%)</span>
                    </div>
                    <div className="w-[40%] h-full bg-blue-50 flex items-center justify-end px-4">
                        <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase">Swing Phase (40%)</span>
                    </div>
                </div>

                {/* Phase Items Grid */}
                <div className="flex h-full pt-8">
                    {PHASES.map((phase) => {
                        const isSelected = selectedPhase === phase.id;
                        const isStance = phase.type === 'Stance';
                        const themeColor = isStance ? 'text-orange-600' : 'text-blue-600';
                        
                        return (
                            <button 
                                key={phase.id}
                                onClick={() => onSelect(phase.id)}
                                className={`flex-1 flex flex-col items-center justify-between pb-3 relative group transition-all duration-300 border-r border-slate-50 last:border-0
                                    ${isSelected ? 'bg-white z-20' : 'hover:bg-slate-50'}
                                `}
                            >
                                {/* Active Indicator Top */}
                                {isSelected && (
                                    <div className={`absolute top-0 inset-x-0 h-1 ${isStance ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                )}

                                {/* Main Figure Area - Increased Padding to prevent text overlap */}
                                <div className={`flex-1 w-full flex items-center justify-center p-4 transition-transform duration-300 ${isSelected ? 'scale-110 opacity-100' : 'scale-90 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-90'}`}>
                                    <div className="w-24 h-24">
                                        <ClinicalGaitSvg phaseId={phase.id} isSelected={isSelected} />
                                    </div>
                                </div>

                                {/* Label Area - Separated from SVG */}
                                <div className="text-center w-full px-1">
                                    <div className={`text-[10px] font-black uppercase tracking-tight leading-none mb-1 transition-colors ${isSelected ? themeColor : 'text-slate-400'}`}>
                                        {phase.name}
                                    </div>
                                    <div className={`text-[9px] font-mono transition-colors ${isSelected ? 'text-slate-500 font-bold' : 'text-slate-300'}`}>
                                        {phase.pct}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export const GaitAnalysis = ({ tData, setTData }: { tData: TherapistData; setTData: React.Dispatch<React.SetStateAction<TherapistData>> }) => {
    const [isGaitOpen, setIsGaitOpen] = useState(false);
    const [selectedPhaseId, setSelectedPhaseId] = useState<string>('IC');

    const gaitDetails: GaitDetails = tData.gaitDetails || {};

    const updatePhaseData = (phaseId: string, type: 'timing' | 'deviation', value: string, jointName?: string) => {
        const currentPhase = gaitDetails[phaseId] || { timing: 'Normal', deviations: [] };
        let newPhaseData = { ...currentPhase };

        if (type === 'timing') {
            newPhaseData.timing = value as any;
        } else if (type === 'deviation' && jointName) {
            const uniqueDev = `${jointName}:${value}`;
            if (newPhaseData.deviations.includes(uniqueDev)) {
                newPhaseData.deviations = newPhaseData.deviations.filter(d => d !== uniqueDev);
            } else {
                newPhaseData.deviations = [...newPhaseData.deviations, uniqueDev];
            }
        }

        const newData = { ...gaitDetails, [phaseId]: newPhaseData };
        setTData({ ...tData, gaitDetails: newData });
    };

    const currentPhaseData = gaitDetails[selectedPhaseId] || { timing: 'Normal', deviations: [] };
    const selectedPhaseInfo = PHASES.find(p => p.id === selectedPhaseId);
    const isStance = selectedPhaseInfo?.type === 'Stance';
    
    // Theme Colors
    const accentColor = isStance ? 'text-orange-600' : 'text-blue-600';
    const accentBg = isStance ? 'bg-orange-50' : 'bg-blue-50';
    const accentBorder = isStance ? 'border-orange-200' : 'border-blue-200';
    const accentDot = isStance ? 'bg-orange-300' : 'bg-blue-300';

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
             <div 
                className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setIsGaitOpen(!isGaitOpen)}
            >
                 <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>步態評估 (Gait Analysis)
                </h4>
                <div className="text-slate-400 px-2">
                    <span className={`transition-transform inline-block duration-200 ${isGaitOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>
            </div>

            {isGaitOpen && (
                <div className="p-4 space-y-6 animate-fade-in">
                    <div className="space-y-2">
                        <Label>步態週期分期 (Gait Cycle Phases)</Label>
                        <GaitCycleVisual selectedPhase={selectedPhaseId} onSelect={setSelectedPhaseId} />
                    </div>

                    <div className={`p-6 rounded-2xl border ${accentBorder} ${accentBg} transition-colors duration-300 relative overflow-hidden`}>
                        {/* Decorative background element */}
                        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white opacity-40 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="relative z-10 mb-6 border-b border-black/5 pb-4">
                            <h3 className={`text-3xl font-black tracking-tighter mb-3 ${accentColor}`}>
                                {selectedPhaseInfo?.label}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Phase Badge */}
                                <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest shadow-sm border border-white/50 backdrop-blur-sm 
                                    ${isStance ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                                    {selectedPhaseInfo?.type} PHASE
                                </span>
                                
                                {/* Time/Percentage Badge */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white/60 shadow-sm backdrop-blur-md ${accentBorder}`}>
                                    <svg className={`w-3.5 h-3.5 ${isStance ? 'text-orange-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"></path>
                                    </svg>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-black text-slate-700 font-mono tracking-tight">
                                            {selectedPhaseInfo?.pct}
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                                            of Cycle
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timing Selector */}
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm mb-4 relative z-10">
                            <Label>此分期時間長度 (Timing)</Label>
                            <div className="grid grid-cols-4 gap-2 mt-2">
                                {['Normal', 'Prolonged', 'Shortened', 'Absent'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => updatePhaseData(selectedPhaseId, 'timing', opt)}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all border
                                            ${currentPhaseData.timing === opt 
                                                ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        {opt === 'Normal' ? '正常' : 
                                         opt === 'Prolonged' ? '過長' : 
                                         opt === 'Shortened' ? '過短' : '缺失'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Joint Deviations Accordion Style */}
                        <div className="space-y-3 relative z-10">
                            <Label>此分期觀察到的異常 (Observed Deviations)</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(PHASE_DEVIATIONS).map(([joint, deviations]) => (
                                    <div key={joint} className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm hover:border-slate-300 transition-colors">
                                        <div className="font-bold text-slate-700 text-xs mb-2 pb-1 border-b border-slate-100 flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${accentDot}`}></span>
                                            {joint}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {deviations.map(dev => {
                                                const uniqueKey = `${joint}:${dev}`;
                                                const isActive = currentPhaseData.deviations.includes(uniqueKey);
                                                
                                                return (
                                                    <button
                                                        key={dev}
                                                        onClick={() => updatePhaseData(selectedPhaseId, 'deviation', dev, joint)}
                                                        className={`px-2 py-1.5 rounded-lg text-[10px] text-left leading-tight border transition-all duration-200
                                                            ${isActive 
                                                                ? 'bg-slate-800 text-white border-slate-800 font-bold shadow-md transform scale-[1.02]' 
                                                                : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100 hover:border-slate-200'}`}
                                                    >
                                                        {dev}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <Label>步態備註 (Gait Notes)</Label>
                        <TextArea 
                            value={tData.obsGait} 
                            onChange={e => setTData({ ...tData, obsGait: e.target.value })} 
                            className="h-24 bg-white" 
                            placeholder="例：行走時患側支撐時間縮短，伴隨骨盆右後旋..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
