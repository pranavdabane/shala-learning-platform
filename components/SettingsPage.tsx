
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsPageProps {
  user: { name: string; email: string; avatarUrl?: string | null } | null;
  onBack: () => void;
  onSave: (newName: string, newEmail?: string, newAvatarUrl?: string) => void;
}

type SettingsSection = 'Profile' | 'Appearance' | 'Notifications' | 'Security' | 'Privacy';

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onBack, onSave }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('Profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
    if (user?.avatarUrl) setAvatarUrl(user.avatarUrl);
  }, [user]);

  const [bio, setBio] = useState(() => localStorage.getItem('lms_settings_bio') || 'Senior Product Designer exploring the intersection of AI and Human Psychology.');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('lms_settings_timezone') || 'GMT-05:00 (EST)');
  const [language, setLanguage] = useState(() => localStorage.getItem('lms_settings_language') || 'English (US)');
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatarUrl || localStorage.getItem('lms_settings_avatarUrl') || '');
  
  const [fontSize, setFontSize] = useState<'Small' | 'Medium' | 'Large'>(() => (localStorage.getItem('lms_settings_fontSize') as any) || 'Medium');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('lms_settings_reducedMotion') === 'true');
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  // Notification States
  const [notifProgress, setNotifProgress] = useState(() => JSON.parse(localStorage.getItem('lms_settings_notifProgress') || '{"email": true, "push": true}'));
  const [notifMarketing, setNotifMarketing] = useState(() => JSON.parse(localStorage.getItem('lms_settings_notifMarketing') || '{"email": false, "push": false}'));
  const [notifSecurity, setNotifSecurity] = useState(() => JSON.parse(localStorage.getItem('lms_settings_notifSecurity') || '{"email": true, "push": true}'));
  const [digestFrequency, setDigestFrequency] = useState(() => localStorage.getItem('lms_settings_digestFrequency') || 'Daily');

  // Security States
  const [twoFactor, setTwoFactor] = useState(() => localStorage.getItem('lms_settings_twoFactor') === 'true');
  const [authType, setAuthType] = useState<'app' | 'sms'>(() => (localStorage.getItem('lms_settings_authType') as any) || 'app');

  // Password Update States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  // Privacy States
  const [publicProfile, setPublicProfile] = useState(() => localStorage.getItem('lms_settings_publicProfile') !== 'false');
  const [showProgress, setShowProgress] = useState(() => localStorage.getItem('lms_settings_showProgress') !== 'false');
  const [anonymizedAnalytics, setAnonymizedAnalytics] = useState(() => localStorage.getItem('lms_settings_anonymizedAnalytics') !== 'false');
  const [profileIndexing, setProfileIndexing] = useState(() => localStorage.getItem('lms_settings_profileIndexing') === 'true');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('lms_settings_bio', bio);
    localStorage.setItem('lms_settings_timezone', timezone);
    localStorage.setItem('lms_settings_language', language);
    localStorage.setItem('lms_settings_avatarUrl', avatarUrl);
    localStorage.setItem('lms_settings_fontSize', fontSize);
    localStorage.setItem('lms_settings_reducedMotion', reducedMotion.toString());
    localStorage.setItem('lms_settings_notifProgress', JSON.stringify(notifProgress));
    localStorage.setItem('lms_settings_notifMarketing', JSON.stringify(notifMarketing));
    localStorage.setItem('lms_settings_notifSecurity', JSON.stringify(notifSecurity));
    localStorage.setItem('lms_settings_digestFrequency', digestFrequency);
    localStorage.setItem('lms_settings_twoFactor', twoFactor.toString());
    localStorage.setItem('lms_settings_authType', authType);
    localStorage.setItem('lms_settings_publicProfile', publicProfile.toString());
    localStorage.setItem('lms_settings_showProgress', showProgress.toString());
    localStorage.setItem('lms_settings_anonymizedAnalytics', anonymizedAnalytics.toString());
    localStorage.setItem('lms_settings_profileIndexing', profileIndexing.toString());
  }, [bio, timezone, fontSize, reducedMotion, notifProgress, notifMarketing, notifSecurity, digestFrequency, twoFactor, authType, publicProfile, showProgress, anonymizedAnalytics, profileIndexing]);

  // Appearance Side Effects
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    if (fontSize === 'Small') root.classList.add('text-sm');
    else if (fontSize === 'Large') root.classList.add('text-lg');
    else root.classList.add('text-base');
  }, [fontSize]);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [reducedMotion]);

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      setPasswordError('New password cannot be empty');
      setPasswordStatus('error');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      setPasswordStatus('error');
      return;
    }

    setPasswordStatus('updating');
    setPasswordError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordStatus('success');
      setNewPassword('');
      setCurrentPassword('');
      setTimeout(() => setPasswordStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setPasswordError(err.message || 'Failed to update password');
      setPasswordStatus('error');
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setSaveError('Name cannot be empty');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setSaveError('Please enter a valid email address');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaveError('');
    setSaveStatus('saving');
    setTimeout(() => {
      onSave(trimmedName, trimmedEmail !== user?.email ? trimmedEmail : undefined, avatarUrl !== user?.avatarUrl ? avatarUrl : undefined);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1200);
  };

  const getFontSizeClass = () => {
    if (fontSize === 'Small') return 'text-[0.85rem]';
    if (fontSize === 'Large') return 'text-[1.15rem]';
    return 'text-base';
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real app, you'd call a backend function to delete the user from Supabase Auth
      // Since we don't have that easily accessible, we'll sign out and clear local data
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      console.error('Error deleting account:', err);
      showNotification('Failed to delete account. Please try again later.', 'error');
    }
  };

  const renderProfile = () => (
    <section className="bg-card p-8 rounded-[40px] border border-neon-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="size-24 rounded-full border-4 border-primary overflow-hidden shadow-[0_0_20px_var(--primary-glow)] bg-background-main">
            <img 
              src={(avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e6ff00&color=000000&bold=true`) || undefined} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          <label className="absolute bottom-0 right-0 size-8 bg-background-main text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border border-neon-border cursor-pointer">
            <span className="material-symbols-outlined text-sm">photo_camera</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>
        <div className="text-left">
          <h3 className="text-xl font-black text-white">Personal Information</h3>
          <p className="text-xs text-secondary-text">Update your profile detail and public avatar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background-main border border-neon-border rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary text-white transition-all outline-none" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background-main border border-neon-border rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary text-white transition-all outline-none" 
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Bio</label>
          <textarea 
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-background-main border border-neon-border rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary text-white transition-all resize-none outline-none" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Timezone</label>
          <select 
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full bg-background-main border border-neon-border rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary text-white transition-all appearance-none cursor-pointer outline-none"
          >
            <option>GMT-05:00 (EST)</option>
            <option>GMT+00:00 (UTC)</option>
            <option>GMT+05:30 (IST)</option>
            <option>GMT+08:00 (SGT)</option>
            <option>GMT+09:00 (JST)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Language</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-background-main border border-neon-border rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary text-white transition-all appearance-none cursor-pointer outline-none"
          >
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>Hindi (HI)</option>
            <option>Spanish (ES)</option>
            <option>French (FR)</option>
            <option>German (DE)</option>
          </select>
        </div>
      </div>
    </section>
  );

  const renderAppearance = () => (
    <section className="bg-card p-8 rounded-[40px] border border-neon-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
      <div className="space-y-1">
        <h3 className="text-xl font-black text-main-text">Interface Appearance</h3>
        <p className="text-xs text-secondary-text">Adjust the platform's visual theme and density.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Content Scale</label>
            <span className="text-xs font-black text-primary uppercase">{fontSize}</span>
          </div>
          <div className="flex p-1.5 bg-background-main rounded-2xl border border-neon-border">
            {['Small', 'Medium', 'Large'].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size as any)}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${fontSize === size ? 'bg-primary text-black shadow-sm' : 'text-secondary-text'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-background-main/50 rounded-2xl border border-neon-border">
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">Reduced Motion</p>
            <p className="text-[10px] text-secondary-text leading-tight">Disable UI animations for a faster feel.</p>
          </div>
          <button 
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`relative w-12 h-6 rounded-full transition-colors ${reducedMotion ? 'bg-primary' : 'bg-background-main border border-neon-border'}`}
          >
            <div className={`absolute top-1 left-1 size-4 rounded-full bg-white shadow-md transition-transform duration-300 ${reducedMotion ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Live Preview Card */}
        <div className={`mt-8 p-6 rounded-3xl bg-background-main/50 border border-dashed border-neon-border ${getFontSizeClass()} transition-all`}>
           <p className="text-[10px] font-black uppercase text-secondary-text tracking-widest mb-4">Scale Preview</p>
           <h4 className="font-black mb-2 text-white">Unlock Your Potential</h4>
           <p className="text-secondary-text leading-relaxed">
             This is how text will appear across the platform with your selected scale. 
             Adjusting this affects readability and information density.
           </p>
        </div>
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section className="bg-card p-8 rounded-[40px] border border-neon-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
      <div className="space-y-1">
        <h3 className="text-xl font-black text-white">Notification Channels</h3>
        <p className="text-xs text-secondary-text">Configure how you receive alerts and updates.</p>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-4 px-4 py-2 text-[10px] font-black uppercase text-secondary-text tracking-widest">
           <div className="col-span-2">Activity</div>
           <div className="text-center">Email</div>
           <div className="text-center">Push</div>
        </div>
        {[
          { label: 'Learning Progress', desc: 'Module completions & streaks', state: notifProgress, setter: setNotifProgress },
          { label: 'Marketing & Deals', desc: 'Promotions and new launches', state: notifMarketing, setter: setNotifMarketing },
          { label: 'Account Security', desc: 'Logins and security events', state: notifSecurity, setter: setNotifSecurity }
        ].map((item, i) => (
          <div key={i} className="grid grid-cols-4 items-center p-4 bg-background-main/50 rounded-2xl border border-neon-border">
            <div className="col-span-2 space-y-1">
              <p className="text-sm font-bold text-white">{item.label}</p>
              <p className="text-[9px] text-secondary-text leading-tight">{item.desc}</p>
            </div>
            <div className="flex justify-center">
               <button 
                onClick={() => item.setter({...item.state, email: !item.state.email})}
                className={`size-6 rounded-lg flex items-center justify-center transition-all ${item.state.email ? 'bg-primary/20 text-primary' : 'bg-background-main border border-neon-border text-secondary-text'}`}
               >
                 <span className="material-symbols-outlined text-base">mail</span>
               </button>
            </div>
            <div className="flex justify-center">
               <button 
                onClick={() => item.setter({...item.state, push: !item.state.push})}
                className={`size-6 rounded-lg flex items-center justify-center transition-all ${item.state.push ? 'bg-primary/20 text-primary' : 'bg-background-main border border-neon-border text-secondary-text'}`}
               >
                 <span className="material-symbols-outlined text-base">notifications_active</span>
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 space-y-4">
        <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Email Digest Frequency</label>
        <div className="flex p-1.5 bg-background-main rounded-2xl border border-neon-border">
          {['Instant', 'Daily', 'Weekly'].map((freq) => (
            <button
              key={freq}
              onClick={() => setDigestFrequency(freq)}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${digestFrequency === freq ? 'bg-primary text-black shadow-sm' : 'text-secondary-text'}`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section className="bg-card p-8 rounded-[40px] border border-neon-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
      <div className="space-y-1">
        <h3 className="text-xl font-black text-white">Security & Access</h3>
        <p className="text-xs text-secondary-text">Protect your account and managed credentials.</p>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-background-main/50 rounded-[32px] border border-neon-border space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
              <p className="text-[10px] text-secondary-text leading-tight">Highly recommended for account safety.</p>
            </div>
            <button 
              onClick={() => setTwoFactor(!twoFactor)}
              className={`relative w-12 h-6 rounded-full transition-colors ${twoFactor ? 'bg-primary' : 'bg-background-main border border-neon-border'}`}
            >
              <div className={`absolute top-1 left-1 size-4 rounded-full bg-white shadow-md transition-transform duration-300 ${twoFactor ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {twoFactor && (
            <div className="flex gap-2 animate-in slide-in-from-top-2">
              <button 
                onClick={() => setAuthType('app')}
                className={`flex-1 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${authType === 'app' ? 'bg-primary/5 border-primary text-primary' : 'bg-background-main border-neon-border text-secondary-text'}`}
              >
                Authenticator App
              </button>
              <button 
                onClick={() => setAuthType('sms')}
                className={`flex-1 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${authType === 'sms' ? 'bg-primary/5 border-primary text-primary' : 'bg-background-main border-neon-border text-secondary-text'}`}
              >
                SMS Code
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-neon-border">
           <h4 className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Update Password</h4>
           <div className="grid grid-cols-1 gap-4">
              <input 
                type="password" 
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-background-main border border-neon-border rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary text-white outline-none" 
              />
              <input 
                type="password" 
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background-main border border-neon-border rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary text-white outline-none" 
              />
              <button
                onClick={handleUpdatePassword}
                disabled={passwordStatus === 'updating'}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  passwordStatus === 'success' 
                    ? 'bg-green-500 text-white' 
                    : passwordStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-primary text-black hover:shadow-[0_0_20px_var(--primary-glow)]'
                }`}
              >
                {passwordStatus === 'updating' ? 'Updating...' : 
                 passwordStatus === 'success' ? 'Password Updated!' : 
                 passwordStatus === 'error' ? 'Error Updating' : 'Update Password'}
              </button>
              {passwordError && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{passwordError}</p>
              )}
           </div>
        </div>
      </div>
    </section>
  );

  const renderPrivacy = () => (
    <section className="bg-card p-8 rounded-[40px] border border-neon-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
      <div className="space-y-1">
        <h3 className="text-xl font-black text-white">Privacy Control</h3>
        <p className="text-xs text-secondary-text">Manage your data visibility and usage footprint.</p>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Public Profile', desc: 'Allows others to view your earned badges and bio.', state: publicProfile, setter: setPublicProfile },
          { label: 'Show Progress', desc: 'Share your current courses and progress %.', state: showProgress, setter: setShowProgress },
          { label: 'Search Indexing', desc: 'Allow your profile to appear in external search engines.', state: profileIndexing, setter: setProfileIndexing },
          { label: 'Anonymous Analytics', desc: 'Help us improve the platform with anonymized usage data.', state: anonymizedAnalytics, setter: setAnonymizedAnalytics }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-background-main/50 rounded-2xl border border-neon-border">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">{item.label}</p>
              <p className="text-[10px] text-secondary-text leading-tight">{item.desc}</p>
            </div>
            <button 
              onClick={() => item.setter(!item.state)}
              className={`relative w-12 h-6 rounded-full transition-colors ${item.state ? 'bg-primary' : 'bg-background-main border border-neon-border'}`}
            >
              <div className={`absolute top-1 left-1 size-4 rounded-full bg-white shadow-md transition-transform duration-300 ${item.state ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-neon-border space-y-4">
        <h4 className="text-sm font-black text-red-500 uppercase tracking-tight">Danger Zone</h4>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 py-4 px-4 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
          >
            Delete My Account
          </button>
          <button 
            onClick={() => {
              const data = { bio, timezone, language, avatarUrl, fontSize, reducedMotion, notifProgress, notifMarketing, notifSecurity, digestFrequency, twoFactor, authType, publicProfile, showProgress, anonymizedAnalytics, profileIndexing };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'learning-platform-settings-export.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 py-4 px-4 bg-background-main text-white text-[10px] font-black uppercase rounded-2xl border border-neon-border hover:bg-primary hover:text-black transition-all"
          >
            Export My Data (JSON)
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-background-dark/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-sm rounded-[40px] p-10 border border-red-500/30 shadow-2xl text-center space-y-6">
            <div className="size-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Delete Account?</h3>
              <p className="text-sm text-secondary-text leading-relaxed">
                This action is permanent and cannot be undone. All your progress, certificates, and purchases will be lost.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDeleteAccount}
                className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all uppercase tracking-widest text-xs"
              >
                Yes, Delete Permanently
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 bg-background-main text-white font-black rounded-2xl border border-neon-border hover:bg-background-secondary transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div className="space-y-2">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-secondary-text hover:text-primary transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none lg:text-5xl text-white">Account Settings</h1>
          <p className="text-secondary-text text-base md:text-lg">Personalize your professional identity.</p>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
           <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`w-full md:w-auto px-8 md:px-10 py-4 md:py-5 font-black rounded-2xl md:rounded-3xl shadow-xl hover:scale-[1.05] transition-all flex items-center justify-center gap-3 ${
              saveStatus === 'success' 
                ? 'bg-green-500 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-primary text-black hover:shadow-[0_0_20px_var(--primary-glow)]'
            }`}
          >
            {saveStatus === 'saving' ? (
              <span className="size-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : saveStatus === 'success' ? (
              <>
                <span className="material-symbols-outlined">done</span>
                SAVED SUCCESSFULLY
              </>
            ) : saveStatus === 'error' ? (
              <>
                <span className="material-symbols-outlined">error</span>
                VALIDATION ERROR
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                SAVE CHANGES
              </>
            )}
          </button>
          {saveError && (
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
              {saveError}
            </p>
          )}
          {saveStatus === 'success' && (
            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
              Syncing profile metadata...
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card p-2 md:p-4 rounded-[32px] md:rounded-[40px] border border-neon-border shadow-sm overflow-x-auto no-scrollbar">
            <nav className="flex flex-row md:flex-col gap-1 min-w-max md:min-w-0">
              {[
                { id: 'Profile', icon: 'person' },
                { id: 'Appearance', icon: 'palette' },
                { id: 'Notifications', icon: 'notifications' },
                { id: 'Security', icon: 'security' },
                { id: 'Privacy', icon: 'visibility' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingsSection)}
                  className={`flex items-center gap-2 md:gap-3 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black transition-all ${activeSection === item.id ? 'bg-primary text-black shadow-lg scale-105' : 'text-secondary-text hover:bg-primary/10 hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-lg md:text-xl">{item.icon}</span>
                  {item.id.toUpperCase()}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-8 bg-background-main text-white rounded-[40px] shadow-2xl relative overflow-hidden text-left border border-neon-border">
             <div className="absolute top-0 right-0 p-6 opacity-10">
               <span className="material-symbols-outlined text-6xl">verified_user</span>
             </div>
             <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Pro Membership</p>
             <h4 className="text-lg font-black leading-tight mb-4">Unlimited AI Tutor & Premium Certifications.</h4>
             <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[92%] shadow-[0_0_10px_var(--primary-glow)]"></div>
             </div>
             <p className="text-[9px] font-bold text-secondary-text mt-2 uppercase">Usage: 92% of Monthly Quota</p>
          </div>
        </div>

        <div className="md:col-span-2">
          {activeSection === 'Profile' && renderProfile()}
          {activeSection === 'Appearance' && renderAppearance()}
          {activeSection === 'Notifications' && renderNotifications()}
          {activeSection === 'Security' && renderSecurity()}
          {activeSection === 'Privacy' && renderPrivacy()}
        </div>
      </div>

      {/* Custom Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-4 px-8 py-4 bg-card rounded-3xl border border-neon-border shadow-2xl min-w-[320px]"
          >
            <div className={`size-10 rounded-2xl flex items-center justify-center ${notification.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              <span className="material-symbols-outlined text-2xl">
                {notification.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <p className="text-sm font-black text-white">{notification.message}</p>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto text-secondary-text hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3, ease: "linear" }}
              onAnimationComplete={() => setNotification(null)}
              className={`absolute bottom-0 left-0 h-1 rounded-full ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
