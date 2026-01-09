import React from 'react';

interface SoapNavigationProps {
  activeTab: 'S' | 'O' | 'A' | 'P';
  onTabChange: (tab: 'S' | 'O' | 'A' | 'P') => void;
}

export const SoapNavigation: React.FC<SoapNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'S', label: 'Subjective' },
    { id: 'O', label: 'Objective' },
    { id: 'A', label: 'Assessment' },
    { id: 'P', label: 'Plan' }
  ];

  return (
    <div className="flex justify-center no-print px-4">
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-white/50 ring-1 ring-black/5 flex gap-1 w-full max-w-2xl pointer-events-auto">
            {tabs.map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => onTabChange(tab.id as any)} 
                    className={`
                        flex-1 px-2 py-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center leading-none
                        ${activeTab === tab.id 
                            ? 'bg-slate-900 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}
                    `}
                >
                    {/* 代號 (S, O, A, P) */}
                    <span className="text-sm font-black tracking-tighter">{tab.id}</span>
                    
                    {/* 文字部分：手機版隱藏，桌面版顯示 | 名稱 */}
                    <span className="hidden sm:inline-flex items-center ml-2 overflow-hidden">
                        <span className="opacity-30 font-light mr-2">|</span>
                        <span className="truncate">{tab.label}</span>
                    </span>
                </button>
            ))}
        </div>
    </div>
  );
};