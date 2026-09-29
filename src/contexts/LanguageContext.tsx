import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

const translations: Record<Language, Record<string, string>> = {
  en: {
    "app.title": "Kidstorypedia",
    "nav.features": "Features",
    "nav.about": "About",
    "nav.login": "Log in",
    "nav.getStarted": "Get Started",
    "landing.badge": "Prophetic Character & Moral Stories for Children",
    "landing.title1": "Where Every Story Plants a",
    "landing.title2": "Seed of Prophetic Character",
    "landing.subtitle": "Empowering Muslim parents to raise children with strong akhlak through immersive, technology-enabled narrative experiences.",
    "landing.btnParent": "Start Parent Dashboard",
    "landing.btnChild": "Try Kids Experience",
    "landing.whyChoose": "Why Choose Kidstorypedia?",
    "landing.feat1.title": "Authentic Narratives",
    "landing.feat1.desc": "25 Prophets, Seerah Nabawiyah, and Sahabah stories reviewed by qualified Islamic scholars.",
    "landing.feat2.title": "Character Tracking",
    "landing.feat2.desc": "Monitor your child's progress on 12 core values like honesty, patience, and gratitude.",
    "landing.feat3.title": "Safe & Curated",
    "landing.feat3.desc": "No ads, no inappropriate content. Just pure, engaging Islamic storytelling.",
    "landing.howItWorks.title": "How Kidstorypedia Works",
    "landing.howItWorks.step1.title": "Choose a Story",
    "landing.howItWorks.step1.desc": "Select from our curated library of authentic Islamic stories.",
    "landing.howItWorks.step2.title": "Read & Learn",
    "landing.howItWorks.step2.desc": "Engage with beautiful illustrations and meaningful narratives.",
    "landing.howItWorks.step3.title": "Track Progress",
    "landing.howItWorks.step3.desc": "Monitor your child's character development over time.",
    "landing.categories.title": "Explore Our Library",
    "landing.categories.prophets": "Stories of the Prophets",
    "landing.categories.seerah": "Seerah Nabawiyah",
    "landing.categories.sahabah": "Lives of the Sahabah",
    "landing.categories.fables": "Moral Fables",
    "landing.tracking.title": "Nurturing Core Values",
    "landing.tracking.desc": "We track 12 essential Islamic values including Honesty, Patience, and Gratitude to help you guide your child's character development.",
    "landing.testimonials.title": "What Parents Say",
    "landing.testimonials.t1.quote": "Kidstorypedia has transformed our bedtime routine. The stories are beautiful and the character tracking is so helpful.",
    "landing.testimonials.t1.author": "Aisha, Mother of 2",
    "landing.testimonials.t2.quote": "Finally, a safe and authentic platform for Islamic stories. My kids love the illustrations!",
    "landing.testimonials.t2.author": "Omar, Father of 3",
    "landing.cta.title": "Ready to Start Your Journey?",
    "landing.cta.desc": "Join thousands of parents raising the next generation with strong Islamic values.",
    "dashboard.title": "Parent Portal",
    "dashboard.overview": "Overview",
    "dashboard.childProfiles": "Child Profiles",
    "dashboard.discussion": "Discussion Guides",
    "dashboard.achievements": "Achievements",
    "dashboard.settings": "Settings",
    "dashboard.switchChild": "Switch to Child View",
    "dashboard.greeting": "Assalamu'alaikum, Ummi Sarah",
    "dashboard.subtitle": "Here's how {name} is growing today.",
    "dashboard.tab.overview": "Overview",
    "dashboard.tab.character": "Character Tracking",
    "dashboard.tab.history": "Reading History",
    "dashboard.stat.stories": "Stories Completed",
    "dashboard.stat.storiesSub": "+3 this week",
    "dashboard.stat.time": "Reading Time",
    "dashboard.stat.timeSub": "Avg 15m / day",
    "dashboard.stat.badges": "Badges Earned",
    "dashboard.stat.badgesSub": "Latest: Truthful One",
    "dashboard.char.title": "Character Progress",
    "dashboard.char.desc": "Monitor {name}'s growth across core values.",
    "dashboard.rec.title": "Recommended Next Story",
    "dashboard.rec.desc": "Based on focus area: Patience",
    "dashboard.rec.generate": "Discover Featured Story",
    "dashboard.rec.generating": "Preparing Story...",
    "dashboard.rec.read": "Read Story",
    "dashboard.detail.title": "Detailed Character Tracking",
    "dashboard.detail.desc": "View detailed insights and discussion prompts.",
    "dashboard.detail.coming": "Detailed view coming in next update.",
    "child.greeting": "Hi, {name}!",
    "child.points": "{points} Points",
    "child.continue": "Continue Reading",
    "child.readNow": "Read Now",
    "child.mins": "mins",
    "cat.All": "All",
    "cat.Prophets": "Prophets",
    "cat.Seerah": "Seerah",
    "cat.Sahabah": "Sahabah",
    "cat.Fables": "Fables",
    "reader.notFound": "Story not found.",
    "reader.goBack": "Go back",
    "reader.mashaAllah": "MashaAllah!",
    "reader.completed": "You've completed \"{title}\" and learned about {values}.",
    "reader.readAnother": "Read Another Story",
    "reader.tellUmmi": "Tell Ummi (Parent Dashboard)",
    "val.Honesty": "Honesty",
    "val.Patience": "Patience",
    "val.Gratitude": "Gratitude",
    "val.Courage": "Courage",
    "val.Generosity": "Generosity",
  },
  ar: {
    "app.title": "منصة كيدستوريبيديا (Kidstorypedia)",
    "nav.features": "المميزات",
    "nav.about": "عن المنصة",
    "nav.login": "تسجيل الدخول",
    "nav.getStarted": "ابدأ الآن",
    "landing.badge": "قصص نبوية وتربية أخلاقية للأطفال",
    "landing.title1": "حيث تزرع كل قصة",
    "landing.title2": "بذرة من الأخلاق النبوية",
    "landing.subtitle": "تمكين الآباء المسلمين من تربية أطفالهم على الأخلاق الحميدة من خلال تجارب قصصية غامرة ومدعومة بالتكنولوجيا.",
    "landing.btnParent": "لوحة تحكم الآباء",
    "landing.btnChild": "تجربة الأطفال",
    "landing.whyChoose": "لماذا تختار كيدستوريبيديا؟",
    "landing.feat1.title": "قصص موثوقة",
    "landing.feat1.desc": "٢٥ نبياً، السيرة النبوية، وقصص الصحابة مراجعة من قبل علماء مسلمين مؤهلين.",
    "landing.feat2.title": "تتبع الأخلاق",
    "landing.feat2.desc": "راقب تقدم طفلك في ١٢ قيمة أساسية مثل الصدق، الصبر، والامتنان.",
    "landing.feat3.title": "آمن ومنتقى",
    "landing.feat3.desc": "بدون إعلانات، محتوى غير لائق. فقط قصص إسلامية نقية وجذابة.",
    "landing.howItWorks.title": "كيف تعمل كيدستوريبيديا",
    "landing.howItWorks.step1.title": "اختر قصة",
    "landing.howItWorks.step1.desc": "اختر من مكتبتنا المنسقة من القصص الإسلامية الأصيلة.",
    "landing.howItWorks.step2.title": "اقرأ وتعلم",
    "landing.howItWorks.step2.desc": "تفاعل مع الرسوم التوضيحية الجميلة والقصص الهادفة.",
    "landing.howItWorks.step3.title": "تتبع التقدم",
    "landing.howItWorks.step3.desc": "راقب تطور شخصية طفلك بمرور الوقت.",
    "landing.categories.title": "استكشف مكتبتنا",
    "landing.categories.prophets": "قصص الأنبياء",
    "landing.categories.seerah": "السيرة النبوية",
    "landing.categories.sahabah": "حياة الصحابة",
    "landing.categories.fables": "حكايات أخلاقية",
    "landing.tracking.title": "رعاية القيم الأساسية",
    "landing.tracking.desc": "نحن نتتبع ١٢ قيمة إسلامية أساسية بما في ذلك الصدق، الصبر، والامتنان لمساعدتك في توجيه تطور شخصية طفلك.",
    "landing.testimonials.title": "ماذا يقول الآباء",
    "landing.testimonials.t1.quote": "لقد غيرت كيدستوريبيديا روتين ما قبل النوم لدينا. القصص جميلة وتتبع الأخلاق مفيد جداً.",
    "landing.testimonials.t1.author": "عائشة، أم لطفلين",
    "landing.testimonials.t2.quote": "أخيراً، منصة آمنة وأصيلة للقصص الإسلامية. أطفالي يحبون الرسوم التوضيحية!",
    "landing.testimonials.t2.author": "عمر، أب لثلاثة أطفال",
    "landing.cta.title": "هل أنت مستعد لبدء رحلتك؟",
    "landing.cta.desc": "انضم إلى آلاف الآباء الذين يربون الجيل القادم بقيم إسلامية قوية.",
    "dashboard.title": "بوابة الآباء",
    "dashboard.overview": "نظرة عامة",
    "dashboard.childProfiles": "ملفات الأطفال",
    "dashboard.discussion": "أدلة النقاش",
    "dashboard.achievements": "الإنجازات",
    "dashboard.settings": "الإعدادات",
    "dashboard.switchChild": "التبديل لواجهة الطفل",
    "dashboard.greeting": "السلام عليكم، أم سارة",
    "dashboard.subtitle": "إليك كيف ينمو {name} اليوم.",
    "dashboard.tab.overview": "نظرة عامة",
    "dashboard.tab.character": "تتبع الأخلاق",
    "dashboard.tab.history": "سجل القراءة",
    "dashboard.stat.stories": "القصص المكتملة",
    "dashboard.stat.storiesSub": "+٣ هذا الأسبوع",
    "dashboard.stat.time": "وقت القراءة",
    "dashboard.stat.timeSub": "متوسط ١٥ دقيقة / يوم",
    "dashboard.stat.badges": "الشارات المكتسبة",
    "dashboard.stat.badgesSub": "الأحدث: الصادق",
    "dashboard.char.title": "تقدم الأخلاق",
    "dashboard.char.desc": "راقب نمو {name} في القيم الأساسية.",
    "dashboard.rec.title": "القصة التالية الموصى بها",
    "dashboard.rec.desc": "بناءً على مجال التركيز: الصبر",
    "dashboard.rec.generate": "تأليف قصة أخلاقية جديدة",
    "dashboard.rec.generating": "جاري إعداد القصة...",
    "dashboard.rec.read": "اقرأ القصة",
    "dashboard.detail.title": "تتبع الأخلاق بالتفصيل",
    "dashboard.detail.desc": "عرض رؤى تفصيلية ومحفزات للنقاش.",
    "dashboard.detail.coming": "العرض التفصيلي قادم في التحديث القادم.",
    "child.greeting": "أهلاً، {name}!",
    "child.points": "{points} نقطة",
    "child.continue": "مواصلة القراءة",
    "child.readNow": "اقرأ الآن",
    "child.mins": "دقيقة",
    "cat.All": "الكل",
    "cat.Prophets": "الأنبياء",
    "cat.Seerah": "السيرة",
    "cat.Sahabah": "الصحابة",
    "cat.Fables": "حكايات",
    "reader.notFound": "القصة غير موجودة.",
    "reader.goBack": "العودة",
    "reader.mashaAllah": "ما شاء الله!",
    "reader.completed": "لقد أكملت \"{title}\" وتعلمت عن {values}.",
    "reader.readAnother": "اقرأ قصة أخرى",
    "reader.tellUmmi": "أخبر أمي (لوحة تحكم الآباء)",
    "val.Honesty": "الصدق",
    "val.Patience": "الصبر",
    "val.Gratitude": "الامتنان",
    "val.Courage": "الشجاعة",
    "val.Generosity": "الكرم",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Inline bilingual string helper: tx("Hello", "مرحبا") */
  tx: (en: string, ar?: string) => string;
  dir: 'ltr' | 'rtl';
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try { return (localStorage.getItem('kidstorypedia:lang') as Language) || 'en'; } catch { return 'en'; }
  });
  const setLanguage = (l: Language) => {
    setLanguageState(l);
    try { localStorage.setItem('kidstorypedia:lang', l); } catch { /* ignore */ }
  };
  const tx = (en: string, ar?: string) => (language === 'ar' && ar ? ar : en);

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tx, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
