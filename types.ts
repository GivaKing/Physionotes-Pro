export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  job?: string;
  role: 'pending' | 'trial' | 'pt' | 'admin';
  trial_patient_limit: number;
}

export interface ClientData {
  name: string;
  age: string;
  gender: string;
  job: string;
  lifestyle: string[];
  diseases: string;
  surgery: string;
  meds: string;
  mainComplaint: string;
  painTypes: string[];
  duration: string;
  aggravating: string[];
  easing: string[];
  sleep: string;
  exercise: string;
  goals: string;
}

export interface VisitData {
  vasNow: number | null;
  vasMax: number | null;
}

export interface TherapistData {
  obsPosture: string;
  obsGait: string;
  rom: string;
  endFeel: string;
  jointPlay: string;
  muscleLength: string;
  neuralTension: string;
  specialTests: string;
  palpation: string;
  reasoningTags: string[];
  reasoning: string;
  planGoals: string[];
  treatmentPlan: string;
  homeExercise: string;
  followUp: string;
}

export interface PatientRecord {
  id: string; // Supabase ID or Temp ID
  user_id: string;
  created_at: string;
  name: string;
  raw_client: ClientData;
  visits: {
    id: string;
    created_at: string;
    vas_now: number | null;
    vas_max: number | null;
    raw_visit: VisitData;
    raw_therapist: TherapistData;
  }[];
}

// Initial States
export const INITIAL_CLIENT_DATA: ClientData = {
  name: '', age: '', gender: '', job: '', lifestyle: [],
  diseases: '', surgery: '', meds: '',
  mainComplaint: '', painTypes: [], duration: '',
  aggravating: [], easing: [], sleep: '', exercise: '', goals: ''
};

export const INITIAL_THERAPIST_DATA: TherapistData = {
  obsPosture: '', obsGait: '', rom: '', endFeel: '', jointPlay: '',
  muscleLength: '', neuralTension: '', specialTests: '', palpation: '',
  reasoningTags: [], reasoning: '', planGoals: [],
  treatmentPlan: '', homeExercise: '', followUp: ''
};
