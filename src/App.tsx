
import React, { useState } from 'react';
import { AppProvider, useApp } from './store';
import { Auth } from './pages/Auth';
import { Layout } from './components/Layout';
import { PatientList } from './pages/PatientList';
import { ClientIntake } from './pages/ClientIntake';
import { TherapistEval } from './pages/TherapistEval';
import { PrintableReport } from './components/PrintableReport';
import { PasswordResetModal } from './components/PasswordResetModal';

const Main = () => {
  const { user, loading, activeCase } = useApp();
  const [activeTab, setActiveTab] = useState('cases');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000"></div>
         
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center mb-6 shadow-2xl shadow-slate-900/20 animate-bounce">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-2">Loading System...</p>
            </div>
         </div>
      </div>
    );
  }

  // Force Password Reset Modal to appear if in recovery mode, even if not logged in conventionally yet (though usually they are implicitly logged in by the link)
  // Or handle it post-login if user is null but recovery event fired.
  // Actually, Supabase signs them in. So user will exist.

  if (!user) return <Auth />;

  return (
    <>
      <div className="no-print">
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'cases' && <PatientList onNavigate={setActiveTab} />}
          {activeTab === 'client' && <ClientIntake onNavigate={setActiveTab} />}
          {activeTab === 'therapist' && <TherapistEval onNavigate={setActiveTab} />}
        </Layout>
      </div>
      
      {/* Global Modals */}
      <PasswordResetModal />
      
      {/* Hidden Print Layer - Used by window.print() */}
      {activeCase && (
        <div className="print-only">
          <PrintableReport data={activeCase} therapistName={user?.name} />
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
}
