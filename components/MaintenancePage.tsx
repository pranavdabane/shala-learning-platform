
import React, { useState, useEffect } from 'react';

interface MaintenancePageProps {
  onAdminAuth: () => void;
  endTime?: number;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onAdminAuth, endTime }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!endTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="fixed inset-0 z-[200] bg-background-dark text-white flex flex-col items-center justify-center p-6 selection:bg-primary selection:text-background-dark overflow-hidden">
      {/* Immersive Background Effects */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-primary rounded-full blur-[150px]"></div>
        <div className="absolute top-0 left-0 w-full h-full grid grid-cols-12 grid-rows-12 gap-1">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/5"></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-3xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex justify-center">
          <div className="relative">
            <div className="size-24 bg-primary rounded-[32px] flex items-center justify-center text-background-dark shadow-2xl shadow-primary/20 animate-pulse">
              <span className="material-symbols-outlined text-5xl font-black">settings_suggest</span>
            </div>
            <div className="absolute -bottom-2 -right-2 size-10 bg-white rounded-full flex items-center justify-center text-background-dark border-4 border-background-dark">
              <span className="material-symbols-outlined text-sm font-black animate-spin [animation-duration:3s]">autorenew</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            System Optimization in Progress
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            The platform is <br />
            <span className="text-primary italic">evolving.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
            We're currently deploying a major core update to enhance your AI-learning experience. We'll be back online shortly.
          </p>
        </div>

        {/* Live Countdown Timer */}
        {timeLeft ? (
          <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto py-8">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds },
            ].map((unit) => (
              <div key={unit.label} className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-sm group hover:border-primary/50 transition-colors">
                <p className="text-3xl md:text-5xl font-black text-primary tracking-tighter tabular-nums">
                  {unit.value.toString().padStart(2, '0')}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{unit.label}</p>
              </div>
            ))}
          </div>
        ) : endTime && (
          <div className="py-8">
            <div className="px-8 py-4 bg-primary text-background-dark rounded-2xl font-black text-sm uppercase tracking-widest animate-pulse">
              Finalizing Core Deployment...
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
              <span className="size-2 bg-primary rounded-full animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Core Engine: Deploying</span>
            </div>
            {endTime && (
              <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  Target Restoration: {new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
          
          <button 
            onClick={onAdminAuth}
            className="text-[10px] font-black text-slate-600 hover:text-primary uppercase tracking-[0.3em] transition-colors"
          >
            Authorized Personnel Only
          </button>
        </div>
      </div>

      <footer className="absolute bottom-10 text-[10px] font-black uppercase tracking-widest text-slate-600">
        © 2025 Learning Platform Inc.
      </footer>
    </div>
  );
};

export default MaintenancePage;
