
import React from 'react';
import { EnrolledCourse } from '../types';
import { motion } from 'motion/react';

interface ReceiptModalProps {
  order: EnrolledCourse | null;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background-dark/80 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card w-full max-w-md rounded-[32px] shadow-2xl flex flex-col border border-neon-border overflow-hidden text-white"
      >
        <div className="p-6 border-b border-neon-border flex justify-between items-center bg-background-secondary shrink-0">
          <div className="text-left">
            <h2 className="text-xl font-black tracking-tight font-display">Order Receipt</h2>
            <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mt-1">Transaction Verified</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-background-main flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 no-scrollbar text-left">
          <div className="flex gap-4 items-start">
            <img src={order.imageUrl || undefined} className="size-16 rounded-2xl object-cover shadow-2xl border border-neon-border" alt="" referrerPolicy="no-referrer" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">{order.category}</p>
              <h3 className="text-lg font-black font-display leading-tight">{order.title}</h3>
              <p className="text-xs text-secondary-text font-medium">Instructor: {order.instructor || 'Platform Expert'}</p>
            </div>
          </div>

          <div className="bg-background-main p-5 rounded-2xl border border-neon-border space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-text">Order ID</span>
              <span className="text-xs font-black text-white">#{order.orderId || '72941'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-text">Purchase Date</span>
              <span className="text-xs font-black text-white">{order.purchaseDate || 'Mar 1, 2025'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-text">Payment Method</span>
              <span className="text-xs font-black text-white">{order.paymentMethod || 'Credit Card'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-text">Status</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">Completed</span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black font-display">Total Amount Paid</span>
              <span className="text-2xl font-black text-primary font-display">${order.price.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-secondary-text leading-relaxed font-medium italic">
              A copy of this receipt has been sent to your registered email address. This transaction is secured by end-to-end encryption.
            </p>
          </div>

          <div className="pt-4">
            <button 
              onClick={onClose} 
              className="w-full py-3 bg-primary text-black font-black rounded-2xl hover:scale-[1.02] transition-all uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(230,255,0,0.4)]"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReceiptModal;
