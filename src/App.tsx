import React, { useState } from 'react';
import { AppProvider, useApp } from './store';
import { Auth } from './pages/Auth';
import { Layout } from './components/Layout';
import { PatientList } from './pages/PatientList';
import { ClientIntake } from './pages/ClientIntake';
import { TherapistEval } from './pages/TherapistEval';
import { PrintableReport } from './components/PrintableReport';

const Main = () => {
  const { user, loading, activeCase } = useApp();
  const [activeTab, setActiveTab] = useState('cases');

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary-600">Loading...</div>;
  if (!user) return <Auth />;

  return (
    <>
      <div className="no-print">
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'cases' && <PatientList onNavigate={setActiveTab} />}
          {activeTab === 'client' && <ClientIntake onNavigate={setActiveTab} />}
          {activeTab === 'therapist' && <TherapistEval />}
        </Layout>
      </div>
      
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