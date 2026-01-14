
import React, { useState } from 'react';
import { useApp } from '../store';
import { Input, Label } from '../components/Input';
import { TermsModal } from '../components/TermsModal';

export const Auth = () => {
  const { login, signup, resetPasswordForEmail } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false); // New State for Forgot Password Mode
  
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  // New States for T&C
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
        if (isForgot) {
            // Handle Password Reset Request
            await resetPasswordForEmail(email);
            setSuccessMsg(`重置連結已發送至 ${email}，請檢查您的信箱 (含垃圾郵件匣)。`);
            setLoading(false);
            return;
        }

        // Validation for Signup T&C
        if (!isLogin && !agreedToTerms) {
            setError("請先詳細閱讀並同意服務條款與隱私權政策，方可註冊。");
            setLoading(false);
            return;
        }

        if (isLogin) {
            await login(email, pass);
        } else {
            const data = await signup(email, pass, { name, job });
            
            if (data.user && !data.session) {
                alert("註冊成功！系統已發送驗證信至您的信箱，請點擊連結後再登入。");
                setIsLogin(true);
            } else if (data.user && data.session) {
                window.location.reload();
            }
        }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000"></div>

      {/* Terms and Conditions Modal */}
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)}
        onAgree={() => {
            setAgreedToTerms(true);
            setShowTermsModal(false);
        }}
      />

      <div className="bg-white/80 backdrop-blur-2xl w-full max-w-[420px] p-10 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-white/60 relative z-10 animate-[scale-in_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-900/20">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">PhysioNotes</h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Pro Assessment System</p>
        </div>

        {/* Capsule Toggle Switch - Hidden in Forgot Mode */}
        {!isForgot && (
            <div className="relative bg-slate-100 p-1.5 rounded-[1.2rem] mb-8 flex h-14">
            {/* Active Slider */}
            <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[0.9rem] shadow-lg shadow-black/5 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isLogin ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
            ></div>
            
            <button 
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 relative z-10 text-xs font-black transition-colors duration-300 rounded-[0.9rem] ${isLogin ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
                登入
            </button>
            <button 
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 relative z-10 text-xs font-black transition-colors duration-300 rounded-[0.9rem] ${!isLogin ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
                註冊
            </button>
            </div>
        )}

        {/* Title for Forgot Password Mode */}
        {isForgot && (
            <div className="mb-6 text-center animate-fade-in">
                <h3 className="text-lg font-black text-slate-800">重置密碼</h3>
                <p className="text-xs text-slate-500 mt-1">請輸入您的註冊 Email 以接收重置連結</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="name@clinic.com" 
                className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 focus:ring-slate-200 rounded-2xl font-medium" 
            />
          </div>

          {/* Password Field - Hidden in Forgot Mode */}
          {!isForgot && (
              <div className="space-y-1.5 relative animate-fade-in">
                {/* 
                   Forgot Password Link:
                   - Moved inside a flex container with Label for perfect vertical alignment.
                   - 'items-baseline' ensures text aligns properly.
                */}
                <div className="flex justify-between items-baseline">
                    <Label>Password</Label>
                    {isLogin && (
                        <button 
                            type="button" 
                            onClick={() => { setIsForgot(true); setError(''); setSuccessMsg(''); }}
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors mr-1 mb-1.5"
                        >
                            Forgot password?
                        </button>
                    )}
                </div>
                
                <div className="relative">
                    <Input 
                        type={showPass ? 'text' : 'password'} 
                        required={!isForgot}
                        value={pass} 
                        onChange={e => setPass(e.target.value)} 
                        placeholder="••••••••" 
                        minLength={6} 
                        className="h-12 pr-10 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 focus:ring-slate-200 rounded-2xl font-medium"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1"
                        tabIndex={-1}
                    >
                        {!showPass ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                        )}
                    </button>
                </div>
              </div>
          )}
          
          {/* Signup Fields - Only visible in Signup Mode */}
          {!isLogin && !isForgot && (
            <div className="animate-[slide-down_0.3s_ease-out] space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Name</Label>
                        <Input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Job</Label>
                        <Input type="text" value={job} onChange={e => setJob(e.target.value)} placeholder="Physical Therapist" className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl" />
                    </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="flex items-start gap-3 px-1">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 bg-white transition-all checked:border-slate-900 checked:bg-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
                        />
                        <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <label htmlFor="terms" className="text-xs text-slate-500 font-medium cursor-pointer select-none leading-5">
                        我已詳細閱讀並同意 
                        <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold ml-1 hover:underline underline-offset-2"
                        >
                            服務條款與隱私權政策
                        </button>
                    </label>
                </div>
            </div>
          )}

          {error && <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 text-center animate-shake">{error}</div>}
          {successMsg && <div className="text-green-600 text-xs font-bold bg-green-50 p-3 rounded-xl border border-green-100 text-center animate-fade-in">{successMsg}</div>}

          <div className="pt-2 space-y-3">
            <button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        {isForgot ? '發送重置連結' : isLogin ? '登入系統' : '建立帳號'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </>
                )}
            </button>

            {isForgot && (
                <button 
                    type="button" 
                    onClick={() => { setIsForgot(false); setError(''); setSuccessMsg(''); }}
                    className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                    返回登入
                </button>
            )}
          </div>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Secure Clinical Platform
            </p>
        </div>
      </div>
    </div>
  );
};
