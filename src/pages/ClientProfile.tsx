
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { Button, Input, Label, TextArea, ChipGroup } from '../components/Input';
import { ClientData, RED_FLAGS_LIST } from '../types';

const INITIAL_CLIENT: ClientData = {
  name: '', dob: '', gender: '', job: '', phone: '', email: '',
  chiefComplaint: '', mechanism: '', diagnosis: '',
  presentHistory: '', pastHistory: '', familyHistory: '', diseases: '', surgery: '', meds: '', specialInvestigation: '',
  generalHealth: '', weightLoss: false,
  smoking: '', alcohol: '', fitness: '',
  ergonomics: '', sleepQuality: '', sleepPosition: '', bedType: '', pillow: '', shoe: '', insole: '', sportLeisure: '',
  psychosocial: '', expectation: '', goals: '',
  redFlags: [], nightPain: false,
  painTypes: [], aggravating: [], easing: [], duration: '', irritability: '', pattern24h: '', radiation: '', associatedSx: '', progression: ''
};

// Red Flags Structure (Updated with Colored Icons)
const RED_FLAG_STRUCTURE = [
  {
    category: '1. 全身性病理與惡性腫瘤 (Systemic / Malignancy)',
    // Icon: Activity / Pulse - Rose Color
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    ),
    color: 'bg-rose-500',
    items: [
      { key: 'cancer', label: '癌症病史 (History of Cancer)', detail: '特別是近期五年內有轉移風險之癌種' },
      { key: 'weightLoss', label: '不明原因體重減輕', detail: '三個月內下降 >5% 體重且非計畫性' },
      { key: 'nightPain', label: '持續性夜間疼痛', detail: '休息或姿勢改變皆無法緩解之深層痛' },
      { key: 'fever', label: '持續發燒或夜間盜汗', detail: '可能指示系統性感染或炎性反應' }
    ]
  },
  {
    category: '2. 神經急症與脊髓受壓 (Neurological Emergencies)',
    // Icon: Zap / Nerve - Amber Color
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    ),
    color: 'bg-amber-500',
    items: [
      { key: 'saddle', label: '馬鞍區感覺異常', detail: '會陰或肛門周圍麻木、感覺減退 (CES 風險)' },
      { key: 'bowel', label: '大小便功能障礙', detail: '新發生的排尿困難、滯留或大便失禁' },
      { key: 'weakness', label: '漸進式或雙側無力', detail: '肌肉力量快速下降，影響行走穩定度' },
      { key: 'multilevel', label: '多節段神經症狀', detail: '非典型、跨節段的麻木或放射痛' }
    ]
  },
  {
    category: '3. 結構安全性與骨折 (Fracture / Structural)',
    // Icon: Shield / Structure - Orange Color
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
    color: 'bg-orange-500',
    items: [
      { key: 'trauma', label: '近期嚴重創傷史', detail: '高處墜落、車禍或骨質疏鬆者之跌倒' },
      { key: 'steroids', label: '長期使用類固醇', detail: '增加自發性脊椎壓縮骨折之風險' },
      { key: 'osteoporosis', label: '已知嚴重骨質疏鬆', detail: '具備脆弱性骨折之高度臨床風險' },
      { key: 'nonMechanical', label: '非機械性疼痛表現', detail: '症狀與動作負荷完全不符，全時段疼痛' }
    ]
  },
  {
    category: '4. 血管與循環風險 (Vascular / VBI)',
    // Icon: Droplet / Blood - Red Color
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2.69l5.74 5.88a6 6 0 0 1-8.48 8.48A6 6 0 0 1 5.53 9.43L12 2.69z"/></svg>
    ),
    color: 'bg-red-500',
    items: [
      { key: 'vbi', label: 'VBI 5D3N 症狀', detail: '頭暈、吞嚥困難、視力模糊、噁心 (頸部安全)' },
      { key: 'aaa', label: '腹部搏動性腫塊', detail: '伴隨背痛，需排除腹主動脈瘤 (AAA)' },
      { key: 'claudication', label: '間歇性跛行徵兆', detail: '行走距離受限，需區分血管性與神經性跛行' },
      { key: 'immune', label: '免疫系統抑制狀態', detail: '增加脊椎盤炎或硬膜外膿瘍之風險' }
    ]
  }
];

const SectionContainer = ({ children, title, icon, colorClass }: { children?: React.ReactNode, title: string, icon: React.ReactNode, colorClass: string }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${colorClass} text-white`}>
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{title.split('(')[0]}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title.split('(')[1]?.replace(')', '') || 'SECTION'}</p>
            </div>
        </div>
        {children}
    </div>
);

export const ClientProfile = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const { activeCase, createCase, updateClient, setActiveCaseId } = useApp();
  const [form, setForm] = useState<ClientData>(INITIAL_CLIENT);
  const [isRedFlagsOpen, setIsRedFlagsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeCase) {
      setForm({ ...INITIAL_CLIENT, ...activeCase.client });
    } else {
      setForm(INITIAL_CLIENT);
    }
  }, [activeCase]);

  const hasRedFlags = (form.redFlags && form.redFlags.length > 0) || form.nightPain || form.weightLoss;

  const update = (key: keyof ClientData, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const isSelected = (label: string, key?: string) => {
    if (key === 'nightPain') return form.nightPain;
    if (key === 'weightLoss') return form.weightLoss;
    return form.redFlags?.includes(label);
  };

  const handleToggle = (label: string, key?: string) => {
    if (key === 'nightPain') update('nightPain', !form.nightPain);
    else if (key === 'weightLoss') update('weightLoss', !form.weightLoss);
    else {
        const current = form.redFlags || [];
        if (current.includes(label)) update('redFlags', current.filter(f => f !== label));
        else update('redFlags', [...current, label]);
    }
  };

  const handleSave = async () => {
    if (!form.name) return alert("請輸入姓名");
    setIsSaving(true);
    try {
      if (!activeCase) {
        // Create new case
        const newId = await createCase(form);
        if(newId) {
            setActiveCaseId(newId);
            if (onNavigate) {
                // Ensure state update completes
                setTimeout(() => onNavigate('therapist'), 50);
            } else {
                alert("個案已建立！");
            }
        }
      } else {
        // Update existing case
        if (activeCase.id) {
           await updateClient(activeCase.id, form);
           if (onNavigate && !activeCase) { 
               // Logic: if it was a new case (but somehow has id?), nav. 
               // Actually if activeCase exists, we are editing.
               alert("個案資料更新成功！");
           } else if (!activeCase) {
               // Should not happen here
           } else {
               alert("個案資料更新成功！");
           }
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
        setIsSaving(false);
    }
  };

  const calculateAge = (dob: string) => {
    if(!dob) return '';
    const diff = Date.now() - new Date(dob).getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age > 0 ? age : 0;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-32">
        {/* Basic Information */}
        <SectionContainer 
            title="基本資料 (Basic Info)" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            colorClass="bg-blue-500"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div><Label>姓名</Label><Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="真實姓名 (健保卡)" className="bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl" /></div>
                <div><Label>生日 (Age: {calculateAge(form.dob)})</Label><Input type="date" value={form.dob} onChange={e => update('dob', e.target.value)} className="bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl" /></div>
                <div><Label>性別</Label><select className="w-full px-4 py-2.5 rounded-2xl border border-transparent bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none font-bold" value={form.gender} onChange={e => update('gender', e.target.value)}><option value="">請選擇</option><option value="男">男</option><option value="女">女</option><option value="其他">其他</option></select></div>
                <div><Label>職業</Label><Input value={form.job} onChange={e => update('job', e.target.value)} placeholder="工程師, 搬運工, 學生..." className="bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl" /></div>
                <div><Label>聯絡電話</Label><Input value={form.phone || ''} onChange={e => update('phone', e.target.value)} placeholder="09xx-xxx-xxx" className="bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl" /></div>
                <div><Label>電子郵件</Label><Input value={form.email || ''} onChange={e => update('email', e.target.value)} placeholder="name@domain.com" className="bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl" /></div>
            </div>
        </SectionContainer>

        {/* History */}
        <SectionContainer 
            title="主訴與病史 (History)" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
            colorClass="bg-purple-500"
        >
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="lg:col-span-2"><Label>主要問題 (Chief Complaint)</Label><TextArea value={form.chiefComplaint} onChange={e => update('chiefComplaint', e.target.value)} placeholder="主要疼痛部位、動作受限描述、困擾時間..." className="h-24 bg-slate-50 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl"/></div>
                    <div className="lg:col-span-2"><Label>醫師診斷 (Medical Diagnosis)</Label><TextArea value={form.diagnosis || ''} onChange={e => update('diagnosis', e.target.value)} placeholder="診斷證明書病名、ICD-10 代碼..." className="bg-slate-50 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                    <div><Label>現病史 (Present History)</Label><TextArea value={form.presentHistory} onChange={e => update('presentHistory', e.target.value)} placeholder="起因 (創傷/無)、發作時間、症狀變化 (變好/變壞)、已做過的處置..." className="bg-slate-50 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl h-32"/></div>
                    <div><Label>過去病史 (Past History)</Label><TextArea value={form.pastHistory || ''} onChange={e => update('pastHistory', e.target.value)} placeholder="既往舊傷、類似發作經驗、復發頻率..." className="bg-slate-50 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl h-32"/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><Label>系統性疾病</Label><Input value={form.diseases} onChange={e => update('diseases', e.target.value)} placeholder="高血壓, 糖尿病, 心臟病..." className="bg-slate-50 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl" /></div>
                    <div><Label>家族病史</Label><Input value={form.familyHistory || ''} onChange={e => update('familyHistory', e.target.value)} placeholder="遺傳疾病, 關節炎..." className="bg-slate-50 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl" /></div>
                    <div><Label>手術與外傷史</Label><Input value={form.surgery} onChange={e => update('surgery', e.target.value)} placeholder="手術名稱 (年份), 骨折/鋼釘植入..." className="bg-slate-50 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl"/></div>
                    <div><Label>藥物使用</Label><Input value={form.meds} onChange={e => update('meds', e.target.value)} placeholder="止痛藥, 肌肉鬆弛劑, 抗凝血劑..." className="bg-slate-50 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl" /></div>
                    <div className="md:col-span-2"><Label>影像檢查</Label><Input value={form.specialInvestigation} onChange={e => update('specialInvestigation', e.target.value)} placeholder="X-ray (骨折/退化), MRI (軟組織/椎間盤)..." className="bg-slate-50 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl" /></div>
                </div>
            </div>
        </SectionContainer>

        {/* Lifestyle */}
        <SectionContainer 
            title="生活型態 (Lifestyle)" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            colorClass="bg-emerald-500"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><Label>一般健康狀況</Label><Input value={form.generalHealth || ''} onChange={e => update('generalHealth', e.target.value)} placeholder="睡眠品質, 營養狀況, 壓力指數..." className="bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 rounded-2xl"/></div>
                    <div className="md:col-span-2"><Label>體能與運動習慣</Label><Input value={form.fitness || ''} onChange={e => update('fitness', e.target.value)} placeholder="運動頻率, 強度, 項目..." className="bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 rounded-2xl"/></div>
                    <div><Label>吸菸習慣</Label><Input value={form.smoking || ''} onChange={e => update('smoking', e.target.value)} placeholder="無 / 每日x包 / 已戒菸x年" className="bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 rounded-2xl"/></div>
                    <div><Label>飲酒習慣</Label><Input value={form.alcohol || ''} onChange={e => update('alcohol', e.target.value)} placeholder="無 / 偶爾 / 每日小酌" className="bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 rounded-2xl"/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><Label>工作環境/人體工學</Label><Input value={form.ergonomics} onChange={e => update('ergonomics', e.target.value)} placeholder="久坐, 需搬重物, 雙螢幕..." className="bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 rounded-2xl" /></div>
                    <div><Label>運動休閒/嗜好</Label><Input value={form.sportLeisure} onChange={e => update('sportLeisure', e.target.value)} placeholder="登山, 園藝, 樂器演奏..." className="bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 rounded-2xl" /></div>
                </div>
            </div>
        </SectionContainer>

        {/* Psycho & Goals */}
        <SectionContainer 
            title="心理與目標 (Psycho/Goals)" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
            colorClass="bg-teal-500"
        >
            <div className="space-y-6">
                <div><Label>心理社會因子 (Psychosocial Factors)</Label><Input value={form.psychosocial} onChange={e => update('psychosocial', e.target.value)} placeholder="焦慮, 憂鬱, 恐懼迴避信念 (FABQ), 災難化思考..." className="bg-slate-50 border-transparent focus:bg-white focus:border-teal-200 rounded-2xl"/></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>對治療的期待 (Expectations)</Label>
                        <TextArea 
                            value={form.expectation} 
                            onChange={e => update('expectation', e.target.value)} 
                            placeholder="希望能徒手治療? 害怕針灸? 預期多久會好? 只想學運動?" 
                            className="h-32 bg-slate-50 border-transparent focus:bg-white focus:border-teal-200 rounded-2xl"
                        />
                    </div>
                    <div>
                        <Label>功能性目標/願景 (Functional Goals)</Label>
                        <TextArea 
                            value={form.goals} 
                            onChange={e => update('goals', e.target.value)} 
                            placeholder="具體生活目標 (e.g. 能夠跑馬拉松, 抱小孩不痛, 恢復全蹲, 能夠安穩睡覺)..." 
                            className="h-32 bg-slate-50 border-transparent focus:bg-white focus:border-teal-200 rounded-2xl"
                        />
                    </div>
                </div>
            </div>
        </SectionContainer>
        
        {/* Red Flags Section */}
        <div className={`bg-white rounded-[2.5rem] border shadow-sm relative overflow-hidden transition-all duration-500 
            ${hasRedFlags ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'}`}
        >
            <button 
                type="button" 
                onClick={() => setIsRedFlagsOpen(!isRedFlagsOpen)} 
                className={`w-full text-left p-8 flex justify-between items-center transition-colors group ${hasRedFlags ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}
            >
                <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-colors ${hasRedFlags ? 'bg-red-600 animate-pulse' : 'bg-slate-300 group-hover:bg-red-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${hasRedFlags ? 'text-red-900' : 'text-slate-800'}`}>
                            安全性篩檢 (Red Flags)
                        </h3>
                        {hasRedFlags ? (
                            <span className="text-xs font-black uppercase text-red-600 tracking-widest mt-1 block">
                                ⚠️ High Clinical Risk Detected
                            </span>
                        ) : (
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                                Safety Screening Checklist
                            </span>
                        )}
                    </div>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isRedFlagsOpen ? 'bg-slate-200 rotate-180' : 'bg-slate-100'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-500"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </button>

            {isRedFlagsOpen && (
                <div className="p-8 pt-0 border-t border-slate-100 animate-fade-in space-y-10">
                    <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                        <div className="w-1.5 h-10 bg-slate-400 rounded-full"></div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            依據 IFOMPT 物理治療安全性篩檢指引：若勾選任一項目，請詳加詢問並考慮轉介相關專科。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                        {RED_FLAG_STRUCTURE.map((cat, catIdx) => (
                            <div key={catIdx} className="space-y-5">
                                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${cat.color} text-white`}>
                                        {cat.icon}
                                    </div>
                                    <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest leading-tight">{cat.category}</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {cat.items.map((item) => {
                                        const active = isSelected(item.label, item.key);
                                        return (
                                            <div 
                                                key={item.label}
                                                onClick={() => handleToggle(item.label, item.key)}
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none
                                                    ${active 
                                                        ? 'bg-slate-800 border-slate-800 shadow-xl transform scale-[1.02]' 
                                                        : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                                                        ${active ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-transparent'}`}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-bold tracking-tight mb-1 ${active ? 'text-white' : 'text-slate-800'}`}>
                                                            {item.label}
                                                        </div>
                                                        <div className={`text-[10px] font-medium leading-normal ${active ? 'text-slate-400' : 'text-slate-400'}`}>
                                                            {item.detail}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* 底部儲存膠囊 (黑色圓潤風格) - 尺寸縮小 */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 no-print flex justify-center w-full px-6 pointer-events-none">
            <button 
                type="button" 
                onClick={handleSave} 
                disabled={isSaving}
                className="pointer-events-auto p-1.5 rounded-[2rem] bg-slate-900 text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-90 transition-all duration-300"
            >
                <div className="px-8 py-3 rounded-[1.8rem] text-xs font-black flex items-center gap-2">
                    {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    )}
                    <span>{isSaving ? '處理中...' : (activeCase ? '儲存個案資料' : '儲存並開始評估')}</span>
                </div>
            </button>
        </div>
    </div>
  );
};
