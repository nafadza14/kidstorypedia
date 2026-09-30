import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight, BookOpen, Check, Compass, Heart, Languages, MessageCircle, Moon, School, ShieldCheck,
  Sparkles, Sprout, Star, Trophy, UserCheck, Zap, Ban, Cpu, Eye, Scale, FileText, Clock,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicFooter, PublicNav } from "@/components/PublicNav";
import { StoryCover, ValueChip } from "@/components/kit";
import { useStore } from "@/store";
import { familyStories, loc } from "@/lib/content";
import { track } from "@/lib/analytics";
import { CATEGORIES, VALUES } from "@/data/values";
import { PLANS } from "@/data/catalog";
import { useSeo } from "@/hooks/useSeo";
import { homeMeta } from "@/lib/seo";

const sectionCls = "py-20 sm:py-24 px-5 sm:px-8 max-w-7xl mx-auto border-t border-white/10";
const cardCls = "rounded-3xl bg-zinc-950/40 border border-white/10 backdrop-blur-md";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-zinc-400 font-mono mb-3 block">{children}</span>;
}

/* ─────────────── 5 rotating hero headlines ─────────────── */
const HERO_HEADLINES: { id: string; en: string; ar: string }[] = [
  {
    id: "Rutinitas tidur\nyang lebih baik\nuntuk keluarga\nMuslim Anda",
    en: "A better bedtime\nroutine for every\nMuslim family,\nnight after night",
    ar: "روتين أفضل\nوأهدأ قبل\nالنوم لكل\nعائلة مسلمة",
  },
  {
    id: "Cerita yang\nmengajarkan\nnilai untuk\nseumur hidup",
    en: "Stories that\nteach values\nyour children\nwill carry for life",
    ar: "قصص تُعلّم\nأطفالك قيماً\nيحملونها معهم\nمدى الحياة",
  },
  {
    id: "Kearifan Islam\nyang abadi, kini\nhadir dalam\ncerita masa kini",
    en: "Where timeless\nIslamic wisdom\nmeets modern\nstorytelling",
    ar: "حيث تلتقي\nحكمة الإسلام\nالخالدة بفنّ\nالسرد الحديث",
  },
  {
    id: "Membangun\nakhlak melalui\ncerita, dialog,\ndan praktik",
    en: "Growing character\nthrough stories,\nconversations\nand practice",
    ar: "بناء الأخلاق\nعبر القصص\nوالحوارات\nوالممارسة",
  },
  {
    id: "Setiap malam\ncerita baru,\nsetiap cerita\npelajaran baru",
    en: "Every evening\na new story.\nEvery story\na new lesson",
    ar: "كل مساء\nقصة جديدة\nوكل قصة\nدرس جديد",
  },
];

const CYCLE_MS = 5000; // 3 s appear + 2 s pause
const WORD_APPEAR_S = 3; // seconds for all words to appear
const BASE_GAP_EM = 0.28; // natural space between words
const MAX_EXTRA_GAP_EM = 0.5; // how much each word gap may grow before letters spread
const MAX_TRACK_EM = 0.1; // extra letter-spacing allowed (never for Arabic)

/**
 * Makes every headline line exactly as wide as the longest one: first by
 * widening word gaps (flex space-between), then, if a line is still short,
 * by a little extra letter-spacing. Re-measured on resize and font load.
 */
function useEqualLines(ref: React.RefObject<HTMLSpanElement | null>, allowTracking: boolean) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const lines = Array.from(el.children) as HTMLElement[];
      el.style.width = "";
      lines.forEach(l => { l.style.letterSpacing = ""; });
      const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      const nat = lines.map(l => {
        const words = Array.from(l.children) as HTMLElement[];
        return words.reduce((a, w) => a + w.offsetWidth, 0) + Math.max(0, words.length - 1) * BASE_GAP_EM * fs;
      });
      const target = Math.ceil(Math.max(...nat));
      const available = el.parentElement?.parentElement?.clientWidth || Infinity;
      if (!target || target > available) return; // narrow screen: let lines wrap naturally
      el.style.width = `${target}px`;
      if (!allowTracking) return;
      lines.forEach((l, i) => {
        const words = Array.from(l.children) as HTMLElement[];
        const gapRoom = Math.max(0, words.length - 1) * MAX_EXTRA_GAP_EM * fs;
        const short = target - nat[i] - gapRoom;
        if (short <= 0) return;
        const chars = (l.textContent || "").replace(/\s/g, "").length;
        if (chars < 2) return;
        const extra = Math.min(MAX_TRACK_EM * fs, short / chars);
        const base = parseFloat(getComputedStyle(l).letterSpacing) || 0;
        l.style.letterSpacing = `${base + extra}px`;
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (el.parentElement?.parentElement) ro.observe(el.parentElement.parentElement);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [ref, allowTracking]);
}

function HeadlineBlock({ text, heroIdx, allowTracking }: { text: string; heroIdx: number; allowTracking: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEqualLines(ref, allowTracking);
  const lineWords = text.split("\n").map(l => l.split(/\s+/));
  const totalWords = lineWords.reduce((s, w) => s + w.length, 0);
  const stagger = totalWords > 1 ? WORD_APPEAR_S / totalWords : 0;
  let c = 0;
  const gIdx = lineWords.map(words => words.map(() => c++));

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      className="block max-w-full"
    >
      {lineWords.map((words, li) => (
        <span key={li} className={words.length > 1 ? "flex flex-wrap justify-between gap-x-[0.28em]" : "block"}>
          {words.map((word, wi) => (
            <motion.span
              key={`${heroIdx}-${gIdx[li][wi]}`}
              className="inline-block"
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: gIdx[li][wi] * stagger, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}

function AnimatedHeadline({ text, heroIdx, allowTracking }: { text: string; heroIdx: number; allowTracking: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <HeadlineBlock key={`${heroIdx}-${text.length}`} text={text} heroIdx={heroIdx} allowTracking={allowTracking} />
    </AnimatePresence>
  );
}

export default function Landing() {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const hasParent = !!state.parent;

  /* Hero rotation */
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    // restart the countdown whenever the headline changes (incl. dot clicks)
    const timer = setTimeout(() => setHeroIdx(i => (i + 1) % HERO_HEADLINES.length), CYCLE_MS);
    return () => clearTimeout(timer);
  }, [heroIdx]);

  const heroText = tx(
    HERO_HEADLINES[heroIdx].id,
    HERO_HEADLINES[heroIdx].en,
    HERO_HEADLINES[heroIdx].ar,
  );

  useSeo({ ...homeMeta(language), lang: language });

  useEffect(() => { track("landing_view"); }, []);

  const featured = useMemo(() => {
    const all = familyStories(state);
    const sorted = [...all].sort((a, b) => Number(b.state === "published") - Number(a.state === "published"));
    const picked: typeof all = [];
    for (const c of CATEGORIES) { const s = sorted.find(x => x.category === c.id); if (s) picked.push(s); }
    for (const s of sorted) { if (picked.length >= 5) break; if (!picked.includes(s)) picked.push(s); }
    return picked.slice(0, 5);
  }, [state]);

  /* Top 10 of the week: published first, then free-to-read, then shortest read */
  const top10 = useMemo(() => {
    const all = familyStories(state);
    return [...all]
      .sort((a, b) =>
        Number(b.state === "published") - Number(a.state === "published") ||
        Number(a.premium) - Number(b.premium) ||
        a.durationMin - b.durationMin)
      .slice(0, 10);
  }, [state]);

  const trust = [
    { icon: Ban, label: tx("Tanpa iklan", "Ad-free", "بلا إعلانات") },
    { icon: Languages, label: tx("Tiga bahasa: Indonesia / Inggris / Arab", "Trilingual: Indonesian / English / Arabic", "ثلاث لغات: إندونيسية / إنجليزية / عربية") },
    { icon: Cpu, label: tx("AI yang bertanggung jawab", "Responsible AI", "ذكاء اصطناعي مسؤول") },
    { icon: ShieldCheck, label: tx("Prinsip konten Islami - bersumber & ditinjau", "Islamic content principles - sourced & reviewed", "مبادئ المحتوى الإسلامي - موثّق ومُراجَع") },
    { icon: UserCheck, label: tx("Dikendalikan orang tua", "Parent-controlled", "بتحكم الوالدين") },
  ];

  const loop = [
    { icon: Compass, t: tx("Temukan", "Discover", "اكتشف"), d: tx("Cerita yang sesuai usia anak dan nilai yang sedang kalian kembangkan.", "A story matched to your child's age and the values you're working on.", "قصة تناسب عمر طفلك والقيم التي تعملون عليها.") },
    { icon: BookOpen, t: tx("Baca", "Read", "اقرأ"), d: tx("Baca bersama, atau dengarkan narasinya, dalam Bahasa Indonesia, Inggris, atau Arab.", "Read together, or listen with narration, in Indonesian, English or Arabic.", "اقرؤوا معاً أو استمعوا للسرد بالإندونيسية أو الإنجليزية أو العربية.") },
    { icon: Sparkles, t: tx("Pahami", "Understand", "افهم"), d: tx("Teks yang sesuai usia dan glosarium singkat untuk kata-kata baru.", "Age-appropriate text and a short glossary for new words.", "نص مناسب للعمر ومسرد قصير للكلمات الجديدة.") },
    { icon: MessageCircle, t: tx("Diskusikan", "Discuss", "ناقش"), d: tx("Tiga pertanyaan panduan membantu orang tua memulai percakapan nyata.", "Three guided questions help parents start a real conversation.", "ثلاثة أسئلة موجّهة تساعد الوالدين على بدء حوار حقيقي.") },
    { icon: Zap, t: tx("Praktikkan", "Practice", "مارس"), d: tx("Tantangan aksi keluarga kecil membawa nilai ke kehidupan sehari-hari.", "A small family action challenge brings the value into daily life.", "تحدٍّ عائلي صغير ينقل القيمة إلى الحياة اليومية.") },
    { icon: Moon, t: tx("Renungkan", "Reflect", "تأمّل"), d: tx("Pertanyaan refleksi yang tenang dan doa untuk menutup malam.", "A calm reflection prompt and du'a to close the evening.", "سؤال تأمل هادئ ودعاء لختام المساء.") },
    { icon: Sprout, t: tx("Tumbuh", "Grow", "انمُ"), d: tx("Jurnal Akhlak mencatat apa yang keluarga kalian praktikkan - tanpa skor.", "The Character Journal records what your family practised - no scores.", "دفتر الأخلاق يسجّل ما مارسته العائلة - بلا درجات.") },
  ];

  const principles = [
    { icon: FileText, t: tx("Sumber dikutip di setiap halaman", "Sources cited on every page", "مصادر موثّقة في كل صفحة"), d: tx("Setiap halaman cerita kanonik mereferensikan Al-Qur'an, hadis, atau teks sirah yang menjadi sumbernya, sehingga orang tua dapat memeriksanya.", "Every page of a canonical story references the Qur'an, hadith or sirah text it draws from, so parents can check it.", "كل صفحة من القصص الأساسية تشير إلى الآية أو الحديث أو السيرة المستندة إليها ليتحقق الوالدان.") },
    { icon: Scale, t: tx("Alur peninjauan ulama", "Scholar review workflow", "مسار مراجعة علمية"), d: tx("Cerita melalui peninjauan sumber, editorial, dan ulama sebelum diterbitkan. Cerita yang masih dalam peninjauan diberi label dengan jelas.", "Stories move through source, editorial and scholar review before publishing. Stories still in review are clearly labelled.", "تمر القصص بمراجعة المصادر والتحرير والمراجعة العلمية قبل النشر، والقصص قيد المراجعة موسومة بوضوح.") },
    { icon: Eye, t: tx("Ilustrasi tanpa wajah", "Faceless illustrations", "رسوم بلا وجوه"), d: tx("Tidak ada penggambaran Nabi atau wajah mereka. Ilustrasi fokus pada tempat, alam, dan objek.", "No depiction of Prophets or their faces. Illustrations focus on places, nature and objects.", "لا تصوير للأنبياء أو وجوههم. تركّز الرسوم على الأماكن والطبيعة والأشياء.") },
    { icon: Cpu, t: tx("AI berbasis sumber yang disetujui", "AI grounded in approved sources", "ذكاء اصطناعي مقيّد بالمصادر المعتمدة"), d: tx("AI hanya mengadaptasi konten yang telah ditinjau dan diperiksa berdasarkan fakta yang diizinkan. AI tidak pernah mengarang kutipan, hadis, atau peristiwa.", "AI only adapts reviewed content and is checked against allowed facts. It never invents quotes, hadith or events.", "يعمل الذكاء الاصطناعي على المحتوى المُراجَع فقط ويُتحقَّق منه مقابل الحقائق المسموحة، ولا يختلق أقوالاً أو أحاديث أو أحداثاً.") },
    { icon: Ban, t: tx("Tanpa iklan, tanpa pelacakan perilaku", "No ads, no behavioural tracking", "بلا إعلانات ولا تتبع سلوكي"), d: tx("Kami hanya mengumpulkan nama depan dan usia anak. Tidak ada yang dijual atau digunakan untuk iklan.", "We collect only a child's first name and age. Nothing is sold or used for advertising.", "نجمع الاسم الأول للطفل وعمره فقط. لا نبيع أي بيانات ولا نستخدمها للإعلانات.") },
  ];

  const free = PLANS.find(p => p.id === "free")!;
  const family = PLANS.find(p => p.id === "premium_annual")!;

  return (
    <div className="relative min-h-screen bg-black/40 text-white selection:bg-white selection:text-black overflow-x-hidden font-body">
      {/* Background */}
      <img src="https://i.imgur.com/bpuBPTG.png" alt="" className="fixed inset-0 z-0 w-full h-full object-cover object-center pointer-events-none" />
      <div className="fixed inset-0 z-[1] bg-black/25 backdrop-blur-[0.5px] pointer-events-none" />
      <div className="fixed inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/25 to-black/35 pointer-events-none" />

      <PublicNav transparent />

      <main className="relative z-10">
        {/* HERO */}
        <section className="pt-24 sm:pt-28 pb-12 px-5 sm:px-8 max-w-7xl mx-auto flex flex-col">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Animated rotating headline */}
              <h1 className="w-fit max-w-full text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6 min-h-[4.3em]">
                <AnimatedHeadline text={heroText} heroIdx={heroIdx} allowTracking={language !== "ar"} />
              </h1>

              {/* Dot indicators */}
              <div className="flex items-center gap-2 mb-8">
                {HERO_HEADLINES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      i === heroIdx
                        ? "w-6 h-2 bg-white"
                        : "w-2 h-2 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Headline ${i + 1}`}
                  />
                ))}
              </div>

              <p className="text-lg sm:text-xl text-zinc-200 font-light max-w-xl leading-relaxed mb-10">
                {tx(
                  "Baca cerita. Mulai percakapan. Praktikkan sebuah nilai. Bangun akhlak.",
                  "Read a story. Start a conversation. Practice a value. Build character.",
                  "اقرأ قصة. ابدأ حواراً. مارس قيمة. ابنِ الأخلاق.",
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link to="/onboarding" className="px-8 py-4 rounded-full bg-white text-black font-medium text-base sm:text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl group">
                  <span>{tx("Mulai Perjalanan Belajar Keluarga", "Start Your Family Learning Journey", "ابدأ رحلة التعلم العائلية")}</span>
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
                </Link>
                <Link to="/stories" className="px-8 py-4 rounded-full border border-white/40 text-white font-medium text-base sm:text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                  {tx("Jelajahi Cerita", "Explore Stories", "استكشف القصص")}
                </Link>
              </div>
              {hasParent && (
                <Link to="/dashboard" className="mt-5 text-sm text-zinc-300 underline underline-offset-4 hover:text-white">
                  {tx("Lanjutkan ke portal orang tua →", "Continue to your parent portal →", "المتابعة إلى بوابة الوالدين ←")}
                </Link>
              )}
            </div>
            <div className="hidden lg:block lg:col-span-5" />
          </div>

          {/* Top 10 Story of the Week */}
          {top10.length > 0 && (
            <div className="mt-12 w-full">
              <h3 className="text-xs font-mono text-zinc-400 mb-4 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                {tx("Top 10 Cerita Minggu Ini", "Top 10 Stories of the Week", "أفضل ١٠ قصص الأسبوع")}
              </h3>
              <div className="overflow-hidden relative">
                <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused]" style={{ width: "max-content", animationDuration: `${top10.length * 6}s` }}>
                  {[...top10, ...top10].map((story, i) => (
                    <Link key={`top10-${i}`} to={`/stories/${story.slug}`} className="shrink-0 w-32 sm:w-40 relative group">
                      <StoryCover story={story} locked={story.premium} className="aspect-[3/4] rounded-2xl group-hover:opacity-90 transition-opacity" />
                      <div className="absolute top-2 left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/70 border border-white/20 backdrop-blur-sm flex items-center justify-center text-[11px] sm:text-xs font-bold text-white">
                        #{(i % top10.length) + 1}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl pointer-events-none" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* FEATURED STORIES */}
        <section id="featured" className={sectionCls}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <Eyebrow>[ 01 / {tx("Cerita pilihan", "Featured stories", "قصص مختارة")} ]</Eyebrow>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight">{tx("Cerita pilihan", "Featured stories", "قصص مختارة")}</h2>
            </div>
            <Link to="/stories" className="text-white hover:opacity-70 underline underline-offset-4 inline-flex items-center gap-2">
              {tx("Jelajahi seluruh perpustakaan", "Browse the full library", "تصفّح المكتبة كاملة")} <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {featured.map(story => {
              const cat = CATEGORIES.find(c => c.id === story.category);
              return (
                <Link key={story.id} to={`/stories/${story.slug}`} className="group rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/50 backdrop-blur-md hover:border-white/40 transition-all flex flex-col">
                  <StoryCover story={story} locked={story.premium} className="aspect-[4/5] group-hover:opacity-90 transition-opacity" />
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                      <span>{cat ? loc(cat.name, language) : story.category}</span>
                      <span className="opacity-40">•</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{story.durationMin} {tx("mnt", "min", "د")}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-heading leading-snug line-clamp-2">{loc(story.title, language)}</h3>
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                      {story.values.slice(0, 2).map(v => <ValueChip key={v} id={v} />)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Trust indicators */}
        <div className="py-10 sm:py-12 px-5 sm:px-8 max-w-7xl mx-auto">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs sm:text-sm text-zinc-300">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="w-4 h-4 text-white/80" aria-hidden />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className={sectionCls}>
          <div className="mb-14 max-w-2xl">
            <Eyebrow>[ 02 / {tx("Cara kerja", "How it works", "طريقة العمل")} ]</Eyebrow>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight mb-4">{tx("Lebih dari sekadar aplikasi cerita", "More than a story app", "أكثر من تطبيق قصص")}</h2>
            <p className="text-zinc-300">{tx("Setiap cerita adalah siklus belajar kecil yang bisa diselesaikan keluarga dalam satu malam.", "Each story is a small learning loop your family can finish in one evening.", "كل قصة حلقة تعلم صغيرة يمكن لعائلتك إتمامها في أمسية واحدة.")}</p>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {loop.map(({ icon: Icon, t: title, d }, i) => (
              <li key={title} className="border-t border-white/20 pt-5 relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono text-zinc-500">{String(i + 1).padStart(2, "0")}</span>
                  <Icon className="w-4 h-4 text-white/80" aria-hidden />
                </div>
                <h3 className="text-lg font-heading mb-1.5">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* VALUES + CHARACTER JOURNAL */}
        <section id="values" className={sectionCls}>
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <Eyebrow>[ 03 / {tx("12 nilai", "12 values", "١٢ قيمة")} ]</Eyebrow>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight mb-6">{tx("Dua belas nilai, dipraktikkan bersama", "Twelve values, practised together", "اثنتا عشرة قيمة نمارسها معاً")}</h2>
              <p className="text-zinc-300 leading-relaxed mb-8 text-base sm:text-lg">
                {tx(
                  "Setiap cerita ditandai dengan nilai yang diajarkannya. Alih-alih memberi skor karakter anak, Kidstorypedia mencatat apa yang benar-benar dilakukan keluarga kalian: cerita yang dibaca, percakapan yang dilakukan, dan aksi yang dipraktikkan.",
                  "Every story is tagged with the values it teaches. Instead of scoring your child's character, Kidstorypedia records what your family actually did: stories read, conversations had and actions practised.",
                  "كل قصة موسومة بالقيم التي تعلّمها. بدلاً من تقييم أخلاق طفلك بالدرجات، تسجّل كيدستوريبيديا ما فعلته عائلتك حقاً: القصص المقروءة والحوارات والأعمال المُمارَسة.",
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {VALUES.map(v => <ValueChip key={v.id} id={v.id} size="md" />)}
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className={`${cardCls} p-6 sm:p-8`}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">✳︎</div>
                    <div>
                      <h3 className="text-sm font-heading">{tx("Jurnal Akhlak", "Character Journal", "دفتر الأخلاق")}</h3>
                      <p className="text-xs text-zinc-400">{tx("Contoh · bulan ini", "Sample · this month", "نموذج · هذا الشهر")}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-white/10 text-zinc-300 border border-white/15">{tx("Contoh", "Example", "مثال")}</span>
                </div>
                <ul className="space-y-3">
                  {[
                    { v: "patience" as const, id: "Melatih Kesabaran dalam 4 aktivitas belajar", en: "Practised Patience in 4 learning activities", ar: "مارس الصبر في ٤ أنشطة تعلم" },
                    { v: "gratitude" as const, id: "Membicarakan Syukur setelah 2 cerita", en: "Talked about Gratitude after 2 stories", ar: "تحدّث عن الشكر بعد قصتين" },
                    { v: "honesty" as const, id: "Menyelesaikan 1 tantangan aksi Kejujuran", en: "Completed 1 Honesty action challenge", ar: "أكمل تحدياً عملياً واحداً في الصدق" },
                  ].map(r => (
                    <li key={r.v} className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-3">
                      <span className="text-sm">{tx(r.id, r.en, r.ar)}</span>
                      <ValueChip id={r.v} />
                    </li>
                  ))}
                  <li className="p-4 rounded-2xl bg-black/30 border border-white/5">
                    <div className="text-[11px] font-mono text-zinc-500 mb-1">{tx("Observasi orang tua", "Parent observation", "ملاحظة الوالدين")}</div>
                    <p className="text-sm text-zinc-200 italic">{tx("\"Menunggu dengan sabar saat kakaknya menyelesaikan gilirannya.\"", "“Waited calmly while his sister finished her turn.”", "«انتظر بهدوء حتى أنهت أخته دورها.»")}</p>
                  </li>
                </ul>
                <p className="mt-6 pt-5 border-t border-white/10 text-xs text-zinc-400">
                  {tx("Tanpa poin, tanpa persentase - akhlak ditunjukkan, bukan dinilai.", "No points, no percentages - character is shown, not scored.", "بلا نقاط ولا نسب - الأخلاق تُرى ولا تُقاس بالدرجات.")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT PRINCIPLES */}
        <section id="principles" className={sectionCls}>
          <div className="mb-14 max-w-2xl">
            <Eyebrow>[ 04 / {tx("Prinsip konten kami", "Our content principles", "مبادئ المحتوى")} ]</Eyebrow>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight mb-4">{tx("Prinsip konten kami", "Our content principles", "مبادئ المحتوى لدينا")}</h2>
            <p className="text-zinc-300">{tx("Kepercayaan harus diperoleh. Inilah cara kami menangani konten Islami, AI, dan data keluarga Anda.", "Trust has to be earned. Here is how we handle Islamic content, AI and your family's data.", "الثقة تُكتسب. هكذا نتعامل مع المحتوى الإسلامي والذكاء الاصطناعي وبيانات عائلتك.")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {principles.map(({ icon: Icon, t: title, d }) => (
              <div key={title} className={`${cardCls} p-7`}>
                <div className="w-11 h-11 rounded-2xl border border-white/20 flex items-center justify-center mb-5"><Icon className="w-5 h-5" aria-hidden /></div>
                <h3 className="text-lg font-heading mb-2">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{d}</p>
              </div>
            ))}
            <Link to="/privacy" className={`${cardCls} p-7 flex flex-col justify-between hover:border-white/40 transition-colors`}>
              <Heart className="w-5 h-5 mb-5" aria-hidden />
              <div>
                <h3 className="text-lg font-heading mb-2">{tx("Privasi & keamanan anak", "Privacy & child safety", "الخصوصية وسلامة الطفل")}</h3>
                <span className="text-sm text-zinc-300 underline underline-offset-4">{tx("Baca komitmen privasi kami →", "Read our privacy commitments →", "اقرأ التزاماتنا للخصوصية ←")}</span>
              </div>
            </Link>
          </div>
        </section>

        {/* PRICING TEASER */}
        <section id="pricing" className={sectionCls}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <Eyebrow>[ 05 / {tx("Harga", "Pricing", "الأسعار")} ]</Eyebrow>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight">{tx("Mulai gratis. Upgrade saat cocok.", "Start free. Upgrade when it fits.", "ابدأ مجاناً. ورقِّ اشتراكك عندما يناسبك.")}</h2>
            </div>
            <Link to="/pricing" className="text-white hover:opacity-70 underline underline-offset-4 inline-flex items-center gap-2">
              {tx("Bandingkan semua paket", "Compare all plans", "قارن كل الخطط")} <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[free, family].map(p => (
              <div key={p.id} className={`${cardCls} p-7 ${p.highlight ? "border-white/40" : ""}`}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h3 className="text-xl font-heading">{loc(p.name, language)}</h3>
                  <div className="text-2xl font-light">
                    {p.priceUsd === 0 ? tx("$0", "$0", "٠$") : `$${p.priceUsd}`}
                    <span className="text-xs text-zinc-400 ms-1">{p.period === "year" ? tx("/ tahun", "/ year", "/ سنة") : p.period === "month" ? tx("/ bulan", "/ month", "/ شهر") : ""}</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-5">{loc(p.tagline, language)}</p>
                <ul className="space-y-2 text-sm text-zinc-200">
                  {p.features.slice(0, 4).map(f => (
                    <li key={f.en} className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-emerald-300 shrink-0" />{loc(f, language)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* LEAD MAGNET + SCHOOLS */}
        <section className={sectionCls}>
          <div className="grid lg:grid-cols-2 gap-5">
            <div className={`${cardCls} p-8 sm:p-10 flex flex-col justify-between`}>
              <div>
                <Moon className="w-6 h-6 mb-5" aria-hidden />
                <h2 className="text-2xl sm:text-3xl font-heading mb-3">{tx("30 Malam Kisah Nabi", "30 Nights of Prophetic Stories", "٣٠ ليلة من القصص النبوية")}</h2>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                  {tx("Program tidur gratis: satu cerita, satu pertanyaan diskusi, dan satu aksi kecil setiap malam.", "A free bedtime program: one story, one discussion question and one small action each night.", "برنامج مجاني قبل النوم: قصة وسؤال نقاش وعمل صغير كل ليلة.")}
                </p>
              </div>
              <Link to="/30-nights" className="self-start px-6 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200">
                {tx("Dapatkan program gratis", "Get the free program", "احصل على البرنامج المجاني")}
              </Link>
            </div>
            <div className={`${cardCls} p-8 sm:p-10 flex flex-col justify-between`}>
              <div>
                <School className="w-6 h-6 mb-5" aria-hidden />
                <h2 className="text-2xl sm:text-3xl font-heading mb-3">{tx("Untuk sekolah & organisasi", "For schools & organisations", "للمدارس والمؤسسات")}</h2>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                  {tx("Akun kelas, tugas cerita, dan panduan diskusi untuk sekolah Islam, TPA/TPQ, dan program komunitas.", "Classroom accounts, story assignments and discussion guides for Islamic schools, TPA/TPQ and community programs.", "حسابات صفية وتكليفات قصصية وأدلة نقاش للمدارس الإسلامية وحلقات التحفيظ والبرامج المجتمعية.")}
                </p>
              </div>
              <Link to="/classroom" className="self-start px-6 py-3 rounded-full border border-white/40 text-sm hover:bg-white/10">
                {tx("Jelajahi alat kelas", "Explore classroom tools", "استكشف أدوات الصف")}
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className={`${sectionCls} text-center`}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight leading-tight mb-6">{tx("Cerita malam ini bisa memulai kebiasaan.", "Tonight's story can start a habit.", "قصة الليلة قد تبدأ عادة.")}</h2>
            <p className="text-lg text-zinc-300 mb-10 max-w-xl mx-auto">
              {tx("Buat profil keluarga dalam beberapa menit. Gratis untuk mulai, tanpa kartu.", "Set up your family in a few minutes. Free to start, no card needed.", "أعدّ ملف عائلتك في دقائق. مجاني للبدء، بلا بطاقة.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/onboarding" className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black font-medium text-lg hover:bg-zinc-200 transition-all shadow-2xl">
                {tx("Mulai Perjalanan Belajar Keluarga", "Start Your Family Learning Journey", "ابدأ رحلة التعلم العائلية")}
              </Link>
              <Link to="/stories" className="w-full sm:w-auto px-10 py-5 rounded-full border border-white/40 text-white font-medium text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                {tx("Jelajahi Cerita", "Explore Stories", "استكشف القصص")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
