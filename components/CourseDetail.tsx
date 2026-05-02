
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, Category } from '../types';
import { getCourseInsights, chatWithTutor, importLessonFromUrl } from '../services/gemini';
import { supabase } from '../lib/supabase';
import AddReviewModal from './AddReviewModal';
import { Lesson } from '../types';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onEnroll: () => void;
  isEnrolled?: boolean;
  onSaveCourse?: (course: Course) => void;
  isAdmin?: boolean;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack, onEnroll, isEnrolled, onSaveCourse, isAdmin }) => {
  const [insights, setInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reviews State
  const [courseReviews, setCourseReviews] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(course.id === '');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editedCourse, setEditedCourse] = useState<Course>(course);
  const [isUploading, setIsUploading] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lessonImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (course.id) {
      fetchReviews();
      async function fetchInsights() {
        setIsLoadingInsights(true);
        try {
          const data = await getCourseInsights(course);
          setInsights(data || 'Unable to load insights at this time.');
        } catch (error) {
          console.error(error);
          setInsights('Error loading AI insights.');
        } finally {
          setIsLoadingInsights(false);
        }
      }
      fetchInsights();
    } else {
      setInsights('AI insights will be generated once the course is saved.');
      setIsLoadingInsights(false);
      setIsLoadingReviews(false);
    }
  }, [course]);

  const fetchReviews = async () => {
    if (!course.id) return;
    setIsLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('course_id', course.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCourseReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const updateCourseRating = async (reviews: any[]) => {
    if (!course.id || reviews.length === 0) return;
    
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / reviews.length).toFixed(1));
    const reviewCount = reviews.length;
    
    // Format review count like "2.1k" if needed, but for now just string
    const reviewsStr = reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : `${reviewCount}`;

    try {
      const { error } = await supabase
        .from('courses')
        .update({ 
          rating: avgRating,
          reviews: reviewsStr
        })
        .eq('id', course.id);
      
      if (error) throw error;
      
      // Update local state if needed, or notify parent
      if (onSaveCourse) {
        onSaveCourse({ ...course, rating: avgRating, reviews: reviewsStr });
      }
    } catch (error) {
      console.error('Error updating course rating:', error);
    }
  };

  const handleReviewSuccess = async () => {
    await fetchReviews();
    // Recalculate rating after fetching new reviews
    const { data } = await supabase
      .from('reviews')
      .select('rating')
      .eq('course_id', course.id);
    
    if (data) {
      updateCourseRating(data);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatting) return;

    const userMsg = chatMessage;
    setChatLog(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setIsChatting(true);

    try {
      const response = await chatWithTutor(course, userMsg, []);
      const aiResponse = response || 'No response.';
      setChatLog(prev => [...prev, { role: 'ai', text: aiResponse }]);

      // Save to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('chat_history').insert([{
          user_id: session.user.id,
          user_email: session.user.email,
          message: userMsg,
          response: aiResponse,
          context: `COURSE_${course.id}`
        }]);
      }
    } catch (error) {
      setChatLog(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleSave = () => {
    onSaveCourse?.(editedCourse);
    setIsEditing(false);
  };

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) return;
    setIsImporting(true);
    try {
      const lessonData = await importLessonFromUrl(importUrl);
      if (lessonData) {
        const newLesson: Lesson = {
          id: `lesson-${Date.now()}`,
          title: lessonData.title || "New Lesson",
          duration: lessonData.duration || "10:00",
          videoUrl: lessonData.videoUrl || importUrl
        };
        setEditedCourse(prev => ({
          ...prev,
          lessons: [...(prev.lessons || []), newLesson]
        }));
        setImportUrl('');
      } else {
        showNotification("Failed to extract lesson info. Please check the URL.", "error");
      }
    } catch (error) {
      console.error("Import error:", error);
      showNotification("Error importing lesson.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleLessonFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedLessons = JSON.parse(content);
        if (Array.isArray(importedLessons)) {
          const validLessons = importedLessons.map((l: any) => ({
            id: l.id || `lesson-${Math.random().toString(36).substr(2, 9)}`,
            title: l.title || "Untitled Lesson",
            duration: l.duration || "0:00",
            videoUrl: l.videoUrl || ""
          }));
          setEditedCourse(prev => ({
            ...prev,
            lessons: [...(prev.lessons || []), ...validLessons]
          }));
        } else {
          showNotification("Invalid file format. Expected a JSON array of lessons.", "error");
        }
      } catch (err) {
        showNotification("Error parsing JSON file.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `course-thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      setEditedCourse(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('Failed to upload image. Please ensure the "course-images" bucket exists and is public.', "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 md:gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      <AnimatePresence>
        {isPreviewOpen && course.videoUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(230,255,0,0.2)] border border-white/10"
            >
              <video 
                src={course.videoUrl || undefined} 
                className="w-full h-full" 
                controls 
                autoPlay 
                muted
                playsInline
                referrerPolicy="no-referrer"
                onError={(e) => console.error("Video playback error:", e)}
              />
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="absolute top-6 right-6 size-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-black transition-all z-50"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                  <p className="text-xs font-black text-primary uppercase tracking-widest">Preview Mode</p>
                  <h4 className="text-white font-bold truncate max-w-md">{course.title}</h4>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 space-y-10 md:space-y-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 text-secondary-text hover:text-primary transition-all group"
          >
            <span className="material-symbols-outlined text-xl transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span className="text-xs md:text-sm font-black uppercase tracking-widest">Back to Catalog</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-xl ${isEditing ? 'bg-red-500 text-white' : 'bg-primary text-black'}`}
            >
              {isEditing ? 'Cancel Editing' : 'Edit Course'}
            </button>
          )}
        </div>

        <div className="relative h-64 sm:h-80 md:h-[500px] rounded-[48px] md:rounded-[64px] overflow-hidden shadow-2xl border border-neon-border group">
          <img src={(isEditing ? editedCourse.imageUrl : course.imageUrl) || undefined} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={course.title} />
          {!isEditing && course.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="size-24 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-all duration-500 pointer-events-auto"
              >
                <span className="material-symbols-outlined text-5xl font-black">play_arrow</span>
              </button>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Preview Course Video</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-8 md:p-16 pointer-events-none">
            <div className="space-y-4 md:space-y-6 w-full">
              {isEditing ? (
                <div className="space-y-4 bg-black/60 p-6 md:p-10 rounded-[32px] md:rounded-[48px] backdrop-blur-md border border-neon-border">
                  <input 
                    type="text"
                    value={editedCourse.title || ''}
                    onChange={(e) => setEditedCourse({...editedCourse, title: e.target.value})}
                    className="w-full bg-white/5 border border-neon-border rounded-2xl px-6 py-4 text-white font-black text-2xl md:text-5xl focus:ring-2 focus:ring-primary outline-none font-display tracking-tighter"
                    placeholder="Course Title"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={editedCourse.imageUrl || ''}
                      onChange={(e) => setEditedCourse({...editedCourse, imageUrl: e.target.value})}
                      className="flex-1 bg-white/5 border border-neon-border rounded-2xl px-6 py-3 text-white text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                      placeholder="Image URL"
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-6 py-3 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">{isUploading ? 'sync' : 'upload_file'}</span>
                      {isUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest ml-2">Category</p>
                      <select 
                        value={editedCourse.category}
                        onChange={(e) => setEditedCourse({...editedCourse, category: e.target.value as Category})}
                        className="w-full bg-white/5 border border-neon-border rounded-2xl px-6 py-3 text-white text-xs focus:ring-2 focus:ring-primary outline-none font-medium appearance-none"
                      >
                        {Object.values(Category).map(cat => (
                          <option key={cat} value={cat} className="bg-zinc-900 text-white">{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest ml-2">Instructor</p>
                      <input 
                        type="text"
                        value={editedCourse.instructor || ''}
                        onChange={(e) => setEditedCourse({...editedCourse, instructor: e.target.value})}
                        className="w-full bg-white/5 border border-neon-border rounded-2xl px-6 py-3 text-white text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                        placeholder="Instructor Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest ml-2">Video URL</p>
                      <input 
                        type="text"
                        value={editedCourse.videoUrl || ''}
                        onChange={(e) => setEditedCourse({...editedCourse, videoUrl: e.target.value})}
                        className="w-full bg-white/5 border border-neon-border rounded-2xl px-6 py-3 text-white text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                        placeholder="Video URL (YouTube/Vimeo)"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl space-y-4">
                  <span className="inline-block px-4 py-1.5 bg-primary text-black text-[10px] md:text-xs font-black rounded-full uppercase tracking-[0.3em]">
                    {course.category}
                  </span>
                  <h1 className="text-4xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter font-display">{course.title}</h1>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { label: 'Duration', value: course.duration, icon: 'schedule', editKey: 'duration' },
            { label: 'Rating', value: `${course.rating} / 5.0`, icon: 'star', editKey: null },
            { label: 'Price', value: `$${course.price}`, icon: 'payments', editKey: 'price', type: 'number' }
          ].map((stat, i) => (
            <div key={i} className={`bg-card p-8 md:p-10 rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center text-center shadow-sm border border-neon-border ${i === 2 && 'col-span-2 md:col-span-1'}`}>
              <span className="material-symbols-outlined text-primary text-3xl md:text-4xl mb-4 font-black">{stat.icon}</span>
              <span className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mb-2">{stat.label}</span>
              {isEditing && stat.editKey ? (
                <input 
                  type={stat.type || 'text'}
                  value={(editedCourse as any)[stat.editKey] || (stat.type === 'number' ? 0 : '')}
                  onChange={(e) => setEditedCourse({...editedCourse, [stat.editKey as string]: stat.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})}
                  className="w-full bg-background-main border border-neon-border rounded-xl px-4 py-2 text-center font-black text-sm md:text-base focus:ring-2 focus:ring-primary outline-none text-white"
                />
              ) : (
                <span className="font-black text-xl md:text-3xl tracking-tighter font-display text-white">{stat.value}</span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-card p-10 md:p-16 rounded-[48px] md:rounded-[64px] shadow-sm space-y-10 border border-neon-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl font-black">auto_awesome</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter font-display text-white">
                {isEditing ? 'Course Description' : 'AI Knowledge Brief'}
              </h2>
            </div>
            {isEditing && (
              <button 
                onClick={handleSave}
                className="w-full sm:w-auto px-10 py-4 bg-green-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-green-500/20"
              >
                Save Changes
              </button>
            )}
          </div>
          
          {isEditing ? (
            <textarea 
              value={editedCourse.description || ''}
              onChange={(e) => setEditedCourse({...editedCourse, description: e.target.value})}
              className="w-full bg-background-main border border-neon-border rounded-[32px] p-8 text-base font-medium min-h-[300px] focus:ring-2 focus:ring-primary outline-none leading-relaxed text-white"
              placeholder="Enter course description..."
            />
          ) : (
            <div className="relative">
              {isLoadingInsights ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-6 bg-background-main rounded-full w-3/4"></div>
                  <div className="h-6 bg-background-main rounded-full w-1/2"></div>
                  <div className="h-6 bg-background-main rounded-full w-5/6"></div>
                  <div className="h-48 bg-background-main rounded-[32px] w-full"></div>
                </div>
              ) : (
                <div className="prose prose-xl prose-zinc dark:prose-invert max-w-none text-secondary-text whitespace-pre-wrap leading-relaxed font-medium">
                  {insights}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Curriculum Management Section (Admin Only) */}
        {isEditing && (
          <div className="bg-card p-10 md:p-16 rounded-[48px] md:rounded-[64px] shadow-sm space-y-10 border border-neon-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-3xl font-black">list_alt</span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter font-display text-white">Curriculum Management</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => lessonImportRef.current?.click()}
                  className="px-6 py-3 bg-white/5 border border-neon-border text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">upload</span>
                  Import JSON
                </button>
                <input 
                  type="file"
                  ref={lessonImportRef}
                  onChange={handleLessonFileImport}
                  accept=".json"
                  className="hidden"
                />
                <button 
                  onClick={() => {
                    const input = prompt("Enter lesson titles (one per line):");
                    if (!input) return;
                    
                    const titles = input.split('\n').filter(t => t.trim());
                    const newLessons = titles.map(title => ({
                      id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      title: title.trim(),
                      duration: "10:00",
                      videoUrl: editedCourse.videoUrl || ""
                    }));
                    
                    setEditedCourse({
                      ...editedCourse,
                      lessons: [...(editedCourse.lessons || []), ...newLessons]
                    });
                  }}
                  className="px-6 py-3 bg-white/5 border border-neon-border text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">playlist_add</span>
                  Bulk Add
                </button>
                <button 
                  onClick={() => {
                    const newLesson = {
                      id: `lesson-${Date.now()}`,
                      title: "New Lesson",
                      duration: "10:00",
                      videoUrl: editedCourse.videoUrl
                    };
                    setEditedCourse({
                      ...editedCourse,
                      lessons: [...(editedCourse.lessons || []), newLesson]
                    });
                  }}
                  className="px-8 py-4 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl"
                >
                  Add Lesson
                </button>
              </div>
            </div>

            <div className="p-6 bg-background-main rounded-3xl border border-neon-border space-y-4">
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest ml-2">Quick Import from URL (AI Powered)</p>
              <div className="flex gap-3">
                <input 
                  type="text"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="Paste YouTube/Vimeo/Article URL..."
                  className="flex-1 bg-white/5 border border-neon-border rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button 
                  onClick={handleImportFromUrl}
                  disabled={isImporting || !importUrl.trim()}
                  className="px-6 py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <span className={`material-symbols-outlined text-sm ${isImporting ? 'animate-spin' : ''}`}>
                    {isImporting ? 'sync' : 'auto_fix'}
                  </span>
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {(editedCourse.lessons || []).map((lesson, idx) => (
                <div key={lesson.id} className="p-6 bg-background-main rounded-3xl border border-neon-border space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                        {idx + 1}
                      </div>
                      <input 
                        type="text"
                        value={lesson.title || ''}
                        onChange={(e) => {
                          const newLessons = [...(editedCourse.lessons || [])];
                          newLessons[idx] = { ...lesson, title: e.target.value };
                          setEditedCourse({ ...editedCourse, lessons: newLessons });
                        }}
                        className="flex-1 bg-white/5 border border-neon-border rounded-xl px-4 py-2 text-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Lesson Title"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const newLessons = (editedCourse.lessons || []).filter((_, i) => i !== idx);
                        setEditedCourse({ ...editedCourse, lessons: newLessons });
                      }}
                      className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-14">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest ml-2">Duration</p>
                      <input 
                        type="text"
                        value={lesson.duration || ''}
                        onChange={(e) => {
                          const newLessons = [...(editedCourse.lessons || [])];
                          newLessons[idx] = { ...lesson, duration: e.target.value };
                          setEditedCourse({ ...editedCourse, lessons: newLessons });
                        }}
                        className="w-full bg-white/5 border border-neon-border rounded-xl px-4 py-2 text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                        placeholder="e.g. 10:00"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest ml-2">Lesson Video URL</p>
                      <input 
                        type="text"
                        value={lesson.videoUrl || ''}
                        onChange={(e) => {
                          const newLessons = [...(editedCourse.lessons || [])];
                          newLessons[idx] = { ...lesson, videoUrl: e.target.value };
                          setEditedCourse({ ...editedCourse, lessons: newLessons });
                        }}
                        className="w-full bg-white/5 border border-neon-border rounded-xl px-4 py-2 text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Video URL (YouTube/Vimeo/Direct)"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(editedCourse.lessons || []).length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-neon-border rounded-[32px] space-y-4">
                  <span className="material-symbols-outlined text-4xl text-zinc-800">playlist_add</span>
                  <p className="text-xs text-secondary-text font-bold">No lessons added yet. Click "Add Lesson" to start building the curriculum.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-full lg:w-[450px] flex flex-col gap-10">
        <div className="bg-background-main text-white rounded-[48px] md:rounded-[64px] p-8 md:p-12 shadow-2xl border border-neon-border h-[600px] md:h-[700px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[180px] font-black text-primary">psychology</span>
          </div>
          
          <div className="flex items-center gap-5 mb-10 relative z-10">
            <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-black shadow-xl">
              <span className="material-symbols-outlined text-3xl font-black">psychology</span>
            </div>
            <div>
              <h3 className="font-black text-xl md:text-2xl tracking-tighter font-display leading-none mb-1">AI Tutor</h3>
              <span className="text-[10px] text-primary uppercase font-black tracking-[0.3em]">Deep Knowledge Mode</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2 no-scrollbar mb-8 relative z-10">
            <div className="bg-card backdrop-blur-md p-6 rounded-[32px] rounded-tl-none text-sm md:text-base leading-relaxed border border-neon-border text-secondary-text">
              Hi! I'm your AI Tutor. Ask me anything about this course's specific concepts, career paths, or real-world applications.
            </div>
            {chatLog.map((msg, i) => (
              <div 
                key={i} 
                className={`p-6 rounded-[32px] text-sm md:text-base leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-black ml-10 rounded-tr-none font-black' 
                    : 'bg-card backdrop-blur-md mr-10 rounded-tl-none border border-neon-border text-secondary-text'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isChatting && (
              <div className="flex items-center gap-3 p-6 text-secondary-text text-xs font-black uppercase tracking-widest">
                <div className="size-2 bg-primary rounded-full animate-bounce"></div>
                <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <span>Tutor is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="relative mt-auto z-10">
            <input 
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a deep question..."
              className="w-full bg-card border border-neon-border rounded-[24px] pl-8 pr-16 py-5 text-sm md:text-base focus:ring-2 focus:ring-primary outline-none placeholder:text-zinc-600 font-medium text-white"
            />
            <button 
              type="submit"
              disabled={isChatting}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-12 bg-primary text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 shadow-xl"
            >
              <span className="material-symbols-outlined text-2xl font-black">send</span>
            </button>
          </form>
        </div>

        <div className="bg-card rounded-[48px] p-8 md:p-12 shadow-sm border border-neon-border space-y-10">
          <div className="space-y-4">
            <h4 className="font-black text-xl md:text-2xl tracking-tighter font-display text-white">Course Highlights</h4>
            <div className="h-1 w-12 bg-primary rounded-full"></div>
          </div>
          <ul className="space-y-6">
            {[
              { icon: 'verified', text: 'Expert-led instruction' },
              { icon: 'work', text: 'Portfolio-ready projects' },
              { icon: 'history_edu', text: 'Professional Certification' }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-5 text-sm md:text-base font-bold text-secondary-text">
                <span className="material-symbols-outlined text-primary text-2xl font-black">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={onEnroll}
            className="w-full py-6 bg-primary text-black font-black rounded-[24px] shadow-2xl shadow-primary/20 hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
          >
            {isEnrolled ? "CONTINUE LEARNING" : "ENROLL NOW"}
          </button>
        </div>

        {/* Course Reviews Section */}
        <div className="bg-card rounded-[48px] p-8 md:p-12 shadow-sm border border-neon-border space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-black text-xl md:text-2xl tracking-tighter font-display text-white">Student Reviews</h4>
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-sm fill-1">star</span>
                <span className="text-xs font-bold">{course.rating} ({course.reviews})</span>
              </div>
            </div>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="px-6 py-3 bg-background-main border border-neon-border text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-black transition-all"
            >
              Write Review
            </button>
          </div>

          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
            {isLoadingReviews ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-background-main rounded-3xl w-full"></div>
                ))}
              </div>
            ) : courseReviews.length > 0 ? (
              courseReviews.map((rev) => (
                <div key={rev.id} className="p-6 bg-background-main rounded-3xl border border-neon-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img src={rev.user_img || undefined} className="size-8 rounded-full" alt="" />
                      <div>
                        <h5 className="text-xs font-black text-white">{rev.user_name}</h5>
                        <p className="text-[8px] text-secondary-text uppercase font-bold">{new Date(rev.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-primary">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`material-symbols-outlined text-[10px] ${i < rev.rating ? 'fill-1' : ''}`}>star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-secondary-text leading-relaxed italic">"{rev.comment}"</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 space-y-4">
                <span className="material-symbols-outlined text-4xl text-zinc-800">rate_review</span>
                <p className="text-xs text-secondary-text font-bold">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <AddReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onSuccess={handleReviewSuccess}
        courseId={course.id}
      />

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white border-green-400' 
                : 'bg-red-500 text-white border-red-400'
            }`}
          >
            <span className="material-symbols-outlined">
              {notification.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="text-sm font-black uppercase tracking-widest">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetail;
