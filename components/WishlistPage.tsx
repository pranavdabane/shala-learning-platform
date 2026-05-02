
import React from 'react';
import { Course } from '../types';
import CourseCard from './CourseCard';

interface WishlistPageProps {
  wishlistCourses: Course[];
  onSelectCourse: (course: Course) => void;
  onToggleWishlist: (e: React.MouseEvent, courseId: string) => void;
  onBrowse: () => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ wishlistCourses, onSelectCourse, onToggleWishlist, onBrowse }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-none font-display text-white">My Wishlist</h1>
          <p className="text-secondary-text text-lg font-medium">Your curated selection of future skills.</p>
        </div>
        <button 
          onClick={onBrowse}
          className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group text-lg"
        >
          Browse more <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">east</span>
        </button>
      </div>

      {wishlistCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistCourses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onClick={onSelectCourse} 
              isWishlisted={true}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 bg-card rounded-[48px] border border-neon-border shadow-xl">
          <div className="size-28 rounded-3xl bg-background-main flex items-center justify-center text-secondary-text border border-neon-border shadow-[0_0_15px_var(--primary-glow)]">
            <span className="material-symbols-outlined text-6xl text-primary/40">favorite</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black font-display text-white">Your wishlist is empty</h3>
            <p className="text-secondary-text max-w-xs mx-auto font-medium">Start exploring our catalog and save the courses that inspire you most.</p>
          </div>
          <button 
            onClick={onBrowse}
            className="px-10 py-5 bg-primary text-black font-bold rounded-2xl shadow-[0_0_20px_var(--primary-glow)] hover:scale-105 transition-all uppercase tracking-widest text-sm"
          >
            EXPLORE CATALOG
          </button>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
