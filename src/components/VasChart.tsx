
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CaseRecord } from '../types';

export const VasChart = ({ records }: { records: CaseRecord[] }) => {
  if (!records || records.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 p-6 min-h-[300px]">
        <div className="text-4xl mb-3 opacity-30">📉</div>
        <p className="font-medium text-sm">尚無疼痛追蹤資料</p>
        <p className="text-xs opacity-70 mt-1">請在治療評估中新增紀錄</p>
      </div>
    );
  }

  const allParts = new Set<string>();
  
  const data = records.map((r, i) => {
    const entry: any = {
      name: `S${i + 1}`, 
      date: new Date(r.visitDate).toLocaleDateString(),
    };

    if (r.visit.vasEntries && r.visit.vasEntries.length > 0) {
      r.visit.vasEntries.forEach(v => {
        entry[v.part] = v.value;
        allParts.add(v.part);
      });
    } else if (r.visit.vasNow !== undefined) {
      entry['Pain'] = r.visit.vasNow;
      allParts.add('Pain');
    }

    return entry;
  });

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="h-full w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-1 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-5 bg-primary-500 rounded-full"></span>
          疼痛變化趨勢圖
        </h3>
        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded">VAS 0 - 10</span>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative">
        <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#64748b' }}
                dy={5}
                />
                <YAxis 
                domain={[0, 10]} 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                ticks={[0, 2, 4, 6, 8, 10]}
                />
                <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '11px' }}
                itemStyle={{ padding: 0 }}
                />
                <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ fontSize: '10px', fontWeight: 800, paddingTop: '10px' }} 
                    iconType="circle"
                />
                
                {Array.from(allParts).map((part, index) => (
                <Line 
                    key={part}
                    type="monotone" 
                    dataKey={part} 
                    name={part}
                    stroke={colors[index % colors.length]} 
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1, fill: '#fff', stroke: colors[index % colors.length] }} 
                    activeDot={{ r: 5, strokeWidth: 0 }} 
                    connectNulls
                />
                ))}
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
