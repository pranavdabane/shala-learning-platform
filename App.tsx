
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import CourseCard from './components/CourseCard';
import CourseDetail from './components/CourseDetail';
import EnrollmentPage from './components/EnrollmentPage';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import WishlistPage from './components/WishlistPage';
import MyLearningPage from './components/MyLearningPage';
import CoursePlayer from './components/CoursePlayer';
import CartPage from './components/CartPage';
import CareerPathsPage from './components/CareerPathsPage';
import SettingsPage from './components/SettingsPage';
import AdminPage from './components/AdminPage';
import MaintenancePage from './components/MaintenancePage';
import GeneralAITutor from './components/GeneralAITutor';
import KnowledgeBriefPage from './components/KnowledgeBriefPage';
import { COURSES } from './constants';
import { Category, Course, EnrolledCourse, CartItem } from './types';
import { supabase } from './lib/supabase';

interface PlatformSettings {
  maintenanceMode: boolean;
  maintenanceEndTime?: number;
  platformFee: number;
  enableAiTutor: boolean;
  defaultCurrency: string;
  minWithdrawal: number;
  allowGuestReviews: boolean;
}

interface LegalSection {
  h: string;
  p: string;
}

interface LegalDoc {
  title: string;
  updated: string;
  sections: LegalSection[];
}

interface LegalContent {
  terms: LegalDoc;
  privacy: LegalDoc;
}

const DEFAULT_LEGAL: LegalContent = {
  terms: {
    title: "Terms of Service",
    updated: "Last Updated: May 20, 2025",
    sections: [
      { h: "1. Acceptance of Terms", p: "By accessing or using the platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services." },
      { h: "2. Learning Content", p: "All courses provided on this platform are for educational purposes. We strive for accuracy but do not guarantee specific career outcomes or employment results from completing courses." },
      { h: "3. Payments and Refunds", p: "Enrollment fees are processed securely. Refund requests must be submitted within 30 days of purchase and are subject to course progress validation (less than 20% completion)." },
      { h: "4. Intellectual Property", p: "All course materials, including videos, documents, and AI-generated insights, are the exclusive property of the platform and its instructors. Unauthorized redistribution is prohibited." }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Last Updated: May 20, 2025",
    sections: [
      { h: "1. Data Collection", p: "We collect information you provide directly to us, such as your name, email address, and payment information when you enroll in courses." },
      { h: "2. Use of AI", p: "Our AI Tutor (powered by Gemini) processes your course-related questions to provide educational assistance. Chat logs are stored to improve tutor accuracy but are never sold to third parties." },
      { h: "3. Information Sharing", p: "We do not share your personal information with third parties except as necessary to provide our services (e.g., payment processing via Stripe)." },
      { h: "4. Your Rights", p: "You have the right to access, update, or delete your account information at any time via the Settings panel." }
    ]
  }
};

const LegalModal: React.FC<{ type: 'terms' | 'privacy' | null; content: LegalContent; onClose: () => void }> = ({ type, content, onClose }) => {
  if (!type) return null;
  const active = content[type];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background-dark/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-2xl rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] border border-neon-border overflow-hidden text-white">
        <div className="p-8 border-b border-neon-border flex justify-between items-center bg-background-secondary shrink-0">
          <div className="text-left">
            <h2 className="text-3xl font-black tracking-tight">{active.title}</h2>
            <p className="text-[10px] font-black uppercase text-secondary-text tracking-widest mt-1">{active.updated}</p>
          </div>
          <button onClick={onClose} className="size-12 rounded-full hover:bg-background-main flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <div className="p-10 overflow-y-auto space-y-10 no-scrollbar">
          {active.sections.map((s) => (
            <div key={s.h} className="space-y-3 text-left">
              <h4 className="text-lg font-black text-primary">{s.h}</h4>
              <p className="text-sm text-secondary-text leading-relaxed font-medium">{s.p}</p>
            </div>
          ))}
          <div className="pt-6 border-t border-neon-border">
            <button onClick={onClose} className="w-full py-5 bg-primary text-black font-black rounded-3xl hover:scale-[1.02] transition-all uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(230,255,0,0.4)]">
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>(Category.ALL);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'about' | 'wishlist' | 'mylearning' | 'cart' | 'career-paths' | 'settings' | 'admin' | 'ai-tutor' | 'knowledge-brief'>('home');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentItems, setEnrollmentItems] = useState<Course[]>([]);
  const [isAuthing, setIsAuthing] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [legalType, setLegalType] = useState<'terms' | 'privacy' | null>(null);
  
  const [isBundleBuilding, setIsBundleBuilding] = useState(false);
  const [selectedBundleCourses, setSelectedBundleCourses] = useState<Course[]>([]);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [enrolledCoursesData, setEnrolledCoursesData] = useState<EnrolledCourse[]>([]);
  const [playingCourse, setPlayingCourse] = useState<EnrolledCourse | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string; avatarUrl?: string | null } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {};

  // FETCH ENROLLMENTS FROM SUPABASE
  const fetchEnrollments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        const fullEnrolledData: EnrolledCourse[] = data.map(item => {
          const courseBase = allCourses.find(c => c.id === item.course_id);
          return {
            ...(courseBase || allCourses[0]),
            progress: item.progress || 0,
            purchaseDate: new Date(item.created_at).toLocaleDateString(),
            paymentMethod: item.payment_method,
            orderId: item.order_id
          };
        });
        setEnrolledCoursesData(fullEnrolledData);
      }
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
    }
  };

  // FETCH WISHLIST FROM SUPABASE
  const fetchWishlist = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('course_id')
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        setWishlist(data.map(item => item.course_id));
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  // SYNC PROFILE TO PUBLIC TABLE FOR ADMIN VISIBILITY
  const syncProfile = async (user: any, isLogin: boolean = false, isRegister: boolean = false) => {
    try {
      // Log activity
      if (isLogin || isRegister) {
        await supabase.from('activity_log').insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner',
          activity_type: isRegister ? 'REGISTER' : 'LOGIN',
          created_at: new Date().toISOString()
        });
      }

      // Fetch current profile to get login count
      const { data: profile } = await supabase
        .from('profiles')
        .select('login_count')
        .eq('id', user.id)
        .single();

      const currentCount = profile?.login_count || 0;
      const newCount = isLogin ? currentCount + 1 : currentCount;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner',
          login_count: newCount,
          last_login_at: isLogin ? new Date().toISOString() : undefined
        }, { onConflict: 'id' });
      
      if (error) console.warn("Profile sync failed (likely table missing or RLS):", error.message);
    } catch (err) {
      console.error("Profile sync error:", err);
    }
  };

  // SUPABASE AUTH SYNC
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setUserData({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Learner',
          email: session.user.email || '',
          avatarUrl: session.user.user_metadata?.avatar_url || null
        });
        setIsAdmin(session.user.email === 'pranavdabane41@gmail.com');
        fetchEnrollments(session.user.id);
        fetchWishlist(session.user.id);
        syncProfile(session.user, false, false); // Just sync, don't increment on session recovery
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setUserData({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Learner',
          email: session.user.email || '',
          avatarUrl: session.user.user_metadata?.avatar_url || null
        });
        setIsAdmin(session.user.email === 'pranavdabane41@gmail.com');
        fetchEnrollments(session.user.id);
        fetchWishlist(session.user.id);
        
        // Only increment login count on actual sign in event
        if (event === 'SIGNED_IN') {
          syncProfile(session.user, true, false);
        } else {
          syncProfile(session.user, false, false);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
        setIsAdmin(false);
        setEnrolledCoursesData([]);
        setWishlist([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    const saved = localStorage.getItem('lms_platform_settings');
    return saved ? JSON.parse(saved) : {
      maintenanceMode: false,
      maintenanceEndTime: undefined,
      platformFee: 15,
      enableAiTutor: true,
      defaultCurrency: 'USD',
      minWithdrawal: 100,
      allowGuestReviews: false
    };
  });

  const [legalContent, setLegalContent] = useState<LegalContent>(() => {
    const saved = localStorage.getItem('lms_legal_content');
    return saved ? JSON.parse(saved) : DEFAULT_LEGAL;
  });

  const [allCourses, setAllCourses] = useState<Course[]>(() => {
    const local = localStorage.getItem('lms_all_courses');
    return local ? JSON.parse(local) : COURSES;
  });

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase.from('courses').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        setAllCourses(data as Course[]);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const syncCourseRatings = async () => {
    try {
      const { data: reviews, error: rError } = await supabase
        .from('reviews')
        .select('rating, course_id');
      
      if (rError) throw rError;

      const { data: latestCourses, error: cError } = await supabase.from('courses').select('*');
      if (cError) throw cError;

      const updatedCourses = (latestCourses as Course[]).map(course => {
        const courseReviews = reviews.filter(r => r.course_id === course.id);
        if (courseReviews.length > 0) {
          const totalRating = courseReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = parseFloat((totalRating / courseReviews.length).toFixed(1));
          const reviewCount = courseReviews.length;
          const reviewsStr = reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : `${reviewCount}`;
          
          if (course.rating !== avgRating || course.reviews !== reviewsStr) {
            supabase.from('courses').update({ 
              rating: avgRating, 
              reviews: reviewsStr 
            }).eq('id', course.id).then(({ error }) => {
              if (error) console.error(`Error syncing rating for course ${course.id}:`, error);
            });
            return { ...course, rating: avgRating, reviews: reviewsStr };
          }
        }
        return course;
      });
      
      setAllCourses(updatedCourses);
    } catch (err) {
      console.error("Failed to sync course ratings:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    syncCourseRatings();
  }, []);

  useEffect(() => {
    localStorage.setItem('lms_all_courses', JSON.stringify(allCourses));
  }, [allCourses]);

  useEffect(() => {
    localStorage.setItem('lms_platform_settings', JSON.stringify(platformSettings));
  }, [platformSettings]);

  useEffect(() => {
    localStorage.setItem('lms_legal_content', JSON.stringify(legalContent));
  }, [legalContent]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView, selectedCourse, isEnrolling, isAuthing, activeCategory]);

  const categories = Object.values(Category);

  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const catSlug = activeCategory.toLowerCase();
      const courseCatSlug = course.category.toLowerCase();
      const matchesCategory = activeCategory === Category.ALL || 
                            courseCatSlug.includes(catSlug) || 
                            catSlug.includes(courseCatSlug);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, allCourses]);

  const wishlistCourses = useMemo(() => {
    return allCourses.filter(course => wishlist.includes(course.id));
  }, [wishlist, allCourses]);

  const enrolledCourseIds = useMemo(() => enrolledCoursesData.map(c => c.id), [enrolledCoursesData]);

  const toggleWishlist = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation(); 
    
    // Check if user is logged in for cloud wishlist
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Offline mode: just update local state
      setWishlist(prev => 
        prev.includes(courseId) 
          ? prev.filter(id => id !== courseId) 
          : [...prev, courseId]
      );
      showToast("Log in to save your wishlist permanently.");
      return;
    }

    try {
      if (wishlist.includes(courseId)) {
        // Remove from DB
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .match({ user_id: session.user.id, course_id: courseId });
        
        if (error) throw error;
        setWishlist(prev => prev.filter(id => id !== courseId));
        showToast("Removed from wishlist");
      } else {
        // Add to DB
        const { error } = await supabase
          .from('wishlist')
          .insert([{ user_id: session.user.id, course_id: courseId }]);
        
        if (error) throw error;
        setWishlist(prev => [...prev, courseId]);
        showToast("Saved to your cloud wishlist!");
      }
    } catch (err) {
      console.error("Wishlist sync error:", err);
      showToast("Cloud sync failed. Try again.");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEnrollSingle = (course: Course) => {
    setEnrollmentItems([course]);
    if (isLoggedIn) {
      setIsEnrolling(true);
    } else {
      setAuthMode('signup');
      setIsAuthing(true);
    }
  };

  const handleEnrollCart = () => {
    if (cartItems.length === 0) return;
    setEnrollmentItems([...cartItems]);
    if (isLoggedIn) {
      setIsEnrolling(true);
    } else {
      setAuthMode('signup');
      setIsAuthing(true);
    }
  };

  const handleToggleBundleCourse = (course: Course) => {
    if (selectedBundleCourses.find(c => c.id === course.id)) {
      setSelectedBundleCourses(prev => prev.filter(c => c.id !== course.id));
    } else {
      if (selectedBundleCourses.length < 3) {
        setSelectedBundleCourses(prev => [...prev, course]);
      } else {
        showToast("Bundle limited to 3 courses.");
      }
    }
  };

  const handleStartBundleCheckout = () => {
    if (selectedBundleCourses.length === 3) {
      setEnrollmentItems([...selectedBundleCourses]);
      if (isLoggedIn) {
        setIsBundleBuilding(false);
        setSelectedBundleCourses([]);
        setIsEnrolling(true);
      } else {
        setAuthMode('login');
        setIsAuthing(true);
      }
    }
  };

  const handleAddToCart = (course: Course) => {
    if (!cartItems.find(item => item.id === course.id)) {
      setCartItems(prev => [...prev, { ...course, addedAt: Date.now() }]);
      showToast("Added to cart");
    } else {
      showToast("Already in cart");
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAuthSuccess = (name: string, email: string, adminStatus: boolean = false, isNewUser: boolean = false, avatarUrl?: string) => {
    setUserData({ name, email, avatarUrl: avatarUrl || null });
    setIsLoggedIn(true);
    setIsAdmin(adminStatus);
    setIsAuthing(false);
    
    const welcomeMsg = isNewUser ? `Welcome to our platform, ${name}!` : `Welcome back, ${name}!`;

    // Sync registration activity if new user
    if (isNewUser) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) syncProfile(session.user, false, true);
      });
    }

    if (adminStatus) {
      setCurrentView('admin');
      showToast(`Administrator authenticated. ${welcomeMsg}`);
    } else if (enrollmentItems.length > 0) {
      setIsBundleBuilding(false);
      setSelectedBundleCourses([]);
      setIsEnrolling(true);
    } else {
      setCurrentView('mylearning');
      showToast(welcomeMsg);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserData(null);
    setEnrolledCoursesData([]);
    setWishlist([]);
    setCartItems([]);
    setCurrentView('home');
    handleResetNavigation();
    showToast("Logged out successfully");
  };

  const handleHeaderAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthing(true);
    setSelectedCourse(null);
  };

  const handleEnrollSuccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const enrolledIds = enrollmentItems.map(i => i.id);

    if (session) {
      // Refresh enrollments from DB
      fetchEnrollments(session.user.id);

      // CLEANUP WISHLIST: Remove purchased courses from Supabase wishlist table
      try {
        const { error: wishlistError } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', session.user.id)
          .in('course_id', enrolledIds);

        if (wishlistError) throw wishlistError;
        
        // Sync local wishlist state
        setWishlist(prev => prev.filter(id => !enrolledIds.includes(id)));
      } catch (err) {
        console.error("Failed to cleanup wishlist after purchase:", err);
      }
    }

    setCartItems(prev => prev.filter(item => !enrolledIds.includes(item.id)));
    
    setIsEnrolling(false);
    setEnrollmentItems([]);
    setSelectedCourse(null);
    setCurrentView('mylearning');
    showToast("Enrollment successful!");
  };

  const handleResetNavigation = () => {
    setSelectedCourse(null);
    setIsEnrolling(false);
    setEnrollmentItems([]);
    setIsAuthing(false);
    setIsBundleBuilding(false);
    setSelectedBundleCourses([]);
  };

  const handleNavigate = (view: any) => {
    setCurrentView(view);
    handleResetNavigation();
    setIsMobileMenuOpen(false);
  };

  const handleNavigateToCatalog = (category: Category = Category.ALL) => {
    setActiveCategory(category);
    setCurrentView('catalog');
    handleResetNavigation();
  };

  const handleSelectCourse = (course: Course) => {
    if (isBundleBuilding) {
      handleToggleBundleCourse(course);
    } else {
      setSelectedCourse(course);
    }
  };

  const handleSaveCourse = async (course: Course) => {
    try {
      const courseToSave = { ...course };
      if (!courseToSave.id) {
        courseToSave.id = `course-${Math.random().toString(36).substr(2, 9)}`;
      }

      const { error } = await supabase
        .from('courses')
        .upsert({
          id: courseToSave.id,
          title: courseToSave.title,
          description: courseToSave.description,
          category: courseToSave.category,
          price: courseToSave.price,
          rating: courseToSave.rating,
          duration: courseToSave.duration,
          imageUrl: courseToSave.imageUrl,
          instructor: courseToSave.instructor,
          videoUrl: courseToSave.videoUrl
        }, { onConflict: 'id' });

      if (error) throw error;

      setAllCourses(prev => {
        const exists = prev.find(c => c.id === courseToSave.id);
        if (exists) {
          return prev.map(c => c.id === courseToSave.id ? courseToSave : c);
        }
        return [...prev, courseToSave];
      });
      
      setSelectedCourse(courseToSave);
      showToast("Course synced to cloud catalog.");
    } catch (err) {
      console.error("Failed to save course:", err);
      showToast("Cloud sync failed for course.");
    }
  };

  const handleProfileUpdate = async (newName: string, newEmail?: string, newAvatarUrl?: string) => {
    if (userData) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No active session");

        const updateData: any = { data: { full_name: newName, avatar_url: newAvatarUrl || userData.avatarUrl } };
        if (newEmail) updateData.email = newEmail;

        // Update Auth
        const { error: authError } = await supabase.auth.updateUser(updateData);
        if (authError) throw authError;

        // Update Profiles Table
        const profileUpdates: any = { full_name: newName, avatar_url: newAvatarUrl || userData.avatarUrl };
        if (newEmail) profileUpdates.email = newEmail;

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', session.user.id);
        
        if (profileError) console.warn("Profile table update failed:", profileError.message);

        // Update Activity Log for consistency (optional but recommended for "show everywhere")
        if (newEmail) {
          const { error: activityError } = await supabase
            .from('activity_log')
            .update({ email: newEmail, full_name: newName })
            .eq('user_id', session.user.id);
          if (activityError) console.warn("Activity log update failed:", activityError.message);
        }

        setUserData({ 
          name: newName, 
          email: newEmail || userData.email,
          avatarUrl: newAvatarUrl || userData.avatarUrl
        });
        
        if (newEmail) {
          showToast("Profile updated. Please check your new email for a confirmation link.");
        } else {
          showToast("Profile settings updated.");
        }
      } catch (err: any) {
        console.error("Error updating profile:", err);
        showToast(err.message || "Failed to update profile on server.");
      }
    }
  };

  const renderContent = () => {
    if (isAuthing) {
      return (
        <AuthPage 
          course={selectedCourse}
          onBack={() => setIsAuthing(false)}
          onSuccess={handleAuthSuccess}
          initialMode={authMode}
        />
      );
    }
    
    if (isEnrolling && enrollmentItems.length > 0) {
      return (
        <EnrollmentPage 
          courses={enrollmentItems}
          user={userData}
          onBack={() => setIsEnrolling(false)}
          onSuccess={handleEnrollSuccess}
        />
      );
    }

    if (selectedCourse) {
      const enrolledCourse = enrolledCoursesData.find(c => c.id === selectedCourse.id);
      return (
        <CourseDetail 
          course={selectedCourse} 
          onBack={() => setSelectedCourse(null)} 
          onEnroll={() => {
            if (enrolledCourse) {
              setPlayingCourse(enrolledCourse);
              setSelectedCourse(null);
            } else {
              handleEnrollSingle(selectedCourse);
            }
          }}
          isEnrolled={!!enrolledCourse}
          isAdmin={isAdmin}
          onSaveCourse={handleSaveCourse}
        />
      );
    }

    switch (currentView) {
      case 'ai-tutor':
        return <GeneralAITutor onBack={() => setCurrentView('home')} />;
      case 'knowledge-brief':
        return <KnowledgeBriefPage onBack={() => setCurrentView('home')} />;
      case 'admin':
        return (
          <AdminPage 
            courses={allCourses}
            setCourses={handleSaveCourse}
            platformSettings={platformSettings}
            setPlatformSettings={setPlatformSettings}
            legalContent={legalContent}
            setLegalContent={setLegalContent}
            onBack={() => setCurrentView('home')}
            onEditCourse={handleSelectCourse}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            user={userData}
            onBack={() => setCurrentView('home')}
            onSave={handleProfileUpdate}
          />
        );
      case 'career-paths':
        return (
          <CareerPathsPage 
            enrolledCourseIds={enrolledCourseIds}
            onSelectCourse={handleSelectCourse}
            onBack={() => setCurrentView('catalog')}
          />
        );
      case 'about':
        return <AboutPage onBack={() => setCurrentView('home')} />;
      case 'wishlist':
        return (
          <WishlistPage 
            wishlistCourses={wishlistCourses}
            onSelectCourse={handleSelectCourse}
            onToggleWishlist={toggleWishlist}
            onBrowse={() => setCurrentView('catalog')}
          />
        );
      case 'cart':
        return (
          <CartPage 
            cartItems={cartItems}
            wishlistCourses={wishlistCourses}
            purchaseHistory={enrolledCoursesData}
            onRemoveFromCart={handleRemoveFromCart}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={toggleWishlist}
            onCheckout={handleEnrollCart}
            onBrowse={() => setCurrentView('catalog')}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'mylearning':
        return (
          <MyLearningPage 
            enrolledCourses={enrolledCoursesData}
            onContinue={handleSelectCourse}
            onBrowse={() => setCurrentView('catalog')}
            onViewCareerPaths={() => setCurrentView('career-paths')}
            onUpdateProgress={async (id, prog) => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                await supabase.from('enrollments')
                  .update({ progress: prog })
                  .match({ user_id: session.user.id, course_id: id });
              }
              setEnrolledCoursesData(prev => prev.map(c => c.id === id ? {...c, progress: prog} : c));
            }}
            userName={userData?.name}
            userEmail={userData?.email}
            playingCourse={playingCourse}
            setPlayingCourse={setPlayingCourse}
          />
        );
      case 'home':
        return (
          <HomePage 
            courses={allCourses}
            onBrowse={() => setCurrentView('catalog')} 
            onLearnMore={() => setCurrentView('about')}
            onSelectCourse={handleSelectCourse}
            isLoggedIn={isLoggedIn}
            enrolledCourses={enrolledCoursesData}
            onAuthTrigger={() => {
              setAuthMode('login');
              setIsAuthing(true);
            }}
            onReviewSuccess={syncCourseRatings}
          />
        );
      case 'catalog':
      default:
        return (
          <div className="relative space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 md:gap-4">
              <div className="space-y-1 md:space-y-2 text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">Explore Catalog</h1>
                <p className="text-secondary-text text-sm md:text-lg max-w-lg">Master industry-leading skills with over 500+ curated professional courses.</p>
              </div>
            </div>

            <div className="sticky top-[65px] z-40 bg-background-main/80 backdrop-blur-md py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 border-b border-neon-border">
              <div 
                onClick={() => {
                  setIsBundleBuilding(true);
                  setSelectedBundleCourses([]);
                  showToast("Bundle Selection Mode: Pick 3 Courses.");
                }}
                className={`cursor-pointer group p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col sm:flex-row items-center gap-4 md:gap-6 transition-all duration-500 border-2 ${
                  isBundleBuilding 
                    ? 'bg-background-main border-primary scale-[1.01] shadow-[0_0_30px_rgba(230,255,0,0.2)]' 
                    : 'bg-primary/5 border-neon-border hover:border-primary shadow-xl shadow-primary/5'
                }`}
              >
                 <div className={`size-10 md:size-14 rounded-xl md:rounded-2xl flex items-center justify-center text-black shadow-2xl shrink-0 transition-transform group-hover:scale-110 ${isBundleBuilding ? 'bg-primary shadow-[0_0_15px_rgba(230,255,0,0.4)]' : 'bg-primary animate-bounce shadow-[0_0_15px_rgba(230,255,0,0.4)]'}`}>
                    <span className="material-symbols-outlined text-xl md:text-3xl font-black">
                      {isBundleBuilding ? 'shopping_basket' : 'celebration'}
                    </span>
                 </div>
                 <div className="text-center sm:text-left flex-1 space-y-0.5">
                   <h3 className={`text-base md:text-xl font-black tracking-tight text-white`}>
                      {isBundleBuilding ? 'Selection Active' : 'Special Bundle: Buy 3, Get 50% Off!'}
                   </h3>
                   <p className={`text-[10px] md:text-xs font-medium text-secondary-text line-clamp-1`}>
                      {isBundleBuilding 
                       ? `Selecting courses. Progress: ${selectedBundleCourses.length}/3`
                       : 'Unlock massive savings. Pick any 3 tracks and instantly halve your investment.'}
                   </p>
                 </div>
                 {!isBundleBuilding && (
                    <button className="w-full sm:w-auto px-4 py-2 bg-primary text-black font-black rounded-lg hover:shadow-[0_0_15px_rgba(230,255,0,0.4)] transition-all uppercase tracking-widest text-[9px]">
                      START BUNDLE
                    </button>
                 )}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
              {/* Desktop Topic Sidebar (Slide Bar) */}
              <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-8 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary-text">Course Topics</h3>
                  <div className="flex flex-col gap-2">
                    {categories.map((cat) => {
                      const icons: Record<string, string> = {
                        'All Topics': 'explore',
                        'Technology': 'code',
                        'Business': 'business_center',
                        'UI/UX Design': 'design_services',
                        'Marketing': 'campaign',
                        'Wellness': 'self_improvement',
                        'Data Science': 'analytics'
                      };
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all group text-left ${
                            isActive 
                              ? 'bg-primary text-black shadow-[0_0_20px_rgba(230,255,0,0.3)] font-black' 
                              : 'bg-background-secondary hover:bg-card text-secondary-text'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-xl ${isActive ? 'fill-1' : 'group-hover:scale-110 transition-transform'}`}>
                            {icons[cat] || 'label'}
                          </span>
                          <span className="text-sm uppercase tracking-wider">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto p-6 rounded-[32px] bg-card text-white relative overflow-hidden group border border-neon-border">
                  <div className="absolute -right-4 -bottom-4 size-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <h4 className="text-lg font-black leading-tight relative z-10">Need help choosing?</h4>
                  <p className="text-[10px] text-secondary-text mt-2 font-bold uppercase tracking-widest relative z-10">Ask our AI Tutor</p>
                  <button 
                    onClick={() => setCurrentView('home')}
                    className="mt-4 w-full py-3 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all relative z-10 shadow-[0_0_15px_rgba(230,255,0,0.3)]"
                  >
                    Start Chat
                  </button>
                </div>
              </aside>

              <div className="flex-1 space-y-10">
                {/* Mobile/Tablet Horizontal Slide Bar */}
                <div className="lg:hidden relative -mx-4 px-4 sm:-mx-6 sm:px-6 mb-8 group/slider">
                  <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar flex-nowrap w-full scroll-smooth snap-x">
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-2xl px-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap snap-start border-2 ${
                            isActive 
                              ? 'bg-primary border-primary text-black shadow-[0_0_15px_rgba(230,255,0,0.3)] scale-105 z-10' 
                              : 'bg-background-secondary border-neon-border text-secondary-text hover:border-primary/30'
                          }`}
                        >
                          {isActive && <span className="size-1.5 rounded-full bg-black animate-pulse"></span>}
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  {/* Gradient Masks for scroll indication */}
                  <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-background-main to-transparent pointer-events-none opacity-60 group-hover/slider:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-background-main to-transparent pointer-events-none opacity-60 group-hover/slider:opacity-100 transition-opacity"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => {
                      const isSelectedForBundle = !!selectedBundleCourses.find(c => c.id === course.id);
                      return (
                        <div key={course.id} className="relative">
                          <CourseCard 
                            course={course} 
                            onClick={handleSelectCourse}
                            isWishlisted={wishlist.includes(course.id)}
                            onToggleWishlist={toggleWishlist}
                          />
                          {isBundleBuilding && (
                            <div 
                              onClick={(e) => { e.stopPropagation(); handleToggleBundleCourse(course); }}
                              className={`absolute inset-0 z-30 rounded-xl cursor-pointer transition-all border-4 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px] ${
                                isSelectedForBundle 
                                  ? 'bg-primary/20 border-primary ring-8 ring-primary/10' 
                                  : 'bg-black/10 border-transparent hover:bg-black/40'
                              }`}
                            >
                              <div className={`size-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${isSelectedForBundle ? 'bg-primary text-black scale-110' : 'bg-white/90 text-slate-400'}`}>
                                <span className="material-symbols-outlined text-4xl font-black">
                                  {isSelectedForBundle ? 'check' : 'add'}
                                </span>
                              </div>
                              <p className={`text-xs font-black uppercase tracking-widest ${isSelectedForBundle ? 'text-primary bg-background-dark px-3 py-1 rounded-full' : 'text-white'}`}>
                                {isSelectedForBundle ? 'SELECTED' : 'SELECT FOR 50% OFF'}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <span className="material-symbols-outlined text-6xl text-secondary-text mb-4">search_off</span>
                      <p className="text-secondary-text text-lg font-bold">No tracks matched your criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isBundleBuilding && (
              <div className="fixed bottom-20 sm:bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-3 sm:px-6 animate-in slide-in-from-bottom-10 duration-500">
                <div className="bg-background-dark text-white rounded-[24px] sm:rounded-[40px] p-3 sm:p-6 shadow-2xl border-2 border-primary flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
                  <div className="flex-1 flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
                    <div className="text-left shrink-0">
                       <p className="text-[8px] sm:text-[10px] font-black uppercase text-primary tracking-widest">Progress</p>
                       <p className="text-sm sm:text-lg font-black whitespace-nowrap">{selectedBundleCourses.length} / 3</p>
                    </div>
                    <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
                       {[1, 2, 3].map(i => (
                         <div key={i} className={`size-8 sm:size-10 rounded-lg sm:rounded-xl flex items-center justify-center border-2 transition-all shrink-0 ${selectedBundleCourses[i-1] ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20' : 'border-neon-border text-secondary-text'}`}>
                            {selectedBundleCourses[i-1] ? (
                              <img src={selectedBundleCourses[i-1].imageUrl} className="size-full object-cover rounded-lg" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="material-symbols-outlined text-xs sm:text-sm">auto_awesome</span>
                            )}
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => { setIsBundleBuilding(false); setSelectedBundleCourses([]); }}
                      className="flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-4 text-[9px] sm:text-xs font-black uppercase text-secondary-text hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={selectedBundleCourses.length < 3}
                      onClick={handleStartBundleCheckout}
                      className="flex-1 sm:flex-none px-5 sm:px-10 py-2.5 sm:py-4 bg-primary text-black font-black rounded-lg sm:rounded-2xl shadow-xl hover:scale-105 transition-all disabled:opacity-20 disabled:grayscale uppercase tracking-widest text-[9px] sm:text-xs"
                    >
                      CHECKOUT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  if (platformSettings.maintenanceMode && !isAdmin) {
    if (isAuthing) {
      return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
          <AuthPage onBack={() => setIsAuthing(false)} onSuccess={handleAuthSuccess} initialMode="login" isMaintenanceMode={true} />
        </div>
      );
    }
    return <MaintenancePage endTime={platformSettings.maintenanceEndTime} onAdminAuth={() => { setAuthMode('login'); setIsAuthing(true); }} />;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden selection:bg-primary selection:text-black">
      <LegalModal type={legalType} content={legalContent} onClose={() => setLegalType(null)} />
      
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-background-dark text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-6 duration-300 border border-primary/20">
          <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
          <p className="text-sm font-black uppercase tracking-widest">{toastMessage}</p>
        </div>
      )}

      <Header 
        onSearch={(query) => { setSearchQuery(query); setCurrentView('catalog'); handleResetNavigation(); setIsMobileMenuOpen(false); }} 
        onNavigate={handleNavigate} onAuth={handleHeaderAuth} onLogout={handleLogout}
        currentView={currentView} cartCount={cartItems.length} wishlistCount={wishlist.length}
        enrolledCount={enrolledCoursesData.length} isLoggedIn={isLoggedIn} isAdmin={isAdmin} user={userData}
        isMobileMenuOpen={isMobileMenuOpen} onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}
      />

      <div className="flex-1 flex min-h-[calc(100vh-65px)]">
        {!isAuthing && (
          <Sidebar 
            onNavigate={handleNavigate} 
            currentView={currentView} 
            onLogout={handleLogout} 
            isLoggedIn={isLoggedIn} 
            isAdmin={isAdmin} 
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
        <main className="flex-1 min-w-0 px-4 sm:px-6 md:px-8 lg:px-12 pb-32 lg:pb-16">
          <div className="max-w-7xl mx-auto flex flex-col gap-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView + (selectedCourse?.id || '') + isAuthing + isEnrolling}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {!isAuthing && (
        <BottomNav 
          onNavigate={handleNavigate} 
          currentView={currentView} 
          isLoggedIn={isLoggedIn} 
          isAdmin={isAdmin}
        />
      )}

      <footer className="border-t border-neon-border bg-background-secondary px-6 py-20 lg:px-14 flex-shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 text-left">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-white">
              <div className="size-12 flex items-center justify-center bg-primary rounded-2xl text-black shadow-[0_0_15px_rgba(230,255,0,0.4)]">
                <span className="material-symbols-outlined text-3xl font-black">school</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter cursor-pointer" onClick={() => handleNavigate('home')}>Learning</h2>
            </div>
            <p className="text-sm text-secondary-text leading-relaxed font-medium">
              Empowering professional growth via cloud-native, AI-integrated certification programs since 2018.
            </p>
          </div>
          <div className="space-y-8">
            <h4 className="font-black uppercase text-[10px] tracking-widest text-primary">Topics</h4>
            <nav className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-secondary-text items-start">
              <button onClick={() => handleNavigateToCatalog(Category.TECHNOLOGY)} className="hover:text-primary transition-colors">Development</button>
              <button onClick={() => handleNavigateToCatalog(Category.DATA_SCIENCE)} className="hover:text-primary transition-colors">Analytics</button>
              <button onClick={() => handleNavigateToCatalog(Category.DESIGN)} className="hover:text-primary transition-colors">Product Design</button>
            </nav>
          </div>
          <div className="space-y-8">
            <h4 className="font-black uppercase text-[10px] tracking-widest text-primary">Support</h4>
            <nav className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-secondary-text items-start">
              <button onClick={() => handleNavigate('home')} className="hover:text-primary transition-colors">Overview</button>
              <button onClick={() => setLegalType('terms')} className="hover:text-primary transition-colors">Terms of Use</button>
              <button onClick={() => setLegalType('privacy')} className="hover:text-primary transition-colors">Privacy Policy</button>
            </nav>
          </div>
          <div className="space-y-8">
            <h4 className="font-black uppercase text-[10px] tracking-widest text-primary">Intelligence</h4>
            <nav className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-secondary-text items-start">
              <button onClick={() => handleNavigate('ai-tutor')} className="hover:text-primary transition-colors">Global Assistant</button>
              <button onClick={() => handleNavigate('career-paths')} className="hover:text-primary transition-colors">Path Forecasting</button>
              <button onClick={() => handleNavigate('knowledge-brief')} className="hover:text-primary transition-colors">Industry Briefs</button>
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-neon-border text-center flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text">© 2025 Learning Platform Inc. Cloud Architecture.</p>
          <div className="flex gap-8">
            <button onClick={() => setLegalType('terms')} className="text-[10px] font-black uppercase tracking-widest text-secondary-text hover:text-primary transition-colors">Terms</button>
            <button onClick={() => setLegalType('privacy')} className="text-[10px] font-black uppercase tracking-widest text-secondary-text hover:text-primary transition-colors">Privacy</button>
          </div>
        </div>
      </footer>

      {playingCourse && (
        <CoursePlayer 
          course={playingCourse} 
          currentProgress={playingCourse.progress}
          onClose={() => setPlayingCourse(null)} 
          onUpdateProgress={async (newProgress) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              await supabase.from('enrollments')
                .update({ progress: newProgress })
                .match({ user_id: session.user.id, course_id: playingCourse.id });
            }
            setEnrolledCoursesData(prev => prev.map(c => c.id === playingCourse.id ? {...c, progress: newProgress} : c));
            setPlayingCourse({...playingCourse, progress: newProgress});
          }}
        />
      )}
    </div>
  );
};

export default App;
