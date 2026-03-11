
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { getCourseInsights, chatWithTutor } from '../services/gemini';
import { supabase } from '../lib/supabase';

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

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(course.id === '');
  const [editedCourse, setEditedCourse] = useState<Course>(course);

  useEffect(() => {
    if (course.id) {
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
    }
  }, [course]);

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

  return (
    <div className="flex flex-col lg:flex-row gap-10 md:gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
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

        <div className="relative h-64 sm:h-80 md:h-[500px] rounded-[48px] md:rounded-[64px] overflow-hidden shadow-2xl border border-neon-border">
          <img src={isEditing ? editedCourse.imageUrl : course.imageUrl} className="w-full h-full object-cover" alt={course.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-8 md:p-16">
            <div className="space-y-4 md:space-y-6 w-full">
              {isEditing ? (
                <div className="space-y-4 bg-black/60 p-6 md:p-10 rounded-[32px] md:rounded-[48px] backdrop-blur-md border border-neon-border">
                  <input 
                    type="text"
                    value={editedCourse.title}
                    onChange={(e) => setEditedCourse({...editedCourse, title: e.target.value})}
                    className="w-full bg-white/5 border border-neon-border rounded-2xl px-6 py-4 text-white font-black text-2xl md:text-5xl focus:ring-2 focus:ring-primary outline-none font-display tracking-tighter"
                    placeholder="Course Title"
                  />
                  <input 
                    type="text"
                    value={editedCourse.imageUrl}
                    onChange={(e) => setEditedCourse({...editedCourse, imageUrl: e.target.value})}
                    className="w-full bg-white/5 border border-neon-border rounded-2xl px-6 py-3 text-white text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                    placeholder="Image URL"
                  />
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
                  value={(editedCourse as any)[stat.editKey]}
                  onChange={(e) => setEditedCourse({...editedCourse, [stat.editKey as string]: stat.type === 'number' ? parseFloat(e.target.value) : e.target.value})}
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
              value={editedCourse.description}
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
            className="w-full py-6 bg-primary text-black font-black rounded-[24px] shadow-2xl shadow-primary/20 hover:shadow-[0_0_20px_rgba(230,255,0,0.4)] active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
          >
            {isEnrolled ? "CONTINUE LEARNING" : "ENROLL NOW"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
