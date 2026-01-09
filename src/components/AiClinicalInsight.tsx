
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { TherapistData, VisitData, ClientData } from '../types';

interface AiClinicalInsightProps {
    client: ClientData;
    visit: VisitData;
    tData: TherapistData;
}

export const AiClinicalInsight: React.FC<AiClinicalInsightProps> = ({ client, visit, tData }) => {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    // Helper to calculate age from DOB safely
    const calculateAge = (dob: string) => {
        if (!dob) return 'Unknown';
        const diff = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const generateInsight = async () => {
        setLoading(true);
        setInsight(null);
        
        const loadingSteps = [
            "正在彙整臨床數據 (去識別化)...",
            "分析 Subjective 疼痛特徵...",
            "運算動作力學與組織關聯...",
            "比對理學檢查表現...",
            "建構臨床推理模型..."
        ];

        let stepIndex = 0;
        const interval = setInterval(() => {
            setLoadingText(loadingSteps[stepIndex % loadingSteps.length]);
            stepIndex++;
        }, 1500);

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
                你是一位具備 20 年經驗的物理治療臨床專家與教授。
                請根據以下個案數據進行深度的臨床推理。

                要求：
                1. 語氣：請使用自然、專業且流暢的敘事口吻。避免死板的機器人式條列。
                2. 格式：絕對不要使用任何 Markdown 符號（如 **、#、*、-、>）。請用標題引導段落即可。
                3. 重點：專注於解釋「為什麼」會痛，而非只是重複數據。

                [去識別化個案資料]
                個案背景: ${safeClientInfo}
                主訴: ${client.chiefComplaint}
                S 評估: ${JSON.stringify(visit.vasEntries.map(v => ({ part: v.part, val: v.value, nature: v.painTypes, agg: v.aggravating, ease: v.easing })))}
                O 評估 (姿勢/步態/動作): ${tData.obsPosture}, ${tData.obsGait}, ${tData.movementAnalysis}
                A 評估 (ROM/MMT/STTT): ROM: ${JSON.stringify(tData.rom)}, MMT: ${JSON.stringify(tData.mmt)}, 特殊測試: ${JSON.stringify(tData.specialTests)}, 神經張力: ${JSON.stringify(tData.neuralTension)}

                回覆內容應包含：
                一、臨床印象總結：綜合 S 與 O 的關聯性描述。
                二、受損組織推理：根據動作表現與理學檢查，推論可能的解剖構造損害。
                三、病理力學分析：解釋姿勢、動作如何導致目前的症狀，找出可能的代償機制。
                四、鑑別診斷建議：列出最可能的臨床診斷，並簡述理由。
                五、後續建議：包含紅旗警訊提醒與下一步的關鍵評估方向。
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: { temperature: 0.6 }
            });

            // Clean up any remaining markdown just in case
            const cleanText = (response.text || "")
                .replace(/\*\*|\*|#|[-]{2,}|[>]/g, '')
                .trim();

            setInsight(cleanText || "無法生成洞察，請稍後再試。");
        } catch (error: any) {
            console.error("AI Insight Error:", error);
            setInsight(`AI 分析過程出錯: ${error.message || '未知錯誤'}`);
        } finally {
            clearInterval(interval);
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 rounded-3xl border border-indigo-100 shadow-xl overflow-hidden relative group">
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-900">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
            </div>

            <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                                專家級臨床洞察
                            </h4>
                        </div>
                        <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Advanced Reasoning Module</p>
                    </div>
                    
                    {!insight && !loading && (
                        <button 
                            onClick={generateInsight}
                            className="group/btn bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-3"
                        >
                            <span>生成專家分析報告</span>
                            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="py-20 flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-indigo-50 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-indigo-600 font-bold text-lg">{loadingText}</span>
                            <span className="text-slate-400 text-xs mt-2">這可能需要幾秒鐘的時間...</span>
                        </div>
                    </div>
                )}

                {insight && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-inner max-h-[600px] overflow-y-auto no-scrollbar">
                            <div className="space-y-8">
                                {insight.split('\n').filter(l => l.trim()).map((line, i) => {
                                    // Check if line looks like a major header (e.g., "一、" or "臨床")
                                    const isHeader = /^([一二三四五六七八九十]|[0-9])、/.test(line.trim()) || line.trim().endsWith(':') || line.trim().endsWith('：');
                                    
                                    if (isHeader) {
                                        return (
                                            <h5 key={i} className="text-lg font-black text-indigo-900 border-l-4 border-indigo-600 pl-4 mt-8 first:mt-0 mb-4">
                                                {line.replace(/：|:$/, '')}
                                            </h5>
                                        );
                                    }
                                    return (
                                        <p key={i} className="text-slate-600 leading-[1.8] text-base font-medium text-justify">
                                            {line}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                <span className="w-2 h-2 bg-indigo-200 rounded-full"></span>
                                此報告僅供專業臨床輔助，不具法律效力。
                            </div>
                            <button 
                                onClick={generateInsight} 
                                className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 rounded-xl transition-colors"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                                重新建構分析
                            </button>
                        </div>
                    </div>
                )}

                {!insight && !loading && (
                    <div className="py-16 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <div className="text-5xl mb-6 opacity-20">📖</div>
                        <h5 className="text-slate-700 font-bold text-lg mb-2">準備好生成深度臨床報告了嗎？</h5>
                        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                            我們將分析當前個案的主訴史、動作模式、關節角度與肌力表現，<br/>為您提供具備生物力學基礎的診斷推理。
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
