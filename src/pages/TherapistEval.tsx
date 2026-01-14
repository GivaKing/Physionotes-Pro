
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { ConfirmModal, AlertModal } from '../components/Input';
import { TherapistData, VisitData } from '../types';

// Components
import { SessionTimeline } from '../components/SessionTimeline';
import { SoapNavigation } from '../components/SoapNavigation';

// Modular Sections
import { SubjectiveSection } from './eval/Subjective';
import { ObjectiveSection } from './eval/Objective';
import { AssessmentSection } from './eval/Assessment';
import { PlanSection } from './eval/Plan';

const INITIAL_VISIT: VisitData = { vasEntries: [], subjectiveNotes: '' };
const INITIAL_THERAPIST: TherapistData = {
  rom: {}, mmt: {}, specialTests: {}, sttt: {}, neuralTension: {}, 
  softTissue: '', testsNerve: '', obsPosture: '', obsGait: '', movementAnalysis: '',
  reasonTags: [], reasoning: '', clinicalImpression: '', planGoals: [], treatmentPlan: '', homeEx: '', followUp: '', 
  shortTermGoals: '', longTermGoals: '', nextAppointment: '', sessionGoals: [],
  testsJoint: '', endFeel: '', jointMobility: '', muscleLength: '',
  postureGrid: {} 
};

interface TherapistEvalProps {
    onNavigate?: (tab: string) => void;
}

export const TherapistEval: React.FC<TherapistEvalProps> = ({ onNavigate }) => {
  const { activeCase, saveVisit, updateVisit, deleteVisit } = useApp();
  const [visit, setVisit] = useState<VisitData>(INITIAL_VISIT);
  const [tData, setTData] = useState<TherapistData>(INITIAL_THERAPIST);
  const [activeTab, setActiveTab] = useState<'S' | 'O' | 'A' | 'P'>('S');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  
  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type?: 'success' | 'error' }>({ isOpen: false, title: '', message: '', type: 'success' });

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
      setAlertState({ isOpen: true, title, message, type });
  };

  const copyLastSessionData = () => {
    if (activeCase && activeCase.records.length > 0) {
      const lastRecord = activeCase.records[activeCase.records.length - 1];
      const lastT = lastRecord.therapist;
      
      let sTests = lastT.specialTests;
      if (Array.isArray(sTests) || typeof sTests === 'string') sTests = {}; 
      
      let nTension = lastT.neuralTension;
      if (!nTension) nTension = {};

      setVisit({ ...INITIAL_VISIT, vasEntries: lastRecord.visit.vasEntries ? lastRecord.visit.vasEntries.map(v => ({ ...v })) : [] });
      setTData({ ...INITIAL_THERAPIST, ...lastT, specialTests: sTests, neuralTension: nTension, nextAppointment: '' });
    } else {
      setVisit(INITIAL_VISIT);
      setTData(INITIAL_THERAPIST);
    }
  };

  useEffect(() => {
     if(activeCase) {
        if (selectedRecordId) {
            const record = activeCase.records.find(r => r.id === selectedRecordId);
            if (record) {
                let sTests = record.therapist.specialTests;
                if (Array.isArray(sTests) || typeof sTests === 'string') sTests = {}; 
                
                let nTension = record.therapist.neuralTension;
                if (!nTension) nTension = {};

                setVisit(record.visit);
                setTData({...record.therapist, specialTests: sTests, neuralTension: nTension});
            } else {
                setSelectedRecordId(null);
            }
        } else {
            copyLastSessionData();
        }
     }
  }, [activeCase, selectedRecordId]);

  const handleSave = async () => {
    if (!activeCase) return;
    try {
        if (selectedRecordId) {
            await updateVisit(selectedRecordId, visit, tData);
            showAlert("成功", "療程更新成功！");
        } else {
            await saveVisit(activeCase.id!, visit, tData, true);
            showAlert("成功", "新療程儲存成功！");
            setSelectedRecordId(null); 
        }
    } catch(e: any) { 
        showAlert("錯誤", "儲存失敗: " + e.message, 'error'); 
    }
  };

  const handleDeleteRecord = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDeleteTargetId(id);
      setDeleteModalOpen(true);
  };

  const performDelete = async () => {
      if (!deleteTargetId) return;
      try {
          await deleteVisit(deleteTargetId);
          if (selectedRecordId === deleteTargetId) setSelectedRecordId(null);
          setDeleteModalOpen(false);
          setDeleteTargetId(null);
      } catch (e: any) {
          showAlert("刪除失敗", e.message, 'error');
          setDeleteModalOpen(false);
      }
  };

  const goNext = (tab: any) => { 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      setActiveTab(tab); 
  };
  
  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // --- NEW EMPTY STATE UI ---
  if (!activeCase) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
            <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 max-w-xl w-full text-center relative overflow-hidden group hover:border-slate-200 transition-all duration-500">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-80"></div>
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-slate-50 rounded-full blur-3xl group-hover:bg-blue-50/50 transition-colors duration-700 pointer-events-none"></div>
                <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-slate-50 rounded-full blur-3xl group-hover:bg-purple-50/50 transition-colors duration-700 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] text-slate-300 group-hover:scale-110 group-hover:bg-white group-hover:shadow-xl group-hover:text-indigo-500 transition-all duration-500 ease-out border border-transparent group-hover:border-slate-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3 tracking-tight">尚未選擇評估對象</h2>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed max-w-xs mx-auto font-medium">
                        請從個案列表中選擇一位病患以開始填寫 SOAP 紀錄，或建立新的個案資料。
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button 
                            onClick={() => onNavigate && onNavigate('cases')}
                            className="flex-1 py-4 px-6 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 font-bold text-sm hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                        >
                            <svg className="text-slate-400 group-hover/btn:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            選擇現有個案
                        </button>
                        
                        <button 
                            onClick={() => onNavigate && onNavigate('client')}
                            className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 hover:shadow-slate-300 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            建立新個案
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="pb-24 relative">
      <AlertModal 
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />
      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="刪除紀錄確認"
        message="確定刪除此療程紀錄？此操作無法復原。"
        isDangerous={true}
        onConfirm={performDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* 1. Session Timeline */}
      <div className="max-w-5xl mx-auto mb-4 px-1">
        <SessionTimeline 
            records={activeCase.records || []} 
            selectedRecordId={selectedRecordId}
            onSelectRecord={setSelectedRecordId}
            onDeleteRecord={handleDeleteRecord}
        />
      </div>

      {/* 2. SOAP Navigation - Optimized Sticky with proper offsets and z-index */}
      <div className="sticky top-[64px] md:top-4 z-40 mb-3 no-print select-none">
        <div className="max-w-5xl mx-auto">
            <SoapNavigation 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />
        </div>
      </div>

      {/* 3. Content Area */}
      <div className="min-h-[600px] space-y-8 max-w-5xl mx-auto px-1">
          {activeTab === 'S' && (
              <SubjectiveSection 
                  visit={visit} 
                  setVisit={setVisit} 
                  goNext={() => goNext('O')} 
                  scrollToTop={scrollToTop} 
              />
          )}

          {activeTab === 'O' && (
              <ObjectiveSection 
                  tData={tData} 
                  setTData={setTData} 
                  goNext={() => goNext('A')} 
                  scrollToTop={scrollToTop} 
              />
          )}

          {activeTab === 'A' && (
              <AssessmentSection 
                  tData={tData} 
                  setTData={setTData} 
                  goNext={() => goNext('P')} 
                  scrollToTop={scrollToTop} 
              />
          )}

          {activeTab === 'P' && (
              <PlanSection 
                  tData={tData} 
                  setTData={setTData} 
                  handleSave={handleSave} 
                  scrollToTop={scrollToTop} 
              />
          )}
      </div>
    </div>
  );
};
