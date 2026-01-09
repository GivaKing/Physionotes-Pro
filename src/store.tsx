
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { UserProfile, PatientCase, ClientData, TherapistData, VisitData } from './types';
import { PatientService } from './services/patientService';

interface AppState {
  user: UserProfile | null;
  loading: boolean;
  activeCase: PatientCase | null;
  cases: PatientCase[];
  // Actions
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, meta: any) => Promise<any>;
  logout: () => Promise<void>;
  loadCases: () => Promise<void>;
  createCase: (clientData: ClientData) => Promise<string>;
  updateClient: (id: string, clientData: ClientData) => Promise<void>; 
  saveVisit: (caseId: string, visit: VisitData, therapist: TherapistData, markDone?: boolean) => Promise<void>;
  updateVisit: (visitId: string, visit: VisitData, therapist: TherapistData) => Promise<void>; 
  deleteVisit: (visitId: string) => Promise<void>;
  setActiveCaseId: (id: string | null) => void;
  deleteCase: (id: string) => Promise<void>;
  importCases: (data: PatientCase[]) => Promise<{ success: number; fail: number }>;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    // Using any cast to bypass potential type mismatch with supabase-js versions
    const { data: authListener } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        // Do not force reload here to prevent double-fetching race conditions
        // checkUser is sufficient or handle specific logic
        if (!user) await checkUser(); 
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCases([]);
        setActiveCaseId(null);
        setLoading(false);
      }
    });
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      // 1. Safety Timeout: If Supabase doesn't respond in 2 seconds, stop loading to prevent infinite hang.
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth Timeout')), 3000));
      const sessionPromise = (supabase.auth as any).getSession();

      const { data: { session }, error: sessionError } = await Promise.race([sessionPromise, timeoutPromise]) as any;
      
      if (sessionError || !session) {
        setLoading(false);
        return;
      }

      // Fetch Profile (Non-blocking UI optimization: We can start this but allow UI to render if needed, though profile is fast)
      let profile = null;
      try {
          const { data, error } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();
          if (!error && data) profile = data;
      } catch (e) { console.log("Profile fetch warning:", e); }

      const meta = session.user.user_metadata;
      setUser({
        id: session.user.id,
        email: session.user.email!,
        role: profile?.role || 'trial',
        name: profile?.name || meta?.name || 'User',
        job: profile?.job || meta?.job || 'PT',
        patient_trial_limit: profile?.patient_trial_limit !== undefined ? profile.patient_trial_limit : 10, 
        maxPatients: profile?.patient_trial_limit || 10
      });
      
      // 2. CRITICAL OPTIMIZATION: 
      // Stop loading immediately after Auth is confirmed. 
      // Do NOT wait for `loadCasesInternal` (large data) to finish before showing the UI.
      setLoading(false);

      // 3. Load Data in Background
      loadCasesInternal(session.user.id);

    } catch (err) {
      console.error("Auth init error:", err);
      // Ensure we stop loading even if everything explodes
      setLoading(false);
    }
  };

  const loadCasesInternal = async (userId: string) => {
    try {
      const patients = await PatientService.fetchPatients(userId);

      const formattedCases: PatientCase[] = (patients || []).map((p: any) => {
        const rawC = p.raw_client || {};
        const normalizedClient: ClientData = { ...rawC, name: rawC.name || 'Unknown' };

        const rawVisits = p.visit || [];
        const records = rawVisits.map((v: any) => {
            const raw = v.raw_therapist || {};
            const rawVisit = v.raw_visit || {};

            return {
                id: v.id,
                visitDate: new Date(v.created_at).getTime(),
                visit: {
                    vasEntries: rawVisit.vasEntries || [],
                    vasNow: v.vas_now,
                    vasMax: v.vas_max,
                    subjectiveNotes: rawVisit.subjectiveNotes || ''
                },
                therapist: {
                    ...raw,
                    rom: raw.rom || {},
                    mmt: raw.mmt || {}, 
                    sttt: raw.sttt || {},
                    postureGrid: raw.postureGrid || {},
                    specialTests: raw.specialTests || [],
                    sessionGoals: raw.sessionGoals || []
                },
                status: 'done'
            };
        }).sort((a: any, b: any) => a.visitDate - b.visitDate);

        return {
            id: p.id,
            createdAt: new Date(p.created_at).getTime(),
            client: normalizedClient,
            records: records
        };
      });

      setCases(formattedCases);
    } catch (e) {
      console.error("Critical load error:", e);
    }
  };

  const login = async (email: string, pass: string) => {
    const { data, error } = await (supabase.auth as any).signInWithPassword({ email, password: pass });
    if (error) throw error;
    if (data.session) await checkUser();
    return data;
  };

  const signup = async (email: string, pass: string, meta: any) => {
    const { data, error } = await (supabase.auth as any).signUp({ 
      email, 
      password: pass,
      options: { data: { name: meta.name, job: meta.job } }
    });
    
    if (error) throw error;

    // 手動建立 Profile (適用於不需驗證信箱或驗證後自動登入的情境)
    if (data.user) {
        if (data.session) {
            const { error: profileError } = await supabase.from('profiles').insert({
                user_id: data.user.id,
                email: email,
                name: meta.name,
                job: meta.job,
                role: 'trial'
            });
            
            if (profileError) {
                console.error("Failed to create profile manually:", profileError);
            } else {
                await checkUser();
            }
        }
    }

    return data;
  };

  const logout = async () => {
    try {
        await (supabase.auth as any).signOut();
    } catch (error) {
        console.error("Logout API error:", error);
    } finally {
        localStorage.clear();
        setUser(null);
        setCases([]);
        setActiveCaseId(null);
        // Ensure loading is false after logout
        setLoading(false);
    }
  };

  const createCase = async (clientData: ClientData) => {
    if (!user) throw new Error("Not logged in");
    const data = await PatientService.createPatient(user.id, clientData);
    await loadCasesInternal(user.id);
    return data.id;
  };

  const updateClient = async (id: string, clientData: ClientData) => {
    if (!user) throw new Error("Not logged in");
    await PatientService.updatePatient(id, clientData);
    await loadCasesInternal(user.id);
  }

  const saveVisit = async (caseId: string, visit: VisitData, therapist: TherapistData, markDone = false) => {
    if (!user) return;
    await PatientService.createVisit(user.id, caseId, visit, therapist);
    await loadCasesInternal(user.id);
  };

  const updateVisit = async (visitId: string, visit: VisitData, therapist: TherapistData) => {
      if(!user) return;
      await PatientService.updateVisit(visitId, visit, therapist);
      await loadCasesInternal(user.id);
  }
  
  const deleteVisit = async (visitId: string) => {
    if (!user) return;
    await PatientService.deleteVisit(visitId);
    await loadCasesInternal(user.id);
  };

  const deleteCase = async (id: string) => {
     if(!user) return;
     setCases(prev => prev.filter(c => c.id !== id));
     if (activeCaseId === id) setActiveCaseId(null);
     
     try {
        await PatientService.deletePatient(id, user.id);
     } catch (e) {
         console.error("Delete failed, reloading", e);
         await loadCasesInternal(user.id);
         throw e;
     }
  }

  const importCases = async (dataList: PatientCase[]) => {
      if (!user) return { success: 0, fail: 0 };
      let success = 0;
      let fail = 0;

      for (const caseData of dataList) {
          try {
              console.log(`Importing: ${caseData.client?.name || 'Unknown'}`);
              await PatientService.importPatientData(user.id, caseData);
              success++;
          } catch (e: any) {
              console.error("Import error for case:", caseData.client?.name, e);
              fail++;
          }
      }
      
      await loadCasesInternal(user.id);
      return { success, fail };
  };

  const activeCase = cases.find(c => c.id === activeCaseId) || null;

  return (
    <AppContext.Provider value={{
      user, loading, activeCase, cases,
      login, signup, logout, loadCases: () => loadCasesInternal(user?.id || ''),
      createCase, updateClient, saveVisit, updateVisit, deleteVisit, setActiveCaseId, deleteCase, importCases
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
