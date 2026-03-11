
import React, { useState, useRef, useEffect } from 'react';
import { globalChat } from '../services/gemini';
import { supabase } from '../lib/supabase';

interface GeneralAITutorProps {
  onBack: () => void;
}

const GeneralAITutor: React.FC<GeneralAITutorProps> = ({ onBack }) => {
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMsg = message;
    setChatLog(prev => [...prev, { role: 'user', text: userMsg }]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await globalChat(userMsg);
      const aiResponse = response || 'I am sorry, I could not process that.';
      setChatLog(prev => [...prev, { role: 'ai', text: aiResponse }]);

      // Save to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('chat_history').insert([{
          user_id: session.user.id,
          user_email: session.user.email,
          message: userMsg,
          response: aiResponse,
          context: 'GLOBAL_TUTOR'
        }]);
      }
    } catch (e) {
      setChatLog(prev => [...prev, { role: 'ai', text: 'Error connecting to the AI core.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[85vh] md:h-[70vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden border border-neon-border">
      <div className="p-4 md:p-6 bg-background-main text-white flex justify-between items-center border-b border-neon-border">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg">
            <span className="material-symbols-outlined text-2xl md:text-3xl font-black">psychology</span>
          </div>
          <div className="text-left">
            <h2 className="text-lg md:text-xl font-black tracking-tight">Global AI Tutor</h2>
            <p className="text-[8px] md:text-[10px] text-primary uppercase font-bold tracking-[0.2em]">General Career & Mastery Assistant</p>
          </div>
        </div>
        <button onClick={onBack} className="size-8 md:size-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-xl md:text-2xl">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 no-scrollbar">
        <div className="flex gap-4 max-w-[80%]">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 border border-neon-border">
            <span className="material-symbols-outlined text-xl">smart_toy</span>
          </div>
          <div className="bg-background-main p-5 rounded-3xl rounded-tl-none text-sm leading-relaxed text-left border border-neon-border text-secondary-text">
            Hello! I am your global platform assistant. I can help you find the right course, provide career strategy, or explain complex technical concepts. What's on your mind today?
          </div>
        </div>

        {chatLog.map((chat, i) => (
          <div key={i} className={`flex gap-4 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {chat.role === 'ai' && (
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 border border-neon-border">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
              </div>
            )}
            <div className={`p-5 rounded-3xl text-sm leading-relaxed text-left max-w-[80%] ${
              chat.role === 'user' 
                ? 'bg-primary text-black rounded-tr-none font-bold shadow-lg' 
                : 'bg-background-main rounded-tl-none border border-neon-border text-secondary-text'
            }`}>
              {chat.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 animate-pulse border border-neon-border">
              <span className="material-symbols-outlined text-xl">psychology</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-4 bg-background-main rounded-3xl border border-neon-border">
              <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
              <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-8 border-t border-neon-border">
        <div className="relative">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me about your career path or a technical topic..."
            className="w-full bg-background-main border border-neon-border rounded-2xl pl-6 pr-16 py-5 text-sm focus:ring-2 focus:ring-primary shadow-inner text-white outline-none"
          />
          <button 
            type="submit"
            disabled={isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-12 bg-primary text-black rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined font-black">send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralAITutor;
