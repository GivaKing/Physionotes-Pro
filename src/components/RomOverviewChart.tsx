
import React, { useState, useMemo, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CaseRecord, ROM_OPTIONS } from '../types';

export const RomOverviewChart = ({ records, initialComplaint }: { records: CaseRecord[], initialComplaint?: string }) => {
  const latestRecord = records[records.length - 1];
  
  const presentJoints = latestRecord?.therapist?.rom ? Object.keys(latestRecord.therapist.rom) : [];
  const defaultJoint = presentJoints.length > 0 ? presentJoints[0] : 'Shoulder (肩膀)';
  
  const [selectedJoint, setSelectedJoint] = useState<string>(defaultJoint);
  const [viewMode, setViewMode] = useState<'arom' | 'prom'>('arom');

  useEffect(() => {
    if (initialComplaint) {
        const text = (initialComplaint || '').toLowerCase();
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
    Object.keys(ROM_OPTIONS).forEach(j => set.add(j));
    if (latestRecord?.therapist?.rom) {
       Object.keys(latestRecord.therapist.rom).forEach(j => set.add(j));
    }
    return Array.from(set);
  }, [latestRecord]);

  const data = useMemo(() => {
    const jointData = latestRecord?.therapist?.rom?.[selectedJoint];
    const standardData = ROM_OPTIONS[selectedJoint]; 
    
    const allMovements = new Set([
        ...Object.keys(standardData || {}),
        ...Object.keys(jointData || {})
    ]);

    return Array.from(allMovements).map(move => {
      const moveData = jointData?.[move];
      let actual: { l: string, r: string } = { l: '', r: '' };
      
      if (moveData) {
          if ((moveData as any)[viewMode]) {
              actual = (moveData as any)[viewMode];
          } else if ((moveData as any).l !== undefined) {
              if (viewMode === 'arom') actual = moveData as any;
          }
      }

      const normRange = standardData?.[move];
      const norm = normRange ? normRange[1] : 100;

      const parse = (val: string | undefined) => {
        if (!val) return 0;
        if (val.includes(',')) {
            const parts = val.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
            return parts.length > 0 ? Math.max(...parts) : 0;
        }
        const matches = val.match(/-?[\d\.]+/g);
        if (matches && matches.length >= 2) {
             let v2 = parseFloat(matches[1]);
             if (v2 < 0 && !val.includes('--')) { v2 = Math.abs(v2); }
             matches[1] = String(v2);
        }
        const nums = matches?.map(Number).filter(n => !isNaN(n));
        return (nums && nums.length > 0) ? Math.max(...nums) : 0;
      };

      return {
        subject: move,
        L: parse(actual?.l),
        R: parse(actual?.r),
        Norm: norm
      };
    });
  }, [selectedJoint, latestRecord, viewMode]);

  if (!records || records.length === 0) return null;

  return (
    <div className="h-full w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-2 shrink-0 z-10 gap-2">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
           <span className="w-2 h-5 bg-purple-500 rounded-full"></span>
           ROM 關節活動度總覽
        </h3>
        
        <div className="flex flex-col gap-1.5 items-end">
            <select 
                value={selectedJoint} 
                onChange={e => setSelectedJoint(e.target.value)}
                className="text-[11px] border-slate-200 rounded-lg py-1 px-2 bg-slate-50 focus:ring-2 focus:ring-purple-200 outline-none w-auto max-w-[150px] truncate shadow-sm font-bold"
            >
                {availableJoints.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            <div className="flex bg-slate-100 p-0.5 rounded-lg shadow-inner">
                <button onClick={() => setViewMode('arom')} className={`px-2 py-0.5 text-[9px] font-black rounded-md transition-all ${viewMode === 'arom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>AROM</button>
                <button onClick={() => setViewMode('prom')} className={`px-2 py-0.5 text-[9px] font-black rounded-md transition-all ${viewMode === 'prom' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>PROM</button>
            </div>
        </div>
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
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
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
                    <Radar name="Normal" dataKey="Norm" stroke="#cbd5e1" strokeDasharray="3 3" fill="#f1f5f9" fillOpacity={0.5} />
                    <Radar name={`Left (${viewMode.toUpperCase()})`} dataKey="L" stroke={viewMode === 'arom' ? "#3b82f6" : "#10b981"} strokeWidth={2.5} fill={viewMode === 'arom' ? "#3b82f6" : "#10b981"} fillOpacity={0.15} />
                    <Radar name={`Right (${viewMode.toUpperCase()})`} dataKey="R" stroke={viewMode === 'arom' ? "#ef4444" : "#f59e0b"} strokeWidth={2.5} fill={viewMode === 'arom' ? "#ef4444" : "#f59e0b"} fillOpacity={0.15} />
                </RadarChart>
                </ResponsiveContainer>
            </div>
        )}
      </div>
    </div>
  );
};
