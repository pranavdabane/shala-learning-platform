
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { getEnrollmentROI } from '../services/gemini';
import { supabase } from '../lib/supabase';

interface EnrollmentPageProps {
  courses: Course[];
  user: { name: string; email: string } | null;
  onBack: () => void;
  onSuccess: () => void;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  upiId?: string;
}

type PaymentMethodType = 'card' | 'upi';

const EnrollmentPage: React.FC<EnrollmentPageProps> = ({ courses, user, onBack, onSuccess }) => {
  const [roiMessage, setRoiMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>('card');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const isBundle = courses.length >= 3;
  const subtotal = courses.reduce((acc, c) => acc + c.price, 0);
  const discount = isBundle ? subtotal * 0.5 : 0;
  const finalTotal = subtotal - discount;

  useEffect(() => {
    async function fetchROI() {
      if (courses.length > 0) {
        try {
          const msg = await getEnrollmentROI(courses[0]);
          setRoiMessage(msg || '');
        } catch (e) {
          console.error("ROI fetch failed", e);
        }
      }
    }
    fetchROI();
  }, [courses]);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (name.trim().length < 3) newErrors.name = "Full name required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) newErrors.email = "Valid email required.";

    if (activeMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(cleanCard)) newErrors.cardNumber = "16 digits required.";
      if (!/^\d{2}\/\d{2}$/.test(expiry)) newErrors.expiry = "MM/YY required.";
      if (!/^\d{3,4}$/.test(cvv)) newErrors.cvv = "3 or 4 digits required.";
    } else if (activeMethod === 'upi') {
      if (!upiId.includes('@') || upiId.length < 3) newErrors.upiId = "Valid UPI ID required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    setExpiry(value);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User must be logged in to enroll.");

      const orderId = Math.floor(Math.random() * 90000 + 10000).toString();
      
      const enrollmentPayload = courses.map(course => ({
        user_id: session.user.id,
        course_id: course.id,
        progress: 0,
        payment_method: activeMethod.toUpperCase(),
        order_id: orderId
      }));

      const { error } = await supabase
        .from('enrollments')
        .insert(enrollmentPayload);

      if (error) throw error;

      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(onSuccess, 3000);
    } catch (err: any) {
      console.error("Enrollment failed:", err);
      alert(err.message || "Payment gateway connection error.");
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="size-24 rounded-full bg-primary flex items-center justify-center text-black shadow-[0_0_30px_rgba(230,255,0,0.4)]">
          <span className="material-symbols-outlined text-5xl font-bold">check_circle</span>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-4xl font-black text-white">Enrollment Successful!</h2>
          <p className="text-secondary-text">You've unlocked <strong>{courses.length}</strong> new tracks on the platform.</p>
        </div>
        <p className="text-sm text-primary font-bold animate-pulse">Syncing your learning environment...</p>
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${shake ? 'animate-shake' : ''}`}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>

      <button onClick={onBack} className="flex items-center gap-2 text-secondary-text hover:text-primary transition-colors mb-8 group">
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="text-sm font-medium">Return</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <div className="space-y-2 text-left">
            <h1 className="text-3xl font-black text-white">Checkout Secure</h1>
            <p className="text-secondary-text">Finalize your professional evolution with our secure payment infrastructure.</p>
          </div>

          <form onSubmit={handlePayment} className="space-y-6 text-left">
            <div className="bg-card p-8 rounded-3xl shadow-sm border border-neon-border space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary">person</span>
                Student Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Name</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className={`w-full bg-background-main border-2 rounded-xl text-sm p-3 focus:ring-0 text-white ${errors.name ? 'border-red-500' : 'border-neon-border focus:border-primary'}`} placeholder="Jane Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary-text tracking-widest">Email</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-background-main border-2 rounded-xl text-sm p-3 focus:ring-0 text-white ${errors.email ? 'border-red-500' : 'border-neon-border focus:border-primary'}`} placeholder="jane@platform.edu" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-[32px] border border-neon-border shadow-sm overflow-hidden">
               <div className="flex border-b border-neon-border">
                  <button type="button" onClick={() => setActiveMethod('card')} className={`flex-1 py-5 flex flex-col items-center gap-2 transition-all ${activeMethod === 'card' ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-secondary-text hover:text-white'}`}>
                    <span className="material-symbols-outlined text-2xl">credit_card</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Credit/Debit</span>
                  </button>
                  <button type="button" onClick={() => setActiveMethod('upi')} className={`flex-1 py-5 flex flex-col items-center gap-2 transition-all ${activeMethod === 'upi' ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-secondary-text hover:text-white'}`}>
                    <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">UPI ID</span>
                  </button>
               </div>

               <div className="p-8">
                  {activeMethod === 'card' ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-white">Card Information</h3>
                        <div className="flex gap-2 opacity-60">
                          <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-5" alt="" />
                          <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-5" alt="" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <input required value={cardNumber} onChange={handleCardNumberChange} className="w-full bg-background-main border border-neon-border rounded-xl p-3 text-sm tracking-widest text-white focus:border-primary outline-none" placeholder="0000 0000 0000 0000" />
                        <div className="grid grid-cols-2 gap-4">
                          <input required value={expiry} onChange={handleExpiryChange} className="w-full bg-background-main border border-neon-border rounded-xl p-3 text-sm text-white focus:border-primary outline-none" placeholder="MM/YY" />
                          <input required type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-full bg-background-main border border-neon-border rounded-xl p-3 text-sm text-white focus:border-primary outline-none" placeholder="CVV" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="font-bold text-lg text-white">UPI Transfer</h3>
                      <input required value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full bg-background-main border border-neon-border rounded-xl p-4 text-sm text-white focus:border-primary outline-none" placeholder="username@bank" />
                      <p className="text-xs text-secondary-text">Authorize the request in your UPI application after clicking pay.</p>
                    </div>
                  )}
               </div>
            </div>

            <button type="submit" disabled={isProcessing} className="w-full py-5 bg-primary text-black font-black text-lg rounded-3xl shadow-[0_0_20px_rgba(230,255,0,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              {isProcessing ? <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : <>
                <span className="material-symbols-outlined">shield_with_heart</span>
                <span>CONFIRM & PAY ${finalTotal.toFixed(2)}</span>
              </>}
            </button>
          </form>
        </div>

        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-card text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden border border-neon-border text-left">
            <div className="absolute top-0 right-0 p-8 opacity-10"><span className="material-symbols-outlined text-[120px] font-black text-primary">receipt_long</span></div>
            <h3 className="text-xl font-black mb-8 relative z-10">Order Summary</h3>
            
            <div className="space-y-4 mb-8 relative z-10 max-h-40 overflow-y-auto no-scrollbar pr-2">
              {courses.map(course => (
                <div key={course.id} className="flex gap-4 items-center">
                  <img src={course.imageUrl || undefined} className="size-12 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate">{course.title}</h4>
                    <p className="text-[10px] text-secondary-text">${course.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-neon-border pt-8 relative z-10">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-secondary-text uppercase tracking-widest">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {isBundle && (
                <div className="flex justify-between text-xs font-black text-green-500">
                  <span className="uppercase tracking-widest">Bundle Discount (50% Off)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl border-t border-neon-border pt-6 font-black text-primary">
                <span className="tracking-tighter text-white">Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {roiMessage && (
            <div className="bg-card border border-neon-border p-8 rounded-[40px] text-left">
              <div className="flex items-center gap-2 text-primary mb-3">
                <span className="material-symbols-outlined text-sm font-black">auto_awesome</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Career Forecast</span>
              </div>
              <p className="text-sm font-medium italic leading-relaxed text-secondary-text">"{roiMessage}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;
