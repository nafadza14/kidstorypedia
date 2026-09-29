import React, { useState } from "react";
import { ArrowLeft, Award, BookOpen, Eye, Lock, MessageCircle, NotebookPen, Target } from "lucide-react";
import { Empty, Panel, StoryCover, btn, input, label, toast } from "@/components/kit";
import { Paywall } from "@/components/Paywall";
import { BADGES } from "@/data/catalog";
import { VALUES, VALUE_MAP } from "@/data/values";
import { track } from "@/lib/analytics";
import { findStory, loc } from "@/lib/content";
import { isPremium } from "@/lib/entitlements";
import { logEvent, valueJourney, type ValueJourney } from "@/lib/learning";
import type { Story, ValueId } from "@/types";
import { NoChild, SectionHeader, fmtDate, useDash } from "./shared";

const FREE_VALUES = 4;

function Breakdown({ j }: { j: ValueJourney }) {
  const { tx } = useDash();
  const rows = [
    { n: j.stories, en: "stories", ar: "قصص", icon: BookOpen },
    { n: j.discussions, en: "discussions", ar: "نقاشات", icon: MessageCircle },
    { n: j.actions, en: "actions", ar: "أعمال", icon: Target },
    { n: j.reflections, en: "reflections", ar: "تأملات", icon: NotebookPen },
    { n: j.observations, en: "observations", ar: "ملاحظات", icon: Eye },
  ].filter(r => r.n > 0);
  if (!rows.length) return <p className="text-xs text-zinc-500">{tx("Not explored yet", "لم تُستكشف بعد")}</p>;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-400">
      {rows.map(r => <li key={r.en} className="flex items-center gap-1"><r.icon className="w-3 h-3" />{r.n} {tx(r.en, r.ar)}</li>)}
    </ul>
  );
}

function ObservationForm({ childId, initialValue }: { childId: string; initialValue?: ValueId }) {
  const { tx, language } = useDash();
  const [value, setValue] = useState<ValueId>(initialValue || "kindness");
  const [note, setNote] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    logEvent({ childId, type: "observation", values: [value], note: note.trim() });
    track("observation_added", { value });
    toast(tx("Observation added to the journal", "أُضيفت الملاحظة إلى الدفتر"));
    setNote("");
  };
  return (
    <form onSubmit={submit} className="grid sm:grid-cols-[180px_1fr_auto] gap-3 items-end">
      <div>
        <label className={label}>{tx("Value", "القيمة")}</label>
        <select className={input} value={value} onChange={e => setValue(e.target.value as ValueId)}>
          {VALUES.map(v => <option key={v.id} value={v.id}>{loc(v.name, language)}</option>)}
        </select>
      </div>
      <div>
        <label className={label}>{tx("What did you notice?", "ماذا لاحظت؟")}</label>
        <input className={input} value={note} onChange={e => setNote(e.target.value)} maxLength={280} placeholder={tx("e.g. Shared her snack with her brother without being asked", "مثال: شاركت طعامها مع أخيها دون أن يُطلب منها")} />
      </div>
      <button className={btn.primary} disabled={!note.trim()}>{tx("Add", "إضافة")}</button>
    </form>
  );
}

function ValueDetail({ value, onBack }: { value: ValueId; onBack: () => void }) {
  const { state, child, language, tx } = useDash();
  if (!child) return null;
  const v = VALUE_MAP[value];
  const j = valueJourney(state, child.id).find(x => x.value === value)!;
  const events = state.events.filter(e => e.childId === child.id && e.values.includes(value));
  const stories = [...new Set(events.map(e => e.storyId).filter(Boolean))].map(id => findStory(state, id)).filter((s): s is Story => !!s);
  const reflections = events.filter(e => e.type === "reflection_completed" && e.note);
  const observations = events.filter(e => e.type === "observation");
  const valueBadges: Record<string, ValueId[]> = { "patience-practitioner": ["patience"] };
  const milestones = state.achievements
    .filter(a => a.childId === child.id)
    .map(a => ({ a, b: BADGES.find(b => b.id === a.badgeId) }))
    .filter(x => x.b && (!valueBadges[x.b.id] || valueBadges[x.b.id].includes(value)));

  return (
    <div className="space-y-5">
      <button onClick={onBack} className={btn.small}><ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />{tx("All values", "كل القيم")}</button>
      <div className="rounded-3xl border p-6" style={{ borderColor: v.color + "55", background: v.color + "10" }}>
        <h3 className="font-heading text-2xl mb-1">{loc(v.name, language)}</h3>
        <p className="text-sm text-zinc-300 mb-3">{loc(v.description, language)}</p>
        <p className="text-sm text-zinc-200 mb-2">{tx(`${child.name} practised ${loc(v.name, "en").toLowerCase()} in ${j.total} learning activit${j.total === 1 ? "y" : "ies"}.`, `مارس ${child.name} ${loc(v.name, "ar")} في ${j.total} نشاط تعلّم.`)}</p>
        <Breakdown j={j} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel title={tx("Connected stories", "القصص المرتبطة")}>
          {stories.length ? (
            <ul className="space-y-3">{stories.map(s => (
              <li key={s.id} className="flex items-center gap-3">
                <StoryCover story={s} className="w-10 aspect-[3/4] rounded-lg shrink-0" />
                <span className="text-sm">{loc(s.title, language)}</span>
              </li>
            ))}</ul>
          ) : <p className="text-sm text-zinc-500">{tx("No stories yet for this value.", "لا قصص بعد لهذه القيمة.")}</p>}
        </Panel>
        <Panel title={tx("Milestones", "المحطات")}>
          {milestones.length ? (
            <ul className="space-y-2">{milestones.map(({ a, b }) => (
              <li key={a.id} className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-amber-300" />{loc(b!.name, language)}<span className="text-xs text-zinc-500 ms-auto">{fmtDate(a.at, language)}</span></li>
            ))}</ul>
          ) : <p className="text-sm text-zinc-500">{tx("No milestones yet.", "لا محطات بعد.")}</p>}
        </Panel>
        <Panel title={tx(`${child.name}'s reflections`, `تأملات ${child.name}`)}>
          {reflections.length ? (
            <ul className="space-y-3">{reflections.map(e => (
              <li key={e.id} className="text-sm border-s-2 border-white/15 ps-3">
                <p className="text-zinc-200">“{e.note}”</p>
                <p className="text-[11px] text-zinc-500 mt-1">{loc(findStory(state, e.storyId)?.title, language)} · {fmtDate(e.at, language)}</p>
              </li>
            ))}</ul>
          ) : <p className="text-sm text-zinc-500">{tx("Reflections your child shares after stories will appear here.", "ستظهر هنا تأملات طفلك بعد القصص.")}</p>}
        </Panel>
        <Panel title={tx("Parent observations", "ملاحظات الوالدين")}>
          {observations.length ? (
            <ul className="space-y-3">{observations.map(e => (
              <li key={e.id} className="text-sm border-s-2 ps-3" style={{ borderColor: v.color }}>
                <p className="text-zinc-200">{e.note}</p>
                <p className="text-[11px] text-zinc-500 mt-1">{fmtDate(e.at, language)}</p>
              </li>
            ))}</ul>
          ) : <p className="text-sm text-zinc-500">{tx("Notice this value at home? Add an observation below.", "لاحظت هذه القيمة في البيت؟ أضف ملاحظة أدناه.")}</p>}
        </Panel>
      </div>
      <Panel title={tx("Add an observation", "إضافة ملاحظة")}>
        <ObservationForm childId={child.id} initialValue={value} />
      </Panel>
    </div>
  );
}

export default function Journal() {
  const { state, child, language, tx } = useDash();
  const [selected, setSelected] = useState<ValueId | null>(null);
  const [paywall, setPaywall] = useState(false);
  if (!child) return <NoChild />;
  const premium = isPremium(state);
  const journey = valueJourney(state, child.id);
  const unlocked = (i: number) => premium || i < FREE_VALUES;

  if (selected) return <ValueDetail value={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={tx(`${child.name}'s Character Journal`, `دفتر أخلاق ${child.name}`)}
        subtitle={tx("A record of the values your family has explored and practised together. We count observable learning activities — character itself is never scored.", "سجل للقيم التي استكشفتها عائلتكم ومارستها معاً. نحصي أنشطة التعلم الملحوظة — ولا نقيس الأخلاق نفسها بالدرجات.")}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {journey.map((j, i) => {
          const v = VALUE_MAP[j.value];
          const open = unlocked(i);
          return (
            <button
              key={j.value}
              onClick={() => (open ? setSelected(j.value) : setPaywall(true))}
              className="text-start rounded-2xl border border-white/10 bg-zinc-900/50 p-4 hover:border-white/30 transition-all cursor-pointer relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
                <span className="font-heading text-base">{loc(v.name, language)}</span>
                {!open && <Lock className="w-3.5 h-3.5 text-amber-300 ms-auto" />}
              </div>
              {open ? (
                <>
                  <p className="text-sm text-zinc-300 mb-2">
                    {j.total ? tx(`Practised ${loc(v.name, "en").toLowerCase()} in ${j.total} learning activit${j.total === 1 ? "y" : "ies"}`, `مارس ${loc(v.name, "ar")} في ${j.total} نشاط تعلّم`) : tx("Not explored yet", "لم تُستكشف بعد")}
                  </p>
                  {j.total > 0 && <Breakdown j={j} />}
                </>
              ) : (
                <p className="text-xs text-zinc-500">{tx("Full character journey is part of Premium", "رحلة الأخلاق الكاملة جزء من الخطة المميزة")}</p>
              )}
            </button>
          );
        })}
      </div>
      {!premium && <Empty>{tx(`Free families see the full journal for ${FREE_VALUES} values. Upgrade to follow all 12.`, `العائلات المجانية ترى الدفتر الكامل لـ${FREE_VALUES} قيم. قم بالترقية لمتابعة القيم الـ١٢.`)} <button className="underline cursor-pointer" onClick={() => setPaywall(true)}>{tx("See plans", "عرض الخطط")}</button></Empty>}
      <Panel title={tx("Add a parent observation", "إضافة ملاحظة من الوالدين")}>
        <p className="text-xs text-zinc-400 mb-3">{tx("Noticed a value in action at home? Write it down — it becomes part of the journal.", "لاحظت قيمة في البيت؟ دوّنها لتصبح جزءاً من الدفتر.")}</p>
        <ObservationForm childId={child.id} />
      </Panel>
      <Paywall open={paywall} onClose={() => setPaywall(false)} reason={tx("Follow your child's full character journey across all 12 values.", "تابع رحلة طفلك الأخلاقية الكاملة عبر القيم الـ١٢.")} />
    </div>
  );
}
