import React, { useState, useRef } from 'react';
import { Button } from './Input';

interface ExportActionHubProps {
  onExportDashboard: () => void;
  onExportReport: () => void;
  isExporting: boolean;
}

export const ExportActionHub: React.FC<ExportActionHubProps> = ({ 
  onExportDashboard, 
  onExportReport,
  isExporting 
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setShowExportMenu(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = window.setTimeout(() => {
        setShowExportMenu(false);
    }, 300);
  };

  return (
    /* 
       Fixed 定位，固定於右下角。
       z-index 設定為 50，確保在所有內容之上。
    */
    <div 
      className="fixed bottom-8 right-8 z-50 no-print flex justify-end transition-all duration-300 pointer-events-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative flex flex-col items-end pointer-events-auto">
        {/* 選單彈出：改為 origin-bottom-right 向左上方展開 */}
        {showExportMenu && (
            <div className="absolute bottom-full mb-3 right-0 flex flex-col gap-2 items-end animate-scale-in origin-bottom-right">
                
                {/* 1. Export Detailed Report (PDF) - Fixed Width w-40 (Narrower) */}
                <button 
                    onClick={() => { setShowExportMenu(false); onExportReport(); }}
                    className="w-40 flex items-center justify-center gap-2 bg-white text-slate-600 px-4 py-3 rounded-[2rem] text-xs font-black shadow-[0_10px_20px_rgba(0,0,0,0.15)] border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:scale-105 transition-all whitespace-nowrap group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-500 group-hover:text-white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span>匯出個案報告</span>
                </button>

                {/* 2. Export Dashboard (Image) - Fixed Width w-40 (Narrower) */}
                <button 
                    onClick={() => { setShowExportMenu(false); onExportDashboard(); }}
                    className="w-40 flex items-center justify-center gap-2 bg-white text-slate-600 px-4 py-3 rounded-[2rem] text-xs font-black shadow-[0_10px_20px_rgba(0,0,0,0.15)] border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:scale-105 transition-all whitespace-nowrap group"
                    disabled={isExporting}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-500 group-hover:text-white"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>匯出個案儀表板</span>
                </button>
            </div>
        )}
        
        {/* 主按鈕：右下角圓潤膠囊 (黑色風格) - Auto width */}
        <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className={`p-1.5 rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.25)] border border-white/20 backdrop-blur-lg transition-all duration-300 active:scale-90 hover:scale-105 bg-slate-900 text-white`}>
            <div className={`px-6 py-3 rounded-[1.7rem] text-xs font-black flex items-center gap-2`}>
                {isExporting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                )}
                <span>{isExporting ? '處理報告中...' : '匯出報告'}</span>
                <span className={`text-[9px] transition-transform duration-300 ${showExportMenu ? 'rotate-180 opacity-50' : 'opacity-40'}`}>▲</span>
            </div>
        </button>
      </div>
    </div>
  );
};