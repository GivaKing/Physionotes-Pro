import React, { useState } from 'react';
import { useApp } from '../store';
import { Button, Input, Label } from './Input';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user, logout, cases } = useApp();
  const [showUserModal, setShowUserModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { 
        id: 'client', 
        label: '個案資料',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        )
    },
    { 
        id: 'therapist', 
        label: '治療評估',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
        )
    },
    { 
        id: 'cases', 
        label: '個案管理',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
        )
    },
  ];

  const limit = user?.patient_trial_limit;
  const maxPatients = (limit === undefined || limit === null) ? 10 : limit;
  const usagePercent = Math.min((cases.length / maxPatients) * 100, 100);

  const handleLogout = async () => {
    try {
        await logout();
    } catch (e) {
        console.error("Logout failed in layout", e);
    } finally {
        setIsMobileMenuOpen(false);
        setShowUserModal(false);
    }
  };

  const handleTabClick = (id: string) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  const getRoleDisplay = (role?: string) => {
      switch(role) {
          case 'admin': return 'Administrator';
          case 'pt': return 'Physical Therapist';
          case 'trial': return 'Trial User';
          default: return 'User';
      }
  }

  const getAvatarBg = (role?: string) => {
    switch(role) {
      case 'admin': return 'bg-slate-800'; 
      case 'pt': return 'bg-slate-900'; 
      default: return 'bg-gray-800';
    }
  };

  const showLabels = !isSidebarCollapsed || isMobileMenuOpen;

  return (
    <div className="min-h-screen bg-slate-50 no-print font-sans text-slate-900 relative overflow-x-clip">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 px-4 py-3 flex justify-between items-center shadow-sm h-16">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            <div className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-2">
                PhysioNotes
            </div>
        </div>
        <button 
          onClick={() => setShowUserModal(true)} 
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white transition-transform active:scale-95 shadow-lg shadow-slate-200 ${getAvatarBg(user?.role)}`}
        >
          {user?.name?.[0]}
        </button>
      </div>

      {/* Mobile Overlay - High Z-index but below sidebar */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/20 z-40 md:hidden backdrop-blur-sm transition-all duration-500"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Highest layer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl w-72' : '-translate-x-full shadow-none w-64'} 
        md:translate-x-0 md:shadow-[1px_0_0_rgba(0,0,0,0.05)]
        ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:w-24' : 'md:w-72'}`}
      >
        <div className={`p-6 flex items-center h-20 shrink-0 ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:justify-center justify-between' : 'justify-between'}`}>
          <div className={`font-black text-xl text-slate-900 flex items-center gap-2 tracking-tighter overflow-hidden whitespace-nowrap
             ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:hidden' : ''}
          `}>
             {/* Logo Icon */}
             <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
             </div>
             <span>PhysioNotes</span>
          </div>
          <div className={`hidden ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:block' : 'hidden'}`}>
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-lg font-black">P</div>
          </div>
          <button 
             onClick={() => setIsMobileMenuOpen(false)}
             className="md:hidden text-slate-400 hover:text-slate-900 p-2"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex items-center justify-center text-slate-300 hover:text-slate-600 transition-colors w-8 h-8 rounded-lg hover:bg-slate-100 shrink-0"
          >
            {isSidebarCollapsed ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
            )}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-3 py-6 overflow-y-auto no-scrollbar">
          {showLabels && <div className="px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical</div>}
          {menuItems.slice(0, 2).map(item => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group relative
                ${activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                ${!showLabels ? 'justify-center px-0' : ''}`}
              title={!showLabels ? item.label : ''}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              {showLabels && <span>{item.label}</span>}
            </button>
          ))}

          {showLabels && <div className="px-4 mb-2 mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</div>}
          {menuItems.slice(2).map(item => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group relative
                ${activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                ${!showLabels ? 'justify-center px-0' : ''}`}
              title={!showLabels ? item.label : ''}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              {showLabels && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div 
            className={`flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all duration-300 border border-transparent hover:border-slate-100 hover:shadow-sm ${!showLabels ? 'justify-center' : ''}`}
            onClick={() => { setShowUserModal(true); setIsMobileMenuOpen(false); }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md ${getAvatarBg(user?.role)}`}>
              {user?.name?.[0] || 'U'}
            </div>
            
            {showLabels && (
                <>
                    <div className="overflow-hidden flex-1">
                        <div className="text-sm font-bold text-slate-900 truncate">{user?.name || 'User'}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{user?.job}</div>
                    </div>
                    {/* SVG Icon for Settings instead of Emoji */}
                    <div className="text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                </>
            )}
          </div>
          
          {showLabels && (
              <div className="px-2 mt-3 mb-1">
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                <span>Usage</span>
                <span>{cases.length} / {maxPatients > 1000 ? '∞' : maxPatients}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-800 rounded-full transition-all duration-500" style={{ width: `${usagePercent}%` }}></div>
                </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area - Added dynamic blur/dim based on sidebar state */}
      <div className={`transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarCollapsed ? 'md:ml-24' : 'md:ml-72'} 
        ${isMobileMenuOpen ? 'blur-md brightness-50 pointer-events-none scale-[0.98]' : 'blur-0 brightness-100'}`}>
        <main className="p-4 md:p-10 pt-20 md:pt-10 w-full max-w-[1600px] mx-auto min-h-screen">
            {children}
        </main>
      </div>

      {showUserModal && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={(e) => {
                if(e.target === e.currentTarget) setShowUserModal(false);
            }}
        >
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-[scale-in_0.2s_ease-out] relative border border-white/20">
            <button 
                onClick={() => setShowUserModal(false)} 
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 z-10 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="p-8 pb-6 flex flex-col items-center">
               <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl font-black text-white mb-5 shadow-xl transform hover:scale-105 transition-transform duration-300 ${getAvatarBg(user?.role)}`}>
                 {user?.name?.[0]}
               </div>
               
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name}</h3>
               <p className="text-slate-400 text-sm font-bold mt-1">{user?.email}</p>
               <span className="mt-4 px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-200">
                   {getRoleDisplay(user?.role)}
               </span>
            </div>

            <div className="px-8 pb-8 space-y-6">
               <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-slate-200 transition-colors">
                    <div className="text-2xl font-black text-slate-900 group-hover:scale-110 transition-transform">{cases.length}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1">Active Cases</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-slate-200 transition-colors">
                    <div className="text-2xl font-black text-slate-900 group-hover:scale-110 transition-transform">{maxPatients > 9999 ? '∞' : maxPatients}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1">Plan Limit</div>
                  </div>
               </div>
               
               <div className="space-y-4">
                   <div>
                       <Label>Job Title</Label>
                       <Input defaultValue={user?.job} disabled className="bg-slate-50 text-slate-600 border-transparent font-bold" />
                   </div>
               </div>

               <div className="pt-2">
                 <Button variant="danger" className="w-full py-4 rounded-[1.5rem] font-bold text-sm" onClick={handleLogout}>Sign Out</Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};