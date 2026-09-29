import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, X, Award, Check } from "lucide-react";
import { MOCK_STORIES, Story } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StoryReader() {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to find story in mock data, or use state passed from navigation
  const story = MOCK_STORIES.find(s => s.id === id) || (location.state?.story as Story);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  if (!story) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-8 font-body">
        <p className="text-xl text-zinc-400 mb-4">{t('reader.notFound')}</p>
        <Link to="/child" className="text-white underline underline-offset-4 hover:opacity-70">
          {t('reader.goBack')}
        </Link>
      </div>
    );
  }

  const handleNext = () => {
    if (currentPage < story.content.length - 1) {
      setCurrentPage(p => p + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] text-white flex flex-col font-body overflow-hidden selection:bg-white selection:text-black">
      {/* Top Navigation */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
        <button 
          onClick={() => navigate("/child")}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/15 cursor-pointer text-white"
          title="Close Reader"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar / Indicator Dots */}
        <div className="flex items-center gap-2">
          {story.content.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentPage 
                  ? "w-8 bg-white" 
                  : i < currentPage 
                    ? "w-3 bg-white/60" 
                    : "w-3 bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* Audio narration button */}
        <button 
          onClick={togglePlay}
          className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/15 cursor-pointer ${
            isPlaying ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
          }`}
          title="Toggle Narration"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Ambient Background with subtle Blur */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
              style={{ backgroundImage: `url(${story.content[currentPage].image})`, filter: "blur(50px)" }}
            />
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            
            <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center p-8 md:p-16 gap-10 md:gap-16 max-w-7xl mx-auto">
              {/* Image Container with high-end frame */}
              <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/15 relative group bg-zinc-900">
                <img 
                  src={story.content[currentPage].image} 
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-full object-cover transition-transform duration-[12s] ease-linear group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Page Index Badge */}
                <div className="absolute bottom-5 left-5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-zinc-300">
                  {language === 'ar' ? `الصفحة ${currentPage + 1} من ${story.content.length}` : `Page ${currentPage + 1} of ${story.content.length}`}
                </div>
              </div>

              {/* Text Container with architectural editorial typography */}
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <div className="mb-4 text-xs font-mono text-zinc-300">
                  {story.category} • {story.coreValues.map(v => t('val.' + v)).join(" • ")}
                </div>

                <p className="text-2xl md:text-3xl lg:text-4xl leading-relaxed md:leading-relaxed text-zinc-100 font-light drop-shadow-md">
                  {language === 'ar' 
                    ? (story.content[currentPage].textAr || story.content[currentPage].text) 
                    : story.content[currentPage].text}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <footer className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center z-50 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <button 
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="w-14 h-14 rounded-full bg-zinc-900/80 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/15 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-white"
          title="Previous Page"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-xs font-mono text-zinc-400">
          {language === 'ar' ? (story.titleAr || story.title) : story.title}
        </div>
        
        <button 
          onClick={handleNext}
          className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-all shadow-2xl cursor-pointer group"
          title={currentPage < story.content.length - 1 ? "Next Page" : "Finish Story"}
        >
          {currentPage < story.content.length - 1 ? (
            <ChevronRight className="w-7 h-7 transform group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <Check className="w-6 h-6" />
          )}
        </button>
      </footer>

      {/* Completion Modal Overlay */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 150 }}
              className="bg-zinc-900 border border-white/20 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center text-white shadow-2xl"
            >
              <div className="w-20 h-20 rounded-full border border-white/20 bg-white/5 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✳︎</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-heading font-medium mb-3 text-white">
                {t('reader.mashaAllah')}
              </h2>
              
              <p className="text-base text-zinc-300 mb-8 leading-relaxed">
                {t('reader.completed', { 
                  title: language === 'ar' ? (story.titleAr || story.title) : story.title,
                  values: story.coreValues.map(v => t('val.' + v)).join(" & ")
                })}
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  className="w-full py-4 rounded-full bg-white text-black font-medium text-base hover:bg-zinc-200 transition-all cursor-pointer shadow-lg" 
                  onClick={() => navigate("/child")}
                >
                  {t('reader.readAnother')}
                </button>
                <button 
                  className="w-full py-4 rounded-full border border-white/20 text-white font-medium text-base hover:bg-white/10 transition-all cursor-pointer" 
                  onClick={() => navigate("/dashboard")}
                >
                  {t('reader.tellUmmi')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
