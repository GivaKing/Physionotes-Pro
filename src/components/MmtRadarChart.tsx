
import React, { useState, useMemo, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CaseRecord, MMT_OPTIONS } from '../types';

export const MmtRadarChart = ({ records, initialComplaint }: { records: CaseRecord[], initialComplaint?: string }) => {
  const latestRecord = records[records.length - 1];
  
  const presentJoints = latestRecord?.therapist?.mmt ? Object.keys(latestRecord.therapist.mmt) : [];
  const defaultJoint = presentJoints.length > 0 ? presentJoints[0] : 'Shoulder (肩膀)';
  
  const [selectedJoint, setSelectedJoint] = useState<string>(defaultJoint);

  useEffect(() => {
    if (initialComplaint) {
        const text = initialComplaint.toLowerCase();
        if (text.includes('shoulder') || text.includes('肩')) setSelectedJoint('Shoulder (肩膀)');
        else if (text.includes('knee') || text.includes('膝')) setSelectedJoint('Knee (膝蓋)');
        else if (text.includes('hip') || text.includes('髖')) setSelectedJoint('Hip (髖關節)');
        else if (text.includes('ankle') || text.includes('foot') || text.includes('踝') || text.includes('足')) setSelectedJoint('Ankle (腳踝)');
        else if (text.includes('wrist') || text.includes('手腕')) setSelectedJoint('Wrist (手腕)');
        else if (text.includes('elbow') || text.includes('肘')) setSelectedJoint('Elbow (手肘)');
        else if (text.includes('cervical') || text.includes('neck') || text.includes('頸')) setSelectedJoint('Cervical (頸椎)');
        else if (text.includes('lumbar') || text.includes('back') || text.includes('腰')) setSelectedJoint('Lumbar (腰椎)');
    }
  }, [initialComplaint]);

  const availableJoints = useMemo(() => {
    const set = new Set<string>();
    Object.keys(MMT_OPTIONS).forEach(j => set.add(j));
    if (latestRecord?.therapist?.mmt) {
       Object.keys(latestRecord.therapist.mmt).forEach(j => set.add(j));
    }
    return Array.from(set);
  }, [latestRecord]);

  const data = useMemo(() => {
    const jointData = latestRecord?.therapist?.mmt?.[selectedJoint];
    const movements = MMT_OPTIONS[selectedJoint] || (jointData ? Object.keys(jointData) : []);
    
    return movements.map(move => {
      const actual = jointData?.[move] || { l: 5, r: 5 };
      return {
        subject: move,
        L: actual.l,
        R: actual.r,
        Norm: 5
      };
    });
  }, [selectedJoint, latestRecord]);

  if (!records || records.length === 0) return null;

  return (
    <div className="h-full w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-2 shrink-0 z-10 gap-2">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
           <span className="w-2 h-5 bg-orange-500 rounded-full"></span>
           MMT 肌力總覽
        </h3>
        
        <select 
            value={selectedJoint} 
            onChange={e => setSelectedJoint(e.target.value)}
            className="text-[11px] font-bold border-slate-200 rounded-lg py-1 px-2 bg-slate-50 focus:ring-2 focus:ring-orange-200 outline-none max-w-[130px] truncate shadow-sm"
        >
            {availableJoints.map(j => <option key={j} value={j}>{j}</option>)}
        </select>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative">
        {data.length === 0 ? (
             <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">無此部位數據</div>
        ) : (
            <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="45%" outerRadius="60%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 700, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px', fontWeight: 800, paddingTop: '10px' }}
                    />
                    <Radar name="Normal (5)" dataKey="Norm" stroke="#cbd5e1" strokeDasharray="3 3" fill="#f1f5f9" fillOpacity={0.3} />
                    <Radar name="Left" dataKey="L" stroke="#3b82f6" strokeWidth={2.5} fill="#3b82f6" fillOpacity={0.15} />
                    <Radar name="Right" dataKey="R" stroke="#ef4444" strokeWidth={2.5} fill="#ef4444" fillOpacity={0.15} />
                </RadarChart>
                </ResponsiveContainer>
            </div>
        )}
      </div>
    </div>
  );
};
