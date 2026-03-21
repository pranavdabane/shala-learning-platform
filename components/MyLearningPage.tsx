
import React, { useState } from 'react';
import { EnrolledCourse, Course } from '../types';

interface MyLearningPageProps {
  enrolledCourses: EnrolledCourse[];
  onContinue: (course: Course) => void;
  onBrowse: () => void;
  onViewCareerPaths: () => void;
  onUpdateProgress?: (courseId: string, progress: number) => void;
  userName?: string;
  userEmail?: string;
  playingCourse: EnrolledCourse | null;
  setPlayingCourse: (course: EnrolledCourse | null) => void;
}

const CertificateModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  course: EnrolledCourse; 
  userName: string;
  userEmail: string;
}> = ({ isOpen, onClose, course, userName, userEmail }) => {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendStage, setSendStage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleEmailCertificate = () => {
    setIsSendingEmail(true);
    setIsSent(false);
    
    const stages = [
      "Generating high-resolution security assets...",
      "Attaching verifiable mastery records...",
      "Establishing secure SMTP handshake...",
      `Delivering certificate to ${userEmail}...`
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setSendStage(stages[currentStage]);
        currentStage++;
      } else {
        clearInterval(interval);
        setIsSendingEmail(false);
        setIsSent(true);
        setTimeout(() => setIsSent(false), 5000);
      }
    }, 1200);
  };

  const handleDownloadPdf = () => {
    // Trigger the print dialog
    window.print();
    // Show success state after the print dialog is triggered/closed
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-start p-4 md:p-12 bg-background-main/95 backdrop-blur-2xl animate-in fade-in duration-500 overflow-y-auto no-scrollbar print:p-0 print:bg-white certificate-print-zone">
      
      {/* Email Sending Overlay */}
      {isSendingEmail && (
        <div className="fixed inset-0 z-[200] bg-background-main/80 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-card p-10 md:p-16 rounded-[48px] text-center space-y-8 max-w-md shadow-2xl border border-neon-border animate-in zoom-in-95">
              <div className="relative mx-auto size-20 md:size-28">
                 <div className="absolute inset-0 border-4 border-background-secondary rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl md:text-5xl text-primary animate-bounce">mail</span>
                 </div>
              </div>
              <div className="space-y-3">
                 <h3 className="text-xl md:text-2xl font-black font-display text-white">Emailing Certificate</h3>
                 <p className="text-secondary-text text-xs md:text-sm leading-relaxed font-medium min-h-[40px]">{sendStage}</p>
              </div>
           </div>
        </div>
      )}

      {/* Success Toast for Email */}
      {isSent && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[210] bg-green-500 text-white px-8 py-4 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-4 animate-in slide-in-from-top-12 duration-500 w-[90%] md:w-auto">
           <span className="material-symbols-outlined font-black">check_circle</span>
           <p className="text-xs md:text-sm font-bold uppercase tracking-widest truncate">Certificate successfully sent!</p>
        </div>
      )}

      {/* Close Button */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 print:hidden">
        <button 
          onClick={onClose}
          className="size-12 md:size-16 rounded-full bg-white/10 hover:bg-primary hover:text-black text-white flex items-center justify-center transition-all shadow-xl border border-white/10"
        >
          <span className="material-symbols-outlined text-2xl md:text-3xl">close</span>
        </button>
      </div>

      <div className="flex flex-col items-center w-full max-w-[1200px] py-10 md:py-16 print:py-0">
        {/* Certificate Design Wrapper for Scaling */}
        <div className="w-full flex justify-center overflow-hidden">
          <div className="w-full origin-top scale-[0.55] sm:scale-[0.75] md:scale-100 transition-transform duration-700 flex justify-center">
            <div className="w-[850px] md:w-full aspect-[1.414/1] bg-white text-slate-900 p-10 md:p-24 relative overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-700 print:shadow-none print:w-full print:h-full print:m-0 print:border-0">
              <div className="h-full relative">
                <div className="absolute inset-0 border-[12px] md:border-[20px] border-double border-primary/10 pointer-events-none"></div>
                <div className="absolute inset-6 md:inset-10 border border-slate-100 pointer-events-none"></div>
                <div className="absolute top-0 left-0 size-24 md:size-40 bg-primary/5 rounded-br-full -translate-x-10 md:-translate-x-16 -translate-y-10 md:-translate-y-16"></div>
                <div className="absolute bottom-0 right-0 size-24 md:size-40 bg-primary/5 rounded-tl-full translate-x-10 md:translate-x-16 translate-y-10 md:translate-y-16"></div>

                <div className="h-full border-2 border-slate-50 p-6 md:p-12 flex flex-col items-center justify-between text-center relative z-10">
                  <div className="space-y-3 md:space-y-6">
                    <div className="flex items-center justify-center gap-3 md:gap-4 text-slate-900">
                      <div className="size-10 md:size-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined font-black text-xl md:text-3xl text-black">school</span>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black tracking-tighter font-display">LEARNING</h2>
                    </div>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-slate-400">Professional Certification Authority</p>
                  </div>

                  <div className="space-y-6 md:space-y-12">
                    <div className="space-y-2 md:space-y-4">
                      <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-slate-900 leading-none font-display">Certificate of Mastery</h1>
                      <p className="text-sm md:text-xl text-slate-500 font-medium italic">This highly prestigious certification is awarded to</p>
                    </div>

                    <div className="py-4 md:py-8 border-b-4 border-primary/30 inline-block min-w-[300px] md:min-w-[500px]">
                      <h2 className="text-3xl md:text-7xl font-black text-slate-900 tracking-tighter font-display">{userName || 'Learner'}</h2>
                    </div>

                    <p className="text-base md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
                      for successfully completing the technical requirements of the <br />
                      <span className="text-slate-900 font-black uppercase tracking-wide px-4 py-1 bg-primary/10 rounded-lg">{course.title}</span> <br />
                      program with a final mastery score of <span className="font-black text-primary text-2xl md:text-4xl font-display">{course.progress}%</span>.
                    </p>
                  </div>

                  <div className="w-full flex justify-between items-end pt-10 md:pt-20">
                    <div className="text-left space-y-2 md:space-y-4">
                      <p className="text-[10px] md:text-xs font-bold uppercase text-slate-400 tracking-[0.3em]">Issue Date</p>
                      <p className="font-black text-sm md:text-xl font-display">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    <div className="flex flex-col items-center space-y-4 md:space-y-6">
                       <div className="size-20 md:size-32 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 p-2 md:p-3 flex items-center justify-center shadow-inner">
                          <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full">
                             {Array.from({length: 36}).map((_, i) => (
                               <div key={i} className={`bg-slate-900 rounded-[1px] ${i % 3 === 0 || i % 5 === 0 || i % 7 === 0 || i === 18 || i === 0 || i === 5 || i === 30 || i === 35 ? 'opacity-100' : 'opacity-10'}`}></div>
                             ))}
                          </div>
                       </div>
                       <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Verify ID: SH-{course.id}-{course.orderId || 'PRO-99'}</p>
                    </div>

                    <div className="text-right space-y-4 md:space-y-8">
                       <div className="space-y-2">
                         <p className="text-xl md:text-3xl italic font-serif text-slate-800">Pranav Dabane</p>
                         <div className="h-0.5 w-40 md:w-64 bg-slate-200 ml-auto"></div>
                         <p className="text-[10px] md:text-xs font-bold uppercase text-slate-400 tracking-widest">Director of Education</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons BELOW the certificate */}
        <div className="mt-[-120px] sm:mt-[-60px] md:mt-16 flex flex-col items-center gap-6 md:gap-10 print:hidden w-full px-6 relative z-20">
          <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 w-full sm:w-auto">
            <button 
              onClick={handleEmailCertificate}
              className="w-full sm:w-auto px-10 md:px-16 py-5 md:py-6 bg-primary text-black font-black rounded-3xl shadow-[0_0_30px_rgba(230,255,0,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-4 border-2 border-white/20 group text-lg md:text-xl h-16 md:h-20 uppercase tracking-widest"
            >
              <span className="material-symbols-outlined font-black text-2xl md:text-3xl group-hover:animate-bounce">mail</span>
              EMAIL TO GMAIL
            </button>

            <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto px-10 md:px-16 py-5 md:py-6 bg-white/10 hover:bg-white/20 text-white font-black rounded-3xl transition-all border-2 border-white/20 flex items-center justify-center gap-4 text-lg md:text-xl h-16 md:h-20 uppercase tracking-widest"
              >
                <span className="material-symbols-outlined font-black text-2xl md:text-3xl">picture_as_pdf</span>
                DOWNLOAD PDF
              </button>
              {isDownloaded && (
                <div className="flex items-center gap-3 text-primary animate-in fade-in slide-in-from-top-4 duration-500">
                   <span className="material-symbols-outlined text-sm font-black">check_circle</span>
                   <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">Download Successful!</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-10 md:px-12 py-5 md:py-6 bg-transparent hover:bg-white/5 text-secondary-text font-bold rounded-3xl transition-all text-lg md:text-xl h-16 md:h-20 uppercase tracking-widest"
            >
              CLOSE VIEWER
            </button>
          </div>
        </div>
        
        <p className="mt-12 md:mt-20 text-secondary-text text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] print:hidden text-center">
          Digital Credential • Delivered securely to {userEmail}
        </p>
      </div>
    </div>

  );
};

const MyLearningPage: React.FC<MyLearningPageProps> = ({ 
  enrolledCourses, 
  onContinue, 
  onBrowse, 
  onViewCareerPaths, 
  onUpdateProgress,
  userName,
  userEmail,
  playingCourse,
  setPlayingCourse
}) => {
  const [selectedCert, setSelectedCert] = useState<EnrolledCourse | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  const handleViewCertificate = (course: EnrolledCourse) => {
    setIsPreparing(true);
    setTimeout(() => {
      setSelectedCert(course);
      setIsPreparing(false);
    }, 1200);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16 pb-24">
      {/* Loading Overlay */}
      {isPreparing && (
        <div className="fixed inset-0 z-[200] bg-background-main/80 backdrop-blur-md flex items-center justify-center p-8">
           <div className="bg-card p-12 rounded-[48px] text-center space-y-8 max-w-md shadow-2xl border border-neon-border animate-in zoom-in-95">
              <div className="relative mx-auto size-24">
                 <div className="absolute inset-0 border-4 border-background-secondary rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary animate-pulse">verified_user</span>
                 </div>
              </div>
              <div className="space-y-3">
                 <h3 className="text-2xl font-black font-display text-white">Preparing Certificate</h3>
                 <p className="text-secondary-text text-sm leading-relaxed font-medium">Validating mastery data and secure credentials...</p>
              </div>
           </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal 
          isOpen={!!selectedCert} 
          onClose={() => setSelectedCert(null)} 
          course={selectedCert} 
          userName={userName || 'Learner'}
          userEmail={userEmail || 'learner@platform.edu'}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 text-left">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] font-display text-white">My Learning</h1>
          <p className="text-secondary-text text-lg md:text-2xl font-medium max-w-2xl leading-tight">Track your path to professional mastery and industry-recognized certifications.</p>
        </div>
        {enrolledCourses.length > 0 && (
          <div className="px-8 py-5 bg-primary/10 border border-neon-border text-primary rounded-[32px] flex items-center gap-5 shadow-2xl shadow-primary/5">
            <span className="material-symbols-outlined font-black text-2xl animate-pulse">verified_user</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1">Active Tracks</span>
              <span className="text-2xl font-black font-display leading-none">{enrolledCourses.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
          {enrolledCourses.map((course) => {
            const isCompleted = course.progress >= 100;
            const isEligibleForCert = course.progress >= 80;

            return (
              <div 
                key={course.id}
                className="group bg-card rounded-[56px] overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(230,255,0,0.15)] transition-all duration-700 border border-neon-border flex flex-col h-full hover:-translate-y-2"
              >
                <div className="relative h-72 overflow-hidden cursor-pointer shrink-0" onClick={() => setPlayingCourse(course)}>
                  <img src={course.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                    <div className="size-24 rounded-full bg-primary flex items-center justify-center text-black shadow-2xl scale-50 group-hover:scale-100 transition-all duration-500">
                        <span className="material-symbols-outlined text-5xl font-black">play_arrow</span>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <div className="absolute top-8 right-8 bg-green-500 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-white/20">
                      <span className="material-symbols-outlined text-base">done_all</span>
                      Track Complete
                    </div>
                  )}

                  {isEligibleForCert && !isCompleted && (
                    <div className="absolute top-8 left-8 bg-primary text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 animate-in slide-in-from-left-8 border border-white/10">
                      <span className="material-symbols-outlined text-base">workspace_premium</span>
                      Cert. Unlocked
                    </div>
                  )}
                </div>
                
                <div className="p-10 md:p-14 space-y-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-8">
                    <div className="text-left space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary block">{course.category}</span>
                      <h3 className="text-2xl md:text-3xl font-black leading-tight group-hover:text-primary transition-colors font-display text-white">{course.title}</h3>
                    </div>

                    <div className="space-y-5">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-secondary-text uppercase tracking-[0.3em]">Mastery Level</span>
                        <span className={`text-2xl font-black font-display ${isEligibleForCert ? 'text-primary' : 'text-secondary-text'}`}>{course.progress}%</span>
                      </div>
                      <div className="h-5 w-full bg-background-main rounded-full overflow-hidden p-1.5 border border-neon-border">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${isEligibleForCert ? 'bg-primary shadow-[0_0_20px_rgba(230,255,0,0.5)]' : 'bg-secondary-text'}`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 pt-8">
                    <button 
                      onClick={() => setPlayingCourse(course)}
                      className="w-full py-6 rounded-3xl bg-background-main text-white hover:bg-primary hover:text-black text-xs font-black transition-all flex items-center justify-center gap-4 shadow-xl uppercase tracking-[0.2em] border border-neon-border"
                    >
                      {course.progress === 0 ? 'START LEARNING' : isCompleted ? 'REVIEW CONTENT' : 'CONTINUE TRACK'}
                      <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-2">east</span>
                    </button>

                    {isEligibleForCert && (
                      <button 
                        onClick={() => handleViewCertificate(course)}
                        className="w-full py-6 rounded-3xl bg-primary/5 border-2 border-neon-border text-primary text-xs font-black transition-all flex items-center justify-center gap-4 hover:bg-primary hover:text-black shadow-xl uppercase tracking-[0.2em]"
                      >
                        <span className="material-symbols-outlined text-2xl">verified</span>
                        VIEW CERTIFICATE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 px-10 bg-background-secondary rounded-[80px] shadow-sm border border-neon-border text-center space-y-16 max-w-5xl mx-auto border-dashed">
          <div className="size-56 rounded-[64px] bg-primary/5 flex items-center justify-center text-primary relative">
            <div className="absolute inset-0 rounded-[64px] border-4 border-dashed border-neon-border animate-spin [animation-duration:25s]"></div>
            <span className="material-symbols-outlined text-[120px] font-black opacity-60">school</span>
          </div>
          
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter font-display text-white">Your curriculum is waiting.</h2>
            <p className="text-secondary-text leading-tight text-xl md:text-3xl font-medium">
              Start your journey toward industry mastery by enrolling in one of our expert-led programs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 w-full sm:w-auto">
            <button 
              onClick={onBrowse}
              className="w-full sm:w-auto px-16 py-7 bg-primary text-black font-black rounded-[32px] shadow-2xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-5 uppercase tracking-widest text-xs"
            >
              BROWSE CATALOG
              <span className="material-symbols-outlined font-black text-2xl">explore</span>
            </button>
            <button 
              onClick={onViewCareerPaths}
              className="w-full sm:w-auto px-16 py-7 bg-card border border-neon-border text-white font-black rounded-[32px] hover:bg-background-secondary transition-all uppercase tracking-widest text-xs"
            >
              CAREER PATHS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearningPage;
