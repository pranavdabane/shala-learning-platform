
import React, { useState } from 'react';
import { Course, CartItem, EnrolledCourse } from '../types';
import ReceiptModal from './ReceiptModal';
import { AnimatePresence } from 'motion/react';

interface CartPageProps {
  cartItems: CartItem[];
  wishlistCourses: Course[];
  purchaseHistory: EnrolledCourse[];
  onRemoveFromCart: (id: string) => void;
  onAddToCart: (course: Course) => void;
  onRemoveFromWishlist: (e: React.MouseEvent, id: string) => void;
  onCheckout: () => void;
  onBrowse: () => void;
  onSelectCourse: (course: Course) => void;
}

const CartPage: React.FC<CartPageProps> = ({ 
  cartItems, 
  wishlistCourses,
  purchaseHistory, 
  onRemoveFromCart, 
  onAddToCart,
  onRemoveFromWishlist,
  onCheckout, 
  onBrowse,
  onSelectCourse
}) => {
  const [selectedOrder, setSelectedOrder] = useState<EnrolledCourse | null>(null);
  const isDiscountActive = cartItems.length >= 3;
  const originalTotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const cartTotal = isDiscountActive ? originalTotal * 0.5 : originalTotal;
  const savings = originalTotal - cartTotal;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-4 text-left">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] font-display text-white">Your Shop</h1>
          <p className="text-secondary-text text-lg md:text-2xl font-medium max-w-2xl leading-tight">Manage your cart and unlock high-impact bundles for your professional growth.</p>
        </div>
      </div>

          <div className={`p-10 md:p-16 rounded-[56px] flex flex-col md:flex-row items-center justify-between gap-10 transition-all duration-700 border-2 ${isDiscountActive ? 'bg-primary/10 border-primary shadow-2xl shadow-primary/10' : 'bg-card border-neon-border shadow-sm'}`}>
         <div className="flex flex-col sm:flex-row items-center gap-10 text-center sm:text-left">
            <div className={`size-24 md:size-28 rounded-[40px] flex items-center justify-center transition-all shrink-0 ${isDiscountActive ? 'bg-primary text-black shadow-xl scale-110' : 'bg-background-main text-secondary-text border border-neon-border'}`}>
               <span className="material-symbols-outlined text-5xl font-black">{isDiscountActive ? 'celebration' : 'shopping_bag'}</span>
            </div>
            <div className="space-y-3">
               <h3 className="text-3xl md:text-4xl font-black tracking-tighter font-display text-white">Bundle Offer Status</h3>
               <p className="text-lg md:text-xl font-medium text-secondary-text max-w-lg leading-tight">
                 {isDiscountActive 
                    ? "Congratulations! You've unlocked 50% OFF on all courses in your cart." 
                    : `Add ${3 - cartItems.length} more courses to unlock the massive 50% bundle discount.`}
               </p>
            </div>
         </div>
         {isDiscountActive ? (
            <div className="flex items-center gap-8">
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-1">You Saved</p>
                 <p className="text-4xl md:text-5xl font-black text-green-500 font-display">-${savings.toFixed(2)}</p>
              </div>
              <div className="size-16 rounded-3xl bg-green-500 flex items-center justify-center text-white shadow-2xl animate-bounce border-4 border-white/20">
                 <span className="material-symbols-outlined text-3xl font-black">check</span>
              </div>
            </div>
         ) : (
            <div className="flex gap-4">
               {[1, 2, 3].map((step) => (
                 <div key={step} className={`size-5 rounded-full transition-all duration-500 border-2 ${cartItems.length >= step ? 'bg-primary border-primary shadow-[0_0_20px_rgba(230,255,0,0.6)] scale-125' : 'bg-background-main border-neon-border'}`}></div>
               ))}
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-24">
        <div className="lg:col-span-2 space-y-20">
          <section className="space-y-10">
            <div className="flex items-center justify-between border-b border-neon-border pb-8">
              <h2 className="text-3xl md:text-4xl font-black font-display flex items-center gap-5 text-white">
                <span className="material-symbols-outlined text-primary text-4xl">shopping_cart</span>
                My Items ({cartItems.length})
              </h2>
            </div>

            {cartItems.length > 0 ? (
              <div className="space-y-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="group bg-card p-8 rounded-[48px] border border-neon-border flex flex-col sm:flex-row gap-10 hover:shadow-[0_0_25px_rgba(230,255,0,0.35)] transition-all duration-700 hover:-translate-y-1">
                    <div className="w-full sm:w-64 h-40 rounded-[32px] overflow-hidden cursor-pointer shrink-0" onClick={() => onSelectCourse(item)}>
                      <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2 text-left">
                      <div className="flex justify-between items-start gap-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">{item.category}</p>
                          <h3 className="font-black text-2xl md:text-3xl leading-tight hover:text-primary cursor-pointer transition-colors font-display text-white" onClick={() => onSelectCourse(item)}>{item.title}</h3>
                        </div>
                        <div className="text-right">
                          {isDiscountActive && <p className="text-xs text-secondary-text line-through font-black mb-1">${item.price}</p>}
                          <p className="text-3xl font-black text-primary font-display">${isDiscountActive ? (item.price * 0.5).toFixed(2) : item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10 mt-8">
                        <button onClick={() => onRemoveFromCart(item.id)} className="text-[10px] font-black text-secondary-text hover:text-red-500 flex items-center gap-2 uppercase tracking-widest transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                          Remove
                        </button>
                        <button onClick={() => { onAddToCart(item); onCheckout(); }} className="text-[10px] font-black text-secondary-text hover:text-primary flex items-center gap-2 uppercase tracking-widest transition-colors">
                          <span className="material-symbols-outlined text-xl">arrow_forward</span>
                          Buy Individual
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-black text-white p-12 md:p-20 rounded-[64px] shadow-2xl space-y-12 mt-16 border border-neon-border relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none"><span className="material-symbols-outlined text-[240px] font-black text-primary">payments</span></div>
                  <div className="relative z-10 space-y-8">
                    {isDiscountActive && (
                      <div className="space-y-5">
                        <div className="flex justify-between text-secondary-text font-black uppercase tracking-[0.4em] text-[10px]">
                          <span>Order Subtotal</span>
                          <span className="line-through">${originalTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-500 font-black uppercase tracking-[0.4em] text-[10px]">
                          <span>Special Bundle Savings</span>
                          <span>-${savings.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-neon-border pt-12 gap-8">
                      <div className="space-y-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Grand Total Payable</p>
                        <p className="text-6xl md:text-8xl font-black tracking-tighter font-display">${cartTotal.toFixed(2)}</p>
                      </div>
                      <p className="text-sm font-medium text-secondary-text italic pb-3">Includes all taxes & platform fees.</p>
                    </div>
                  </div>
                  <button onClick={onCheckout} className="w-full py-8 md:py-10 bg-primary text-black font-black rounded-[32px] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(230,255,0,0.4)] text-2xl tracking-[0.3em] relative z-10 uppercase">
                    COMPLETE CHECKOUT
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-40 text-center bg-card rounded-[80px] border-2 border-dashed border-neon-border shadow-sm space-y-10">
                <div className="size-32 bg-background-main rounded-[40px] flex items-center justify-center mx-auto text-secondary-text border-2 border-dashed border-neon-border">
                  <span className="material-symbols-outlined text-7xl">shopping_cart_off</span>
                </div>
                <div className="space-y-4">
                   <h3 className="text-3xl font-black font-display text-white">Your cart is feeling light.</h3>
                   <p className="text-secondary-text font-medium text-xl max-w-md mx-auto leading-tight">Add some courses to your cart to begin your mastery journey.</p>
                </div>
                <button onClick={onBrowse} className="px-16 py-6 bg-primary text-black font-black rounded-2xl shadow-[0_0_20px_rgba(230,255,0,0.4)] hover:scale-110 transition-all uppercase tracking-widest text-xs">Explore Catalog</button>
              </div>
            )}
          </section>

          <section className="space-y-10">
            <h2 className="text-3xl md:text-4xl font-black font-display flex items-center gap-5 border-b border-neon-border pb-8 text-white">
              <span className="material-symbols-outlined text-primary text-4xl">favorite</span>
              Saved Tracks ({wishlistCourses.length})
            </h2>
            {wishlistCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {wishlistCourses.map((course) => (
                  <div key={course.id} className="group bg-card p-8 rounded-[48px] border border-neon-border flex flex-col gap-8 hover:shadow-[0_0_25px_rgba(230,255,0,0.35)] transition-all duration-700 text-left hover:-translate-y-1">
                    <div className="relative h-56 rounded-[32px] overflow-hidden cursor-pointer" onClick={() => onSelectCourse(course)}>
                      <img src={course.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" referrerPolicy="no-referrer" />
                      <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md text-primary text-base font-black px-6 py-3 rounded-2xl shadow-2xl border border-neon-border">
                        ${course.price}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-black text-2xl leading-tight line-clamp-1 font-display text-white">{course.title}</h4>
                      <div className="flex items-center justify-between pt-6 border-t border-neon-border">
                        <button onClick={(e) => onRemoveFromWishlist(e, course.id)} className="text-[10px] font-black text-secondary-text hover:text-red-500 uppercase tracking-[0.2em] transition-colors">Remove</button>
                        <button onClick={() => onAddToCart(course)} className="px-8 py-4 bg-background-main text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-black transition-all border border-neon-border text-white">Move to Cart</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-24 text-center border-2 border-dashed border-neon-border rounded-[64px] text-secondary-text uppercase font-black text-[10px] tracking-[0.4em] bg-card">No saved items found.</div>
            )}
          </section>
        </div>

        <div className="space-y-10 text-left">
          <h2 className="text-3xl md:text-4xl font-black font-display flex items-center gap-5 border-b border-neon-border pb-8 text-white">
            <span className="material-symbols-outlined text-primary text-4xl">history</span>
            Recent Orders
          </h2>
          <div className="space-y-8">
            {purchaseHistory.length > 0 ? (
              purchaseHistory.map((order) => (
                <div key={order.id} className="bg-card p-8 rounded-[48px] border border-neon-border space-y-8 shadow-sm hover:shadow-[0_0_25px_rgba(230,255,0,0.35)] transition-all duration-700 hover:-translate-y-1">
                  <div className="flex gap-6">
                    <img src={order.imageUrl} className="size-24 rounded-[24px] object-cover shadow-xl" alt="" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <h4 className="font-black text-lg md:text-xl line-clamp-2 leading-tight font-display text-white">{order.title}</h4>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">ID: #{order.orderId || '72941'}</p>
                    </div>
                  </div>
                    <div className="pt-8 border-t border-neon-border space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-secondary-text"><span>Method</span><span className="text-white">{order.paymentMethod || 'Credit Card'}</span></div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-secondary-text"><span>Date</span><span className="text-white">{order.purchaseDate || 'Mar 1, 2025'}</span></div>
                  </div>
                  <button onClick={() => setSelectedOrder(order)} className="w-full py-5 bg-background-main rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-black transition-all border border-neon-border text-white">Receipt & Details</button>
                </div>
              ))
            ) : (
              <div className="p-20 text-center bg-card rounded-[48px] border border-neon-border"><p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.4em]">No order history</p></div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <ReceiptModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
