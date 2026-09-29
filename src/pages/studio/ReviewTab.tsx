import { useMemo, useState } from "react";
import { Check, ShieldAlert } from "lucide-react";
import { Empty, Panel, ReviewBadge, btn, toast } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { CONTENT_STATES, STATE_LABEL } from "@/data/values";
import { SOURCE_MAP } from "@/data/sources";
import { validateStoryOutput } from "@/lib/ai/validate";
import { allStories, findStory, loc } from "@/lib/content";
import { cn } from "@/lib/utils";
import { transitionStory, useStore } from "@/store";
import type { ContentState, Lang, Story, ValidationResult } from "@/types";
import { Field, fmtDate, inp, requiresScholar, sel, storyToGenerated, td, th } from "./shared";

type Props = { id?: string; editor: string; onPick: (id: string) => void; onEdit: (id: string) => void };

const SIGNOFF = "[Scholar sign-off ✓]";
const CHECKLIST = [
  { id: "sources", en: "Sources verified against primary texts", ar: "تم التحقق من المصادر" },
  { id: "quotes", en: "No fabricated quotes, hadith or verses", ar: "لا اقتباسات مختلقة" },
  { id: "sacred", en: "Sacred figure representation respected (no depiction, no invented speech)", ar: "احترام تمثيل الشخصيات المقدسة" },
  { id: "age", en: "Age-appropriate language and themes", ar: "مناسب للعمر" },
];

export default function ReviewTab({ id, editor, onPick, onEdit }: Props) {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const [showAll, setShowAll] = useState(false);
  const queue = useMemo(() => allStories(state).filter(s => showAll || s.state !== "published"), [state, showAll]);
  const story = findStory(state, id);

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-5">
      <Panel title={tx("Governance queue", "قائمة الحوكمة")} action={<label className="text-[11px] flex items-center gap-1.5 text-zinc-400"><input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />{tx("incl. published", "مع المنشور")}</label>}>
        <ul className="space-y-1 max-h-[70vh] overflow-y-auto -mx-2">
          {queue.map(s => (
            <li key={s.id}>
              <button onClick={() => onPick(s.id)} className={cn("w-full text-start px-3 py-2 rounded-xl cursor-pointer", s.id === story?.id ? "bg-white/10" : "hover:bg-white/5")}>
                <div className="text-sm truncate">{loc(s.title, language) || s.id}</div>
                <div className="flex items-center gap-2 mt-0.5"><ReviewBadge state={s.state} /><span className="text-[10px] font-mono text-zinc-500">{s.origin} · v{s.version}</span></div>
              </button>
            </li>
          ))}
          {!queue.length && <li className="text-xs text-zinc-500 px-3">{tx("Queue is empty.", "القائمة فارغة.")}</li>}
        </ul>
      </Panel>
      {story ? <ReviewDetail key={story.id} story={story} editor={editor} onEdit={onEdit} /> : <Empty>{tx("Select a story to review.", "اختر قصة للمراجعة.")}</Empty>}
    </div>
  );
}

function ReviewDetail({ story, editor, onEdit }: { story: Story; editor: string; onEdit: (id: string) => void }) {
  const { tx, language } = useLanguage();
  const reviews = useStore(s => s.reviews);
  const log = reviews.filter(r => r.storyId === story.id).slice().reverse();
  const [reviewer, setReviewer] = useState(editor);
  const [note, setNote] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [back, setBack] = useState<ContentState>("draft");
  const [vLang, setVLang] = useState<Lang>("en");
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const idx = CONTENT_STATES.indexOf(story.state);
  const scholarIdx = CONTENT_STATES.indexOf("scholar_review");
  const next: ContentState | undefined = story.state === "periodic_review" ? "published" : CONTENT_STATES[idx + 1];
  const prev: ContentState | undefined = idx > 0 ? CONTENT_STATES[idx - 1] : undefined;
  const sacred = requiresScholar(story);
  const allChecked = CHECKLIST.every(c => checks[c.id]);
  const hasSignoff = log.some(r => r.from === "scholar_review" && CONTENT_STATES.indexOf(r.to) > scholarIdx && r.note.includes(SIGNOFF));
  const leavingScholar = story.state === "scholar_review";

  let block: string | null = null;
  if (!reviewer.trim()) block = tx("Reviewer name is required.", "اسم المراجع مطلوب.");
  else if (sacred && leavingScholar && !allChecked) block = tx("Scholar checklist must be fully completed to leave scholar review.", "يجب إكمال قائمة التحقق.");
  else if (sacred && next === "published" && !hasSignoff && !leavingScholar) block = tx("Canonical religious content must pass scholar review (with sign-off) before publishing. Send it back to scholar review.", "يجب اجتياز مراجعة العالم قبل النشر.");

  function move(to: ContentState, kind: "next" | "prev" | "back") {
    const by = reviewer.trim();
    if (!by) return toast(tx("Enter reviewer name", "أدخل اسم المراجع"));
    let n = note.trim();
    if (kind === "next" && sacred && leavingScholar) {
      if (!allChecked) return;
      n = `${SIGNOFF} ${CHECKLIST.map(c => c.id).join(", ")}${n ? " — " + n : ""}`;
    }
    if (kind === "next" && block) return;
    transitionStory(story.id, story, to, by, n || (kind === "next" ? "Approved" : "Sent back"));
    setNote("");
    setChecks({});
    toast(`${STATE_LABEL[story.state]} → ${STATE_LABEL[to]}`);
  }

  function runValidation() {
    const g = storyToGenerated(story, vLang);
    const mid = Math.round((story.ageRange[0] + story.ageRange[1]) / 2);
    const { result } = validateStoryOutput(g, {
      mode: story.category === "moral" ? "fable" : "adapt",
      requiredValue: story.values[0], age: mid, lang: vLang,
      allowedSourceIds: story.sources, minPages: 1, maxPages: 12,
    });
    setValidation(result);
  }

  return (
    <div className="space-y-5 min-w-0">
      <Panel title={loc(story.title, language) || story.id} action={<button className={btn.small} onClick={() => onEdit(story.id)}>{tx("Open in editor", "افتح في المحرر")}</button>}>
        <div className="text-xs font-mono text-zinc-500 mb-4">{story.id} · {story.category} · {story.origin} · v{story.version} · {tx("sources", "المصادر")}: {story.sources.map(s => SOURCE_MAP[s]?.reference || s).join("; ") || "—"}</div>
        {/* stepper */}
        <ol className="flex flex-wrap gap-y-3 items-center mb-6">
          {CONTENT_STATES.map((s, i) => {
            const done = i < idx, cur = i === idx;
            return (
              <li key={s} className="flex items-center">
                <div className="flex flex-col items-center gap-1 w-[92px]">
                  <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono border", cur ? "bg-white text-black border-white" : done ? "border-emerald-400/60 text-emerald-300" : "border-white/15 text-zinc-500")}>
                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className={cn("text-[10px] text-center leading-tight", cur ? "text-white" : "text-zinc-500")}>{STATE_LABEL[s]}</span>
                </div>
                {i < CONTENT_STATES.length - 1 && <span className={cn("h-px w-4 -mt-4", done ? "bg-emerald-400/50" : "bg-white/10")} />}
              </li>
            );
          })}
        </ol>

        {sacred && (
          <div className="rounded-2xl border border-amber-300/25 bg-amber-300/5 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-amber-200 mb-2"><ShieldAlert className="w-4 h-4" />{tx("Canonical religious content — scholar sign-off required before publishing", "محتوى ديني — يتطلب توقيع العالم")}</div>
            <div className="text-xs text-zinc-400 mb-2">{hasSignoff ? <span className="text-emerald-300">✓ {tx("Scholar sign-off on record.", "توقيع العالم مسجّل.")}</span> : tx("No scholar sign-off recorded yet.", "لا يوجد توقيع بعد.")}</div>
            {leavingScholar && (
              <div className="grid sm:grid-cols-2 gap-2">
                {CHECKLIST.map(c => (
                  <label key={c.id} className="flex items-start gap-2 text-xs text-zinc-200">
                    <input type="checkbox" className="mt-0.5" checked={!!checks[c.id]} onChange={e => setChecks(x => ({ ...x, [c.id]: e.target.checked }))} />
                    {tx(c.en, c.ar)}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <Field label={tx("Reviewer name", "اسم المراجع")}><input className={inp} value={reviewer} onChange={e => setReviewer(e.target.value)} /></Field>
          <Field label={tx("Note", "ملاحظة")}><input className={inp} value={note} onChange={e => setNote(e.target.value)} placeholder={tx("What was checked / why", "ما الذي تمت مراجعته")} /></Field>
        </div>
        {block && <div className="text-xs text-amber-300 mb-3">{block}</div>}
        <div className="flex flex-wrap gap-2 items-center">
          {next && <button className={btn.primary} disabled={!!block} onClick={() => move(next, "next")}>{tx("Approve →", "اعتماد →")} {STATE_LABEL[next]}</button>}
          {prev && <button className={btn.ghost} disabled={!reviewer.trim()} onClick={() => move(prev, "prev")}>← {STATE_LABEL[prev]}</button>}
          {idx > 0 && (
            <span className="flex items-center gap-1.5">
              <select className={sel} value={back} onChange={e => setBack(e.target.value as ContentState)}>
                {CONTENT_STATES.filter((_, i) => i < idx).map(s => <option key={s} value={s}>{STATE_LABEL[s]}</option>)}
              </select>
              <button className={btn.small} disabled={!reviewer.trim() || !note.trim()} onClick={() => move(back, "back")} title={tx("Note required", "الملاحظة مطلوبة")}>{tx("Send back", "إرجاع")}</button>
            </span>
          )}
        </div>
      </Panel>

      <Panel title={tx("Automated validation", "التحقق الآلي")} action={
        <span className="flex gap-2 items-center">
          <select className={sel} value={vLang} onChange={e => setVLang(e.target.value as Lang)}><option value="en">EN</option><option value="ar">AR</option></select>
          <button className={btn.small} onClick={runValidation}>{tx("Run validation", "تشغيل التحقق")}</button>
        </span>
      }>
        {!validation ? <p className="text-xs text-zinc-500">{tx("Runs the PRD §67 output validator against this story's pages, restricted to its own sources.", "يشغّل مدقق المخرجات.")}</p> : (
          <div>
            <div className={cn("text-sm mb-2", validation.passed ? "text-emerald-300" : "text-red-300")}>{validation.passed ? tx("Passed", "نجح") : tx("Failed", "فشل")} · {validation.issues.filter(i => i.severity === "error").length} {tx("errors", "أخطاء")}, {validation.issues.filter(i => i.severity === "warning").length} {tx("warnings", "تحذيرات")}</div>
            <ul className="space-y-1 text-xs">
              {validation.issues.map((i, k) => (
                <li key={k} className="flex gap-2"><span className={cn("font-mono w-16 shrink-0", i.severity === "error" ? "text-red-300" : "text-amber-300")}>{i.severity}</span><span className="font-mono text-zinc-500 w-28 shrink-0">{i.rule}</span><span className="text-zinc-300">{i.message}</span></li>
              ))}
            </ul>
            <p className="text-[11px] text-zinc-500 mt-2">{tx("Canonical texts that quote the Qur'an may trigger the fabricated-quote rule — a human reviewer confirms these against the cited source.", "النصوص الأصلية قد تُطلق قاعدة الاقتباس.")}</p>
          </div>
        )}
      </Panel>

      <Panel title={tx("Review log", "سجل المراجعة")}>
        {!log.length ? <p className="text-xs text-zinc-500">{tx("No reviews recorded yet.", "لا توجد مراجعات.")}</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead><tr><th className={th}>{tx("When", "متى")}</th><th className={th}>{tx("Transition", "الانتقال")}</th><th className={th}>{tx("By", "بواسطة")}</th><th className={th}>{tx("Note", "ملاحظة")}</th></tr></thead>
              <tbody>
                {log.map(r => (
                  <tr key={r.id}>
                    <td className={td + " text-xs font-mono text-zinc-400 whitespace-nowrap"}>{fmtDate(r.at)}</td>
                    <td className={td + " text-xs whitespace-nowrap"}>{STATE_LABEL[r.from]} → {STATE_LABEL[r.to]}</td>
                    <td className={td + " text-xs"}>{r.by}</td>
                    <td className={td + " text-xs text-zinc-300"}>{r.note}</td>
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
