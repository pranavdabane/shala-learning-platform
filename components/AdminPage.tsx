
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, Category, Lesson } from '../types';
import { supabase } from '../lib/supabase';
import { importLessonFromUrl } from '../services/gemini';

interface PlatformSettings {
  maintenanceMode: boolean;
  maintenanceEndTime?: number;
  platformFee: number;
  enableAiTutor: boolean;
  defaultCurrency: string;
  minWithdrawal: number;
  allowGuestReviews: boolean;
}

interface AdminPageProps {
  onBack: () => void;
  onEditCourse: (course: Course) => void;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  platformSettings: PlatformSettings;
  setPlatformSettings: (settings: PlatformSettings) => void;
  legalContent: any;
  setLegalContent: (content: any) => void;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  login_count?: number;
  last_login_at?: string;
}

interface UserReview {
  id: string;
  user_name: string;
  comment: string;
  rating: number;
  created_at: string;
  user_id?: string;
  course_id?: string;
}

interface PlatformEnrollment {
  id: string;
  created_at: string;
  payment_method: string;
  order_id: string;
  progress: number;
  course_id: string;
  user_id: string;
}

interface WishlistEntry {
  user_id: string;
  course_id: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  activity_type: 'LOGIN' | 'REGISTER';
  created_at: string;
}

interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  user_id?: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  user_email: string;
  message: string;
  response: string;
  created_at: string;
}

const handleFileUpload = async (file: File, bucket: string, path: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      if (error.message.includes('Bucket not found')) {
        console.error(`Bucket "${bucket}" not found. Please create it in Supabase Storage.`);
        return null;
      }
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};

const UserDetailView = ({ 
  user, 
  enrollments, 
  wishlistEntries, 
  reviews, 
  onClose 
}: { 
  user: UserProfile; 
  enrollments: PlatformEnrollment[]; 
  wishlistEntries: WishlistEntry[]; 
  reviews: UserReview[]; 
  onClose: () => void;
}) => {
  const userEnrollments = enrollments.filter(e => e.user_id === user.id);
  const userWishlist = wishlistEntries.filter(w => w.user_id === user.id);
  const userReviews = reviews.filter(r => r.user_id === user.id);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-card h-full shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500 border-l border-neon-border text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <img src={(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=f2f20d&color=181811&bold=true`) || undefined} className="size-20 rounded-3xl shadow-xl" alt="" />
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-black">{user.full_name}</h2>
              <p className="text-secondary-text font-bold uppercase text-xs tracking-widest">{user.email}</p>
              <div className="flex justify-center sm:justify-start gap-4 mt-2">
                <p className="text-[10px] text-secondary-text/80 font-bold uppercase">Joined {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="size-12 rounded-2xl bg-background-secondary flex items-center justify-center hover:bg-primary hover:text-black transition-all self-end sm:self-auto group">
            <span className="material-symbols-outlined text-primary group-hover:text-black">close</span>
          </button>
        </div>

        <div className="space-y-12">
          {/* ENROLLMENTS SECTION */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neon-border pb-3 gap-2">
              <h3 className="text-lg font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500">receipt_long</span>
                Active Enrollments
              </h3>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded-full border border-green-500/20">{userEnrollments.length} Tracks</span>
            </div>
            <div className="grid gap-3">
              {userEnrollments.map(e => (
                <div key={e.id} className="p-4 bg-background-secondary/30 rounded-2xl border border-neon-border flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary">Order #{e.order_id.substring(0, 8)}</p>
                    <p className="text-[10px] text-secondary-text font-bold uppercase mt-1">Progress: {e.progress}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-secondary-text font-bold uppercase">{new Date(e.created_at).toLocaleDateString()}</p>
                    <p className="text-[8px] text-secondary-text/60 font-black uppercase tracking-widest mt-1">{e.payment_method}</p>
                  </div>
                </div>
              ))}
              {userEnrollments.length === 0 && <p className="text-xs text-secondary-text/40 font-bold uppercase tracking-widest py-4">No active enrollments found.</p>}
            </div>
          </section>

          {/* WISHLIST SECTION */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neon-border pb-3 gap-2">
              <h3 className="text-lg font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-pink-500">favorite</span>
                Wishlist Items
              </h3>
              <span className="px-3 py-1 bg-pink-500/10 text-pink-500 text-[10px] font-black uppercase rounded-full border border-pink-500/20">{userWishlist.length} Saved</span>
            </div>
            <div className="grid gap-3">
              {userWishlist.map((w, idx) => (
                <div key={idx} className="p-4 bg-background-secondary/30 rounded-2xl border border-neon-border flex justify-between items-center">
                  <p className="text-xs font-black uppercase tracking-widest text-primary">Course ID: {w.course_id.substring(0, 12)}...</p>
                  <p className="text-[10px] text-secondary-text font-bold uppercase">{new Date(w.created_at).toLocaleDateString()}</p>
                </div>
              ))}
              {userWishlist.length === 0 && <p className="text-xs text-secondary-text/40 font-bold uppercase tracking-widest py-4">Wishlist is currently empty.</p>}
            </div>
          </section>

          {/* REVIEWS SECTION */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neon-border pb-3 gap-2">
              <h3 className="text-lg font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">star</span>
                User Reviews
              </h3>
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase rounded-full border border-yellow-500/20">{userReviews.length} Published</span>
            </div>
            <div className="grid gap-3">
              {userReviews.map(r => (
                <div key={r.id} className="p-4 bg-background-secondary/30 rounded-2xl border border-neon-border space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`material-symbols-outlined text-xs ${i < r.rating ? 'text-yellow-500 fill-1' : 'text-secondary-text/20'}`}>star</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-secondary-text font-bold uppercase">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-xs text-primary font-medium leading-relaxed italic">"{r.comment}"</p>
                </div>
              ))}
              {userReviews.length === 0 && <p className="text-xs text-secondary-text/40 font-bold uppercase tracking-widest py-4">No reviews published yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const LessonManagementView = ({ 
  course, 
  onClose, 
  setCourses,
  showNotification
}: { 
  course: Course; 
  onClose: () => void; 
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
}) => {
  const [lessons, setLessons] = useState(course.lessons || []);
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isAiImporting, setIsAiImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddLesson = () => {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: "New Lesson",
      duration: "10:00",
      videoUrl: course.videoUrl || '',
      module: ""
    };
    setLessons([...lessons, newLesson]);
  };

  const handleRemoveLesson = (idx: number) => {
    setLessons(lessons.filter((_, i) => i !== idx));
  };

  const handleUpdateLesson = (idx: number, updated: any) => {
    const newLessons = [...lessons];
    newLessons[idx] = { ...newLessons[idx], ...updated };
    setLessons(newLessons);
  };

  const handleImport = () => {
    try {
      const imported = JSON.parse(importText);
      if (Array.isArray(imported)) {
        const valid = imported.map((l: any) => ({
          id: l.id || `lesson-${Math.random().toString(36).substr(2, 9)}`,
          title: l.title || "Untitled Lesson",
          duration: l.duration || "10:00",
          videoUrl: l.videoUrl || "",
          module: l.module || ""
        }));
        setLessons([...lessons, ...valid]);
        setIsImporting(false);
        setImportText('');
      } else {
        showNotification("Import must be a JSON array of lessons.", "error");
      }
    } catch (e) {
      showNotification("Invalid JSON format.", "error");
    }
  };

  const handleAiImport = async () => {
    if (!importUrl.trim()) return;
    setIsAiImporting(true);
    try {
      const lessonData = await importLessonFromUrl(importUrl);
      if (lessonData) {
        const newLesson = {
          id: `lesson-${Date.now()}`,
          title: lessonData.title || "New Lesson",
          duration: lessonData.duration || "10:00",
          videoUrl: lessonData.videoUrl || importUrl,
          module: ""
        };
        setLessons([...lessons, newLesson]);
        setImportUrl('');
      } else {
        showNotification("Failed to extract lesson info. Please check the URL.", "error");
      }
    } catch (error) {
      console.error("AI Import error:", error);
      showNotification("Error importing lesson via AI.", "error");
    } finally {
      setIsAiImporting(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        if (Array.isArray(imported)) {
          const valid = imported.map((l: any) => ({
            id: l.id || `lesson-${Math.random().toString(36).substr(2, 9)}`,
            title: l.title || "Untitled Lesson",
            duration: l.duration || "10:00",
            videoUrl: l.videoUrl || "",
            module: l.module || ""
          }));
          setLessons([...lessons, ...valid]);
        } else {
          showNotification("Invalid file format. Expected a JSON array of lessons.", "error");
        }
      } catch (err) {
        showNotification("Error parsing JSON file.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveLessons = async () => {
    if (lessons.length < 6) {
      showNotification("A minimum of 6 sessions (lessons) is required.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({ lessons })
        .eq('id', course.id);
      
      if (error) throw error;
      
      // Update local courses state
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, lessons } : c));
      onClose();
      showNotification("Curriculum updated successfully!", "success");
    } catch (err) {
      console.error("Error saving lessons:", err);
      showNotification("Failed to save lessons.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkAdd = () => {
    const input = prompt("Enter lesson titles (one per line):");
    if (!input) return;
    
    const titles = input.split('\n').filter(t => t.trim());
    const newLessons = titles.map(title => ({
      id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      duration: "10:00",
      videoUrl: course.videoUrl || ""
    }));
    
    setLessons([...lessons, ...newLessons]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-background-dark/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-card h-full shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500 border-l border-neon-border text-left">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <img src={course.imageUrl || undefined} className="size-16 rounded-2xl object-cover border border-neon-border shadow-sm" alt="" />
            <div>
              <h2 className="text-3xl font-black font-display">{course.title}</h2>
              <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-1">Curriculum Management</p>
            </div>
          </div>
          <button onClick={onClose} className="size-12 rounded-2xl bg-background-secondary flex items-center justify-center hover:bg-primary hover:text-black transition-all group">
            <span className="material-symbols-outlined text-primary group-hover:text-black">close</span>
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-background-secondary/30 rounded-3xl border border-neon-border">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">video_library</span>
              <div>
                <p className="text-sm font-black uppercase tracking-widest">Track Curriculum</p>
                <p className="text-[10px] text-secondary-text font-bold uppercase tracking-widest">{lessons.length} Lessons Total</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none px-6 py-3 bg-background-secondary text-secondary-text text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all"
              >
                Import JSON
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
              <button 
                onClick={() => setIsImporting(!isImporting)}
                className="flex-1 sm:flex-none px-6 py-3 bg-background-secondary text-secondary-text text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all"
              >
                {isImporting ? 'Cancel Text Import' : 'Paste JSON'}
              </button>
              <button 
                onClick={handleBulkAdd}
                className="flex-1 sm:flex-none px-6 py-3 bg-background-secondary text-secondary-text text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all"
              >
                Bulk Add
              </button>
              <button 
                onClick={handleAddLesson}
                className="flex-1 sm:flex-none px-6 py-3 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                Add Lesson
              </button>
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 space-y-4">
            <p className="text-[10px] text-secondary-text/80 font-black uppercase tracking-widest ml-2">Quick Import from URL (AI Powered)</p>
            <div className="flex gap-3">
              <input 
                type="text"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Paste YouTube/Vimeo/Article URL..."
                className="flex-1 bg-card border border-primary/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <button 
                onClick={handleAiImport}
                disabled={isAiImporting || !importUrl.trim()}
                className="px-6 py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span className={`material-symbols-outlined text-sm ${isAiImporting ? 'animate-spin' : ''}`}>
                  {isAiImporting ? 'sync' : 'auto_fix'}
                </span>
                {isAiImporting ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>

          {isImporting && (
            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">download</span>
                <p className="text-xs font-black uppercase tracking-widest">Import Curriculum JSON</p>
              </div>
              <textarea 
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full bg-card border border-primary/20 rounded-2xl p-6 text-xs font-mono min-h-[200px] focus:ring-2 focus:ring-primary outline-none text-secondary-text"
                placeholder='[{"title": "Lesson 1", "duration": "10:00", "videoUrl": "..."}]'
              />
              <button 
                onClick={handleImport}
                className="w-full py-4 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all"
              >
                Process Import
              </button>
            </div>
          )}

          <div className="space-y-4">
            {lessons.map((lesson, idx) => (
              <div key={lesson.id} className="p-6 bg-background-secondary/30 rounded-3xl border border-neon-border space-y-4 group hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                      {idx + 1}
                    </div>
                    <input 
                      type="text"
                      value={lesson.title || ''}
                      onChange={(e) => handleUpdateLesson(idx, { title: e.target.value })}
                      className="flex-1 bg-card border border-neon-border rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Lesson Title"
                    />
                  </div>
                  <button 
                    onClick={() => handleRemoveLesson(idx)}
                    className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-14">
                  <div className="space-y-1">
                    <p className="text-[10px] text-secondary-text/60 font-black uppercase tracking-widest ml-2">Module</p>
                    <input 
                      type="text"
                      value={lesson.module || ''}
                      onChange={(e) => handleUpdateLesson(idx, { module: e.target.value })}
                      className="w-full bg-card border border-neon-border rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                      placeholder="e.g. Module 1: Introduction"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-secondary-text/60 font-black uppercase tracking-widest ml-2">Duration</p>
                    <input 
                      type="text"
                      value={lesson.duration || ''}
                      onChange={(e) => handleUpdateLesson(idx, { duration: e.target.value })}
                      className="w-full bg-card border border-neon-border rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                      placeholder="e.g. 10:00"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-secondary-text/60 font-black uppercase tracking-widest ml-2">Video Source</p>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={lesson.videoUrl || ''}
                        onChange={(e) => handleUpdateLesson(idx, { videoUrl: e.target.value })}
                        className="flex-1 bg-card border border-neon-border rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Video URL or upload..."
                      />
                      <label className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all shrink-0">
                        <span className="material-symbols-outlined text-primary text-sm">cloud_upload</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="video/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'course-assets', 'videos');
                              if (url) handleUpdateLesson(idx, { videoUrl: url });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {lessons.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-neon-border rounded-[48px] space-y-4">
                <span className="material-symbols-outlined text-5xl text-secondary-text/20">playlist_add</span>
                <p className="text-sm text-secondary-text/40 font-bold uppercase tracking-widest">No curriculum defined yet</p>
              </div>
            )}
          </div>

          <div className="pt-10 border-t border-neon-border flex justify-end">
            <button 
              onClick={handleSaveLessons}
              disabled={isSaving}
              className="w-full sm:w-auto px-12 py-5 bg-primary text-black font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Saving Curriculum...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddTrackModal = ({ 
  editingCourseId, 
  courses, 
  setCourses, 
  onClose,
  showNotification
}: { 
  editingCourseId: string | null; 
  courses: Course[]; 
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>; 
  onClose: () => void; 
  showNotification: (msg: string, type?: 'success' | 'error') => void;
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const lessonFileInputRef = React.useRef<HTMLInputElement>(null);
  const [newTrack, setNewTrack] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: 'Technology',
    price: 0,
    duration: '',
    imageUrl: '',
    instructor: '',
    lessons: [],
    isFeatured: false
  });

  useEffect(() => {
    if (editingCourseId) {
      const course = courses.find(c => c.id === editingCourseId);
      if (course) {
        setNewTrack({
          title: course.title,
          description: course.description,
          category: course.category,
          price: course.price,
          duration: course.duration,
          imageUrl: course.imageUrl,
          instructor: course.instructor,
          lessons: course.lessons,
          isFeatured: course.isFeatured || false
        });
        setLessons(course.lessons || []);
      }
    }
  }, [editingCourseId, courses]);

  const handleAddLesson = () => {
    setLessons([...lessons, {
      id: `lesson-${Date.now()}`,
      title: '',
      duration: '10:00',
      videoUrl: '',
      module: ''
    }]);
  };

  const handleRemoveLesson = (id: string) => {
    setLessons(lessons.filter(l => l.id !== id));
  };

  const handleUpdateLesson = (id: string, field: keyof Lesson, value: string) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        if (Array.isArray(imported)) {
          const valid = imported.map((l: any) => ({
            id: l.id || `lesson-${Math.random().toString(36).substr(2, 9)}`,
            title: l.title || "Untitled Lesson",
            duration: l.duration || "10:00",
            videoUrl: l.videoUrl || "",
            module: l.module || ""
          }));
          setLessons([...lessons, ...valid]);
        } else {
          showNotification("Invalid file format. Expected a JSON array of lessons.", "error");
        }
      } catch (err) {
        showNotification("Error parsing JSON file.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      const imported = JSON.parse(importText);
      if (Array.isArray(imported)) {
        const valid = imported.map((l: any) => ({
          id: l.id || `lesson-${Math.random().toString(36).substr(2, 9)}`,
          title: l.title || "Untitled Lesson",
          duration: l.duration || "10:00",
          videoUrl: l.videoUrl || "",
          module: l.module || ""
        }));
        setLessons([...lessons, ...valid]);
        setIsImporting(false);
        setImportText('');
      } else {
        showNotification("Import must be a JSON array of lessons.", "error");
      }
    } catch (e) {
      showNotification("Invalid JSON format.", "error");
    }
  };

  const handleSave = async () => {
    if (!newTrack.title || !newTrack.description || !newTrack.category) {
      showNotification("Please fill in all required fields.", "error");
      return;
    }
    if (lessons.length < 6) {
      showNotification("A minimum of 6 sessions (lessons) is required.", "error");
      return;
    }
    if (lessons.some(l => !l.title.trim())) {
      showNotification("All sessions must have a title.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const trackToSave = {
        ...newTrack,
        lessons,
        rating: editingCourseId ? courses.find(c => c.id === editingCourseId)?.rating : 4.5,
        reviews: editingCourseId ? courses.find(c => c.id === editingCourseId)?.reviews : '0',
        created_at: editingCourseId ? courses.find(c => c.id === editingCourseId)?.created_at : new Date().toISOString()
      };

      if (editingCourseId) {
        const { error } = await supabase
          .from('courses')
          .update(trackToSave)
          .eq('id', editingCourseId);
        
        if (error) throw error;
        
        setCourses(courses.map(c => c.id === editingCourseId ? { ...c, ...(trackToSave as Course) } : c));
        showNotification("Track updated successfully!", "success");
      } else {
        const { data, error } = await supabase.from('courses').insert([trackToSave]).select();
        if (error) throw error;
        setCourses([...courses, data[0]]);
        showNotification("Track added successfully!", "success");
      }

      onClose();
    } catch (error) {
      console.error("Error saving track:", error);
      showNotification("Failed to save track. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background-dark/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-card rounded-[48px] border border-neon-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-neon-border flex justify-between items-center bg-background-secondary/30">
          <div>
            <h2 className="text-3xl font-black font-display text-primary">{editingCourseId ? 'Edit Learning Track' : 'Add Learning Track'}</h2>
            <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">{editingCourseId ? 'Update existing course details and sessions' : 'Design a new structured course'}</p>
          </div>
          <button onClick={onClose} className="size-12 rounded-2xl bg-background-secondary flex items-center justify-center hover:bg-primary hover:text-black transition-all group">
            <span className="material-symbols-outlined text-primary group-hover:text-black">close</span>
          </button>
        </div>

        <div className="p-10 overflow-y-auto flex-1 space-y-10 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-text">Track Title</label>
              <input 
                type="text"
                value={newTrack.title || ''}
                onChange={(e) => setNewTrack({...newTrack, title: e.target.value})}
                className="w-full px-6 py-4 bg-background-secondary border border-neon-border rounded-2xl text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                placeholder="e.g. Advanced Cloud Architecture"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-text">Category</label>
              <select 
                value={newTrack.category}
                onChange={(e) => setNewTrack({...newTrack, category: e.target.value})}
                className="w-full px-6 py-4 bg-background-secondary border border-neon-border rounded-2xl text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              >
                {Object.values(Category).filter(cat => cat !== Category.ALL).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-text">Instructor Name</label>
              <input 
                type="text"
                value={newTrack.instructor || ''}
                onChange={(e) => setNewTrack({...newTrack, instructor: e.target.value})}
                className="w-full px-6 py-4 bg-background-secondary border border-neon-border rounded-2xl text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                placeholder="e.g. Dr. Sarah Chen"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-text">Price (USD)</label>
              <input 
                type="number"
                value={newTrack.price || 0}
                onChange={(e) => setNewTrack({...newTrack, price: Number(e.target.value)})}
                className="w-full px-6 py-4 bg-background-secondary border border-neon-border rounded-2xl text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-4 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-text">Description</label>
              <textarea 
                value={newTrack.description || ''}
                onChange={(e) => setNewTrack({...newTrack, description: e.target.value})}
                className="w-full px-6 py-4 bg-background-secondary border border-neon-border rounded-2xl text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium min-h-[120px]"
                placeholder="Describe the learning objectives and outcomes..."
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-text">Track Image</label>
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={newTrack.imageUrl || ''}
                  onChange={(e) => setNewTrack({...newTrack, imageUrl: e.target.value})}
                  className="flex-1 px-6 py-4 bg-background-secondary border border-neon-border rounded-2xl text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  placeholder="Image URL or upload..."
                />
                <label className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all shrink-0 group">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">cloud_upload</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file, 'course-images', 'course-thumbnails');
                        if (url) {
                          setNewTrack({...newTrack, imageUrl: url});
                          showNotification("Image uploaded successfully!", "success");
                        } else {
                          showNotification("Failed to upload image. Please check your storage settings.", "error");
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-text">Total Duration</label>
              <input 
                type="text"
                value={newTrack.duration || ''}
                onChange={(e) => setNewTrack({...newTrack, duration: e.target.value})}
                className="w-full px-6 py-4 bg-background-secondary border border-neon-border rounded-2xl text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                placeholder="e.g. 12 Hours"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-background-secondary rounded-3xl border border-neon-border">
            <div className="flex-1 text-left">
              <p className="text-sm font-black uppercase tracking-widest text-primary">Featured Track</p>
              <p className="text-[10px] text-secondary-text font-bold">Showcase this track on the homepage</p>
            </div>
            <button 
              onClick={() => setNewTrack({...newTrack, isFeatured: !newTrack.isFeatured})}
              className={`w-16 h-8 rounded-full transition-all relative ${newTrack.isFeatured ? 'bg-primary' : 'bg-background-secondary border border-neon-border'}`}
            >
              <div className={`absolute top-1 size-6 rounded-full transition-all ${newTrack.isFeatured ? 'right-1 bg-black' : 'left-1 bg-secondary-text'}`}></div>
            </button>
          </div>

          <div className="space-y-6 pt-6 border-t border-neon-border text-left">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xl font-black font-display text-primary">Learning Plan Sessions</h4>
                <p className="text-[10px] text-secondary-text font-black uppercase tracking-widest mt-1">Minimum 6 sessions required ({lessons.length}/6)</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => lessonFileInputRef.current?.click()}
                  className="px-6 py-3 bg-background-secondary text-secondary-text text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all border border-neon-border"
                >
                  Import JSON
                </button>
                <input 
                  type="file"
                  ref={lessonFileInputRef}
                  onChange={handleFileImport}
                  accept=".json"
                  className="hidden"
                />
                <button 
                  onClick={() => setIsImporting(!isImporting)}
                  className="px-6 py-3 bg-background-secondary text-secondary-text text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all border border-neon-border"
                >
                  {isImporting ? 'Cancel' : 'Paste JSON'}
                </button>
                <button 
                  onClick={handleAddLesson}
                  className="px-6 py-3 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2 border border-primary/20"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Session
                </button>
              </div>
            </div>

            {isImporting && (
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <textarea 
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full bg-card border border-primary/20 rounded-2xl p-6 text-xs font-mono min-h-[150px] focus:ring-2 focus:ring-primary outline-none text-secondary-text"
                  placeholder='[{"title": "Lesson 1", "duration": "10:00", "videoUrl": "..."}]'
                />
                <button 
                  onClick={handleImport}
                  className="w-full py-4 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all"
                >
                  Process Import
                </button>
              </div>
            )}

            <div className="space-y-4">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="flex items-center gap-4 p-6 bg-background-secondary/30 rounded-3xl border border-neon-border group animate-in slide-in-from-left-4 duration-300">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] text-secondary-text/60 font-black uppercase tracking-widest ml-2">Module</p>
                      <input 
                        type="text"
                        value={lesson.module || ''}
                        onChange={(e) => handleUpdateLesson(lesson.id, 'module', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-primary font-bold placeholder:text-secondary-text/40 text-sm"
                        placeholder="Module Name..."
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] text-secondary-text/60 font-black uppercase tracking-widest ml-2">Title</p>
                      <input 
                        type="text"
                        value={lesson.title || ''}
                        onChange={(e) => handleUpdateLesson(lesson.id, 'title', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-primary font-bold placeholder:text-secondary-text/40 text-sm"
                        placeholder="Session Title..."
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <p className="text-[8px] text-secondary-text/60 font-black uppercase tracking-widest ml-2">Duration</p>
                        <input 
                          type="text"
                          value={lesson.duration || ''}
                          onChange={(e) => handleUpdateLesson(lesson.id, 'duration', e.target.value)}
                          className="w-20 bg-transparent border-none focus:ring-0 text-secondary-text text-sm font-bold"
                          placeholder="00:00"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-[8px] text-secondary-text/60 font-black uppercase tracking-widest ml-2">Video</p>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={lesson.videoUrl || ''}
                            onChange={(e) => handleUpdateLesson(lesson.id, 'videoUrl', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-primary text-xs font-bold truncate"
                            placeholder="URL or upload..."
                          />
                          <label className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all shrink-0">
                            <span className="material-symbols-outlined text-primary text-sm">cloud_upload</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="video/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleFileUpload(file, 'course-assets', 'videos');
                                  if (url) {
                                    handleUpdateLesson(lesson.id, 'videoUrl', url);
                                    showNotification("Video uploaded successfully!", "success");
                                  } else {
                                    showNotification("Failed to upload video.", "error");
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveLesson(lesson.id)}
                        className="size-10 rounded-xl hover:bg-red-500/10 text-secondary-text hover:text-red-500 transition-all flex items-center justify-center shrink-0"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {lessons.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-neon-border rounded-[48px]">
                  <span className="material-symbols-outlined text-5xl text-secondary-text/20">playlist_add</span>
                  <p className="text-secondary-text font-bold uppercase text-[10px] tracking-widest mt-4">No sessions added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-neon-border bg-background-secondary/30 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-background-secondary text-secondary-text font-black rounded-2xl hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-12 py-4 bg-primary text-black font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all text-xs uppercase tracking-widest flex items-center gap-3 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Saving Track...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                {editingCourseId ? 'Update Track' : 'Publish Track'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};






const AdminPage: React.FC<AdminPageProps> = ({ 
  onBack, 
  onEditCourse, 
  courses, 
  setCourses,
  platformSettings,
  setPlatformSettings,
  legalContent,
  setLegalContent
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reviews' | 'enrollments' | 'wishlist' | 'courses' | 'activity' | 'inquiries' | 'explorer' | 'chats' | 'settings'>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [enrollments, setEnrollments] = useState<PlatformEnrollment[]>([]);
  const [wishlistEntries, setWishlistEntries] = useState<WishlistEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [wishlistSearchQuery, setWishlistSearchQuery] = useState('');
  const [inquirySearchQuery, setInquirySearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [enrollmentSearchQuery, setEnrollmentSearchQuery] = useState('');
  const [explorerTable, setExplorerTable] = useState<string>('profiles');
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch each resource individually to handle partial failures better
      const fetchResource = async (table: string) => {
        try {
          // Try direct Supabase fetch first
          const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
          if (error) {
            console.warn(`Direct fetch error for ${table}, trying proxy...`, error.message);
            // Fallback to proxy
            const response = await fetch(`/api/proxy/${table}`);
            if (response.ok) {
              return await response.json();
            }
            return [];
          }
          return data || [];
        } catch (e: any) {
          console.warn(`Exception fetching ${table} directly, trying proxy...`, e.message);
          // Fallback to proxy on network error
          try {
            const response = await fetch(`/api/proxy/${table}`);
            if (response.ok) {
              return await response.json();
            }
          } catch (proxyErr) {
            console.error(`Proxy fetch also failed for ${table}:`, proxyErr);
          }
          return [];
        }
      };

      const [uData, rData, eData, wData, aData, iData, cData, chatData] = await Promise.all([
        fetchResource('profiles'),
        fetchResource('reviews'),
        fetchResource('enrollments'),
        fetchResource('wishlist'),
        fetchResource('activity_log'),
        fetchResource('inquiries'),
        fetchResource('courses'),
        fetchResource('chat_history')
      ]);

      // Deduplicate data to prevent React key errors
      const deduplicate = (arr: any[], key: string = 'id') => {
        return arr.filter((item, index, self) =>
          index === self.findIndex((i) => i[key] === item[key])
        );
      };

      setUsers(deduplicate(uData));
      setReviews(deduplicate(rData));
      setEnrollments(deduplicate(eData));
      setWishlistEntries(deduplicate(wData));
      setActivityLogs(deduplicate(aData));
      setInquiries(deduplicate(iData));
      setChatMessages(deduplicate(chatData));
      
      if (cData && cData.length > 0) {
        setCourses(deduplicate(cData as Course[]));
        const allCourses = cData as Course[];
        const allReviews = rData as UserReview[];
        
        // Recalculate ratings and identify which ones need database updates
        const updatedCourses = allCourses.map(course => {
          const courseReviews = allReviews.filter(r => r.course_id === course.id);
          if (courseReviews.length > 0) {
            const totalRating = courseReviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = parseFloat((totalRating / courseReviews.length).toFixed(1));
            const reviewCount = courseReviews.length;
            const reviewsStr = reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : `${reviewCount}`;
            
            // Only update if values are different to avoid unnecessary writes
            if (course.rating !== avgRating || course.reviews !== reviewsStr) {
              // We'll perform the update in the background
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
        
        setCourses(updatedCourses);
      }
    } catch (err) {
      console.error("Database Audit Error:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDeleteReview = async (id: string) => {
    setConfirmDialog({
      message: "Delete this review permanently?",
      onConfirm: async () => {
        const { error } = await supabase.from('reviews').delete().match({ id });
        if (!error) {
          setReviews(prev => prev.filter(r => r.id !== id));
          showNotification("Review deleted successfully!");
        } else {
          showNotification("Failed to delete review.", "error");
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleDeleteCourse = async (id: string) => {
    setConfirmDialog({
      message: "Delete this track permanently? This action cannot be undone and will affect enrolled students.",
      onConfirm: async () => {
        const { error } = await supabase.from('courses').delete().match({ id });
        if (!error) {
          setCourses(prev => prev.filter(c => c.id !== id));
          showNotification("Course deleted successfully!");
        } else {
          showNotification("Failed to delete course.", "error");
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleDeleteUser = async (id: string) => {
    setConfirmDialog({
      message: "Delete this user profile permanently? This will remove their access to the platform.",
      onConfirm: async () => {
        const { error } = await supabase.from('profiles').delete().match({ id });
        if (!error) {
          setUsers(prev => prev.filter(u => u.id !== id));
          showNotification("User profile deleted successfully!");
        } else {
          showNotification("Failed to delete user.", "error");
        }
        setConfirmDialog(null);
      }
    });
  };
  const renderDashboard = () => (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: 'Cloud Profiles', value: users.length.toString(), icon: 'person_search', color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Verified Sales', value: enrollments.length.toString(), icon: 'account_balance_wallet', color: 'text-green-500', bg: 'bg-green-500/5' },
          { label: 'Global Interest', value: wishlistEntries.length.toString(), icon: 'favorite', color: 'text-red-500', bg: 'bg-red-500/5' },
          { label: 'Platform Sentiment', value: reviews.length.toString(), icon: 'forum', color: 'text-amber-500', bg: 'bg-amber-500/5' }
        ].map((stat) => (
          <div key={stat.label} className="bg-card p-6 md:p-8 rounded-[32px] border border-neon-border shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl group">
            <div className={`size-12 md:size-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${stat.color}`}>
              <span className="material-symbols-outlined text-3xl md:text-4xl font-black">{stat.icon}</span>
            </div>
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-secondary-text mb-2">{stat.label}</p>
            <p className="text-3xl md:text-4xl font-black tracking-tighter font-display">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-black text-white p-8 md:p-16 rounded-[48px] md:rounded-[64px] shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5">
        <div className="absolute top-0 right-0 p-16 opacity-10 hidden lg:block pointer-events-none">
          <span className="material-symbols-outlined text-[180px] font-black text-primary">monitoring</span>
        </div>
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl md:text-4xl font-black tracking-tighter font-display">Platform Intelligence Hub</h3>
            <p className="text-secondary-text max-w-2xl font-medium text-sm md:text-xl leading-relaxed">Monitoring real-time activity across the cloud infrastructure. Audit student engagement metrics and financial history with precision.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={() => setActiveTab('users')} className="w-full sm:w-auto px-10 py-5 bg-primary text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20">Open User Hub</button>
            <button onClick={() => setActiveTab('enrollments')} className="w-full sm:w-auto px-10 py-5 bg-primary/10 text-primary font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20">Audit Sales</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(u => 
      (u.email?.toLowerCase() || '').includes(userSearchQuery.toLowerCase()) ||
      (u.full_name?.toLowerCase() || '').includes(userSearchQuery.toLowerCase())
    );

    return (
      <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
        <div className="p-10 border-b border-neon-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-background-secondary/30">
          <div>
            <h3 className="text-2xl font-black font-display">Student Intelligence Hub</h3>
            <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Select a student for deep-dive audit</p>
          </div>
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary-text/80 text-lg">search</span>
              <input 
                type="text"
                placeholder="Search by Gmail..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-card border border-neon-border rounded-2xl text-sm text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>
            <button onClick={fetchData} className="size-14 rounded-2xl hover:bg-background-secondary flex items-center justify-center text-secondary-text/80 shrink-0 transition-colors border border-neon-border">
              <span className={`material-symbols-outlined text-2xl ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto min-h-[500px] no-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-background-secondary/50">
              <tr>
                {['Learner Profile', 'Email Identity', 'Joined On', 'Enrollments', 'Actions'].map(h => (
                  <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-background-secondary">
              {filteredUsers.map((u) => {
                const count = enrollments.filter(e => e.user_id === u.id).length;
                return (
                  <tr key={u.id} onClick={() => setSelectedUser(u)} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                    <td className="px-10 py-6 flex items-center gap-4">
                      <img src={(`https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=FACC15&color=000000&bold=true`) || undefined} className="size-12 rounded-2xl border border-neon-border shadow-sm" alt="" />
                      <div className="flex flex-col">
                        <span className="text-base font-black text-primary transition-colors font-display">{u.full_name || 'Verified Learner'}</span>
                        <span className="text-[10px] text-secondary-text/80 font-bold uppercase tracking-widest">ID: {u.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm text-primary font-bold">{u.email}</td>
                    <td className="px-10 py-6 text-[11px] text-primary uppercase font-black tracking-widest">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 text-[10px] font-black rounded-full ${count > 0 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-background-secondary text-secondary-text/80'}`}>
                        {count} {count === 1 ? 'TRACK' : 'TRACKS'}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}
                          className="size-12 rounded-2xl bg-background-secondary flex items-center justify-center hover:bg-primary hover:text-black transition-all border border-neon-border"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }}
                          className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                          title="Delete User"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="py-32 text-center text-secondary-text/80 italic font-medium">No student profiles matched your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-12 animate-in fade-in duration-500 text-left">
      <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden">
        <div className="p-10 border-b border-neon-border bg-background-secondary/30">
          <h3 className="text-2xl font-black font-display">Platform Infrastructure Settings</h3>
          <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Global configuration for cloud operations</p>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-background-secondary rounded-3xl border border-neon-border">
              <div>
                <p className="text-sm font-black uppercase tracking-widest">Maintenance Mode</p>
                <p className="text-[10px] text-secondary-text font-bold">Restrict platform access for updates</p>
              </div>
              <button 
                onClick={() => setPlatformSettings({ ...platformSettings, maintenanceMode: !platformSettings.maintenanceMode })}
                className={`w-16 h-8 rounded-full transition-all relative ${platformSettings.maintenanceMode ? 'bg-red-500' : 'bg-background-secondary'}`}
              >
                <div className={`absolute top-1 size-6 bg-white rounded-full transition-all ${platformSettings.maintenanceMode ? 'left-9' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-background-secondary rounded-3xl border border-neon-border">
              <div>
                <p className="text-sm font-black uppercase tracking-widest">AI Tutor Integration</p>
                <p className="text-[10px] text-secondary-text font-bold">Enable Gemini-powered learning assistant</p>
              </div>
              <button 
                onClick={() => setPlatformSettings({ ...platformSettings, enableAiTutor: !platformSettings.enableAiTutor })}
                className={`w-16 h-8 rounded-full transition-all relative ${platformSettings.enableAiTutor ? 'bg-primary' : 'bg-background-secondary'}`}
              >
                <div className={`absolute top-1 size-6 bg-white rounded-full transition-all ${platformSettings.enableAiTutor ? 'left-9' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-background-secondary rounded-3xl border border-neon-border">
              <div>
                <p className="text-sm font-black uppercase tracking-widest">Guest Reviews</p>
                <p className="text-[10px] text-secondary-text font-bold">Allow unauthenticated users to post feedback</p>
              </div>
              <button 
                onClick={() => setPlatformSettings({ ...platformSettings, allowGuestReviews: !platformSettings.allowGuestReviews })}
                className={`w-16 h-8 rounded-full transition-all relative ${platformSettings.allowGuestReviews ? 'bg-primary' : 'bg-background-secondary'}`}
              >
                <div className={`absolute top-1 size-6 bg-white rounded-full transition-all ${platformSettings.allowGuestReviews ? 'left-9' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-background-secondary rounded-3xl border border-neon-border space-y-4">
              <p className="text-sm font-black uppercase tracking-widest">Platform Fee (%)</p>
              <input 
                type="number"
                value={platformSettings.platformFee || 0}
                onChange={(e) => setPlatformSettings({ ...platformSettings, platformFee: parseFloat(e.target.value) || 0 })}
                className="w-full bg-card border border-neon-border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="p-6 bg-background-secondary rounded-3xl border border-neon-border space-y-4">
              <p className="text-sm font-black uppercase tracking-widest">Min. Withdrawal ({platformSettings.defaultCurrency})</p>
              <input 
                type="number"
                value={platformSettings.minWithdrawal || 0}
                onChange={(e) => setPlatformSettings({ ...platformSettings, minWithdrawal: parseFloat(e.target.value) || 0 })}
                className="w-full bg-card border border-neon-border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden">
        <div className="p-10 border-b border-neon-border bg-background-secondary/30">
          <h3 className="text-2xl font-black font-display">Legal Content Management</h3>
          <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Edit platform terms and privacy policies</p>
        </div>
        <div className="p-10 space-y-10">
          <div className="space-y-6">
            <h4 className="text-lg font-black uppercase tracking-widest text-primary">Terms of Service</h4>
            {legalContent.terms.sections.map((section: any, idx: number) => (
              <div key={`terms-section-${idx}`} className="space-y-3 p-6 bg-background-secondary rounded-3xl border border-neon-border">
                <input 
                  value={section.h || ''}
                  onChange={(e) => {
                    const newTerms = { ...legalContent.terms };
                    newTerms.sections[idx].h = e.target.value;
                    setLegalContent({ ...legalContent, terms: newTerms });
                  }}
                  className="w-full bg-card border border-neon-border rounded-xl px-4 py-2 text-sm font-black focus:ring-2 focus:ring-primary outline-none"
                />
                <textarea 
                  value={section.p || ''}
                  onChange={(e) => {
                    const newTerms = { ...legalContent.terms };
                    newTerms.sections[idx].p = e.target.value;
                    setLegalContent({ ...legalContent, terms: newTerms });
                  }}
                  className="w-full bg-card border border-neon-border rounded-xl px-4 py-2 text-xs font-medium min-h-[100px] focus:ring-2 focus:ring-primary outline-none leading-relaxed"
                />
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-black uppercase tracking-widest text-primary">Privacy Policy</h4>
            {legalContent.privacy.sections.map((section: any, idx: number) => (
              <div key={`privacy-section-${idx}`} className="space-y-3 p-6 bg-background-secondary rounded-3xl border border-neon-border">
                <input 
                  value={section.h}
                  onChange={(e) => {
                    const newPrivacy = { ...legalContent.privacy };
                    newPrivacy.sections[idx].h = e.target.value;
                    setLegalContent({ ...legalContent, privacy: newPrivacy });
                  }}
                  className="w-full bg-card border border-neon-border rounded-xl px-4 py-2 text-sm font-black focus:ring-2 focus:ring-primary outline-none"
                />
                <textarea 
                  value={section.p}
                  onChange={(e) => {
                    const newPrivacy = { ...legalContent.privacy };
                    newPrivacy.sections[idx].p = e.target.value;
                    setLegalContent({ ...legalContent, privacy: newPrivacy });
                  }}
                  className="w-full bg-card border border-neon-border rounded-xl px-4 py-2 text-xs font-medium min-h-[100px] focus:ring-2 focus:ring-primary outline-none leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10 pb-20 pt-2 md:pt-0">
      {selectedUser && (
        <UserDetailView 
          user={selectedUser} 
          enrollments={enrollments} 
          wishlistEntries={wishlistEntries} 
          reviews={reviews} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
      {selectedCourseForLessons && (
        <LessonManagementView 
          course={selectedCourseForLessons} 
          onClose={() => setSelectedCourseForLessons(null)} 
          setCourses={setCourses} 
          showNotification={showNotification}
        />
      )}
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 text-left">
        <div className="space-y-4 w-full lg:w-auto">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-1 shadow-2xl shadow-red-500/20">
            <span className="material-symbols-outlined text-sm font-black">verified_user</span>
            Command Center Active
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-[0.85] lg:text-8xl font-display">Control Center</h1>
          <p className="text-secondary-text text-sm sm:text-2xl font-medium max-w-2xl leading-tight tracking-tight">Global oversight of student lifecycle, cloud fulfillment, and platform intelligence.</p>
        </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            <button 
              onClick={() => {
                setEditingCourseId(null);
                setIsAddingTrack(true);
              }}
              className="px-10 py-5 bg-primary text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:scale-105 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-2xl">add_circle</span>
              Add New Track
            </button>
            <button onClick={onBack} className="px-10 py-5 bg-card border border-neon-border font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-background-secondary transition-all shadow-sm flex items-center justify-center gap-3 text-primary">
              <span className="material-symbols-outlined text-2xl">logout</span>
              Exit Admin
            </button>
          </div>
      </div>

      <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6 group/admin-tabs">
        <div className="flex p-3 bg-background-secondary rounded-[32px] md:rounded-[48px] w-full overflow-x-auto no-scrollbar shadow-inner border border-neon-border scroll-smooth snap-x">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
              { id: 'users', label: 'User Hub', icon: 'group' },
              { id: 'activity', label: 'Activity Log', icon: 'history' },
              { id: 'enrollments', label: 'Sales Log', icon: 'payments' },
              { id: 'wishlist', label: 'Wishlist', icon: 'favorite' },
              { id: 'inquiries', label: 'Inquiries', icon: 'mail' },
              { id: 'chats', label: 'AI Chats', icon: 'smart_toy' },
              { id: 'reviews', label: 'Feedback', icon: 'rate_review' },
              { id: 'courses', label: 'Catalog', icon: 'inventory' },
              { id: 'settings', label: 'Settings', icon: 'settings' },
              { id: 'explorer', label: 'Explorer', icon: 'database' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center gap-3 py-4 px-8 rounded-2xl md:rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0 snap-start border-2 ${
                  activeTab === tab.id 
                    ? 'bg-card text-primary shadow-2xl border-primary scale-[1.05] z-10' 
                    : 'bg-transparent border-transparent text-secondary-text hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${activeTab === tab.id ? 'text-primary' : ''}`}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Gradient Masks for scroll indication */}
        <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-background-main to-transparent pointer-events-none opacity-40 group-hover/admin-tabs:opacity-100 transition-opacity"></div>
        <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-background-main to-transparent pointer-events-none opacity-40 group-hover/admin-tabs:opacity-100 transition-opacity"></div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        
        {activeTab === 'wishlist' && (
          <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-10 border-b border-neon-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-background-secondary/30">
              <div>
                <h3 className="text-2xl font-black font-display">Global Wishlist Audit</h3>
                <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Monitoring student interest across the catalog</p>
              </div>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary-text/80 text-lg">search</span>
                  <input 
                    type="text"
                    placeholder="Search wishlist..."
                    value={wishlistSearchQuery}
                    onChange={(e) => setWishlistSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-card border border-neon-border rounded-2xl text-sm text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  />
                </div>
                <button onClick={fetchData} className="size-14 rounded-2xl hover:bg-background-secondary flex items-center justify-center text-secondary-text/80 shrink-0 transition-colors border border-neon-border">
                  <span className={`material-symbols-outlined text-2xl ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[500px] no-scrollbar">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-background-secondary/50">
                  <tr>
                    {['Student', 'Course Interest', 'Added On'].map(h => (
                      <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-secondary">
                  {wishlistEntries
                    .filter(w => {
                      const user = users.find(u => u.id === w.user_id);
                      const course = courses.find(c => c.id === w.course_id);
                      return ((user?.full_name?.toLowerCase() || '').includes(wishlistSearchQuery.toLowerCase()) || 
                              (user?.email?.toLowerCase() || '').includes(wishlistSearchQuery.toLowerCase()) ||
                              (course?.title?.toLowerCase() || '').includes(wishlistSearchQuery.toLowerCase()));
                    })
                    .map((w, idx) => {
                    const user = users.find(u => u.id === w.user_id);
                    const course = courses.find(c => c.id === w.course_id);
                    return (
                      <tr key={`${w.user_id}-${w.course_id}-${idx}`} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <img src={(`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=FACC15&color=000000&bold=true`) || undefined} className="size-12 rounded-2xl border border-neon-border shadow-sm" alt="" />
                            <div>
                              <p className="text-base font-black text-primary transition-colors font-display">{user?.full_name || 'Learner'}</p>
                              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <img src={course?.imageUrl || undefined} className="size-12 rounded-2xl object-cover border border-neon-border shadow-sm" alt="" />
                            <p className="text-base font-black text-primary font-display">{course?.title || 'Archived Track'}</p>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-[11px] text-primary uppercase font-black tracking-widest">{new Date(w.created_at).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {wishlistEntries.length === 0 && (
                    <tr><td colSpan={3} className="py-32 text-center text-secondary-text/80 italic font-medium">No wishlist data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-10 border-b border-neon-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-background-secondary/30">
              <div>
                <h3 className="text-2xl font-black font-display">Inquiry Ledger</h3>
                <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Direct messages from the contact infrastructure</p>
              </div>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary-text/80 text-lg">search</span>
                  <input 
                    type="text"
                    placeholder="Search inquiries..."
                    value={inquirySearchQuery}
                    onChange={(e) => setInquirySearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-card border border-neon-border rounded-2xl text-sm text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  />
                </div>
                <button onClick={fetchData} className="size-14 rounded-2xl hover:bg-background-secondary flex items-center justify-center text-secondary-text/80 shrink-0 transition-colors border border-neon-border">
                  <span className={`material-symbols-outlined text-2xl ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[500px] no-scrollbar">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-background-secondary/50">
                  <tr>
                    {['Sender', 'Subject', 'Message', 'Date'].map(h => (
                      <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-secondary">
                  {inquiries
                    .filter(i => (i.full_name?.toLowerCase() || '').includes(inquirySearchQuery.toLowerCase()) || 
                                (i.email?.toLowerCase() || '').includes(inquirySearchQuery.toLowerCase()) ||
                                (i.subject?.toLowerCase() || '').includes(inquirySearchQuery.toLowerCase()) ||
                                (i.message?.toLowerCase() || '').includes(inquirySearchQuery.toLowerCase()))
                    .map((i) => (
                    <tr key={i.id} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={(`https://ui-avatars.com/api/?name=${encodeURIComponent(i.full_name)}&background=181811&color=ffffff&bold=true`) || undefined} className="size-12 rounded-2xl border border-neon-border shadow-sm" alt="" />
                          <div>
                            <p className="text-base font-black text-primary transition-colors font-display">{i.full_name}</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{i.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full border border-primary/20 tracking-widest">
                          {i.subject}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-sm text-secondary-text font-medium italic leading-relaxed max-w-md">"{i.message}"</td>
                      <td className="px-10 py-6 text-[11px] text-primary uppercase font-black tracking-widest">{new Date(i.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {inquiries.length === 0 && (
                    <tr><td colSpan={4} className="py-32 text-center text-secondary-text/80 italic font-medium">No inquiries recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-10 border-b border-neon-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-background-secondary/30">
              <div>
                <h3 className="text-2xl font-black font-display">Raw Database Explorer</h3>
                <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Direct JSON audit of Supabase collections</p>
              </div>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <select 
                  value={explorerTable}
                  onChange={(e) => setExplorerTable(e.target.value)}
                  className="bg-card border border-neon-border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="profiles">Profiles Table</option>
                  <option value="enrollments">Enrollments Table</option>
                  <option value="reviews">Reviews Table</option>
                  <option value="wishlist">Wishlist Table</option>
                  <option value="activity_log">Activity Log Table</option>
                  <option value="inquiries">Inquiries Table</option>
                  <option value="courses">Courses Table</option>
                  <option value="chat_history">AI Chat History</option>
                </select>
                <button onClick={fetchData} className="size-14 rounded-2xl hover:bg-background-secondary flex items-center justify-center text-secondary-text/80 shrink-0 transition-colors border border-neon-border">
                  <span className={`material-symbols-outlined text-2xl ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
                </button>
              </div>
            </div>
            <div className="p-10">
              <div className="bg-background-secondary rounded-[32px] p-8 overflow-auto max-h-[600px] shadow-inner border border-neon-border">
                <pre className="text-emerald-400 text-[11px] font-mono leading-relaxed">
                  {JSON.stringify(
                    explorerTable === 'profiles' ? users :
                    explorerTable === 'enrollments' ? enrollments :
                    explorerTable === 'reviews' ? reviews :
                    explorerTable === 'wishlist' ? wishlistEntries :
                    explorerTable === 'activity_log' ? activityLogs :
                    explorerTable === 'inquiries' ? inquiries :
                    explorerTable === 'chat_history' ? chatMessages :
                    courses,
                    null, 2
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-10 border-b border-neon-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-background-secondary/30">
              <div>
                <h3 className="text-2xl font-black font-display">AI Tutor Interactions</h3>
                <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Audit of student questions and AI responses</p>
              </div>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary-text/80 text-lg">search</span>
                  <input 
                    type="text"
                    placeholder="Search chats..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-card border border-neon-border rounded-2xl text-sm text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  />
                </div>
                <button onClick={fetchData} className="size-14 rounded-2xl hover:bg-background-secondary flex items-center justify-center text-secondary-text/80 shrink-0 transition-colors border border-neon-border">
                  <span className={`material-symbols-outlined text-2xl ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[500px] no-scrollbar">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-background-secondary/50">
                  <tr>
                    {['Student', 'Interaction', 'Timestamp'].map(h => (
                      <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-secondary">
                  {chatMessages
                    .filter(chat => (chat.user_email?.toLowerCase() || '').includes(chatSearchQuery.toLowerCase()) || 
                                    (chat.message?.toLowerCase() || '').includes(chatSearchQuery.toLowerCase()) ||
                                    (chat.response?.toLowerCase() || '').includes(chatSearchQuery.toLowerCase()))
                    .map((chat) => (
                    <tr key={chat.id} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={(`https://ui-avatars.com/api/?name=${encodeURIComponent(users.find(u => u.id === chat.user_id)?.full_name || 'U')}&background=181811&color=ffffff&bold=true`) || undefined} className="size-12 rounded-2xl border border-neon-border shadow-sm" alt="" />
                          <div>
                            <p className="text-base font-black text-primary transition-colors font-display">{users.find(u => u.id === chat.user_id)?.full_name || 'Learner'}</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{chat.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 space-y-4 max-w-xl">
                        <div className="p-5 bg-background-secondary border border-neon-border rounded-2xl">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Student Q:</p>
                          <p className="text-sm italic text-secondary-text font-medium leading-relaxed">"{chat.message}"</p>
                        </div>
                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">AI Tutor A:</p>
                          <p className="text-sm text-secondary-text font-medium leading-relaxed line-clamp-3">{chat.response}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-[11px] text-primary uppercase font-black tracking-widest">{new Date(chat.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {chatMessages.length === 0 && (
                    <tr><td colSpan={3} className="py-32 text-center text-secondary-text/80 italic font-medium">No AI chat logs recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-10 border-b border-neon-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-background-secondary/30">
              <div>
                <h3 className="text-2xl font-black font-display">User Activity Log</h3>
                <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Real-time audit of every login and registration</p>
              </div>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary-text/80 text-lg">search</span>
                  <input 
                    type="text"
                    placeholder="Search activity..."
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-card border border-neon-border rounded-2xl text-sm text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  />
                </div>
                <button onClick={fetchData} className="size-14 rounded-2xl hover:bg-background-secondary flex items-center justify-center text-secondary-text/80 shrink-0 transition-colors border border-neon-border">
                  <span className={`material-symbols-outlined text-2xl ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[500px] no-scrollbar">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-background-secondary/50">
                  <tr>
                    {['Learner', 'Event', 'User ID', 'Timestamp'].map(h => (
                      <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-secondary">
                  {activityLogs
                    .filter(log => 
                      (log.email?.toLowerCase() || '').includes(activitySearchQuery.toLowerCase()) ||
                      (log.full_name?.toLowerCase() || '').includes(activitySearchQuery.toLowerCase()) ||
                      (log.activity_type?.toLowerCase() || '').includes(activitySearchQuery.toLowerCase())
                    )
                    .map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => {
                        const user = users.find(u => u.id === log.user_id);
                        if (user) setSelectedUser(user);
                      }}
                      className="hover:bg-primary/5 transition-colors cursor-pointer group"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={(`https://ui-avatars.com/api/?name=${encodeURIComponent(log.full_name)}&background=181811&color=ffffff&bold=true`) || undefined} className="size-12 rounded-2xl border border-neon-border shadow-sm" alt="" />
                          <div>
                            <p className="text-base font-black text-primary transition-colors font-display">{log.full_name}</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{log.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-full ${log.activity_type === 'REGISTER' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                          {log.activity_type}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-[10px] text-primary font-mono">
                        {log.user_id.slice(0, 8)}...
                      </td>
                      <td className="px-10 py-6 text-[11px] text-primary uppercase font-black tracking-widest">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {activityLogs.length === 0 && (
                    <tr><td colSpan={4} className="py-32 text-center text-secondary-text/80 italic font-medium">No activity logs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-10 border-b border-neon-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-background-secondary/30">
              <div>
                <h3 className="text-2xl font-black font-display">Sales Ledger</h3>
                <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Audit Trail: Every cloud enrollment processed</p>
              </div>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary-text/80 text-lg">search</span>
                  <input 
                    type="text"
                    placeholder="Search sales..."
                    value={enrollmentSearchQuery}
                    onChange={(e) => setEnrollmentSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-card border border-neon-border rounded-2xl text-sm text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  />
                </div>
                <button onClick={fetchData} className="size-14 rounded-2xl hover:bg-background-secondary flex items-center justify-center text-secondary-text/80 shrink-0 transition-colors border border-neon-border">
                  <span className={`material-symbols-outlined text-2xl ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[500px] no-scrollbar">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-background-secondary/50">
                  <tr>
                    {['Reference', 'Student', 'Course', 'Payment How', 'Date'].map(h => (
                      <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-secondary">
                  {enrollments
                    .filter(e => {
                      const user = users.find(u => u.id === e.user_id);
                      const course = courses.find(c => c.id === e.course_id);
                      return ((user?.full_name?.toLowerCase() || '').includes(enrollmentSearchQuery.toLowerCase()) || 
                              (user?.email?.toLowerCase() || '').includes(enrollmentSearchQuery.toLowerCase()) ||
                              (course?.title?.toLowerCase() || '').includes(enrollmentSearchQuery.toLowerCase()) ||
                              (e.order_id?.toLowerCase() || '').includes(enrollmentSearchQuery.toLowerCase()));
                    })
                    .map((e) => (
                    <tr key={e.id} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                      <td className="px-10 py-6 text-sm font-black text-primary font-display">#{e.order_id || 'PRO'}</td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={(`https://ui-avatars.com/api/?name=${encodeURIComponent(users.find(u => u.id === e.user_id)?.full_name || 'U')}&background=181811&color=ffffff&bold=true`) || undefined} className="size-12 rounded-2xl border border-neon-border shadow-sm" alt="" />
                          <div>
                            <p className="text-base font-black text-primary transition-colors font-display">{users.find(u => u.id === e.user_id)?.full_name || 'Student'}</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{users.find(u => u.id === e.user_id)?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-base font-black text-primary font-display truncate max-w-[200px]">{courses.find(c => c.id === e.course_id)?.title || 'Archived'}</td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-full border ${e.payment_method === 'UPI' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background-secondary text-secondary-text border-neon-border'}`}>
                          {e.payment_method || 'CARD'}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-[11px] text-primary uppercase font-black tracking-widest">{new Date(e.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-10 border-b border-neon-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-background-secondary/30">
              <div>
                <h3 className="text-2xl font-black font-display">Feedback Hub</h3>
                <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Audit student reviews and platform sentiment</p>
              </div>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary-text/80 text-lg">search</span>
                  <input 
                    type="text"
                    placeholder="Search feedback..."
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-card border border-neon-border rounded-2xl text-sm text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  />
                </div>
                <button onClick={fetchData} className="size-14 rounded-2xl hover:bg-background-secondary flex items-center justify-center text-secondary-text/80 shrink-0 transition-colors border border-neon-border">
                  <span className={`material-symbols-outlined text-2xl ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[500px] no-scrollbar">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-background-secondary/50">
                  <tr>
                    {['Reviewer', 'Rating', 'Comment', 'Moderation'].map(h => (
                      <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-secondary">
                  {reviews
                    .filter(r => (r.user_name?.toLowerCase() || '').includes(reviewSearchQuery.toLowerCase()) || 
                                (r.comment?.toLowerCase() || '').includes(reviewSearchQuery.toLowerCase()))
                    .map((r) => (
                    <tr key={r.id} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={(`https://ui-avatars.com/api/?name=${encodeURIComponent(r.user_name)}&background=181811&color=ffffff&bold=true`) || undefined} className="size-12 rounded-2xl border border-neon-border shadow-sm" alt="" />
                          <span className="text-base font-black text-primary transition-colors font-display">{r.user_name}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-amber-500">
                        <div className="flex">{Array.from({length: 5}).map((_, i) => <span key={i} className={`material-symbols-outlined text-sm ${i < r.rating ? 'fill-1' : ''}`}>star</span>)}</div>
                      </td>
                      <td className="px-10 py-6 text-sm text-secondary-text font-medium italic leading-relaxed max-w-md">"{r.comment}"</td>
                      <td className="px-10 py-6">
                         <button onClick={() => handleDeleteReview(r.id)} className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                           <span className="material-symbols-outlined text-xl">delete</span>
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'courses' && (
          <div className="bg-card rounded-[48px] border border-neon-border shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="p-10 border-b border-neon-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-background-secondary/30">
              <div>
                <h3 className="text-2xl font-black font-display">Course Catalog Management</h3>
                <p className="text-[10px] text-secondary-text font-black uppercase tracking-[0.3em] mt-2">Manage cloud-hosted learning tracks</p>
              </div>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary-text/80 text-lg">search</span>
                  <input 
                    type="text"
                    placeholder="Search tracks..."
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-card border border-neon-border rounded-2xl text-sm text-primary focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Bulk Curriculum Tools */}
            <div className="px-10 py-6 bg-background-secondary/50 border-b border-neon-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-text">Bulk Curriculum Tools</p>
                  <p className="text-[8px] text-secondary-text/80 font-bold uppercase tracking-widest mt-0.5">Automated track generation for cloud infrastructure</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  setConfirmDialog({
                    message: "This will add default lessons to all courses that currently have none. Continue?",
                    onConfirm: async () => {
                      const coursesToUpdate = courses.filter(c => !c.lessons || c.lessons.length === 0);
                      if (coursesToUpdate.length === 0) {
                        showNotification("All courses already have lessons.", "error");
                        setConfirmDialog(null);
                        return;
                      }
                      
                      try {
                        for (const course of coursesToUpdate) {
                          const publicVideos = [
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
                          ];
                          const defaultLessons = [
                            { id: `${course.id}-default-1`, title: "Introduction to " + course.title, duration: "10:00", videoUrl: publicVideos[0], module: "" },
                            { id: `${course.id}-default-2`, title: "Core Concepts & Fundamentals", duration: "15:00", videoUrl: publicVideos[1], module: "" },
                            { id: `${course.id}-default-3`, title: "Advanced Implementation", duration: "20:00", videoUrl: publicVideos[2], module: "" },
                            { id: `${course.id}-default-4`, title: "Practical Workshop", duration: "25:00", videoUrl: publicVideos[3], module: "" },
                            { id: `${course.id}-default-5`, title: "Course Summary & Next Steps", duration: "12:00", videoUrl: publicVideos[4], module: "" }
                          ];
                          await supabase.from('courses').update({ lessons: defaultLessons }).eq('id', course.id);
                        }
                        showNotification(`Successfully generated curriculum for ${coursesToUpdate.length} courses.`, "success");
                        setTimeout(() => window.location.reload(), 2000);
                      } catch (err) {
                        console.error("Error in bulk curriculum generation:", err);
                        showNotification("An error occurred during bulk generation.", "error");
                      } finally {
                        setConfirmDialog(null);
                      }
                    }
                  });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Auto-generate Missing Curriculums
              </button>
            </div>

            <div className="overflow-x-auto min-h-[500px] no-scrollbar">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-background-secondary/50">
                  <tr>
                    {['Track Detail', 'Category', 'Lessons', 'Price', 'Instructor', 'Actions'].map(h => (
                      <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-secondary">
                  {courses
                    .filter(c => (c.title?.toLowerCase() || '').includes(courseSearchQuery.toLowerCase()) || 
                                (c.description?.toLowerCase() || '').includes(courseSearchQuery.toLowerCase()) ||
                                (c.instructor?.toLowerCase() || '').includes(courseSearchQuery.toLowerCase()))
                    .map((course) => (
                    <tr key={course.id} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={course.imageUrl || undefined} className="size-16 rounded-2xl object-cover border border-neon-border shadow-sm group-hover:scale-105 transition-transform" alt="" />
                          <div className="max-w-xs">
                            <p className="text-base font-black text-primary transition-colors font-display line-clamp-1">{course.title}</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest line-clamp-1">{course.duration}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full border border-primary/20 tracking-widest">
                          {course.category}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-primary">video_library</span>
                          <span className="text-sm font-black text-white">{course.lessons?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-base font-black text-primary font-display">${course.price}</td>
                      <td className="px-10 py-6 text-sm text-primary font-bold">{course.instructor}</td>
                      <td className="px-10 py-6">
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedCourseForLessons(course); }}
                            className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all border border-primary/20"
                            title="Manage Curriculum"
                          >
                            <span className="material-symbols-outlined text-xl">video_library</span>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingCourseId(course.id); setIsAddingTrack(true); }} 
                            className="size-12 rounded-2xl bg-background-secondary flex items-center justify-center hover:bg-primary hover:text-black transition-all border border-neon-border"
                            title="Edit Track Details"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                            className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            title="Delete Track"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && renderSettings()}
        {isAddingTrack && (
          <AddTrackModal 
            editingCourseId={editingCourseId} 
            courses={courses} 
            setCourses={setCourses} 
            onClose={() => { setIsAddingTrack(false); setEditingCourseId(null); }} 
            showNotification={showNotification}
          />
        )}

        {/* Confirmation Dialog */}
        <AnimatePresence>
          {confirmDialog && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-background-dark/80 backdrop-blur-md animate-in fade-in duration-300">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card w-full max-w-md rounded-[40px] shadow-2xl p-10 border border-neon-border text-center"
              >
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
                  <span className="material-symbols-outlined text-4xl text-primary">help</span>
                </div>
                <h3 className="text-2xl font-black font-display mb-4">Are you sure?</h3>
                <p className="text-secondary-text text-sm font-medium mb-10 leading-relaxed">{confirmDialog.message}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setConfirmDialog(null)}
                    className="flex-1 py-4 bg-background-secondary text-secondary-text font-black rounded-2xl hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDialog.onConfirm}
                    className="flex-1 py-4 bg-primary text-black font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all text-xs uppercase tracking-widest"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
    </div>
  );
};

export default AdminPage;
