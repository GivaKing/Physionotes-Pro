
export interface RomValue {
  l: string;
  r: string;
}

export interface RomJointData {
  [movement: string]: RomValue;
}

export interface ClientData {
  // Basic
  name: string;
  dob: string;
  gender: string;
  job: string;
  phone?: string;
  
  // Subjective / PDF Fields
  mainComplaint: string; 
  mechanism: string; 
  diagnosis?: string; 
  
  // Symptoms Pattern
  painTypes: string[];
  duration: string;
  irritability: string; 
  pattern24h: string; 
  nightPain: boolean; 
  aggravating: string[];
  easing: string[];
  
  // History
  presentHistory: string; 
  diseases: string;    
  surgery: string;     
  meds: string;        
  specialInvestigation: string; 
  
  // Environment / Lifestyle
  ergonomics: string; 
  sleepPosition: string; 
  sportLeisure: string; 
  lifestyle?: string[];
  
  // Psychosocial (Cognitive/Affective)
  psychosocial: string; 
  
  // Goals
  expectation: string; 
  goals: string; 

  // Flags
  redFlags?: string[];
}

export interface VasRecord {
  part: string;
  value: number;
}

export interface VisitData {
  vasEntries: VasRecord[];
  vasNow?: number;
  vasMax?: number;
  subjectiveNotes?: string;
}

export interface TherapistData {
  // Objective
  obsPosture: string;
  obsGait: string;
  movementAnalysis: string; 
  
  // Assessment - Specific Tests
  softTissue: string;     // Renamed from palpation to match JSON
  
  testsNerve: string;     // Renamed from neuroTension to match JSON
  
  endFeel?: string;
  jointMobility?: string;
  muscleLength?: string;

  specialTests: { name: string; result: 'positive' | 'negative' | 'n/a'; note: string }[] | any[]; 
  testsJoint: string;     // Matched JSON key for "testsJoint" (usually string text)

  rom: Record<string, RomJointData> | any; 
  reasonTags: string[];   // Renamed from reasoningTags to match JSON
  
  reasoning: string;
  clinicalImpression: string; 

  // Plan
  planGoals: string[];    
  shortTermGoals?: string;
  longTermGoals?: string;
  
  treatmentPlan: string;
  homeEx: string;         
  
  followUp: string;       
  nextAppointment?: string; 
}

export interface CaseRecord {
  id?: string;
  visitDate: number;
  visit: VisitData;
  therapist: TherapistData;
  status: 'draft' | 'done';
}

export interface PatientCase {
  id?: string;
  createdAt: number;
  client: ClientData;
  records: CaseRecord[];
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  job?: string;
  role: 'admin' | 'pt' | 'trial' | 'pending';
  patient_trial_limit?: number; 
  maxPatients?: number; 
}

// Data Lists
export const BODY_PARTS_LIST = [
  'Cervical (頸椎)', 'Shoulder (肩膀)', 'Elbow (手肘)', 'Wrist/Hand (手腕/手)', 
  'Thoracic (胸椎/上背)', 'Lumbar (腰椎/下背)', 'Hip (髖關節)', 
  'Knee (膝蓋)', 'Ankle/Foot (腳踝/足部)'
];

export const RED_FLAGS_LIST = [
  '夜間疼痛 (Night Pain)', 
  '不明原因體重減輕 (Unexplained Weight Loss)', 
  '馬尾症候群症狀 (Cauda Equina Symptoms)', 
  '嚴重創傷/骨折疑慮 (Trauma/Fracture)',
  '惡性腫瘤病史 (History of Cancer)',
  '持續發燒/感染跡象 (Fever/Infection)',
  '嚴重的神經學缺損 (Severe Neuro Deficit)'
];

export const ROM_OPTIONS: Record<string, Record<string, number>> = {
  'Cervical (頸椎)': { 'Flexion': 45, 'Extension': 45, 'Rotation': 60, 'Side Bend': 45 },
  'Lumbar (腰椎)': { 'Flexion': 60, 'Extension': 25, 'Rotation': 30, 'Side Bend': 25 },
  'Shoulder (肩膀)': { 'Flexion': 180, 'Extension': 60, 'Abduction': 180, 'ER': 90, 'IR': 70 },
  'Elbow (手肘)': { 'Flexion': 150, 'Extension': 0, 'Supination': 80, 'Pronation': 80 },
  'Wrist (手腕)': { 'Flexion': 80, 'Extension': 70, 'Ulnar Dev': 30, 'Radial Dev': 20 },
  'Hip (髖關節)': { 'Flexion': 120, 'Extension': 30, 'Abduction': 45, 'Adduction': 30, 'ER': 45, 'IR': 45 },
  'Knee (膝蓋)': { 'Flexion': 135, 'Extension': 0 },
  'Ankle (腳踝)': { 'DF': 20, 'PF': 50, 'Inversion': 30, 'Eversion': 15 }
};
