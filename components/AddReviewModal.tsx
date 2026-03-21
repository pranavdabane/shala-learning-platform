
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (review: { name: string; text: string; rating: number; courseId?: string }) => void;
  courseId?: string;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ isOpen, onClose, onSuccess, courseId }) => {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || '');
  const [courses, setCourses] = useState<{id: string, title: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen && !courseId) {
      // Fetch courses for selection
      supabase.from('courses').select('id, title').then(({ data }) => {
        if (data) setCourses(data);
      });
    }
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Save to Supabase
      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_name: name,
          comment: text,
          rating: rating,
          user_id: session?.user?.id || null,
          course_id: selectedCourseId || null,
          user_role: 'Verified Graduate',
          user_img: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f2f20d&color=181811&bold=true`
        }]);

      if (error) throw error;

      onSuccess({ name, text, rating, courseId: selectedCourseId });
      setName('');
      setText('');
      setRating(5);
      setSelectedCourseId(courseId || '');
      onClose();
    } catch (err) {
      console.error("Error saving review:", err);
      alert("Failed to save review to cloud. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 space-y-8 border border-neon-border">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black tracking-tight text-white">Post Review</h2>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text">Your Experience</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`size-10 rounded-xl flex items-center justify-center transition-all border ${
                    star <= rating ? 'bg-primary text-black border-primary scale-110 shadow-[0_0_15px_rgba(230,255,0,0.3)]' : 'bg-background-main border-neon-border text-secondary-text'
                  }`}
                >
                  <span className={`material-symbols-outlined ${star <= rating ? 'fill-1' : ''}`}>star</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background-main border border-neon-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary text-white outline-none"
              placeholder="e.g. David Smith"
            />
          </div>

          {!courseId && courses.length > 0 && (
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text">Select Course (Optional)</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-background-main border border-neon-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary text-white outline-none appearance-none"
              >
                <option value="">General Platform Review</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text">Detailed Feedback</label>
            <textarea
              required
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-background-main border border-neon-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary resize-none text-white outline-none"
              placeholder="What did you love about the course?"
            />
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full py-4 bg-primary text-black font-black rounded-3xl shadow-[0_0_20px_rgba(230,255,0,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "SUBMIT REVIEW"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;
