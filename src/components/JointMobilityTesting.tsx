
import React, { useState } from 'react';
import { TherapistData, JointMobilityData, JOINT_PLAY_DB, END_FEEL_DB } from '../types';
import { Portal, TextArea, Label } from './Input';
import { CapsularAnalysis, JointPlayRow, EndFeelRow, KALTENBORN_GRADES } from './JointMobilityComponents';

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

    // --- State Updaters ---

    const updateJointPlay = (jointName: string, grade: string) => {
        if (!activeRegion) return;
        const currentRegion = mobilityData[activeRegion] || { jointPlay: {}, endFeel: {}, notes: '' };
        const currentData = currentRegion.jointPlay[jointName] || { grade: '', painful: false };
        
        let newGrade = grade;
        // Toggle off if same grade clicked
        if (currentData.grade === grade) {
            newGrade = ''; 
        }

        const newJointPlay = { ...currentRegion.jointPlay };
        if (newGrade === '' && !currentData.painful) {
             delete newJointPlay[jointName];
        } else {
             newJointPlay[jointName] = { ...currentData, grade: newGrade };
        }

        const newData = { ...mobilityData, [activeRegion]: { ...currentRegion, jointPlay: newJointPlay } };
        setTData({ ...tData, jointMobility: newData });
    };

    const toggleJointPlayPain = (jointName: string) => {
        if (!activeRegion) return;
        const currentRegion = mobilityData[activeRegion] || { jointPlay: {}, endFeel: {}, notes: '' };
        const currentData = currentRegion.jointPlay[jointName] || { grade: '', painful: false };
        
        const newPain = !currentData.painful;
        const newJointPlay = { ...currentRegion.jointPlay };
        
        if (!newPain && currentData.grade === '') {
            delete newJointPlay[jointName];
        } else {
            newJointPlay[jointName] = { ...currentData, painful: newPain };
        }

        const newData = { ...mobilityData, [activeRegion]: { ...currentRegion, jointPlay: newJointPlay } };
        setTData({ ...tData, jointMobility: newData });
    };

    const updateEndFeel = (motion: string, type: string, isNormalType: boolean) => {
        if (!activeRegion) return;
        const currentRegion = mobilityData[activeRegion] || { jointPlay: {}, endFeel: {}, notes: '' };
        const currentItem = currentRegion.endFeel[motion] || { type: 'Unknown', isAbnormal: false, painful: false };

        let newType = type;
        let newIsAbnormal = !isNormalType;

        if (currentItem.type === type) {
            if (currentItem.isAbnormal) {
                // Revert to primary normal if available and current was abnormal
                const normalItem = END_FEEL_DB[activeRegion]?.find(i => i.motion === motion);
                if (normalItem) {
                    newType = normalItem.normal[0];
                    newIsAbnormal = false;
                }
            } else {
                return; // Already selected normal
            }
        }

        const newEndFeel = { ...currentRegion.endFeel, [motion]: { ...currentItem, type: newType, isAbnormal: newIsAbnormal } };
        const newData = { ...mobilityData, [activeRegion]: { ...currentRegion, endFeel: newEndFeel } };
        setTData({ ...tData, jointMobility: newData });
    };

    const toggleEndFeelPain = (motion: string) => {
        if (!activeRegion) return;
        const currentRegion = mobilityData[activeRegion] || { jointPlay: {}, endFeel: {}, notes: '' };
        const currentItem = currentRegion.endFeel[motion] || { type: 'Unknown', isAbnormal: false, painful: false };
        
        const newEndFeel = { ...currentRegion.endFeel, [motion]: { ...currentItem, painful: !currentItem.painful } };
        const newData = { ...mobilityData, [activeRegion]: { ...currentRegion, endFeel: newEndFeel } };
        setTData({ ...tData, jointMobility: newData });
    }

    const updateNotes = (val: string) => {
        if (!activeRegion) return;
        const currentRegion = mobilityData[activeRegion] || { jointPlay: {}, endFeel: {}, notes: '' };
        const newData = { ...mobilityData, [activeRegion]: { ...currentRegion, notes: val } };
        setTData({ ...tData, jointMobility: newData });
    };

    const getGradeDesc = (val: string) => KALTENBORN_GRADES.find(g => g.val === val)?.desc || '';

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
                        {/* Modified: Full screen on mobile, rounded on desktop */}
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
                                                    const isAdded = !!mobilityData[region];
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
                                                                        {/* Green Dot (Default) */}
                                                                        <span className="w-2 h-2 bg-green-500 rounded-full shadow-sm group-hover:hidden"></span>
                                                                    </div>
                                                                )}
                                                            </button>
                                                            {/* Delete Button */}
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
                                            {/* Tabs & Capsular Analysis */}
                                            <div className="border-b border-slate-100 px-4 md:px-6 pt-2">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex gap-4 md:gap-8 w-full">
                                                        <button 
                                                            onClick={() => setActiveTab('play')}
                                                            className={`flex-1 md:flex-initial pb-3 text-sm font-bold transition-all border-b-2 text-center md:text-left ${activeTab === 'play' ? 'text-sky-600 border-sky-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                                        >
                                                            Joint Play
                                                        </button>
                                                        <button 
                                                            onClick={() => setActiveTab('endfeel')}
                                                            className={`flex-1 md:flex-initial pb-3 text-sm font-bold transition-all border-b-2 text-center md:text-left ${activeTab === 'endfeel' ? 'text-sky-600 border-sky-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                                        >
                                                            End-Feel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Scrollable Content */}
                                            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
                                                {/* Capsular Analysis */}
                                                <div className="mb-6">
                                                    <CapsularAnalysis 
                                                        region={activeRegion} 
                                                        romData={tData.rom?.[activeRegion]} 
                                                    />
                                                </div>

                                                {activeTab === 'play' && (
                                                    <div className="space-y-3">
                                                        {(JOINT_PLAY_DB[activeRegion] || []).map(joint => {
                                                            const currentData = mobilityData[activeRegion]?.jointPlay?.[joint] || { grade: '', painful: false };
                                                            return (
                                                                <JointPlayRow 
                                                                    key={joint} 
                                                                    joint={joint} 
                                                                    data={currentData} 
                                                                    onUpdate={(grade) => updateJointPlay(joint, grade)} 
                                                                    onTogglePain={() => toggleJointPlayPain(joint)}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {activeTab === 'endfeel' && (
                                                    <div className="space-y-3">
                                                        {(!END_FEEL_DB[activeRegion] || END_FEEL_DB[activeRegion].length === 0) ? (
                                                            <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                                此部位無常規 End-Feel 測試標準
                                                            </div>
                                                        ) : (
                                                            (END_FEEL_DB[activeRegion] || []).map(item => {
                                                                const current = mobilityData[activeRegion]?.endFeel?.[item.motion] || { type: 'Unknown', isAbnormal: false, painful: false };
                                                                
                                                                return (
                                                                    <EndFeelRow 
                                                                        key={item.motion}
                                                                        motion={item.motion}
                                                                        data={current}
                                                                        normalTypes={item.normal}
                                                                        onUpdate={(type, isNormal) => updateEndFeel(item.motion, type, isNormal)}
                                                                        onTogglePain={() => toggleEndFeelPain(item.motion)}
                                                                    />
                                                                );
                                                            })
                                                        )}
                                                    </div>
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
                {Object.keys(mobilityData).length === 0 ? (
                    <div onClick={() => setIsModalOpen(true)} className="text-center py-4 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-sky-300"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="font-bold">點擊新增關節活動度測試</span>
                    </div>
                ) : (
                    Object.entries(mobilityData).map(([region, data]) => (
                        <div key={region} className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm animate-fade-in relative group overflow-hidden">
                            {/* Capsular Pattern Indicator (Compact) */}
                            <CapsularAnalysis region={region} romData={tData.rom?.[region]} compact={true} />

                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                <h5 className="font-bold text-slate-800 text-xs">{region}</h5>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(region)} className="text-[10px] text-sky-600 hover:underline px-2">編輯</button>
                                    <button onClick={() => removeRegion(region)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Joint Play Summary */}
                                {Object.keys(data.jointPlay).length > 0 && (
                                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Joint Play</div>
                                        <div className="space-y-1">
                                            {Object.entries(data.jointPlay).map(([joint, res]) => (
                                                <div key={joint} className="flex justify-between items-center text-[10px]">
                                                    <span className="text-slate-600 truncate mr-2 flex items-center gap-1">
                                                        {joint}
                                                        {res.painful && <span className="text-[8px] text-red-500 border border-red-200 px-1 rounded bg-red-50">Pain</span>}
                                                    </span>
                                                    <span className={`font-bold px-1.5 rounded ${
                                                        res.grade === '3' ? 'bg-green-100 text-green-700' : 
                                                        (res.grade === '0' || res.grade === '6') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {res.grade} ({getGradeDesc(res.grade)})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* End Feel Summary */}
                                {Object.keys(data.endFeel).length > 0 && (
                                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End-Feel (Abnormal Only)</div>
                                        <div className="space-y-1">
                                            {Object.entries(data.endFeel).filter(([_, res]) => res.isAbnormal || res.painful).length === 0 ? (
                                                <span className="text-[10px] text-slate-400 italic">All Tested Normal</span>
                                            ) : (
                                                Object.entries(data.endFeel).filter(([_, res]) => res.isAbnormal || res.painful).map(([motion, res]) => (
                                                    <div key={motion} className="flex justify-between items-center text-[10px]">
                                                        <span className="text-slate-600">{motion}</span>
                                                        <div className="flex gap-1">
                                                            {res.isAbnormal && <span className="font-bold text-red-600">{res.type}</span>}
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
