
import React, { useState } from 'react';
import { TherapistData, PostureGridData } from '../types';
import { categorizeOptions } from './EvalShared';
import { TextArea, Label } from './Input';

const POSTURE_SECTIONS = [
    { id: 'upper', label: 'Upper Quarter (上肢)', keys: ['scapula', 'humerus', 'radius', 'ulna', 'wristHand'] },
    { id: 'lower', label: 'Lower Quarter (下肢)', keys: ['femur', 'patella', 'tibia', 'fibulaHead', 'fibulaDistal', 'footAnkle'] },
    { id: 'spine', label: 'Spine & Trunk (中軸)', keys: ['head', 'cervical', 'thoracic', 'lumbar', 'ribs', 'ilium', 'sacrum'] }
];

const POSTURE_OPTIONS: Record<string, { label: string, options: string[] }> = {
    head: { label: 'Head', options: ['Neutral', 'Forward Head', 'Tilted L', 'Tilted R', 'Rotated L', 'Rotated R', 'Shift L', 'Shift R'] },
    cervical: { label: 'C-Spine', options: ['Neutral', 'Hyperlordosis', 'Straight/Flat', 'Kyphosis', 'Side Shift L', 'Side Shift R'] },
    scapula: { label: 'Scapula', options: ['Neutral L', 'Neutral R', 'Winging L', 'Winging R', 'Ant. Tilt L', 'Ant. Tilt R', 'Up. Rot. L', 'Up. Rot. R', 'Down. Rot. L', 'Down. Rot. R', 'Protracted L', 'Protracted R', 'Retracted L', 'Retracted R', 'Elevated L', 'Elevated R', 'Depressed L', 'Depressed R'] },
    humerus: { label: 'Humerus', options: ['Neutral L', 'Neutral R', 'Ant. Glide L', 'Ant. Glide R', 'Sup. Glide L', 'Sup. Glide R', 'Inf. Glide L', 'Inf. Glide R', 'Int. Rot. L', 'Int. Rot. R', 'Ext. Rot. L', 'Ext. Rot. R', 'Ant. Sublux L', 'Ant. Sublux R'] },
    radius: { label: 'Radius', options: ['Neutral L', 'Neutral R', 'Head Ant. L', 'Head Ant. R', 'Head Post. L', 'Head Post. R', 'Distal Ant. L', 'Distal Ant. R', 'Distal Post. L', 'Distal Post. R'] },
    ulna: { label: 'Ulna', options: ['Neutral L', 'Neutral R', 'Valgus L', 'Valgus R', 'Varus L', 'Varus R', 'Prox. Ant. L', 'Prox. Ant. R', 'Prox. Post. L', 'Prox. Post. R', 'Distal Ant. L', 'Distal Ant. R', 'Distal Post. L', 'Distal Post. R'] },
    wristHand: { label: 'Wrist/Hand', options: ['Neutral L', 'Neutral R', 'Flexed L', 'Flexed R', 'Extended L', 'Extended R', 'Ulnar Dev. L', 'Ulnar Dev. R', 'Radial Dev. L', 'Radial Dev. R', 'Carpal Ant. L', 'Carpal Ant. R'] },
    thoracic: { label: 'T-Spine', options: ['Neutral', 'Hyperkyphosis', 'Hyperlordosis', 'Flat', 'Scoliosis (Hump) L', 'Scoliosis (Hump) R'] },
    lumbar: { label: 'L-Spine', options: ['Neutral', 'Hyperlordosis', 'Hyperkyphosis', 'Flat', 'Scoliosis (Hump) L', 'Scoliosis (Hump) R', 'Step Deformity'] },
    ribs: { label: 'Ribs', options: ['Neutral L', 'Neutral R', 'Inhale Restrict L', 'Inhale Restrict R', 'Exhale Restrict L', 'Exhale Restrict R', 'Ant. Sublux L', 'Ant. Sublux R', 'Post. Sublux L', 'Post. Sublux R'] },
    ilium: { label: 'Ilium', options: ['Neutral L', 'Neutral R', 'Ant. Rot. L', 'Ant. Rot. R', 'Post. Rot. L', 'Post. Rot. R', 'Inflare L', 'Inflare R', 'Outflare L', 'Outflare R', 'Upslip L', 'Upslip R'] },
    sacrum: { label: 'Sacrum', options: ['Neutral', 'Nutated (Flex)', 'Counternutated (Ext)', 'L on L Torsion', 'R on R Torsion', 'L on R Torsion', 'R on L Torsion'] },
    femur: { label: 'Femur', options: ['Neutral L', 'Neutral R', 'Int. Rot. L', 'Int. Rot. R', 'Ext. Rot. L', 'Ext. Rot. R', 'Ant. Glide L', 'Ant. Glide R', 'Post. Glide L', 'Post. Glide R', 'Med. Glide L', 'Med. Glide R', 'Lat. Glide L', 'Lat. Glide R'] },
    patella: { label: 'Patella', options: ['Neutral L', 'Neutral R', 'Alta (High) L', 'Alta (High) R', 'Baja (Low) L', 'Baja (Low) R', 'Lat. Tilt L', 'Lat. Tilt R', 'Med. Tilt L', 'Med. Tilt R', 'Lat. Glide L', 'Lat. Glide R', 'Med. Glide L', 'Med. Glide R', 'Int. Rot (Squinting) L', 'Int. Rot (Squinting) R', 'Ext. Rot (Frog) L', 'Ext. Rot (Frog) R'] },
    tibia: { label: 'Tibia', options: ['Neutral L', 'Neutral R', 'Valgus (Bowing) L', 'Valgus (Bowing) R', 'Varus (Bowing) L', 'Varus (Bowing) R', 'Ext. Torsion L', 'Ext. Torsion R', 'Int. Torsion L', 'Int. Torsion R', 'Post. Sag L', 'Post. Sag R', 'Ant. Glide L', 'Ant. Glide R'] },
    fibulaHead: { label: 'Fibula Head', options: ['Neutral L', 'Neutral R', 'Ant. L', 'Ant. R', 'Post. L', 'Post. R', 'Sup. L', 'Sup. R', 'Inf. L', 'Inf. R'] },
    fibulaDistal: { label: 'Lat. Malleolus', options: ['Neutral L', 'Neutral R', 'Ant. L', 'Ant. R', 'Post. L', 'Post. R', 'Sup. L', 'Sup. R', 'Inf. L', 'Inf. R'] },
    footAnkle: { label: 'Foot/Ankle', options: ['Neutral L', 'Neutral R', 'Talus Ant. L', 'Talus Ant. R', 'Cal. Valgus L', 'Cal. Valgus R', 'Cal. Varus L', 'Cal. Varus R', 'Navi. Drop L', 'Navi. Drop R', 'Hallux Valgus L', 'Hallux Valgus R', 'Pes Planus L', 'Pes Planus R', 'Pes Cavus L', 'Pes Cavus R'] }
};

export const PostureScreening = ({ tData, setTData }: { tData: TherapistData; setTData: React.Dispatch<React.SetStateAction<TherapistData>> }) => {
    const [isPostureOpen, setIsPostureOpen] = useState(false);
    const [expandedPostureSections, setExpandedPostureSections] = useState<Record<string, boolean>>({});

    const updatePostureGrid = (key: keyof PostureGridData, value: string) => {
        setTData(prev => {
            const currentValues = prev.postureGrid?.[key] || [];
            const newValues = currentValues.includes(value) ? currentValues.filter(v => v !== value) : [...currentValues, value];
            return { ...prev, postureGrid: { ...prev.postureGrid, [key]: newValues.length > 0 ? newValues : undefined } };
        });
    };

    const ButtonOption = ({ opt, isSelected, onClick }: { opt: string, isSelected?: boolean, onClick: () => void, key?: React.Key }) => (
        <button
            onClick={onClick}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border 
            ${isSelected 
                ? 'bg-slate-800 text-white border-slate-900 shadow-md' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        >
            {opt}
        </button>
    );

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
                className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setIsPostureOpen(!isPostureOpen)}
            >
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-primary-500 rounded-full"></span>姿勢篩檢 (Posture Screening)
                </h4>
                <div className="text-slate-400 px-2">
                    <span className={`transition-transform inline-block duration-200 ${isPostureOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>
            </div>

            {isPostureOpen && (
                <div className="animate-fade-in">
                    <div className="divide-y divide-slate-100">
                        {POSTURE_SECTIONS.map((section) => (
                            <div key={section.id} className="bg-white">
                                <button
                                    type="button"
                                    onClick={() => setExpandedPostureSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <h5 className="text-sm font-black text-slate-600 uppercase tracking-widest">{section.label}</h5>
                                    <span className={`text-slate-400 transition-transform ${expandedPostureSections[section.id] ? 'rotate-180' : ''}`}>▼</span>
                                </button>

                                {expandedPostureSections[section.id] && (
                                    <div className="p-2 md:p-4 bg-slate-50/20 space-y-2 animate-fade-in">
                                        {section.keys.map((key) => {
                                            const { left, center, right } = categorizeOptions(POSTURE_OPTIONS[key].options);
                                            return (
                                                <div key={key} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 hover:border-slate-300 transition-all">
                                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_1fr] gap-3 items-start md:items-center">
                                                        <div className="md:col-start-2 md:row-start-1 flex flex-col items-center gap-2 pb-2 md:pb-0 border-b md:border-b-0 border-slate-100">
                                                            <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
                                                                {POSTURE_OPTIONS[key].label}
                                                            </span>
                                                            {center.length > 0 && (
                                                                <div className="flex flex-wrap justify-center gap-1">
                                                                    {center.map(opt => (
                                                                        <ButtonOption 
                                                                            key={opt.val} 
                                                                            opt={opt.display}
                                                                            isSelected={tData.postureGrid?.[key as keyof PostureGridData]?.includes(opt.val)}
                                                                            onClick={() => updatePostureGrid(key as keyof PostureGridData, opt.val)}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="md:col-start-1 md:row-start-1 flex flex-wrap justify-start md:justify-end gap-1.5 content-center">
                                                            {left.length > 0 ? left.map(opt => (
                                                                <ButtonOption 
                                                                    key={opt.val} 
                                                                    opt={opt.display}
                                                                    isSelected={tData.postureGrid?.[key as keyof PostureGridData]?.includes(opt.val)}
                                                                    onClick={() => updatePostureGrid(key as keyof PostureGridData, opt.val)}
                                                                />
                                                            )) : <span className="hidden md:block"></span>}
                                                        </div>
                                                        <div className="md:col-start-3 md:row-start-1 flex flex-wrap justify-start gap-1.5 content-center border-t md:border-t-0 border-dashed border-slate-100 pt-2 md:pt-0">
                                                            {right.length > 0 ? right.map(opt => (
                                                                <ButtonOption 
                                                                    key={opt.val} 
                                                                    opt={opt.display}
                                                                    isSelected={tData.postureGrid?.[key as keyof PostureGridData]?.includes(opt.val)}
                                                                    onClick={() => updatePostureGrid(key as keyof PostureGridData, opt.val)}
                                                                />
                                                            )) : <span className="hidden md:block"></span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                        <Label>姿勢備註 (Posture Notes)</Label>
                        <TextArea 
                            value={tData.obsPosture} 
                            onChange={e => setTData({ ...tData, obsPosture: e.target.value })} 
                            className="h-24 bg-white" 
                            placeholder="例：站立時重心明顯向左偏移，雙肩高度不對稱..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
