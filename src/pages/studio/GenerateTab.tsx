import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { Panel, btn, toast } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { CANONICAL_STORIES } from "@/data/stories";
import { STATE_LABEL, VALUES } from "@/data/values";
import { generateIllustration, generateStory, retrieveContext, type GenerateResult } from "@/lib/ai/pipeline";
import { validateInput } from "@/lib/ai/validate";
import { findStory, loc } from "@/lib/content";
import { cn } from "@/lib/utils";
import { setState, useStore } from "@/store";
import type { Lang, ValueId } from "@/types";
import { Field, inp, sel } from "./shared";

type Status = "idle" | "ok" | "fail" | "running" | "warn";

function StatusIcon({ s }: { s: Status }) {
  if (s === "ok") return <CheckCircle2 className="w-4 h-4 text-emerald-300" />;
  if (s === "fail") return <XCircle className="w-4 h-4 text-red-300" />;
  if (s === "warn") return <AlertTriangle className="w-4 h-4 text-amber-300" />;
  if (s === "running") return <Loader2 className="w-4 h-4 animate-spin text-sky-300" />;
  return <Circle className="w-4 h-4 text-zinc-600" />;
}

export default function GenerateTab({ editor, onOpen, onReview }: { editor: string; onOpen: (id: string) => void; onReview: (id: string) => void }) {
  const { tx, language } = useLanguage();
  const [mode, setMode] = useState<"fable" | "adapt">("fable");
  const [value, setValue] = useState<ValueId>("patience");
  const [storyId, setStoryId] = useState(CANONICAL_STORIES.find(s => s.category !== "moral")?.id || "");
  const [age, setAge] = useState(6);
  const [lang, setLang] = useState<Lang>("en");
  const [pages, setPages] = useState(4);
  const [topic, setTopic] = useState("");
  const [childName, setChildName] = useState("");
  const [running, setRunning] = useState(false);
  const [res, setRes] = useState<GenerateResult | null>(null);
  const [imgBusy, setImgBusy] = useState<number | null>(null);
  const state = useStore(s => s);
  const story = res?.story ? findStory(state, res.story.id) || res.story : undefined;

  const inputCheck = validateInput(`${topic} ${childName}`);
  const ctx = useMemo(() => {
    try { return { ok: true as const, c: retrieveContext({ mode, storyId, value, age, lang, topic }) }; }
    catch (e: any) { return { ok: false as const, error: String(e?.message || e) }; }
  }, [mode, storyId, value, age, lang, topic]);

  const notConfigured = !!res && !res.ok && res.layer === "generation" && /not configured|503|GEMINI|api key/i.test(res.error || "");
  const errors = (res?.issues || []).filter(i => i.severity === "error").length;

  const layers: { name: string; desc: string; s: Status; detail?: string }[] = [
    { name: tx("1 · Input validation", "١ · التحقق من المدخلات"), desc: tx("Blocks unsafe topics and sacred-figure requests", "يمنع الطلبات غير الآمنة"), s: inputCheck.ok ? "ok" : "fail", detail: inputCheck.reason },
    { name: tx("2 · Retrieval (RAG)", "٢ · الاسترجاع"), desc: tx("Grounds the model in approved sources only", "يعتمد على المصادر المعتمدة"), s: ctx.ok ? "ok" : "fail", detail: ctx.ok ? `${ctx.c.sources.length} sources` : ctx.error },
    { name: tx("3 · Constrained generation", "٣ · التوليد المقيّد"), desc: tx("Structured JSON output from the strong model", "مخرجات منظمة"), s: running ? "running" : !res ? "idle" : res.ok || res.layer === "validation" ? "ok" : res.layer === "generation" ? "fail" : "idle", detail: res && !res.ok && res.layer === "generation" ? res.error : undefined },
    { name: tx("4 · Output validation", "٤ · التحقق من المخرجات"), desc: tx("Schema, sources, fabricated quotes, sacred figures, visual policy", "المخطط والمصادر والاقتباسات"), s: !res || running ? "idle" : res.layer === "validation" ? "fail" : res.ok ? (errors ? "fail" : res.issues?.length ? "warn" : "ok") : "idle" },
    { name: tx("5 · Human review", "٥ · المراجعة البشرية"), desc: tx("Never auto-published — goes to the review queue", "لا نشر تلقائي"), s: story ? "warn" : "idle", detail: story ? `${tx("Queued as", "في قائمة")}: ${STATE_LABEL[story.state]}` : undefined },
  ];

  async function run() {
    setRunning(true);
    setRes(null);
    const r = await generateStory({ mode, storyId: mode === "adapt" ? storyId : undefined, value, age, lang, pages, topic: topic || undefined, childName: childName || undefined, by: editor.trim() || "Editor" });
    setRes(r);
    setRunning(false);
    if (r.ok) toast(tx("Draft created — awaiting human review", "تم إنشاء مسودة"));
  }

  async function illustrate(i: number) {
    if (!story) return;
    const prompt = story.pages[i].illustrationPrompt || "";
    setImgBusy(i);
    const r = await generateIllustration(prompt);
    setImgBusy(null);
    if (!r.ok || !r.output) return toast(tx(`Illustration failed: ${r.error}`, "فشل الرسم"));
    const id = story.id;
    setState(s => {
      const cur = s.storyOverrides[id];
      if (!cur) return s;
      return { ...s, storyOverrides: { ...s.storyOverrides, [id]: { ...cur, pages: cur.pages.map((p, j) => (j === i ? { ...p, image: r.output } : p)) } } };
    });
  }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-5">
      <div className="space-y-5">
        <Panel title={tx("Request", "الطلب")}>
          <div className="space-y-3">
            <div className="flex gap-1.5">
              {(["fable", "adapt"] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} className={cn("flex-1 px-3 py-2 rounded-xl text-xs cursor-pointer border", mode === m ? "bg-white text-black border-white" : "border-white/15 text-zinc-300")}>
                  {m === "fable" ? tx("Original fable", "قصة أخلاقية") : tx("Adapt canonical", "تكييف قصة")}
                </button>
              ))}
            </div>
            {mode === "adapt" && (
              <Field label={tx("Canonical story", "القصة الأصلية")}>
                <select className={sel + " w-full"} value={storyId} onChange={e => setStoryId(e.target.value)}>
                  {CANONICAL_STORIES.map(s => <option key={s.id} value={s.id}>{loc(s.title, language)}</option>)}
                </select>
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label={tx("Value", "القيمة")}>
                <select className={sel + " w-full"} value={value} onChange={e => setValue(e.target.value as ValueId)}>
                  {VALUES.map(v => <option key={v.id} value={v.id}>{loc(v.name, language)}</option>)}
                </select>
              </Field>
              <Field label={tx("Age", "العمر")}>
                <select className={sel + " w-full"} value={age} onChange={e => setAge(+e.target.value)}>
                  {Array.from({ length: 9 }, (_, i) => i + 4).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </Field>
              <Field label={tx("Language", "اللغة")}>
                <select className={sel + " w-full"} value={lang} onChange={e => setLang(e.target.value as Lang)}><option value="en">English</option><option value="ar">العربية</option></select>
              </Field>
              <Field label={tx("Pages", "الصفحات")}>
                <select className={sel + " w-full"} value={pages} onChange={e => setPages(+e.target.value)}>{[3, 4, 5, 6].map(n => <option key={n}>{n}</option>)}</select>
              </Field>
            </div>
            {mode === "fable" && (
              <>
                <Field label={tx("Theme (optional)", "الموضوع")}><input className={inp} value={topic} onChange={e => setTopic(e.target.value)} placeholder={tx("e.g. sharing toys at school", "مثال: مشاركة الألعاب")} /></Field>
                <Field label={tx("Child first name (optional)", "اسم الطفل")}><input className={inp} value={childName} onChange={e => setChildName(e.target.value)} /></Field>
              </>
            )}
            <button className={btn.primary + " w-full"} disabled={running || !inputCheck.ok || !ctx.ok} onClick={run}>
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{tx("Generate draft", "توليد مسودة")}
            </button>
          </div>
        </Panel>

        <Panel title={tx("Safety layers (PRD §27)", "طبقات الأمان")}>
          <ol className="space-y-3">
            {layers.map(l => (
              <li key={l.name} className="flex gap-3">
                <StatusIcon s={l.s} />
                <div className="min-w-0">
                  <div className="text-sm">{l.name}</div>
                  <div className="text-[11px] text-zinc-500">{l.desc}</div>
                  {l.detail && <div className={cn("text-[11px] mt-0.5", l.s === "fail" ? "text-red-300" : "text-zinc-400")}>{l.detail}</div>}
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="space-y-5 min-w-0">
        <Panel title={tx("Retrieved context (preview)", "السياق المسترجع")}>
          {!ctx.ok ? <p className="text-xs text-red-300">{ctx.error}</p> : (
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-mono text-zinc-500 mb-1">{tx("Sources", "المصادر")} · {ctx.c.category}</div>
                <ul className="space-y-0.5">{ctx.c.sources.map(s => <li key={s.id}><span className="font-mono text-zinc-500">{s.id}</span> — {s.reference}</li>)}</ul>
                {!!ctx.c.facts.length && <><div className="font-mono text-zinc-500 mt-3 mb-1">{tx("Allowed facts", "الحقائق")}</div><ul className="list-disc ps-4 space-y-0.5">{ctx.c.facts.map((f, i) => <li key={i}>{f}</li>)}</ul></>}
              </div>
              <div>
                <div className="font-mono text-zinc-500 mb-1">{tx("Key events", "الأحداث")}</div>
                <ul className="list-disc ps-4 space-y-0.5">{ctx.c.keyEvents.map((f, i) => <li key={i}>{f}</li>)}</ul>
                <div className="font-mono text-zinc-500 mt-3 mb-1">{tx("Prohibited", "الممنوعات")}</div>
                <ul className="list-disc ps-4 space-y-0.5 text-red-200/80">{ctx.c.prohibited.map((f, i) => <li key={i}>{f}</li>)}</ul>
                {!!ctx.c.retrievedIds.length && <div className="text-zinc-500 mt-3">{tx("Retrieved stories", "القصص المسترجعة")}: {ctx.c.retrievedIds.join(", ")}</div>}
              </div>
            </div>
          )}
        </Panel>

        {notConfigured && (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5 text-sm">
            <div className="font-medium text-amber-200 mb-1">{tx("AI is not configured", "الذكاء الاصطناعي غير مُعد")}</div>
            <p className="text-zinc-300 text-xs leading-relaxed">
              {tx("Set GEMINI_API_KEY in .env.local for local development (then restart the dev server), or add it as an Environment Variable in your Vercel project settings and redeploy. See DEPLOY.md.", "اضبط GEMINI_API_KEY في ملف ‎.env.local أو في إعدادات Vercel.")}
            </p>
            <div className="text-[11px] font-mono text-zinc-500 mt-2">{res?.error}</div>
          </div>
        )}
        {res && !res.ok && !notConfigured && (
          <div className="rounded-2xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-200">
            {tx("Stopped at layer", "توقف عند الطبقة")}: <span className="font-mono">{res.layer}</span> — {res.error}
          </div>
        )}
        {!!res?.issues?.length && (
          <Panel title={tx("Validation issues", "مشكلات التحقق")}>
            <ul className="space-y-1 text-xs">
              {res.issues.map((i, k) => (
                <li key={k} className="flex gap-2"><span className={cn("font-mono w-16 shrink-0", i.severity === "error" ? "text-red-300" : "text-amber-300")}>{i.severity}</span><span className="font-mono text-zinc-500 w-28 shrink-0">{i.rule}</span><span>{i.message}</span></li>
              ))}
            </ul>
          </Panel>
        )}
        {story && (
          <Panel title={loc(story.title, lang) || story.title.en} action={
            <span className="flex gap-2">
              <button className={btn.small} onClick={() => onOpen(story.id)}>{tx("Open in editor", "افتح في المحرر")}</button>
              <button className={btn.small} onClick={() => onReview(story.id)}>{tx("Go to review queue", "إلى المراجعة")}</button>
            </span>
          }>
            <div className="text-xs font-mono text-zinc-500 mb-3">{story.id} · {STATE_LABEL[story.state]} · v{story.version}</div>
            <div className="space-y-3">
              {story.pages.map((p, i) => (
                <div key={i} className="rounded-xl border border-white/10 p-3 flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono text-zinc-500 mb-1">{tx("Page", "صفحة")} {p.page} · {p.sourceRefs.join(", ")}</div>
                    <p className="text-sm leading-relaxed" dir={lang === "ar" ? "rtl" : undefined}>{loc(p.text, lang)}</p>
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{p.illustrationPrompt}</p>
                  </div>
                  <div className="w-28 shrink-0 flex flex-col items-center gap-1.5">
                    {p.image ? <img src={p.image} alt="" className="w-28 h-20 object-cover rounded-lg" /> : <div className="w-28 h-20 rounded-lg border border-dashed border-white/15" />}
                    <button className={btn.small} disabled={imgBusy !== null} onClick={() => illustrate(i)} title={tx("Uses the image model (costs)", "يستخدم نموذج الصور")}>
                      {imgBusy === i ? <Loader2 className="w-3 h-3 animate-spin" /> : null}{tx("Illustrate", "ارسم")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs space-y-1">
              {story.discussion.questions.map((q, i) => <div key={i}>Q{i + 1}. {loc(q, lang)}</div>)}
              <div className="text-zinc-400">{tx("Action", "العمل")}: {loc(story.discussion.action, lang)}</div>
              <div className="text-zinc-400">{tx("Reflection", "التأمل")}: {loc(story.discussion.reflection, lang)}</div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
