
import React, { useState } from 'react';
import { TherapistData, JointMobilityData, JOINT_PLAY_DB, END_FEEL_DB, SPINE_CONFIG, JointMobilityRegionData } from '../types';
import { Portal, TextArea, Label } from './Input';
import { CapsularAnalysis, JointPlayRow, EndFeelRow, KALTENBORN_GRADES, END_FEEL_TYPES } from './JointMobilityComponents';

// --- Specialized Component for a Single Spinal Segment (e.g. L4-L5) ---
const SpineSegmentRow = ({ 
    segmentName, 
    paivmTests, 
    ppivmTests, 
    combinedPatterns,
    jointPlayData, 
    endFeelData, 
    onUpdateJointPlay, 
    onUpdateEndFeel 
}: { 
    segmentName: string, 
    paivmTests: string[], 
    ppivmTests: string[], 
    combinedPatterns: string[],
    jointPlayData: Record<string, any>, 
    endFeelData: Record<string, any>, 
    onUpdateJointPlay: (key: string, grade: string, pain?: boolean) => void, 
    onUpdateEndFeel: (key: string, type: string, pain?: boolean) => void 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate active findings count for badge
    const activeFindings = [
        ...paivmTests.filter(t => {
            const d = jointPlayData[`${segmentName} ${t}`];
            return d && (d.grade !== '' || d.painful);
        }),
        ...ppivmTests.filter(t => {
            const grade = jointPlayData[`${segmentName} ${t} PPIVM`];
            const ef = endFeelData[`${segmentName} ${t}`];
            return (grade && (grade.grade !== '' || grade.painful)) || (ef && (ef.isAbnormal || ef.painful));
        }),
        ...combinedPatterns.filter(t => {
            const grade = jointPlayData[`${segmentName} ${t} PPIVM`];
            const ef = endFeelData[`${segmentName} ${t}`];
            return (grade && (grade.grade !== '' || grade.painful)) || (ef && (ef.isAbnormal || ef.painful));
        })
    ].length;

    // Helper for Pattern Hints (Verified against Magee / Maitland)
    const getPatternHint = (patternName: string) => {
        // Cervical Patterns
        if (patternName.includes('Closing Pattern')) {
            // Closing (Intervertebral Foramen/Facet) = Ext + Ipsilateral SB + Ipsilateral Rot
            return patternName.includes('(L)') ? 'Ext + SB(L) + Rot(L)' : 'Ext + SB(R) + Rot(R)';
        }
        if (patternName.includes('Opening Pattern')) {
            // Opening (Intervertebral Foramen/Facet) = Flex + Contralateral SB + Contralateral Rot
            // To Open the Left side, we move to the Right
            return patternName.includes('(L)') ? 'Flex + SB(R) + Rot(R)' : 'Flex + SB(L) + Rot(L)';
        }
        
        // Thoracic / Lumbar Quadrants (Kemp's Test Mechanics)
        if (patternName.includes('Quadrant Ext')) {
            // Extension Quadrant (Maximal Facet Loading) = Ext + Ipsilateral SB + Ipsilateral Rot
            return patternName.includes('(L)') ? 'Ext + SB(L) + Rot(L)' : 'Ext + SB(R) + Rot(R)';
        }
        if (patternName.includes('Quadrant Flex')) {
            // Flexion Quadrant (Disc/Capsule Loading) = Flex + Ipsilateral SB + Ipsilateral Rot
            // Note: This movement effectively OPENS the contralateral side.
            return patternName.includes('(L)') ? 'Flex + SB(L) + Rot(L)' : 'Flex + SB(R) + Rot(R)';
        }
        return '';
    };

    // Filter out Coupled Motions for C1 (Atlas) as it lacks typical disc/facet coupling
    const showCoupledMotions = !segmentName.startsWith('C1') && combinedPatterns && combinedPatterns.length > 0;

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all hover:border-slate-300">
            {/* Header / Summary */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between p-3 text-left ${isExpanded ? 'bg-slate-50 border-b border-slate-100' : 'bg-white'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${activeFindings > 0 ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'}`}>
                        {segmentName.split('-')[0]}
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{segmentName}</span>
                </div>
                <div className="flex items-center gap-2">
                    {activeFindings > 0 && <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{activeFindings} Findings</span>}
                    <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </div>
            </button>

            {/* Detailed Assessment Grid */}
            {isExpanded && (
                <div className="p-4 space-y-6 bg-slate-50/30">
                    
                    {/* 1. PAIVM (Joint Play / Glides) */}
                    <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">PAIVM (Joint Play / Glides)</h5>
                        <div className="grid grid-cols-1 gap-2">
                            {paivmTests.map(test => {
                                const key = `${segmentName} ${test}`;
                                const data = jointPlayData[key] || { grade: '', painful: false };
                                return (
                                    <div key={test} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100">
                                        <span className="text-xs font-bold text-slate-600 w-32 truncate" title={test}>{test}</span>
                                        <div className="flex items-center gap-2">
                                            {/* Grade Selector (0-6) */}
                                            <div className="flex gap-0.5">
                                                {['0','1','2','3','4','5','6'].map(g => (
                                                    <button 
                                                        key={g}
                                                        onClick={() => onUpdateJointPlay(key, g === data.grade ? '' : g, data.painful)}
                                                        className={`w-6 h-6 text-[9px] font-bold rounded border transition-colors 
                                                            ${data.grade === g 
                                                                ? (g === '3' ? 'bg-green-500 text-white border-green-600' : 'bg-slate-700 text-white border-slate-800') 
                                                                : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Pain Toggle */}
                                            <button 
                                                onClick={() => onUpdateJointPlay(key, data.grade, !data.painful)}
                                                className={`px-2 py-1 rounded text-[9px] font-bold border transition-colors ${data.painful ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-slate-300 border-slate-100 hover:text-red-400'}`}
                                            >
                                                Pain
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. PPIVM (Physiological Movement) - Merged Grade + EndFeel */}
                    <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">PPIVM (Physiological Movement)</h5>
                        <div className="space-y-2">
                            {ppivmTests.map(motion => {
                                const playKey = `${segmentName} ${motion} PPIVM`; // Stored in JointPlay
                                const endFeelKey = `${segmentName} ${motion}`; // Stored in EndFeel
                                
                                const playData = jointPlayData[playKey] || { grade: '', painful: false };
                                const efData = endFeelData[endFeelKey] || { type: '', isAbnormal: false, painful: false };

                                const updatePPIVMGrade = (g: string) => {
                                    onUpdateJointPlay(playKey, g === playData.grade ? '' : g, playData.painful);
                                };

                                const updateEndFeelType = (t: string) => {
                                    const isAbn = t !== 'Firm'; // Simple logic: assume Firm is normal for spine usually, or user selects
                                    onUpdateEndFeel(endFeelKey, t === efData.type ? '' : t, efData.painful); 
                                };

                                return (
                                    <div key={motion} className="bg-white p-3 rounded-lg border border-slate-100 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-700">{motion}</span>
                                            {/* Pain Toggle (Shared for the motion) */}
                                            <button 
                                                onClick={() => {
                                                    const newPain = !playData.painful;
                                                    onUpdateJointPlay(playKey, playData.grade, newPain);
                                                    onUpdateEndFeel(endFeelKey, efData.type, newPain);
                                                }}
                                                className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${playData.painful ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-slate-300 border-slate-100 hover:text-red-400'}`}
                                            >
                                                Pain
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Mobility Grade (Hypo/Normal/Hyper) */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-slate-400 font-bold w-10">Mobility</span>
                                                <div className="flex flex-1 gap-1">
                                                    {['Hypo', 'Normal', 'Hyper'].map(g => (
                                                        <button 
                                                            key={g}
                                                            onClick={() => updatePPIVMGrade(g)}
                                                            className={`flex-1 py-1 rounded text-[9px] font-bold border transition-colors 
                                                                ${playData.grade === g 
                                                                    ? (g==='Normal' ? 'bg-green-500 text-white border-green-600' : 'bg-orange-500 text-white border-orange-600') 
                                                                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* End Feel Selection */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-slate-400 font-bold w-10">End-Feel</span>
                                                <select 
                                                    value={efData.type || ''} 
                                                    onChange={(e) => updateEndFeelType(e.target.value)}
                                                    className={`flex-1 text-[10px] font-bold border rounded px-1 py-1 h-7 outline-none ${efData.type && efData.type !== 'Firm' ? 'text-red-600 border-red-200 bg-red-50' : 'text-slate-600 border-slate-200 bg-white'}`}
                                                >
                                                    <option value="">- Select -</option>
                                                    {END_FEEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Coupled Motions (Renamed from Combined/Quadrants) */}
                    {showCoupledMotions && (
                        <div>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Coupled Motions (Patterns)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {combinedPatterns.map(pattern => {
                                    const playKey = `${segmentName} ${pattern} PPIVM`;
                                    const endFeelKey = `${segmentName} ${pattern}`;
                                    
                                    const playData = jointPlayData[playKey] || { grade: '', painful: false };
                                    const efData = endFeelData[endFeelKey] || { type: '', isAbnormal: false, painful: false };

                                    const updateCombinedGrade = (g: string) => {
                                        onUpdateJointPlay(playKey, g === playData.grade ? '' : g, playData.painful);
                                    };

                                    const updateCombinedEndFeel = (t: string) => {
                                        onUpdateEndFeel(endFeelKey, t === efData.type ? '' : t, efData.painful);
                                    };

                                    return (
                                        <div key={pattern} className="bg-white p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[11px] font-bold text-slate-700">{pattern}</span>
                                                <button 
                                                    onClick={() => {
                                                        const newPain = !playData.painful;
                                                        onUpdateJointPlay(playKey, playData.grade, newPain);
                                                        onUpdateEndFeel(endFeelKey, efData.type, newPain);
                                                    }}
                                                    className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${playData.painful ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-slate-300 border-slate-100 hover:text-red-400'}`}
                                                >
                                                    Pain
                                                </button>
                                            </div>
                                            {/* Biomechanics Hint */}
                                            <div className="text-[9px] text-slate-400 font-mono mb-2 pl-0.5">{getPatternHint(pattern)}</div>
                                            
                                            <div className="space-y-2">
                                                {/* Simplified Mobility */}
                                                <div className="flex gap-1">
                                                    {['Hypo', 'Normal', 'Hyper'].map(g => (
                                                        <button 
                                                            key={g}
                                                            onClick={() => updateCombinedGrade(g)}
                                                            className={`flex-1 py-1 rounded text-[8px] font-bold border transition-colors 
                                                                ${playData.grade === g 
                                                                    ? (g==='Normal' ? 'bg-green-500 text-white border-green-600' : 'bg-orange-500 text-white border-orange-600') 
                                                                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                                {/* Simplified End Feel */}
                                                <select 
                                                    value={efData.type || ''} 
                                                    onChange={(e) => updateCombinedEndFeel(e.target.value)}
                                                    className={`w-full text-[10px] font-bold border rounded px-1 py-1 h-7 outline-none text-center ${efData.type && efData.type !== 'Firm' ? 'text-red-600 border-red-200 bg-red-50' : 'text-slate-500 border-slate-100 bg-slate-50'}`}
                                                >
                                                    <option value="">- End Feel -</option>
                                                    {END_FEEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export const JointMobilityTesting = ({ tData, setTData }: { tData: TherapistData; setTData: React.Dispatch<React.SetStateAction<TherapistData>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRegion, setActiveRegion] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'play' | 'endfeel'>('play');

    // Safe access to data
    const mobilityData: JointMobilityData = typeof tData.jointMobility === 'object' && tData.jointMobility !== null 
        ? tData.jointMobility 
        : {};

    const REGION_GROUPS = [
        { label: 'Spine & Trunk', regions: ['Cervical (頸椎)', 'Thoracic (胸椎)', 'Lumbar (腰椎)', 'SIJ (薦髂關節)'] },
        { label: 'Upper Extremity', regions: ['Shoulder (肩膀)', 'Elbow (手肘)', 'Wrist/Hand (手腕/手)'] },
        { label: 'Lower Extremity', regions: ['Hip (髖關節)', 'Knee (膝蓋)', 'Ankle/Foot (足踝)'] }
    ];

    const addRegion = (region: string) => {
        if (!mobilityData[region]) {
            // Initialize with default end-feels (first normal value)
            const defaultEndFeels: Record<string, any> = {};
            const norms = END_FEEL_DB[region] || [];
            norms.forEach(n => {
                defaultEndFeels[n.motion] = { type: n.normal[0], isAbnormal: false, painful: false };
            });

            const newData = { 
                ...mobilityData, 
                [region]: { jointPlay: {}, endFeel: defaultEndFeels, notes: '' } 
            };
            setTData({ ...tData, jointMobility: newData });
        }
        setActiveRegion(region);
    };

    const removeRegion = (region: string) => {
        const newData = { ...mobilityData };
        delete newData[region];
        setTData({ ...tData, jointMobility: newData });
        if (activeRegion === region) setActiveRegion(null);
    };

    const handleRegionClick = (region: string) => {
        if (!mobilityData[region]) {
            addRegion(region);
        } else {
            setActiveRegion(region);
        }
    };

    const openModal = (region?: string) => {
        if (region) setActiveRegion(region);
        setIsModalOpen(true);
    };

    // Helper to determine if a region has valid data to display
    const hasData = (data: JointMobilityRegionData) => {
        const hasPlay = Object.values(data.jointPlay).some(i => i.grade !== '' || i.painful);
        const hasEndFeel = Object.values(data.endFeel).some(i => i.isAbnormal || i.painful);
        const hasNotes = !!data.notes;
        return hasPlay || hasEndFeel || hasNotes;
    };

    // --- State Updaters ---

    const updateJointPlay = (jointName: string, grade: string, painful: boolean = false) => {
        if (!activeRegion) return;
        const currentRegion = mobilityData[activeRegion] || { jointPlay: {}, endFeel: {}, notes: '' };
        const currentData = currentRegion.jointPlay[jointName] || { grade: '', painful: false };
        
        const newJointPlay = { ...currentRegion.jointPlay };
        
        // If everything is cleared, remove key
        if (grade === '' && !painful) {
             delete newJointPlay[jointName];
        } else {
             newJointPlay[jointName] = { ...currentData, grade, painful };
        }

        const newData = { ...mobilityData, [activeRegion]: { ...currentRegion, jointPlay: newJointPlay } };
        setTData({ ...tData, jointMobility: newData });
    };

    const toggleJointPlayPain = (jointName: string) => {
        if (!activeRegion) return;
        const currentData = mobilityData[activeRegion]?.jointPlay?.[jointName] || { grade: '', painful: false };
        updateJointPlay(jointName, currentData.grade, !currentData.painful);
    };

    const updateEndFeel = (motion: string, type: string, isNormalType: boolean, painful?: boolean) => {
        if (!activeRegion) return;
        const currentRegion = mobilityData[activeRegion] || { jointPlay: {}, endFeel: {}, notes: '' };
        const currentItem = currentRegion.endFeel[motion] || { type: 'Unknown', isAbnormal: false, painful: false };

        // Logic for Non-Spine End Feel Update
        let newType = type;
        let newIsAbnormal = !isNormalType;
        const newPain = painful !== undefined ? painful : currentItem.painful;

        if (currentItem.type === type && painful === undefined) {
             // Toggle off check (optional, but complicates spine dropdown)
        }

        const newEndFeel = { ...currentRegion.endFeel, [motion]: { ...currentItem, type: newType, isAbnormal: newIsAbnormal, painful: newPain } };
        const newData = { ...mobilityData, [activeRegion]: { ...currentRegion, endFeel: newEndFeel } };
        setTData({ ...tData, jointMobility: newData });
    };

    const toggleEndFeelPain = (motion: string) => {
        if (!activeRegion) return;
        const currentItem = mobilityData[activeRegion]?.endFeel?.[motion] || { type: '', isAbnormal: false, painful: false };
        // We pass current type logic back
        updateEndFeel(motion, currentItem.type, !currentItem.isAbnormal, !currentItem.painful);
    }

    const updateNotes = (val: string) => {
        if (!activeRegion) return;
        const currentRegion = mobilityData[activeRegion] || { jointPlay: {}, endFeel: {}, notes: '' };
        const newData = { ...mobilityData, [activeRegion]: { ...currentRegion, notes: val } };
        setTData({ ...tData, jointMobility: newData });
    };

    const getGradeDesc = (val: string) => KALTENBORN_GRADES.find(g => g.val === val)?.desc || '';

    // Check if active region is a spine region to render specialized UI
    const isSpineRegion = activeRegion && SPINE_CONFIG[activeRegion];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-sky-500 rounded-full"></span>
                    關節測試(Joint Tests)
                </h4>
                <button 
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-[11px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg font-bold border border-sky-200 shadow-sm hover:bg-sky-100 transition-colors flex items-center gap-1"
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                    新增測試
                </button>
            </div>

            {/* Main Modal */}
            {isModalOpen && (
                <Portal>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4">
                        <div 
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
                            onClick={() => setIsModalOpen(false)}
                        />
                        <div className="relative z-10 bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <span className="md:hidden">
                                        {activeRegion ? (
                                            <button onClick={() => setActiveRegion(null)} className="mr-2 text-slate-500 hover:text-slate-800">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                                            </button>
                                        ) : null}
                                    </span>
                                    {activeRegion ? activeRegion.split(' ')[0] : 'Joint Tests'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-slate-100">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            
                            <div className="flex flex-1 min-h-0 relative">
                                {/* Left Sidebar: Region Selector (Responsive) */}
                                <div className={`w-full md:w-56 bg-slate-50 border-r border-slate-200 overflow-y-auto p-2 space-y-4 ${activeRegion ? 'hidden md:block' : 'block'}`}>
                                    {REGION_GROUPS.map(group => (
                                        <div key={group.label}>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 px-2">{group.label}</div>
                                            <div className="space-y-1">
                                                {group.regions.map(region => {
                                                    const data = mobilityData[region];
                                                    // Green dot logic: Only show if data is meaningful (has grades, pain, or notes)
                                                    const isAdded = !!data && hasData(data);
                                                    const isActive = activeRegion === region;
                                                    return (
                                                        <div key={region} className="relative group">
                                                            <button
                                                                onClick={() => handleRegionClick(region)}
                                                                className={`w-full text-left px-3 py-3 md:py-2.5 text-sm md:text-xs font-bold rounded-xl transition-all flex items-center justify-between
                                                                ${isActive 
                                                                    ? 'bg-white shadow-sm text-sky-700 border border-sky-100' 
                                                                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'}
                                                                `}
                                                            >
                                                                <span>{region.split(' ')[0]}</span>
                                                                {isAdded && (
                                                                    <div className="w-5 h-5 flex items-center justify-center">
                                                                        <span className="w-2 h-2 bg-green-500 rounded-full shadow-sm group-hover:hidden"></span>
                                                                    </div>
                                                                )}
                                                            </button>
                                                            {isAdded && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); removeRegion(region); }}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-6 md:h-6 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10 md:hidden md:group-hover:flex"
                                                                    title="Remove Region"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Right Content Area (Responsive) */}
                                <div className={`flex-1 flex flex-col min-w-0 bg-white ${!activeRegion ? 'hidden md:flex' : 'flex'}`}>
                                    {activeRegion && mobilityData[activeRegion] ? (
                                        <>
                                            {/* Header Tabs (Only show for Non-Spine regions) */}
                                            {!isSpineRegion && (
                                                <div className="border-b border-slate-100 px-4 md:px-6 pt-2">
                                                    <div className="flex justify-between items-end">
                                                        <div className="flex gap-4 md:gap-8 w-full">
                                                            <button onClick={() => setActiveTab('play')} className={`flex-1 md:flex-initial pb-3 text-sm font-bold transition-all border-b-2 text-center md:text-left ${activeTab === 'play' ? 'text-sky-600 border-sky-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>Joint Play</button>
                                                            <button onClick={() => setActiveTab('endfeel')} className={`flex-1 md:flex-initial pb-3 text-sm font-bold transition-all border-b-2 text-center md:text-left ${activeTab === 'endfeel' ? 'text-sky-600 border-sky-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>End-Feel</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Scrollable Content */}
                                            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
                                                
                                                {/* Specialized Spine View */}
                                                {isSpineRegion ? (
                                                    <div className="space-y-4">
                                                        {SPINE_CONFIG[activeRegion].segments.map(segment => (
                                                            <SpineSegmentRow 
                                                                key={segment}
                                                                segmentName={segment}
                                                                paivmTests={SPINE_CONFIG[activeRegion].paivm}
                                                                ppivmTests={SPINE_CONFIG[activeRegion].ppivm}
                                                                combinedPatterns={SPINE_CONFIG[activeRegion].combined || []}
                                                                jointPlayData={mobilityData[activeRegion]?.jointPlay || {}}
                                                                endFeelData={mobilityData[activeRegion]?.endFeel || {}}
                                                                onUpdateJointPlay={updateJointPlay}
                                                                onUpdateEndFeel={(key, type, pain) => updateEndFeel(key, type, type !== 'Firm', pain)}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    /* Standard Peripheral Joint View */
                                                    <>
                                                        <div className="mb-6"><CapsularAnalysis region={activeRegion} romData={tData.rom?.[activeRegion]} /></div>
                                                        {activeTab === 'play' && (
                                                            <div className="space-y-3">
                                                                {(JOINT_PLAY_DB[activeRegion] || []).map(joint => (
                                                                    <JointPlayRow 
                                                                        key={joint} 
                                                                        joint={joint} 
                                                                        data={mobilityData[activeRegion]?.jointPlay?.[joint] || { grade: '', painful: false }} 
                                                                        onUpdate={(grade) => updateJointPlay(joint, grade)} 
                                                                        onTogglePain={() => toggleJointPlayPain(joint)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                        {activeTab === 'endfeel' && (
                                                            <div className="space-y-3">
                                                                {(!END_FEEL_DB[activeRegion] || END_FEEL_DB[activeRegion].length === 0) ? (
                                                                    <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">此部位無常規 End-Feel 測試標準</div>
                                                                ) : (
                                                                    (END_FEEL_DB[activeRegion] || []).map(item => (
                                                                        <EndFeelRow 
                                                                            key={item.motion}
                                                                            motion={item.motion}
                                                                            data={mobilityData[activeRegion]?.endFeel?.[item.motion] || { type: 'Unknown', isAbnormal: false, painful: false }}
                                                                            normalTypes={item.normal}
                                                                            onUpdate={(type, isNormal) => updateEndFeel(item.motion, type, isNormal)}
                                                                            onTogglePain={() => toggleEndFeelPain(item.motion)}
                                                                        />
                                                                    ))
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* Footer Note */}
                                            <div className="p-4 border-t border-slate-100 bg-white">
                                                <Label>備註 (Notes)</Label>
                                                <TextArea 
                                                    value={mobilityData[activeRegion]?.notes || ''} 
                                                    onChange={e => updateNotes(e.target.value)}
                                                    className="h-20 bg-slate-50 text-xs" 
                                                    placeholder="Pain response, restriction pattern..."
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 text-slate-200"><circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>
                                            <span className="text-sm font-bold">請選擇檢查部位</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            {/* Display Area (Cards) */}
            <div className="p-3 space-y-4">
                {Object.keys(mobilityData).length === 0 || Object.values(mobilityData).every(d => !hasData(d)) ? (
                    <div onClick={() => setIsModalOpen(true)} className="text-center py-4 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-sky-300"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="font-bold">點擊新增關節活動度測試</span>
                    </div>
                ) : (
                    Object.entries(mobilityData).filter(([_, data]) => hasData(data)).map(([region, data]) => (
                        <div key={region} className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm animate-fade-in relative group overflow-hidden">
                            {/* Capsular Pattern Indicator (Compact) - Only for Peripheral */}
                            {!SPINE_CONFIG[region] && <CapsularAnalysis region={region} romData={tData.rom?.[region]} compact={true} />}

                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                <h5 className="font-bold text-slate-800 text-xs">{region}</h5>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(region)} className="text-sky-600 hover:bg-sky-50 p-1.5 rounded-full transition-colors" title="編輯">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    </button>
                                    <button onClick={() => removeRegion(region)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors" title="刪除">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Joint Play Summary */}
                                {Object.keys(data.jointPlay).length > 0 && (
                                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Joint Play / PPIVM</div>
                                        <div className="space-y-1">
                                            {Object.entries(data.jointPlay).slice(0, 5).map(([joint, res]) => (
                                                <div key={joint} className="flex justify-between items-center text-[10px]">
                                                    <span className="text-slate-600 truncate mr-2 flex items-center gap-1 w-[70%]">
                                                        {joint}
                                                        {res.painful && <span className="text-[8px] text-red-500 border border-red-200 px-1 rounded bg-red-50">Pain</span>}
                                                    </span>
                                                    <span className={`font-bold px-1.5 rounded ${
                                                        res.grade === '3' || res.grade === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {res.grade}
                                                    </span>
                                                </div>
                                            ))}
                                            {Object.keys(data.jointPlay).length > 5 && <div className="text-[9px] text-slate-400 pl-1">... and {Object.keys(data.jointPlay).length - 5} more</div>}
                                        </div>
                                    </div>
                                )}

                                {/* End Feel Summary (Only abnormal for Spine, or all for others) */}
                                {Object.keys(data.endFeel).length > 0 && (
                                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End-Feel (Findings)</div>
                                        <div className="space-y-1">
                                            {Object.entries(data.endFeel).filter(([_, res]) => res.isAbnormal || res.painful).length === 0 ? (
                                                <span className="text-[10px] text-slate-400 italic">All Tested Normal</span>
                                            ) : (
                                                Object.entries(data.endFeel).filter(([_, res]) => res.isAbnormal || res.painful).slice(0, 5).map(([motion, res]) => (
                                                    <div key={motion} className="flex justify-between items-center text-[10px]">
                                                        <span className="text-slate-600 w-[60%] truncate">{motion}</span>
                                                        <div className="flex gap-1 justify-end w-[40%]">
                                                            {res.isAbnormal && <span className="font-bold text-red-600 truncate">{res.type}</span>}
                                                            {res.painful && <span className="text-[8px] text-red-500 border border-red-200 px-1 rounded bg-red-50 font-bold self-center">Pain</span>}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {data.notes && (
                                <div className="mt-3 text-[10px] text-slate-500 bg-slate-100/50 p-2 rounded border border-slate-100">
                                    <span className="font-bold mr-1">Notes:</span> {data.notes}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
