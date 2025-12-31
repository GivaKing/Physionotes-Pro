
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { UserProfile, PatientCase, ClientData, TherapistData, VisitData } from './types';

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
  saveVisit: (caseId: string, visit: VisitData, therapist: TherapistData, markDone?: boolean) => Promise<void>;
  deleteVisit: (visitId: string) => Promise<void>;
  setActiveCaseId: (id: string | null) => void;
  deleteCase: (id: string) => Promise<void>;
  importCase: (data: PatientCase) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  // Initial Auth Check
  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await checkUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCases([]);
        setActiveCaseId(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setLoading(false);
        return;
      }

      // Try to fetch profile
      let profile = null;
      try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          profile = data;
      } catch (e) {
          console.log("No profile found, using default.");
      }

      setUser({
        id: session.user.id,
        email: session.user.email!,
        role: profile?.role || 'trial',
        name: profile?.name || session.user.user_metadata?.name || 'User',
        job: profile?.job || 'PT',
        patient_trial_limit: profile?.patient_trial_limit !== undefined ? profile.patient_trial_limit : 10, 
        maxPatients: profile?.patient_trial_limit || 10
      });
      
      await loadCasesInternal(session.user.id);
    } catch (err) {
      console.error("Auth init error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCasesInternal = async (userId: string) => {
    console.log("🔄 Loading cases for User ID:", userId);
    try {
      // 1. 嘗試完整讀取 (包含 Visits)
      // FIX: Use the specific CONSTRAINT NAME 'visit_patient_id_fkey' to resolve ambiguity.
      // If this fails, it means the constraint name in your DB is different. 
      // You can check it in Supabase Dashboard -> Database -> Tables -> visit -> Foreign Keys.
      const { data: patients, error } = await supabase
        .from('patients')
        .select(`
          id, created_at, raw_client,
          visit!visit_patient_id_fkey ( id, created_at, vas_now, vas_max, raw_visit, raw_therapist )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      let sourceData = patients;

      // 2. 如果主要查詢失敗 (通常是 Foreign Key 問題)，嘗試降級查詢 (只查病患)
      if (error) {
        console.error("⚠️ Main query failed. Trying fallback...", error.message);
        
        const { data: fallbackPatients, error: fallbackError } = await supabase
            .from('patients')
            .select('id, created_at, raw_client')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
            
        if (fallbackError) {
            console.error("❌ Fallback query also failed:", fallbackError.message);
            return;
        }
        console.log("✅ Fallback query success. Showing patients without visits.");
        sourceData = fallbackPatients;
      }

      if (!sourceData) {
          setCases([]);
          return;
      }

      const formattedCases: PatientCase[] = sourceData.map((p: any) => {
        const rawC = p.raw_client || {};
        
        const normalizedClient: ClientData = {
            ...rawC,
            name: rawC.name || 'Unknown',
            mainComplaint: rawC.mainComplaint || '',
            diseases: rawC.diseases || rawC.medicalHistory || '',
            surgery: rawC.surgery || rawC.surgeryHistory || '',
            meds: rawC.meds || rawC.medication || '',
        };

        // 如果是降級查詢，可能沒有 p.visit (注意這裡用 visit 而非 visit!hint 讀取 JS 物件)
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
                    // Spread raw first to catch any unstructured data
                    ...raw,
                    // Explicitly map key fields to ensure they aren't overwritten by defaults if they exist in alternate keys
                    homeEx: raw.homeEx || raw.homeExercise || '',
                    softTissue: raw.softTissue || raw.palpation || '',
                    testsNerve: raw.testsNerve || raw.neuroTension || '',
                    reasonTags: raw.reasonTags || raw.reasoningTags || [],
                    planGoals: Array.isArray(raw.planGoals) ? raw.planGoals : [],
                    rom: raw.rom || {}
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

      console.log(`✅ Loaded ${formattedCases.length} cases.`);
      setCases(formattedCases);
    } catch (e) {
      console.error("Critical load error:", e);
    }
  };

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    if (data.session) await checkUser();
    return data;
  };

  const signup = async (email: string, pass: string, meta: any) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: { data: { name: meta.name } }
    });
    if (error) throw error;
    
    if (data.user) {
        // Try create profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          user_id: data.user.id,
          email: email,
          name: meta.name,
          job: meta.job,
          role: 'trial'
        });
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
    setCases([]);
    setActiveCaseId(null);
  };

  const createCase = async (clientData: ClientData) => {
    if (!user) throw new Error("Not logged in");

    const getAge = (dob: string) => {
      if (!dob) return null;
      const ageDifMs = Date.now() - new Date(dob).getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const { data, error } = await supabase.from('patients').insert({
      user_id: user.id,
      name: clientData.name,
      age: getAge(clientData.dob),
      gender: clientData.gender,
      job: clientData.job,
      main_complaint: clientData.mainComplaint,
      raw_client: clientData
    }).select().single();

    if (error) throw error;
    await loadCasesInternal(user.id);
    return data.id;
  };

  const saveVisit = async (caseId: string, visit: VisitData, therapist: TherapistData, markDone = false) => {
    if (!user) return;
    
    // Create a robust payload that saves current data to both new and legacy keys
    // This ensures backward compatibility if the schema changes later
    const payloadTherapist = {
        ...therapist,
        softTissue: therapist.softTissue,
        testsNerve: therapist.testsNerve,
        reasonTags: therapist.reasonTags,
        homeEx: therapist.homeEx,
        // Legacy support copies
        palpation: therapist.softTissue, 
        neuroTension: therapist.testsNerve,
        reasoningTags: therapist.reasonTags,
        homeExercise: therapist.homeEx
    };

    const { error } = await supabase.from('visit').insert({
      user_id: user.id,
      patient_id: caseId,
      vas_now: visit.vasNow,
      vas_max: visit.vasMax,
      raw_visit: visit,
      raw_therapist: payloadTherapist
    });

    if (error) throw error;
    await loadCasesInternal(user.id);
  };
  
  const deleteVisit = async (visitId: string) => {
    if (!user) return;
    const { error } = await supabase.from('visit').delete().eq('id', visitId);
    if (error) throw error;
    await loadCasesInternal(user.id);
  };

  const deleteCase = async (id: string) => {
     if(!user) return;
     
     // 1. Delete visits manually (safer if cascade is missing in DB)
     const { error: vError } = await supabase.from('visit').delete().eq('patient_id', id);
     if (vError) console.warn("Visit delete warning (might be already deleted):", vError);

     // 2. Delete patient
     const { error } = await supabase.from('patients').delete().eq('id', id);
     if (error) throw error;

     if (activeCaseId === id) setActiveCaseId(null);
     await loadCasesInternal(user.id);
  }

  const importCase = async (caseData: PatientCase) => {
      if (!user) return;
      
      const { data: newPatient, error: pError } = await supabase.from('patients').insert({
          user_id: user.id,
          name: caseData.client.name + " (Import)",
          age: 0, 
          gender: caseData.client.gender,
          job: caseData.client.job,
          main_complaint: caseData.client.mainComplaint,
          raw_client: caseData.client
      }).select().single();

      if (pError) throw pError;
      
      const visitsToInsert = caseData.records.map(r => ({
          user_id: user.id,
          patient_id: newPatient.id,
          vas_now: r.visit.vasNow,
          vas_max: r.visit.vasMax,
          raw_visit: r.visit,
          raw_therapist: r.therapist,
          created_at: new Date(r.visitDate).toISOString()
      }));

      if (visitsToInsert.length > 0) {
          await supabase.from('visit').insert(visitsToInsert);
      }

      await loadCasesInternal(user.id);
  };

  const activeCase = cases.find(c => c.id === activeCaseId) || null;

  return (
    <AppContext.Provider value={{
      user, loading, activeCase, cases,
      login, signup, logout, loadCases: () => loadCasesInternal(user?.id || ''),
      createCase, saveVisit, deleteVisit, setActiveCaseId, deleteCase, importCase
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
