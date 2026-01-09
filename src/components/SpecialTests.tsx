
import React, { useState } from 'react';
import { TherapistData, SPECIAL_TEST_DB, SpecialTestJointData } from '../types';
import { TextArea, Label, Portal } from './Input';

export const SpecialTests = ({ tData, setTData }: { tData: TherapistData; setTData: React.Dispatch<React.SetStateAction<TherapistData>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Normalize tData.specialTests to object if it's a string (legacy support)
    const specialData: Record<string, SpecialTestJointData> = typeof tData.specialTests === 'string' 
        ? {} 
        : (tData.specialTests as Record<string, SpecialTestJointData>) || {};

    const addJoint = (joint: string) => {
        if (!specialData[joint]) {
            const newData = { ...specialData, [joint]: {} };
            setTData({ ...tData, specialTests: newData });
        }
        setIsModalOpen(false);
    };

    const removeJoint = (joint: string) => {
        const newData = { ...specialData };
        delete newData[joint];
        setTData({ ...tData, specialTests: newData });
    };

    const toggleTest = (joint: string, testName: string) => {
        const currentJointData = specialData[joint] || {};
        const newData = { ...specialData };
        
        if (currentJointData[testName]) {
            // Remove
            const newJointData = { ...currentJointData };
            delete newJointData[testName];
            newData[joint] = newJointData;
        } else {
            // Add default
            newData[joint] = {
                ...currentJointData,
                [testName]: { name: testName, result: '', note: '' }
            };
        }
        setTData({ ...tData, specialTests: newData });
    };

    const updateTestResult = (joint: string, testName: string, field: 'result' | 'note', value: string) => {
        const newData = { ...specialData };
        if (newData[joint] && newData[joint][testName]) {
            newData[joint][testName] = { ...newData[joint][testName], [field]: value };
            setTData({ ...tData, specialTests: newData });
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                    特殊測試 (Special Tests)
                </h4>
                <button 
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold border border-indigo-200 shadow-sm hover:bg-indigo-100 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
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
                                <h3 className="font-bold text-slate-800">選擇測試部位</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-1">✕</button>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                                {Object.keys(SPECIAL_TEST_DB).map(joint => (
                                    <button 
                                        key={joint} 
                                        onClick={() => addJoint(joint)}
                                        className="px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-left"
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
                {Object.keys(specialData).length === 0 ? (
                    <div onClick={() => setIsModalOpen(true)} className="text-center py-4 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-300"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="font-bold">點擊新增特殊測試</span>
                    </div>
                ) : (
                    Object.entries(specialData).map(([joint, tests]) => (
                        <div key={joint} className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                <h5 className="font-bold text-slate-800 text-xs">{joint}</h5>
                                <button onClick={() => removeJoint(joint)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Checkbox Selector Area */}
                                <div className="bg-white rounded-lg border border-slate-100 p-2 mb-3">
                                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">選擇測試項目</div>
                                    <div className="flex flex-wrap gap-2">
                                        {SPECIAL_TEST_DB[joint]?.map(dbItem => {
                                            const isSelected = !!tests[dbItem.name];
                                            return (
                                                <button
                                                    key={dbItem.name}
                                                    type="button"
                                                    onClick={() => toggleTest(joint, dbItem.name)}
                                                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-all text-left
                                                    ${isSelected 
                                                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white hover:border-indigo-200'}`}
                                                    title={dbItem.purpose + (dbItem.stats ? ` (${dbItem.stats})` : '')}
                                                >
                                                    {dbItem.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Selected Tests Inputs */}
                                <div className="space-y-2">
                                    {Object.values(tests).map(test => {
                                        const dbInfo = SPECIAL_TEST_DB[joint]?.find(x => x.name === test.name);
                                        return (
                                            <div key={test.name} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-start md:items-center">
                                                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4">
                                                    <div>
                                                        <div className="font-bold text-xs text-slate-800">{test.name}</div>
                                                        <div className="text-[10px] text-slate-500 font-medium truncate" title={dbInfo?.purpose}>
                                                            {dbInfo?.purpose}
                                                        </div>
                                                    </div>
                                                    {dbInfo?.stats && (
                                                        <div className="text-[9px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 sm:self-center self-start shrink-0">
                                                            {dbInfo.stats}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-2 w-full md:w-auto">
                                                    <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
                                                        <button 
                                                            type="button"
                                                            onClick={() => updateTestResult(joint, test.name, 'result', 'positive')}
                                                            className={`w-8 py-1 rounded text-[10px] font-black transition-all ${test.result === 'positive' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                            title="Positive (+)"
                                                        >
                                                            +
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => updateTestResult(joint, test.name, 'result', 'negative')}
                                                            className={`w-8 py-1 rounded text-[10px] font-black transition-all ${test.result === 'negative' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                            title="Negative (-)"
                                                        >
                                                            -
                                                        </button>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        placeholder="備註..." 
                                                        value={test.note} 
                                                        onChange={e => updateTestResult(joint, test.name, 'note', e.target.value)}
                                                        className="flex-1 md:w-32 px-2 py-1.5 rounded border border-slate-200 text-xs bg-slate-50 focus:bg-white transition-colors outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleTest(joint, test.name)}
                                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                                        title="移除測試"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
