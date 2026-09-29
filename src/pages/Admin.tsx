import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { Panel, Stat, btn, toast } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { STATE_LABEL, VALUE_MAP } from "@/data/values";
import { seedDemoFamily } from "@/lib/demo";
import { activation } from "@/lib/learning";
import { contentStats, eventCounts, funnel, revenue, scenario, unitEconomics, weeklyNorthStar } from "@/lib/metrics";
import { useStore } from "@/store";
import type { ContentState, ValueId } from "@/types";
import { Field, PageShell, StaffTopBar, inp, pct, td, th, usd } from "./studio/shared";
import { CountBars, FunnelBars, WeeklyBars } from "./admin/charts";

type Year = { families: number; blendedAnnual: number; schools: number; schoolContract: number; other: number };
const DEFAULT_YEARS: Year[] = [
  { families: 2000, blendedAnnual: 70, schools: 0, schoolContract: 3000, other: 0 },
  { families: 10000, blendedAnnual: 70, schools: 50, schoolContract: 3000, other: 0 },
  { families: 30000, blendedAnnual: 70, schools: 200, schoolContract: 3000, other: 0 },
];

const EXPERIMENTS = [
  { name: "Price", nameAr: "السعر", hypothesis: "$7.99/mo converts within 10% of $5.99/mo while lifting ARPU.", metric: "Paywall → subscription conversion; ARPU" },
  { name: "Value proposition", nameAr: "عرض القيمة", hypothesis: "\"Prophetic character, one story a night\" beats \"Islamic stories library\" on signup.", metric: "Landing → signup started" },
  { name: "Trial", nameAr: "الفترة التجريبية", hypothesis: "7-day trial with activation nudges converts better than 14-day.", metric: "Trial → paid; activation rate" },
  { name: "Annual plan", nameAr: "الخطة السنوية", hypothesis: "Defaulting to annual (shown as monthly equivalent) raises annual share above 50%.", metric: "Annual share of new subs; cash collected" },
  { name: "Creative focus", nameAr: "تركيز الإعلان", hypothesis: "Bedtime-routine creatives have lower CAC than character-tracking creatives.", metric: "CAC by creative; signup rate" },
];

function Num({ value, onChange, step = 1 }: { value: number; onChange: (n: number) => void; step?: number }) {
  return <input type="number" step={step} className={inp + " font-mono"} value={value} onChange={e => onChange(+e.target.value || 0)} />;
}

/** Business dashboard (PRD §52–55, §71, §86–88). */
export default function Admin() {
  const { tx } = useLanguage();
  const state = useStore(s => s);
  const f = useMemo(() => funnel(state), [state]);
  const ns = useMemo(() => weeklyNorthStar(state), [state]);
  const cs = useMemo(() => contentStats(state), [state]);
  const rev = useMemo(() => revenue(state), [state]);
  const counts = useMemo(() => eventCounts(state), [state]);
  const act = activation(state);
  const discussions = state.events.filter(e => e.type === "discussion_completed").length;
  const empty = !state.events.length && !state.analytics.length;

  const [ue, setUe] = useState({ arpuMonthly: 5.83, grossMargin: 80, lifetimeMonths: 12, spend: 2000, newPaying: 100 });
  const u = unitEconomics({ ...ue, grossMargin: ue.grossMargin / 100 });
  const [years, setYears] = useState<Year[]>(DEFAULT_YEARS);
  const setYear = (i: number, p: Partial<Year>) => setYears(ys => ys.map((y, j) => (j === i ? { ...y, ...p } : y)));

  return (
    <div className="min-h-screen">
      <StaffTopBar title={tx("Business dashboard", "لوحة الأعمال")} />
      <PageShell>
        <div className="rounded-2xl border border-sky-400/30 bg-sky-400/5 p-4 mb-6 flex flex-wrap items-center gap-3 text-sm">
          <Info className="w-4 h-4 text-sky-300 shrink-0" />
          <span className="flex-1 min-w-[240px]">{tx("Local-first mode: metrics reflect data in this browser. Connect a backend to aggregate all families.", "وضع محلي: المقاييس تعكس بيانات هذا المتصفح فقط. اربط خادماً لتجميع كل العائلات.")}</span>
          {empty && <button className={btn.small} onClick={() => { seedDemoFamily(); toast(tx("Demo family loaded", "تم تحميل بيانات تجريبية")); }}>{tx("Load demo family data", "تحميل بيانات تجريبية")}</button>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <Stat label={tx("Stories completed", "القصص المكتملة")} value={cs.completions} />
          <Stat label={tx("Discussion rate", "معدل النقاش")} value={cs.completions ? pct(discussions / cs.completions) : "—"} sub={`${discussions} ${tx("discussions", "نقاشات")}`} />
          <Stat label={tx("Activation", "التفعيل")} value={act.activated ? tx("Activated", "مفعّل") : tx("Not yet", "ليس بعد")} sub={`${act.child ? "✓" : "○"} child · ${act.story ? "✓" : "○"} story · ${act.discussion ? "✓" : "○"} discussion`} />
          <Stat label={tx("Meaningful sessions (this week)", "جلسات هذا الأسبوع")} value={ns[ns.length - 1]?.sessions ?? 0} sub={tx("North Star", "نجم الشمال")} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          <Panel title={tx("Growth funnel", "قمع النمو")}><FunnelBars steps={f} /><p className="text-[11px] text-zinc-500 mt-3">{tx("% = conversion from the previous step.", "٪ = التحويل من الخطوة السابقة.")}</p></Panel>
          <Panel title={tx("North Star: weekly meaningful learning sessions", "نجم الشمال: جلسات التعلم الأسبوعية")}>
            <WeeklyBars data={ns} label="Weekly meaningful learning sessions" />
            <p className="text-[11px] text-zinc-500 mt-1">{tx("Story completed + discussion/reflection/action/quiz on the same day, per child.", "قصة مكتملة مع تفاعل تعلمي في نفس اليوم.")}</p>
          </Panel>
        </div>

        <h2 className="font-heading text-xl mb-3">{tx("Content", "المحتوى")}</h2>
        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          <Panel title={tx("Top stories", "أفضل القصص")} className="lg:col-span-2">
            {!cs.top.length ? <p className="text-xs text-zinc-500">—</p> : (
              <table className="w-full">
                <thead><tr><th className={th}>{tx("Story", "القصة")}</th><th className={th}>{tx("Started", "بدأت")}</th><th className={th}>{tx("Completed", "اكتملت")}</th><th className={th}>{tx("Completion", "الإكمال")}</th></tr></thead>
                <tbody>{cs.top.slice(0, 10).map(r => <tr key={r.id}><td className={td}>{r.title}</td><td className={td + " font-mono"}>{r.started}</td><td className={td + " font-mono"}>{r.completed}</td><td className={td + " font-mono"}>{pct(r.rate)}</td></tr>)}</tbody>
              </table>
            )}
          </Panel>
          <Panel title={tx("Values practiced", "القيم الممارسة")}>
            <CountBars rows={cs.values.map(([v, n]) => ({ label: VALUE_MAP[v as ValueId]?.name.en || v, n, color: VALUE_MAP[v as ValueId]?.color }))} />
          </Panel>
          <Panel title={tx("Age distribution", "توزيع الأعمار")}><CountBars rows={cs.ages.map(([a, n]) => ({ label: `${tx("Age", "عمر")} ${a}`, n }))} /></Panel>
          <Panel title={tx("Language usage", "اللغات")}><CountBars rows={cs.langs.map(([l, n]) => ({ label: l === "ar" ? "العربية" : "English", n }))} /></Panel>
          <Panel title={tx("Content by governance state", "المحتوى حسب الحالة")}><CountBars rows={cs.states.map(([s, n]) => ({ label: STATE_LABEL[s as ContentState] || s, n }))} /></Panel>
        </div>

        <h2 className="font-heading text-xl mb-3">{tx("Revenue & economics", "الإيرادات والاقتصاديات")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <Stat label="MRR" value={usd(rev.mrr)} />
          <Stat label="ARR" value={usd(rev.arr)} />
          <Stat label={tx("Collected", "المحصّل")} value={usd(rev.totalCollected)} />
          <Stat label={tx("Payments", "المدفوعات")} value={rev.payments} sub={state.subscription.status !== "none" ? `${state.subscription.plan} · ${state.subscription.status}` : undefined} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          <Panel title={tx("Unit economics calculator (PRD §54)", "حاسبة اقتصاديات الوحدة")}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <Field label={tx("ARPU / month ($)", "متوسط الإيراد")}><Num step={0.01} value={ue.arpuMonthly} onChange={n => setUe({ ...ue, arpuMonthly: n })} /></Field>
              <Field label={tx("Gross margin %", "الهامش ٪")}><Num value={ue.grossMargin} onChange={n => setUe({ ...ue, grossMargin: n })} /></Field>
              <Field label={tx("Lifetime (months)", "العمر (أشهر)")}><Num value={ue.lifetimeMonths} onChange={n => setUe({ ...ue, lifetimeMonths: n })} /></Field>
              <Field label={tx("Marketing spend ($)", "الإنفاق التسويقي")}><Num value={ue.spend} onChange={n => setUe({ ...ue, spend: n })} /></Field>
              <Field label={tx("New paying customers", "عملاء جدد")}><Num value={ue.newPaying} onChange={n => setUe({ ...ue, newPaying: n })} /></Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[["LTV", usd(u.ltv)], ["CAC", usd(u.cac)], [tx("Payback", "الاسترداد"), `${u.payback.toFixed(1)} mo`], ["LTV:CAC", u.ratio ? `${u.ratio.toFixed(1)}×` : "—"]].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/10 p-3"><div className="text-[10px] font-mono text-zinc-500">{k}</div><div className="text-lg">{v}</div></div>
              ))}
            </div>
            <p className={"text-[11px] mt-2 " + (u.ratio >= 3 ? "text-emerald-300" : "text-amber-300")}>{u.ratio >= 3 ? tx("LTV:CAC ≥ 3 — healthy.", "صحي.") : tx("Target LTV:CAC ≥ 3 and payback < 12 months.", "الهدف ≥ ٣.")}</p>
          </Panel>

          <Panel title={tx("Scenario model Y1–Y3", "نموذج السيناريو")} action={<button className={btn.small} onClick={() => setYears(DEFAULT_YEARS)}>{tx("Reset to PRD defaults", "إعادة")}</button>}>
            <div className="text-[11px] font-mono uppercase tracking-wide text-amber-300 mb-3">{tx("Planning scenario, not a forecast", "سيناريو تخطيطي وليس توقعاً")}</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead><tr><th className={th} />{years.map((_, i) => <th key={i} className={th}>Y{i + 1}</th>)}</tr></thead>
                <tbody>
                  {([["families", tx("Paying families", "العائلات")], ["blendedAnnual", tx("Blended $/family/yr", "$ لكل عائلة")], ["schools", tx("Schools", "المدارس")], ["schoolContract", tx("$/school/yr", "$ لكل مدرسة")], ["other", tx("Other revenue $", "إيرادات أخرى")]] as [keyof Year, string][]).map(([k, lbl]) => (
                    <tr key={k}><td className={td + " text-xs text-zinc-400"}>{lbl}</td>{years.map((y, i) => <td key={i} className={td}><Num value={y[k]} onChange={n => setYear(i, { [k]: n })} /></td>)}</tr>
                  ))}
                  {(["subs", "b2b", "total"] as const).map(k => (
                    <tr key={k}><td className={td + " text-xs " + (k === "total" ? "text-white" : "text-zinc-400")}>{k === "subs" ? tx("Subscriptions", "الاشتراكات") : k === "b2b" ? "B2B" : tx("Total revenue", "الإجمالي")}</td>{years.map((y, i) => <td key={i} className={td + " font-mono " + (k === "total" ? "text-white" : "text-zinc-300")}>{usd(scenario(y)[k])}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <h2 className="font-heading text-xl mb-3">{tx("Experiments board (PRD §55)", "لوحة التجارب")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          {EXPERIMENTS.map(e => (
            <div key={e.name} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-2"><span className="font-heading">{tx(e.name, e.nameAr)}</span><span className="text-[10px] font-mono text-zinc-500 border border-white/10 rounded-full px-2">{tx("planned", "مخطط")}</span></div>
              <div className="text-[10px] font-mono text-zinc-500">{tx("Hypothesis", "الفرضية")}</div>
              <p className="text-xs text-zinc-300 mb-2">{e.hypothesis}</p>
              <div className="text-[10px] font-mono text-zinc-500">{tx("Primary metric", "المقياس")}</div>
              <p className="text-xs text-zinc-300">{e.metric}</p>
            </div>
          ))}
        </div>

        <Panel title={tx("Raw analytics events", "أحداث التحليلات")}>
          {!counts.length ? <p className="text-xs text-zinc-500">{tx("No events recorded in this browser.", "لا توجد أحداث.")}</p> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
              {counts.map(([name, n]) => <div key={name} className="flex justify-between text-xs font-mono border-b border-white/5 py-1"><span className="text-zinc-400">{name}</span><span>{n}</span></div>)}
            </div>
          )}
        </Panel>
      </PageShell>
    </div>
  );
}
