
import React from 'react';
import { Button, Label, TextArea, Input, ChipGroup } from '../../components/Input';
import { ListIconSet, insertAtCursorHelper, toggleListFormatHelper } from '../../components/EvalShared';
import { TherapistData } from '../../types';

// Constants moved or imported
const SESSION_GOAL_OPTIONS = [
  '降低疼痛', '提升肌力', '提升肌耐力', '提升爆發力', '增加活動度', '提升穩定度', '提升平衡感', 
  '提升本體感覺', '提升控制能力', '提升自我覺察能力', '增加肌肉長度', '減少關節位移', 
  '優化動作軌道', '優化動作程式', '改善生活功能'
];

interface PlanProps {
    tData: TherapistData;
    setTData: React.Dispatch<React.SetStateAction<TherapistData>>;
    handleSave: () => void;
    scrollToTop: () => void;
}

export const PlanSection: React.FC<PlanProps> = ({ tData, setTData, handleSave, scrollToTop }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-8 animate-fade-in pb-10">
            {/* Header matching SOA style */}
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-bold text-slate-900">Plan (治療計畫)</h3>
            </div>
            
            {/* Intervention Section - Card Style matching Assessment components */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                    <h4 className="font-bold text-slate-700">介入與計畫 (Intervention)</h4>
                </div>
                
                <div className="p-4 space-y-6">
                    {/* Treatment Plan */}
                    <div className="space-y-2">
                        {/* Updated Header: Flex-col on mobile, right-aligned tools */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                            <Label>治療項目 (Clinic Treatment)</Label>
                            <div className="self-end sm:self-auto">
                                <ListIconSet 
                                    onNumberClick={() => toggleListFormatHelper('treatment-plan-input', 'number', tData.treatmentPlan, (val) => setTData({...tData, treatmentPlan: val}))}
                                    onBulletClick={() => toggleListFormatHelper('treatment-plan-input', 'bullet', tData.treatmentPlan, (val) => setTData({...tData, treatmentPlan: val}))}
                                />
                            </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                            {/* Quick Insert Chips */}
                            <div className="mb-2 pb-2 border-b border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">快速插入類別</span>
                                <ChipGroup 
                                    multi 
                                    variant="solid"
                                    options={['徒手治療', '運動治療', '儀器治療', '貼紮']} 
                                    value={[]} 
                                    onChange={(v) => { 
                                        const toAdd = Array.isArray(v) ? v[v.length-1] : v; 
                                        if (toAdd) {
                                            insertAtCursorHelper('treatment-plan-input', `${toAdd}：`, tData.treatmentPlan, (val) => setTData({...tData, treatmentPlan: val}));
                                        }
                                    }} 
                                />
                            </div>
                            <TextArea 
                                id="treatment-plan-input"
                                value={tData.treatmentPlan} 
                                onChange={e => setTData({...tData, treatmentPlan: e.target.value})} 
                                className="bg-transparent border-none p-0 h-48 text-sm leading-relaxed font-medium focus:ring-0 shadow-none resize-none" 
                                placeholder="請輸入詳細治療內容..." 
                            />
                        </div>
                    </div>

                    {/* Home Exercise */}
                    <div className="space-y-2">
                        {/* Updated Header: Flex-col on mobile, right-aligned tools */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                             <Label>居家運動 (Home Exercise)</Label>
                             <div className="self-end sm:self-auto">
                                <ListIconSet 
                                    onNumberClick={() => toggleListFormatHelper('home-ex-input', 'number', tData.homeEx, (val) => setTData({...tData, homeEx: val}))}
                                    onBulletClick={() => toggleListFormatHelper('home-ex-input', 'bullet', tData.homeEx, (val) => setTData({...tData, homeEx: val}))}
                                />
                            </div>
                        </div>
                        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                            <TextArea 
                                id="home-ex-input"
                                value={tData.homeEx} 
                                onChange={e => setTData({...tData, homeEx: e.target.value})} 
                                className="bg-white h-24 border-none rounded-lg text-sm leading-relaxed font-medium focus:ring-0 shadow-none" 
                                placeholder="伸展、肌力、核心訓練..." 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Goals Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                    <h4 className="font-bold text-slate-700">治療目標 (Goals Setting)</h4>
                </div>

                <div className="p-4 space-y-6">
                    <div>
                        <Label>本期目標 (Session Goals)</Label>
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 mt-1">
                            <ChipGroup multi variant="solid" options={SESSION_GOAL_OPTIONS} value={tData.sessionGoals || []} onChange={v => setTData({...tData, sessionGoals: v})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>短程目標 (Short Term)</Label>
                            <TextArea 
                                value={tData.shortTermGoals || ''} 
                                onChange={e => setTData({...tData, shortTermGoals: e.target.value})} 
                                className="bg-white h-24 border-slate-200 focus:border-emerald-300 focus:ring-emerald-100 rounded-xl"
                                placeholder="預計 2-4 週內達成..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>長程目標 (Long Term)</Label>
                            <TextArea 
                                value={tData.longTermGoals || ''} 
                                onChange={e => setTData({...tData, longTermGoals: e.target.value})} 
                                className="bg-white h-24 border-slate-200 focus:border-emerald-300 focus:ring-emerald-100 rounded-xl"
                                placeholder="預計 3 個月內達成，或功能性目標..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Follow-up Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                    <h4 className="font-bold text-slate-700">後續追蹤 (Follow-up)</h4>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>下次追蹤重點</Label>
                        <Input 
                            value={tData.followUp} 
                            onChange={e => setTData({...tData, followUp: e.target.value})} 
                            placeholder="確認動作控制與自我居家運動執行狀況..." 
                            className="bg-white border-slate-200 focus:border-purple-300 focus:ring-purple-100 h-11 rounded-xl" 
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>下次預約日期 (Next Appointment)</Label>
                        <Input 
                            type="date" 
                            value={tData.nextAppointment || ''} 
                            onChange={e => setTData({...tData, nextAppointment: e.target.value})}
                            className="bg-white border-slate-200 focus:border-purple-300 focus:ring-purple-100 h-11 rounded-xl font-bold text-slate-700"
                        />
                    </div>
                </div>
            </div>

            {/* Standardized Footer with Centered Back to Top matching Assessment style */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 pt-8 mt-4 border-t border-slate-100">
                <div className="hidden md:block"></div>
                <div className="flex justify-center order-2 md:order-none">
                    <button onClick={scrollToTop} className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-50 px-4 py-2 rounded-full transition-colors">↑ 回到頂部</button>
                </div>
                <div className="hidden md:block order-1 md:order-none"></div>
            </div>

            {/* 底部儲存膠囊 (黑色圓潤風格 - 統一樣式) */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 no-print flex justify-center w-full px-6 pointer-events-none">
                <button 
                    type="button" 
                    onClick={handleSave} 
                    className="pointer-events-auto p-1.5 rounded-[2rem] bg-slate-900 text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-90 transition-all duration-300"
                >
                    <div className="px-8 py-3 rounded-[1.8rem] text-xs font-black flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        <span>儲存本次療程</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
