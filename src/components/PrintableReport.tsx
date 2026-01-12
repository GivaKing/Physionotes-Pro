
import React from 'react';
import { 
  PatientCase, 
} from '../types';

interface PrintableReportProps {
  data: PatientCase | null;
  clinicName?: string;
  isForPreview?: boolean;
  therapistName?: string;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ 
  data, 
  clinicName = "PhysioNotes 臨床評估系統",
  isForPreview = false,
  therapistName
}) => {
  if (!data) return null;

  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const diff = Date.now() - new Date(dob).getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age > 0 ? age : 0;
  };

  const form = data.client;
  // Sort records by date ascending (oldest to newest)
  const records = [...data.records].sort((a, b) => a.visitDate - b.visitDate);

  // Calculate Latest Visit Date
  const latestDate = records.length > 0 
    ? new Date(records[records.length - 1].visitDate).toLocaleDateString()
    : new Date().toLocaleDateString();

  // Formatting Helpers
  const formatDeg = (val: string) => {
    if (!val) return '-';
    if (val.includes(',')) {
        const parts = val.split(',').map(s => s.trim());
        return `${parts[0]}° ~ ${parts[1]}°`;
    }
    return `${val}°`;
  };

  const formatMmt = (val: number) => {
    if (val === undefined || val === null) return '-';
    return Number.isInteger(val) ? `${val}` : `${Math.floor(val)}+`;
  };

  const formatPainDetail = (val?: string | string[]) => {
      if (!val) return '';
      
      let types: string[] = [];
      if (Array.isArray(val)) {
          types = val;
      } else if (typeof val === 'string') {
          // Legacy handling
          if (val === 'both') return ' (Con+Ecc)';
          types = [val];
      }
      
      if (types.length === 0) return '';

      const labels = types.map(t => {
          if (t === 'isometric') return 'Iso';
          if (t === 'concentric') return 'Con';
          if (t === 'eccentric') return 'Ecc';
          return t;
      });
      
      return ` (${labels.join('+')})`;
  };

  // Increased font size for SubHeader: text-xs -> text-sm
  const SubHeader = ({ title }: { title: string }) => (
    <div className="mb-4 mt-6 border-b-2 border-slate-800 pb-1 break-after-avoid page-break-after-avoid">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{title}</h4>
    </div>
  );

  return (
    <div className={`${isForPreview ? 'w-full p-12 bg-white min-h-screen' : 'print-only bg-white p-12'} mx-auto text-slate-900 font-sans leading-normal max-w-[210mm]`}>
      
      {/* 1. Report Header (Kept original sizes as requested) */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8 break-inside-avoid">
        <div className="self-end">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{clinicName}</h1>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">Physical Therapy Assessment Report</p>
        </div>
        <div className="text-right">
            <div className="mb-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Physical Therapist</div>
                <div className="text-lg font-black text-slate-900">{therapistName || '-'}</div>
            </div>
            <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latest Visit</div>
                <div className="text-sm font-mono font-bold text-slate-900">{latestDate}</div>
            </div>
        </div>
      </div>

      {/* 2. Comprehensive Patient Profile & History */}
      <div className="mb-8 break-inside-avoid section-container">
          <div className="border-b-2 border-slate-200 pb-1 mb-6 flex justify-between items-end">
              {/* text-sm -> text-base */}
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Patient Profile & History</h3>
              {((form.redFlags && form.redFlags.length > 0) || form.nightPain || form.weightLoss) && (
                  <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded border border-red-100">
                      RED FLAGS DETECTED
                  </div>
              )}
          </div>

          {/* A. Demographics - Increased text sizes */}
          <div className="grid grid-cols-4 gap-y-4 gap-x-8 text-sm mb-8">
              <div>
                  <span className="block font-bold text-slate-500 uppercase text-xs mb-1">Name</span>
                  <span className="font-bold text-slate-900 text-base">{form.name}</span>
              </div>
              <div>
                  <span className="block font-bold text-slate-500 uppercase text-xs mb-1">Gender / Age</span>
                  <span className="font-bold text-slate-900">{form.gender} / {calculateAge(form.dob)}</span>
              </div>
              <div>
                  <span className="block font-bold text-slate-500 uppercase text-xs mb-1">Occupation</span>
                  <span className="font-bold text-slate-900">{form.job || '-'}</span>
              </div>
              <div>
                  <span className="block font-bold text-slate-500 uppercase text-xs mb-1">Contact</span>
                  <div className="font-bold text-slate-900">{form.phone || '-'}</div>
                  <div className="text-[10px] text-slate-500">{form.email}</div>
              </div>
          </div>

          {/* B. Clinical Summary - Increased text sizes */}
          <div className="grid grid-cols-[1fr_2fr] gap-6 text-sm mb-8 bg-slate-50 p-6 rounded-lg border border-slate-100 break-inside-avoid">
              <div className="space-y-4">
                  <div>
                      <span className="block font-bold text-slate-500 uppercase text-xs mb-1">Medical Diagnosis</span>
                      <span className="font-bold text-slate-900 block">{form.diagnosis || 'N/A'}</span>
                  </div>
                  <div>
                      <span className="block font-bold text-slate-500 uppercase text-xs mb-1">Chief Complaint</span>
                      <span className="font-medium text-slate-900 block leading-relaxed">{form.chiefComplaint}</span>
                  </div>
              </div>
              <div className="space-y-4 border-l border-slate-200 pl-6">
                  <div>
                      <span className="block font-bold text-slate-500 uppercase text-xs mb-1">Present History</span>
                      <span className="text-slate-800 block leading-relaxed">{form.presentHistory || '-'}</span>
                  </div>
              </div>
          </div>

          {/* C. Detailed Medical History Grid - text-xs -> text-sm */}
          <div className="mb-8 break-inside-avoid">
              {/* Header: text-[10px] -> text-sm */}
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">Medical History & Screening</h4>
              <div className="grid grid-cols-3 gap-6 text-sm">
                  <div className="space-y-3">
                      <div>
                          <span className="text-slate-500 font-bold mr-1 block text-xs uppercase mb-0.5">Past History</span>
                          <span className="text-slate-900">{form.pastHistory || '-'}</span>
                      </div>
                      <div>
                          <span className="text-slate-500 font-bold mr-1 block text-xs uppercase mb-0.5">Family History</span>
                          <span className="text-slate-900">{form.familyHistory || '-'}</span>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <div>
                          <span className="text-slate-500 font-bold mr-1 block text-xs uppercase mb-0.5">Medical/Surgical</span>
                          <span className="text-slate-900">{[form.diseases, form.surgery].filter(Boolean).join(', ') || '-'}</span>
                      </div>
                      <div>
                          <span className="text-slate-500 font-bold mr-1 block text-xs uppercase mb-0.5">Medications</span>
                          <span className="text-slate-900">{form.meds || '-'}</span>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <div>
                          <span className="text-slate-500 font-bold mr-1 block text-xs uppercase mb-0.5">Imaging/Tests</span>
                          <span className="text-slate-900">{form.specialInvestigation || '-'}</span>
                      </div>
                      <div>
                          <span className="text-slate-500 font-bold mr-1 block text-xs uppercase mb-0.5">Red Flags</span>
                          <span className="text-red-700 font-bold">
                              {[
                                  ...(form.redFlags || []),
                                  form.nightPain ? 'Night Pain' : null,
                                  form.weightLoss ? 'Weight Loss' : null
                              ].filter(Boolean).join(', ') || 'None'}
                          </span>
                      </div>
                  </div>
              </div>
          </div>

          {/* D. Lifestyle & Environment - text-xs -> text-sm */}
          <div className="mb-8 break-inside-avoid">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">Lifestyle & Environment</h4>
              <div className="grid grid-cols-4 gap-6 text-sm">
                  <div>
                      <span className="block text-slate-500 font-bold text-xs mb-1">General Health / Habits</span>
                      <div className="text-slate-900">{form.generalHealth}</div>
                      <div className="text-slate-600 text-xs mt-0.5">{[form.smoking && `Smoking: ${form.smoking}`, form.alcohol && `Alcohol: ${form.alcohol}`].filter(Boolean).join(' | ')}</div>
                  </div>
                  <div>
                      <span className="block text-slate-500 font-bold text-xs mb-1">Work / Ergonomics</span>
                      <div className="text-slate-900">{form.ergonomics || '-'}</div>
                  </div>
                  <div>
                      <span className="block text-slate-500 font-bold text-xs mb-1">Sleep</span>
                      <div className="text-slate-900">{form.sleepQuality}</div>
                      <div className="text-slate-600 text-xs mt-0.5">{[form.sleepPosition, form.bedType, form.pillow].filter(Boolean).join(' | ')}</div>
                  </div>
                  <div>
                      <span className="block text-slate-500 font-bold text-xs mb-1">Sports / Activity</span>
                      <div className="text-slate-900">{form.sportLeisure || '-'}</div>
                      <div className="text-slate-600 text-xs mt-0.5">{form.fitness}</div>
                  </div>
              </div>
          </div>

          {/* E. Goals & Psycho - text-xs -> text-sm */}
          <div className="break-inside-avoid">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">Psychosocial & Goals</h4>
              <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                      <span className="text-slate-500 font-bold mr-1 block text-xs mb-1">Patient Expectations / Goals</span>
                      <span className="text-slate-900">{[form.expectation, form.goals].filter(Boolean).join(' | ') || '-'}</span>
                  </div>
                  <div>
                      <span className="text-slate-500 font-bold mr-1 block text-xs mb-1">Psychosocial Factors</span>
                      <span className="text-slate-900">{form.psychosocial || '-'}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. SOAP Records Loop */}
      <div className="space-y-14">
          {records.length === 0 ? (
            <div className="text-center text-slate-400 py-10 text-sm italic">無評估紀錄</div>
          ) : records.map((r, idx) => (
            <div key={r.id || idx} className="mt-8">
                {/* Session Header - Force Page Break Before New Session if needed */}
                <div className="flex items-baseline gap-4 mb-8 border-b-2 border-slate-200 pb-2 break-after-avoid page-break-after-avoid" style={{ breakInside: 'avoid' }}>
                    <span className="text-2xl font-black text-slate-900">SESSION {idx+1}</span>
                    <span className="text-base font-mono font-bold text-slate-500">{new Date(r.visitDate).toLocaleDateString()}</span>
                </div>

                {/* SOAP Grid Layout */}
                <div className="grid grid-cols-[50px_1fr] gap-4">
                    
                    {/* --- S: Subjective --- */}
                    <div className="pt-1">
                        <div className="text-xl font-black text-slate-900">S</div>
                    </div>
                    <div className="space-y-4 pb-6 mb-6 border-b border-slate-100 break-inside-avoid">
                        {r.visit.vasEntries?.map((vas, vIdx) => (
                            <div key={vIdx} className="text-sm">
                                <div className="font-bold text-slate-900 mb-1">
                                    {vas.part} ({vas.side}) - VAS: {vas.value}/10
                                </div>
                                <div className="text-slate-600 pl-3 border-l-2 border-slate-300 py-1">
                                    {[
                                        vas.painTypes?.length ? `Nature: ${vas.painTypes.join(', ')}` : null,
                                        vas.aggravating?.length ? `Agg: ${vas.aggravating.join(', ')}` : null,
                                        vas.easing?.length ? `Ease: ${vas.easing.join(', ')}` : null,
                                        vas.pattern24h ? `24h: ${vas.pattern24h}` : null
                                    ].filter(Boolean).join(' | ')}
                                </div>
                            </div>
                        ))}
                        {r.visit.subjectiveNotes && (
                            <div className="text-sm text-slate-800 mt-2">
                                <span className="font-bold block mb-1">Notes:</span>
                                <div className="whitespace-pre-wrap pl-2 leading-relaxed">{r.visit.subjectiveNotes}</div>
                            </div>
                        )}
                    </div>

                    {/* --- O: Objective --- */}
                    <div className="pt-1">
                        <div className="text-xl font-black text-slate-900">O</div>
                    </div>
                    <div className="space-y-4 pb-6 mb-6 border-b border-slate-100 break-inside-avoid text-sm">
                        {r.therapist.obsPosture && (
                            <div>
                                <span className="font-bold text-slate-900 mr-2">Posture:</span>
                                <span>{r.therapist.obsPosture}</span>
                            </div>
                        )}
                        {r.therapist.obsGait && (
                            <div>
                                <span className="font-bold text-slate-900 mr-2">Gait:</span>
                                <span>{r.therapist.obsGait}</span>
                            </div>
                        )}
                        {r.therapist.movementAnalysis && (
                            <div>
                                <span className="font-bold text-slate-900 mr-2">Movement:</span>
                                <span>{r.therapist.movementAnalysis}</span>
                            </div>
                        )}
                    </div>

                    {/* --- A: Assessment --- */}
                    <div className="pt-1">
                        <div className="text-xl font-black text-slate-900">A</div>
                    </div>
                    <div className="space-y-6 pb-6 mb-6 border-b border-slate-100">
                        
                        {/* 1. ROM - text-xs -> text-sm */}
                        {r.therapist.rom && Object.keys(r.therapist.rom).length > 0 && (
                            <div className="break-inside-avoid section-container">
                                <SubHeader title="ROM" />
                                {Object.entries(r.therapist.rom).map(([joint, moves]) => (
                                    <div key={joint} className="mb-4 break-inside-avoid">
                                        <div className="font-bold text-sm text-slate-900 mb-2 underline decoration-slate-300 underline-offset-2">{joint}</div>
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-300">
                                                    <th className="text-left py-1 font-bold w-1/3">Motion</th>
                                                    <th className="text-left py-1 font-bold w-1/3">Left (A/P)</th>
                                                    <th className="text-left py-1 font-bold w-1/3">Right (A/P)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(moves).map(([move, val]: [string, any]) => (
                                                    <tr key={move} className="border-b border-slate-100 last:border-0">
                                                        <td className="py-1 font-medium text-slate-700">{move}</td>
                                                        <td className="py-1 font-mono">{formatDeg(val.arom?.l)} / {formatDeg(val.prom?.l)}</td>
                                                        <td className="py-1 font-mono">{formatDeg(val.arom?.r)} / {formatDeg(val.prom?.r)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 2. MMT - text-xs -> text-sm */}
                        {r.therapist.mmt && Object.keys(r.therapist.mmt).length > 0 && (
                            <div className="break-inside-avoid section-container">
                                <SubHeader title="MMT" />
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                    {Object.entries(r.therapist.mmt).map(([joint, moves]) => (
                                        <div key={joint} className="break-inside-avoid">
                                            <div className="font-bold text-sm text-slate-900 mb-1 underline decoration-slate-300 underline-offset-2">{joint}</div>
                                            {Object.entries(moves).map(([move, val]: [string, any]) => (
                                                <div key={move} className="flex justify-between text-sm py-0.5 border-b border-dotted border-slate-200 last:border-0">
                                                    <span className="text-slate-700">{move}</span>
                                                    <span className="font-mono font-bold">L:{formatMmt(val.l)}  R:{formatMmt(val.r)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Joint Mobility - text-xs -> text-sm */}
                        {r.therapist.jointMobility && typeof r.therapist.jointMobility === 'object' && Object.keys(r.therapist.jointMobility).length > 0 && (
                            <div className="break-inside-avoid section-container">
                                <SubHeader title="Joint Mobility" />
                                <div className="space-y-4">
                                    {Object.entries(r.therapist.jointMobility).map(([region, data]: [string, any]) => (
                                        <div key={region} className="break-inside-avoid">
                                            <div className="text-sm font-bold text-slate-900 mb-1">{region}</div>
                                            
                                            {/* Joint Play */}
                                            {data.jointPlay && Object.keys(data.jointPlay).length > 0 && (
                                                <div className="text-sm mb-1 pl-2">
                                                    <span className="font-bold text-slate-700 mr-1">Joint Play:</span>
                                                    {Object.entries(data.jointPlay).map(([joint, val]: [string, any]) => 
                                                        `${joint} (${val.grade}${val.painful ? ' Pain' : ''})`
                                                    ).join(' | ')}
                                                </div>
                                            )}
                                            
                                            {/* End Feel */}
                                            {data.endFeel && Object.values(data.endFeel).some((v: any) => v.isAbnormal || v.painful) && (
                                                <div className="text-sm pl-2">
                                                    <span className="font-bold text-slate-700 mr-1">End-Feel:</span>
                                                    {Object.entries(data.endFeel)
                                                        .filter(([_, val]: [string, any]) => val.isAbnormal || val.painful)
                                                        .map(([motion, val]: [string, any]) => `${motion} (${val.type}${val.painful ? ' Pain' : ''})`)
                                                        .join(' | ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. STTT - text-xs -> text-sm */}
                        {r.therapist.sttt && Object.keys(r.therapist.sttt).length > 0 && (
                            <div className="break-inside-avoid section-container">
                                <SubHeader title="STTT" />
                                <div className="space-y-4">
                                    {Object.entries(r.therapist.sttt).map(([joint, moves]) => (
                                        <div key={joint} className="break-inside-avoid">
                                            <div className="text-sm font-bold text-slate-900 mb-1">{joint}</div>
                                            <div className="pl-2 space-y-1">
                                                {Object.entries(moves).map(([move, res]: [string, any]) => {
                                                    const findings = [
                                                        res.activePain && 'Active Pain', 
                                                        res.passivePain && 'Passive Pain', 
                                                        res.resistedPain && `Resisted Pain${formatPainDetail(res.painDetail)}`, 
                                                        res.resistedWeak && 'Weakness'
                                                    ].filter(Boolean);
                                                    if (!findings.length) return null;
                                                    return (
                                                        <div key={move} className="text-sm flex gap-2">
                                                            <span className="font-medium text-slate-700 w-24 shrink-0">{move}:</span> 
                                                            <span className="font-bold text-slate-900">{findings.join(', ')}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. Muscle Length (New) */}
                        {r.therapist.muscleLength && typeof r.therapist.muscleLength === 'object' && Object.keys(r.therapist.muscleLength).length > 0 && (
                            <div className="break-inside-avoid section-container">
                                <SubHeader title="Muscle Length" />
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    {Object.entries(r.therapist.muscleLength).map(([test, sides]: [string, any]) => (
                                        <div key={test} className="flex justify-between border-b border-dotted border-slate-200 py-1">
                                            <span className="font-medium text-slate-700 truncate pr-2">{test}</span>
                                            <div className="font-mono text-slate-900 text-xs flex gap-2">
                                                <span>L: {sides.l.result || 'Norm'} {sides.l.value ? `(${sides.l.value})` : ''}</span>
                                                <span>R: {sides.r.result || 'Norm'} {sides.r.value ? `(${sides.r.value})` : ''}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 6. Neuro Screening - text-xs -> text-sm */}
                        {r.therapist.neuroScreening && Object.keys(r.therapist.neuroScreening).length > 0 && (
                            <div className="break-inside-avoid section-container">
                                <SubHeader title="Neurological Screening" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(r.therapist.neuroScreening).map(([cat, tests]: [string, any]) => (
                                        <div key={cat} className="break-inside-avoid">
                                            <div className="font-bold text-sm text-slate-700 mb-1 capitalize border-b border-slate-100">{cat}</div>
                                            {Object.entries(tests).map(([test, val]: [string, any]) => (
                                                <div key={test} className="flex justify-between text-sm py-0.5">
                                                    <span className="text-slate-600">{test}</span>
                                                    <span className="font-mono font-bold">L:{val.l || '-'} R:{val.r || '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 7. Neural Tension - text-xs -> text-sm */}
                        {r.therapist.neuralTension && Object.keys(r.therapist.neuralTension).length > 0 && (
                            <div className="break-inside-avoid section-container">
                                <SubHeader title="Neural Tension" />
                                <div className="space-y-2">
                                    {Object.entries(r.therapist.neuralTension).map(([test, sides]: [string, any]) => (
                                        <div key={test} className="text-sm flex justify-between border-b border-dotted border-slate-200 py-1">
                                            <span className="font-medium text-slate-700">{test}</span>
                                            <div className="flex gap-4 font-mono">
                                                <span>L: {sides.l.positive ? '(+) ' : '(-)'} {sides.l.grade ? `Gr:${sides.l.grade}` : ''}</span>
                                                <span>R: {sides.r.positive ? '(+) ' : '(-)'} {sides.r.grade ? `Gr:${sides.r.grade}` : ''}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 8. Special Tests - text-xs -> text-sm */}
                        {r.therapist.specialTests && typeof r.therapist.specialTests !== 'string' && Object.keys(r.therapist.specialTests).length > 0 && (
                            <div className="break-inside-avoid section-container">
                                <SubHeader title="Special Tests" />
                                <div className="space-y-4">
                                    {Object.entries(r.therapist.specialTests as Record<string, any>).map(([joint, tests]) => (
                                        <div key={joint} className="break-inside-avoid">
                                            <div className="text-sm font-bold text-slate-900 mb-1">{joint}</div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                {Object.values(tests).map((test: any) => (
                                                    <div key={test.name} className="flex justify-between items-baseline text-sm border-b border-dotted border-slate-200 pb-1">
                                                        <span>
                                                            <span className="font-medium text-slate-700">{test.name}</span>
                                                            {test.note && <span className="text-slate-500 ml-1 text-xs">({test.note})</span>}
                                                        </span>
                                                        <span className="font-bold text-slate-900">
                                                            {test.result === 'positive' ? '(+) POS' : '(-) NEG'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 9. Soft Tissue - text-xs -> text-sm */}
                        {r.therapist.softTissue && (
                            <div className="break-inside-avoid section-container">
                                <SubHeader title="Soft Tissue / Palpation" />
                                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed pl-3 border-l-2 border-slate-200 py-1">
                                    {r.therapist.softTissue}
                                </div>
                            </div>
                        )}

                        {/* 10. Reasoning - text-xs -> text-sm */}
                        <div className="break-inside-avoid section-container">
                            <SubHeader title="Reasoning" />
                            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap mb-4">
                                {r.therapist.reasoning || 'No record'}
                            </div>
                            {r.therapist.clinicalImpression && (
                                <div className="text-sm font-bold text-slate-900 bg-slate-50 p-2 rounded">
                                    Impression: {r.therapist.clinicalImpression}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- P: Plan --- */}
                    <div className="pt-1">
                        <div className="text-xl font-black text-slate-900">P</div>
                    </div>
                    <div className="space-y-6">
                        <div className="break-inside-avoid">
                            <h5 className="text-sm font-bold text-slate-900 uppercase mb-2">Treatment Plan</h5>
                            <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed pl-3 border-l-2 border-slate-200 py-1">
                                {r.therapist.treatmentPlan || 'No content'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 break-inside-avoid">
                            <div>
                                <h5 className="text-sm font-bold text-slate-900 uppercase mb-2">Goals</h5>
                                <ul className="list-disc list-inside text-sm text-slate-800 space-y-1 pl-1">
                                    {r.therapist.sessionGoals?.map(g => <li key={g}>{g}</li>) || <li>-</li>}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-sm font-bold text-slate-900 uppercase mb-2">Home Exercise</h5>
                                <div className="text-sm text-slate-800 whitespace-pre-wrap pl-1 leading-relaxed">
                                    {r.therapist.homeEx || '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
          ))}
      </div>

      {/* 4. Footer */}
      <div className="mt-20 pt-4 border-t-2 border-slate-900 text-center break-inside-avoid page-break-inside-avoid">
          <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">PhysioNotes Pro Documentation</p>
          <p className="text-xs text-slate-500 mt-1">Confidential Medical Record • Professional Use Only</p>
      </div>
    </div>
  );
};
