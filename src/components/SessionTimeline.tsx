import React, { useEffect, useRef, useState } from 'react';
import { PatientCase } from '../types';

interface SessionTimelineProps {
    records: PatientCase['records'];
    selectedRecordId: string | null;
    onSelectRecord: (id: string | null) => void;
    onDeleteRecord: (e: React.MouseEvent, id: string) => void;
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({ 
    records = [], 
    selectedRecordId, 
    onSelectRecord, 
    onDeleteRecord 
}) => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const prevCountRef = useRef(records.length);
    const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    // 強制捲動到最右側的函式 (Robust Scroll Logic)
    const scrollToRight = (behavior: ScrollBehavior = 'auto') => {
        if (timelineRef.current) {
            timelineRef.current.scrollTo({
                left: timelineRef.current.scrollWidth,
                behavior: behavior
            });
        }
    };

    useEffect(() => {
        const el = timelineRef.current;
        if (!el) return;

        // 判斷是新增資料還是初始載入/切換頁面
        if (records.length > prevCountRef.current) {
             // 新增資料時：延遲一下等待渲染，然後平滑捲動
             setTimeout(() => scrollToRight('smooth'), 100);
        } else {
            // 初始載入或資料更新時：立刻瞬移到最右側 (多重保險)
            scrollToRight('auto');
            setTimeout(() => scrollToRight('auto'), 50);
            requestAnimationFrame(() => scrollToRight('auto'));
        }
        prevCountRef.current = records.length;

        // 觸發卷軸顯示邏輯
        handleMouseEnter();
        handleMouseLeave();
    }, [records.length, records]); 

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsScrollbarVisible(true);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            setIsScrollbarVisible(false);
        }, 2000); 
    };

    return (
        <div className="w-full border-b border-slate-100 pb-2 mb-1">
            <style>{`
                .session-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .session-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .session-scrollbar::-webkit-scrollbar-thumb {
                    background-color: transparent;
                    border-radius: 10px;
                    border: 2px solid transparent; 
                    background-clip: content-box;
                }
                .session-scrollbar.visible::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1; /* slate-300 */
                }
                .session-scrollbar.visible::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8; /* slate-400 */
                }
            `}</style>

            {/* Scroll Container - Removed scroll-smooth class to allow instant snapping */}
            <div 
                ref={timelineRef} 
                className={`w-full overflow-x-auto py-2 px-2 session-scrollbar ${isScrollbarVisible ? 'visible' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleMouseEnter}
                onTouchEnd={handleMouseLeave}
            >
                {/* 
                   Alignment Wrapper: 
                   - justify-start: 內容靠左排列 (Left Aligned)
                   - w-max: 允許內容寬度超過視窗，產生捲軸
                */}
                <div className="flex items-center justify-start gap-3 w-max">
                    {records.map((r, i) => (
                        <div key={r.id || i} className="relative group shrink-0">
                            <button 
                                onClick={() => onSelectRecord(r.id!)} 
                                className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all border-2 relative z-10 
                                ${selectedRecordId === r.id 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'}`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">S{i + 1}</span>
                                <span className="text-[11px] font-bold font-mono">{new Date(r.visitDate).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}</span>
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={(e) => onDeleteRecord(e, r.id!)} 
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-red-500 border border-red-100 rounded-full flex items-center justify-center cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transform hover:scale-110 transition-all z-20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ))}
                    
                    {records.length > 0 && <div className="w-px h-8 bg-slate-200 shrink-0 mx-1"></div>}
                    
                    <div className="shrink-0 pr-1">
                        <button 
                            onClick={() => onSelectRecord(null)} 
                            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all border-2 border-dashed 
                            ${!selectedRecordId 
                                ? 'bg-primary-50 border-primary-500 text-primary-600 shadow-md scale-105' 
                                : 'bg-white border-slate-300 text-slate-300 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50'}`}
                            title="新增療程"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            <span className="text-[9px] font-black uppercase mt-0.5">NEW</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};