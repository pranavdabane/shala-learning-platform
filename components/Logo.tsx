
import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isAdmin?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = "md", isAdmin = false }) => {
  const sizes = {
    sm: { container: 'size-8', icon: 'text-lg', text: 'text-base' },
    md: { container: 'size-10 lg:size-11', icon: 'text-xl lg:text-2xl', text: 'text-lg lg:text-2xl' },
    lg: { container: 'size-14', icon: 'text-3xl', text: 'text-3xl' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-2 lg:gap-3 group ${className}`}>
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className={`${currentSize.container} flex items-center justify-center rounded-xl text-black transition-all duration-300 ${isAdmin ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-primary shadow-[0_0_15px_var(--primary-glow)] group-hover:shadow-[0_0_25px_var(--primary-glow)]'}`}
      >
        <span className="material-symbols-outlined font-black" style={{ fontSize: 'inherit' }}>
          {isAdmin ? 'admin_panel_settings' : 'school'}
        </span>
      </motion.div>
      
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className={`${currentSize.text} font-black tracking-tighter text-main-text uppercase`}>
            Online
          </span>
          {isAdmin && (
            <span className="bg-red-500 text-white text-[8px] lg:text-[10px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter ml-1">
              Admin
            </span>
          )}
        </div>
        <span 
          className={`${size === 'sm' ? 'text-xs' : 'text-sm lg:text-base'} font-black text-primary tracking-widest`}
          style={{ fontFamily: 'var(--font-marathi)' }}
        >
          शाळा
        </span>
      </div>
    </div>
  );
};

export default Logo;
