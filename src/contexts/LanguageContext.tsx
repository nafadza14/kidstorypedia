import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en' | 'ar';

/** Language labels shown in the switcher */
export const LANG_LABELS: Record<Language, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
  ar: 'العربية',
};

/** Short labels for compact switcher */
export const LANG_SHORT: Record<Language, string> = {
  id: 'ID',
  en: 'EN',
  ar: 'ع',
};

/**
 * Detect language from user's locale/timezone on first visit.
 * - Indonesia (id, ms locales or Asia/Jakarta timezone) → 'id'
 * - Arabic-speaking countries → 'ar'
 * - Otherwise → 'en'
 */
function detectLanguage(): Language {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    // Indonesia timezones
    if (/^Asia\/(Jakarta|Makassar|Jayapura|Pontianak)$/i.test(tz)) return 'id';

    const lang = (navigator.language || '').toLowerCase();
    if (lang.startsWith('id') || lang.startsWith('ms')) return 'id';
    if (lang.startsWith('ar')) return 'ar';
  } catch { /* fallback */ }
  return 'en';
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    "app.title": "Kidstorypedia",
    "nav.features": "Fitur",
    "nav.about": "Tentang",
    "nav.login": "Masuk",
    "nav.getStarted": "Mulai Sekarang",
    "landing.badge": "Kisah Nabi & Cerita Akhlak untuk Anak-Anak",
    "landing.title1": "Di mana setiap cerita menanam",
    "landing.title2": "Benih Akhlak Mulia",
    "landing.subtitle": "Memberdayakan orang tua Muslim untuk membesarkan anak-anak berakhlak mulia melalui pengalaman cerita yang mendalam dan didukung teknologi.",
    "landing.btnParent": "Dasbor Orang Tua",
    "landing.btnChild": "Coba Pengalaman Anak",
    "landing.whyChoose": "Mengapa Memilih Kidstorypedia?",
    "landing.feat1.title": "Kisah Autentik",
    "landing.feat1.desc": "25 Nabi, Sirah Nabawiyah, dan kisah Sahabat yang direview oleh ulama Islam.",
    "landing.feat2.title": "Pelacakan Karakter",
    "landing.feat2.desc": "Pantau perkembangan anak Anda pada 12 nilai inti seperti kejujuran, kesabaran, dan syukur.",
    "landing.feat3.title": "Aman & Terkurasi",
    "landing.feat3.desc": "Tanpa iklan, tanpa konten tidak pantas. Hanya cerita Islam murni dan menarik.",
    "landing.howItWorks.title": "Cara Kerja Kidstorypedia",
    "landing.howItWorks.step1.title": "Pilih Cerita",
    "landing.howItWorks.step1.desc": "Pilih dari koleksi cerita Islam autentik kami.",
    "landing.howItWorks.step2.title": "Baca & Pelajari",
    "landing.howItWorks.step2.desc": "Nikmati ilustrasi indah dan narasi bermakna.",
    "landing.howItWorks.step3.title": "Pantau Kemajuan",
    "landing.howItWorks.step3.desc": "Pantau perkembangan karakter anak Anda seiring waktu.",
    "landing.categories.title": "Jelajahi Perpustakaan Kami",
    "landing.categories.prophets": "Kisah Para Nabi",
    "landing.categories.seerah": "Sirah Nabawiyah",
    "landing.categories.sahabah": "Kehidupan Para Sahabat",
    "landing.categories.fables": "Cerita Moral",
    "landing.tracking.title": "Menumbuhkan Nilai-Nilai Inti",
    "landing.tracking.desc": "Kami melacak 12 nilai Islam esensial termasuk Kejujuran, Kesabaran, dan Syukur untuk membantu Anda membimbing perkembangan karakter anak.",
    "landing.testimonials.title": "Kata Orang Tua",
    "landing.testimonials.t1.quote": "Kidstorypedia telah mengubah rutinitas tidur kami. Ceritanya indah dan pelacakan karakternya sangat membantu.",
    "landing.testimonials.t1.author": "Aisha, Ibu 2 Anak",
    "landing.testimonials.t2.quote": "Akhirnya, platform aman dan autentik untuk cerita Islam. Anak-anak saya suka ilustrasinya!",
    "landing.testimonials.t2.author": "Omar, Ayah 3 Anak",
    "landing.cta.title": "Siap Memulai Perjalanan Anda?",
    "landing.cta.desc": "Bergabung dengan ribuan orang tua yang membesarkan generasi berikutnya dengan nilai-nilai Islam yang kuat.",
    "dashboard.title": "Portal Orang Tua",
    "dashboard.overview": "Ringkasan",
    "dashboard.childProfiles": "Profil Anak",
    "dashboard.discussion": "Panduan Diskusi",
    "dashboard.achievements": "Pencapaian",
    "dashboard.settings": "Pengaturan",
    "dashboard.switchChild": "Beralih ke Tampilan Anak",
    "dashboard.greeting": "Assalamu'alaikum, Ummi Sarah",
    "dashboard.subtitle": "Begini perkembangan {name} hari ini.",
    "child.greeting": "Hai, {name}!",
    "child.continue": "Lanjut Membaca",
    "child.readNow": "Baca Sekarang",
    "child.mins": "menit",
    "cat.All": "Semua",
    "cat.Prophets": "Para Nabi",
    "cat.Seerah": "Sirah",
    "cat.Sahabah": "Sahabat",
    "cat.Fables": "Cerita Moral",
    "reader.notFound": "Cerita tidak ditemukan.",
    "reader.goBack": "Kembali",
    "reader.mashaAllah": "MasyaAllah!",
    "reader.completed": "Kamu telah menyelesaikan \"{title}\" dan belajar tentang {values}.",
    "reader.readAnother": "Baca Cerita Lain",
    "reader.tellUmmi": "Ceritakan pada Ummi (Dasbor Orang Tua)",
    "val.Honesty": "Kejujuran",
    "val.Patience": "Kesabaran",
    "val.Gratitude": "Syukur",
    "val.Courage": "Keberanian",
    "val.Generosity": "Kedermawanan",
  },
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
    "child.greeting": "Hi, {name}!",
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
    "child.greeting": "أهلاً، {name}!",
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
  /** Trilingual inline helper: tx("Teks Indonesia", "English text", "النص العربي") */
  tx: (id: string, en: string, ar?: string) => string;
  dir: 'ltr' | 'rtl';
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'kidstorypedia:lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      // ?lang=id|en|ar (used by hreflang links and shared URLs) wins and is remembered
      const q = new URLSearchParams(window.location.search).get('lang');
      if (q === 'id' || q === 'en' || q === 'ar') {
        localStorage.setItem(STORAGE_KEY, q);
        return q;
      }
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && (saved === 'id' || saved === 'en' || saved === 'ar')) return saved;
    } catch { /* ignore */ }
    return detectLanguage();
  });

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  };

  /** tx("Indonesia", "English", "عربي") - returns the string matching current language */
  const tx = (id: string, en: string, ar?: string) => {
    if (language === 'ar' && ar) return ar;
    if (language === 'id') return id;
    return en;
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
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
