
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store';
import { Button, Input, ConfirmModal, AlertModal } from '../components/Input';
import { PatientCase } from '../types';

interface PatientListProps {
    onNavigate: (tab: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ onNavigate }) => {
  const { cases, user, setActiveCaseId, deleteCase, importCases, loadCases } = useApp();
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type?: 'success' | 'error' }>({ isOpen: false, title: '', message: '', type: 'success' });
  
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<any[]>([]);

  useEffect(() => {
    setActiveCaseId(null);
    loadCases();
  }, []);

  const filtered = cases.filter(c => 
    c.client.name.toLowerCase().includes(search.toLowerCase()) || 
    c.client.chiefComplaint.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (caseItem: PatientCase) => {
    setActiveCaseId(caseItem.id || null);
    onNavigate('client');
  };

  const handleAdd = () => {
      setActiveCaseId(null);
      onNavigate('client');
  };

  const handleDeleteClick = (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  }

  const performDelete = async () => {
    if (!deleteTargetId) return;
    try {
        await deleteCase(deleteTargetId);
        setDeleteModalOpen(false);
        setDeleteTargetId(null);
    } catch (err: any) {
        setAlertState({ isOpen: true, title: "刪除失敗", message: err.message, type: 'error' });
        setDeleteModalOpen(false);
    }
  };

  const handleExport = () => {
      const dataStr = JSON.stringify(cases, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `physionotes_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportClick = () => {
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
          fileInputRef.current.click();
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      
      reader.onerror = () => {
          setAlertState({ isOpen: true, title: "讀取錯誤", message: "讀取檔案發生錯誤，請重試。", type: 'error' });
      };

      reader.onload = async (ev) => {
          try {
              const content = ev.target?.result as string;
              if (!content) {
                  setAlertState({ isOpen: true, title: "檔案空白", message: "檔案內容為空！", type: 'error' });
                  return;
              }

              let parsed;
              try {
                  parsed = JSON.parse(content);
              } catch (jsonErr) {
                  setAlertState({ isOpen: true, title: "解析錯誤", message: "JSON 解析失敗：檔案格式不正確。\n請確認您上傳的是 .json 檔案。", type: 'error' });
                  return;
              }
              
              let importList: any[] = [];
              
              if (Array.isArray(parsed)) {
                  importList = parsed;
              } else if (typeof parsed === 'object' && parsed !== null) {
                  if (parsed.id || parsed.client) {
                       importList = [parsed];
                  } else {
                       importList = Object.values(parsed);
                  }
              }

              if (importList.length === 0) {
                  setAlertState({ isOpen: true, title: "無資料", message: "檔案中沒有可匯入的個案資料 (0 items)。", type: 'error' });
                  return;
              }

              setPendingImportData(importList);
              setImportConfirmOpen(true);
              
          } catch (err: any) {
              console.error("Critical Import Error:", err);
              setAlertState({ isOpen: true, title: "系統錯誤", message: "匯入過程發生嚴重錯誤: " + err.message, type: 'error' });
          } finally {
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
  };

  const executeImport = async () => {
      setImportConfirmOpen(false);
      try {
          const result = await importCases(pendingImportData);
          
          let msg = `成功匯入: ${result.success} 筆`;
          if (result.fail > 0) msg += `\n失敗: ${result.fail} 筆 (請按 F12 查看 Console 詳細錯誤)`;
          
          setAlertState({ 
              isOpen: true, 
              title: "匯入完成", 
              message: msg, 
              type: result.fail > 0 ? 'error' : 'success' 
          });
      } catch (e: any) {
           setAlertState({ isOpen: true, title: "匯入失敗", message: e.message, type: 'error' });
      } finally {
          setPendingImportData([]);
      }
  };

  const getAge = (dob: string) => {
    if (!dob) return '';
    const ageDifMs = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  const limit = user?.patient_trial_limit || 10;
  
  const totalPatients = cases.length;
  const totalVisits = cases.reduce((acc, curr) => acc + curr.records.length, 0);
  const activeThisWeek = cases.filter(caseItem => {
      const last = caseItem.records[caseItem.records.length - 1];
      if(!last) return false;
      const diff = Date.now() - last.visitDate;
      return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="space-y-8 pb-24">
      <AlertModal 
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="刪除個案確認"
        message="確定刪除此個案資料？這將同時刪除該個案所有的療程紀錄，且無法復原。"
        isDangerous={true}
        onConfirm={performDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <ConfirmModal 
        isOpen={importConfirmOpen}
        title="匯入確認"
        message={`檢測到 ${pendingImportData.length} 筆資料。\n確定要匯入嗎？(這將會新增資料到您的資料庫)`}
        confirmText="確認匯入"
        onConfirm={executeImport}
        onCancel={() => { setImportConfirmOpen(false); setPendingImportData([]); }}
      />

      {/* Header & Stats */}
      <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">個案資料庫</h2>
              <p className="text-slate-500 text-sm mt-1">歡迎回來，{user?.name || '治療師'}。這是您的個案總覽。</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                    <button 
                        onClick={handleExport}
                        className="p-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <div className="px-4 py-2 text-[11px] font-black text-slate-600 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            備份
                        </div>
                    </button>
                    <button 
                        onClick={handleImportClick}
                        className="p-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <div className="px-4 py-2 text-[11px] font-black text-slate-600 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            匯入
                        </div>
                    </button>
                </div>
                
                {/* 黑色膠囊風格按鈕 */}
                <button 
                    onClick={handleAdd}
                    className="p-1 rounded-[2rem] bg-slate-900 text-white shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all"
                >
                    <div className="px-6 py-2.5 rounded-[1.8rem] text-xs font-black flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        新增個案
                    </div>
                </button>
            </div>
          </div>

          {/* Mini Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">總個案數</span>
                  <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-800">{totalPatients}</span>
                      <span className="text-xs text-slate-400">/ {limit > 100 ? '∞' : limit}</span>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">總治療次數</span>
                  <span className="text-2xl font-black text-primary-600 mt-1">{totalVisits}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">本週活躍</span>
                  <span className="text-2xl font-black text-green-600 mt-1">{activeThisWeek}</span>
              </div>
          </div>
      </div>

      {/* Search & List */}
      <div className="space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <Input 
                placeholder="搜尋姓名、症狀或診斷..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-12 bg-white border-slate-200 shadow-sm"
            />
          </div>

          {filtered.length === 0 ? (
             <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                 </div>
                 <p className="text-slate-400 font-medium">查無個案資料</p>
                 <button onClick={handleAdd} className="text-primary-600 text-sm font-bold mt-2 hover:underline">建立您的第一位個案</button>
             </div>
          ) : (
             <div className="grid grid-cols-1 gap-4">
                {/* 桌面版表頭 (可選) - 改為純粹的卡片流，移除表頭以符合現代卡片風格 */}
                
                {filtered.map(caseItem => {
                   const lastRecord = caseItem.records[caseItem.records.length - 1];
                   const age = getAge(caseItem.client.dob);
                   const visitCount = caseItem.records.length;
                   const currentVas = lastRecord?.visit.vasNow ?? '-';
                   const hasRedFlags = (caseItem.client.redFlags && caseItem.client.redFlags.length > 0) || caseItem.client.nightPain || caseItem.client.weightLoss;

                   return (
                     <div 
                        key={caseItem.id} 
                        onClick={() => handleSelect(caseItem)}
                        className="group bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-8"
                     >
                        {/* 左側：頭像與基本資料 */}
                        <div className="flex items-center gap-4 w-full md:w-[35%] shrink-0 border-b md:border-b-0 md:border-r border-slate-50 pb-4 md:pb-0 md:pr-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0 shadow-md ${hasRedFlags ? 'bg-rose-500' : 'bg-slate-900'}`}>
                                {caseItem.client.name[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-black text-slate-800 truncate">{caseItem.client.name}</h3>
                                    {hasRedFlags && <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">RED FLAGS</span>}
                                </div>
                                <div className="text-xs font-medium text-slate-400 mt-0.5 flex items-center gap-2">
                                    <span>{caseItem.client.gender === '男' ? 'Male' : caseItem.client.gender === '女' ? 'Female' : 'Other'}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span>{age} 歲</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="truncate">{caseItem.client.job || '無職業'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 中間：主訴與診斷 */}
                        <div className="w-full md:flex-1 min-w-0 space-y-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Chief Complaint</span>
                                <p className="text-sm font-bold text-slate-700 truncate">{caseItem.client.chiefComplaint || '尚無主訴紀錄'}</p>
                            </div>
                            {caseItem.client.diagnosis && (
                                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">
                                    {caseItem.client.diagnosis}
                                </div>
                            )}
                        </div>

                        {/* 右側：數據統計 */}
                        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 md:gap-8 pt-2 md:pt-0 border-t md:border-t-0 border-slate-50">
                            <div className="text-center">
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">VAS</div>
                                <div className={`text-xl font-black ${currentVas !== '-' && Number(currentVas) > 5 ? 'text-rose-500' : 'text-slate-800'}`}>
                                    {currentVas}<span className="text-xs text-slate-400 font-normal ml-0.5">/10</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Visits</div>
                                <div className="text-xl font-black text-slate-800">{visitCount}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Last Visit</div>
                                <div className="text-xl font-black text-slate-800">
                                    {lastRecord ? new Date(lastRecord.visitDate).toLocaleDateString(undefined, {month:'numeric', day:'numeric'}) : '-'}
                                </div>
                            </div>
                            
                            {/* Desktop Hover Actions */}
                            <div className="hidden md:flex items-center pl-4 border-l border-slate-100">
                                <button 
                                    onClick={(e) => handleDeleteClick(e, caseItem.id)}
                                    className="text-slate-300 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                    title="刪除個案"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                                <div className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all duration-300 ml-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                            </div>

                            {/* Mobile Delete Action (Top Right Absolute) */}
                            <button 
                                onClick={(e) => handleDeleteClick(e, caseItem.id)}
                                className="md:hidden absolute top-4 right-4 text-slate-200 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50/50 transition-all z-20"
                                title="刪除個案"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        </div>
                     </div>
                   );
                })}
             </div>
          )}
      </div>
    </div>
  );
};
