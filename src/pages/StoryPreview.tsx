import React, { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, MessageCircle, Moon, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicShell } from "@/components/PublicNav";
import { ReviewBadge, StoryCover, ValueChip, btn } from "@/components/kit";
import { useStore } from "@/store";
import { familyStories, findStory, loc } from "@/lib/content";
import { track } from "@/lib/analytics";
import { CATEGORIES, VALUE_MAP } from "@/data/values";
import { SOURCE_MAP } from "@/data/sources";
import { useSeo } from "@/hooks/useSeo";
import type { SourceType } from "@/types";

const SOURCE_TYPE: Record<SourceType, [string, string]> = {
  quran: ["Qur'an", "القرآن"],
  hadith: ["Hadith", "الحديث"],
  sirah: ["Sirah", "السيرة"],
  tafsir: ["Tafsir", "التفسير"],
  scholarly: ["Scholarly", "مرجع علمي"],
  original_fable: ["Original fable", "حكاية أصلية"],
};

export default function StoryPreview() {
  const { slug } = useParams();
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const hasFamily = !!state.parent && state.children.length > 0;

  // only published / family-visible stories get a public page
  const story = useMemo(() => {
    const s = findStory(state, slug);
    return s && familyStories(state).some(f => f.id === s.id) ? s : undefined;
  }, [state, slug]);

  const related = useMemo(() => {
    if (!story) return [];
    return familyStories(state)
      .filter(s => s.id !== story.id)
      .map(s => ({ s, n: s.values.filter(v => story.values.includes(v)).length + (s.category === story.category ? 0.5 : 0) }))
      .filter(x => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 3)
      .map(x => x.s);
  }, [state, story]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  useSeo(
    story
      ? {
          title: `${story.title.en} - Islamic Story for Kids Ages ${story.ageRange[0]}–${story.ageRange[1]} | Kidstorypedia`,
          description: `${story.description.en} Teaches ${story.values.map(v => VALUE_MAP[v].name.en.toLowerCase()).join(" and ")}. Includes sources, a parent discussion guide and a family action challenge.`,
          canonical: `/stories/${story.slug}`,
          image: story.coverImage,
          type: "book",
          jsonLd: {
            "@context": "https://schema.org",
            "@type": ["Book", "CreativeWork"],
            name: story.title.en,
            alternateName: story.title.ar,
            description: story.description.en,
            url: `${origin}/stories/${story.slug}`,
            image: story.coverImage,
            inLanguage: story.title.ar ? ["en", "ar"] : ["en"],
            genre: CATEGORIES.find(c => c.id === story.category)?.name.en,
            timeRequired: `PT${story.durationMin}M`,
            audience: { "@type": "PeopleAudience", suggestedMinAge: story.ageRange[0], suggestedMaxAge: story.ageRange[1] },
            about: story.values.map(v => ({ "@type": "Thing", name: VALUE_MAP[v].name.en })),
            isAccessibleForFree: !story.premium,
            publisher: { "@type": "Organization", name: "Kidstorypedia" },
            citation: story.sources.map(id => SOURCE_MAP[id]?.reference).filter(Boolean),
          },
        }
      : { title: tx("Cerita tidak ditemukan | Kidstorypedia", "Story not found | Kidstorypedia", "القصة غير موجودة | كيدستوريبيديا") },
  );

  useEffect(() => { if (story) track("story_viewed", { storyId: story.id, surface: "public_preview" }); }, [story?.id]);

  if (!story) {
    return (
      <PublicShell>
        <div className="max-w-lg mx-auto px-5 py-24 text-center">
          <h1 className="text-2xl font-heading mb-3">{tx("Cerita tidak ditemukan", "Story not found", "القصة غير موجودة")}</h1>
          <p className="text-sm text-zinc-400 mb-6">{tx("Mungkin masih dalam peninjauan atau tautannya salah.", "It may still be in review or the link may be wrong.", "قد تكون قيد المراجعة أو أن الرابط غير صحيح.")}</p>
          <Link to="/stories" className={btn.primary}>{tx("Jelajahi semua cerita", "Browse all stories", "تصفّح كل القصص")}</Link>
        </div>
      </PublicShell>
    );
  }

  const cat = CATEGORIES.find(c => c.id === story.category);
  const firstPage = story.pages[0];
  const pageSources = firstPage?.sourceRefs.map(id => SOURCE_MAP[id]).filter(Boolean) || [];
  const ctaTo = hasFamily ? `/story/${story.id}` : "/onboarding";

  return (
    <PublicShell>
      <div className="px-5 sm:px-8 max-w-6xl mx-auto pt-8 pb-20">
        <Link to="/stories" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />{tx("Semua cerita", "All stories", "كل القصص")}
        </Link>

        {/* header */}
        <header className="grid md:grid-cols-5 gap-8 items-start mb-16">
          <StoryCover story={story} className="md:col-span-2 aspect-[4/5] rounded-3xl border border-white/10" />
          <div className="md:col-span-3">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400 mb-4">
              <span>{cat ? loc(cat.name, language) : story.category}</span>
              <span className="opacity-40">•</span>
              <span>{tx(`Usia ${story.ageRange[0]}–${story.ageRange[1]}`, `Ages ${story.ageRange[0]}–${story.ageRange[1]}`, `الأعمار ${story.ageRange[0]}–${story.ageRange[1]}`)}</span>
              <span className="opacity-40">•</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{story.durationMin} {tx("mnt", "min", "د")}</span>
              {story.bedtime && <span className="inline-flex items-center gap-1"><Moon className="w-3 h-3" />{tx("Pengantar tidur", "Bedtime", "قبل النوم")}</span>}
              <ReviewBadge state={story.state} />
            </div>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight leading-tight mb-4">{loc(story.title, language)}</h1>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">{loc(story.description, language)}</p>
            <div className="flex flex-wrap gap-2 mb-8">{story.values.map(v => <ValueChip key={v} id={v} size="md" />)}</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={ctaTo} className={btn.primary}><BookOpen className="w-4 h-4" />{tx("Baca cerita lengkap bersama anakmu", "Read the full story with your child", "اقرأ القصة كاملة مع طفلك")}</Link>
              {story.premium && <Link to="/pricing" className={btn.ghost}>{tx("Termasuk dalam paket Keluarga", "Included in Family plans", "مشمولة في خطط العائلة")}</Link>}
            </div>
            {story.state !== "published" && (
              <p className="mt-5 text-xs text-amber-200/90 max-w-lg">
                {tx("Cerita ini disusun dari sumber-sumber utama di bawah dan menunggu persetujuan ulama. Mungkin berubah setelah peninjauan.", "This story was drafted from the primary sources below and is awaiting scholar sign-off. It may change after review.", "صيغت هذه القصة من المصادر الأساسية أدناه وتنتظر اعتماد المراجعة العلمية، وقد تتغير بعد المراجعة.")}
              </p>
            )}
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* article */}
          <article className="lg:col-span-2 space-y-12">
            {story.historicalContext && (
              <section>
                <h2 className="text-2xl font-heading mb-3">{tx("Tentang cerita ini", "About this story", "عن هذه القصة")}</h2>
                <p className="text-zinc-300 leading-relaxed">{loc(story.historicalContext, language)}</p>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-heading mb-4">{tx("Apa yang akan dipelajari anakmu", "What your child will learn", "ماذا سيتعلم طفلك")}</h2>
              <ul className="space-y-3">
                {story.values.map(v => (
                  <li key={v} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: VALUE_MAP[v].color }} />
                    <div>
                      <div className="font-medium">{loc(VALUE_MAP[v].name, language)}</div>
                      <p className="text-sm text-zinc-400">{loc(VALUE_MAP[v].description, language)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {firstPage && (
              <section>
                <h2 className="text-2xl font-heading mb-4">{tx("Cuplikan cerita", "Story preview", "مقتطف من القصة")}</h2>
                <blockquote className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 sm:p-8">
                  <p className="text-lg sm:text-xl font-light leading-relaxed text-zinc-100" dir={language === "ar" && firstPage.text.ar ? "rtl" : undefined}>
                    {loc(firstPage.text, language)}
                  </p>
                  {pageSources.length > 0 && (
                    <footer className="mt-4 text-xs font-mono text-zinc-500">{tx("Sumber: ", "Source: ", "المصدر: ")}{pageSources.map(s => s.reference).join("; ")}</footer>
                  )}
                </blockquote>
                <p className="text-sm text-zinc-400 mt-3">{tx(`Halaman 1 dari ${story.pages.length}.`, `Page 1 of ${story.pages.length}.`, `الصفحة ١ من ${story.pages.length}.`)}</p>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-heading mb-4">{tx("Cuplikan panduan diskusi", "Discussion guide preview", "مقتطف من دليل النقاش")}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2"><MessageCircle className="w-3.5 h-3.5" />{tx("Tanyakan bersama", "Ask together", "اسألا معاً")}</div>
                  <p className="text-zinc-100">{loc(story.discussion.questions[0], language)}</p>
                  <p className="text-xs text-zinc-500 mt-3">{tx(`+${Math.max(0, story.discussion.questions.length - 1)} pertanyaan lagi, refleksi dan doa di aplikasi`, `+${Math.max(0, story.discussion.questions.length - 1)} more questions, a reflection and a du'a in the app`, `+${Math.max(0, story.discussion.questions.length - 1)} أسئلة أخرى وتأمل ودعاء في التطبيق`)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2"><Zap className="w-3.5 h-3.5" />{tx("Tantangan aksi keluarga", "Family action challenge", "تحدي العمل العائلي")}</div>
                  <p className="text-zinc-100">{loc(story.discussion.action, language)}</p>
                </div>
              </div>
            </section>
          </article>

          {/* sources sidebar */}
          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="font-heading text-lg">{tx("Sumber", "Sources", "المصادر")}</h2>
                <ReviewBadge state={story.state} />
              </div>
              <ul className="space-y-3">
                {story.sources.map(id => SOURCE_MAP[id]).filter(Boolean).map(s => (
                  <li key={s.id} className="text-sm">
                    <div className="text-[10px] font-mono uppercase tracking-wide text-zinc-500">{tx(SOURCE_TYPE[s.type][0], SOURCE_TYPE[s.type][0], SOURCE_TYPE[s.type][1])}</div>
                    <div className="text-zinc-100">{s.reference}</div>
                    {s.note && <div className="text-xs text-zinc-400">{s.note}</div>}
                  </li>
                ))}
              </ul>
              {story.reviewer && story.state === "published" && (
                <p className="text-xs text-zinc-500 mt-4 pt-4 border-t border-white/10">{tx(`Ditinjau oleh ${story.reviewer}${story.reviewDate ? ` · ${story.reviewDate}` : ""}`, `Reviewed by ${story.reviewer}${story.reviewDate ? ` · ${story.reviewDate}` : ""}`, `راجعها ${story.reviewer}${story.reviewDate ? ` · ${story.reviewDate}` : ""}`)}</p>
              )}
              <p className="text-xs text-zinc-500 mt-4">{tx(`Versi ${story.version}`, `Version ${story.version}`, `الإصدار ${story.version}`)}</p>
            </section>
            <section className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 text-sm text-zinc-400 space-y-2">
              <p>{tx("Wajah para Nabi tidak digambarkan. Tidak ada ucapan yang dinisbatkan kepada para Nabi di luar teks yang dikutip.", "No faces of Prophets are depicted. No quotes are attributed to Prophets beyond the cited texts.", "لا تُصوَّر وجوه الأنبياء، ولا يُنسب إليهم قول خارج النصوص المذكورة.")}</p>
              <Link to="/#principles" className="underline underline-offset-4 hover:text-white">{tx("Prinsip konten kami", "Our content principles", "مبادئ المحتوى")}</Link>
            </section>
          </aside>
        </div>

        {/* bottom CTA */}
        <section className="mt-16 rounded-3xl border border-white/15 bg-white/[0.04] p-8 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-light mb-3">{tx("Baca cerita lengkap bersama anakmu", "Read the full story with your child", "اقرأ القصة كاملة مع طفلك")}</h2>
          <p className="text-zinc-400 mb-6 max-w-lg mx-auto text-sm">{tx("Narasi suara, teks sesuai usia, panduan diskusi lengkap, dan tempat mencatat apa yang dipraktikkan keluargamu.", "Narration, age-adapted text, the full discussion guide and a place to record what your family practised.", "سرد صوتي ونص مناسب للعمر ودليل نقاش كامل ومكان لتسجيل ما مارسته عائلتك.")}</p>
          <Link to={ctaTo} className={btn.primary}>{hasFamily ? tx("Buka di pembaca", "Open in reader", "افتح في القارئ") : tx("Mulai gratis", "Start free", "ابدأ مجاناً")}</Link>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-heading mb-6">{tx("Cerita terkait", "Related stories", "قصص ذات صلة")}</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map(r => (
                <Link key={r.id} to={`/stories/${r.slug}`} className="group rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 hover:border-white/40 transition-colors">
                  <StoryCover story={r} locked={r.premium} className="aspect-[16/10]" />
                  <div className="p-4">
                    <h3 className="font-heading leading-snug mb-2">{loc(r.title, language)}</h3>
                    <div className="flex flex-wrap gap-1.5">{r.values.map(v => <ValueChip key={v} id={v} />)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicShell>
  );
}
