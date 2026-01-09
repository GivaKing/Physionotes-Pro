
import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Shared UI Components ---

export const DualRangeSlider = ({ min, max, valueStr, onChange, trackColor = 'bg-primary-500' }: { min: number; max: number; valueStr: string; onChange: (val: string) => void; trackColor?: string }) => {
    const rangeSize = max - min;
    const isZeroNorm = rangeSize < 5; 
    const buffer = isZeroNorm ? 15 : 10;
    const visualMin = min - buffer; 
    const visualMax = max + buffer; 

    const parse = useCallback((str: string): [number, number] => {
        if (!str) return [min, max]; 
        if (str.includes(',')) {
            const parts = str.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
            if (parts.length >= 2) return [Math.min(parts[0], parts[1]), Math.max(parts[0], parts[1])];
        }
        const matches = str.match(/-?[\d\.]+/g);
        if (matches && matches.length >= 2) {
            const v1 = parseFloat(matches[0]);
            let v2 = parseFloat(matches[1]);
            if (v2 < 0 && !str.includes('--')) v2 = Math.abs(v2);
            return [Math.min(v1, v2), Math.max(v1, v2)];
        }
        const num = parseFloat(str);
        if (!isNaN(num)) return [0, num];
        return [min, max];
    }, [min, max]);

    const [handles, setHandles] = useState<[number, number]>(parse(valueStr));
    const isDragging = useRef<boolean>(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isDragging.current) setHandles(parse(valueStr));
    }, [valueStr, parse]);

    const updatePosition = (clientX: number, index: 0 | 1) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        const newValue = Math.round(visualMin + percentage * (visualMax - visualMin));
        setHandles(prev => {
            const next = [...prev] as [number, number];
            next[index] = newValue;
            const sorted = [next[0], next[1]].sort((a, b) => a - b);
            onChange(`${sorted[0]},${sorted[1]}`);
            return next;
        });
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, index: 0 | 1) => {
        if (e.type === 'mousedown') e.preventDefault(); 
        isDragging.current = true;
        const moveHandler = (ev: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
            updatePosition(clientX, index);
        };
        const upHandler = () => {
            isDragging.current = false;
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', upHandler);
        };
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
        document.addEventListener('touchmove', moveHandler);
        document.addEventListener('touchend', upHandler);
    };

    const sortedHandles = [...handles].sort((a, b) => a - b);
    const valStart = sortedHandles[0];
    const valEnd = sortedHandles[1];
    const getPercent = (val: number) => {
        const p = ((val - visualMin) / (visualMax - visualMin)) * 100;
        return Math.max(0, Math.min(100, p));
    };
    const leftP = getPercent(valStart);
    const rightP = getPercent(valEnd);
    const normLeft = getPercent(min);
    const normWidth = isZeroNorm ? 0 : getPercent(max) - normLeft;

    // Updated Premium Handle Style: Smaller (w-4 h-4), cleaner shadow
    const handleStyle = "absolute w-4 h-4 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-slate-200 cursor-grab active:cursor-grabbing z-10 flex items-center justify-center hover:scale-110 active:scale-105 transition-transform duration-200 hover:border-slate-300";

    return (
        <div className="w-full select-none pt-2.5 pb-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-600 font-mono mb-1 px-0.5 tracking-tight opacity-90">
                 <span>{valStart}°</span>
                 <span>{valEnd}°</span>
            </div>
            <div className="relative h-5 w-full flex items-center touch-none group" ref={sliderRef}>
                {/* Track Background */}
                <div className="absolute w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    {/* Normal Range Indicator (Background) */}
                    {isZeroNorm ? (
                         <div className="absolute h-full w-0.5 bg-slate-400/50 z-0" style={{ left: `${normLeft}%` }} />
                    ) : (
                         <div className="absolute h-full bg-slate-300/40 border-x border-slate-300/50" style={{ left: `${normLeft}%`, width: `${normWidth}%` }} />
                    )}
                    {/* Active Filled Range - REMOVED transition-all to fix lag when dragging fast */}
                    <div className={`absolute h-full ${trackColor} shadow-sm`} style={{ left: `${leftP}%`, width: `${rightP - leftP}%` }} />
                </div>

                {/* Handle 1 - Adjusted left offset to -8px (half of w-4) */}
                <div className={handleStyle} style={{ left: `calc(${getPercent(handles[0])}% - 8px)` }} onMouseDown={(e) => handleMouseDown(e, 0)} onTouchStart={(e) => handleMouseDown(e, 0)}>
                    <div className="w-1 h-1 bg-slate-400 rounded-full opacity-50"></div>
                </div>

                {/* Handle 2 - Adjusted left offset to -8px (half of w-4) */}
                <div className={handleStyle} style={{ left: `calc(${getPercent(handles[1])}% - 8px)` }} onMouseDown={(e) => handleMouseDown(e, 1)} onTouchStart={(e) => handleMouseDown(e, 1)}>
                    <div className="w-1 h-1 bg-slate-400 rounded-full opacity-50"></div>
                </div>
            </div>
        </div>
    );
};

export const MmtSlider = ({ value, onChange }: { value: number; onChange: (val: number) => void; }) => {
    const displayValue = Number.isInteger(value) ? value : Math.floor(value) + '+';
    const sliderRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // Reuse exact handle style from DualRangeSlider
    const handleStyle = "absolute w-4 h-4 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-slate-200 cursor-grab active:cursor-grabbing z-10 flex items-center justify-center hover:scale-110 active:scale-105 transition-transform duration-200 hover:border-slate-300";

    const updatePosition = (clientX: number) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        // MMT range 0-5, step 0.5
        const rawValue = percentage * 5;
        // Snap to nearest 0.5
        const steppedValue = Math.round(rawValue * 2) / 2; 
        
        if (steppedValue !== value) {
            onChange(steppedValue);
        }
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (e.type === 'mousedown') e.preventDefault();
        isDragging.current = true;
        
        // Handle initial click position
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        updatePosition(clientX);

        const moveHandler = (ev: MouseEvent | TouchEvent) => {
            const cx = 'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
            updatePosition(cx);
        };
        const upHandler = () => {
            isDragging.current = false;
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', upHandler);
        };
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
        document.addEventListener('touchmove', moveHandler);
        document.addEventListener('touchend', upHandler);
    };

    const percent = (value / 5) * 100;

    return (
        <div className="w-full pt-1.5 select-none">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Grade</span>
                <span className={`text-xs font-black px-1.5 rounded ${value < 3 ? 'text-red-600 bg-red-50' : value < 5 ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}>{displayValue}</span>
            </div>
            
            {/* Custom Slider Container */}
            <div 
                className="relative h-5 w-full flex items-center touch-none group" 
                ref={sliderRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                {/* Track Background */}
                <div className="absolute w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    {/* Active Fill - Slate-800 to match previous accent */}
                    <div className="absolute h-full bg-slate-800" style={{ width: `${percent}%` }} />
                </div>

                {/* Handle - Matches DualRangeSlider exactly */}
                <div 
                    className={handleStyle} 
                    style={{ left: `calc(${percent}% - 8px)` }} // -8px to center the 16px(w-4) handle
                >
                    <div className="w-1 h-1 bg-slate-400 rounded-full opacity-50"></div>
                </div>
            </div>

            <div className="flex justify-between text-[8px] text-slate-400 font-bold font-mono px-0.5">
                <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
        </div>
    );
};

export const ListIconSet = ({ onNumberClick, onBulletClick }: { onNumberClick: () => void, onBulletClick: () => void }) => (
    <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
        <button 
            onClick={onNumberClick} 
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm transition-all" 
            title="數字清單"
        >
            <span className="font-mono">1.</span> 清單
        </button>
        <div className="w-px h-3 bg-slate-300 mx-0.5"></div>
        <button 
            onClick={onBulletClick} 
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm transition-all" 
            title="項目符號"
        >
            <span className="text-xs">•</span> 項目
        </button>
    </div>
);

// --- Shared Helper Functions ---

export const isCentralAxis = (joint: string, move: string) => {
    const j = joint.toLowerCase();
    const m = move.toLowerCase();
    const isSpine = j.includes('cervical') || j.includes('lumbar') || j.includes('thoracic') || j.includes('頸') || j.includes('腰') || j.includes('胸');
    const isSagittal = m.includes('flexion') || m.includes('extension');
    return isSpine && isSagittal;
};

export const categorizeOptions = (options: string[]) => {
    const left: { val: string, display: string }[] = [];
    const right: { val: string, display: string }[] = [];
    const center: { val: string, display: string }[] = [];
    options.forEach(opt => {
        if (opt.endsWith(' L') || opt.includes('(C-Left)') || opt.startsWith('Neutral L')) left.push({ val: opt, display: opt.replace(/ (L|Left)$/, '').replace('Neutral L', 'Neutral') });
        else if (opt.endsWith(' R') || opt.includes('(C-Right)') || opt.startsWith('Neutral R')) right.push({ val: opt, display: opt.replace(/ (R|Right)$/, '').replace('Neutral R', 'Neutral') });
        else center.push({ val: opt, display: opt });
    });
    return { left, center, right };
};

export const toggleListFormatHelper = (
    elementId: string, 
    type: 'number' | 'bullet', 
    currentValue: string, 
    updateState: (val: string) => void
) => {
    const textarea = document.getElementById(elementId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = currentValue || '';
    
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const lineEndIndex = val.indexOf('\n', end);
    const effectiveEnd = lineEndIndex === -1 ? val.length : lineEndIndex;
    
    const selectedBlock = val.substring(lineStart, effectiveEnd);
    const lines = selectedBlock.split('\n');
    
    let isRemoving = false;
    if (type === 'number') {
        isRemoving = lines.every(l => /^\s*\d+\.\s/.test(l));
    } else {
        isRemoving = lines.every(l => /^\s*•\s/.test(l));
    }

    const newLines = lines.map((line, idx) => {
        const cleanLine = line.replace(/^\s*(\d+\.\s|•\s)/, '');
        if (isRemoving) return cleanLine;
        if (type === 'number') return `${idx + 1}. ${cleanLine}`;
        return `• ${cleanLine}`;
    });

    const newBlock = newLines.join('\n');
    const newVal = val.substring(0, lineStart) + newBlock + val.substring(effectiveEnd);
    
    updateState(newVal);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart, lineStart + newBlock.length);
    }, 0);
};

export const insertAtCursorHelper = (
    elementId: string, 
    text: string, 
    currentValue: string, 
    updateState: (val: string) => void
) => {
    const textarea = document.getElementById(elementId) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const val = currentValue || '';
    const newVal = val.substring(0, start) + text + val.substring(textarea.selectionEnd);
    updateState(newVal);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + text.length, start + text.length); }, 0);
};
