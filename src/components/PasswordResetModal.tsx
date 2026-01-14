
import React, { useState } from 'react';
import { useApp } from '../store';
import { Input, Button, Label, Portal } from './Input';

export const PasswordResetModal = () => {
    const { updateUserPassword, isRecoveryMode } = useApp();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isRecoveryMode) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password.length < 6) {
            setError('密碼長度需至少 6 個字元');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('兩次輸入的密碼不相符');
            setLoading(false);
            return;
        }

        try {
            await updateUserPassword(password);
            alert("密碼重置成功！");
        } catch (err: any) {
            setError(err.message || '重置失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
                
                <div className="relative z-10 bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in p-8 border border-white/20">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">重置您的密碼</h2>
                        <p className="text-slate-500 text-sm font-bold mt-1 text-center">
                            請輸入新的密碼以恢復帳號存取權限。
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label>新密碼 (New Password)</Label>
                            <Input 
                                type="password" 
                                required 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="••••••••" 
                                minLength={6}
                                className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-200 rounded-2xl"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>確認密碼 (Confirm Password)</Label>
                            <Input 
                                type="password" 
                                required 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)} 
                                placeholder="••••••••" 
                                minLength={6}
                                className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-200 rounded-2xl"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-slate-900/30 active:scale-95 transition-all mt-4"
                        >
                            {loading ? '更新中...' : '確認重置密碼'}
                        </Button>
                    </form>
                </div>
            </div>
        </Portal>
    );
};
