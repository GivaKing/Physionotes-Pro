
export interface RomValue {
  l: string;
  r: string;
}

export interface RomJointData {
  [movement: string]: {
    arom: RomValue;
    prom: RomValue;
  };
}

export interface MmtValue {
  l: number;
  r: number;
}

export interface MmtJointData {
  [movement: string]: MmtValue;
}

export interface StttMoveResult {
  activePain?: boolean;
  passivePain?: boolean;
  resistedPain?: boolean;
  resistedWeak?: boolean;
}

export interface StttJointData {
  [movement: string]: StttMoveResult;
}

export interface SpecialTestResult {
  name: string;
  result: 'positive' | 'negative' | 'inconclusive' | '';
  note: string;
}

export interface SpecialTestJointData {
  [testName: string]: SpecialTestResult;
}

// --- Joint Mobility Types (New) ---
export interface JointPlayItem {
  grade: string; // 0-6 Kaltenborn scale
  painful?: boolean; // New: Pain indicator
  notes?: string;
}

export interface EndFeelItem {
  type: string; // Normal, Hard, Soft, Firm, Empty, etc.
  isAbnormal: boolean;
  painful?: boolean; // New: Pain indicator
}

export interface JointMobilityRegionData {
  jointPlay: Record<string, JointPlayItem>; // key: Specific Joint Name (e.g. "GH Joint")
  endFeel: Record<string, EndFeelItem>; // key: Movement Name (e.g. "Flexion")
  notes: string;
}

export interface JointMobilityData {
  [region: string]: JointMobilityRegionData;
}

// --- Neural Tension Types ---
export interface NeuralTensionSide {
  grade: '0' | '1' | '2' | '3' | ''; // Tsai's 2008 Grading
  positive: boolean; // Reproduction of symptoms
  angle?: string; // Optional angle or note
}

export interface NeuralTensionTestItem {
  l: NeuralTensionSide;
  r: NeuralTensionSide;
}

export interface NeuralTensionData {
  [testName: string]: NeuralTensionTestItem;
}

// --- Neurological Screening Types (New) ---
export interface NeuroValue {
  l: string;
  r: string;
}

export interface NeuroTestItem {
  [testName: string]: NeuroValue;
}

export interface NeuroScreeningData {
  [category: string]: NeuroTestItem;
}

export interface PostureGridData {
  head?: string[];
  cervical?: string[];
  scapula?: string[];   
  humerus?: string[];
  radius?: string[];    
  ulna?: string[];      
  wristHand?: string[]; 
  thoracic?: string[];
  lumbar?: string[];
  ribs?: string[];      
  ilium?: string[];     
  sacrum?: string[];    
  femur?: string[];     
  patella?: string[];   
  tibia?: string[];     
  fibulaHead?: string[];   
  fibulaDistal?: string[]; 
  footAnkle?: string[]; 
}

// --- New Structured Gait Analysis Types ---
export interface GaitPhaseDetail {
    timing: 'Normal' | 'Prolonged' | 'Shortened' | 'Absent';
    deviations: string[];
}

export interface GaitDetails {
    [phaseId: string]: GaitPhaseDetail;
}

// Exported PHASES constant for shared use across components
export const PHASES = [
    { id: 'IC', name: 'Initial Contact', label: 'Initial Contact', abbr: 'IC', type: 'Stance', pct: '0-2%' },
    { id: 'LR', name: 'Loading Response', label: 'Loading Response', abbr: 'LR', type: 'Stance', pct: '0-10%' },
    { id: 'MSt', name: 'Mid Stance', label: 'Mid Stance', abbr: 'MSt', type: 'Stance', pct: '10-30%' },
    { id: 'TSt', name: 'Terminal Stance', label: 'Terminal Stance', abbr: 'TSt', type: 'Stance', pct: '30-50%' },
    { id: 'PSw', name: 'Pre Swing', label: 'Pre Swing', abbr: 'PSw', type: 'Stance', pct: '50-60%' },
    { id: 'ISw', name: 'Initial Swing', label: 'Initial Swing', abbr: 'ISw', type: 'Swing', pct: '60-73%' },
    { id: 'MSw', name: 'Mid Swing', label: 'Mid Swing', abbr: 'MSw', type: 'Swing', pct: '73-87%' },
    { id: 'TSw', name: 'Terminal Swing', label: 'Terminal Swing', abbr: 'TSw', type: 'Swing', pct: '87-100%' }
];

export interface GaitGridData {
  trunkPelvis?: string[];
  hip?: string[];
  knee?: string[];
  ankleFoot?: string[];
  phases?: string[];
}

export interface ClientData {
  name: string;
  dob: string;
  gender: string;
  job: string;
  phone?: string;
  email?: string; 
  chiefComplaint: string;    
  diagnosis?: string; 
  presentHistory: string; 
  pastHistory?: string;     
  familyHistory?: string;   
  diseases: string;         
  surgery: string;          
  meds: string;             
  specialInvestigation: string; 
  generalHealth?: string;   
  weightLoss?: boolean;     
  smoking?: string;         
  alcohol?: string;         
  fitness?: string;         
  ergonomics: string;       
  sleepQuality?: string;    
  sleepPosition: string; 
  bedType?: string;         
  pillow?: string;          
  shoe?: string;            
  sportLeisure: string; 
  insole?: string;          
  psychosocial: string;     
  expectation: string; 
  goals: string; 
  redFlags?: string[];
  nightPain: boolean;
  mechanism?: string;
  duration?: string;
  aggravating?: string[];
  easing?: string[];
  painTypes?: string[];
  irritability?: string;
  pattern24h?: string;
  radiation?: string;
  associatedSx?: string;
  progression?: string;
}

export interface VasRecord {
  part: string;
  customPart?: string; // New: For 'Other' custom entries
  side?: string; 
  value: number;
  radiation?: string;       
  painTypes?: string[];     
  depth?: string;           
  irritability?: string;    
  duration?: string;        
  mechanism?: string;       
  aggravating?: string[];   
  easing?: string[];        
  progression?: string;     
  associatedSx?: string;    
  pattern24h?: string;      
  timeToOnset?: string;     
  timeToSubside?: string;   
}

export interface VisitData {
  vasEntries: VasRecord[];
  vasNow?: number;
  vasMax?: number;
  subjectiveNotes?: string;
}

export interface TherapistData {
  postureGrid?: PostureGridData; 
  gaitGrid?: GaitGridData; // Legacy / Summary
  gaitDetails?: GaitDetails; // New Detailed Structure
  obsPosture: string; 
  obsGait: string;
  movementAnalysis: string; 
  sttt?: Record<string, StttJointData>;
  softTissue: string;     
  testsNerve: string; 
  neuroScreening?: NeuroScreeningData; 
  neuralTension?: NeuralTensionData;
  endFeel?: string; // Legacy
  jointMobility?: JointMobilityData | string; // Updated to support object structure
  muscleLength?: string;
  specialTests: Record<string, SpecialTestJointData> | string; 
  testsJoint: string; // Legacy fallback
  rom: Record<string, RomJointData>; 
  mmt: Record<string, MmtJointData>; 
  reasonTags: string[];   
  reasoning: string;
  clinicalImpression: string; 
  sessionGoals?: string[]; 
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

// Granular Body Parts Categorization
export const BODY_PARTS_GROUPS = [
  {
    label: '中軸 Spine & Head',
    items: [
      'Head (頭部)', 'TMJ (顳顎關節)', 'C0-C2 (上頸椎)', 'C3-C7 (下頸椎)', 
      'T1-T6 (上胸椎)', 'T7-T12 (下胸椎)', 'Ribs (肋骨)', 'L1-L5 (腰椎)', 
      'Sacrum (薦椎)', 'SIJ (薦髂關節)', 'Coccyx (尾椎)'
    ]
  },
  {
    label: '上肢 Upper Extremity',
    items: [
      'Scapula (肩胛骨)', 'Clavicle (鎖骨)', 'AC Joint (肩鎖關節)', 'Shoulder (肩關節)', 
      'Humerus (肱骨)', 'Elbow (肘關節)', 'Radius (骨骨)', 'Ulna (尺骨)', 
      'Wrist (手腕)', 'Carpals (腕骨)', 'Hand/Palm (手掌)', 'Fingers (手指)'
    ]
  },
  {
    label: '下肢 Lower Extremity',
    items: [
      'Ilium / Pelvis (髂骨/骨盆)', 'Pubis (恥骨)', 'Hip (髖關節)', 'Femur (股骨/大腿)', 
      'Patella (髕骨)', 'Knee (膝關節)', 'Tibia (脛骨/小腿)', 'Fibula (腓骨)', 
      'Ankle (腳踝)', 'Subtalar Joint (距下關節)', 'Heel (足跟)', 'Mid-foot (中足)', 
      'Forefoot (前足)', 'Toes (足趾)'
    ]
  }
];

// Legacy fallback
export const BODY_PARTS_LIST = BODY_PARTS_GROUPS.flatMap(g => g.items);

export const RED_FLAGS_LIST = [
  '癌症病史 (History of Cancer)',
  '不明原因體重減輕 (Unexplained Weight Loss)',
  '夜間持續性疼痛/無法緩解 (Constant Night Pain)',
  '持續發燒或夜間盜汗 (Fever / Night sweats)',
  '近期嚴重創傷 (Recent Trauma / Fracture risk)',
  '長期使用類固醇 (Prolonged Corticosteroid use)',
  '大小便失禁或滯留 (Bowel/Bladder dysfunction)',
  '馬鞍區麻木 (Saddle anesthesia)',
  '雙側神經症狀 (Bilateral neurological symptoms)',
  '5D/3N 椎基底動脈症狀 (VBI Insufficiency Symptoms)',
  '免疫系統抑制 (Immunosuppression)',
  '休息無法緩解之劇痛 (Severe pain unaffected by rest)'
];

export const ROM_OPTIONS: Record<string, Record<string, [number, number]>> = {
  'TMJ (顳顎關節)': { 'Opening': [0, 40], 'Protrusion': [0, 8], 'Lateral L': [0, 10], 'Lateral R': [0, 10] },
  'Cervical (頸椎)': { 'Flexion': [0, 45], 'Extension': [0, 45], 'Side Bend L': [0, 45], 'Side Bend R': [0, 45], 'Rotation L': [0, 60], 'Rotation R': [0, 60] },
  'Thoracic (胸椎)': { 'Flexion': [0, 45], 'Extension': [0, 25], 'Rotation L': [0, 35], 'Rotation R': [0, 35], 'Side Bend L': [0, 25], 'Side Bend R': [0, 25] },
  'Lumbar (腰椎)': { 'Flexion': [0, 60], 'Extension': [0, 25], 'Side Bend L': [0, 25], 'Side Bend R': [0, 25], 'Rotation L': [0, 30], 'Rotation R': [0, 30] },
  'Shoulder (肩膀)': { 'Flexion': [0, 180], 'Extension': [0, 60], 'Abduction': [0, 180], 'Horizontal Abd': [0, 45], 'Horizontal Add': [0, 135], 'ER (90 Abd)': [0, 90], 'IR (90 Abd)': [0, 70] },
  'Elbow (手肘)': { 'Flexion': [0, 150], 'Extension': [0, 0], 'Supination': [0, 80], 'Pronation': [0, 80] },
  'Wrist (手腕)': { 'Flexion': [0, 80], 'Extension': [0, 70], 'Ulnar Dev': [0, 30], 'Radial Dev': [0, 20] },
  'Hip (髖關節)': { 'Flexion': [0, 120], 'Extension': [0, 30], 'Abduction': [0, 45], 'Adduction': [0, 30], 'ER': [0, 45], 'IR': [0, 45] },
  'Knee (膝蓋)': { 'Flexion': [0, 135], 'Extension': [0, 0] },
  'Ankle (腳踝)': { 'DF': [0, 20], 'PF': [0, 50], 'Inversion': [0, 35], 'Eversion': [0, 15] },
  'Foot/Toes (足/趾)': { 'Great Toe Ext': [0, 70], 'Great Toe Flex': [0, 45], 'MTP Flexion': [0, 40] }
};

export const MMT_OPTIONS: Record<string, string[]> = {
  'Cervical (頸椎)': ['Flexion', 'Extension', 'Rotation', 'Side Bend'],
  'Scapula (肩胛)': ['Protraction (Serratus)', 'Retraction (Traps)', 'Elevation (Levator)', 'Depression (Lower Traps)'],
  'Shoulder (肩膀)': ['Flexion', 'Extension', 'Abduction', 'Adduction', 'ER', 'IR', 'Scaption'],
  'Elbow (手肘)': ['Flexion', 'Extension', 'Supination', 'Pronation'],
  'Wrist (手腕)': ['Flexion', 'Extension', 'Radial Dev', 'Ulnar Dev'],
  'Hip (髖關節)': ['Flexion (Psoas)', 'Extension (Glute Max)', 'Abduction (Glute Med)', 'Adduction', 'ER', 'IR'],
  'Knee (膝蓋)': ['Flexion (Hamstrings)', 'Extension (Quads)'],
  'Ankle (腳踝)': ['Dorsiflexion (Tib Ant)', 'Plantarfexion (Gas-Soleus)', 'Inversion', 'Eversion'],
  'Toes (足趾)': ['Great Toe Ext', 'Great Toe Flex']
};

export const STTT_OPTIONS: Record<string, string[]> = {
  'Cervical (頸椎)': ['Flexion', 'Extension', 'Side Bend L', 'Side Bend R', 'Rotation L', 'Rotation R'],
  'Shoulder (肩膀)': ['Flexion', 'Extension', 'Abduction', 'Adduction', 'ER', 'IR', 'Elbow Flexion (Biceps)', 'Elbow Extension (Triceps)'],
  'Elbow (手肘)': ['Flexion', 'Extension', 'Supination', 'Pronation', 'Wrist Extension', 'Wrist Flexion'],
  'Wrist (手腕)': ['Flexion', 'Extension', 'Radial Dev', 'Ulnar Dev', 'Finger Ext', 'Finger Flex'],
  'Hip (髖關節)': ['Flexion', 'Extension', 'Abduction', 'Adduction', 'ER', 'IR'],
  'Knee (膝蓋)': ['Flexion', 'Extension'],
  'Ankle (腳踝)': ['Dorsiflexion', 'Plantarflexion', 'Inversion', 'Eversion'],
  'Foot/Toes (足/趾)': ['Great Toe Ext', 'Great Toe Flex', 'Toe Ext/Flex']
};

// --- JOINT PLAY DATABASE ---
export const JOINT_PLAY_DB: Record<string, string[]> = {
  'Cervical (頸椎)': [
    'OA Joint (C0-C1) Distraction', 'OA Joint (C0-C1) AP Glide', 'AA Joint (C1-C2) Rotation',
    'C2-C7 Facet Joint UP-Slide (Flex)', 'C2-C7 Facet Joint Down-Slide (Ext)', 'C2-C7 PA Glide (Central)', 'C2-C7 PA Glide (Unilateral)'
  ],
  'Thoracic (胸椎)': [
    'T-Spine PA Glide (Central)', 'T-Spine PA Glide (Unilateral)', 'Costovertebral Joint Glide', 'Costotransverse Joint Glide', 'Rib Springing'
  ],
  'Lumbar (腰椎)': [
    'L-Spine PA Glide (Central)', 'L-Spine PA Glide (Unilateral)', 'L-Spine Rotation PPIVM', 'L-Spine Sidebend PPIVM'
  ],
  'SIJ (薦髂關節)': [
    'Sacral Nutation', 'Sacral Counternutation', 'Ilium Anterior Rotation', 'Ilium Posterior Rotation'
  ],
  'Shoulder (肩膀)': [
    'GH Joint Distraction', 'GH Joint Caudal Glide (Abd)', 'GH Joint Posterior Glide (Flex/IR)', 'GH Joint Anterior Glide (Ext/ER)',
    'AC Joint AP Glide', 'SC Joint AP/Sup/Inf Glide', 'Scapulothoracic Mobility'
  ],
  'Elbow (手肘)': [
    'Humeroulnar Distraction', 'Humeroulnar Distal Glide', 'Humeroradial Distraction', 'Humeroradial Volar/Dorsal Glide',
    'Prox. Radioulnar AP/PA Glide'
  ],
  'Wrist/Hand (手腕/手)': [
    'Distal Radioulnar AP/PA Glide', 'Radiocarpal Distraction', 'Radiocarpal Volar Glide (Ext)', 'Radiocarpal Dorsal Glide (Flex)',
    'Radiocarpal Ulnar Glide (Radial Dev)', 'Radiocarpal Radial Glide (Ulnar Dev)', 'Midcarpal Glide', 'CMC/MCP/IP Glides'
  ],
  'Hip (髖關節)': [
    'Hip Distraction (Long Axis)', 'Hip Lateral Distraction', 'Hip Caudal Glide (Flex)', 'Hip Posterior Glide (Flex/IR)', 'Hip Anterior Glide (Ext/ER)'
  ],
  'Knee (膝蓋)': [
    'Tibiofemoral Distraction', 'Tibiofemoral Anterior Glide (Ext)', 'Tibiofemoral Posterior Glide (Flex)',
    'Patellofemoral Distal Glide', 'Patellofemoral Medial/Lateral Glide', 'Prox. Tibiofibular AP/PA Glide'
  ],
  'Ankle/Foot (足踝)': [
    'Talocrural Distraction', 'Talocrural Posterior Glide (DF)', 'Talocrural Anterior Glide (PF)',
    'Subtalar Joint Med/Lat Glide', 'Distal Tibiofibular AP/PA Glide', 'Midtarsal Joint Mobility', 'MTP/IP Joint Mobility'
  ]
};

// --- END FEEL DATABASE (Updated with more normal values) ---
export const END_FEEL_DB: Record<string, { motion: string, normal: string[] }[]> = {
  'Shoulder (肩膀)': [
    { motion: 'Flexion', normal: ['Firm'] }, { motion: 'Extension', normal: ['Firm'] },
    { motion: 'Abduction', normal: ['Firm'] }, { motion: 'Adduction', normal: ['Firm', 'Soft'] },
    { motion: 'ER', normal: ['Firm'] }, { motion: 'IR', normal: ['Firm'] }
  ],
  'Elbow (手肘)': [
    { motion: 'Flexion', normal: ['Soft'] }, { motion: 'Extension', normal: ['Hard', 'Firm'] },
    { motion: 'Supination', normal: ['Firm'] }, { motion: 'Pronation', normal: ['Hard', 'Firm'] }
  ],
  'Wrist/Hand (手腕/手)': [
    { motion: 'Flexion', normal: ['Firm'] }, { motion: 'Extension', normal: ['Firm'] },
    { motion: 'Radial Dev', normal: ['Hard', 'Firm'] }, { motion: 'Ulnar Dev', normal: ['Firm'] },
    { motion: 'Finger Flexion', normal: ['Firm', 'Hard'] }, { motion: 'Finger Extension', normal: ['Firm'] }
  ],
  'Hip (髖關節)': [
    { motion: 'Flexion', normal: ['Soft'] }, { motion: 'Extension', normal: ['Firm'] },
    { motion: 'Abduction', normal: ['Firm'] }, { motion: 'Adduction', normal: ['Firm'] },
    { motion: 'ER', normal: ['Firm'] }, { motion: 'IR', normal: ['Firm'] }
  ],
  'Knee (膝蓋)': [
    { motion: 'Flexion', normal: ['Soft'] }, { motion: 'Extension', normal: ['Firm', 'Hard'] },
    { motion: 'Tibial IR', normal: ['Firm'] }, { motion: 'Tibial ER', normal: ['Firm'] }
  ],
  'Ankle/Foot (足踝)': [
    { motion: 'Dorsiflexion', normal: ['Firm'] }, { motion: 'Plantarflexion', normal: ['Firm'] },
    { motion: 'Inversion', normal: ['Firm'] }, { motion: 'Eversion', normal: ['Hard', 'Firm'] },
    { motion: 'Toe Flexion', normal: ['Firm'] }, { motion: 'Toe Extension', normal: ['Firm'] }
  ],
  'Cervical (頸椎)': [
    { motion: 'Flexion', normal: ['Firm'] }, { motion: 'Extension', normal: ['Hard', 'Firm'] },
    { motion: 'Side Bend', normal: ['Firm'] }, { motion: 'Rotation', normal: ['Firm'] }
  ],
  'Thoracic (胸椎)': [
    { motion: 'Flexion', normal: ['Firm'] }, { motion: 'Extension', normal: ['Hard', 'Firm'] },
    { motion: 'Side Bend', normal: ['Firm'] }, { motion: 'Rotation', normal: ['Firm'] }
  ],
  'Lumbar (腰椎)': [
    { motion: 'Flexion', normal: ['Firm'] }, { motion: 'Extension', normal: ['Hard', 'Firm'] },
    { motion: 'Side Bend', normal: ['Firm'] }, { motion: 'Rotation', normal: ['Firm'] }
  ],
  'SIJ (薦髂關節)': [
    { motion: 'Nutation', normal: ['Firm'] }, { motion: 'Counternutation', normal: ['Firm'] }
  ]
};

export interface CapsularPatternRule {
    pattern: string; // Description like "ER > Abd > IR"
    check: (loss: Record<string, number>) => boolean;
}

export const CAPSULAR_PATTERNS: Record<string, CapsularPatternRule> = {
    'Shoulder (肩膀)': {
        pattern: 'ER > Abd > IR',
        check: (loss) => loss['ER (90 Abd)'] > loss['Abduction'] && loss['Abduction'] > loss['IR (90 Abd)'] && loss['ER (90 Abd)'] > 0.2 // Min 20% loss to trigger
    },
    'Elbow (手肘)': {
        pattern: 'Flexion > Extension',
        check: (loss) => loss['Flexion'] > loss['Extension'] && loss['Flexion'] > 0.1
    },
    'Wrist (手腕)': {
        pattern: 'Flexion = Extension',
        check: (loss) => Math.abs(loss['Flexion'] - loss['Extension']) < 0.15 && loss['Flexion'] > 0.1
    },
    'Hip (髖關節)': {
        pattern: 'Flexion > Abduction > IR', // Cyriax Pattern
        check: (loss) => loss['Flexion'] > loss['Abduction'] && loss['Abduction'] > loss['IR'] && loss['Flexion'] > 0.1
    },
    'Knee (膝蓋)': {
        pattern: 'Flexion > Extension',
        check: (loss) => loss['Flexion'] > loss['Extension'] && loss['Flexion'] > 0.1
    },
    'Ankle (腳踝)': {
        pattern: 'Plantarflexion > Dorsiflexion',
        check: (loss) => loss['PF'] > loss['DF'] && loss['PF'] > 0.1
    }
};

export const NEURAL_TESTS_LIST = [
    // Upper Limb
    { id: 'ULNT 1', label: 'ULNT 1 (Median)', region: 'Upper', category: 'ULTT Series' },
    { id: 'ULNT 2a', label: 'ULNT 2a (Median)', region: 'Upper', category: 'ULTT Series' },
    { id: 'ULNT 2b', label: 'ULNT 2b (Radial)', region: 'Upper', category: 'ULTT Series' },
    { id: 'ULNT 3', label: 'ULNT 3 (Ulnar)', region: 'Upper', category: 'ULTT Series' },
    // Lower Limb - SLR Series
    { id: 'SLR (Basic)', label: 'SLR (Sciatic/Tibial)', region: 'Lower', category: 'SLR Series' },
    { id: 'SLR 2 (Tibial)', label: 'SLR 2 (Tibial - TED)', region: 'Lower', category: 'SLR Series' },
    { id: 'SLR 3 (Sural)', label: 'SLR 3 (Sural - SID)', region: 'Lower', category: 'SLR Series' },
    { id: 'SLR 4 (Peroneal)', label: 'SLR 4 (Com. Peroneal - PIP)', region: 'Lower', category: 'SLR Series' },
    { id: 'Crossed SLR', label: 'Crossed SLR (Disc Herniation)', region: 'Lower', category: 'SLR Series' },
    // Lower Limb - Slump Series
    { id: 'Slump (ST1)', label: 'Slump ST1 (Standard)', region: 'Lower', category: 'Slump Series' },
    { id: 'Slump (ST2)', label: 'Slump ST2 (w/ Abd)', region: 'Lower', category: 'Slump Series' },
    { id: 'Slump (ST3)', label: 'Slump ST3 (Side-Lying)', region: 'Lower', category: 'Slump Series' },
    { id: 'Slump (ST4)', label: 'Slump ST4 (Long Sitting)', region: 'Lower', category: 'Slump Series' },
    // Lower Limb - PKB Series
    { id: 'PKB 1 (Basic)', label: 'PKB 1 (Femoral/L2-L4)', region: 'Lower', category: 'PKB Series' },
    { id: 'PKB 2 (LFCN)', label: 'PKB 2 (Lat. Fem. Cutaneous)', region: 'Lower', category: 'PKB Series' },
    { id: 'PKE (Saphenous)', label: 'PKE (Saphenous N.)', region: 'Lower', category: 'PKB Series' },
];

export const NEURAL_GRADES = [
    { val: '0', label: '0', desc: '0: Initial Range' },
    { val: '1', label: 'I', desc: 'I: No End Feel (Linear)' },
    { val: '2', label: 'II', desc: 'II: End Feel (Plastic)' },
    { val: '3', label: 'III', desc: 'III: Anatomic Block' },
];

export const SPECIAL_TEST_DB: Record<string, { name: string; purpose: string; stats?: string }[]> = {
  'Cervical (頸椎)': [
    { name: "Spurling's Test", purpose: "Cervical Radiculopathy (Foraminal Compression)", stats: "High Spec (0.92), Low Sens" },
    { name: "Distraction Test", purpose: "Relief of Radicular Symptoms", stats: "High Spec (0.90)" },
    { name: "Sharp-Purser Test", purpose: "Atlantoaxial Instability", stats: "Spec: 0.96" },
    { name: "Alar Ligament Test", purpose: "Alar Ligament Integrity", stats: "" }
  ],
  'Shoulder (肩膀)': [
    { name: "Neer's Test", purpose: "Subacromial Impingement", stats: "High Sens (0.79)" },
    { name: "Hawkins-Kennedy", purpose: "Subacromial Impingement", stats: "High Sens (0.79)" },
    { name: "Empty Can (Jobe)", purpose: "Supraspinatus Tear/Pathology", stats: "Sens: 0.44, Spec: 0.90" },
    { name: "Drop Arm Test", purpose: "Full Thickness RC Tear", stats: "High Spec (0.98)" },
    { name: "Speed's Test", purpose: "Biceps Pathology / SLAP", stats: "Mod Sens/Spec" },
    { name: "Yergason's Test", purpose: "Biceps Tendon / Transverse Lig.", stats: "High Spec (0.86)" },
    { name: "O'Brien's Test", purpose: "SLAP Lesion (Active Compression)", stats: "High Spec if pain deep" },
    { name: "Apprehension Test", purpose: "Anterior Instability", stats: "High Spec (0.99)" },
    { name: "Relocation Test", purpose: "Confirms Anterior Instability", stats: "" },
    { name: "Sulcus Sign", purpose: "Inferior Instability", stats: "" },
    { name: "Hornblower's Sign", purpose: "Teres Minor Tear", stats: "Spec: 0.93" },
    { name: "Bear Hug Test", purpose: "Subscapularis Tear", stats: "Sens: 0.60, Spec: 0.91" }
  ],
  'Elbow (手肘)': [
    { name: "Cozen's Test", purpose: "Lateral Epicondylitis", stats: "High Sens" },
    { name: "Mill's Test", purpose: "Lateral Epicondylitis", stats: "" },
    { name: "Maudsley's Test", purpose: "Lateral Epicondylitis (3rd digit ext)", stats: "" },
    { name: "Golfer's Elbow Test", purpose: "Medial Epicondylitis", stats: "" },
    { name: "Valgus Stress Test", purpose: "UCL Instability", stats: "Sens: 0.65" },
    { name: "Varus Stress Test", purpose: "RCL Instability", stats: "" },
    { name: "Tinel's Sign (Elbow)", purpose: "Cubital Tunnel Syn. (Ulnar n.)", stats: "Sens: 0.70" }
  ],
  'Wrist (手腕/手)': [
    { name: "Phalen's Test", purpose: "Carpal Tunnel Syndrome", stats: "Sens: 0.68, Spec: 0.73" },
    { name: "Reverse Phalen's", purpose: "Carpal Tunnel Syndrome", stats: "" },
    { name: "Tinel's Sign (Wrist)", purpose: "Median Nerve Compression", stats: "Sens: 0.50, Spec: 0.77" },
    { name: "Finkelstein's Test", purpose: "De Quervain's Tenosynovitis", stats: "High Sens, Low Spec" },
    { name: "Froment's Sign", purpose: "Ulnar Nerve Palsy", stats: "" },
    { name: "Watson's Shift", purpose: "Scaphoid Instability", stats: "" }
  ],
  'Lumbar (腰椎)': [
    { name: "Straight Leg Raise (SLR)", purpose: "Lumbar Radiculopathy (Herniation)", stats: "High Sens (0.91)" },
    { name: "Crossed SLR", purpose: "Lumbar Herniation", stats: "High Spec (0.88)" },
    { name: "Slump Test", purpose: "Neural Tension / Dural", stats: "Sens: 0.84, Spec: 0.83" },
    { name: "Prone Instability", purpose: "Lumbar Instability", stats: "Spec: 0.82" },
    { name: "Quadrant Test", purpose: "Facet Joint / Foraminal Closure", stats: "High Sens" },
    { name: "Stork Test", purpose: "Spondylolisthesis / Pars Defect", stats: "" }
  ],
  'SIJ (薦髂關節)': [
    { name: "Thigh Thrust", purpose: "SIJ Pain Provocation", stats: "Sens: 0.88" },
    { name: "Distraction (Gapping)", purpose: "SIJ Pain Provocation", stats: "Spec: 0.81" },
    { name: "Compression", purpose: "SIJ Pain Provocation", stats: "Spec: 0.69" },
    { name: "Sacral Thrust", purpose: "SIJ Pain Provocation", stats: "" },
    { name: "Gaenslen's Test", purpose: "SIJ Pain Provocation", stats: "" },
    { name: "FABER (Patrick's)", purpose: "SIJ / Hip Pathology", stats: "Sens: 0.57, Spec: 0.71" }
  ],
  'Hip (髖關節)': [
    { name: "FADIR Test", purpose: "FAI / Labral Tear", stats: "High Sens (0.99), Low Spec" },
    { name: "Thomas Test", purpose: "Hip Flexor Tightness", stats: "" },
    { name: "Ober's Test", purpose: "IT Band / TFL Tightness", stats: "" },
    { name: "Trendelenburg Sign", purpose: "Glute Medius Weakness", stats: "" },
    { name: "Log Roll Test", purpose: "Intra-articular Pathology", stats: "" },
    { name: "Scour Test", purpose: "Labral / OA", stats: "Sens: 0.62" }
  ],
  'Knee (膝蓋)': [
    { name: "Lachman Test", purpose: "ACL Rupture", stats: "High Sens (0.85), High Spec (0.94)" },
    { name: "Anterior Drawer", purpose: "ACL Rupture", stats: "Sens: 0.49, Spec: 0.58" },
    { name: "Posterior Drawer", purpose: "PCL Rupture", stats: "High Sens/Spec" },
    { name: "Valgus Stress (0/30)", purpose: "MCL Injury", stats: "High Sens (0.86)" },
    { name: "Varus Stress (0/30)", purpose: "LCL Injury", stats: "" },
    { name: "McMurray Test", purpose: "Meniscal Tear", stats: "Spec: 0.77" },
    { name: "Thessaly Test (20°)", purpose: "Meniscal Tear", stats: "Sens: 0.90, Spec: 0.96" },
    { name: "Patellar Grind (Clarke's)", purpose: "PFPS / Chondromalacia", stats: "Low Spec" },
    { name: "Apprehension (Patella)", purpose: "Patellar Instability", stats: "" }
  ],
  'Foot/Ankle (足踝)': [
    { name: "Anterior Drawer", purpose: "ATFL Injury", stats: "Sens: 0.86" },
    { name: "Talar Tilt", purpose: "CFL Injury", stats: "Spec: 0.88" },
    { name: "Thompson Test", purpose: "Achilles Rupture", stats: "Sens: 0.96, Spec: 0.93" },
    { name: "Kleiger's (ER) Test", purpose: "Syndesmosis (High Ankle) / Deltoid", stats: "" },
    { name: "Squeeze Test", purpose: "Syndesmosis Injury", stats: "High Spec" },
    { name: "Windlass Test", purpose: "Plantar Fasciitis", stats: "Spec: 1.00" }
  ]
};

// Comprehensive Neuro DB
export const NEURO_OPTIONS: Record<string, { label: string; tests: string[]; options: string[] }> = {
  'dermatomes': {
    label: 'Dermatomes (Sensory)',
    tests: ['C4 (Upper Trap)', 'C5 (Deltoid)', 'C6 (Thumb)', 'C7 (Middle Finger)', 'C8 (Little Finger)', 'T1 (Medial Arm)', 'L2 (Ant. Thigh)', 'L3 (Med. Knee)', 'L4 (Med. Malleolus)', 'L5 (Dorsum Foot)', 'S1 (Lat. Foot)', 'S2 (Post. Knee)'],
    options: ['Intact', 'Impaired (Hypo)', 'Absent', 'Hyper', 'Allodynia']
  },
  'myotomes': {
    label: 'Myotomes (Motor)',
    tests: ['C1/C2 (Neck Flex)', 'C3 (Neck Side Bend)', 'C4 (Shoulder Elev)', 'C5 (Shoulder Abd)', 'C6 (Elbow Flex/Wrist Ext)', 'C7 (Elbow Ext/Wrist Flex)', 'C8 (Thumb Ext)', 'T1 (Finger Abd)', 'L2 (Hip Flex)', 'L3 (Knee Ext)', 'L4 (Ankle DF)', 'L5 (Great Toe Ext)', 'S1 (Ankle PF)', 'S2 (Knee Flex)'],
    options: ['5 (Normal)', '4 (Good)', '3 (Fair)', '2 (Poor)', '1 (Trace)', '0 (Zero)']
  },
  'reflexes': {
    label: 'DTR (Reflexes)',
    tests: ['C5 (Biceps)', 'C6 (Brachioradialis)', 'C7 (Triceps)', 'L3/L4 (Patellar)', 'S1 (Achilles)'],
    options: ['2+ (Normal)', '0 (Absent)', '1+ (Hypo)', '3+ (Hyper)', '4+ (Clonus)']
  },
  'pathological': {
    label: 'Pathological Signs (UMN)',
    tests: ['Babinski Sign', 'Hoffman\'s Sign', 'Ankle Clonus', 'Oppenheim Test', 'Inverted Supinator'],
    options: ['Negative (-)', 'Positive (+)', 'Indeterminate']
  },
  'tone': {
    label: 'Muscle Tone (MAS)',
    tests: ['Elbow Flexors', 'Elbow Extensors', 'Wrist Flexors', 'Knee Flexors', 'Knee Extensors', 'Ankle Plantarflexors'],
    options: ['0 (Normal)', '1 (Slight)', '1+ (Catch+Resist)', '2 (Marked)', '3 (Difficult)', '4 (Rigid)']
  },
  'coordination': {
    label: 'Coordination / Cerebellar',
    tests: ['Finger-to-Nose', 'Heel-to-Shin', 'Rapid Alternating Mvmt', 'Romberg Test', 'Tandem Gait'],
    options: ['Normal', 'Impaired (Dysmetria)', 'Ataxic', 'Unable to Perform']
  }
};
