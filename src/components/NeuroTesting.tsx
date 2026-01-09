
import React, { useState } from 'react';
import { TherapistData, NEURO_OPTIONS, NeuroScreeningData } from '../types';
import { TextArea, Label, Portal } from './Input';

export const NeuroTesting = ({ tData, setTData }: { tData: TherapistData; setTData: React.Dispatch<React.SetStateAction<TherapistData>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTargetCategory, setModalTargetCategory] = useState<string | null>(null);
    const [localNotesOpen, setLocalNotesOpen] = useState(false);
    
    // Ensure data object exists
    const neuroData: NeuroScreeningData = tData.neuroScreening || {};
    
    // Determine if notes should be shown: either data exists or user explicitly opened it locally
    const hasNotes = tData.testsNerve !== undefined && tData.testsNerve.trim() !== '';
    const showNotes = hasNotes || localNotesOpen;

    const openCategoryModal = () => {
        setModalTargetCategory(null);
        setIsModalOpen(true);
    };

    const openItemModal = (categoryKey: string) => {
        // Ensure category exists in data structure first
        if (!neuroData[categoryKey]) {
            const newData = { ...neuroData, [categoryKey]: {} };
            setTData(prev => ({ ...prev, neuroScreening: newData }));
        }
        setModalTargetCategory(categoryKey);
        setIsModalOpen(true);
    };

    const removeCategory = (categoryKey: string) => {
        const newData = { ...neuroData };
        delete newData[categoryKey];
        setTData({ ...tData, neuroScreening: newData });
    };

    const toggleTestItem = (categoryKey: string, testName: string) => {
        const currentCategory = neuroData[categoryKey] || {};
        
        if (currentCategory[testName]) {
            // Remove
            const newCategory = { ...currentCategory };
            delete newCategory[testName];
            const newData = { ...neuroData, [categoryKey]: newCategory };
            setTData({ ...tData, neuroScreening: newData });
        } else {
            // Add
            const defaultVal = '';
            const newData = {
                ...neuroData,
                [categoryKey]: {
                    ...currentCategory,
                    [testName]: { l: defaultVal, r: defaultVal }
                }
            };
            setTData({ ...tData, neuroScreening: newData });
        }
    };

    const removeTestItem = (categoryKey: string, testName: string) => {
        const currentCategory = { ...neuroData[categoryKey] };
        delete currentCategory[testName];
        const newData = { ...neuroData, [categoryKey]: currentCategory };
        setTData({ ...tData, neuroScreening: newData });
    };

    const updateTestValue = (categoryKey: string, testName: string, side: 'l' | 'r', val: string) => {
        const currentCategory = neuroData[categoryKey] || {};
        const currentItem = currentCategory[testName] || { l: '', r: '' };
        
        const newData = {
            ...neuroData,
            [categoryKey]: {
                ...currentCategory,
                [testName]: { ...currentItem, [side]: val }
            }
        };
        setTData({ ...tData, neuroScreening: newData });
    };

    const toggleNotes = () => {
        if (showNotes) {
            // User wants to close/remove notes
            // Clear the data and reset local state
            setTData({ ...tData, testsNerve: '' });
            setLocalNotesOpen(false);
        } else {
            // User wants to add notes
            // Just open the local state, text area will appear empty
            setLocalNotesOpen(true);
        }
        setIsModalOpen(false);
    };

    // Helper to get color for badge based on value
    const getBadgeStyle = (val: string, category: string) => {
        if (!val) return 'bg-slate-50 text-slate-400 border-slate-200';
        
        const lower = val.toLowerCase();
        // Normal / Intact / 5 / 2+
        if (['intact', '5 (normal)', '2+ (normal)', 'negative (-)'].includes(lower)) return 'bg-slate-100 text-slate-600 border-slate-200';
        
        // Pathological / Abnormal
        if (['positive (+)', 'absent', '0 (absent)', '4+ (clonus)'].includes(lower)) return 'bg-red-50 text-red-600 border-red-200 font-bold';
        
        // Hyper / Hypo
        if (lower.includes('hyper') || lower.includes('3+')) return 'bg-orange-50 text-orange-600 border-orange-200';
        if (lower.includes('hypo') || lower.includes('impaired') || lower.includes('1+')) return 'bg-yellow-50 text-yellow-600 border-yellow-200';
        
        // Muscle grades < 5
        if (category === 'myotomes') {
            if (val.startsWith('0') || val.startsWith('1') || val.startsWith('2')) return 'bg-red-50 text-red-600 border-red-200';
            if (val.startsWith('3') || val.startsWith('4')) return 'bg-yellow-50 text-yellow-600 border-yellow-200';
        }

        // MAS > 0
        if (category === 'tone' && !val.startsWith('0')) return 'bg-orange-50 text-orange-600 border-orange-200';

        return 'bg-blue-50 text-blue-600 border-blue-200';
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center rounded-t-2xl">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-cyan-500 rounded-full"></span>
                    神經學檢查 (Neurological Examination)
                </h4>
                <button 
                    type="button"
                    onClick={openCategoryModal}
                    className="text-[11px] bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-lg font-bold border border-cyan-200 shadow-sm hover:bg-cyan-100 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                    新增檢查
                </button>
            </div>

            {/* Universal Modal */}
            {isModalOpen && (
                <Portal>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
                            onClick={() => setIsModalOpen(false)}
                        />
                        
                        {/* Content */}
                        <div className="relative z-10 bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                                <h3 className="font-bold text-slate-800">
                                    {modalTargetCategory ? `${NEURO_OPTIONS[modalTargetCategory].label}` : '選擇檢查類別'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-1">✕</button>
                            </div>
                            
                            <div className="p-2 space-y-2 overflow-y-auto no-scrollbar flex-1">
                                {modalTargetCategory ? (
                                    // View 2: Select Items inside Category
                                    <>
                                        <button 
                                            onClick={() => setModalTargetCategory(null)}
                                            className="w-full text-left px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                                        >
                                            ← 返回類別列表
                                        </button>
                                        <div className="grid grid-cols-1 gap-2">
                                            {NEURO_OPTIONS[modalTargetCategory].tests.map(test => {
                                                const isSelected = !!neuroData[modalTargetCategory]?.[test];
                                                return (
                                                    <button 
                                                        key={test} 
                                                        onClick={() => toggleTestItem(modalTargetCategory, test)}
                                                        className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all border flex justify-between items-center
                                                        ${isSelected 
                                                            ? 'bg-cyan-50 text-cyan-700 border-cyan-200' 
                                                            : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                                                    >
                                                        <span>{test}</span>
                                                        {isSelected && <span className="text-cyan-600">✓</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    // View 1: Select Category
                                    <>
                                        {Object.entries(NEURO_OPTIONS).map(([key, info]) => (
                                            <button 
                                                key={key} 
                                                onClick={() => openItemModal(key)}
                                                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 bg-white hover:bg-cyan-50 hover:text-cyan-700 rounded-xl transition-all border border-transparent hover:border-cyan-100 flex justify-between items-center"
                                            >
                                                <span>{info.label}</span>
                                                {neuroData[key] && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">已新增</span>}
                                            </button>
                                        ))}
                                        
                                        <div className="border-t border-slate-100 my-2 pt-2">
                                            <button 
                                                onClick={toggleNotes}
                                                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-transparent flex justify-between items-center"
                                            >
                                                <span>其他神經學備註 (General Notes)</span>
                                                {showNotes && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">顯示中</span>}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            <div className="p-3 space-y-6">
                {Object.keys(neuroData).length === 0 && !showNotes ? (
                    <div onClick={openCategoryModal} className="text-center py-4 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan-300"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="font-bold">點擊新增神經學檢查</span>
                    </div>
                ) : (
                    Object.entries(neuroData).map(([catKey, tests]) => {
                        const catInfo = NEURO_OPTIONS[catKey];
                        const availableTests = catInfo?.tests.filter(t => !tests[t]) || [];

                        return (
                            <div key={catKey} className="bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in relative">
                                {/* Category Header */}
                                <div className="bg-slate-50/80 p-3 border-b border-slate-100 flex justify-between items-center rounded-t-xl">
                                    <h5 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full 
                                            ${catKey === 'dermatomes' ? 'bg-blue-400' : 
                                              catKey === 'myotomes' ? 'bg-orange-400' : 
                                              catKey === 'reflexes' ? 'bg-purple-400' : 'bg-slate-400'}`} 
                                        />
                                        {catInfo?.label || catKey}
                                    </h5>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => openItemModal(catKey)}
                                            className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 text-slate-500 font-bold flex items-center gap-1"
                                        >
                                            + 新增測試
                                        </button>
                                        <button onClick={() => removeCategory(catKey)} className="text-slate-300 hover:text-red-500 p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Test Items */}
                                <div className="divide-y divide-slate-50">
                                    {Object.entries(tests).length === 0 ? (
                                        <div className="p-3">
                                            <div 
                                                onClick={() => openItemModal(catKey)}
                                                className="text-center py-4 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan-300"><path d="M12 5v14M5 12h14"/></svg>
                                                <span className="font-bold">點擊新增 {catInfo?.label} 測試資料</span>
                                            </div>
                                        </div>
                                    ) : (
                                        Object.entries(tests).map(([testName, val]) => (
                                            <div key={testName} className="p-2 flex flex-col sm:flex-row sm:items-center gap-2 hover:bg-slate-50/50 transition-colors">
                                                <div className="w-full sm:w-1/3 flex justify-between items-center sm:block">
                                                    <span className="text-[11px] font-bold text-slate-700 pl-1">{testName}</span>
                                                    <button onClick={() => removeTestItem(catKey, testName)} className="sm:hidden text-slate-300 hover:text-red-500 px-2">×</button>
                                                </div>
                                                
                                                <div className="flex-1 flex gap-2 w-full relative">
                                                    {['l', 'r'].map(side => (
                                                        <div key={side} className="flex-1 flex flex-col relative">
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase mb-0.5 pl-1">{side === 'l' ? 'Left' : 'Right'}</span>
                                                            
                                                            {/* Dropdown Container */}
                                                            <div className="relative group/select w-full">
                                                                <button className={`w-full text-left px-2 py-1.5 rounded-lg border text-[10px] font-medium truncate min-h-[26px] ${getBadgeStyle(val[side as 'l'|'r'], catKey)}`}>
                                                                    {val[side as 'l'|'r'] || '- Select -'}
                                                                </button>
                                                                
                                                                {/* Hover Bridge and Dropdown */}
                                                                <div className="absolute left-0 top-full pt-1 w-full min-w-[120px] hidden group-hover/select:block z-50">
                                                                    <div className="bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                                                                        {catInfo?.options.map(opt => (
                                                                            <button
                                                                                key={opt}
                                                                                onClick={() => updateTestValue(catKey, testName, side as 'l'|'r', opt)}
                                                                                className={`w-full text-left px-3 py-2 text-[10px] hover:bg-slate-50 block border-b border-slate-50 last:border-0
                                                                                    ${val[side as 'l'|'r'] === opt ? 'bg-slate-50 font-bold text-primary-600' : 'text-slate-600'}`}
                                                                            >
                                                                                {opt}
                                                                            </button>
                                                                        ))}
                                                                        <button onClick={() => updateTestValue(catKey, testName, side as 'l'|'r', '')} className="w-full text-left px-3 py-2 text-[10px] text-slate-400 hover:bg-slate-50 italic border-t border-slate-100">Clear</button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={() => removeTestItem(catKey, testName)} className="hidden sm:block text-slate-300 hover:text-red-500 p-1.5 hover:bg-slate-100 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                
                {/* Optional Notes Section - Only shows if explicitly added */}
                {showNotes && (
                    <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in relative group">
                        <div className="flex justify-between items-center mb-1">
                            <Label>其他神經學備註 (General Notes)</Label>
                            <button onClick={toggleNotes} className="text-[10px] text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">移除備註</button>
                        </div>
                        <TextArea
                            value={tData.testsNerve}
                            onChange={e => setTData({ ...tData, testsNerve: e.target.value })}
                            className="h-20 bg-slate-50 text-xs"
                            placeholder="Additional findings, observations..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
