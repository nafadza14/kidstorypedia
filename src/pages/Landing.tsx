import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  Compass, 
  ArrowUpRight, 
  Check, 
  ChevronRight, 
  Star, 
  Heart, 
  Layers,
  Volume2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Landing() {
  const { t, language, dir } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-black/40 text-white selection:bg-white selection:text-black overflow-x-hidden font-body">
      {/* 1. FULL-SCREEN BACKGROUND IMAGE */}
      <img
        src="https://i.imgur.com/bpuBPTG.png"
        alt="Kidstorypedia Background"
        className="fixed inset-0 z-0 w-full h-full object-cover object-center pointer-events-none"
      />
      {/* Cinematic translucent overlay for crisp text legibility */}
      <div className="fixed inset-0 z-[1] bg-black/25 backdrop-blur-[0.5px] pointer-events-none" />
      <div className="fixed inset-0 z-[1] bg-gradient-to-t from-black/45 via-black/15 to-black/30 pointer-events-none" />

      {/* 2. NAVBAR (Fixed, z-index: 50) */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center border-b border-white/10 bg-black/20 backdrop-blur-md">
        {/* Logo (left) */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="font-heading text-[21px] sm:text-[26px] tracking-tight text-white transition-opacity group-hover:opacity-80">
            {language === 'ar' ? 'كيدستوريبيديا®' : 'Kidstorypedia®'}
          </span>
          <span className="text-[25px] sm:text-[30px] text-white select-none -tracking-widest">
            ✳︎
          </span>
        </Link>

        {/* Desktop Nav Links (center, hidden below md) */}
        <nav className="hidden md:flex items-center text-[20px] lg:text-[23px] text-white">
          <a href="#top-stories" className="hover:opacity-60 transition-opacity">
            {language === 'ar' ? 'أفضل القصص' : 'Top Stories'}
          </a>
          <span className="mx-2 select-none opacity-40">,</span>
          <a href="#features" className="hover:opacity-60 transition-opacity">
            {t('nav.features')}
          </a>
          <span className="mx-2 select-none opacity-40">,</span>
          <a href="#how-it-works" className="hover:opacity-60 transition-opacity">
            {language === 'ar' ? 'طريقة العمل' : 'How it Works'}
          </a>
          <span className="mx-2 select-none opacity-40">,</span>
          <a href="#library" className="hover:opacity-60 transition-opacity">
            {language === 'ar' ? 'المكتبة' : 'Library'}
          </a>
          <span className="mx-2 select-none opacity-40">,</span>
          <a href="#values" className="hover:opacity-60 transition-opacity">
            {language === 'ar' ? 'القيم الأخلاقية' : 'Values'}
          </a>
        </nav>

        {/* Desktop CTA & Language (right) */}
        <div className="flex items-center gap-5 sm:gap-6">
          <LanguageSwitcher />

          <Link
            to="/dashboard"
            className="hidden md:inline-block text-[20px] lg:text-[23px] text-white underline underline-offset-4 hover:opacity-60 transition-opacity"
          >
            {t('nav.getStarted')}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2 focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            <span className={`w-6 h-[2px] bg-white transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-[2px] bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-[2px] bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-8 flex flex-col gap-6 md:hidden"
          >
            <a 
              href="#top-stories" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl text-white font-medium hover:opacity-70 border-b border-white/10 pb-4"
            >
              {language === 'ar' ? 'أفضل القصص' : 'Top Stories'}
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl text-white font-medium hover:opacity-70 border-b border-white/10 pb-4"
            >
              {t('nav.features')}
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl text-white font-medium hover:opacity-70 border-b border-white/10 pb-4"
            >
              {language === 'ar' ? 'طريقة العمل' : 'How it Works'}
            </a>
            <a 
              href="#library" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl text-white font-medium hover:opacity-70 border-b border-white/10 pb-4"
            >
              {language === 'ar' ? 'المكتبة' : 'Library'}
            </a>
            <a 
              href="#values" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl text-white font-medium hover:opacity-70 border-b border-white/10 pb-4"
            >
              {language === 'ar' ? 'القيم الأخلاقية' : 'Values'}
            </a>
            <div className="pt-4 flex flex-col gap-4">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-4 bg-white text-black font-semibold rounded-full text-lg"
              >
                {t('landing.btnParent')}
              </Link>
              <Link
                to="/child"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-4 border border-white/30 text-white font-semibold rounded-full text-lg"
              >
                {t('landing.btnChild')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT WRAPPER */}
      <main className="relative z-10">

        {/* SECTION 1: HERO (Full-Screen Architectural Presence) */}
        <section className="min-h-screen pt-28 sm:pt-36 pb-16 px-5 sm:px-8 max-w-7xl mx-auto flex flex-col justify-between">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
            {/* Left Column: Bold Editorial Typography */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md mb-6 text-xs sm:text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{t('landing.badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05] mb-6">
                {t('landing.title1')}{" "}
                <span className="font-heading font-medium underline decoration-white/40 decoration-2 underline-offset-8">
                  {t('landing.title2')}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-zinc-300 font-light max-w-xl leading-relaxed mb-10">
                {t('landing.subtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link
                  to="/dashboard"
                  className="px-8 py-4 rounded-full bg-white text-black font-medium text-base sm:text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl group cursor-pointer"
                >
                  <span>{t('landing.btnParent')}</span>
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <Link
                  to="/child"
                  className="px-8 py-4 rounded-full border border-white/40 text-white font-medium text-base sm:text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer"
                >
                  <span>{t('landing.btnChild')}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Left empty so the background image is unobstructed and fully visible */}
            <div className="hidden lg:block lg:col-span-5" />
          </div>

          {/* Bottom Bar: Agency Ticker */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <span>Global Islamic Parenting</span>
              <span className="opacity-40">•</span>
              <span>Authentic Storytelling</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
              <span>Digital Prophetic Storytelling Experience</span>
            </div>

            <div className="flex items-center gap-2">
              <span>Kidstorypedia • Character Building</span>
            </div>
          </div>
        </section>


        {/* SECTION: TOP STORIES THIS WEEK (Ranked #1 to #5) */}
        <section id="top-stories" className="py-20 px-5 sm:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs text-zinc-400 font-mono tracking-wider">
                  Top Stories This Week
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
                {language === 'ar' ? 'أفضل القصص هذا الأسبوع' : 'Top Stories This Week'}
              </h2>
            </div>
            <p className="text-zinc-400 max-w-md text-sm sm:text-base">
              {language === 'ar'
                ? 'القصص الأكثر إلهاماً وقراءة من قبل الأطفال والعائلات عبر منصة كيدستوريبيديا.'
                : 'The most popular prophetic journeys and character tales cherished by children and families.'}
            </p>
          </div>

          {/* 1-5 Ranking Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {[
              {
                rank: "#1",
                title: language === 'ar' ? "النبي يوسف: الرؤيا الجميلة" : "Prophet Yusuf: The Beautiful Dream",
                category: "Prophets",
                reads: "14.2k reads",
                img: "https://i.pinimg.com/1200x/9f/55/b3/9f55b3e96b743a4338b7ea1a402eb116.jpg",
                duration: "10 mins",
                link: "/story/yusuf-1"
              },
              {
                rank: "#2",
                title: language === 'ar' ? "النبي نوح وسفينة الإيمان" : "Prophet Nuh: The Great Ark",
                category: "Prophets",
                reads: "11.8k reads",
                img: "https://i.pinimg.com/1200x/81/fd/82/81fd82e8f9ed031af9059eb4ba075a57.jpg",
                duration: "15 mins",
                link: "/story/nuh-1"
              },
              {
                rank: "#3",
                title: language === 'ar' ? "النبي موسى ومعجزة البحر" : "Prophet Musa & The Parted Sea",
                category: "Prophets",
                reads: "9.5k reads",
                img: "https://i.pinimg.com/1200x/dc/e8/f8/dce8f883cdb7b14bf56c8b50146e0635.jpg",
                duration: "12 mins",
                link: "/child"
              },
              {
                rank: "#4",
                title: language === 'ar' ? "امتنان النملة الصغيرة" : "The Little Ant's Gratitude",
                category: "Fables",
                reads: "8.3k reads",
                img: "https://i.pinimg.com/736x/d6/1a/f0/d61af053cea489174a12c21c68f59d9f.jpg",
                duration: "5 mins",
                link: "/story/fable-1"
              },
              {
                rank: "#5",
                title: language === 'ar' ? "بلال بن رباح: صوت الإيمان" : "Bilal ibn Rabah: Voice of Truth",
                category: "Sahabah",
                reads: "7.9k reads",
                img: "https://i.pinimg.com/736x/c5/17/78/c5177848b0ba4b241bf487e1a254dc1e.jpg",
                duration: "11 mins",
                link: "/child"
              }
            ].map((story, idx) => (
              <Link
                key={idx}
                to={story.link}
                className="group relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/30 aspect-[3/4] flex flex-col justify-between p-5 hover:border-white/40 transition-all shadow-xl cursor-pointer"
              >
                {/* Background Image */}
                <img
                  src={story.img}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale-[15%] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/60 group-hover:via-black/20 transition-colors" />

                {/* Top Badge: Rank & Top Stories This Week */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black font-mono font-bold text-xs shadow-md">
                    <span>{story.rank}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15">
                    {story.duration}
                  </span>
                </div>

                {/* Bottom Info */}
                <div className="relative z-10">
                  <span className="text-[10px] text-zinc-300 font-mono block mb-1">
                    {story.category} • {story.reads}
                  </span>
                  <h3 className="text-base font-heading font-medium text-white group-hover:translate-x-1 transition-transform leading-snug line-clamp-2">
                    {story.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>


        {/* SECTION 2: WHY CHOOSE ODK / CORE VALUES (Agency Grid) */}
        <section id="features" className="py-24 px-5 sm:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs text-zinc-400 font-mono mb-3 block">
                [ 01 / Core Pillars ]
              </span>
              <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
                {t('landing.whyChoose')}
              </h2>
            </div>
            <p className="text-zinc-400 max-w-md text-sm sm:text-base">
              {language === 'ar'
                ? 'نجمع بين أصالة الحكاية الإسلامية وأحدث تقنيات التعليم الرقمي التفاعلي لغرس الأخلاق النبوية.'
                : 'Combining the purity of prophetic narratives with human-centered digital experiences for effortless akhlak formation.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-zinc-950/25 border border-white/10 backdrop-blur-md hover:border-white/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl border border-white/20 flex items-center justify-center text-white mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-heading text-white mb-3">
                {t('landing.feat1.title')}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {t('landing.feat1.desc')}
              </p>
              <div className="text-xs text-zinc-500 font-medium">
                25 Prophets • Seerah • Sahabah
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-zinc-950/25 border border-white/10 backdrop-blur-md hover:border-white/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl border border-white/20 flex items-center justify-center text-white mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-heading text-white mb-3">
                {t('landing.feat2.title')}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {t('landing.feat2.desc')}
              </p>
              <div className="text-xs text-zinc-500 font-medium">
                12 Essential Core Values • Continuous Tracking
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-zinc-950/25 border border-white/10 backdrop-blur-md hover:border-white/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl border border-white/20 flex items-center justify-center text-white mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-heading text-white mb-3">
                {t('landing.feat3.title')}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {t('landing.feat3.desc')}
              </p>
              <div className="text-xs text-zinc-500 font-medium">
                100% Ad-Free • Scholar Reviewed
              </div>
            </div>
          </div>
        </section>


        {/* SECTION 3: HOW IT WORKS (Architectural Editorial Steps) */}
        <section id="how-it-works" className="py-24 px-5 sm:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="mb-16">
            <span className="text-xs text-zinc-400 font-mono mb-3 block">
              [ 02 / Story Method ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
              {t('landing.howItWorks.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-t border-white/20 pt-6">
              <div className="text-3xl font-heading text-zinc-500 mb-4">01</div>
              <h3 className="text-xl font-heading text-white mb-2">
                {t('landing.howItWorks.step1.title')}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t('landing.howItWorks.step1.desc')}
              </p>
            </div>

            <div className="border-t border-white/20 pt-6">
              <div className="text-3xl font-heading text-zinc-500 mb-4">02</div>
              <h3 className="text-xl font-heading text-white mb-2">
                {t('landing.howItWorks.step2.title')}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t('landing.howItWorks.step2.desc')}
              </p>
            </div>

            <div className="border-t border-white/20 pt-6">
              <div className="text-3xl font-heading text-zinc-500 mb-4">03</div>
              <h3 className="text-xl font-heading text-white mb-2">
                {t('landing.howItWorks.step3.title')}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t('landing.howItWorks.step3.desc')}
              </p>
            </div>
          </div>
        </section>


        {/* SECTION 4: CURATED LIBRARY (Using Pinterest Images) */}
        <section id="library" className="py-24 px-5 sm:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs text-zinc-400 font-mono mb-3 block">
                [ 03 / Curated Story Archive ]
              </span>
              <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
                {t('landing.categories.title')}
              </h2>
            </div>
            <Link
              to="/child"
              className="text-white hover:opacity-70 transition-opacity underline underline-offset-4 text-base inline-flex items-center gap-2"
            >
              <span>{language === 'ar' ? 'عرض جميع القصص' : 'Browse full library'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: t('landing.categories.prophets'),
                category: "Prophets",
                img: "https://i.pinimg.com/736x/be/74/0d/be740d1e2f35213a7e62c23efe925559.jpg",
                count: "25 Prophet Stories"
              },
              {
                title: t('landing.categories.seerah'),
                category: "Seerah",
                img: "https://i.pinimg.com/736x/04/b7/64/04b764ea22946c9db33fdb4b988406d2.jpg",
                count: "18 Seerah Chapters"
              },
              {
                title: t('landing.categories.sahabah'),
                category: "Sahabah",
                img: "https://i.pinimg.com/736x/6a/e6/4b/6ae64bac898eb4b059f11719bff9b370.jpg",
                count: "30 Sahabah Lives"
              },
              {
                title: t('landing.categories.fables'),
                category: "Fables",
                img: "https://i.pinimg.com/736x/76/95/53/769553386bbce26d7b369921f7d41c04.jpg",
                count: "15 Wisdom Fables"
              }
            ].map((cat, idx) => (
              <Link
                key={idx}
                to="/child"
                className="group relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/30 aspect-[3/4] flex flex-col justify-end p-6 hover:border-white/40 transition-all"
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="relative z-10">
                  <span className="text-[11px] text-zinc-300 font-mono">
                    {cat.count}
                  </span>
                  <h3 className="text-xl font-heading text-white mt-1 group-hover:translate-x-1 transition-transform">
                    {cat.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>


        {/* SECTION 5: CHARACTER TRACKING & 12 CORE VALUES */}
        <section id="values" className="py-24 px-5 sm:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <span className="text-xs text-zinc-400 font-mono mb-3 block">
                [ 04 / Character Growth ]
              </span>
              <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight mb-6">
                {t('landing.tracking.title')}
              </h2>
              <p className="text-zinc-300 leading-relaxed mb-8 text-base sm:text-lg">
                {t('landing.tracking.desc')}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: language === 'ar' ? 'الصدق (Honesty)' : 'Shidq (Honesty)', val: '92%' },
                  { name: language === 'ar' ? 'الصبر (Patience)' : 'Sabr (Patience)', val: '88%' },
                  { name: language === 'ar' ? 'الشكر (Gratitude)' : 'Shukr (Gratitude)', val: '95%' },
                  { name: language === 'ar' ? 'الأمانة (Trust)' : 'Amanah (Trustworthiness)', val: '85%' },
                  { name: language === 'ar' ? 'الشجاعة (Courage)' : 'Shaja\'ah (Courage)', val: '90%' },
                  { name: language === 'ar' ? 'التواضع (Humility)' : 'Tawadhu (Humility)', val: '82%' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-zinc-950/25 border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-xs text-zinc-400 mb-2">
                      <span>{item.name}</span>
                      <span className="font-mono text-white">{item.val}</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full" 
                        style={{ width: item.val }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="rounded-3xl border border-white/15 overflow-hidden bg-zinc-950/35 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                      ✳︎
                    </div>
                    <div>
                      <h4 className="text-sm font-heading text-white">Ahmad's Character Journal</h4>
                      <p className="text-xs text-zinc-400">Weekly Milestone with Parents</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-zinc-200 border border-white/20">
                    Active Mentorship
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-black/25 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {language === 'ar' ? 'قصة صبر النبي يوسف' : 'Prophet Yusuf: The Gift of Patience'}
                        </div>
                        <div className="text-xs text-zinc-400">Read together with Ummi • 15 min reflection</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-300">+50 Character Points</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/25 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {language === 'ar' ? 'النملة الشاكرة' : "The Grateful Ant's Reflection"}
                        </div>
                        <div className="text-xs text-zinc-400">Self-reflection completed</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-300">+35 Character Points</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Parent & child discussion guide included</span>
                  <Link
                    to="/dashboard"
                    className="text-xs text-white underline underline-offset-4 hover:opacity-70"
                  >
                    Open Parent Portal →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* SECTION 6: TESTIMONIALS (Minimalist Editorial Quotes) */}
        <section className="py-24 px-5 sm:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="mb-16">
            <span className="text-xs text-zinc-400 font-mono mb-3 block">
              [ 05 / Parent Reflections ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
              {t('landing.testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-zinc-950/25 border border-white/10 backdrop-blur-md">
              <p className="text-xl sm:text-2xl font-light text-zinc-200 leading-snug mb-8">
                "{t('landing.testimonials.t1.quote')}"
              </p>
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-heading text-white">{t('landing.testimonials.t1.author')}</span>
                <span className="text-xs text-zinc-500 font-mono">Jakarta, ID</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-950/25 border border-white/10 backdrop-blur-md">
              <p className="text-xl sm:text-2xl font-light text-zinc-200 leading-snug mb-8">
                "{t('landing.testimonials.t2.quote')}"
              </p>
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-heading text-white">{t('landing.testimonials.t2.author')}</span>
                <span className="text-xs text-zinc-500 font-mono">London, UK</span>
              </div>
            </div>
          </div>
        </section>


        {/* SECTION 7: FINAL CALL TO ACTION */}
        <section className="py-28 px-5 sm:px-8 max-w-7xl mx-auto border-t border-white/10 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs text-zinc-400 font-mono mb-4 inline-block">
              [ 06 / Begin Reading ]
            </span>
            <h2 className="text-4xl sm:text-6xl font-light text-white tracking-tight leading-tight mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-lg text-zinc-300 mb-10 max-w-xl mx-auto">
              {t('landing.cta.desc')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black font-medium text-lg hover:bg-zinc-200 transition-all shadow-2xl cursor-pointer"
              >
                {t('landing.btnParent')}
              </Link>
              <Link
                to="/child"
                className="w-full sm:w-auto px-10 py-5 rounded-full border border-white/40 text-white font-medium text-lg hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer"
              >
                {t('landing.btnChild')}
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-5 sm:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-zinc-400 font-body">
        <div className="flex items-center gap-3">
          <span className="font-heading text-white text-base">Kidstorypedia®</span>
          <span className="opacity-40">•</span>
          <span>Yayasan Omah Dongeng Kalasan</span>
        </div>

        <div>
          © 2025 Kidstorypedia. An initiative supported by Yayasan Omah Dongeng Kalasan. All rights reserved.
        </div>

        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-white transition-colors">{t('nav.features')}</a>
          <a href="#library" className="hover:text-white transition-colors">{language === 'ar' ? 'المكتبة' : 'Library'}</a>
          <Link to="/dashboard" className="hover:text-white transition-colors">Portal</Link>
        </div>
      </footer>
    </div>
  );
}
