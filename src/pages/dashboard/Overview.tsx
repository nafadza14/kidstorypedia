import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Circle, Compass, MessageCircle, Sparkles, Target } from "lucide-react";
import { DiscussionCard } from "@/components/DiscussionCard";
import { Paywall } from "@/components/Paywall";
import { Panel, Stat, StoryCover, ValueChip, btn } from "@/components/kit";
import { findStory, loc } from "@/lib/content";
import { canAccessStory } from "@/lib/entitlements";
import { activation, childStats, fmtDuration, weeklySummary } from "@/lib/learning";
import { nextStep, recommendStories } from "@/lib/recommend";
import type { Story } from "@/types";
import { NoChild, SectionHeader, useDash } from "./shared";

function StoryRec({ story, reason, big }: { story: Story; reason: string; big?: boolean }) {
  const { state, language, tx } = useDash();
  const [paywall, setPaywall] = useState(false);
  const ok = canAccessStory(state, story);
  return (
    <div className={big ? "flex flex-col sm:flex-row gap-5" : "flex gap-4"}>
      <StoryCover story={story} locked={!ok} className={big ? "w-full sm:w-44 aspect-[3/4] rounded-2xl shrink-0" : "w-20 aspect-[3/4] rounded-xl shrink-0"} />
      <div className="flex-1 min-w-0">
        <div className={big ? "font-heading text-xl mb-1" : "font-heading text-base mb-1"}>{loc(story.title, language)}</div>
        <p className="text-xs text-zinc-400 mb-2 first-letter:uppercase">{reason}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">{story.values.slice(0, 3).map(v => <ValueChip key={v} id={v} />)}</div>
        {ok ? (
          <Link to={`/story/${story.id}`} className={big ? btn.primary : btn.small}><BookOpen className="w-3.5 h-3.5" />{tx("Baca", "Read", "اقرأ")}</Link>
        ) : (
          <button onClick={() => setPaywall(true)} className={big ? btn.ghost : btn.small}>{tx("Buka cerita", "Unlock story", "افتح القصة")}</button>
        )}
      </div>
      <Paywall open={paywall} onClose={() => setPaywall(false)} reason={tx("Cerita ini bagian dari perpustakaan premium.", "This story is part of the premium library.", "هذه القصة جزء من المكتبة المميزة.")} />
    </div>
  );
}

export default function Overview() {
  const { state, child, language, tx } = useDash();
  const [showDiscussion, setShowDiscussion] = useState(false);
  if (!child) return <NoChild />;

  const week = weeklySummary(state, child.id);
  const stats = childStats(state, child.id);
  const step = nextStep(state, child, language);
  const recs = recommendStories(state, child, language, 3).filter(r => r.story.id !== step?.story.id).slice(0, 2);
  const act = activation(state);

  const checklist = [
    { done: act.child, label: tx("Buat profil anak", "Create a child profile", "أنشئ ملف طفل"), to: "/dashboard/children" },
    { done: act.story, label: tx("Selesaikan cerita pertama bersama", "Complete a first story together", "أكملوا أول قصة معاً"), to: "/child" },
    { done: act.discussion, label: tx("Lakukan diskusi keluarga pertama", "Have a first family discussion", "أجروا أول نقاش عائلي"), to: "/dashboard/discussion" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={tx(`Minggu ${child.name}`, `${child.name}'s week`, `أسبوع ${child.name}`)}
        subtitle={tx("Apa yang dipelajari, didiskusikan, dan dipraktikkan anakmu minggu ini?", "What did your child learn, discuss, and practise this week?", "ماذا تعلّم طفلك وناقش ومارس هذا الأسبوع؟")}
      />

      {!act.activated && (
        <Panel title={tx("Memulai", "Getting started", "البداية")}>
          <ul className="grid sm:grid-cols-3 gap-3">
            {checklist.map((c, i) => (
              <li key={i}>
                <Link to={c.to} className={`flex items-center gap-3 rounded-2xl border p-4 text-sm transition-all ${c.done ? "border-emerald-400/30 bg-emerald-400/5 text-zinc-300" : "border-white/10 hover:border-white/30"}`}>
                  {c.done ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <Circle className="w-5 h-5 text-zinc-500 shrink-0" />}
                  <span className={c.done ? "line-through decoration-zinc-500" : ""}>{c.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {/* This week */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.07] to-transparent p-6 lg:col-span-1">
          <div className="text-[11px] font-mono text-zinc-400 mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />{tx("Bintang Utara · minggu ini", "North Star · this week", "المؤشر الرئيسي · هذا الأسبوع")}</div>
          <div className="text-5xl font-light tracking-tight">{week.meaningful}</div>
          <div className="text-sm text-zinc-300 mt-1">{tx("sesi belajar bermakna", "meaningful learning sessions", "جلسات تعلم هادفة")}</div>
          <p className="text-xs text-zinc-500 mt-3">{tx("Cerita selesai ditambah diskusi, refleksi, kuis, atau aksi di hari yang sama.", "A story completed plus a discussion, reflection, quiz or action on the same day.", "قصة مكتملة مع نقاش أو تأمل أو اختبار أو عمل في اليوم نفسه.")}</p>
        </div>
        <Panel className="lg:col-span-2" title={tx("Sekilas minggu ini", "This week at a glance", "لمحة عن هذا الأسبوع")}>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[11px] font-mono text-zinc-400 mb-1.5 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{tx("Dipelajari", "Learned", "تعلّم")}</div>
              {week.storiesCompleted.length ? (
                <ul className="space-y-1">{week.storiesCompleted.map(id => <li key={id} className="text-zinc-200 truncate">{loc(findStory(state, id)?.title, language) || id}</li>)}</ul>
              ) : <p className="text-zinc-500 text-xs">{tx("Belum ada cerita yang diselesaikan minggu ini.", "No stories completed yet this week.", "لم تكتمل أي قصة هذا الأسبوع بعد.")}</p>}
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400 mb-1.5 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />{tx("Didiskusikan", "Discussed", "ناقش")}</div>
              <p className="text-zinc-200">{tx(`${week.discussions} diskusi keluarga`, `${week.discussions} family discussion${week.discussions === 1 ? "" : "s"}`, `${week.discussions} نقاش عائلي`)}</p>
              <p className="text-zinc-400 text-xs mt-1">{tx(`${week.reflections.length} refleksi · ${week.observations.length} observasi`, `${week.reflections.length} reflection(s) · ${week.observations.length} observation(s)`, `${week.reflections.length} تأمل · ${week.observations.length} ملاحظة`)}</p>
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400 mb-1.5 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />{tx("Dipraktikkan", "Practised", "مارس")}</div>
              <p className="text-zinc-200">{tx(`${week.actions.length} tantangan aksi`, `${week.actions.length} action challenge(s)`, `${week.actions.length} تحدٍّ عملي`)}</p>
              <div className="flex flex-wrap gap-1 mt-2">{week.values.map(v => <ValueChip key={v} id={v} />)}</div>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-4">{tx(`Waktu membaca minggu ini: ${fmtDuration(week.readingSeconds)}`, `Reading time this week: ${fmtDuration(week.readingSeconds)}`, `وقت القراءة هذا الأسبوع: ${fmtDuration(week.readingSeconds)}`)}</p>
        </Panel>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label={tx("Cerita selesai", "Stories completed", "قصص مكتملة")} value={stats.storiesCompleted} />
        <Stat label={tx("Waktu membaca", "Reading time", "وقت القراءة")} value={fmtDuration(stats.readingSeconds)} />
        <Stat label={tx("Sesi belajar", "Learning sessions", "جلسات التعلم")} value={stats.learningSessions} />
        <Stat label={tx("Nilai dieksplorasi", "Values explored", "قيم مستكشفة")} value={`${stats.valuesExplored}/12`} />
        <Stat label={tx("Sesi diskusi", "Discussion sessions", "جلسات النقاش")} value={stats.discussions} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Panel className="lg:col-span-3" title={<span className="flex items-center gap-2"><Compass className="w-4 h-4" />{tx("Langkah belajar selanjutnya", "Next learning step", "خطوة التعلم التالية")}</span>}>
          {!step ? (
            <p className="text-sm text-zinc-400">{tx("Kamu sudah membaca semua cerita yang sesuai - luar biasa! Cerita baru ditambahkan secara berkala.", "You've read every suitable story - wonderful! New stories are added regularly.", "قرأتم كل القصص المناسبة - رائع! تُضاف قصص جديدة باستمرار.")}</p>
          ) : step.kind === "story" ? (
            <StoryRec story={step.story} reason={step.reason} big />
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <StoryCover story={step.story} className="w-16 aspect-[3/4] rounded-xl shrink-0" />
                <div>
                  <div className="text-[11px] font-mono text-amber-200 mb-1">{step.kind === "discuss" ? tx("Diskusikan", "Discuss", "ناقشوا") : tx("Praktikkan", "Practise", "مارسوا")}</div>
                  <div className="font-heading text-lg">{loc(step.story.title, language)}</div>
                  <p className="text-xs text-zinc-400">{step.reason}</p>
                </div>
              </div>
              {showDiscussion ? (
                <DiscussionCard story={step.story} childId={child.id} />
              ) : (
                <button className={btn.primary} onClick={() => setShowDiscussion(true)}>
                  {step.kind === "discuss" ? tx("Buka panduan diskusi", "Open discussion guide", "افتح دليل النقاش") : tx("Buka tantangan keluarga", "Open family challenge", "افتح التحدي العائلي")}
                </button>
              )}
            </div>
          )}
        </Panel>
        <Panel className="lg:col-span-2" title={tx("Lainnya untukmu", "More for you", "المزيد لكم")}>
          {recs.length ? <div className="space-y-5">{recs.map(r => <StoryRec key={r.story.id} story={r.story} reason={r.reason} />)}</div>
            : <p className="text-sm text-zinc-400">{tx("Tidak ada rekomendasi lain saat ini.", "No further recommendations right now.", "لا توجد توصيات أخرى الآن.")}</p>}
        </Panel>
      </div>
    </div>
  );
}
