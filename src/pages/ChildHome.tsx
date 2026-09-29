import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Play, Lock, Sparkles, Star, Moon, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Avatar, StoryCover } from "@/components/kit";
import { Paywall } from "@/components/Paywall";
import { PinGate } from "@/components/PinGate";
import { BADGES } from "@/data/catalog";
import { CATEGORIES, VALUE_MAP } from "@/data/values";
import { familyStories, findStory, isAgeSuitable, loc } from "@/lib/content";
import { canAccessStory } from "@/lib/entitlements";
import { readingSecondsToday, valueJourney } from "@/lib/learning";
import { recommendStories } from "@/lib/recommend";
import { activeChild, setState, useStore } from "@/store";
import type { Story, StoryCategory } from "@/types";

/**
 * Kids Experience (PRD §15): low cognitive load, large visual cards, no ads,
 * no external links, parent-protected exit.
 */
export default function ChildHome() {
  const { language, tx } = useLanguage();
  const nav = useNavigate();
  const state = useStore(s => s);
  const child = activeChild(state)!;
  const [gate, setGate] = useState<null | string>(null);
  const [paywall, setPaywall] = useState(false);
  const [cat, setCat] = useState<StoryCategory | "all">("all");

  const stories = useMemo(() => familyStories(state).filter(s => isAgeSuitable(s, child.age)), [state, child.age]);
  const myEvents = state.events.filter(e => e.childId === child.id);
  const completedIds = [...new Set(myEvents.filter(e => e.type === "story_completed").map(e => e.storyId!))];
  const inProgress = [...state.sessions].reverse().find(x => x.childId === child.id && !x.completed);
  const continueStory = findStory(state, inProgress?.storyId);
  const recs = recommendStories(state, child, language, 4).map(r => r.story);
  const recent = completedIds.slice(-6).reverse().map(id => findStory(state, id)).filter(Boolean) as Story[];
  const journey = valueJourney(state, child.id).filter(j => j.total > 0).sort((a, b) => b.total - a.total);
  const badges = state.achievements.filter(a => a.childId === child.id);
  const hero = continueStory || recs[0] || stories[0];

  const limitMin = state.settings.dailyScreenLimitMin;
  const usedMin = Math.floor(readingSecondsToday(state, child.id) / 60);
  const limitReached = limitMin > 0 && usedMin >= limitMin;

  const open = (s: Story) => {
    if (limitReached) return;
    if (!canAccessStory(state, s)) { setGate("paywall"); return; }
    nav(`/story/${s.id}`);
  };

  const Row = ({ title, items, icon }: { title: string; items: Story[]; icon?: React.ReactNode }) =>
    items.length ? (
      <section className="mb-12">
        <h2 className="flex items-center gap-2 text-lg font-heading mb-4">{icon}{title}</h2>
        <div className="flex gap-5 overflow-x-auto pb-3 -mx-6 px-6 snap-x">
          {items.map((s, i) => <Card key={s.id} s={s} i={i} />)}
        </div>
      </section>
    ) : null;

  const Card = ({ s, i }: { s: Story; i: number }) => {
    const locked = !canAccessStory(state, s);
    const done = completedIds.includes(s.id);
    return (
      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(i, 6) * 0.05 }}
        onClick={() => open(s)}
        className="snap-start shrink-0 w-56 sm:w-64 text-left group cursor-pointer"
      >
        <div className="rounded-3xl overflow-hidden border border-white/10 group-hover:border-white/40 transition-all bg-zinc-900/60">
          <div className="relative">
            <StoryCover story={s} locked={locked} className="aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 text-[10px] font-mono bg-black/60 px-2.5 py-0.5 rounded-full border border-white/15">{s.durationMin} {tx("mnt", "min", "د")}</span>
            {done && <span className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-emerald-500 text-black flex items-center justify-center"><Star className="w-3.5 h-3.5 fill-current" /></span>}
            {!locked && <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-4 h-4 fill-current ml-0.5" /></span>}
          </div>
          <div className="p-4">
            <h3 className="font-heading text-base leading-snug line-clamp-2 mb-2">{loc(s.title, language)}</h3>
            <div className="flex gap-1.5">
              {s.values.slice(0, 2).map(v => <span key={v} className="w-2.5 h-2.5 rounded-full" style={{ background: VALUE_MAP[v].color }} title={loc(VALUE_MAP[v].name, language)} />)}
            </div>
          </div>
        </div>
      </motion.button>
    );
  };

  const byCat = (c: StoryCategory) => stories.filter(s => s.category === c);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <header className="px-4 sm:px-6 py-3 sm:py-5 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 bg-zinc-900/80 pl-2 pr-3 sm:pr-4 py-1.5 rounded-full border border-white/15 min-w-0">
            <Avatar seed={child.avatarSeed} size={36} />
            <div className="min-w-0">
              <div className="font-heading text-sm truncate">{tx(`Hai, ${child.name}!`, `Hi, ${child.name}!`, `أهلاً، ${child.name}!`)}</div>
              <div className="text-[11px] text-zinc-400 font-mono truncate">{badges.length} {tx("lencana", "badges", "شارات")} · {completedIds.length} {tx("cerita", "stories", "قصص")}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {state.children.length > 1 && (
              <div className="hidden sm:flex gap-1">
                {state.children.map(c => (
                  <button key={c.id} onClick={() => setGate(`switch:${c.id}`)} className={`rounded-full p-0.5 cursor-pointer ${c.id === child.id ? "ring-2 ring-white" : "opacity-60 hover:opacity-100"}`} title={c.name}>
                    <Avatar seed={c.avatarSeed} size={30} />
                  </button>
                ))}
              </div>
            )}
            <LanguageSwitcher />
            <button onClick={() => setGate("/dashboard")} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border border-white/20 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/40 cursor-pointer">
              <Lock className="w-3 h-3" /><span className="hidden sm:inline">{tx("Orang Tua", "Parents", "الوالدان")}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {limitReached && (
          <div className="mb-8 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-6 flex items-center gap-4">
            <Moon className="w-8 h-8 text-amber-200 shrink-0" />
            <div>
              <div className="font-heading text-lg">{tx("Waktu membaca hari ini sudah selesai!", "That's all the reading for today!", "انتهى وقت القراءة لليوم!")}</div>
              <p className="text-sm text-zinc-300">{tx("Saatnya ngobrol dengan keluarga tentang apa yang sudah dibaca. Sampai jumpa besok, insya Allah.", "Time to talk about what you read with your family. See you tomorrow, in sha Allah.", "حان وقت الحديث مع عائلتك عمّا قرأت. نراك غداً إن شاء الله.")}</p>
            </div>
          </div>
        )}

        {hero && (
          <section className="mb-12 rounded-3xl border border-white/15 bg-zinc-900/70 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-zinc-300 bg-white/5 border border-white/15 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {continueStory ? tx("Lanjutkan membaca", "Continue reading", "مواصلة القراءة") : tx("Rekomendasi untukmu", "Recommended for you", "مقترحة لك")}
              </span>
              <h1 className="text-3xl sm:text-5xl font-heading leading-tight mb-4">{loc(hero.title, language)}</h1>
              <p className="text-zinc-300 mb-8 max-w-lg">{loc(hero.description, language)}</p>
              <button onClick={() => open(hero)} disabled={limitReached} className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 cursor-pointer disabled:opacity-40">
                {canAccessStory(state, hero) ? <Play className="w-4 h-4 fill-current" /> : <Lock className="w-4 h-4" />}
                {tx("Baca sekarang", "Read now", "اقرأ الآن")}
              </button>
            </div>
            <StoryCover story={hero} className="w-full md:w-80 aspect-square rounded-2xl border border-white/20 shrink-0" />
          </section>
        )}

        <Row title={tx("Rekomendasi untukmu", "Recommended for you", "مقترحة لك")} items={recs.filter(r => r.id !== hero?.id)} icon={<Sparkles className="w-4 h-4 text-amber-300" />} />

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {(["all", ...CATEGORIES.map(c => c.id)] as const).map(c => (
            <button key={c} onClick={() => setCat(c as StoryCategory | "all")} className={`px-5 py-2.5 rounded-full text-xs font-mono whitespace-nowrap cursor-pointer ${cat === c ? "bg-white text-black font-semibold" : "bg-zinc-900/80 text-zinc-400 border border-white/10 hover:text-white"}`}>
              {c === "all" ? tx("Semua", "All", "الكل") : loc(CATEGORIES.find(x => x.id === c)!.name, language)}
            </button>
          ))}
        </div>

        {cat === "all"
          ? CATEGORIES.map(c => <Row key={c.id} title={loc(c.name, language)} items={byCat(c.id as StoryCategory)} />)
          : <Row title={loc(CATEGORIES.find(x => x.id === cat)!.name, language)} items={byCat(cat)} />}

        <Row title={tx("Baru saja selesai", "Recently completed", "أكملتها مؤخراً")} items={recent} icon={<Star className="w-4 h-4 text-emerald-400" />} />

        <section className="mb-12">
          <h2 className="text-lg font-heading mb-4">{tx("Perjalanan Karakterku", "My Character Journey", "رحلتي الأخلاقية")}</h2>
          {journey.length === 0 ? (
            <p className="text-sm text-zinc-400">{tx("Selesaikan cerita untuk memulai perjalananmu!", "Finish a story to start your journey!", "أكمل قصة لتبدأ رحلتك!")}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {journey.map(j => {
                const v = VALUE_MAP[j.value];
                return (
                  <div key={j.value} className="rounded-2xl border p-4 text-center" style={{ borderColor: v.color + "55", background: v.color + "12" }}>
                    <div className="flex justify-center gap-0.5 mb-2">{Array.from({ length: Math.min(j.total, 5) }).map((_, i) => <Star key={i} className="w-3.5 h-3.5" style={{ color: v.color, fill: v.color }} />)}</div>
                    <div className="font-heading text-sm">{loc(v.name, language)}</div>
                  </div>
                );
              })}
            </div>
          )}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {badges.map(b => {
                const def = BADGES.find(x => x.id === b.badgeId);
                return def ? <span key={b.id} className="px-3 py-1.5 rounded-full bg-amber-300/10 border border-amber-300/30 text-xs text-amber-100">★ {loc(def.name, language)}</span> : null;
              })}
            </div>
          )}
        </section>

        <div className="text-center">
          <button onClick={() => setGate("/dashboard")} className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer">
            {tx("Area orang tua", "Parent area", "منطقة الوالدين")} <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </main>

      <PinGate
        open={!!gate}
        onClose={() => setGate(null)}
        onPass={() => {
          const g = gate!;
          setGate(null);
          if (g === "paywall") setPaywall(true);
          else if (g.startsWith("switch:")) setState(s => ({ ...s, activeChildId: g.slice(7) }));
          else nav(g);
        }}
      />
      <Paywall open={paywall} onClose={() => setPaywall(false)} reason={tx("Cerita ini termasuk koleksi premium. Minta orang tua untuk membukanya.", "This story is part of a premium collection. Ask a parent to unlock it.", "هذه القصة ضمن مجموعة مميزة. اطلب من والديك فتحها.")} />
    </div>
  );
}
