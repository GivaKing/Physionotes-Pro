
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const Label = ({ children }: { children?: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
    {children}
  </label>
);

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm ${!className?.includes('px-') && !className?.includes('pl-') ? 'px-4' : ''} ${className || ''}`}
  />
);

export const TextArea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm min-h-[80px] ${className || ''}`}
  />
);

export const Button = ({ variant = 'primary', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) => {
  const base = "px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-500"
  };

  return (
    <button type="button" className={`${base} ${variants[variant]} ${className || ''}`} {...props} />
  );
};

export const ChipGroup = ({ 
  options, 
  value, 
  onChange, 
  multi = false,
  variant = 'default'
}: { 
  options: string[], 
  value: string | string[], 
  onChange: (val: any) => void, 
  multi?: boolean,
  variant?: 'default' | 'solid'
}) => {
  
  const isSelected = (opt: string) => {
    if (multi && Array.isArray(value)) return value.includes(opt);
    return value === opt;
  };

  const handleClick = (opt: string) => {
    if (multi && Array.isArray(value)) {
      if (value.includes(opt)) onChange(value.filter(v => v !== opt));
      else onChange([...value, opt]);
    } else {
      onChange(opt);
    }
  };

  // Styles
  const defaultActive = 'bg-primary-50 border-primary-500 text-primary-700';
  const defaultInactive = 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50';

  const solidActive = 'bg-slate-800 border-slate-900 text-white shadow-md';
  const solidInactive = 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50';

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const selected = isSelected(opt);
        let className = `px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 `;
        
        if (variant === 'solid') {
             className += selected ? solidActive : solidInactive;
        } else {
             className += selected ? defaultActive : defaultInactive;
        }

        return (
            <button
            key={opt}
            type="button"
            onClick={() => handleClick(opt)}
            className={className}
            >
            {opt}
            </button>
        );
      })}
    </div>
  );
};

// Portal Component to ensure modals render at document body level (center of screen)
export const Portal = ({ children }: { children?: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

export const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "確定刪除",
  isDangerous = false
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  confirmText?: string;
  isDangerous?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" 
          onClick={onCancel}
        />
        
        {/* Content */}
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-scale-in">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDangerous ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {isDangerous ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {message}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onCancel} className="flex-1">
                取消
              </Button>
              <Button 
                variant={isDangerous ? 'danger' : 'primary'} 
                onClick={onConfirm} 
                className="flex-1"
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export const AlertModal = ({ 
  isOpen, 
  title, 
  message, 
  onClose,
  type = 'success'
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onClose: () => void;
  type?: 'success' | 'error';
}) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />

        {/* Content */}
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-scale-in">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {type === 'error' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {message}
            </p>
            <div className="flex">
              <Button 
                variant={type === 'error' ? 'danger' : 'primary'} 
                onClick={onClose} 
                className="flex-1"
              >
                確定
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};
