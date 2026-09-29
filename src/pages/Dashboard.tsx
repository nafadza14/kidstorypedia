import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  User, 
  Settings, 
  BarChart2, 
  MessageSquare, 
  Award, 
  ChevronRight, 
  Loader2, 
  ArrowUpRight, 
  LogOut, 
  Check, 
  Plus, 
  Star, 
  Heart, 
  Clock, 
  ShieldCheck, 
  Download, 
  Printer, 
  Bell, 
  Volume2, 
  Lock, 
  Sparkles, 
  Filter,
  CheckCircle2,
  Calendar,
  Share2,
  Flame,
  HelpCircle,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_CHILD, MOCK_CHILDREN, MOCK_STORIES, Story, ChildProfile } from "@/data/mock";
import { generateStory } from "@/data/generateStory";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type DashboardNav = 'overview' | 'childProfiles' | 'discussion' | 'achievements' | 'settings';

export default function Dashboard() {
  const { t, language } = useLanguage();
  
  // Navigation & Active Child State
  const [activeNav, setActiveNav] = useState<DashboardNav>('overview');
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(MOCK_CHILDREN);
  const [activeChildId, setActiveChildId] = useState<string>(MOCK_CHILD.id);
  const activeChild = childrenList.find(c => c.id === activeChildId) || childrenList[0];

  // Story generation state
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [isGenerating, setIsGenerating] = useState(false);

  // Child Profiles State (Add Child Modal)
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState<number>(6);
  const [newChildAvatarSeed, setNewChildAvatarSeed] = useState("Kareem");
  const [newChildGoal, setNewChildGoal] = useState<number>(15);

  // Discussion Guides State
  const [discussionFilter, setDiscussionFilter] = useState<string>("All");
  const [discussedTopics, setDiscussedTopics] = useState<Record<string, boolean>>({
    "yusuf-envy": true,
    "fable-gratitude": true
  });
  const [discussionNotification, setDiscussionNotification] = useState<string | null>(null);

  // Settings State
  const [parentName, setParentName] = useState("Ummi Sarah");
  const [parentEmail, setParentEmail] = useState("sarah.family@example.com");
  const [audioNarration, setAudioNarration] = useState(true);
  const [arabicTashkeel, setArabicTashkeel] = useState(true);
  const [dailyScreenLimit, setDailyScreenLimit] = useState(30);
  const [bedtimeReminder, setBedtimeReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState("19:30");
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [pinProtection, setPinProtection] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Story Generator
  const handleGenerateStory = async () => {
    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        alert("GEMINI_API_KEY is not configured in Vercel or environment variables.");
        return;
      }
      const newStory = await generateStory(apiKey, language);
      setStories(prev => [newStory, ...prev]);
    } catch (error) {
      console.error("Failed to generate story:", error);
      alert("Failed to generate story. See console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Add Child Profile Handler
  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;

    const newProfile: ChildProfile = {
      id: `child-${Date.now()}`,
      name: newChildName.trim(),
      age: Number(newChildAge),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newChildAvatarSeed)}&backgroundColor=b6e3f4`,
      badges: ["First Steps"],
      completedStories: [],
      characterProgress: {
        Honesty: 50,
        Patience: 50,
        Gratitude: 50,
        Courage: 50,
        Generosity: 50
      }
    };

    setChildrenList(prev => [...prev, newProfile]);
    setActiveChildId(newProfile.id);
    setNewChildName("");
    setShowAddChildModal(false);
  };

  // Toggle Discussion Status
  const handleToggleDiscussion = (id: string, title: string) => {
    const isNowDone = !discussedTopics[id];
    setDiscussedTopics(prev => ({ ...prev, [id]: isNowDone }));
    if (isNowDone) {
      setDiscussionNotification(`+50 Character Points awarded to ${activeChild.name} for completing: ${title}`);
      setTimeout(() => setDiscussionNotification(null), 4000);
    }
  };

  // Save Settings Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3500);
  };

  // Print Certificate Handler
  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-white overflow-hidden font-body selection:bg-white selection:text-black">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-[#0e0e12] border-r border-white/10 hidden md:flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Logo */}
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="font-heading text-xl text-white tracking-tight">Kidstorypedia®</span>
              <span className="text-white text-xl select-none">✳︎</span>
            </Link>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full border border-white/15 text-zinc-300">
              Parent View
            </span>
          </div>
          
          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button 
              onClick={() => setActiveNav('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeNav === 'overview' 
                  ? "bg-white text-black font-semibold shadow-sm" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>{t('dashboard.overview')}</span>
            </button>

            <button 
              onClick={() => setActiveNav('childProfiles')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeNav === 'childProfiles' 
                  ? "bg-white text-black font-semibold shadow-sm" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('dashboard.childProfiles')}</span>
            </button>

            <button 
              onClick={() => setActiveNav('discussion')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeNav === 'discussion' 
                  ? "bg-white text-black font-semibold shadow-sm" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('dashboard.discussion')}</span>
            </button>

            <button 
              onClick={() => setActiveNav('achievements')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeNav === 'achievements' 
                  ? "bg-white text-black font-semibold shadow-sm" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{t('dashboard.achievements')}</span>
            </button>

            <button 
              onClick={() => setActiveNav('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeNav === 'settings' 
                  ? "bg-white text-black font-semibold shadow-sm" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t('dashboard.settings')}</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link 
            to="/child"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-all cursor-pointer"
          >
            <span>{t('dashboard.switchChild')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full border border-white/20 text-zinc-400 hover:text-white hover:border-white/40 text-xs transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'العودة للرئيسية' : 'Exit to Landing'}</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-10 flex flex-col justify-between">
        <div>
          {/* Top Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <div className="text-xs text-zinc-400 font-mono mb-1">
                [ Family Portal / {parentName} ] • {
                  activeNav === 'overview' ? 'Overview' :
                  activeNav === 'childProfiles' ? 'Child Profiles' :
                  activeNav === 'discussion' ? 'Discussion Guides' :
                  activeNav === 'achievements' ? 'Achievements & Certificates' : 'Parental Settings'
                }
              </div>
              <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight font-heading">
                {t('dashboard.greeting')}
              </h1>
              <p className="text-zinc-400 text-sm mt-1">{t('dashboard.subtitle', { name: activeChild.name })}</p>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />

              {/* Active Child Profile Pill Dropdown */}
              <div className="relative group">
                <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-1.5 rounded-full border border-white/10 cursor-pointer hover:border-white/30 transition-all">
                  <img src={activeChild.avatar} alt={activeChild.name} className="w-7 h-7 rounded-full bg-zinc-800 border border-white/20" />
                  <div className="text-left">
                    <span className="font-medium text-xs text-white block">{activeChild.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Age {activeChild.age} • Level 4</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 rotate-90" />
                </div>

                {/* Dropdown switch child */}
                <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-white/15 rounded-2xl p-2 shadow-2xl hidden group-hover:block z-50">
                  <div className="text-[10px] font-mono text-zinc-400 px-3 py-1 border-b border-white/10 mb-1">
                    SWITCH PROFILE
                  </div>
                  {childrenList.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveChildId(c.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                        c.id === activeChildId ? 'bg-white/15 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <img src={c.avatar} alt={c.name} className="w-5 h-5 rounded-full" />
                      <span>{c.name} ({c.age} yrs)</span>
                      {c.id === activeChildId && <Check className="w-3.5 h-3.5 ml-auto text-white" />}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setActiveNav('childProfiles');
                      setShowAddChildModal(true);
                    }}
                    className="w-full mt-1 pt-1 border-t border-white/10 flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Child</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Navigation Tabs */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-3.5 h-3.5" /> },
              { id: 'childProfiles', label: 'Children', icon: <User className="w-3.5 h-3.5" /> },
              { id: 'discussion', label: 'Discussion Guides', icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: 'achievements', label: 'Achievements', icon: <Award className="w-3.5 h-3.5" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveNav(tab.id as DashboardNav)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all ${
                  activeNav === tab.id ? 'bg-white text-black font-semibold' : 'bg-zinc-900 border border-white/10 text-zinc-400'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {discussionNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center gap-3 text-sm text-white"
              >
                <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                <span>{discussionNotification}</span>
              </motion.div>
            )}
            {settingsSavedToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-md flex items-center gap-3 text-sm text-zinc-200"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>All family preferences and parental controls have been saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* VIEW 1: OVERVIEW */}
          {/* ========================================================================= */}
          {activeNav === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono text-zinc-400">
                      {t('dashboard.stat.stories')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-light text-white tracking-tight">
                      {activeChild.completedStories.length > 0 ? activeChild.completedStories.length * 4 : 12}
                    </div>
                    <p className="text-xs text-zinc-300 mt-2 font-mono flex items-center gap-1">
                      <span>↑</span> {t('dashboard.stat.storiesSub')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono text-zinc-400">
                      {t('dashboard.stat.time')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-light text-white tracking-tight">2.5h</div>
                    <p className="text-xs text-zinc-300 mt-2 font-mono flex items-center gap-1">
                      <span>↑</span> {t('dashboard.stat.timeSub')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono text-zinc-400">
                      {t('dashboard.stat.badges')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-light text-white tracking-tight">{activeChild.badges.length}</div>
                    <p className="text-xs text-zinc-300 mt-2 font-mono flex items-center gap-1">
                      <span>★</span> Latest: {activeChild.badges[activeChild.badges.length - 1]}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Character Tracking & Featured Story */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Character Progress */}
                <Card className="col-span-1">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-heading">{t('dashboard.char.title')}</CardTitle>
                        <CardDescription>{t('dashboard.char.desc', { name: activeChild.name })}</CardDescription>
                      </div>
                      <span className="text-xs font-mono text-zinc-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        12 Core Values
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {Object.entries(activeChild.characterProgress).map(([value, progress]) => (
                      <div key={value}>
                        <div className="flex justify-between text-xs mb-1.5 font-mono">
                          <span className="text-zinc-200">{t('val.' + value)}</span>
                          <span className="text-zinc-400">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommended Story Card */}
                <Card className="col-span-1 flex flex-col justify-between">
                  <div>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <div>
                        <CardTitle className="text-lg font-heading">{t('dashboard.rec.title')}</CardTitle>
                        <CardDescription>{t('dashboard.rec.desc')}</CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleGenerateStory}
                        disabled={isGenerating}
                        className="gap-2 text-xs"
                      >
                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
                        {isGenerating ? t('dashboard.rec.generating') : t('dashboard.rec.generate')}
                      </Button>
                    </CardHeader>

                    <CardContent>
                      <div className="flex gap-4 items-center p-4 bg-black/40 rounded-2xl border border-white/10">
                        <img 
                          src={stories[0].coverImage} 
                          alt={language === 'ar' ? (stories[0].titleAr || stories[0].title) : stories[0].title}
                          className="w-24 h-24 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-mono text-zinc-300 block mb-1">
                            {stories[0].category}
                          </span>
                          <h4 className="font-heading text-base text-white truncate">
                            {language === 'ar' ? (stories[0].titleAr || stories[0].title) : stories[0].title}
                          </h4>
                          <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                            {language === 'ar' ? (stories[0].descriptionAr || stories[0].description) : stories[0].description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {stories[0].coreValues.map(v => (
                              <span key={v} className="text-[10px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-zinc-300 border border-white/10">
                                {t('val.' + v)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-6 pt-0">
                    <Button className="w-full text-sm font-medium" asChild>
                      <Link to={`/story/${stories[0].id}`} state={{ story: stories[0] }}>
                        {t('dashboard.rec.read')} →
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Recent Reading History */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">{t('dashboard.tab.history')}</CardTitle>
                  <CardDescription>Recently completed reading sessions for {activeChild.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stories.slice(0, 3).map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
                        <div className="flex items-center gap-3">
                          <img src={s.coverImage} className="w-10 h-10 rounded-lg object-cover" alt="" />
                          <div>
                            <div className="text-sm text-white font-medium">
                              {language === 'ar' ? (s.titleAr || s.title) : s.title}
                            </div>
                            <div className="text-xs text-zinc-500 font-mono">100% completed • Character reflection bonus awarded</div>
                          </div>
                        </div>
                        <Link 
                          to={`/story/${s.id}`} 
                          className="text-xs text-white underline underline-offset-4 hover:opacity-70"
                        >
                          Re-read
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: CHILD PROFILES */}
          {/* ========================================================================= */}
          {activeNav === 'childProfiles' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-light font-heading text-white">Family Child Profiles</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Manage individual reading journeys, age-adapted character goals, and custom avatars.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowAddChildModal(true)}
                  className="rounded-full bg-white text-black text-xs font-semibold px-5 py-2.5 hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Child Profile</span>
                </Button>
              </div>

              {/* Profiles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {childrenList.map((ch) => {
                  const isActive = ch.id === activeChildId;
                  return (
                    <div 
                      key={ch.id}
                      className={`rounded-3xl p-6 border transition-all relative flex flex-col justify-between ${
                        isActive 
                          ? 'bg-zinc-900/90 border-white/40 shadow-2xl' 
                          : 'bg-zinc-950/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        {/* Top row: Avatar & Status */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="relative">
                            <img src={ch.avatar} alt={ch.name} className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/20 shadow-lg" />
                            {isActive && (
                              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center">
                                <Check className="w-3 h-3 text-black font-bold" />
                              </span>
                            )}
                          </div>

                          <span className={`text-[11px] font-mono px-3 py-1 rounded-full border ${
                            isActive ? 'bg-white text-black font-semibold border-white' : 'bg-white/5 text-zinc-400 border-white/10'
                          }`}>
                            {isActive ? 'Active Learner' : 'Profile'}
                          </span>
                        </div>

                        {/* Name and Age */}
                        <h3 className="text-xl font-heading text-white font-medium">{ch.name}</h3>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">
                          Age {ch.age} • Stage {ch.age <= 6 ? 'Early Reader' : 'Junior Seeker'}
                        </p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-2xl bg-black/40 border border-white/5 text-xs font-mono">
                          <div>
                            <span className="text-zinc-500 block text-[10px]">STORIES READ</span>
                            <span className="text-white font-semibold">{ch.completedStories.length * 4 || 8} stories</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px]">BADGES WON</span>
                            <span className="text-white font-semibold">{ch.badges.length} badges</span>
                          </div>
                        </div>

                        {/* Values Summary */}
                        <div className="mt-4">
                          <span className="text-[10px] font-mono text-zinc-400 block mb-1.5">CORE TRAIT FOCUS</span>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(ch.characterProgress).slice(0, 3).map(([virtue, score]) => (
                              <span key={virtue} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                                {virtue} {score}%
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Action */}
                      <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                        {isActive ? (
                          <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Currently viewing
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveChildId(ch.id)}
                            className="text-xs text-white underline underline-offset-4 hover:opacity-80 cursor-pointer font-medium"
                          >
                            Switch to this child →
                          </button>
                        )}

                        <Link 
                          to="/child"
                          className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white hover:text-black transition-all text-xs font-medium cursor-pointer"
                        >
                          Open Kids View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: DISCUSSION GUIDES */}
          {/* ========================================================================= */}
          {activeNav === 'discussion' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-light font-heading text-white">Bedtime Discussion Guides</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Scholar-curated dialog prompts, practical moral activities, and daily family reflections.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {["All", "Patience", "Honesty", "Gratitude", "Courage"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDiscussionFilter(filter)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                        discussionFilter === filter 
                          ? 'bg-white text-black font-semibold' 
                          : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guides List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    id: "yusuf-envy",
                    title: "Prophet Yusuf: Overcoming Jealousy & Sibling Love",
                    virtue: "Patience",
                    ageGroup: "Ages 5-10",
                    readTime: "15 min discussion",
                    questions: [
                      "How did Yusuf choose to forgive his brothers even after they wronged him?",
                      "Have you ever felt jealous of a friend or sibling? What helps make your heart calm and happy?",
                      "What does Allah teach us about patience when things feel unfair?"
                    ],
                    actionPrompt: "The Secret Kindness: Do one loving act for a sibling or family member today without telling anyone.",
                    dua: "Rabbi ishrah li sadri wa yassir li amri (My Lord, expand for me my chest and ease my task)."
                  },
                  {
                    id: "nuh-courage",
                    title: "Prophet Nuh: Steadfastness When Standing Alone",
                    virtue: "Courage",
                    ageGroup: "Ages 6-12",
                    readTime: "12 min discussion",
                    questions: [
                      "Why was it brave for Prophet Nuh to keep building the ark even when people laughed?",
                      "What should we do if people around us are making fun of something good?",
                      "Who can we always call upon when we feel alone?"
                    ],
                    actionPrompt: "Moral Backbone Pledge: Practice saying 'I choose what pleases Allah' when faced with peer pressure.",
                    dua: "Hasbunallahu wa ni'mal wakeel (Allah is sufficient for us, and He is the best Disposer of affairs)."
                  },
                  {
                    id: "fable-gratitude",
                    title: "The Grateful Ant: Cultivating Shukr for Every Little Crumb",
                    virtue: "Gratitude",
                    ageGroup: "Ages 4-9",
                    readTime: "10 min discussion",
                    questions: [
                      "Why was little Zayd the ant so joyful about just one tiny breadcrumb?",
                      "What are 3 blessings Allah gave us today that we usually take for granted?",
                      "How does saying Alhamdulillah change our hearts?"
                    ],
                    actionPrompt: "The Family Shukr Jar: Put a note in the jar tonight with one thing you thanked Allah for today.",
                    dua: "Rabbi awzi'ni an ashkura ni'matak (My Lord, enable me to be grateful for Your favor)."
                  },
                  {
                    id: "bilal-dignity",
                    title: "Bilal ibn Rabah: Equality, Dignity & Unshakable Faith",
                    virtue: "Honesty",
                    ageGroup: "Ages 6-12",
                    readTime: "15 min discussion",
                    questions: [
                      "Why does Islam teach that all humans are equal like the teeth of a comb?",
                      "What gave Bilal the power to remain steadfast when he said 'Ahad, Ahad' (The One)?",
                      "How can we treat everyone at school with equal respect and warmth?"
                    ],
                    actionPrompt: "Compliment Character: Compliment a friend for their kindness or honesty, not just what they wear.",
                    dua: "Allahumma inni as'aluka husnal khuluq (O Allah, I ask You for excellent character)."
                  }
                ]
                .filter(item => discussionFilter === "All" || item.virtue === discussionFilter)
                .map((guide) => {
                  const isDone = !!discussedTopics[guide.id];
                  return (
                    <div 
                      key={guide.id}
                      className="rounded-3xl border border-white/10 bg-zinc-950/40 p-6 flex flex-col justify-between backdrop-blur-md hover:border-white/20 transition-all"
                    >
                      <div>
                        {/* Top Tagging */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                            {guide.virtue} • {guide.ageGroup}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">
                            {guide.readTime}
                          </span>
                        </div>

                        <h3 className="text-lg font-heading font-medium text-white mb-4">
                          {guide.title}
                        </h3>

                        {/* Questions list */}
                        <div className="space-y-2.5 mb-5">
                          <span className="text-[11px] font-mono text-zinc-400 block">QUESTIONS TO ASK YOUR CHILD:</span>
                          {guide.questions.map((q, qIdx) => (
                            <div key={qIdx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-zinc-500 font-mono">0{qIdx + 1}.</span>
                              <span>{q}</span>
                            </div>
                          ))}
                        </div>

                        {/* Practical Action & Dua */}
                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 mb-4">
                          <div className="text-xs">
                            <span className="text-zinc-400 font-medium block mb-0.5">Family Action:</span>
                            <span className="text-zinc-200">{guide.actionPrompt}</span>
                          </div>
                          <div className="text-xs pt-2 border-t border-white/5">
                            <span className="text-zinc-400 font-medium block mb-0.5">Bedtime Du'a:</span>
                            <span className="text-zinc-300 italic">{guide.dua}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action status */}
                      <button
                        onClick={() => handleToggleDiscussion(guide.id, guide.title)}
                        className={`w-full py-2.5 px-4 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isDone 
                            ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' 
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isDone ? `Discussed with ${activeChild.name} (+50 Points Awarded)` : `Mark as Discussed with ${activeChild.name}`}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: ACHIEVEMENTS & CERTIFICATE */}
          {/* ========================================================================= */}
          {activeNav === 'achievements' && (
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-light font-heading text-white">Milestones & Certificates</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Celebrate {activeChild.name}'s character breakthroughs, moral badges, and printable diplomas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handlePrintCertificate}
                    variant="outline"
                    className="rounded-full text-xs gap-2"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Certificate</span>
                  </Button>
                </div>
              </div>

              {/* Badges Collection Grid */}
              <div>
                <h3 className="text-base font-heading font-medium text-white mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span>Character Badges Gallery</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { name: "Truthful One (Al-Amin)", status: "Unlocked", desc: "Never told a lie in 3 consecutive story questions", icon: "★", date: "Earned Sept 20" },
                    { name: "Patience Guardian (Sabir)", status: "Unlocked", desc: "Listened to Prophet Yusuf's journey with focus", icon: "✳︎", date: "Earned Sept 22" },
                    { name: "Heart of Gratitude (Shakir)", status: "Unlocked", desc: "Practiced 5 bedtime Alhamdulillah reflections", icon: "♥", date: "Earned Sept 25" },
                    { name: "Nightly Reciter", status: "Unlocked", desc: "Completed 7 days of bedtime moral stories", icon: "☾", date: "Earned Sept 27" },
                    { name: "Generous Giver (Karim)", status: "In Progress (75%)", desc: "Share toys or snacks with siblings 4 times", icon: "✦", progress: 75 },
                    { name: "Courageous Explorer", status: "In Progress (50%)", desc: "Stood up for the truth in difficult choices", icon: "▲", progress: 50 },
                    { name: "Prophets Master (3/25)", status: "In Progress (12%)", desc: "Complete all 25 Prophet story journeys", icon: "◆", progress: 12 },
                    { name: "Kind Companion", status: "In Progress (80%)", desc: "Showed empathy in sibling discussions", icon: "●", progress: 80 },
                  ].map((b, bIdx) => {
                    const isUnlocked = b.status === "Unlocked";
                    return (
                      <div 
                        key={bIdx}
                        className={`rounded-3xl p-5 border text-center flex flex-col justify-between transition-all ${
                          isUnlocked 
                            ? 'bg-zinc-950/60 border-white/30 shadow-lg' 
                            : 'bg-zinc-950/20 border-white/5 opacity-70'
                        }`}
                      >
                        <div>
                          <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl border ${
                            isUnlocked ? 'bg-white/10 text-amber-300 border-amber-300/40' : 'bg-white/5 text-zinc-600 border-white/10'
                          }`}>
                            {b.icon}
                          </div>
                          <h4 className="text-sm font-heading font-medium text-white mb-1">{b.name}</h4>
                          <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">{b.desc}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10">
                          {isUnlocked ? (
                            <span className="text-[10px] font-mono text-zinc-300 block">{b.date}</span>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                                <span>Progress</span>
                                <span>{b.progress}%</span>
                              </div>
                              <Progress value={b.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Printable Certificate Preview */}
              <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-8 sm:p-12 relative overflow-hidden shadow-2xl">
                <div className="border-4 border-double border-white/20 rounded-2xl p-6 sm:p-10 text-center relative">
                  <div className="w-16 h-16 rounded-full border border-white/30 bg-white/5 flex items-center justify-center mx-auto mb-4 text-3xl">
                    ✳︎
                  </div>

                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-2">
                    Official Award of Akhlak & Prophetic Character
                  </span>
                  
                  <h3 className="text-2xl sm:text-4xl font-heading font-medium text-white mb-3 tracking-tight">
                    Certificate of Moral Excellence
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto mb-6 leading-relaxed">
                    This certifies that <strong className="text-white text-base underline decoration-white/40">{activeChild.name}</strong> has consistently demonstrated noble Islamic values, embodying the prophetic character traits of <strong>Honesty (Shidq)</strong>, <strong>Patience (Sabr)</strong>, and <strong>Gratitude (Shukr)</strong>.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-between items-center max-w-md mx-auto pt-6 border-t border-white/10 text-xs font-mono text-zinc-400 gap-4">
                    <div>
                      <span className="block text-white font-medium">Kidstorypedia Council</span>
                      <span>Verified Digital Record</span>
                    </div>
                    <div>
                      <span className="block text-white font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span>Issued to {activeChild.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 5: SETTINGS */}
          {/* ========================================================================= */}
          {activeNav === 'settings' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h2 className="text-2xl font-light font-heading text-white">Parental Controls & Platform Settings</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Configure family reading limits, bedtime reminders, audio preferences, and account details.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Family Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-heading">Family Guardian Account</CardTitle>
                    <CardDescription>Primary parent profile overseeing reading progress.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-zinc-400 block mb-1.5">PARENT / GUARDIAN NAME</label>
                        <input
                          type="text"
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-white/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-zinc-400 block mb-1.5">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-white/50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content & Reading Experience */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-heading">Reading Experience & Narration</CardTitle>
                    <CardDescription>Audio and visual learning preferences for story readers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <span className="text-sm font-medium text-white block">Full Voice Narration</span>
                        <span className="text-xs text-zinc-400">Play professional Islamic voiceover during story playback</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={audioNarration}
                        onChange={(e) => setAudioNarration(e.target.checked)}
                        className="w-5 h-5 rounded accent-white cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <span className="text-sm font-medium text-white block">Arabic Tashkeel (Diacritics)</span>
                        <span className="text-xs text-zinc-400">Display full vowel marks for correct Quranic and Seerah reading</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={arabicTashkeel}
                        onChange={(e) => setArabicTashkeel(e.target.checked)}
                        className="w-5 h-5 rounded accent-white cursor-pointer"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Parental Limits & Reminders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-heading">Parental Controls & Habits</CardTitle>
                    <CardDescription>Set healthy digital limits and bedtime storytelling alarms.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-sm font-medium text-white block">Daily Screen Time Limit</span>
                          <span className="text-xs text-zinc-400">Limits active reading session per child per day</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white px-3 py-1 rounded-full bg-white/10">
                          {dailyScreenLimit} Minutes
                        </span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="90"
                        step="15"
                        value={dailyScreenLimit}
                        onChange={(e) => setDailyScreenLimit(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <span className="text-sm font-medium text-white block">Bedtime Story Reminder</span>
                        <span className="text-xs text-zinc-400">Gentle notification to begin bedtime reading with children</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="bg-black/60 border border-white/20 px-2 py-1 rounded-lg text-xs font-mono text-white"
                        />
                        <input
                          type="checkbox"
                          checked={bedtimeReminder}
                          onChange={(e) => setBedtimeReminder(e.target.checked)}
                          className="w-5 h-5 rounded accent-white cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <span className="text-sm font-medium text-white block">Weekly Character Progress Digest</span>
                        <span className="text-xs text-zinc-400">Receive Sunday morning email summary of child virtues and milestones</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={weeklyDigest}
                        onChange={(e) => setWeeklyDigest(e.target.checked)}
                        className="w-5 h-5 rounded accent-white cursor-pointer"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit button */}
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit"
                    className="px-8 py-3 rounded-full bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    Save All Settings
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* MODAL: ADD CHILD PROFILE */}
        <AnimatePresence>
          {showAddChildModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-zinc-950 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
              >
                <button
                  onClick={() => setShowAddChildModal(false)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-heading font-medium text-white mb-1">Add Child Profile</h3>
                <p className="text-xs text-zinc-400 mb-6">Create a personalized character-building space for your child.</p>

                <form onSubmit={handleAddChild} className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1.5">CHILD'S FIRST NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bilal, Fatimah, Zayn"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-sm text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-zinc-400 block mb-1.5">AGE (YEARS)</label>
                      <input
                        type="number"
                        min="3"
                        max="14"
                        value={newChildAge}
                        onChange={(e) => setNewChildAge(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-sm text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-zinc-400 block mb-1.5">DAILY GOAL</label>
                      <select
                        value={newChildGoal}
                        onChange={(e) => setNewChildGoal(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-sm text-white focus:outline-none focus:border-white"
                      >
                        <option value={10}>10 min / day</option>
                        <option value={15}>15 min / day</option>
                        <option value={20}>20 min / day</option>
                        <option value={30}>30 min / day</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-2">CHOOSE AN AVATAR</label>
                    <div className="flex gap-3 justify-center py-2">
                      {["Kareem", "Amina", "Zayd", "Safiya", "Idris"].map((seed) => (
                        <button
                          key={seed}
                          type="button"
                          onClick={() => setNewChildAvatarSeed(seed)}
                          className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                            newChildAvatarSeed === seed ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`} 
                            alt={seed}
                            className="w-full h-full rounded-xl"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddChildModal(false)}
                      className="w-1/2 py-3 rounded-full border border-white/20 text-xs font-medium text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-3 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
                    >
                      Create Profile
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
