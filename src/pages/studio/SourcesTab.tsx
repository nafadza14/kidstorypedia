import { useMemo, useState } from "react";
import { Panel, ReviewBadge, ValueChip } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { SOURCES, SOURCE_MAP } from "@/data/sources";
import { allStories, loc } from "@/lib/content";
import { useStore } from "@/store";
import { sel, td, th } from "./shared";

const TYPE_COLOR: Record<string, string> = { quran: "text-emerald-300", hadith: "text-sky-300", sirah: "text-amber-300", tafsir: "text-violet-300", scholarly: "text-zinc-300", original_fable: "text-pink-300" };

export default function SourcesTab({ onOpen }: { onOpen: (id: string) => void }) {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const stories = useMemo(() => allStories(state), [state]);
  const [type, setType] = useState("");

  const citedBy = (id: string) => stories.filter(s => s.sources.includes(id) || s.pages.some(p => p.sourceRefs.includes(id)));

  return (
    <div className="space-y-5">
      <Panel title={tx("Registri sumber", "Source registry", "سجل المصادر")} action={
        <select className={sel} value={type} onChange={e => setType(e.target.value)}>
          <option value="">{tx("Semua jenis", "All types", "كل الأنواع")}</option>
          {[...new Set(SOURCES.map(s => s.type))].map(t => <option key={t}>{t}</option>)}
        </select>
      }>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead><tr><th className={th}>id</th><th className={th}>{tx("Jenis", "Type", "النوع")}</th><th className={th}>{tx("Referensi", "Reference", "المرجع")}</th><th className={th}>{tx("Catatan", "Note", "ملاحظة")}</th><th className={th}>{tx("Dikutip oleh", "Cited by", "مستشهد به في")}</th></tr></thead>
            <tbody>
              {SOURCES.filter(s => !type || s.type === type).map(s => {
                const by = citedBy(s.id);
                return (
                  <tr key={s.id}>
                    <td className={td + " font-mono text-xs"}>{s.id}</td>
                    <td className={td + " text-xs font-mono " + (TYPE_COLOR[s.type] || "")}>{s.type}</td>
                    <td className={td + " text-xs"}>{s.reference}</td>
                    <td className={td + " text-xs text-zinc-400"}>{s.note}</td>
                    <td className={td + " text-xs"}>
                      {by.length ? by.map(st => <button key={st.id} onClick={() => onOpen(st.id)} className="block hover:underline cursor-pointer text-start">{loc(st.title, language) || st.id}</button>) : <span className="text-amber-300">{tx("tidak digunakan", "unused", "غير مستخدم")}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title={tx("Grafik pengetahuan: Cerita → Nilai, Cerita → Sumber", "Knowledge graph: Story → Values, Story → Sources", "رسم المعرفة")}>
        <div className="space-y-2">
          {stories.map(st => (
            <div key={st.id} className="grid md:grid-cols-[260px_24px_1fr_24px_1fr] items-center gap-2 rounded-xl border border-white/5 px-3 py-2">
              <button onClick={() => onOpen(st.id)} className="text-start text-sm hover:underline cursor-pointer min-w-0">
                <div className="truncate">{loc(st.title, language) || st.id}</div>
                <ReviewBadge state={st.state} />
              </button>
              <span className="hidden md:block text-zinc-600 text-center">→</span>
              <div className="flex flex-wrap gap-1">{st.values.map(v => <ValueChip key={v} id={v} />)}</div>
              <span className="hidden md:block text-zinc-600 text-center">→</span>
              <div className="flex flex-wrap gap-1">
                {st.sources.map(id => (
                  <span key={id} title={SOURCE_MAP[id]?.reference || tx("Sumber tidak dikenal", "Unknown source", "مصدر غير معروف")} className={"text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 " + (SOURCE_MAP[id] ? TYPE_COLOR[SOURCE_MAP[id].type] : "text-red-300 border-red-400/40")}>{id}</span>
                ))}
                {!st.sources.length && <span className="text-[11px] text-red-300">{tx("tanpa sumber", "no sources", "بلا مصادر")}</span>}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
