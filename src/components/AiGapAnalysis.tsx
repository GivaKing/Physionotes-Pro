
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { TherapistData, VisitData, ClientData } from '../types';

interface AiGapAnalysisProps {
    client: ClientData;
    visit: VisitData;
    tData: TherapistData;
}

export const AiGapAnalysis: React.FC<AiGapAnalysisProps> = ({ client, visit, tData }) => {
    const [suggestions, setSuggestions] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Helper to calculate age from DOB safely
    const calculateAge = (dob: string) => {
        if (!dob) return 'Unknown';
        const diff = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const analyzeGaps = async () => {
        setLoading(true);
        setSuggestions(null);

        try {
            // Fix: Use safe access for import.meta.env
            const apiKey = (import.meta.env && import.meta.env.VITE_API_KEY) || '';
            if (!apiKey) {
                throw new Error("API Key 尚未設定 (VITE_API_KEY)");
            }
            const ai = new GoogleGenAI({ apiKey });
            
            // SECURITY: Sanitize PII. Only send clinically relevant data.
            // Removed: client.name, client.phone, client.email
            const safeClientInfo = `Gender: ${client.gender}, Age: ${calculateAge(client.dob)}, Job: ${client.job}`;
            
            const prompt = `
                你是一位嚴格的物理治療臨床導師。請快速檢視學生的評估資料，指出「還缺什麼測試」才能確診，或是「哪裡不合理」。

                [去識別化個案資料]
                基本: ${safeClientInfo}
                主訴: ${client.chiefComplaint}
                S: ${JSON.stringify(visit.vasEntries.map(v => ({ part: v.part, val: v.value, type: v.painTypes })))} 
                O: 姿勢:${tData.obsPosture}, 步態:${tData.obsGait}
                A: ROM:${JSON.stringify(tData.rom)}, MMT:${JSON.stringify(tData.mmt)}, STTT:${JSON.stringify(tData.sttt)}, 特殊測試:${JSON.stringify(tData.specialTests)}

                [回答規則]
                1. 請直接列點 (Bullet points)。
                2. **極度簡潔**，每一點不要超過 20 個字。
                3. 不要廢話，直接說缺什麼或是什麼怪怪的。
                4. 範例：「缺 End-feel 測試以確認五十肩」、「症狀不符機械性模式，需排除 Red Flag」、「需補測 Slump Test 確認神經張力」。
                5. 最多列出 3-4 點關鍵建議。
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview', // Use Flash for speed
                contents: prompt,
                config: { temperature: 0.3 } // Low temperature for precise, concise answers
            });

            const cleanText = (response.text || "").replace(/\*\*/g, '').trim();
            setSuggestions(cleanText || "無特別建議。");
        } catch (error: any) {
            console.error("AI Gap Analysis Error:", error);
            setSuggestions(`分析連線失敗: ${error.message || '未知錯誤'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50 rounded-2xl border border-amber-200 shadow-sm overflow-hidden relative group mt-4">
            <div className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">下一步提示 (Gap Analysis)</h4>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Missing Tests & Logic Check</p>
                    </div>
                </div>

                {!suggestions && !loading && (
                    <button 
                        onClick={analyzeGaps}
                        className="bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        分析缺漏測試
                    </button>
                )}
            </div>

            {loading && (
                <div className="px-5 pb-5 animate-pulse flex items-center gap-2 text-xs font-bold text-amber-600">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    正在掃描邏輯漏洞...
                </div>
            )}

            {suggestions && (
                <div className="px-5 pb-5 animate-fade-in">
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                        <ul className="space-y-1.5">
                            {suggestions.split('\n').filter(s => s.trim()).map((line, i) => (
                                <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">➤</span>
                                    <span>{line.replace(/^[-*•]\s*/, '')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-end mt-2">
                        <button onClick={analyzeGaps} className="text-[10px] text-slate-400 hover:text-amber-600 font-bold underline decoration-dotted">
                            重新分析
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
