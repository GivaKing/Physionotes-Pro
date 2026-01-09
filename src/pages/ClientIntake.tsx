import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { ClientDashboard } from './ClientDashboard';
import { ClientProfile } from './ClientProfile';

interface ClientIntakeProps {
    onNavigate?: (tab: string) => void;
}

export const ClientIntake: React.FC<ClientIntakeProps> = ({ onNavigate }) => {
  const { activeCase } = useApp();
  const [tab, setTab] = useState<'overview' | 'profile'>('overview');

  useEffect(() => {
    if (activeCase) {
      setTab('overview'); 
    } else {
      setTab('profile'); 
    }
  }, [activeCase]);

  if (!activeCase) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">新增個案資料</h2>
        </div>
        <ClientProfile onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* 
        Independent Floating Mode Switcher
        Sticky positioning starts below the mobile header (64px) or at top for desktop (4)
      */}
      <div className="sticky top-[64px] md:top-4 z-40 flex justify-center no-print px-4 sm:px-0 transition-all duration-300">
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-white/50 ring-1 ring-black/5 flex gap-1 animate-scale-in w-full sm:w-auto max-w-md mx-auto">
          <button 
            onClick={() => setTab('overview')} 
            className={`flex-1 sm:flex-initial px-4 sm:px-8 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-300 flex items-center justify-center gap-2
            ${tab === 'overview' 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span className="whitespace-nowrap">個案儀表板</span>
          </button>
          <button 
            onClick={() => setTab('profile')} 
            className={`flex-1 sm:flex-initial px-4 sm:px-8 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-300 flex items-center justify-center gap-2
            ${tab === 'profile' 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span className="whitespace-nowrap">詳細病歷資料</span>
          </button>
        </div>
      </div>

      <div className="mt-2">
        {tab === 'overview' ? (
            <ClientDashboard />
        ) : (
            <ClientProfile onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
};