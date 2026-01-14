
import React, { useRef, useState, memo } from 'react';
import { useApp } from '../store';
import { VasChart } from '../components/VasChart';
import { RomOverviewChart } from '../components/RomOverviewChart';
import { MmtRadarChart } from '../components/MmtRadarChart';
import { Button } from '../components/Input';
import { toPng, toCanvas } from 'html-to-image';
import { ExportActionHub } from '../components/ExportActionHub';
import { PrintableReport } from '../components/PrintableReport';
import { PatientCase } from '../types';
import { jsPDF } from 'jspdf';

// Memoized Dashboard Content to prevent re-plotting charts on every parent re-render
const DashboardContent = memo(({ data, isForExport = false }: { data: PatientCase, isForExport?: boolean }) => {
  const lastRecord = data.records[data.records.length - 1];
  const form = data.client;

  const displayGoals = lastRecord?.therapist?.sessionGoals?.length 
    ? lastRecord.therapist.sessionGoals 
    : (lastRecord?.therapist?.planGoals || []);

  const hasRedFlags = (form.redFlags && form.redFlags.length > 0) || form.nightPain || form.weightLoss;

  const formatToList = (text?: string) => {
    if (!text) return <span className="italic text-slate-300">本次無紀錄</span>;
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) return text;
    return (
      <ul className="list-disc list-inside space-y-1">
        {lines.map((l, i) => (
          <li key={i} className="leading-relaxed">
            {l.replace(/^[•\-\d\.]+\s*/, '')}
          </li>
        ))}
      </ul>
    );
  };

  const cardItems = [
    { 
        label: '評估與推理 (Assessment)', 
        content: formatToList(lastRecord?.therapist?.reasoning), 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-3.5-6.5h-1c0 2.5-1.5 4.9-3.5 6.5S5 13 5 15a7 7 0 0 0 7 7z"/></svg>
        )
    },
    { 
        label: '治療目標 (Goals)', 
        content: (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {displayGoals.length > 0 ? displayGoals.map(g => (
              <span key={g} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100">{g}</span>
            )) : <span className="italic text-slate-300">尚無目標</span>}
          </div>
        ), 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        )
    },
    { 
        label: '治療內容 (Plan)', 
        content: formatToList(lastRecord?.therapist?.treatmentPlan), 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        )
    },
    { 
        label: '回家作業 (Home Ex)', 
        content: formatToList(lastRecord?.therapist?.homeEx), 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        )
    }
  ];

  return (
    <div className={`space-y-6 ${isForExport ? 'p-10 bg-white w-[1200px]' : ''}`}>
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            <div className="space-y-1 text-left relative z-10">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex flex-wrap items-baseline gap-2">
                    {form.name} <span className="text-indigo-300 font-medium text-base sm:text-lg">個案評估報告</span>
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-indigo-200/70 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                    <span>Clinical Dashboard</span><span className="w-1 h-1 bg-indigo-400 rounded-full hidden sm:block"></span><span className="hidden sm:inline">PhysioNotes Pro</span>
                </div>
            </div>
            <div className="text-left sm:text-right relative z-10 bg-black/10 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/5 sm:border-0 w-full sm:w-auto">
                <div className="text-[10px] text-indigo-300 font-black uppercase tracking-tighter opacity-70">最近就診日期 (Last Visit)</div>
                <div className="text-lg sm:text-xl font-mono font-black">{lastRecord ? new Date(lastRecord.visitDate).toLocaleDateString() : 'N/A'}</div>
            </div>
        </div>

        {/* 
            Modified: Red Flags section is now hidden when isForExport is true.
            This ensures the exported image template is clean and standardized.
        */}
        {hasRedFlags && !isForExport && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm border-l-8 border-l-red-500 animate-emergency-pulse">
                <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div className="text-left">
                    <h4 className="text-sm font-black text-red-800 uppercase tracking-wide mb-1">Clinical Red Flags Detected</h4>
                    <p className="text-xs text-red-700 font-medium leading-relaxed">請注意：此個案標記有紅旗徵兆，治療前應詳加評估風險。</p>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                    <div>
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> 醫學診斷 (Diagnosis)
                        </div>
                        <div className="text-lg font-bold leading-tight text-slate-800">{form.diagnosis || '暫無診斷紀錄'}</div>
                    </div>
                    <div className="sm:border-l sm:border-slate-100 sm:pl-6">
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> 主要問題 (Complaint)
                        </div>
                        <div className="text-sm font-medium text-slate-600 leading-relaxed line-clamp-2">
                            {(lastRecord?.visit?.subjectiveNotes || form.chiefComplaint) || '暫無主訴紀錄'}
                        </div>
                    </div>
                </div>
            </div>
            <div className="md:col-span-4 grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">總療程數</div>
                    <div className="text-3xl font-black text-indigo-600 font-mono">{data.records.length}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Visits</div>
                 </div>
                 <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">下次預約</div>
                    <div className="text-xl font-bold text-slate-800">{lastRecord?.therapist?.nextAppointment ? new Date(lastRecord.therapist.nextAppointment).toLocaleDateString(undefined, {month:'numeric', day:'numeric'}) : '-'}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Schedule</div>
                 </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-80"><VasChart records={data.records} /></div>
          <div className="h-80"><RomOverviewChart records={data.records} initialComplaint={form.chiefComplaint} /></div>
          <div className="h-80"><MmtRadarChart records={data.records} initialComplaint={form.chiefComplaint} /></div>
        </div>

        {lastRecord && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cardItems.map(item => (
                <div key={item.label} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-left group hover:border-indigo-300 transition-all flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                            {item.icon}
                        </div>
                        {item.label}
                    </h3>
                    <div className="text-xs text-slate-600 leading-relaxed line-clamp-[6] overflow-hidden flex-1 font-medium">
                        {item.content}
                    </div>
                </div>
              ))}
          </div>
        )}
    </div>
  );
});

export const ClientDashboard = () => {
  const { activeCase, user } = useApp();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const dashboardPreviewRef = useRef<HTMLDivElement>(null);
  const reportPreviewRef = useRef<HTMLDivElement>(null);

  if (!activeCase) return null;

  // --- Shared Filter Function to prevent "trim" error ---
  // This excludes problematic nodes like scripts and stylesheets which often cause
  // html-to-image to crash with "t is undefined" when cacheBust is involved or CORS fails.
  const filterNode = (node: HTMLElement) => {
    const tagName = (node.tagName || '').toUpperCase();
    return (
        tagName !== 'SCRIPT' &&
        tagName !== 'STYLE' &&
        tagName !== 'LINK' &&
        tagName !== 'IFRAME' &&
        !node.classList?.contains('no-print')
    );
  };

  // --- 1. Smart Slicing Algorithm (For High-Res PDF & Image) ---
  const findBestCutY = (
    ctx: CanvasRenderingContext2D, 
    imgWidth: number, 
    searchStartY: number,
    scanHeight: number = 250
  ): number => {
    try {
        const scanY = Math.max(0, searchStartY - scanHeight);
        const height = searchStartY - scanY;
        
        if (height <= 0) return searchStartY;

        const imageData = ctx.getImageData(0, scanY, imgWidth, height);
        const data = imageData.data;

        // Map out which rows are fully white
        const whiteRows: boolean[] = new Array(height).fill(true);
        const step = 10; // Optimization: Scan every 10th pixel
        
        for (let y = 0; y < height; y++) {
            let isWhite = true;
            for (let x = 0; x < imgWidth; x += step) {
                const idx = (y * imgWidth + x) * 4;
                if (data[idx] < 250 || data[idx+1] < 250 || data[idx+2] < 250) {
                    isWhite = false;
                    break;
                }
            }
            whiteRows[y] = isWhite;
        }

        // Find contiguous blocks of white rows (Gaps)
        const gaps: { start: number, end: number, size: number }[] = [];
        let currentGapStart = -1;

        for (let y = 0; y < height; y++) {
            if (whiteRows[y]) {
                if (currentGapStart === -1) currentGapStart = y;
            } else {
                if (currentGapStart !== -1) {
                    gaps.push({ start: currentGapStart, end: y, size: y - currentGapStart });
                    currentGapStart = -1;
                }
            }
        }
        if (currentGapStart !== -1) {
            gaps.push({ start: currentGapStart, end: height, size: height - currentGapStart });
        }

        if (gaps.length === 0) return searchStartY;

        const largeGaps = gaps.filter(g => g.size > 20); 
        let bestGap = gaps[0];
        
        if (largeGaps.length > 0) {
            bestGap = largeGaps.reduce((prev, current) => (current.size >= prev.size ? current : prev));
        } else {
            bestGap = gaps.reduce((prev, current) => (current.size >= prev.size ? current : prev));
        }

        const relativeCutY = bestGap.start + Math.floor(bestGap.size / 2);
        return scanY + relativeCutY;

    } catch (e) {
        console.warn("Smart slicing error, falling back to hard cut", e);
        return searchStartY;
    }
  };

  // --- 2. Export Image Logic (Uses html-to-image + Slicing) ---
  const handleExportReportImage = async () => {
    if (!reportPreviewRef.current) return;
    setIsExporting(true);
    
    try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Increased wait for rendering

        // Generate Ultra-High-Res Source Canvas (3x for good image quality)
        const sourceCanvas = await toCanvas(reportPreviewRef.current, {
            cacheBust: false, // Fix: Disabled cacheBust to prevent CORS font errors
            filter: filterNode, // Fix: Exclude script/link tags
            backgroundColor: '#ffffff',
            pixelRatio: 4, 
            style: {
                fontVariant: 'normal',
                textRendering: 'geometricPrecision',
            } as any
        });
        const sourceCtx = sourceCanvas.getContext('2d');
        if (!sourceCtx) throw new Error("Canvas context failed");

        const imgWidth = sourceCanvas.width;
        const imgHeight = sourceCanvas.height;
        
        // Constants for A4 Aspect Ratio
        const pdfWidthMm = 210;
        const pdfHeightMm = 297;
        const marginMm = 15;

        // Calculate heights in pixels based on width
        const pageHeightPx = Math.floor(imgWidth * (pdfHeightMm / pdfWidthMm));
        const marginPx = Math.floor(pageHeightPx * (marginMm / pdfHeightMm));

        let currentSourceY = 0;
        let pageIndex = 0;

        while (currentSourceY < imgHeight) {
            const isFirstPage = pageIndex === 0;
            const topMarginPx = isFirstPage ? 0 : marginPx;
            const bottomMarginPx = marginPx;
            
            const maxContentHeight = pageHeightPx - topMarginPx - bottomMarginPx;
            const remainingSource = imgHeight - currentSourceY;
            let sliceHeight = Math.min(maxContentHeight, remainingSource);

            // Smart Slicing
            if (sliceHeight < remainingSource) {
                const scanRange = Math.min(Math.floor(maxContentHeight * 0.3), 2000); 
                const smartCutY = findBestCutY(sourceCtx, imgWidth, currentSourceY + sliceHeight, scanRange);
                sliceHeight = Math.max(1, smartCutY - currentSourceY);
            }

            // Create canvas for this page
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = imgWidth;
            pageCanvas.height = pageHeightPx;
            const pageCtx = pageCanvas.getContext('2d');

            if (pageCtx) {
                pageCtx.fillStyle = '#ffffff';
                pageCtx.fillRect(0, 0, imgWidth, pageHeightPx);

                // Draw Slice
                pageCtx.drawImage(
                    sourceCanvas,
                    0, currentSourceY, imgWidth, sliceHeight, // Source
                    0, topMarginPx, imgWidth, sliceHeight     // Dest
                );

                const imgDataUrl = pageCanvas.toDataURL('image/png', 1.0);

                // Download individual image
                const link = document.createElement('a');
                const dateStr = new Date().toISOString().split('T')[0];
                const safeName = activeCase.client.name.replace(/\s+/g, '_');
                link.download = `Report_${safeName}_${dateStr}_Page${String(pageIndex + 1).padStart(2, '0')}.png`;
                link.href = imgDataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Throttle slightly
                await new Promise(r => setTimeout(r, 200));
            }

            currentSourceY += sliceHeight;
            pageIndex++;
        }

    } catch (err) {
        console.error("Export Image Failed:", err);
        alert('圖片匯出失敗，請重試。');
    } finally {
        setIsExporting(false);
    }
  };

  // --- 3. High Quality PDF Generation (Non-Native, JS Based) ---
  const handleHighQualityPdf = async () => {
    if (!reportPreviewRef.current) return;
    setIsExporting(true);
    
    try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Wait for fonts/icons

        // 1. Generate Ultra-High-Res Source Canvas
        // pixelRatio 4 = 400 DPI equivalent (approx). Very high quality.
        const sourceCanvas = await toCanvas(reportPreviewRef.current, {
            cacheBust: false, // Fix: Disabled cacheBust to prevent CORS font errors
            filter: filterNode, // Fix: Exclude script/link tags
            backgroundColor: '#ffffff',
            pixelRatio: 4, 
            style: {
                fontVariant: 'normal',
                textRendering: 'geometricPrecision',
                transform: 'scale(1)'
            } as any
        });
        const sourceCtx = sourceCanvas.getContext('2d');
        if (!sourceCtx) throw new Error("Canvas context failed");

        const imgWidth = sourceCanvas.width;
        const imgHeight = sourceCanvas.height;
        
        // 2. Initialize PDF (A4)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidthMm = 210;
        const pdfHeightMm = 297;
        const marginMm = 15; // 1.5cm margin

        // Convert page geometry to pixels relative to our source canvas
        const pageHeightPx = Math.floor(imgWidth * (pdfHeightMm / pdfWidthMm));
        const marginPx = Math.floor(pageHeightPx * (marginMm / pdfHeightMm));

        let currentSourceY = 0;
        let pageIndex = 0;

        // 3. Slicing Loop
        while (currentSourceY < imgHeight) {
            if (pageIndex > 0) pdf.addPage();

            const isFirstPage = pageIndex === 0;
            const topMarginPx = isFirstPage ? 0 : marginPx;
            const bottomMarginPx = marginPx;
            
            const maxContentHeight = pageHeightPx - topMarginPx - bottomMarginPx;
            const remainingSource = imgHeight - currentSourceY;
            let sliceHeight = Math.min(maxContentHeight, remainingSource);

            // Smart Slicing Logic
            if (sliceHeight < remainingSource) {
                const scanRange = Math.min(Math.floor(maxContentHeight * 0.3), 2000); 
                const smartCutY = findBestCutY(sourceCtx, imgWidth, currentSourceY + sliceHeight, scanRange);
                sliceHeight = Math.max(1, smartCutY - currentSourceY);
            }

            // Create canvas for this specific PDF page
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = imgWidth;
            pageCanvas.height = pageHeightPx;
            const pageCtx = pageCanvas.getContext('2d');

            if (pageCtx) {
                // White background
                pageCtx.fillStyle = '#ffffff';
                pageCtx.fillRect(0, 0, imgWidth, pageHeightPx);

                // Draw content slice onto the page canvas with margins
                pageCtx.drawImage(
                    sourceCanvas,
                    0, currentSourceY, imgWidth, sliceHeight, // Source Rect
                    0, topMarginPx, imgWidth, sliceHeight     // Dest Rect
                );

                // Add to PDF using PNG (LOSSLESS) for maximum quality
                // JPEG was causing artifacts. PNG is pixel perfect.
                const imgDataUrl = pageCanvas.toDataURL('image/png'); 
                pdf.addImage(imgDataUrl, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm);
            }

            currentSourceY += sliceHeight;
            pageIndex++;
        }

        // 4. Save
        const dateStr = new Date().toISOString().split('T')[0];
        const safeName = activeCase.client.name.replace(/\s+/g, '_');
        pdf.save(`FullReport_${safeName}_${dateStr}.pdf`);

    } catch (err) {
        console.error("PDF Gen Failed:", err);
        alert('PDF 生成失敗，請稍後重試。');
    } finally {
        // Do NOT close the modal automatically, just stop spinning
        setIsExporting(false);
    }
  };

  // --- 4. Export Dashboard Snapshot Logic ---
  const handleExportPng = async () => {
    if (!dashboardPreviewRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Replaced toPng with toCanvas + toDataURL to resolve "trim" error
      // Added filters to exclude scripts/links which confuse html-to-image
      const canvas = await toCanvas(dashboardPreviewRef.current, {
        cacheBust: false, // Fix: Ensure disabled for Dashboard too
        filter: filterNode, // Fix: Ensure filter is applied
        backgroundColor: '#ffffff',
        width: 1200, 
        pixelRatio: 4, 
        style: {
            fontVariant: 'normal',
            textRendering: 'geometricPrecision',
            WebkitFontSmoothing: 'antialiased',
        } as any
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `Dashboard_${activeCase.client.name}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      setIsPreviewOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
      alert('圖片導出失敗，請重試。');
    } finally {
      setIsExporting(false);
    }
  };

  // --- 5. Native Browser Print ---
  const handleNativePrint = () => {
      // Just call window print. The modal stays open.
      window.print();
  };

  return (
    <div className="animate-fade-in space-y-4 pb-24 sm:pb-20">
      <ExportActionHub 
        onExportDashboard={() => setIsPreviewOpen(true)}
        onExportReport={() => setShowReportPreview(true)}
        isExporting={isExporting}
      />

      <div className="space-y-6 mt-2">
        <DashboardContent data={activeCase} />
      </div>

      {/* 1. Dashboard Image Preview Modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in no-print"
          onClick={(e) => { if(e.target === e.currentTarget && !isExporting) setIsPreviewOpen(false); }}
        >
            <div className="w-full max-w-[1200px] flex flex-col sm:flex-row justify-between items-center mb-6 text-white px-2 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight">儀表板匯出預覽</h3>
                        <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Export Snapshot</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="ghost" className="flex-1 sm:flex-initial text-white hover:bg-white/10 px-6 font-bold" onClick={() => setIsPreviewOpen(false)} disabled={isExporting}>取消</Button>
                    
                    {/* Updated Export Button: Text changed to "下載圖片" */}
                    <button 
                        onClick={handleExportPng}
                        disabled={isExporting}
                        className="px-6 py-2.5 rounded-full font-black text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isExporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                處理中...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                下載圖片
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div className="w-full max-w-[1240px] flex-1 overflow-auto rounded-3xl shadow-2xl bg-white p-6 sm:p-12 no-scrollbar border border-white/10">
                <div ref={dashboardPreviewRef} className="mx-auto bg-white min-w-[1000px] sm:min-w-0">
                    <DashboardContent data={activeCase} isForExport={true} />
                </div>
            </div>
        </div>
      )}

      {/* 2. Detailed Report Preview Modal */}
      {showReportPreview && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-fade-in no-print"
          onClick={(e) => { if(e.target === e.currentTarget && !isExporting) setShowReportPreview(false); }}
        >
            <div className="w-full max-w-[900px] flex flex-col sm:flex-row justify-between items-center mb-6 text-white px-2 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight">詳細報告預覽</h3>
                        <p className="text-[10px] text-orange-300 font-bold uppercase tracking-widest mt-1">Professional Medical Report</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="ghost" className="flex-1 sm:flex-initial text-white hover:bg-white/10 px-4 font-bold" onClick={() => setShowReportPreview(false)} disabled={isExporting}>關閉</Button>
                    
                    {/* Image Download Button */}
                    <button 
                        onClick={handleExportReportImage}
                        disabled={isExporting}
                        className="px-4 py-2.5 rounded-full font-black text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50 disabled:cursor-wait"
                        title="下載長圖片 (Line 傳送用)"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span className="hidden sm:inline">下載圖檔</span>
                    </button>

                    {/* PDF Download Button (High Res) */}
                    <button 
                        onClick={handleHighQualityPdf}
                        disabled={isExporting}
                        className="px-4 py-2.5 rounded-full font-black text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isExporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                處理中...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                下載 PDF
                            </>
                        )}
                    </button>

                    {/* Native Print Button */}
                    <button 
                        onClick={handleNativePrint}
                        disabled={isExporting}
                        className="px-4 py-2.5 rounded-full font-black text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 disabled:opacity-70"
                        title="瀏覽器原生列印 (另存PDF)"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline><path d="M6 18h12"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path></svg>
                        列印
                    </button>
                </div>
            </div>
            <div className="w-full max-w-[900px] flex-1 overflow-auto rounded-xl shadow-2xl bg-slate-500/50 p-4 no-scrollbar border border-white/10 flex justify-center">
                <div className="bg-white shadow-2xl min-h-full w-[210mm] origin-top transform scale-90 sm:scale-100 transition-transform">
                    {/* Preview Mode */}
                    <div ref={reportPreviewRef}>
                        <PrintableReport data={activeCase} isForPreview={true} therapistName={user?.name} />
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
