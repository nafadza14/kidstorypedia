import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Panel, btn, toast } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { track } from "@/lib/analytics";
import { now, setState, useStore } from "@/store";
import type { Lead } from "@/types";
import { Field, fmtDate, inp, td, th } from "../studio/shared";

const TIERS = [
  { name: "Small", nameAr: "صغيرة", price: "$99–199/mo", who: "1–3 classes · up to ~75 students", whoAr: "١–٣ فصول", features: ["Classroom assignments", "Class discussion mode", "Progress tracking", "Email support"] },
  { name: "Medium", nameAr: "متوسطة", price: "$250–499/mo", who: "Whole school · up to ~500 students", whoAr: "مدرسة كاملة", features: ["Everything in Small", "Pilot & impact reports", "Teacher onboarding session", "Arabic + English"] },
  { name: "Enterprise", nameAr: "مؤسسات", price: "Custom", who: "Networks, foundations, sponsors", whoAr: "شبكات ومؤسسات", features: ["Multi-school admin", "Sponsored seats", "Custom content review", "Data processing agreement"] },
];

/** B2B pricing hypothesis + pilot request (PRD §36, §81). */
export default function PricingTab() {
  const { tx } = useLanguage();
  const allLeads = useStore(s => s.leads);
  const leads = allLeads.filter(l => l.source === "school_pilot");
  const [f, setF] = useState({ name: "", email: "", school: "", students: 60, message: "" });
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(f.email) || !f.school.trim()) return toast(tx("School and a valid email are required", "المدرسة وبريد صحيح مطلوبان"));
    const lead: Lead & { name: string; school: string; students: number; message: string } = { email: f.email.trim(), at: now(), source: "school_pilot", name: f.name.trim(), school: f.school.trim(), students: f.students, message: f.message.trim() };
    setState(s => ({ ...s, leads: [...s.leads, lead] }));
    track("lead_captured", { source: "school_pilot" });
    setSent(true);
    setF({ name: "", email: "", school: "", students: 60, message: "" });
  }

  return (
    <div className="space-y-5">
      <div className="text-[11px] font-mono uppercase tracking-wide text-amber-300">{tx("Pricing hypothesis — to be validated with pilots", "فرضية تسعير — تُختبر بالتجارب")}</div>
      <div className="grid md:grid-cols-3 gap-4">
        {TIERS.map((t, i) => (
          <div key={t.name} className={"rounded-3xl border p-6 " + (i === 1 ? "border-white/40 bg-white/[0.04]" : "border-white/10 bg-zinc-900/50")}>
            <div className="font-heading text-xl">{tx(t.name, t.nameAr)}</div>
            <div className="text-2xl font-light my-2">{t.price}</div>
            <div className="text-xs text-zinc-400 mb-4">{tx(t.who, t.whoAr)}</div>
            <ul className="space-y-1.5 text-sm">{t.features.map(x => <li key={x} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />{x}</li>)}</ul>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title={tx("Request a school pilot", "اطلب تجربة مدرسية")}>
          {sent ? (
            <div className="text-sm text-emerald-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{tx("Thanks — we'll be in touch about a free 30-day pilot.", "شكراً — سنتواصل معك.")} <button className={btn.small} onClick={() => setSent(false)}>{tx("Another", "طلب آخر")}</button></div>
          ) : (
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
              <Field label={tx("Your name", "اسمك")}><input className={inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
              <Field label={tx("Work email", "البريد")}><input type="email" required className={inp} value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
              <Field label={tx("School", "المدرسة")}><input required className={inp} value={f.school} onChange={e => setF({ ...f, school: e.target.value })} /></Field>
              <Field label={tx("Approx. students", "عدد الطلاب")}><input type="number" min={1} className={inp} value={f.students} onChange={e => setF({ ...f, students: +e.target.value })} /></Field>
              <Field label={tx("Anything we should know?", "ملاحظات")} className="sm:col-span-2"><textarea rows={3} className={inp} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} /></Field>
              <button type="submit" className={btn.primary + " sm:col-span-2"}>{tx("Request pilot", "اطلب التجربة")}</button>
            </form>
          )}
        </Panel>
        <Panel title={tx("Pilot requests (this browser)", "طلبات التجربة")}>
          {!leads.length ? <p className="text-xs text-zinc-500">—</p> : (
            <table className="w-full">
              <thead><tr><th className={th}>{tx("When", "متى")}</th><th className={th}>{tx("Email", "البريد")}</th><th className={th}>{tx("School", "المدرسة")}</th></tr></thead>
              <tbody>{leads.slice().reverse().map((l, i) => <tr key={i}><td className={td + " text-xs font-mono text-zinc-400"}>{fmtDate(l.at)}</td><td className={td + " text-xs"}>{l.email}</td><td className={td + " text-xs"}>{(l as Lead & { school?: string }).school || "—"}</td></tr>)}</tbody>
            </table>
          )}
        </Panel>
      </div>
    </div>
  );
}
