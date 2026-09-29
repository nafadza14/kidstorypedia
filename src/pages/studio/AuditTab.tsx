import { Panel, Stat, btn, toast } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { CONFIG } from "@/config";
import { cn } from "@/lib/utils";
import { setState, useStore } from "@/store";
import { fmtDate, td, th } from "./shared";

export default function AuditTab({ onOpen }: { onOpen: (id: string) => void }) {
  const { tx } = useLanguage();
  const logs = useStore(s => s.aiLogs);
  const cache = useStore(s => s.aiCache);
  const rows = logs.slice().reverse();
  const cacheN = Object.keys(cache).length;
  const cachedHits = logs.filter(l => l.cached).length;

  const routing = [
    { tier: tx("Cepat", "Fast", "سريع"), model: CONFIG.ai.fastModel, tasks: tx("Asisten orang tua, klasifikasi nilai", "Parent assistant, value classification", "مساعد الوالدين، تصنيف القيم") },
    { tier: tx("Kuat", "Strong", "قوي"), model: CONFIG.ai.strongModel, tasks: tx("Pembuatan cerita, adaptasi kanonik", "Story generation, canonical adaptation", "توليد القصص وتكييفها") },
    { tier: tx("Gambar", "Image", "صور"), model: CONFIG.ai.imageModel, tasks: tx("Ilustrasi (kebijakan visual tanpa wajah diterapkan)", "Illustrations (faceless visual policy enforced)", "الرسوم التوضيحية") },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label={tx("Permintaan AI tercatat", "AI requests logged", "الطلبات المسجلة")} value={logs.length} />
        <Stat label={tx("Kegagalan validasi", "Validation failures", "إخفاقات التحقق")} value={logs.filter(l => l.outputCheck && !l.outputCheck.passed).length} />
        <Stat label={tx("Entri cache", "Cache entries", "عناصر الذاكرة المؤقتة")} value={cacheN} sub={`${cachedHits} ${tx("respons dari cache", "cached responses served", "استجابات من الذاكرة")}`} />
        <Stat label={tx("Kesalahan", "Errors", "أخطاء")} value={logs.filter(l => l.error || !l.inputCheck.ok).length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title={tx("Routing model (PRD §90)", "Model routing (PRD §90)", "توجيه النماذج")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead><tr><th className={th}>{tx("Tingkat", "Tier", "الفئة")}</th><th className={th}>{tx("Model", "Model", "النموذج")}</th><th className={th}>{tx("Digunakan untuk", "Used for", "الاستخدام")}</th></tr></thead>
              <tbody>{routing.map(r => <tr key={r.tier}><td className={td}>{r.tier}</td><td className={td + " font-mono text-xs"}>{r.model}</td><td className={td + " text-xs text-zinc-400"}>{r.tasks}</td></tr>)}</tbody>
            </table>
          </div>
        </Panel>
        <Panel title={tx("Cache respons", "Response cache", "الذاكرة المؤقتة")} action={<button className={btn.small} disabled={!cacheN} onClick={() => { if (confirm(tx("Hapus cache AI?", "Clear AI cache?", "مسح الذاكرة؟"))) { setState(s => ({ ...s, aiCache: {} })); toast(tx("Cache dihapus", "Cache cleared", "تم المسح")); } }}>{tx("Hapus cache", "Clear cache", "مسح")}</button>}>
          <p className="text-xs text-zinc-400 mb-2">{tx("Output cerita yang tervalidasi di-cache berdasarkan parameter permintaan untuk menghemat biaya dan latensi. Hanya output yang lolos validasi yang di-cache.", "Validated story outputs are cached by request parameters to cut cost and latency. Only outputs that passed validation are cached.", "تُخزَّن المخرجات الناجحة فقط.")}</p>
          <ul className="text-[11px] font-mono text-zinc-500 space-y-0.5 max-h-32 overflow-y-auto">
            {Object.entries(cache).map(([k, v]) => <li key={k} className="truncate">{fmtDate(v.at)} · {k}</li>)}
          </ul>
        </Panel>
      </div>

      <Panel title={tx("Jejak audit AI", "AI audit trail", "سجل تدقيق الذكاء")}>
        {!rows.length ? <p className="text-xs text-zinc-500">{tx("Belum ada permintaan AI.", "No AI requests yet.", "لا توجد طلبات.")}</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead><tr>{["Time", "Kind", "Model", "Input check", "Retrieved", "Validation", "Cached", "Error", "Result"].map(h => <th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map(l => (
                  <tr key={l.id}>
                    <td className={td + " text-xs font-mono text-zinc-400 whitespace-nowrap"}>{fmtDate(l.at)}</td>
                    <td className={td + " text-xs"}>{l.kind}<div className="text-[10px] text-zinc-500 font-mono">{Object.entries(l.input).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}=${String(v).slice(0, 30)}`).join(" ")}</div></td>
                    <td className={td + " text-xs font-mono"}>{l.model}</td>
                    <td className={td + " text-xs"}>{l.inputCheck.ok ? <span className="text-emerald-300">ok</span> : <span className="text-red-300">{l.inputCheck.reason}</span>}</td>
                    <td className={td + " text-[10px] font-mono text-zinc-400"}>{l.retrievedSources.join(", ") || "-"}</td>
                    <td className={td + " text-xs"}>
                      {!l.outputCheck ? "-" : (
                        <details>
                          <summary className={cn("cursor-pointer", l.outputCheck.passed ? "text-emerald-300" : "text-red-300")}>{l.outputCheck.passed ? "passed" : "failed"} · {l.outputCheck.issues.length}</summary>
                          <ul className="mt-1 space-y-0.5">{l.outputCheck.issues.map((i, k) => <li key={k} className={i.severity === "error" ? "text-red-300" : "text-amber-300"}>{i.rule}: {i.message}</li>)}</ul>
                        </details>
                      )}
                    </td>
                    <td className={td + " text-xs"}>{l.cached ? "yes" : "no"}</td>
                    <td className={td + " text-xs text-red-300"}>{l.error || ""}</td>
                    <td className={td + " text-xs"}>{l.resultStoryId ? <button className="font-mono hover:underline cursor-pointer" onClick={() => onOpen(l.resultStoryId!)}>{l.resultStoryId}</button> : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
