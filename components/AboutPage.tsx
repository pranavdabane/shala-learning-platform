
import React, { useEffect, useState } from 'react';
import ContactForm from './ContactForm';
import { supabase } from '../lib/supabase';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const [user, setUser] = useState<{name?: string, email?: string}>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          name: session.user.user_metadata?.full_name,
          email: session.user.email
        });
      }
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-24 pb-24 text-left">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-secondary-text hover:text-primary transition-all group"
      >
        <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
        <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
      </button>

      {/* Hero Section */}
      <section className="text-center space-y-8 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em]">
          Our Difference
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] font-display text-white">
          Redefining <br />
          <span className="text-primary italic">Excellence.</span>
        </h1>
        <p className="text-lg md:text-xl text-secondary-text max-w-2xl mx-auto leading-relaxed font-medium">
          Founded in 2018, we have grown from a boutique design academy to a global leader in AI-enhanced professional development.
        </p>
      </section>

      {/* Methodology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        <div className="bg-card p-12 rounded-[48px] shadow-xl border border-neon-border space-y-8 hover:shadow-[0_0_30px_rgba(230,255,0,0.2)] transition-all duration-500">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-3xl font-bold">psychology</span>
          </div>
          <h3 className="text-3xl font-black font-display text-white">AI-Powered Pedagogy</h3>
          <p className="text-secondary-text leading-relaxed text-lg">
            We don't just provide videos. Every course is integrated with our custom Gemini-powered AI Tutor that understands the specific syllabus and provides real-time, context-aware assistance to students 24/7.
          </p>
        </div>
        <div className="bg-background-secondary text-white p-12 rounded-[48px] shadow-2xl relative overflow-hidden space-y-8 hover:shadow-primary/10 transition-all duration-500 border border-neon-border">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[160px] font-black text-primary">workspace_premium</span>
          </div>
          <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-primary shadow-xl border border-white/10">
            <span className="material-symbols-outlined text-3xl font-bold">verified</span>
          </div>
          <h3 className="text-3xl font-black font-display text-white">Industry Reputation</h3>
          <p className="text-secondary-text leading-relaxed text-lg">
            Our certifications are recognized by Fortune 500 companies. Our curriculum is co-designed with hiring managers from top-tier tech firms to ensure our graduates are day-one ready.
          </p>
        </div>
      </div>

      {/* Reputation Section */}
      <section className="space-y-16 px-4">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black font-display text-white">Elite Instructor Network</h2>
          <p className="text-secondary-text font-medium">Learn from the practitioners, not just academics.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Dr. Aris Thorne", role: "Ex-Google AI Lead", img: "https://i.pravatar.cc/150?u=instructor1" },
            { name: "Sophia Varga", role: "Principal Architect at Meta", img: "https://i.pravatar.cc/150?u=instructor2" },
            { name: "Jameson Knorr", role: "Founding Partner at Knorr VC", img: "https://i.pravatar.cc/150?u=instructor3" }
          ].map((ins, i) => (
            <div key={i} className="group flex flex-col items-center text-center p-10 bg-card rounded-[40px] border border-neon-border hover:border-primary/50 hover:shadow-[0_0_25px_rgba(230,255,0,0.15)] transition-all duration-500">
              <div className="relative mb-6">
                <img src={ins.img || undefined} className="size-28 rounded-3xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ring-4 ring-transparent group-hover:ring-primary/20" alt={ins.name} />
                <div className="absolute -bottom-2 -right-2 size-8 bg-primary rounded-xl flex items-center justify-center text-black shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="material-symbols-outlined text-sm font-black">verified</span>
                </div>
              </div>
              <h4 className="font-bold text-xl mb-1 text-white">{ins.name}</h4>
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">{ins.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="space-y-12 px-4">
        <div className="text-center space-y-2">
          <h2 className="text-5xl font-black tracking-tighter font-display text-white">Get in Touch</h2>
          <p className="text-secondary-text font-medium">We're here to support your professional evolution.</p>
        </div>
        <ContactForm userName={user.name} userEmail={user.email} />
      </section>

      {/* Global Impact */}
      <section className="bg-primary p-12 md:p-24 rounded-[60px] flex flex-col md:flex-row items-center justify-between gap-16 text-black mx-4 shadow-2xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[200px] font-black text-black">public</span>
        </div>
        <div className="max-w-lg space-y-6 text-center md:text-left relative z-10">
          <h2 className="text-4xl md:text-6xl font-black leading-[0.9] font-display">Global Impact by Numbers</h2>
          <p className="font-bold opacity-90 text-lg md:text-xl uppercase tracking-widest">Our reputation is built on the success of our global alumni network.</p>
        </div>
        <div className="grid grid-cols-2 gap-12 w-full md:w-auto relative z-10">
          <div className="text-center space-y-2">
            <p className="text-4xl md:text-6xl font-black font-display">1.2M+</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">Learning Hours</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-4xl md:text-6xl font-black font-display">85k+</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">Career Shifts</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
