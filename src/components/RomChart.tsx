
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { CaseRecord, ROM_OPTIONS } from '../types';

export const RomChart = ({ records }: { records: CaseRecord[] }) => {
  const [selectedJoint, setSelectedJoint] = useState<string>('Shoulder (肩膀)');
  const [selectedMove, setSelectedMove] = useState<string>('Flexion');
  // Fix: Added viewMode state to support the nested AROM/PROM data structure defined in RomJointData
  const [viewMode, setViewMode] = useState<'arom' | 'prom'>('arom');

  const availableJoints = useMemo(() => {
    const set = new Set<string>();
    Object.keys(ROM_OPTIONS).forEach(j => set.add(j));
    records.forEach(r => {
      if (r.therapist.rom) {
        Object.keys(r.therapist.rom).forEach(j => set.add(j));
      }
    });
    return Array.from(set);
  }, [records]);

  const availableMoves = useMemo(() => {
    if (ROM_OPTIONS[selectedJoint]) return Object.keys(ROM_OPTIONS[selectedJoint]);
    const set = new Set<string>();
    records.forEach(r => {
        const jointData = r.therapist.rom?.[selectedJoint];
        if (jointData) Object.keys(jointData).forEach(m => set.add(m));
    });
    return Array.from(set).length > 0 ? Array.from(set) : ['Flexion']; 
  }, [selectedJoint, records]);

  React.useEffect(() => {
    if (!availableMoves.includes(selectedMove)) {
        setSelectedMove(availableMoves[0] || '');
    }
  }, [selectedJoint, availableMoves]);

  const chartData = useMemo(() => {
    return records.map((r, i) => {
      const romVal = r.therapist.rom?.[selectedJoint]?.[selectedMove];
      
      const parse = (val: string | undefined) => {
        if (!val) return null;
        
        // 1. Try comma
        if (val.includes(',')) {
            const parts = val.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
            return parts.length > 0 ? Math.max(...parts) : null;
        }

        // 2. Legacy Hyphen Parsing fix
        const matches = val.match(/-?[\d\.]+/g);
        if (matches && matches.length >= 2) {
             let v2 = parseFloat(matches[1]);
             // If string is "0-150" but NOT "0--150", v2 was wrongly parsed as -150. Fix it.
             if (v2 < 0 && !val.includes('--')) {
                 v2 = Math.abs(v2);
             }
             matches[1] = String(v2);
        }

        const nums = matches?.map(Number).filter(n => !isNaN(n));
        return (nums && nums.length > 0) ? Math.max(...nums) : null;
      };

      // Fix: Access nested arom/prom objects based on current viewMode; falls back to romVal for legacy flat data
      const actual = romVal ? (romVal as any)[viewMode] || (romVal as any) : null;

      return {
        name: `S${i + 1}`,
        date: new Date(r.visitDate).toLocaleDateString(),
        L: parse(actual?.l),
        R: parse(actual?.r),
      };
    });
  }, [records, selectedJoint, selectedMove, viewMode]);

  const normalRange = ROM_OPTIONS[selectedJoint]?.[selectedMove];
  const normalValue = normalRange ? normalRange[1] : null;

  if (!records || records.length === 0) return null;

  return (
    <div className="h-96 w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
           <span className="w-2 h-5 bg-purple-500 rounded-full"></span>
           ROM 角度變化追蹤
        </h3>
        
        <div className="flex gap-2 items-center">
            {/* Fix: Added AROM/PROM toggle buttons consistent with RomOverviewChart */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg mr-2">
                <button onClick={() => setViewMode('arom')} className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${viewMode === 'arom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>AROM</button>
                <button onClick={() => setViewMode('prom')} className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${viewMode === 'prom' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>PROM</button>
            </div>
            <select 
                value={selectedJoint} 
                onChange={e => setSelectedJoint(e.target.value)}
                className="text-xs border-slate-200 rounded-lg py-1 px-2 bg-slate-50 focus:ring-2 focus:ring-purple-200 outline-none"
            >
                {availableJoints.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            <select 
                value={selectedMove} 
                onChange={e => setSelectedMove(e.target.value)}
                className="text-xs border-slate-200 rounded-lg py-1 px-2 bg-slate-50 focus:ring-2 focus:ring-purple-200 outline-none"
            >
                {availableMoves.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative">
        <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                />
                <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 'auto']}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ top: -10 }} />
                
                {normalValue !== null && (
                    <ReferenceLine y={normalValue} stroke="#cbd5e1" strokeDasharray="5 5" label={{ value: `Norm: ${normalValue}°`, position: 'right', fontSize: 10, fill: '#94a3b8' }} />
                )}

                <Line type="monotone" dataKey="L" stroke={viewMode === 'arom' ? "#3b82f6" : "#10b981"} strokeWidth={3} dot={{r:4}} name={`Left (${viewMode.toUpperCase()})`} connectNulls />
                <Line type="monotone" dataKey="R" stroke={viewMode === 'arom' ? "#ef4444" : "#f59e0b"} strokeWidth={3} dot={{r:4}} name={`Right (${viewMode.toUpperCase()})`} connectNulls />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
