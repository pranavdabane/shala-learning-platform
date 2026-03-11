
import React from 'react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  enrolledCount: number;
  onNavigate: (view: any) => void;
  onLogout: () => void;
  user?: { name: string; email: string } | null;
  isAdmin?: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose, enrolledCount, onNavigate, onLogout, user, isAdmin }) => {
  if (!isOpen) return null;

  const displayName = user?.name || "Guest User";
  const displayEmail = user?.email || "not-logged-in@platform.edu";

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose}></div>
      <div className="absolute right-0 mt-2 w-72 bg-card rounded-3xl shadow-2xl border border-neon-border p-6 z-[70] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-neon-border">
          <div className={`size-20 rounded-full border-4 overflow-hidden shadow-lg ${isAdmin ? 'border-red-500' : 'border-primary shadow-[0_0_15px_rgba(230,255,0,0.3)]'}`}>
            <img 
              alt="Profile" 
              className="h-full w-full object-cover" 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${isAdmin ? 'ff0000' : 'e6ff00'}&color=${isAdmin ? 'ffffff' : '000000'}&bold=true`} 
            />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <h3 className="text-lg font-black tracking-tight text-white">{displayName}</h3>
              {isAdmin && <span className="material-symbols-outlined text-red-500 text-sm">verified</span>}
            </div>
            <p className="text-xs text-secondary-text font-medium">{displayEmail}</p>
          </div>
          <div className="flex gap-4 w-full">
            <div className="flex-1 bg-background-main p-3 rounded-2xl border border-neon-border">
              <p className="text-xs text-secondary-text font-bold uppercase tracking-tighter">Status</p>
              <p className={`text-sm font-black ${isAdmin ? 'text-red-500' : 'text-primary'}`}>{isAdmin ? 'Admin' : 'Pro'}</p>
            </div>
            <div className="flex-1 bg-background-main p-3 rounded-2xl border border-neon-border">
              <p className="text-xs text-secondary-text font-bold uppercase tracking-tighter">Impact</p>
              <p className="text-sm font-black text-white">92%</p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-1">
          {isAdmin && (
            <button 
              onClick={() => { onNavigate('admin'); onClose(); }}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-red-500/10 text-red-500 transition-colors text-sm font-black border border-red-500/20"
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              Admin Control
            </button>
          )}
          <button 
            onClick={() => { onNavigate('mylearning'); onClose(); }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-primary hover:text-black transition-colors text-sm font-medium text-white"
          >
            <span className="material-symbols-outlined text-secondary-text group-hover:text-black">school</span>
            My Learning
          </button>
          <button 
            onClick={() => { onNavigate('career-paths'); onClose(); }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-primary hover:text-black transition-colors text-sm font-medium text-white"
          >
            <span className="material-symbols-outlined text-secondary-text group-hover:text-black">route</span>
            Career Paths
          </button>
          <button 
            onClick={() => { onNavigate('settings'); onClose(); }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-primary hover:text-black transition-colors text-sm font-medium text-white"
          >
            <span className="material-symbols-outlined text-secondary-text group-hover:text-black">settings</span>
            Settings
          </button>
          <button 
            onClick={() => { onLogout(); onClose(); }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500 hover:text-white text-red-500 transition-colors text-sm font-black mt-2"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;
