
import React, { useState } from 'react';
import { Button, Input, Label, TextArea, ChipGroup, Portal } from '../../components/Input';
import { ListIconSet, toggleListFormatHelper } from '../../components/EvalShared';
import { VisitData, BODY_PARTS_GROUPS, VasRecord } from '../../types';

interface SubjectiveProps {
    visit: VisitData;
    setVisit: React.Dispatch<React.SetStateAction<VisitData>>;
    goNext: () => void;
    scrollToTop: () => void;
}

export const SubjectiveSection: React.FC<SubjectiveProps> = ({ visit, setVisit, goNext, scrollToTop }) => {
    const [expandedVasIndex, setExpandedVasIndex] = useState<number | null>(null);
    const [isBodyModalOpen, setIsBodyModalOpen] = useState(false);
    const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);

    const addVasEntry = () => {
        const newIndex = (visit.vasEntries || []).length;
        setVisit(prev => ({ ...prev, vasEntries: [...(prev.vasEntries || []), { part: '', value: 0 }] }));
        setActiveEditIndex(newIndex);
        setIsBodyModalOpen(true);
    };

    const openPartModal = (index: number) => {
        setActiveEditIndex(index);
        setIsBodyModalOpen(true);
    };

    const selectPart = (part: string) => {
        if (activeEditIndex !== null) {
            updateVasEntry(activeEditIndex, 'part', part);
            setExpandedVasIndex(activeEditIndex);
        }
        setIsBodyModalOpen(false);
        setActiveEditIndex(null);
    };

    const updateVasEntry = (index: number, key: keyof VasRecord, val: any) => {
        const newEntries = [...(visit.vasEntries || [])];
        newEntries[index] = { ...newEntries[index], [key]: val };
        setVisit(prev => ({ ...prev, vasEntries: newEntries }));
    };

    const removeVasEntry = (index: number) => {
        setVisit(prev => ({ ...prev, vasEntries: prev.vasEntries.filter((_, i) => i !== index) }));
        setExpandedVasIndex(null);
    };

    // --- Professional Clinical Data Sets ---
    
    // Based on Maitland & McKenzie assessment protocols (Cleaned: English Only)
    const AGGRAVATING_OPTIONS = [
        'Sitting', 'Standing', 'Walking', 
        'Bending/Flexion', 'Extension', 'Rotation',
        'Sit-to-Stand', 'Stairs', 'Squatting',
        'Lifting', 'Overhead Reach', 'Sustained Posture',
        'Driving', 'Computer Work', 
        'Pressure/Touch', 'Cough/Sneeze', 
        'Deep Breathing', 'Cold/Damp', 
        'Stress/Fatigue', 'After Activity'
    ];

    const EASING_OPTIONS = [
        'Rest', 'Lying Supine', 'Lying Prone', 'Side Lying',
        'Sitting', 'Standing', 'Walking', 
        'Change Position', 'Movement', 
        'Stretching', 'Massage/Rubbing', 
        'Ice', 'Heat', 'Medication', 
        'Support/Brace', 'Elevation', 'Unloading'
    ];

    const PATTERN_24H_OPTIONS = [
        'Morning Stiffness <30m', 'Morning Stiffness >30m',
        'Wakes at Night', 'Trouble Falling Asleep',
        'Pain at Rest', 'Pain w/ Movement',
        'Better w/ Movement', 'Worse End of Day',
        'Latent Onset', 'Constant',
        'Fluctuating', 'Predictable'
    ];

    const PAIN_QUALITY_OPTIONS = [
        'Sharp (銳痛)', 'Dull (鈍痛)', 'Aching (痠痛)', 
        'Throbbing (搏動/跳痛)', 'Burning (燒灼感)', 
        'Shooting (放射/電擊)', 'Numbness (麻木)', 
        'Tingling (刺痛/蟻走感)', 'Stiffness (緊繃感)', 
        'Heavy (沉重感)', 'Cramping (抽筋)', 'Deep (深層鑽痛)'
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-4"><h3 className="text-lg font-bold text-slate-900">Subjective (主觀資料)</h3></div>
            
            {/* Body Part Selection Modal */}
            {isBodyModalOpen && (
                <Portal>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
                            onClick={() => setIsBodyModalOpen(false)}
                        />
                        
                        {/* Content */}
                        <div className="relative z-10 bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[85vh]">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                                <h3 className="font-bold text-slate-800">選擇評估部位</h3>
                                <button onClick={() => setIsBodyModalOpen(false)} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto no-scrollbar space-y-6">
                                {BODY_PARTS_GROUPS.map(group => (
                                    <div key={group.label} className="space-y-2">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{group.label}</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {group.items.map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => selectPart(p)}
                                                    className="px-3 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all text-left shadow-sm"
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => selectPart('Other')}
                                        className="w-full px-3 py-3 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all text-center shadow-sm"
                                    >
                                        Other (自定義部位...)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            {/* Current Complaint / Subjective Notes Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-slate-800 rounded-full"></span>
                        本次主訴 (Current Complaint)
                    </h4>
                    <div className="flex items-center">
                        <ListIconSet
                            onNumberClick={() => toggleListFormatHelper('subjective-notes-input', 'number', visit.subjectiveNotes || '', (v) => setVisit({ ...visit, subjectiveNotes: v }))}
                            onBulletClick={() => toggleListFormatHelper('subjective-notes-input', 'bullet', visit.subjectiveNotes || '', (v) => setVisit({ ...visit, subjectiveNotes: v }))}
                        />
                    </div>
                </div>
                <div className="p-4">
                    <TextArea
                        id="subjective-notes-input"
                        value={visit.subjectiveNotes || ''}
                        onChange={e => setVisit({ ...visit, subjectiveNotes: e.target.value })}
                        className="h-32 bg-slate-50 focus:bg-white transition-colors"
                        placeholder="請輸入本次治療主要訴求、症狀變化或特定不適..."
                    />
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-4"><Label>受傷部位清單 (Body Chart)</Label><button onClick={addVasEntry} className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-sm">+ 新增疼痛部位</button></div>
                
                {!visit.vasEntries?.length && (
                    <div 
                        onClick={addVasEntry} 
                        className="text-center py-6 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-row items-center justify-center gap-2"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary-300"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="font-bold text-slate-500">點擊新增疼痛部位卡片資料</span>
                    </div>
                )}

                <div className="space-y-6">
                    {visit.vasEntries?.map((entry, idx) => (
                        <div key={idx} className="bg-white rounded-xl border-2 border-slate-100 shadow-lg overflow-hidden relative">
                            {/* Header Card */}
                            <div onClick={() => setExpandedVasIndex(expandedVasIndex === idx ? null : idx)} className={`p-3 md:p-4 pr-12 md:pr-12 flex flex-col md:flex-row gap-3 cursor-pointer border-b transition-colors items-start md:items-center ${expandedVasIndex === idx ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto" onClick={e => e.stopPropagation()}>
                                    <div className="bg-slate-800 text-white w-8 h-10 flex items-center justify-center rounded font-bold shrink-0">{idx + 1}</div>
                                    
                                    <div className="flex flex-col gap-1 flex-1 md:w-64">
                                        <button 
                                            onClick={() => openPartModal(idx)}
                                            className={`w-full h-10 px-4 py-2 rounded-lg border bg-white text-sm font-bold text-left flex justify-between items-center transition-all ${entry.part === 'Other' ? 'border-indigo-400 ring-1 ring-indigo-100' : 'border-slate-200 shadow-sm'}`}
                                        >
                                            <span className={entry.part ? 'text-slate-800' : 'text-slate-400'}>
                                                {entry.part || '選擇部位...'}
                                            </span>
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                        
                                        {entry.part === 'Other' && (
                                            <div className="animate-fade-in">
                                                <input 
                                                    type="text"
                                                    placeholder="請輸入自定義部位..."
                                                    value={entry.customPart || ''}
                                                    onChange={e => updateVasEntry(idx, 'customPart', e.target.value)}
                                                    className="w-full px-3 py-2 h-9 rounded-lg border border-indigo-300 bg-indigo-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                                                    autoFocus
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <select 
                                        value={entry.side || ''} 
                                        onChange={e => updateVasEntry(idx, 'side', e.target.value)} 
                                        className="w-24 px-3 py-2 h-10 rounded-lg border border-slate-200 bg-white text-sm shadow-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    >
                                        <option value="" disabled>側別...</option>
                                        <option value="L">Left</option>
                                        <option value="R">Right</option>
                                        <option value="C">Center</option>
                                        <option value="B">Bilat.</option>
                                    </select>
                                </div>

                                <div className="flex-1 w-full flex items-center justify-between gap-3 px-2 mt-1 md:mt-0" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">NPRS</span>
                                        <input type="range" min="0" max="10" step="1" value={entry.value} onChange={e => updateVasEntry(idx, 'value', Number(e.target.value))} className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800 min-w-[60px]" />
                                        <div className={`w-6 text-center font-black text-xl ${entry.value > 7 ? 'text-red-600' : 'text-slate-700'}`}>{entry.value}</div>
                                    </div>
                                    
                                    {/* Expand/Collapse Chevron (SVG) */}
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); setExpandedVasIndex(expandedVasIndex === idx ? null : idx); }}
                                        className="text-slate-400 p-2 cursor-pointer hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
                                    >
                                        {expandedVasIndex === idx ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        )}
                                    </div>
                                </div>

                                <button onClick={(e) => { e.stopPropagation(); removeVasEntry(idx); }} className="absolute top-4 right-3 text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            {/* Expanded Content */}
                            {expandedVasIndex === idx && (
                                <div className="p-6 bg-white animate-fade-in space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                </div>
                                                <h4 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">Nature (性質與深度)</h4>
                                            </div>
                                            <div>
                                                <Label>Quality (疼痛性質)</Label>
                                                <ChipGroup multi variant="solid" options={PAIN_QUALITY_OPTIONS} value={entry.painTypes || []} onChange={v => updateVasEntry(idx, 'painTypes', v)} />
                                            </div>
                                            <div>
                                                <Label>Depth (深度)</Label>
                                                <div className="flex gap-2">
                                                    {['Superficial (表層)', 'Deep (深層)'].map(opt => (
                                                        <button key={opt} onClick={() => updateVasEntry(idx, 'depth', opt)} className={`flex-1 py-1.5 rounded text-xs border font-bold transition-all ${entry.depth === opt ? 'bg-slate-700 text-white border-slate-700 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{opt}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                </div>
                                                <h4 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">24h Pattern (行為模式)</h4>
                                            </div>
                                            <div>
                                                <Label>Behavior over day</Label>
                                                <ChipGroup multi variant="solid" options={PATTERN_24H_OPTIONS} value={entry.pattern24h ? entry.pattern24h.split(',') : []} onChange={v => updateVasEntry(idx, 'pattern24h', Array.isArray(v) ? v.join(',') : v)} />
                                            </div>
                                            <div>
                                                <Label>Stage / Stability</Label>
                                                <div className="flex gap-2">
                                                    <select className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold" value={entry.progression || ''} onChange={e => updateVasEntry(idx, 'progression', e.target.value)}><option value="">趨勢...</option><option value="Improving">Improving (改善)</option><option value="Worsening">Worsening (惡化)</option><option value="Stable">Stable (穩定)</option><option value="Volatile">Volatile (起伏)</option></select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Irritability (SIN) */}
                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 3.5 2.5 6 1.05 5.25-2.455 8-5 8Z"/><path d="M16.5 9.5c0 1.5-1 2.5-1.5 4a2.5 2.5 0 0 0 5 0c0-1.5-.5-2.5-1.5-4-1-1.5-1.5-2.5-1.5-3.5 0 1 0 2-.5 3.5Z"/></svg>
                                            </div>
                                            <h4 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">Irritability (易激惹性 P1/P2)</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label>Aggravating Factors (P - Provocation)</Label>
                                                <div className="mb-2"><ChipGroup multi variant="solid" options={AGGRAVATING_OPTIONS} value={entry.aggravating || []} onChange={v => updateVasEntry(idx, 'aggravating', v)} /></div>
                                                <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap">Time to onset (P1):</span><Input value={entry.timeToOnset || ''} onChange={e => updateVasEntry(idx, 'timeToOnset', e.target.value)} placeholder="Ex: 10 mins walking..." className="bg-white h-8 text-xs font-medium" /></div>
                                            </div>
                                            <div>
                                                <Label>Easing Factors (E - Palliation)</Label>
                                                <div className="mb-2"><ChipGroup multi variant="solid" options={EASING_OPTIONS} value={entry.easing || []} onChange={v => updateVasEntry(idx, 'easing', v)} /></div>
                                                <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap">Time to subside (Base):</span><Input value={entry.timeToSubside || ''} onChange={e => updateVasEntry(idx, 'timeToSubside', e.target.value)} placeholder="Ex: Immediate, 1 hour..." className="bg-white h-8 text-xs font-medium" /></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* History & Area */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div><Label>Onset (Mechanism)</Label><TextArea value={entry.mechanism || ''} onChange={e => updateVasEntry(idx, 'mechanism', e.target.value)} className="h-24 bg-slate-50 text-xs font-medium" placeholder="Trauma? Insidious?" /></div>
                                        <div><Label>Radiation (R)</Label><TextArea value={entry.radiation || ''} onChange={e => updateVasEntry(idx, 'radiation', e.target.value)} className="h-24 bg-slate-50 text-xs font-medium" placeholder="Dermatome pattern?" /></div>
                                        <div><Label>Associated (A)</Label><TextArea value={entry.associatedSx || ''} onChange={e => updateVasEntry(idx, 'associatedSx', e.target.value)} className="h-24 bg-slate-50 text-xs font-medium" placeholder="Numbness, Tingling, Weakness..." /></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Standardized Footer with Centered Back to Top */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 pt-8 mt-4 border-t border-slate-100">
                <div className="hidden md:block"></div>
                <div className="flex justify-center order-2 md:order-none">
                    <button onClick={scrollToTop} className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-50 px-4 py-2 rounded-full transition-colors">↑ 回到頂部</button>
                </div>
                <div className="flex justify-end order-1 md:order-none">
                    <Button onClick={() => goNext()} variant="secondary" className="!bg-slate-900 !text-white !border-slate-900 hover:!bg-slate-800 px-6 font-bold w-full md:w-auto shadow-md">Next: Objective {'>'}</Button>
                </div>
            </div>
        </div>
    );
};
