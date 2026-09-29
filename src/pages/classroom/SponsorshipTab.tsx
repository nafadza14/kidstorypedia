import { useState } from "react";
import { Printer } from "lucide-react";
import { Empty, Panel, btn, toast } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { meaningfulSessions } from "@/lib/learning";
import { now, setState, uid, useStore } from "@/store";
import { Field, inp, pct, sel } from "../studio/shared";

/** Institutional sponsorship (PRD §37). Impact is derived from local data. */
export default function SponsorshipTab() {
  const { tx } = useLanguage();
  const state = useStore(s => s);
  const [form, setForm] = useState({ sponsor: "", program: "1,000 Children Islamic Story Learning Program", seats: 1000 });
  const [selId, setSelId] = useState("");
  const sp = state.sponsorships.find(x => x.id === selId) || state.sponsorships[state.sponsorships.length - 1];

  const students = state.classrooms.reduce((a, c) => a + c.students.length, 0);
  const childrenServed = state.children.length + students;
  const sessions = meaningfulSessions(state);
  const completions = state.events.filter(e => e.type === "story_completed").length + state.classrooms.reduce((a, c) => a + c.students.reduce((b, s) => b + s.completed.length, 0), 0);
  const discussions = state.events.filter(e => e.type === "discussion_completed").length + state.classrooms.reduce((a, c) => a + c.students.reduce((b, s) => b + s.discussions, 0), 0);

  function create() {
    if (!form.sponsor.trim() || !form.program.trim() || form.seats < 1) return toast(tx("Sponsor, program and seats are required", "الحقول مطلوبة"));
    const id = uid("spn");
    setState(s => ({ ...s, sponsorships: [...s.sponsorships, { id, sponsor: form.sponsor.trim(), program: form.program.trim(), seats: form.seats, seatsUsed: Math.min(form.seats, childrenServed), startedAt: now() }] }));
    setSelId(id);
    toast(tx("Sponsored program created", "تم إنشاء البرنامج"));
  }
  const setUsed = (n: number) => sp && setState(s => ({ ...s, sponsorships: s.sponsorships.map(x => (x.id === sp.id ? { ...x, seatsUsed: Math.max(0, Math.min(x.seats, n)) } : x)) }));

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-5">
      <div className="space-y-5 print:hidden">
        <Panel title={tx("New sponsored program", "برنامج رعاية جديد")}>
          <div className="space-y-2.5">
            <Field label={tx("Sponsor (foundation, mosque, company)", "الراعي")}><input className={inp} value={form.sponsor} onChange={e => setForm({ ...form, sponsor: e.target.value })} /></Field>
            <Field label={tx("Program name", "اسم البرنامج")}><input className={inp} value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} /></Field>
            <Field label={tx("Seats", "المقاعد")}><input type="number" min={1} className={inp} value={form.seats} onChange={e => setForm({ ...form, seats: +e.target.value })} /></Field>
            <button className={btn.primary + " w-full"} onClick={create}>{tx("Create program", "إنشاء")}</button>
          </div>
        </Panel>
        {state.sponsorships.length > 1 && (
          <select className={sel + " w-full"} value={sp?.id} onChange={e => setSelId(e.target.value)}>
            {state.sponsorships.map(x => <option key={x.id} value={x.id}>{x.sponsor} — {x.program}</option>)}
          </select>
        )}
      </div>

      {!sp ? <Empty>{tx("Create a sponsored program to see its impact dashboard.", "أنشئ برنامجاً لعرض الأثر.")}</Empty> : (
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 items-center mb-4 print:hidden">
            <Field label={tx("Seats used", "المقاعد المستخدمة")}><input type="number" className={inp + " w-28"} value={sp.seatsUsed} onChange={e => setUsed(+e.target.value)} /></Field>
            <button className={btn.small + " self-end"} onClick={() => setUsed(childrenServed)}>{tx("Sync with children served", "مزامنة")}</button>
            <button className={btn.small + " self-end"} onClick={() => window.print()}><Printer className="w-3.5 h-3.5" />{tx("Print program report", "طباعة التقرير")}</button>
          </div>
          <article className="print-report rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-8">
            <div className="text-xs font-mono text-zinc-500">Kidstorypedia® · {tx("Sponsored program report", "تقرير البرنامج المرعي")}</div>
            <h2 className="font-heading text-3xl mt-1">{sp.program}</h2>
            <div className="text-sm text-zinc-400 mb-6">{tx("Sponsored by", "برعاية")} {sp.sponsor} · {tx("since", "منذ")} {sp.startedAt.slice(0, 10)}</div>
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-1"><span>{tx("Seats used", "المقاعد المستخدمة")}</span><span className="font-mono">{sp.seatsUsed.toLocaleString()} / {sp.seats.toLocaleString()} ({pct(sp.seats ? sp.seatsUsed / sp.seats : 0)})</span></div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/10"><div className="h-full bg-emerald-400/70" style={{ width: `${Math.min(100, (sp.seatsUsed / Math.max(1, sp.seats)) * 100)}%` }} /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[[tx("Children served", "الأطفال المستفيدون"), childrenServed], [tx("Meaningful learning sessions", "جلسات التعلم"), sessions], [tx("Story completions", "القصص المكتملة"), completions], [tx("Family & class discussions", "النقاشات"), discussions]].map(([k, v]) => (
                <div key={String(k)} className="rounded-2xl border border-white/10 p-4"><div className="text-[10px] font-mono text-zinc-500">{k}</div><div className="text-3xl font-light">{v}</div></div>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500">{tx("Derived from data in this browser (family profiles + classroom records). Connect a backend to aggregate across all sponsored families and schools.", "مشتق من بيانات هذا المتصفح.")}</p>
          </article>
        </div>
      )}
    </div>
  );
}
