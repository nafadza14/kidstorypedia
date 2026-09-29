import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star, Play, Award, BookOpen, ArrowLeft, ArrowUpRight } from "lucide-react";
import { MOCK_CHILD, MOCK_STORIES, StoryCategory } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ChildHome() {
  const { t, language } = useLanguage();
  const child = MOCK_CHILD;
  const [activeCategory, setActiveCategory] = useState<StoryCategory | "All">("All");

  const categories: (StoryCategory | "All")[] = ["All", "Prophets", "Seerah", "Sahabah", "Fables"];

  const filteredStories = activeCategory === "All" 
    ? MOCK_STORIES 
    : MOCK_STORIES.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-body selection:bg-white selection:text-black">
      {/* Top Bar */}
      <header className="px-6 py-6 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/50 transition-all cursor-pointer"
              title="Return to Parent Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-full border border-white/15">
              <img src={child.avatar} alt={child.name} className="w-8 h-8 rounded-full bg-zinc-800 border border-white/20" />
              <div>
                <h2 className="font-heading font-medium text-sm text-white">{t('child.greeting', { name: child.name })}</h2>
                <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-mono">
                  <span className="text-amber-300">★</span>
                  <span>{t('child.points', { points: 120 })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/40 transition-all"
            >
              <span>{t('dashboard.title')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Story Hero Card */}
        <section className="mb-14">
          <div className="rounded-3xl border border-white/15 bg-zinc-900/70 backdrop-blur-xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono text-zinc-300 bg-white/5 border border-white/15 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {t('child.continue')}
              </span>
              <h1 className="text-3xl sm:text-5xl font-heading font-medium text-white mb-4 leading-tight">
                {language === 'ar' ? (MOCK_STORIES[0].titleAr || MOCK_STORIES[0].title) : MOCK_STORIES[0].title}
              </h1>
              <p className="text-zinc-300 text-base sm:text-lg mb-8 leading-relaxed max-w-lg">
                {language === 'ar' ? (MOCK_STORIES[0].descriptionAr || MOCK_STORIES[0].description) : MOCK_STORIES[0].description}
              </p>
              
              <Link 
                to={`/story/${MOCK_STORIES[0].id}`}
                className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium text-base hover:bg-zinc-200 transition-all shadow-xl cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t('child.readNow')}</span>
              </Link>
            </div>

            {/* Featured Image */}
            <div className="relative z-10 w-full md:w-80 lg:w-96 aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-2xl shrink-0">
              <img 
                src={MOCK_STORIES[0].coverImage} 
                alt="Prophet Yusuf" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs font-mono text-zinc-300">
                <span>{MOCK_STORIES[0].category}</span>
                <span>{MOCK_STORIES[0].durationMin} min read</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter Pills */}
        <section className="mb-10">
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat 
                    ? "bg-white text-black font-semibold shadow-md" 
                    : "bg-zinc-900/80 text-zinc-400 border border-white/10 hover:text-white hover:border-white/30"
                }`}
              >
                {t('cat.' + cat)}
              </button>
            ))}
          </div>
        </section>

        {/* Story Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={`/story/${story.id}`} className="block group">
                  <div className="rounded-3xl overflow-hidden bg-zinc-900/60 border border-white/10 hover:border-white/30 transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={story.coverImage} 
                        alt={story.title}
                        className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-zinc-300 border border-white/15">
                        {story.durationMin} {t('child.mins')}
                      </div>

                      <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {story.coreValues.map(val => (
                          <span key={val} className="text-[10px] font-mono text-zinc-300 bg-white/5 border border-white/15 px-2.5 py-0.5 rounded-full">
                            {t('val.' + val)}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-heading text-lg text-white mb-2 line-clamp-1 group-hover:text-zinc-200 transition-colors">
                        {language === 'ar' ? (story.titleAr || story.title) : story.title}
                      </h3>

                      <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                        {language === 'ar' ? (story.descriptionAr || story.description) : story.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
