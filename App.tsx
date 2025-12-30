import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './supabaseClient';
import { UserProfile, PatientRecord, ClientData, TherapistData, VisitData, INITIAL_CLIENT_DATA, INITIAL_THERAPIST_DATA } from './types';
import { ClientForm } from './components/ClientForm';
import { TherapistForm } from './components/TherapistForm';
import { Button, Input, Card, ChipGroup } from './components/UI';
import { LogOut, User, ClipboardList, Stethoscope, Users, Plus, Save, CheckCircle, Trash2, LineChart as IconChart, ArrowLeft, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Auth Component ---
const AuthScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('註冊成功！請聯繫管理員開通權限。');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-0">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">PhysioNotes Pro</h1>
        <p className="text-center text-slate-500 mb-6 text-sm">物理治療師專用評估系統</p>
        
        <div className="flex bg-slate-100 p-1 rounded-full mb-6">
          <button className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${isLogin ? 'bg-white shadow text-primary-600' : 'text-slate-500'}`} onClick={() => setIsLogin(true)}>登入</button>
          <button className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${!isLogin ? 'bg-white shadow text-primary-600' : 'text-slate-500'}`} onClick={() => setIsLogin(false)}>註冊</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="密碼" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          <Button type="submit" className="w-full" isLoading={loading}>{isLogin ? '登入' : '註冊'}</Button>
        </form>
      </Card>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'cases' | 'client' | 'therapist'>('cases');
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  
  // State for Current Editing
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientData>(INITIAL_CLIENT_DATA);
  const [therapistData, setTherapistData] = useState<TherapistData>(INITIAL_THERAPIST_DATA);
  const [visitData, setVisitData] = useState<VisitData>({ vasNow: null, vasMax: null });
  const [currentVisitId, setCurrentVisitId] = useState<string | null>(null); // To track which visit we are editing

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Check Session & Load Profile
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) { setProfile(null); setView('cases'); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (data) setProfile(data);
    
    // Also fetch patients
    fetchPatients();
    setLoading(false);
  };

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('*, visit(*)')
      .order('created_at', { ascending: false });
    
    if (data) {
        // Map Supabase response to our internal structure
        const mapped: PatientRecord[] = data.map((p: any) => ({
            id: p.id,
            user_id: p.user_id,
            created_at: p.created_at,
            name: p.name,
            raw_client: p.raw_client || {},
            visits: (p.visit || []).map((v: any) => ({
                id: v.id,
                created_at: v.created_at,
                vas_now: v.vas_now,
                vas_max: v.vas_max,
                raw_visit: v.raw_visit || {},
                raw_therapist: v.raw_therapist || {}
            })).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        }));
        setPatients(mapped);
    }
  };

  // 2. Actions
  const handleCreateNewCase = () => {
    if (profile?.role === 'trial' && patients.length >= profile.trial_patient_limit) {
        alert('試用版已達上限，請聯絡管理員升級。');
        return;
    }
    // Reset Forms
    setClientData(INITIAL_CLIENT_DATA);
    setTherapistData(INITIAL_THERAPIST_DATA);
    setVisitData({ vasNow: null, vasMax: null });
    setCurrentPatientId(null);
    setCurrentVisitId(null);
    setView('client');
  };

  const handleOpenCase = (patient: PatientRecord) => {
    setCurrentPatientId(patient.id);
    setClientData(patient.raw_client);
    
    // Load latest visit by default if exists
    const lastVisit = patient.visits[patient.visits.length - 1];
    if (lastVisit) {
        setTherapistData(lastVisit.raw_therapist);
        setVisitData({ vasNow: lastVisit.vas_now, vasMax: lastVisit.vas_max });
        setCurrentVisitId(lastVisit.id);
    } else {
        setTherapistData(INITIAL_THERAPIST_DATA);
        setVisitData({ vasNow: null, vasMax: null });
        setCurrentVisitId(null);
    }
    setView('client');
  };

  const handleCreateNewVisit = () => {
    if (!currentPatientId) return;
    // Keep client data, reset visit data
    setTherapistData(INITIAL_THERAPIST_DATA);
    setVisitData({ vasNow: null, vasMax: null });
    setCurrentVisitId(null); // New visit has no ID yet
    setView('client');
    alert('已建立新回診，請更新 VAS 並進行評估。');
  };

  const saveToSupabase = async () => {
    if (!session?.user) return;
    if (!clientData.name) { alert('請填寫姓名'); return; }
    if (visitData.vasNow === null) { alert('請填寫 VAS 疼痛指數'); return; }

    setLoading(true);
    try {
        let patientId = currentPatientId;

        // 1. Upsert Patient
        if (!patientId) {
            const { data: newPatient, error } = await supabase.from('patients').insert({
                user_id: session.user.id,
                name: clientData.name,
                age: clientData.age,
                gender: clientData.gender,
                job: clientData.job,
                main_complaint: clientData.mainComplaint,
                raw_client: clientData
            }).select().single();
            if (error) throw error;
            patientId = newPatient.id;
            setCurrentPatientId(patientId);
        } else {
             // Update existing patient info
             await supabase.from('patients').update({
                name: clientData.name,
                age: clientData.age,
                gender: clientData.gender,
                job: clientData.job,
                main_complaint: clientData.mainComplaint,
                raw_client: clientData
             }).eq('id', patientId);
        }

        // 2. Insert Visit (Always insert new if no ID, technically we could update if we tracked ID properly)
        // For simplicity: if currentVisitId exists, update it. If not, insert.
        if (currentVisitId) {
            const { error: vErr } = await supabase.from('visit').update({
                vas_now: visitData.vasNow,
                vas_max: visitData.vasMax,
                raw_visit: visitData,
                raw_therapist: therapistData
            }).eq('id', currentVisitId);
            if (vErr) throw vErr;
        } else {
            const { data: newVisit, error: vErr } = await supabase.from('visit').insert({
                user_id: session.user.id,
                patient_id: patientId,
                vas_now: visitData.vasNow,
                vas_max: visitData.vasMax,
                raw_visit: visitData,
                raw_therapist: therapistData
            }).select().single();
            if (vErr) throw vErr;
            setCurrentVisitId(newVisit.id);
        }

        await fetchPatients(); // Refresh list
        alert('儲存成功！');
    } catch (err: any) {
        alert('儲存失敗: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  // --- Render ---

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  if (!session) return <AuthScreen onLogin={() => {}} />;

  // Filtered Patients
  const filteredPatients = patients.filter(p => p.name.includes(searchTerm) || p.raw_client.mainComplaint?.includes(searchTerm));

  // Chart Data Preparation
  const chartData = currentPatientId 
    ? patients.find(p => p.id === currentPatientId)?.visits.map((v, i) => ({
        name: `V${i+1}`,
        Now: v.vas_now,
        Max: v.vas_max
      })) 
    : [];

  return (
    <div className="min-h-screen pb-10 bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
              <ClipboardList size={20} />
            </div>
            <h1 className="font-bold text-slate-800 hidden sm:block">PhysioNotes</h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">{profile?.role}</span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Tabs in Header for Desktop */}
             <div className="hidden md:flex bg-slate-100 p-1 rounded-full">
                <button onClick={() => setView('cases')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'cases' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>個案管理</button>
                <button onClick={() => setView('client')} disabled={!currentPatientId && view === 'cases'} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-30 ${view === 'client' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>個案資料</button>
                <button onClick={() => setView('therapist')} disabled={!currentPatientId && view === 'cases'} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-30 ${view === 'therapist' ? 'bg-white shadow text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}>治療評估</button>
             </div>

             <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 hidden sm:block">{profile?.name || session.user.email.split('@')[0]}</span>
                <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}><LogOut size={16}/></Button>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Cases View */}
        {view === 'cases' && (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-800">個案管理</h2>
                    <Button onClick={handleCreateNewCase}><Plus size={18} className="mr-2"/> 新增個案</Button>
                </div>
                
                <div className="relative">
                    <Input placeholder="搜尋姓名或主訴..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPatients.map(p => {
                        const lastVisit = p.visits[p.visits.length - 1];
                        return (
                            <div key={p.id} onClick={() => handleOpenCase(p)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary-600 transition-colors">{p.name}</h3>
                                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{p.visits.length} 次</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-3 line-clamp-2 min-h-[40px]">{p.raw_client.mainComplaint || "無主訴記錄"}</p>
                                <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-100">
                                    <span>VAS: {lastVisit?.vas_now ?? '-'} / {lastVisit?.vas_max ?? '-'}</span>
                                    <span>{new Date(lastVisit?.created_at || p.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )
                    })}
                    {filteredPatients.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            沒有找到相關個案
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Client / Therapist View */}
        {view !== 'cases' && (
            <div>
                 {/* Sub-nav for Mobile */}
                 <div className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button onClick={() => setView('cases')} className="whitespace-nowrap px-3 py-1.5 bg-white border rounded-full text-sm text-slate-600"><ArrowLeft size={16} className="inline mr-1"/> 返回列表</button>
                    <button onClick={() => setView('client')} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm border ${view === 'client' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-slate-200'}`}>個案資料</button>
                    <button onClick={() => setView('therapist')} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm border ${view === 'therapist' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200'}`}>治療評估</button>
                 </div>

                 {/* Patient Summary Header */}
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-slate-800">{clientData.name || '新個案'}</h2>
                            <span className="text-sm text-slate-500">{clientData.age ? `${clientData.age}歲` : ''} {clientData.gender}</span>
                        </div>
                        <p className="text-sm text-slate-500">{clientData.mainComplaint || '尚未填寫主訴'}</p>
                    </div>
                    {/* Pain Chart Mini */}
                    {chartData && chartData.length > 0 && (
                        <div className="h-16 w-32 md:w-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <Line type="monotone" dataKey="Now" stroke="#2563eb" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Max" stroke="#ef4444" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                 </div>
                
                 {/* Form Content */}
                 {view === 'client' && (
                     <ClientForm 
                        data={clientData} 
                        visitData={visitData} 
                        onChange={setClientData} 
                        onVisitChange={setVisitData} 
                     />
                 )}
                 {view === 'therapist' && (
                     <TherapistForm 
                        data={therapistData} 
                        onChange={setTherapistData} 
                     />
                 )}
            </div>
        )}

      </main>

      {/* Floating Action Bar */}
      {view !== 'cases' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-5xl mx-auto flex justify-between items-center gap-3">
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setView('cases')} className="hidden md:flex">返回列表</Button>
                    {currentPatientId && <Button variant="outline" size="sm" onClick={handleCreateNewVisit}>+ 新增回診</Button>}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {view === 'client' ? (
                        <Button className="flex-1 md:flex-none w-full" onClick={() => setView('therapist')}>下一步: 治療評估 <ArrowRight size={16} className="ml-2"/></Button>
                    ) : (
                        <Button className="flex-1 md:flex-none w-full bg-green-600 hover:bg-green-700" onClick={saveToSupabase} isLoading={loading}>
                            <Save size={16} className="mr-2"/> 完成並儲存
                        </Button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Entry Point ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}