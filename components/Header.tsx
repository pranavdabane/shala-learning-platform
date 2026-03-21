
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import ProfileDropdown from './ProfileDropdown';

interface HeaderProps {
  onSearch: (query: string) => void;
  onNavigate: (view: any) => void;
  onAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  currentView: string;
  cartCount: number;
  wishlistCount: number;
  enrolledCount: number;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  user?: { name: string; email: string; avatarUrl?: string | null } | null;
  isMobileMenuOpen: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onNavigate, 
  onAuth,
  onLogout,
  onToggleMobileMenu,
  currentView, 
  cartCount, 
  wishlistCount, 
  enrolledCount, 
  isLoggedIn,
  isAdmin,
  user,
  isMobileMenuOpen,
  isDarkMode,
  toggleDarkMode
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);
  const avatarUrl = user?.avatarUrl || (user 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${isAdmin ? 'ff0000' : 'f2f20d'}&color=${isAdmin ? 'ffffff' : '181811'}&bold=true`
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuDiAlEG1u2oD4veMA6KReqiK8KyL6dRFVRuvjZpTYs8frCMyYDwvCBHESnpNR4gwXfFruyaiJ1N3DTaQJ8S6j9ui9r_-qHflL-iBseKFyeqSIrxledClSUlXRzyGEFk3yt0p2X-TH0h4TAwFdgL8A9mxTPWWOscI7XpeQy-hi6RwNo5ayL_xxDstPGKk9EVJYYo6jfDIf9EkThAd5_GzQXbMHTp-ibAWxvScE_vEtW7oAKTOIfqZ2jmWi3Brfi-lMLx_ASnZPCt_h07");

  return (
    <header className="sticky top-0 z-50 border-b border-solid border-neon-border bg-background-main/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-10">
        <button 
          onClick={onToggleMobileMenu}
          className="lg:hidden flex size-11 items-center justify-center rounded-xl hover:bg-card transition-colors"
        >
          <span className="material-symbols-outlined text-2xl text-white">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        <div 
          className="flex items-center gap-2 lg:gap-4 text-white cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`size-9 lg:size-11 flex items-center justify-center rounded-xl text-black transition-transform ${isAdmin ? 'bg-red-500' : 'bg-primary shadow-[0_0_15px_rgba(230,255,0,0.4)]'}`}
          >
            <span className="material-symbols-outlined text-xl lg:text-3xl font-black">{isAdmin ? 'admin_panel_settings' : 'school'}</span>
          </motion.div>
          <h2 className="text-lg lg:text-2xl font-black tracking-tighter flex items-center gap-2">
            <span className="hidden xs:inline">Learning</span>
            {isAdmin && (
              <span className="bg-red-500 text-white text-[10px] lg:text-xs px-2 py-1 rounded-lg font-black uppercase tracking-tighter">
                Admin
              </span>
            )}
          </h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onNavigate('home')}
            className={`text-sm lg:text-base font-black uppercase tracking-widest transition-all ${currentView === 'home' ? 'text-primary' : 'text-secondary-text hover:text-primary'}`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('catalog')}
            className={`text-sm lg:text-base font-black uppercase tracking-widest transition-all ${currentView === 'catalog' ? 'text-primary' : 'text-secondary-text hover:text-primary'}`}
          >
            Catalog
          </button>
          {isAdmin ? (
            <button 
              onClick={() => onNavigate('admin')}
              className={`text-sm lg:text-base font-black uppercase tracking-widest transition-all ${currentView === 'admin' ? 'text-red-500' : 'text-secondary-text hover:text-red-500'}`}
            >
              Admin
            </button>
          ) : (
            <button 
              onClick={() => onNavigate('mylearning')}
              className={`text-sm lg:text-base font-black uppercase tracking-widest transition-all ${currentView === 'mylearning' ? 'text-primary' : 'text-secondary-text hover:text-primary'}`}
            >
              My Learning
            </button>
          )}
        </nav>
      </div>

        <div className="flex flex-1 justify-end gap-2 lg:gap-6 items-center">
          <label className="flex flex-col min-w-0 flex-1 sm:min-w-48 max-w-72 h-11 lg:h-12 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 lg:pl-4 pointer-events-none text-secondary-text">
              <span className="material-symbols-outlined text-xl lg:text-2xl">search</span>
            </div>
            <input 
              className="form-input block w-full pl-10 lg:pl-12 pr-4 lg:pr-6 rounded-full border border-neon-border bg-card text-sm lg:text-base focus:ring-2 focus:ring-primary placeholder:text-secondary-text text-white transition-all h-full" 
              placeholder="Search tracks..." 
              onChange={(e) => onSearch(e.target.value)}
            />
          </label>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('wishlist')}
            className={`relative flex size-11 lg:size-12 items-center justify-center rounded-xl bg-card hover:bg-primary/20 transition-colors ${currentView === 'wishlist' ? 'ring-2 ring-primary bg-primary/10' : ''}`}
          >
            <span className="material-symbols-outlined text-xl lg:text-3xl text-white">favorite</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 lg:size-6 items-center justify-center rounded-full bg-primary text-[10px] lg:text-xs font-black text-black leading-none shadow-lg">
                {wishlistCount}
              </span>
            )}
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('cart')}
            className={`relative flex size-11 lg:size-12 items-center justify-center rounded-xl bg-card hover:bg-primary/20 transition-colors ${currentView === 'cart' ? 'ring-2 ring-primary bg-primary/10' : ''}`}
          >
            <span className="material-symbols-outlined text-xl lg:text-3xl text-white">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 lg:size-6 items-center justify-center rounded-full bg-primary text-[10px] lg:text-xs font-black text-black leading-none shadow-lg">
                {cartCount}
              </span>
            )}
          </motion.button>
          
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`size-11 lg:size-12 rounded-full border-2 overflow-hidden cursor-pointer hover:scale-105 transition-transform ${isAdmin ? 'border-red-500' : 'border-primary shadow-[0_0_10px_rgba(230,255,0,0.3)]'}`}
              >
                <img 
                  alt="Profile" 
                  className="h-full w-full object-cover" 
                  src={avatarUrl} 
                />
              </div>
              <ProfileDropdown 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)}
                enrolledCount={enrolledCount}
                onNavigate={onNavigate}
                onLogout={onLogout}
                user={user}
                isAdmin={isAdmin}
              />
            </div>
          ) : (
            <button 
              onClick={() => onAuth('signup')}
              className="px-3 sm:px-5 py-2 text-xs lg:text-sm font-bold bg-[#E6FF00] text-black rounded-xl hover:shadow-[0_0_20px_rgba(230,255,0,0.4)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            >
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">Join Now</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
