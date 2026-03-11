
import React from 'react';
import { motion } from 'motion/react';

interface SidebarProps {
  onNavigate: (view: 'home' | 'catalog' | 'wishlist' | 'mylearning' | 'cart' | 'career-paths' | 'settings' | 'admin') => void;
  currentView: string;
  onLogout: () => void;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView, onLogout, isLoggedIn, isAdmin, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-background-dark/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[110] w-72 lg:w-72 transform bg-background-main p-6 transition-all duration-500 ease-out lg:static lg:translate-x-0 flex flex-col gap-8 border-r border-neon-border h-full overflow-y-auto no-scrollbar ${isOpen ? 'translate-x-0 shadow-2xl shadow-primary/10' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-white">
            <div className={`size-10 flex items-center justify-center rounded-xl text-black shrink-0 shadow-lg ${isAdmin ? 'bg-red-500 shadow-red-500/20' : 'bg-primary shadow-[0_0_15px_rgba(230,255,0,0.4)]'}`}>
              <span className="material-symbols-outlined text-2xl font-bold">{isAdmin ? 'admin_panel_settings' : 'school'}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tighter font-display">Learning</h2>
          </div>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl hover:bg-card lg:hidden transition-all active:scale-90">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>

      {isAdmin && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/70 mb-2 px-3">Admin Tools</p>
          <button 
            onClick={() => onNavigate('admin')}
            className={`flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all group ${currentView === 'admin' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-600 dark:text-slate-400 hover:text-red-500'}`}
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">admin_panel_settings</span>
            <span className="text-sm font-bold">Control Center</span>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400/70 mb-2 px-3">Main Menu</p>
        {[
          { id: 'home', label: 'Home', icon: 'home' },
          { id: 'catalog', label: 'All Courses', icon: 'explore' },
          { id: 'career-paths', label: 'Career Paths', icon: 'route' },
          { id: 'cart', label: 'Shop & Orders', icon: 'shopping_cart' },
          { id: 'mylearning', label: 'My Progress', icon: 'school' },
          { id: 'wishlist', label: 'Wishlist', icon: 'favorite' }
        ].map(item => {
          const isActive = currentView === item.id;
          return (
            <motion.button 
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(item.id as any)} 
              className={`flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all group relative w-full ${
                isActive 
                  ? 'bg-primary text-black shadow-[0_0_15px_rgba(230,255,0,0.4)]' 
                  : 'hover:bg-card text-secondary-text hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined text-xl group-hover:scale-110 transition-transform ${isActive ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm font-bold">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute right-3 size-1.5 bg-black rounded-full" 
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-8 border-t border-neon-border">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary-text mb-2 px-3">Account</p>
        <motion.button 
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('settings')} 
          className={`flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all group ${currentView === 'settings' ? 'bg-primary text-black shadow-[0_0_15px_rgba(230,255,0,0.4)]' : 'hover:bg-card text-secondary-text hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">person</span>
          <span className="text-sm font-bold">Profile Settings</span>
        </motion.button>
        {isLoggedIn && (
          <motion.button 
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout} 
            className="flex items-center justify-start gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group text-red-500"
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">logout</span>
            <span className="text-sm font-bold">Logout</span>
          </motion.button>
        )}
      </div>
    </aside>
  </>
  );
};

export default Sidebar;
