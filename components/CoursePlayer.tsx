
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { getLessonTakeaways } from '../services/gemini';

interface CoursePlayerProps {
  course: Course;
  currentProgress: number;
  onClose: () => void;
  onUpdateProgress: (newProgress: number) => void;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, currentProgress, onClose, onUpdateProgress }) => {
  const defaultLessons = [
    { id: 1, title: "Introduction & Fundamentals", duration: "12:40" },
    { id: 2, title: "Core Architecture & Design", duration: "18:20" },
    { id: 3, title: "Advanced Technical Implementation", duration: "24:15" },
    { id: 4, title: "Industry Best Practices", duration: "15:50" },
    { id: 5, title: "Final Project & Synthesis", duration: "32:10" }
  ];

  const lessons = course.lessons || defaultLessons;

  const initialLessonIndex = Math.min(Math.floor(currentProgress / (100 / lessons.length)), lessons.length - 1);
  const [activeLessonIndex, setActiveLessonIndex] = useState(initialLessonIndex);
  const [takeaways, setTakeaways] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerateTakeaways = async () => {
    setIsGenerating(true);
    try {
      const data = await getLessonTakeaways(course.title, lessons[activeLessonIndex].title);
      setTakeaways(data || 'Takeaways unavailable.');
    } catch (e) {
      setTakeaways('Could not generate AI takeaways.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteLesson = () => {
    const progressPerLesson = 100 / lessons.length;
    const nextProgress = Math.min(currentProgress + progressPerLesson, 100);
    onUpdateProgress(nextProgress);
    if (activeLessonIndex < lessons.length - 1) {
      setActiveLessonIndex(prev => prev + 1);
      setTakeaways(''); // Reset for next lesson
    }
  };

  const activeLesson = lessons[activeLessonIndex];
  const activeVideoUrl = activeLesson.videoUrl || course.videoUrl;

  return (
    <div className="fixed inset-0 z-[160] bg-background-main flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 md:px-10 py-4 md:py-6 border-b border-neon-border bg-card/50 backdrop-blur-xl gap-6">
        <div className="flex items-center gap-4 md:gap-6 text-left w-full sm:w-auto">
          <button onClick={onClose} className="size-10 md:size-12 rounded-full bg-background-main hover:bg-primary hover:text-black flex items-center justify-center transition-all text-white shrink-0 border border-neon-border">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div className="min-w-0">
            <h2 className="text-white font-black tracking-tight line-clamp-1 text-base md:text-xl font-display">{course.title}</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Mastery Session</span>
              <span className="size-1 bg-neon-border rounded-full"></span>
              <span className="text-[10px] text-secondary-text font-bold uppercase tracking-widest">Lesson {activeLesson.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8 w-full sm:w-auto">
          <div className="flex items-center gap-3 md:gap-4 bg-background-main px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-neon-border shadow-inner">
            <span className={`material-symbols-outlined text-sm md:text-base ${isTimerRunning ? 'text-primary animate-pulse' : 'text-secondary-text'}`}>timer</span>
            <span className="text-xs md:text-sm font-black text-white tabular-nums tracking-widest">{formatTime(timer)}</span>
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="size-6 md:size-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm md:text-base">{isTimerRunning ? 'pause' : 'play_arrow'}</span>
            </button>
          </div>
          <button 
            onClick={handleCompleteLesson}
            disabled={currentProgress >= (activeLesson.id * (100 / lessons.length))}
            className="px-6 md:px-10 py-3 md:py-4 bg-primary text-black text-xs md:text-sm font-black rounded-2xl hover:shadow-[0_0_20px_rgba(230,255,0,0.4)] transition-all disabled:opacity-50 flex items-center gap-2 md:gap-3 uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm md:text-base">check_circle</span>
            {currentProgress >= (activeLesson.id * (100 / lessons.length)) ? 'COMPLETED' : 'COMPLETE'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-[3] bg-black relative flex flex-col lg:flex-row items-center justify-center overflow-y-auto lg:overflow-hidden no-scrollbar">
          <div className="w-full h-auto lg:h-full aspect-video lg:aspect-auto">
            {activeVideoUrl ? (
              <video key={activeLesson.id} src={activeVideoUrl} className="w-full h-full object-contain" controls autoPlay />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6 bg-background-main">
                <div className="size-24 md:size-32 rounded-full bg-card flex items-center justify-center text-secondary-text animate-pulse border border-neon-border">
                  <span className="material-symbols-outlined text-6xl md:text-8xl">play_circle_filled</span>
                </div>
                <p className="text-secondary-text font-bold text-sm md:text-lg uppercase tracking-widest">Video stream unavailable.</p>
              </div>
            )}
          </div>
          
          <div className="w-full lg:absolute lg:top-12 lg:right-12 lg:w-80 p-6 md:p-8 bg-card/60 lg:backdrop-blur-2xl lg:rounded-[32px] border-y lg:border border-neon-border space-y-4 md:space-y-6 transition-all text-left z-20 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em]">AI Takeaways</h4>
              <button 
                onClick={handleGenerateTakeaways}
                disabled={isGenerating}
                className="size-8 md:size-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all disabled:opacity-50 shadow-lg"
              >
                <span className={`material-symbols-outlined text-xl ${isGenerating ? 'animate-spin' : ''}`}>auto_awesome</span>
              </button>
            </div>
            
            <div className="min-h-[80px] lg:min-h-[120px] flex items-center justify-center">
              {isGenerating ? (
                <div className="flex gap-3">
                  <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              ) : takeaways ? (
                <div className="text-xs md:text-sm text-secondary-text leading-relaxed font-medium whitespace-pre-wrap">
                  {takeaways}
                </div>
              ) : (
                <p className="text-[10px] md:text-xs text-secondary-text italic text-center leading-relaxed">Click the spark to generate key lesson insights using AI.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-card border-l border-neon-border flex flex-col overflow-hidden text-left">
          <div className="p-8 border-b border-neon-border bg-background-main/20">
             <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] font-display">Curriculum</h3>
             <p className="text-secondary-text text-[10px] font-bold mt-1 uppercase tracking-widest">{lessons.length} VIDEO LESSONS • {course.duration}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {lessons.map((lesson, index) => {
              const progressPerLesson = 100 / lessons.length;
              const isCompleted = currentProgress >= (lesson.id * progressPerLesson);
              const isActive = activeLessonIndex === index;
              const isLocked = !isCompleted && !isActive && (index > 0 && currentProgress < (lessons[index].id - 1) * progressPerLesson);

              return (
                <div key={lesson.id} onClick={() => !isLocked && setActiveLessonIndex(index)} className={`p-5 rounded-3xl flex items-center gap-5 cursor-pointer transition-all border-2 ${isActive ? 'bg-primary/10 border-primary/40 text-primary' : isLocked ? 'opacity-40 cursor-not-allowed border-transparent' : 'hover:bg-white/5 border-transparent text-secondary-text'}`}>
                  <div className={`size-12 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 transition-all ${isCompleted ? 'bg-green-500/20 text-green-500' : isActive ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-background-main border border-neon-border'}`}>
                    {isCompleted ? <span className="material-symbols-outlined text-xl">done</span> : isLocked ? <span className="material-symbols-outlined text-xl">lock</span> : lesson.id}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={`text-sm font-bold truncate font-display ${isActive ? 'text-primary' : 'text-white'}`}>{lesson.title}</p>
                    <p className="text-[10px] font-bold opacity-60 uppercase mt-1 tracking-widest">{lesson.duration} • VIDEO</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
