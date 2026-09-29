import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight, BookOpen, Check, Compass, Heart, Languages, MessageCircle, Moon, School, ShieldCheck,
  Sparkles, Sprout, UserCheck, Zap, Ban, Cpu, Eye, Scale, FileText, Clock,
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

const sectionCls = "py-20 sm:py-24 px-5 sm:px-8 max-w-7xl mx-auto border-t border-white/10";
const cardCls = "rounded-3xl bg-zinc-950/40 border border-white/10 backdrop-blur-md";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-zinc-400 font-mono mb-3 block">{children}</span>;
}

export default function Landing() {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const hasParent = !!state.parent;

  useSeo({
    title: tx("Kidstorypedia — A better bedtime routine for Muslim families", "كيدستوريبيديا — روتين أفضل قبل النوم للعائلات المسلمة"),
    description: tx(
      "Islamic stories for kids with parent discussion guides and real-life value challenges. Prophets, Seerah, Sahabah and moral stories in English and Arabic. Ad-free and parent-controlled.",
      "قصص إسلامية للأطفال مع أدلة نقاش للوالدين وتحديات عملية للقيم. الأنبياء والسيرة والصحابة وقصص أخلاقية بالعربية والإنجليزية، بلا إعلانات.",
    ),
    canonical: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Kidstorypedia",
      description: "A better bedtime routine for Muslim families. Every story becomes an opportunity to grow.",
      inLanguage: ["en", "ar"],
    },
  });

  useEffect(() => { track("landing_view"); }, []);

  const featured = useMemo(() => {
    const all = familyStories(state);
    // published first, then one per category for variety
    const sorted = [...all].sort((a, b) => Number(b.state === "published") - Number(a.state === "published"));
    const picked: typeof all = [];
    for (const c of CATEGORIES) { const s = sorted.find(x => x.category === c.id); if (s) picked.push(s); }
    for (const s of sorted) { if (picked.length >= 5) break; if (!picked.includes(s)) picked.push(s); }
    return picked.slice(0, 5);
  }, [state]);

  const trust = [
    { icon: Ban, label: tx("Ad-free", "بلا إعلانات") },
    { icon: Languages, label: tx("Bilingual English / Arabic", "ثنائي اللغة: عربي / إنجليزي") },
    { icon: Cpu, label: tx("Responsible AI", "ذكاء اصطناعي مسؤول") },
    { icon: ShieldCheck, label: tx("Islamic content principles — sourced & reviewed", "مبادئ المحتوى الإسلامي — موثّق ومُراجَع") },
    { icon: UserCheck, label: tx("Parent-controlled", "بتحكم الوالدين") },
  ];

  const loop = [
    { icon: Compass, t: tx("Discover", "اكتشف"), d: tx("A story matched to your child's age and the values you're working on.", "قصة تناسب عمر طفلك والقيم التي تعملون عليها.") },
    { icon: BookOpen, t: tx("Read", "اقرأ"), d: tx("Read together, or listen with narration, in English or Arabic.", "اقرؤوا معاً أو استمعوا للسرد بالعربية أو الإنجليزية.") },
    { icon: Sparkles, t: tx("Understand", "افهم"), d: tx("Age-appropriate text and a short glossary for new words.", "نص مناسب للعمر ومسرد قصير للكلمات الجديدة.") },
    { icon: MessageCircle, t: tx("Discuss", "ناقش"), d: tx("Three guided questions help parents start a real conversation.", "ثلاثة أسئلة موجّهة تساعد الوالدين على بدء حوار حقيقي.") },
    { icon: Zap, t: tx("Practice", "مارس"), d: tx("A small family action challenge brings the value into daily life.", "تحدٍّ عائلي صغير ينقل القيمة إلى الحياة اليومية.") },
    { icon: Moon, t: tx("Reflect", "تأمّل"), d: tx("A calm reflection prompt and du'a to close the evening.", "سؤال تأمل هادئ ودعاء لختام المساء.") },
    { icon: Sprout, t: tx("Grow", "انمُ"), d: tx("The Character Journal records what your family practised — no scores.", "دفتر الأخلاق يسجّل ما مارسته العائلة — بلا درجات.") },
  ];

  const principles = [
    { icon: FileText, t: tx("Sources cited on every page", "مصادر موثّقة في كل صفحة"), d: tx("Every page of a canonical story references the Qur'an, hadith or sirah text it draws from, so parents can check it.", "كل صفحة من القصص الأساسية تشير إلى الآية أو الحديث أو السيرة المستندة إليها ليتحقق الوالدان.") },
    { icon: Scale, t: tx("Scholar review workflow", "مسار مراجعة علمية"), d: tx("Stories move through source, editorial and scholar review before publishing. Stories still in review are clearly labelled.", "تمر القصص بمراجعة المصادر والتحرير والمراجعة العلمية قبل النشر، والقصص قيد المراجعة موسومة بوضوح.") },
    { icon: Eye, t: tx("Faceless illustrations", "رسوم بلا وجوه"), d: tx("No depiction of Prophets or their faces. Illustrations focus on places, nature and objects.", "لا تصوير للأنبياء أو وجوههم. تركّز الرسوم على الأماكن والطبيعة والأشياء.") },
    { icon: Cpu, t: tx("AI grounded in approved sources", "ذكاء اصطناعي مقيّد بالمصادر المعتمدة"), d: tx("AI only adapts reviewed content and is checked against allowed facts. It never invents quotes, hadith or events.", "يعمل الذكاء الاصطناعي على المحتوى المُراجَع فقط ويُتحقَّق منه مقابل الحقائق المسموحة، ولا يختلق أقوالاً أو أحاديث أو أحداثاً.") },
    { icon: Ban, t: tx("No ads, no behavioural tracking", "بلا إعلانات ولا تتبع سلوكي"), d: tx("We collect only a child's first name and age. Nothing is sold or used for advertising.", "نجمع الاسم الأول للطفل وعمره فقط. لا نبيع أي بيانات ولا نستخدمها للإعلانات.") },
  ];

  const free = PLANS.find(p => p.id === "free")!;
  const family = PLANS.find(p => p.id === "premium_annual")!;

  return (
    <div className="relative min-h-screen bg-black/40 text-white selection:bg-white selection:text-black overflow-x-hidden font-body">
      {/* Background (kept from v1) */}
      <img src="https://i.imgur.com/bpuBPTG.png" alt="" className="fixed inset-0 z-0 w-full h-full object-cover object-center pointer-events-none" />
      <div className="fixed inset-0 z-[1] bg-black/25 backdrop-blur-[0.5px] pointer-events-none" />
      <div className="fixed inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/25 to-black/35 pointer-events-none" />

      <PublicNav transparent />

      <main className="relative z-10">
        {/* HERO */}
        <section className="min-h-screen pt-28 sm:pt-36 pb-12 px-5 sm:px-8 max-w-7xl mx-auto flex flex-col justify-between">
          <div className="grid lg:grid-cols-12 gap-8 items-center my-auto">
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md mb-6 text-xs sm:text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{tx("Every story becomes an opportunity to grow.", "كل قصة فرصة للنمو.")}</span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05] mb-6">
                {tx("A better bedtime routine for", "روتين أفضل قبل النوم")}{" "}
                <span className="font-heading font-medium underline decoration-white/40 decoration-2 underline-offset-8">
                  {tx("Muslim families", "للعائلات المسلمة")}
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-zinc-200 font-light max-w-xl leading-relaxed mb-10">
                {tx("Read a story. Start a conversation. Practice a value. Build character.", "اقرأ قصة. ابدأ حواراً. مارس قيمة. ابنِ الأخلاق.")}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link to="/onboarding" className="px-8 py-4 rounded-full bg-white text-black font-medium text-base sm:text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl group">
                  <span>{tx("Start Your Family Learning Journey", "ابدأ رحلة التعلم العائلية")}</span>
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
                </Link>
                <Link to="/stories" className="px-8 py-4 rounded-full border border-white/40 text-white font-medium text-base sm:text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                  {tx("Explore Stories", "استكشف القصص")}
                </Link>
              </div>
              {hasParent && (
                <Link to="/dashboard" className="mt-5 text-sm text-zinc-300 underline underline-offset-4 hover:text-white">
                  {tx("Continue to your parent portal →", "المتابعة إلى بوابة الوالدين ←")}
                </Link>
              )}
            </div>
            <div className="hidden lg:block lg:col-span-5" />
          </div>

          {/* Trust indicators */}
          <ul className="pt-8 border-t border-white/10 flex flex-wrap justify-center lg:justify-between gap-x-6 gap-y-3 text-xs sm:text-sm text-zinc-300">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="w-4 h-4 text-white/80" aria-hidden />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FEATURED STORIES */}
        <section id="featured" className={sectionCls}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <Eyebrow>[ 01 / {tx("Featured stories", "قصص مختارة")} ]</Eyebrow>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight">{tx("Featured stories", "قصص مختارة")}</h2>
            </div>
            <Link to="/stories" className="text-white hover:opacity-70 underline underline-offset-4 inline-flex items-center gap-2">
              {tx("Browse the full library", "تصفّح المكتبة كاملة")} <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
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
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{story.durationMin} {tx("min", "د")}</span>
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

        {/* HOW IT WORKS — the learning loop */}
        <section id="how-it-works" className={sectionCls}>
          <div className="mb-14 max-w-2xl">
            <Eyebrow>[ 02 / {tx("How it works", "طريقة العمل")} ]</Eyebrow>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight mb-4">{tx("More than a story app", "أكثر من تطبيق قصص")}</h2>
            <p className="text-zinc-300">{tx("Each story is a small learning loop your family can finish in one evening.", "كل قصة حلقة تعلم صغيرة يمكن لعائلتك إتمامها في أمسية واحدة.")}</p>
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
              <Eyebrow>[ 03 / {tx("12 values", "١٢ قيمة")} ]</Eyebrow>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight mb-6">{tx("Twelve values, practised together", "اثنتا عشرة قيمة نمارسها معاً")}</h2>
              <p className="text-zinc-300 leading-relaxed mb-8 text-base sm:text-lg">
                {tx(
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
                      <h3 className="text-sm font-heading">{tx("Character Journal", "دفتر الأخلاق")}</h3>
                      <p className="text-xs text-zinc-400">{tx("Sample · this month", "نموذج · هذا الشهر")}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-white/10 text-zinc-300 border border-white/15">{tx("Example", "مثال")}</span>
                </div>
                <ul className="space-y-3">
                  {[
                    { v: "patience" as const, en: "Practised Patience in 4 learning activities", ar: "مارس الصبر في ٤ أنشطة تعلم" },
                    { v: "gratitude" as const, en: "Talked about Gratitude after 2 stories", ar: "تحدّث عن الشكر بعد قصتين" },
                    { v: "honesty" as const, en: "Completed 1 Honesty action challenge", ar: "أكمل تحدياً عملياً واحداً في الصدق" },
                  ].map(r => (
                    <li key={r.v} className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-3">
                      <span className="text-sm">{tx(r.en, r.ar)}</span>
                      <ValueChip id={r.v} />
                    </li>
                  ))}
                  <li className="p-4 rounded-2xl bg-black/30 border border-white/5">
                    <div className="text-[11px] font-mono text-zinc-500 mb-1">{tx("Parent observation", "ملاحظة الوالدين")}</div>
                    <p className="text-sm text-zinc-200 italic">{tx("“Waited calmly while his sister finished her turn.”", "«انتظر بهدوء حتى أنهت أخته دورها.»")}</p>
                  </li>
                </ul>
                <p className="mt-6 pt-5 border-t border-white/10 text-xs text-zinc-400">
                  {tx("No points, no percentages — character is shown, not scored.", "بلا نقاط ولا نسب — الأخلاق تُرى ولا تُقاس بالدرجات.")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT PRINCIPLES */}
        <section id="principles" className={sectionCls}>
          <div className="mb-14 max-w-2xl">
            <Eyebrow>[ 04 / {tx("Our content principles", "مبادئ المحتوى")} ]</Eyebrow>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight mb-4">{tx("Our content principles", "مبادئ المحتوى لدينا")}</h2>
            <p className="text-zinc-300">{tx("Trust has to be earned. Here is how we handle Islamic content, AI and your family's data.", "الثقة تُكتسب. هكذا نتعامل مع المحتوى الإسلامي والذكاء الاصطناعي وبيانات عائلتك.")}</p>
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
                <h3 className="text-lg font-heading mb-2">{tx("Privacy & child safety", "الخصوصية وسلامة الطفل")}</h3>
                <span className="text-sm text-zinc-300 underline underline-offset-4">{tx("Read our privacy commitments →", "اقرأ التزاماتنا للخصوصية ←")}</span>
              </div>
            </Link>
          </div>
        </section>

        {/* PRICING TEASER */}
        <section id="pricing" className={sectionCls}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <Eyebrow>[ 05 / {tx("Pricing", "الأسعار")} ]</Eyebrow>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight">{tx("Start free. Upgrade when it fits.", "ابدأ مجاناً. ورقِّ اشتراكك عندما يناسبك.")}</h2>
            </div>
            <Link to="/pricing" className="text-white hover:opacity-70 underline underline-offset-4 inline-flex items-center gap-2">
              {tx("Compare all plans", "قارن كل الخطط")} <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[free, family].map(p => (
              <div key={p.id} className={`${cardCls} p-7 ${p.highlight ? "border-white/40" : ""}`}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h3 className="text-xl font-heading">{loc(p.name, language)}</h3>
                  <div className="text-2xl font-light">
                    {p.priceUsd === 0 ? tx("$0", "٠$") : `$${p.priceUsd}`}
                    <span className="text-xs text-zinc-400 ms-1">{p.period === "year" ? tx("/ year", "/ سنة") : p.period === "month" ? tx("/ month", "/ شهر") : ""}</span>
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
                <h2 className="text-2xl sm:text-3xl font-heading mb-3">{tx("30 Nights of Prophetic Stories", "٣٠ ليلة من القصص النبوية")}</h2>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                  {tx("A free bedtime program: one story, one discussion question and one small action each night.", "برنامج مجاني قبل النوم: قصة وسؤال نقاش وعمل صغير كل ليلة.")}
                </p>
              </div>
              <Link to="/30-nights" className="self-start px-6 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200">
                {tx("Get the free program", "احصل على البرنامج المجاني")}
              </Link>
            </div>
            <div className={`${cardCls} p-8 sm:p-10 flex flex-col justify-between`}>
              <div>
                <School className="w-6 h-6 mb-5" aria-hidden />
                <h2 className="text-2xl sm:text-3xl font-heading mb-3">{tx("For schools & organisations", "للمدارس والمؤسسات")}</h2>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                  {tx("Classroom accounts, story assignments and discussion guides for Islamic schools, TPA/TPQ and community programs.", "حسابات صفية وتكليفات قصصية وأدلة نقاش للمدارس الإسلامية وحلقات التحفيظ والبرامج المجتمعية.")}
                </p>
              </div>
              <Link to="/classroom" className="self-start px-6 py-3 rounded-full border border-white/40 text-sm hover:bg-white/10">
                {tx("Explore classroom tools", "استكشف أدوات الصف")}
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className={`${sectionCls} text-center`}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight leading-tight mb-6">{tx("Tonight's story can start a habit.", "قصة الليلة قد تبدأ عادة.")}</h2>
            <p className="text-lg text-zinc-300 mb-10 max-w-xl mx-auto">
              {tx("Set up your family in a few minutes. Free to start, no card needed.", "أعدّ ملف عائلتك في دقائق. مجاني للبدء، بلا بطاقة.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/onboarding" className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black font-medium text-lg hover:bg-zinc-200 transition-all shadow-2xl">
                {tx("Start Your Family Learning Journey", "ابدأ رحلة التعلم العائلية")}
              </Link>
              <Link to="/stories" className="w-full sm:w-auto px-10 py-5 rounded-full border border-white/40 text-white font-medium text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                {tx("Explore Stories", "استكشف القصص")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
