import { useState } from "react";
import { Printer } from "lucide-react";
import { Empty, btn } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { findStory, loc } from "@/lib/content";
import { useStore } from "@/store";
import { pct, sel, td, th } from "../studio/shared";
import { classStats, daysLeft } from "./stats";

/** School pilot dashboard & printable impact report (PRD §47, §80). */
export default function PilotTab() {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const classrooms = state.classrooms;
  const [selId, setSelId] = useState("");
  const c = classrooms.find(x => x.id === selId) || classrooms.find(x => x.pilotEndsAt) || classrooms[0];
  if (!c) return <Empty>{tx("Create a classroom (with a 30-day pilot) in the Classes tab first.", "أنشئ فصلاً أولاً.")}</Empty>;

  const st = classStats(c);
  const dl = daysLeft(c.pilotEndsAt);
  const values = new Map<string, number>();
  c.assignments.forEach(a => findStory(state, a.storyId)?.values.forEach(v => values.set(v, (values.get(v) || 0) + 1)));

  const kpis: [string, string | number, string?][] = [
    [tx("Days left in pilot", "الأيام المتبقية"), dl === null ? "—" : dl, c.pilotEndsAt ? `${tx("ends", "ينتهي")} ${c.pilotEndsAt.slice(0, 10)}` : tx("no pilot set", "بلا تجربة")],
    [tx("Teacher adoption", "تبني المعلم"), st.assignments, tx("assignments created", "مهام منشأة")],
    [tx("Student completion rate", "معدل الإكمال"), st.students && st.assignments ? pct(st.completionRate) : "—", `${st.completed} / ${st.students * st.assignments}`],
    [tx("Discussions held", "النقاشات"), st.discussions, `${st.students} ${tx("students", "طلاب")}`],
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center mb-5 print:hidden">
        <select className={sel} value={c.id} onChange={e => setSelId(e.target.value)}>
          {classrooms.map(x => <option key={x.id} value={x.id}>{x.name}{x.pilotEndsAt ? " (pilot)" : ""}</option>)}
        </select>
        <button className={btn.small} onClick={() => window.print()}><Printer className="w-3.5 h-3.5" />{tx("Print impact report", "طباعة تقرير الأثر")}</button>
      </div>

      <article className="print-report rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-8">
        <header className="mb-6">
          <div className="text-xs font-mono text-zinc-500">Kidstorypedia® · {tx("School pilot impact report", "تقرير أثر التجربة المدرسية")}</div>
          <h2 className="font-heading text-3xl mt-1">{c.school || c.name}</h2>
          <div className="text-sm text-zinc-400">{c.name} · {tx("Teacher", "المعلم")}: {c.teacher} · {tx("Started", "بدأ")} {c.createdAt.slice(0, 10)} · {tx("Report date", "تاريخ التقرير")} {new Date().toISOString().slice(0, 10)}</div>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {kpis.map(([k, v, sub]) => (
            <div key={k} className="rounded-2xl border border-white/10 p-4"><div className="text-[10px] font-mono text-zinc-500">{k}</div><div className="text-3xl font-light">{v}</div>{sub && <div className="text-[11px] text-zinc-500">{sub}</div>}</div>
          ))}
        </div>
        <h3 className="font-heading text-lg mb-2">{tx("Stories assigned", "القصص المعيّنة")}</h3>
        {!c.assignments.length ? <p className="text-xs text-zinc-500 mb-6">—</p> : (
          <table className="w-full mb-6">
            <thead><tr><th className={th}>{tx("Story", "القصة")}</th><th className={th}>{tx("Due", "الموعد")}</th><th className={th}>{tx("Completed by", "أكملها")}</th></tr></thead>
            <tbody>
              {c.assignments.map(a => (
                <tr key={a.id}>
                  <td className={td}>{loc(findStory(state, a.storyId)?.title, language) || a.storyId}</td>
                  <td className={td + " font-mono text-xs"}>{a.due}</td>
                  <td className={td + " font-mono text-xs"}>{c.students.filter(s => s.completed.includes(a.storyId)).length} / {c.students.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <h3 className="font-heading text-lg mb-2">{tx("Values explored", "القيم المستكشفة")}</h3>
        <p className="text-sm text-zinc-300 mb-6">{[...values.keys()].join(", ") || "—"}</p>
        <p className="text-[11px] text-zinc-500">{tx("Figures reflect teacher-recorded completions and discussions in this browser. Student data is limited to first name and age. No character scores are assigned to children.", "الأرقام من سجلات المعلم في هذا المتصفح.")}</p>
      </article>
    </div>
  );
}
