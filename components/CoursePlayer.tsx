import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnrolledCourse, Lesson } from '../types';

interface CoursePlayerProps {
  course: EnrolledCourse;
  currentProgress: number;
  onClose: () => void;
  onUpdateProgress: (newProgress: number) => Promise<void>;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, currentProgress, onClose, onUpdateProgress }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(course.lessons?.[0] || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoUrl = activeLesson?.videoUrl || course.videoUrl;
  const isDirectVideo = videoUrl?.match(/\.(mp4|webm|ogg|mov)$/i) || videoUrl?.includes('storage.googleapis.com') || videoUrl?.includes('vjs.zencdn.net');

  // Reset video error when lesson changes
  React.useEffect(() => {
    setVideoError(false);
  }, [activeLesson]);

  const handleLessonComplete = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const lessonsCount = course.lessons?.length || 1;
      const progressPerLesson = 100 / lessonsCount;
      const newProgress = Math.min(100, Math.round(currentProgress + progressPerLesson));
      await onUpdateProgress(newProgress);

      // Auto-advance to next lesson if available
      if (course.lessons) {
        const currentIndex = course.lessons.findIndex(l => l.id === activeLesson?.id);
        if (currentIndex !== -1 && currentIndex < course.lessons.length - 1) {
          setActiveLesson(course.lessons[currentIndex + 1]);
        }
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-background-dark flex flex-col md:flex-row overflow-hidden"
    >
      {/* Sidebar - Lessons List */}
      <div className="w-full md:w-80 lg:w-96 bg-background-secondary border-r border-neon-border flex flex-col h-1/3 md:h-full shrink-0">
        <div className="p-6 border-b border-neon-border flex justify-between items-center bg-background-main/50">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight line-clamp-1">{course.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgress}%` }}
                  className="h-full bg-primary shadow-[0_0_10px_rgba(230,255,0,0.5)]"
                />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{currentProgress}%</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden size-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
          {course.lessons?.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => setActiveLesson(lesson)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left group ${
                activeLesson?.id === lesson.id 
                  ? 'bg-primary text-black shadow-[0_0_20px_rgba(230,255,0,0.2)]' 
                  : 'hover:bg-white/5 text-secondary-text'
              }`}
            >
              <div className={`size-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${
                activeLesson?.id === lesson.id ? 'bg-black text-primary' : 'bg-white/10 text-white'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${activeLesson?.id === lesson.id ? 'text-black' : 'text-white'}`}>
                  {lesson.title}
                </p>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${
                  activeLesson?.id === lesson.id ? 'text-black/60' : 'text-secondary-text'
                }`}>
                  {lesson.duration}
                </p>
              </div>
              {activeLesson?.id === lesson.id && (
                <span className="material-symbols-outlined text-black animate-pulse">play_circle</span>
              )}
            </button>
          ))}
          {(!course.lessons || course.lessons.length === 0) && (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-white/20 mb-2">video_library</span>
              <p className="text-sm text-secondary-text font-medium">No lessons available for this track yet.</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neon-border bg-background-main/50 hidden md:block">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Learning
          </button>
        </div>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 bg-background-main flex flex-col relative">
        <button 
          onClick={onClose}
          className="hidden md:flex absolute top-8 right-8 z-10 size-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 items-center justify-center text-white hover:bg-primary hover:text-black transition-all group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">close</span>
        </button>

        <div className="flex-1 flex flex-col p-4 md:p-12 lg:p-20">
          <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
            {/* Video Container */}
            <div className="relative aspect-video w-full bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/5 group">
              {videoUrl && !videoError ? (
                isDirectVideo ? (
                  <video 
                    key={videoUrl}
                    src={videoUrl || undefined} 
                    controls 
                    className="w-full h-full object-contain"
                    autoPlay
                    onError={() => setVideoError(true)}
                  />
                ) : (
                  <iframe
                    key={videoUrl}
                    src={videoUrl || undefined}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    onError={() => setVideoError(true)}
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-zinc-900">
                  <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl text-primary">error_outline</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Video Playback Error</h3>
                  <p className="text-secondary-text max-w-md mx-auto font-medium">
                    The video content for this lesson could not be loaded. This might be due to an invalid URL or network issues.
                  </p>
                  <button 
                    onClick={() => setVideoError(false)}
                    className="mt-6 px-8 py-3 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
                  >
                    Retry Loading
                  </button>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div className="mt-8 md:mt-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                    Now Playing
                  </span>
                  <span className="text-[10px] font-black text-secondary-text uppercase tracking-widest">
                    Lesson {course.lessons?.findIndex(l => l.id === activeLesson?.id) + 1 || 1} of {course.lessons?.length || 1}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {activeLesson?.title || course.title}
                </h1>
                <p className="text-secondary-text mt-4 text-lg font-medium max-w-2xl leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="shrink-0 flex flex-col gap-4">
                <button 
                  onClick={handleLessonComplete}
                  disabled={isUpdating || currentProgress >= 100}
                  className="px-8 py-5 bg-primary text-black font-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(230,255,0,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isUpdating ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined">check_circle</span>
                  )}
                  {currentProgress >= 100 ? 'Course Completed' : 'Mark Lesson Complete'}
                </button>
                
                <div className="flex items-center justify-center gap-6">
                  <button className="text-secondary-text hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-lg">description</span>
                    Resources
                  </button>
                  <button className="text-secondary-text hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-lg">forum</span>
                    Discussion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoursePlayer;
