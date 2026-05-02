
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import CourseCard from './CourseCard';
import AddReviewModal from './AddReviewModal';
import { Course, EnrolledCourse } from '../types';

interface HomePageProps {
  courses: Course[];
  onBrowse: () => void;
  onLearnMore: () => void;
  onSelectCourse: (course: Course) => void;
  isLoggedIn: boolean;
  enrolledCourses: EnrolledCourse[];
  onAuthTrigger: () => void;
  onReviewSuccess?: () => void;
}

const DAILY_CHALLENGES = [
  {
    question: "In Python Data Science, which library is primarily used for high-performance multidimensional array processing?",
    options: ["Pandas", "NumPy"],
    correctIndex: 1,
    explanation: "NumPy is the fundamental package for scientific computing with Python, providing powerful N-dimensional array objects."
  },
  {
    question: "In UI/UX Design, what does the term 'Whitespace' (or Negative Space) primarily help to achieve?",
    options: ["Higher density of data", "Better readability and focus"],
    correctIndex: 1,
    explanation: "Whitespace reduces clutter, improves content legibility, and helps guide the user's eye to important elements."
  },
  {
    question: "In Modern Marketing, what does 'SEO' stand for?",
    options: ["Search Engine Optimization", "Social Engagement Operation"],
    correctIndex: 0,
    explanation: "SEO is the process of improving the quality and quantity of website traffic from search engines."
  },
  {
    question: "In Web Development, which of these is a popular JavaScript library for building user interfaces?",
    options: ["React", "Django"],
    correctIndex: 0,
    explanation: "React is a widely used JavaScript library maintained by Meta for building component-based user interfaces."
  },
  {
    question: "In Business Strategy, what does 'ROI' stand for?",
    options: ["Rate of Interest", "Return on Investment"],
    correctIndex: 1,
    explanation: "ROI measures the gain or loss generated on an investment relative to the amount of money invested."
  },
  {
    question: "In Data Science, which type of learning uses labeled data to train models?",
    options: ["Supervised Learning", "Unsupervised Learning"],
    correctIndex: 0,
    explanation: "Supervised learning uses input-output pairs to train algorithms to predict outcomes for new data."
  }
];

const HomePage: React.FC<HomePageProps> = ({ 
  courses,
  onBrowse, 
  onLearnMore, 
  onSelectCourse, 
  isLoggedIn, 
  enrolledCourses,
  onAuthTrigger,
  onReviewSuccess
}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showRequirementAlert, setShowRequirementAlert] = useState<{title: string, msg: string} | null>(null);
  
  // Challenge State - Ensures a new random question on every refresh that is different from the last one shown
  const [currentChallengeIndex] = useState(() => {
    const lastIndexStr = localStorage.getItem('lms_last_challenge_index');
    const lastIndex = lastIndexStr !== null ? parseInt(lastIndexStr, 10) : -1;
    
    let newIndex = Math.floor(Math.random() * DAILY_CHALLENGES.length);
    
    // Pick a different index if we have more than one option
    if (DAILY_CHALLENGES.length > 1) {
      while (newIndex === lastIndex) {
        newIndex = Math.floor(Math.random() * DAILY_CHALLENGES.length);
      }
    }
    
    localStorage.setItem('lms_last_challenge_index', newIndex.toString());
    return newIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  
  const challenge = DAILY_CHALLENGES[currentChallengeIndex];

  const featuredCourses = useMemo(() => {
    const featured = courses.filter(c => c.isFeatured);
    return featured.length > 0 ? featured : courses.slice(0, 4);
  }, [courses]);

  const [userReviews, setUserReviews] = useState([
    { name: "Sarah Jenkins", role: "Data Analyst at Spotify", img: "https://i.pravatar.cc/150?u=a", text: "This platform transformed my career path. The Data Science course was intense but the AI Tutor helped me clear concepts that I struggled with for months elsewhere.", isNew: false },
    { name: "Marcus Chen", role: "Senior Product Designer", img: "https://i.pravatar.cc/150?u=b", text: "The UI/UX program is world-class. Building design systems for real clients during the course gave me the portfolio I needed to land my dream job at Apple.", dark: true, isNew: false },
    { name: "Elena Rodriguez", role: "Marketing Manager", img: "https://i.pravatar.cc/150?u=c", text: "Incredible support and quality content. This isn't just a platform; it's a community that pushes you to be your best self every single day.", isNew: false }
  ]);

  const handleReviewClick = () => {
    if (!isLoggedIn) { onAuthTrigger(); return; }
    if (!enrolledCourses.some(c => c.progress >= 100)) {
      setShowRequirementAlert({
        title: "Course Completion Required",
        msg: "To ensure high-quality feedback, only students who have completed at least one course (100% progress) can post reviews."
      });
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleAddReview = (review: { name: string; text: string; rating: number; courseId?: string }) => {
    const newReview = { name: review.name, role: "Course Graduate", img: `https://i.pravatar.cc/150?u=${Math.random()}`, text: review.text, isNew: true };
    setUserReviews([newReview, ...userReviews].slice(0, 3));
    if (onReviewSuccess) onReviewSuccess();
  };

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    if (index === challenge.correctIndex) {
      setShowResultPopup(true);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <AddReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} onSuccess={handleAddReview} />

      {/* Success Popup for Correct Answer */}
      {showResultPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background-main/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-sm rounded-[40px] p-10 shadow-[0_0_30px_var(--primary-glow)] animate-in zoom-in-95 duration-300 text-center space-y-6 border border-neon-border">
            <div className="size-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 animate-bounce">
              <span className="material-symbols-outlined text-4xl font-black">verified</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-main-text uppercase tracking-tighter">True!</h3>
              <p className="text-sm text-secondary-text leading-relaxed font-medium">
                {challenge.explanation}
              </p>
            </div>
            <button 
              onClick={() => setShowResultPopup(false)} 
              className="w-full py-4 bg-primary text-black font-black rounded-2xl hover:shadow-[0_0_20px_var(--primary-glow)] transition-all shadow-lg uppercase tracking-widest"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {showRequirementAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-background-main/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-sm rounded-[40px] p-10 shadow-[0_0_30px_var(--primary-glow)] animate-in zoom-in-95 duration-300 text-center space-y-6 border border-neon-border">
            <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <span className="material-symbols-outlined text-4xl font-black">lock</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-main-text">{showRequirementAlert.title}</h3>
              <p className="text-sm text-secondary-text leading-relaxed">{showRequirementAlert.msg}</p>
            </div>
            <button onClick={() => setShowRequirementAlert(null)} className="w-full py-4 bg-primary text-black font-black rounded-2xl hover:shadow-[0_0_20px_var(--primary-glow)] transition-all shadow-lg">GOT IT</button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative px-5 sm:px-8 lg:px-12 py-16 md:py-32 overflow-hidden rounded-[32px] md:rounded-[60px] bg-background-secondary text-main-text mb-12 md:mb-20 text-left border border-neon-border">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[300px] md:size-[600px] bg-primary rounded-full blur-[80px] md:blur-[150px]"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-neon-border text-primary text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8">
            <span className="material-symbols-outlined text-sm md:text-base">auto_awesome</span>
            AI-Enhanced Learning Platform
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black leading-[1] tracking-tighter mb-6 md:mb-8">
            Master Skills <br className="hidden sm:block" />
            <span className="text-primary drop-shadow-[0_0_15px_var(--primary-glow)]">Define Careers.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-secondary-text max-w-2xl mb-10 md:mb-12 leading-relaxed font-bold">
            Join 50,000+ professionals learning high-impact skills in Technology, Design, and Business with our expert-led, AI-powered curriculum.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <motion.button 
              whileHover={{ scale: 1.05, shadow: "0 0 20px var(--primary-glow)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onBrowse} 
              className="w-full sm:w-auto px-10 py-5 bg-primary text-black font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 text-base md:text-lg"
            >
              BROWSE CATALOG <span className="material-symbols-outlined">arrow_forward</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLearnMore} 
              className="w-full sm:w-auto px-10 py-5 bg-card text-main-text font-black rounded-2xl hover:bg-background-main border border-neon-border transition-all text-base md:text-lg"
            >
              LEARN MORE
            </motion.button>
          </div>
        </div>

        <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-neon-border pt-10 md:pt-12">
          <div className="text-left"><p className="text-3xl md:text-4xl font-black text-primary">500+</p><p className="text-[10px] md:text-xs text-secondary-text uppercase font-black tracking-widest">Expert Courses</p></div>
          <div className="text-left"><p className="text-3xl md:text-4xl font-black text-main-text">50k+</p><p className="text-[10px] md:text-xs text-secondary-text uppercase font-black tracking-widest">Active Students</p></div>
          <div className="text-left"><p className="text-3xl md:text-4xl font-black text-main-text">4.9/5</p><p className="text-[10px] md:text-xs text-secondary-text uppercase font-black tracking-widest">Average Rating</p></div>
          <div className="text-left"><p className="text-3xl md:text-4xl font-black text-main-text">92%</p><p className="text-[10px] md:text-xs text-secondary-text uppercase font-black tracking-widest">Career Advancement</p></div>
        </div>
      </section>

      {/* Daily AI Challenge Card */}
      <section className="mb-24 px-0">
        <div className="bg-background-secondary border-2 border-neon-border p-8 md:p-16 rounded-[48px] md:rounded-[64px] flex flex-col lg:flex-row items-center justify-between gap-12 text-left relative overflow-hidden">
           <div className="space-y-6 w-full lg:max-w-2xl relative z-10">
             <div className="flex items-center gap-3 text-primary">
               <span className="material-symbols-outlined font-black text-2xl">bolt</span>
               <span className="text-xs font-black uppercase tracking-[0.4em]">Daily AI IQ Challenge</span>
             </div>
             <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-main-text">Test your industry knowledge.</h2>
             <p className="text-secondary-text text-lg md:text-2xl font-bold leading-tight py-2">
               "{challenge.question}"
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-6">
                {challenge.options.map((opt, i) => (
                  <motion.button 
                    key={i}
                    whileHover={selectedOption === null ? { scale: 1.02, shadow: "0 0 15px var(--primary-glow)" } : {}}
                    whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                    disabled={selectedOption !== null}
                    onClick={() => handleOptionClick(i)}
                    className={`px-8 py-5 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-4 min-h-[64px] ${
                      selectedOption === null 
                        ? 'bg-background-main text-main-text hover:bg-primary hover:text-black border-neon-border' 
                        : selectedOption === i 
                          ? i === challenge.correctIndex 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'bg-red-500 border-red-500 text-white'
                          : 'bg-card border-neon-border text-secondary-text opacity-50'
                    }`}
                  >
                    {selectedOption === i && (
                      <span className="material-symbols-outlined text-lg">
                        {i === challenge.correctIndex ? 'check_circle' : 'cancel'}
                      </span>
                    )}
                    {opt}
                  </motion.button>
                ))}
             </div>
             
             {selectedOption !== null && selectedOption !== challenge.correctIndex && (
               <p className="text-sm font-black text-red-500 animate-in slide-in-from-top-2 flex items-center gap-3 mt-4">
                 <span className="material-symbols-outlined text-lg">error</span>
                 Incorrect. The right answer is {challenge.options[challenge.correctIndex]}.
               </p>
             )}
           </div>
           
           <div className="shrink-0 relative hidden lg:block">
              <div className="size-64 bg-primary/10 rounded-full flex items-center justify-center animate-pulse border-4 border-neon-border">
                <span className="material-symbols-outlined text-[160px] text-primary font-black opacity-40">psychology</span>
              </div>
           </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="mb-24 text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-10 md:mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-main-text">Featured Programs</h2>
            <p className="text-sm md:text-lg text-secondary-text font-bold">Kickstart your journey with our popular specialized courses.</p>
          </div>
          <button onClick={onBrowse} className="flex items-center gap-3 text-primary font-black hover:gap-5 transition-all text-base md:text-xl group">
            See All Courses <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">east</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {featuredCourses.map(course => (
            <CourseCard key={course.id} course={course} onClick={onSelectCourse} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-24 space-y-10 md:space-y-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1 md:space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-main-text">Voices of Success</h2>
            <p className="text-xs md:text-sm text-secondary-text font-medium">Genuine feedback from our graduates.</p>
          </div>
          <button onClick={handleReviewClick} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-primary text-black border-2 border-primary rounded-2xl md:rounded-3xl font-black hover:shadow-[0_0_20px_var(--primary-glow)] transition-all shadow-xl shadow-primary/10 text-xs md:text-sm">
            <span className="material-symbols-outlined text-lg md:text-xl">rate_review</span> ADD YOUR REVIEW
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {userReviews.map((rev, idx) => (
              <div key={`${rev.name}-${idx}`} className={`relative p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border text-left space-y-4 md:space-y-6 transition-transform hover:-translate-y-2 duration-300 bg-card border-neon-border hover:shadow-[0_0_20px_var(--primary-glow)]`}>
                {rev.isNew && <div className="absolute -top-3 -right-3 bg-primary text-black text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full shadow-lg">NEW REVIEW</div>}
                <div className="flex gap-0.5 md:gap-1 text-primary"> {[1,2,3,4,5].map(j => <span key={`${rev.name}-${idx}-star-${j}`} className="material-symbols-outlined text-sm md:text-base fill-1">star</span>)} </div>
              <p className={`italic leading-relaxed text-sm md:text-base text-secondary-text`}> "{rev.text}" </p>
              <div className={`flex items-center gap-3 md:gap-4 border-t pt-4 md:pt-6 border-neon-border`}>
                <img src={rev.img || undefined} className="size-10 md:size-12 rounded-full ring-2 ring-primary/20" alt="" />
                <div><h4 className="font-black text-xs md:text-sm text-main-text">{rev.name}</h4><p className={`text-[8px] md:text-[10px] uppercase font-bold tracking-tighter text-primary`}> {rev.role} </p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary rounded-[40px] md:rounded-[60px] p-8 md:p-24 text-center space-y-8 relative overflow-hidden shadow-[0_0_50px_var(--primary-glow)]">
        <div className="absolute top-0 right-0 p-10 opacity-10 hidden md:block"><span className="material-symbols-outlined text-[200px] font-black text-black">celebration</span></div>
        <h2 className="text-3xl md:text-7xl font-black text-black leading-none tracking-tighter">Ready to start <br />your journey?</h2>
        <p className="text-black/70 font-bold text-base md:text-xl max-w-xl mx-auto uppercase tracking-wide">Unlock 500+ premium industry certifications.</p>
        <button onClick={onBrowse} className="w-full sm:w-auto px-10 md:px-14 py-5 md:py-6 bg-black text-white font-black rounded-2xl md:rounded-3xl hover:scale-110 active:scale-95 transition-all shadow-2xl text-base md:text-lg tracking-widest">JOIN US TODAY</button>
      </section>
    </div>
  );
};

export default HomePage;
