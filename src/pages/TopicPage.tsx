import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, MessageCircle, Moon, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicShell } from "@/components/PublicNav";
import { StoryCover, ValueChip, btn } from "@/components/kit";
import { useStore } from "@/store";
import { useSeo } from "@/hooks/useSeo";
import { loc } from "@/lib/content";
import { SEO_TOPICS, topicMeta, topicStories, type SeoTopic } from "@/lib/seo";

/**
 * Keyword landing page (PRD §45): educational article, story previews,
 * a discussion-guide sample and a call to action.
 */
export default function TopicPage({ topic }: { topic: SeoTopic }) {
  const { tx, language } = useLanguage();
  const hasFamily = useStore(s => !!s.parent && s.children.length > 0);
  useSeo({ ...topicMeta(topic, language), lang: language });

  const stories = topicStories(topic);
  const sample = stories[0];
  const others = SEO_TOPICS.filter(t => t.slug !== topic.slug);

  return (
    <PublicShell>
      <div className="px-5 sm:px-8 max-w-6xl mx-auto pt-10 pb-20">
        <nav className="text-xs font-mono text-zinc-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white">Kidstorypedia</Link>
          <span className="mx-2 opacity-50">/</span>
          <Link to="/stories" className="hover:text-white">{tx("Cerita", "Stories", "القصص")}</Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-zinc-300">{loc(topic.h1, language)}</span>
        </nav>

        <header className="max-w-3xl mb-12">
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-[1.05] mb-5">{loc(topic.h1, language)}</h1>
          <p className="text-lg text-zinc-300 leading-relaxed">{loc(topic.description, language)}</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          <article className="lg:col-span-2 space-y-5 text-zinc-300 leading-relaxed text-[17px]">
            {topic.intro.map((p, i) => <p key={i}>{loc(p, language)}</p>)}
          </article>
          <aside className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 h-fit">
            <h2 className="font-heading text-lg mb-2">{tx("Coba malam ini", "Try it tonight", "جرّبها الليلة")}</h2>
            <p className="text-sm text-zinc-400 mb-5">{tx("Buat akun keluarga gratis, tambahkan anak, dan dapatkan cerita pertama yang sesuai usianya.", "Create a free family account, add your child and get a first story matched to their age.", "أنشئ حساباً عائلياً مجانياً وأضف طفلك واحصل على أول قصة مناسبة لعمره.")}</p>
            <Link to={hasFamily ? "/child" : "/onboarding"} className={btn.primary + " w-full"}>{tx("Mulai gratis", "Start free", "ابدأ مجاناً")}<ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" /></Link>
          </aside>
        </div>

        {/* story previews */}
        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-light mb-6">{tx(`${stories.length} cerita untuk dibaca`, `${stories.length} stories to read`, `${stories.length} قصص للقراءة`)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stories.map(s => (
              <Link key={s.id} to={`/stories/${s.slug}`} className="group rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 hover:border-white/40 transition-colors flex flex-col">
                <StoryCover story={s} locked={s.premium} className="aspect-[16/10]" />
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <h3 className="font-heading text-lg leading-snug group-hover:underline underline-offset-4 decoration-white/30">{loc(s.title, language)}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-2">{loc(s.description, language)}</p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 mt-1">
                    <span>{tx(`Usia ${s.ageRange[0]}–${s.ageRange[1]}`, `Ages ${s.ageRange[0]}–${s.ageRange[1]}`, `الأعمار ${s.ageRange[0]}–${s.ageRange[1]}`)}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{s.durationMin} {tx("mnt", "min", "د")}</span>
                    {s.bedtime && <Moon className="w-3 h-3" />}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-2">{s.values.map(v => <ValueChip key={v} id={v} />)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* discussion guide sample */}
        {sample && (
          <section className="mt-16">
            <h2 className="text-2xl sm:text-3xl font-light mb-2">{tx("Contoh panduan diskusi", "A sample discussion guide", "نموذج من دليل النقاش")}</h2>
            <p className="text-sm text-zinc-400 mb-6">{tx(`Dari "${loc(sample.title, "id")}"`, `From "${loc(sample.title, "en")}"`, `من «${loc(sample.title, "ar")}»`)}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-3"><MessageCircle className="w-3.5 h-3.5" />{tx("Tanyakan bersama", "Ask together", "اسألا معاً")}</div>
                <ol className="list-decimal ps-5 space-y-2 text-zinc-100">
                  {sample.discussion.questions.map((q, i) => <li key={i}>{loc(q, language)}</li>)}
                </ol>
              </div>
              <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-3"><Zap className="w-3.5 h-3.5" />{tx("Tantangan aksi keluarga", "Family action challenge", "تحدي العمل العائلي")}</div>
                <p className="text-zinc-100 mb-4">{loc(sample.discussion.action, language)}</p>
                <div className="text-xs font-mono text-zinc-400 mb-1">{tx("Refleksi", "Reflection", "تأمّل")}</div>
                <p className="text-zinc-300">{loc(sample.discussion.reflection, language)}</p>
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-light mb-6">{tx("Pertanyaan umum", "Frequently asked questions", "أسئلة شائعة")}</h2>
          <div className="space-y-3">
            {topic.faq.map((f, i) => (
              <details key={i} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 group" open={i === 0}>
                <summary className="cursor-pointer font-medium list-none flex justify-between gap-4">{loc(f.q, language)}<span className="text-zinc-500 group-open:rotate-45 transition-transform">+</span></summary>
                <p className="text-zinc-400 mt-3">{loc(f.a, language)}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl border border-white/15 bg-white/[0.04] p-8 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-light mb-3">{tx("Satu cerita. Satu percakapan. Satu nilai.", "One story. One conversation. One value.", "قصة واحدة. حوار واحد. قيمة واحدة.")}</h2>
          <p className="text-zinc-400 mb-6 max-w-lg mx-auto text-sm">{tx("Tanpa iklan, dikendalikan orang tua, dalam Bahasa Indonesia, Inggris, dan Arab.", "Ad-free, parent-controlled, in Indonesian, English and Arabic.", "بلا إعلانات، بتحكم الوالدين، بالإندونيسية والإنجليزية والعربية.")}</p>
          <Link to={hasFamily ? "/child" : "/onboarding"} className={btn.primary}>{tx("Mulai perjalanan keluarga", "Start your family journey", "ابدأ رحلة العائلة")}</Link>
        </section>

        {/* internal links */}
        <nav className="mt-16" aria-label={tx("Topik lain", "More topics", "مواضيع أخرى")}>
          <h2 className="text-sm font-mono text-zinc-500 mb-3">{tx("Topik lain", "More topics", "مواضيع أخرى")}</h2>
          <div className="flex flex-wrap gap-2">
            {others.map(t => (
              <Link key={t.slug} to={`/${t.slug}`} className="px-4 py-2 rounded-full border border-white/15 text-sm text-zinc-300 hover:bg-white/10">{loc(t.h1, language)}</Link>
            ))}
          </div>
        </nav>
      </div>
    </PublicShell>
  );
}
