
import React from 'react';
import { Portal } from './Input';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAgree }) => {
    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
                    onClick={onClose}
                />
                <div className="relative z-10 bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[85vh]">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            </div>
                            <h3 className="font-black text-slate-800 text-lg">服務條款與醫療法規須知</h3>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto leading-relaxed text-slate-600 text-sm space-y-8">
                        {/* 1. Medical Records Retention */}
                        <section>
                            <h4 className="font-black text-slate-900 text-base mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                                1. 病歷資料保存法規 (Medical Records Retention)
                            </h4>
                            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-3">
                                <p className="font-bold text-indigo-900 mb-1">依據醫療法第 70 條規定：</p>
                                <p className="text-indigo-800 text-xs leading-5">
                                    醫療機構之病歷，應指定適當之場所及人員保管，並至少保存 <span className="font-black underline">七年</span>。但未成年人之病歷，至少應保存至其成年後七年。
                                </p>
                            </div>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                                <li><strong>資料責任：</strong>本系統提供雲端資料庫服務，但使用者（醫療專業人員）仍負有確保病歷資料完整性與保存年限之最終法律責任。</li>
                                <li><strong>備份建議：</strong>強烈建議您定期使用系統內建的「匯出/備份」功能，將個案資料下載至本地端儲存，以符合法規對於資料保全之要求。</li>
                                <li><strong>帳號終止：</strong>若您終止使用本服務，請務必於帳號刪除前完成所有病歷資料的轉移與備份。</li>
                            </ul>
                        </section>

                        {/* 2. Privacy & Security */}
                        <section>
                            <h4 className="font-black text-slate-900 text-base mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                                2. 隱私權與個資保護 (Privacy & Data Protection)
                            </h4>
                            <p className="mb-2">我們致力於保護您與病患的隱私，系統採用加密技術傳輸數據。然而，使用者須同意以下事項：</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li><strong>帳號安全：</strong>您有責任妥善保管帳號密碼。因個人保管不當導致的資料外洩，本平台不負賠償責任。</li>
                                <li><strong>敏感個資：</strong>輸入病患資料時，請遵循當地的個人資料保護法（PDPA）或 HIPAA 規範，僅記錄臨床必要之資訊。</li>
                                <li><strong>授權存取：</strong>除法律要求或系統維護必要外，本平台工作人員不會主動查閱您的具體個案內容。</li>
                            </ul>
                        </section>

                        {/* 3. AI Disclaimer */}
                        <section>
                            <h4 className="font-black text-slate-900 text-base mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                                3. AI 輔助與免責聲明 (Disclaimer)
                            </h4>
                            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 mb-2">
                                <p className="text-amber-800 text-xs font-bold">
                                    ⚠️ 本系統內建之 AI 臨床洞察與缺漏分析功能僅供參考。
                                </p>
                            </div>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li><strong>輔助性質：</strong>AI 生成內容係基於大數據模型運算，<span className="font-bold text-slate-800">不得</span>直接作為最終診斷證明或法律依據。</li>
                                <li><strong>專業判斷：</strong>物理治療師與醫療人員應依據臨床實證與專業判斷，審核並修正 AI 提供之建議。</li>
                                <li><strong>錯誤可能性：</strong>AI 模型可能會產生不準確或過時的資訊（Hallucination），使用者需自行承擔使用風險。</li>
                            </ul>
                        </section>

                        {/* 4. Terms of Use */}
                        <section>
                            <h4 className="font-black text-slate-900 text-base mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-slate-500 rounded-full"></span>
                                4. 服務使用條款
                            </h4>
                            <p>註冊並使用本系統即表示您同意：</p>
                            <ul className="list-disc list-inside space-y-1 pl-2 mt-1">
                                <li>提供的註冊資訊（姓名、職稱）真實且準確。</li>
                                <li>嚴禁將本系統用於任何非法用途或未經授權的商業行為。</li>
                                <li>本平台保留隨時修改服務條款之權利，重大變更將予以公告。</li>
                            </ul>
                        </section>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            稍後再看
                        </button>
                        <button 
                            onClick={onAgree}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            我已詳細閱讀並同意
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};
