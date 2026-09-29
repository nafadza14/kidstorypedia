import { useMemo, useState } from "react";
import { ReviewBadge, ValueChip, btn } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { CATEGORIES, CONTENT_STATES, STATE_LABEL } from "@/data/values";
import { allStories, loc } from "@/lib/content";
import { useStore } from "@/store";
import { inp, sel, td, th } from "./shared";

export default function StoriesTab({ onOpen, onReview }: { onOpen: (id: string) => void; onReview: (id: string) => void }) {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const stories = useMemo(() => allStories(state), [state]);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [cat, setCat] = useState("");
  const [origin, setOrigin] = useState("");

  const rows = stories.filter(s =>
    (!st || s.state === st) && (!cat || s.category === cat) && (!origin || s.origin === origin) &&
    (!q || `${s.title.en} ${s.title.ar || ""} ${s.id} ${s.values.join(" ")}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={tx("Cari judul, id, nilai…", "Search title, id, value…", "بحث…")} className={inp + " max-w-xs"} />
        <select value={st} onChange={e => setSt(e.target.value)} className={sel}>
          <option value="">{tx("Semua status", "All states", "كل الحالات")}</option>
          {CONTENT_STATES.map(s => <option key={s} value={s}>{STATE_LABEL[s]}</option>)}
        </select>
        <select value={cat} onChange={e => setCat(e.target.value)} className={sel}>
          <option value="">{tx("Semua kategori", "All categories", "كل الفئات")}</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{loc(c.name, language)}</option>)}
        </select>
        <select value={origin} onChange={e => setOrigin(e.target.value)} className={sel}>
          <option value="">{tx("Semua asal", "All origins", "كل المصادر")}</option>
          <option value="canonical">canonical</option>
          <option value="ai_generated">ai_generated</option>
        </select>
        <span className="text-xs font-mono text-zinc-500 ms-auto">{rows.length} / {stories.length}</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/40">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr>
              <th className={th}>{tx("Judul", "Title", "العنوان")}</th>
              <th className={th}>{tx("Kategori", "Category", "الفئة")}</th>
              <th className={th}>{tx("Nilai", "Values", "القيم")}</th>
              <th className={th}>{tx("Asal", "Origin", "الأصل")}</th>
              <th className={th}>{tx("Status", "State", "الحالة")}</th>
              <th className={th}>{tx("Ver.", "Ver.", "إصدار")}</th>
              <th className={th}>{tx("Akses", "Access", "الوصول")}</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.id} className="hover:bg-white/[0.03]">
                <td className={td}>
                  <button onClick={() => onOpen(s.id)} className="text-start hover:underline cursor-pointer">{loc(s.title, language) || s.id}</button>
                  <div className="text-[10px] font-mono text-zinc-500">{s.id}</div>
                </td>
                <td className={td + " text-xs text-zinc-300"}>{s.category}</td>
                <td className={td}><div className="flex flex-wrap gap-1">{s.values.map(v => <ValueChip key={v} id={v} />)}</div></td>
                <td className={td}>
                  <span className={"text-[10px] font-mono px-2 py-0.5 rounded-full border " + (s.origin === "canonical" ? "border-sky-400/30 text-sky-300" : "border-fuchsia-400/30 text-fuchsia-300")}>{s.origin}</span>
                </td>
                <td className={td}><ReviewBadge state={s.state} /></td>
                <td className={td + " font-mono text-xs"}>v{s.version}</td>
                <td className={td + " text-xs"}>{s.premium ? <span className="text-amber-300">{tx("Premium", "Premium", "مميز")}</span> : <span className="text-zinc-400">{tx("Gratis", "Free", "مجاني")}</span>}{s.packId && <div className="text-[10px] font-mono text-zinc-500">{s.packId}</div>}</td>
                <td className={td + " whitespace-nowrap"}>
                  <button className={btn.small} onClick={() => onOpen(s.id)}>{tx("Edit", "Edit", "تحرير")}</button>{" "}
                  <button className={btn.small} onClick={() => onReview(s.id)}>{tx("Tinjau", "Review", "مراجعة")}</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td className={td + " text-center text-zinc-500"} colSpan={8}>{tx("Tidak ada cerita yang cocok.", "No stories match.", "لا توجد نتائج.")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
