
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { getSignUpMotivation } from '../services/gemini';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthPageProps {
  course?: Course | null;
  onBack: () => void;
  onSuccess: (name: string, email: string, isAdmin?: boolean, isNewUser?: boolean, avatarUrl?: string) => void;
  initialMode?: 'login' | 'signup';
  isMaintenanceMode?: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ course, onBack, onSuccess, initialMode = 'signup', isMaintenanceMode = false }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(isMaintenanceMode ? 'login' : initialMode);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [motivation, setMotivation] = useState<string>('Join us to unlock your potential.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthSuccess, setIsAuthSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{ message: string; type?: 'not_registered' | 'incorrect_password' | 'generic' } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMotivation() {
      if (isMaintenanceMode) {
        setMotivation("System lockdown active. Authorized personnel only.");
        return;
      }
      if (!course) {
        setMotivation("The future of professional education is here.");
        return;
      }
      try {
        const msg = await getSignUpMotivation(course);
        if (msg) setMotivation(msg);
      } catch (e) {
        console.error("Failed to fetch auth motivation", e);
      }
    }
    fetchMotivation();
  }, [course, isMaintenanceMode]);

  useEffect(() => {
    if (mode === 'signup') {
      if (nameInputRef.current) nameInputRef.current.focus();
    } else {
      if (emailInputRef.current) emailInputRef.current.focus();
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const normalizedEmail = (email || '').toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError({ message: "Please enter a valid email address.", type: 'generic' });
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === 'login') {
        // DEMO BYPASS for the specified admin credentials
        if (normalizedEmail === 'pranavdabane41@gmail.com' && password === 'pranav9538') {
          setIsAuthSuccess(true);
          setTimeout(() => {
            onSuccess('Pranav Admin', normalizedEmail, true, false);
          }, 1500);
          return;
        }

        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

        if (authError) {
          setError({ message: authError.message, type: 'generic' });
          setIsSubmitting(false);
          return;
        }

        if (data.user) {
          const userName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Learner';
          const avatarUrl = data.user.user_metadata?.avatar_url || null;
          const isAdmin = data.user.email === 'pranavdabane41@gmail.com';
          
          setIsAuthSuccess(true);
          setTimeout(() => {
            onSuccess(userName, data.user.email!, isAdmin, false, avatarUrl);
          }, 1500);
        }
      } else if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            data: {
              full_name: name,
            }
          }
        });

        if (authError) {
          setError({ message: authError.message, type: 'generic' });
          setIsSubmitting(false);
          return;
        }

        if (data.user) {
          if (data.session) {
            // User auto-logged in (Confirm Email off in Supabase settings)
            const userName = data.user.user_metadata?.full_name || name || 'Learner';
            const avatarUrl = data.user.user_metadata?.avatar_url || null;
            setIsAuthSuccess(true);
            setTimeout(() => {
              onSuccess(userName, normalizedEmail, normalizedEmail === 'pranavdabane41@gmail.com', true, avatarUrl);
            }, 1500);
          } else {
            // User must confirm email
            setSuccessMsg("Account created! Please check your email to verify your account before logging in.");
            setMode('login');
            setIsSubmitting(false);
          }
        }
      } else if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
        if (resetError) {
          setError({ message: resetError.message, type: 'generic' });
        } else {
          setSuccessMsg("Reset link sent! Please check your inbox.");
        }
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError({ message: "An unexpected error occurred. Please try again.", type: 'generic' });
      setIsSubmitting(false);
    }
  };

  const toggleMode = (newMode: 'login' | 'signup' | 'forgot' | 'reset') => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setPassword('');
  };

  if (isAuthSuccess) {
    return (
      <div className="max-w-md mx-auto bg-card rounded-[32px] md:rounded-[40px] p-8 md:p-12 shadow-[0_0_30px_var(--primary-glow)] animate-in zoom-in-95 duration-500 text-center border border-neon-border flex flex-col items-center justify-center min-h-[350px] md:min-h-[400px]">
        <div className="size-20 md:size-24 rounded-full bg-primary flex items-center justify-center text-black shadow-[0_0_20px_var(--primary-glow)] animate-bounce mb-6 md:mb-8">
          <span className="material-symbols-outlined text-4xl md:text-5xl font-black">check_circle</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Access Granted</h2>
          <p className="text-sm md:text-base text-secondary-text font-medium">Synchronizing your cloud profile with the core...</p>
        </div>
        <div className="mt-8 flex gap-2">
           <div className="size-2 bg-primary rounded-full animate-pulse"></div>
           <div className="size-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
           <div className="size-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`max-w-4xl mx-auto flex flex-col md:flex-row bg-card rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 border border-neon-border`}>
        <div className="md:w-5/12 bg-background-secondary p-8 md:p-10 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-neon-border">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-20 -left-20 size-64 bg-primary rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 size-64 bg-primary rounded-full blur-[100px] opacity-20"></div>
          </div>
          
          <div className="relative z-10">
            <div className={`size-10 md:size-12 ${isMaintenanceMode ? 'bg-red-500' : 'bg-primary'} rounded-xl md:rounded-2xl flex items-center justify-center text-black mb-4 md:mb-6 shadow-xl shadow-primary/20`}>
              <span className="material-symbols-outlined text-2xl md:text-3xl font-bold">{isMaintenanceMode ? 'lock' : 'school'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-4 text-left">
              {isMaintenanceMode ? 'Admin Portal.' : mode === 'signup' ? 'Start your journey here.' : mode === 'forgot' ? 'Recover your account.' : mode === 'reset' ? 'Finalize new security key.' : 'Welcome back.'}
            </h2>
            <div className={`p-4 rounded-2xl backdrop-blur-sm border text-left ${isMaintenanceMode ? 'bg-red-500/10 border-red-500/20' : 'bg-primary/10 border-neon-border'}`}>
              <p className={`${isMaintenanceMode ? 'text-red-400' : 'text-primary'} text-xs md:text-sm font-medium italic leading-relaxed`}>"{motivation}"</p>
            </div>
          </div>

          <div className="relative z-10 pt-8 md:pt-10 text-left hidden md:block">
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4].map(i => (
                <img key={`auth-avatar-${i}`} className="size-8 rounded-full border-2 border-background-main" src={`https://i.pravatar.cc/150?u=${i + 45}`} alt="" />
              ))}
              <div className="size-8 rounded-full bg-background-main border-2 border-neon-border flex items-center justify-center text-[10px] text-white font-bold tracking-tighter">+50k</div>
            </div>
            <p className="text-secondary-text text-[10px] font-bold uppercase tracking-widest">Secured by Supabase Backend</p>
          </div>
        </div>

        <div className="md:w-7/12 p-6 md:p-8 lg:p-14 h-full bg-card">
          <div className="flex justify-between items-center mb-8">
            <button onClick={onBack} className="text-secondary-text hover:text-primary transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
            </button>
          </div>
          
          {(!isMaintenanceMode && (mode === 'login' || mode === 'signup')) && (
            <div className="flex p-1.5 bg-background-main rounded-2xl mb-10 relative border border-neon-border">
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-xl shadow-[0_0_15px_var(--primary-glow)] transition-all duration-300 ease-out z-0 ${mode === 'signup' ? 'translate-x-full ml-1.5' : 'translate-x-0'}`}
              />
              <button 
                onClick={() => toggleMode('login')}
                className={`flex-1 py-3 text-sm font-black relative z-10 transition-colors duration-300 ${mode === 'login' ? 'text-black' : 'text-secondary-text hover:text-white'}`}
              >
                LOG IN
              </button>
              <button 
                onClick={() => toggleMode('signup')}
                className={`flex-1 py-3 text-sm font-black relative z-10 transition-colors duration-300 ${mode === 'signup' ? 'text-black' : 'text-secondary-text hover:text-white'}`}
              >
                SIGN UP
              </button>
            </div>
          )}

          <div className="mb-8 text-left">
            <h1 className="text-3xl font-black mb-2 tracking-tight text-white">
              {isMaintenanceMode ? 'Admin Access' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Account Recovery' : mode === 'reset' ? 'Reset Password' : 'Secure Login'}
            </h1>
            <p className="text-secondary-text text-sm">
              {isMaintenanceMode 
                ? "Authorized cloud access only."
                : mode === 'signup' 
                  ? "Enter your details to register on our cloud platform."
                  : mode === 'forgot' ? "Enter your email to receive a recovery link."
                  : "Log in with your verified cloud credentials."
              }
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-5 rounded-2xl border-2 animate-in slide-in-from-top-2 duration-300 text-left bg-red-500/10 border-red-500/20 text-red-500`}>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-xl shrink-0">error</span>
                <p className="text-sm font-bold leading-tight">{error.message}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-5 rounded-2xl bg-green-500/10 border-2 border-green-500/20 text-green-600 animate-in slide-in-from-top-2 duration-300 text-left">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">check_circle</span>
                  <p className="text-sm font-bold">{successMsg}</p>
               </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Full Name</label>
                <input 
                  ref={nameInputRef}
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full bg-background-main border border-neon-border rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary text-white outline-none" 
                  placeholder="Student Name" 
                />
              </div>
            )}
            
            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Email Address</label>
                  {(email?.toLowerCase().trim() || '') === 'pranavdabane41@gmail.com' && (
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">Admin Account Detected</span>
                  )}
                </div>
                <input 
                  ref={emailInputRef}
                  required 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-background-main border border-neon-border rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary text-white outline-none" 
                  placeholder="email@platform.edu" 
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Password</label>
                  {(mode === 'login' && !isMaintenanceMode) && (
                    <button type="button" onClick={() => toggleMode('forgot')} className="text-[10px] font-black text-primary hover:underline uppercase">Forgot?</button>
                  )}
                </div>
                <div className="relative group">
                  <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background-main border border-neon-border rounded-2xl px-5 py-4 pr-14 text-sm focus:ring-2 focus:ring-primary text-white outline-none" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary p-2">
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            )}

            <button disabled={isSubmitting} className={`w-full py-5 ${isMaintenanceMode ? 'bg-red-500' : 'bg-primary'} text-black font-black rounded-3xl shadow-[0_0_20px_var(--primary-glow)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4 group uppercase tracking-widest text-sm`}>
              {isSubmitting ? (
                <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{mode === 'signup' ? 'Register Account' : mode === 'forgot' ? 'Send Reset Link' : 'Secure Login'}</span>
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </div>
              )}
            </button>
          </form>

          {(!isMaintenanceMode && (mode === 'login' || mode === 'signup')) && (
            <div className="mt-12 text-center pt-8 border-t border-neon-border">
              <p className="text-sm text-secondary-text font-medium">
                {mode === 'signup' ? 'Already have an account?' : "New here?"}
                <button onClick={() => toggleMode(mode === 'signup' ? 'login' : 'signup')} className="ml-2 font-black text-primary hover:underline uppercase tracking-tight">
                  {mode === 'signup' ? 'Log In' : 'Sign Up'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
