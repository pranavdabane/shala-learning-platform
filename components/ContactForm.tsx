
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface ContactFormProps {
  userEmail?: string;
  userName?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ userEmail, userName }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Save to Supabase for internal records
      const { error: insertError } = await supabase
        .from('inquiries')
        .insert([{
          full_name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          user_id: session?.user?.id || null
        }]);

      if (insertError) throw insertError;

      setIsSuccess(true);
      setFormData({ ...formData, message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-[48px] p-10 md:p-16 shadow-2xl border border-neon-border text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-[180px] font-black text-primary">mail</span>
      </div>

      <div className="max-w-2xl relative z-10">
        <div className="space-y-4 mb-12">
          <h2 className="text-4xl font-black tracking-tighter font-display text-main-text">Direct Inquiry</h2>
          <p className="text-secondary-text font-medium text-lg">Have a specific question about our curriculum or corporate training? Reach out directly.</p>
        </div>

        {isSuccess ? (
          <div className="bg-primary/10 border-2 border-primary/20 p-12 rounded-[40px] text-center space-y-6 animate-in zoom-in-95">
            <div className="size-20 bg-primary rounded-full flex items-center justify-center mx-auto text-black shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-4xl font-black">done_all</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-primary font-display">Message Delivered</h3>
              <p className="text-base font-medium text-secondary-text">Our support leads will contact you within 24 hours.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-secondary-text tracking-[0.2em] ml-1">Full Name</label>
                <input 
                  ref={nameInputRef}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background-main border border-neon-border rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-primary transition-all outline-none text-white" 
                  placeholder="Jane Learner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-secondary-text tracking-[0.2em] ml-1">Email Address</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-background-main border border-neon-border rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-primary transition-all outline-none text-white" 
                  placeholder="jane@example.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-secondary-text tracking-[0.2em] ml-1">Subject</label>
              <div className="relative">
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-background-main border border-neon-border rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-primary transition-all outline-none text-main-text appearance-none cursor-pointer"
                >
                  <option className="bg-background-secondary">General Inquiry</option>
                  <option className="bg-background-secondary">Course Content Feedback</option>
                  <option className="bg-background-secondary">Corporate Training</option>
                  <option className="bg-background-secondary">Technical Support</option>
                  <option className="bg-background-secondary">Billing Question</option>
                </select>
                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-text">expand_more</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-secondary-text tracking-[0.2em] ml-1">Your Message</label>
              <textarea 
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-background-main border border-neon-border rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-primary transition-all outline-none text-main-text resize-none" 
                placeholder="How can we help you achieve your goals?" 
              />
            </div>

            <button 
              disabled={isSubmitting}
              className="w-full py-6 bg-primary text-black font-black rounded-3xl shadow-[0_0_20px_var(--primary-glow)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group uppercase tracking-widest text-sm"
            >
              {isSubmitting ? (
                <span className="size-6 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Submit Inquiry</span>
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
