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

export const TherapistEval = () => {
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

  if (!activeCase) return <div className="text-center p-12 text-slate-400">請先選擇個案</div>;

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