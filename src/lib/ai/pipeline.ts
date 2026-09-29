import { CONFIG } from "@/config";
import { SOURCE_MAP } from "@/data/sources";
import { CANONICAL_STORIES } from "@/data/stories";
import { VALUE_MAP } from "@/data/values";
import { track } from "@/lib/analytics";
import { findStory, loc } from "@/lib/content";
import { getState, now, setState, uid } from "@/store";
import type { AIRequestLog, Lang, Story, StoryCategory, ValueId } from "@/types";
import { validateInput, validateStoryOutput, VISUAL_POLICY, type GeneratedStory } from "./validate";

/**
 * Client side of the AI architecture (PRD §22):
 * verified sources → knowledge base → retrieval → Gemini (server) →
 * structured output → safety checks → human review → published asset.
 */

export interface AIResponse<T> { ok: boolean; output?: T; model: string; error?: string; status: number }

export async function callAI<T = unknown>(task: string, input: unknown): Promise<AIResponse<T>> {
  try {
    const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task, input }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error || `HTTP ${r.status}`, status: r.status, model: "" };
    return { ok: true, output: j.output as T, model: j.model, status: r.status };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error", status: 0, model: "" };
  }
}

// ─────────────────────────── Layer 2: retrieval grounding (RAG, PRD §25) ───────────────────────────
export interface RetrievalQuery {
  mode: "fable" | "adapt";
  storyId?: string;
  value: ValueId;
  age: number;
  lang: Lang;
  topic?: string;
}

export function retrieveContext(q: RetrievalQuery) {
  if (q.mode === "adapt") {
    const st = CANONICAL_STORIES.find(s => s.id === q.storyId);
    if (!st) throw new Error("Canonical story not found");
    return {
      category: st.category,
      sources: st.sources.map(id => ({ id, reference: SOURCE_MAP[id]?.reference || id })),
      facts: st.allowedFacts || [],
      keyEvents: st.keyEvents || [],
      prohibited: st.prohibitedInvention || [],
      canonicalPages: st.pages.map(p => loc(p.text, q.lang)),
      terminology: (st.glossary || []).map(g => `${g.term}: ${g.meaning.en}`),
      retrievedIds: [st.id],
    };
  }
  // fable mode: retrieve value definition + canonical stories teaching this value (for Qur'an refs only)
  const related = CANONICAL_STORIES.filter(s => s.values.includes(q.value)).slice(0, 3);
  const quranRefs = [...new Set(related.flatMap(s => s.sources).filter(id => SOURCE_MAP[id]?.type === "quran"))].slice(0, 3);
  const def = VALUE_MAP[q.value];
  return {
    category: "moral" as StoryCategory,
    sources: [{ id: "fable-original", reference: SOURCE_MAP["fable-original"].reference }, ...quranRefs.map(id => ({ id, reference: SOURCE_MAP[id].reference }))],
    facts: [],
    keyEvents: [`The story teaches ${def.name.en}: ${def.description.en}`],
    prohibited: ["Using Prophets or Companions as characters", "Quoting hadith or Qur'an", "Presenting fiction as history", "Scary or violent scenes"],
    canonicalPages: undefined,
    terminology: [],
    retrievedIds: related.map(r => r.id),
  };
}

function cacheKey(q: RetrievalQuery & { pages: number; childName?: string }) {
  return `story:${q.mode}:${q.storyId || ""}:${q.value}:${q.age}:${q.lang}:${q.pages}:${(q.topic || "").toLowerCase().trim()}:${q.childName || ""}`;
}

function logAI(entry: AIRequestLog) {
  setState(s => ({ ...s, aiLogs: [...s.aiLogs, entry] }));
}

export interface GenerateParams extends RetrievalQuery { pages: number; childName?: string; by: string }
export interface GenerateResult { ok: boolean; story?: Story; error?: string; layer?: string; issues?: { rule: string; severity: string; message: string }[] }

export async function generateStory(p: GenerateParams): Promise<GenerateResult> {
  const logBase: AIRequestLog = {
    id: uid("ai"), at: now(), kind: p.mode === "adapt" ? "adaptation" : "story_generation", model: CONFIG.ai.strongModel,
    input: { mode: p.mode, storyId: p.storyId, value: p.value, age: p.age, lang: p.lang, pages: p.pages, topic: p.topic },
    inputCheck: { ok: true }, retrievedSources: [], cached: false,
  };
  track("ai_story_requested", { mode: p.mode, value: p.value });

  // Layer 1 — input validation
  const inputCheck = validateInput(`${p.topic || ""} ${p.childName || ""}`);
  if (!inputCheck.ok) {
    logAI({ ...logBase, inputCheck });
    return { ok: false, error: inputCheck.reason, layer: "input" };
  }

  // Layer 2 — retrieval
  let ctx;
  try { ctx = retrieveContext(p); } catch (e: any) { return { ok: false, error: e.message, layer: "retrieval" }; }
  logBase.retrievedSources = ctx.sources.map(s => s.id);

  // Cache (PRD §90)
  const key = cacheKey(p);
  const cached = getState().aiCache[key]?.value as GeneratedStory | undefined;
  let raw: unknown = cached;
  let model: string = CONFIG.ai.strongModel;
  if (!cached) {
    // Layer 3 — constrained structured generation (server)
    const r = await callAI<GeneratedStory>("story", {
      mode: p.mode, value: p.value, age: p.age, lang: p.lang, pages: p.pages, topic: p.topic, childName: p.childName,
      context: { sources: ctx.sources, facts: ctx.facts, keyEvents: ctx.keyEvents, prohibited: ctx.prohibited, canonicalPages: ctx.canonicalPages, terminology: ctx.terminology, category: ctx.category },
    });
    if (!r.ok) {
      logAI({ ...logBase, error: r.error });
      return { ok: false, error: r.error, layer: "generation" };
    }
    raw = r.output;
    model = r.model;
  }

  // Layer 4 — output validation
  const { result, story: g } = validateStoryOutput(raw, {
    mode: p.mode, requiredValue: p.value, age: p.age, lang: p.lang,
    allowedSourceIds: ctx.sources.map(s => s.id), minPages: 3, maxPages: 6,
  });
  if (!cached && result.passed) setState(s => ({ ...s, aiCache: { ...s.aiCache, [key]: { at: now(), value: raw } } }));

  if (!g) {
    logAI({ ...logBase, model, outputCheck: result, cached: !!cached });
    return { ok: false, error: "Output failed schema validation", layer: "validation", issues: result.issues };
  }

  // Convert to Story entity. Layer 5 — human review: never auto-published.
  const base = p.mode === "adapt" ? CANONICAL_STORIES.find(s => s.id === p.storyId) : undefined;
  const id = uid(p.mode === "adapt" ? `${p.storyId}-adapt` : "ai");
  const vals = (g.primary_values || []).map(v => v.toLowerCase()).filter(v => v in VALUE_MAP) as ValueId[];
  const L = (t: string) => (p.lang === "ar" ? { en: "", ar: t } : { en: t });
  const story: Story = {
    id,
    slug: id,
    title: p.lang === "ar" ? { en: base?.title.en || g.title, ar: g.title } : { en: g.title, ar: base?.title.ar },
    description: L(g.description || ""),
    category: (base?.category || "moral") as StoryCategory,
    coverImage: base?.coverImage,
    durationMin: Math.max(3, Math.round(g.pages.length * 1.5)),
    ageRange: [Math.max(4, g.age_range?.[0] ?? p.age), Math.min(12, g.age_range?.[1] ?? p.age)],
    values: vals.length ? vals : [p.value],
    pages: g.pages.map((pg, i) => ({ page: i + 1, text: L(pg.narrative), illustrationPrompt: `${pg.illustration_prompt} — ${VISUAL_POLICY}`, sourceRefs: pg.source_refs, image: base?.pages[i]?.image })),
    discussion: {
      questions: g.discussion.questions.slice(0, 3).map(L),
      action: L(g.discussion.action),
      reflection: L(g.discussion.reflection),
      dua: base?.discussion.dua,
    },
    sources: ctx.sources.map(s => s.id),
    allowedFacts: base?.allowedFacts,
    keyEvents: base?.keyEvents,
    prohibitedInvention: ctx.prohibited,
    state: result.passed ? (p.mode === "adapt" ? "scholar_review" : "editorial_review") : "draft",
    version: "0.1",
    origin: "ai_generated",
    premium: base?.premium ?? false,
    packId: base?.packId,
  };

  setState(s => ({
    ...s,
    storyOverrides: { ...s.storyOverrides, [id]: story },
    versions: [...s.versions, { storyId: id, version: "0.1", at: now(), by: `AI (${model}) via ${p.by}`, note: result.passed ? "Generated; passed automated validation" : "Generated; failed validation", snapshot: story }],
    reviews: [...s.reviews, { id: uid("rev"), storyId: id, from: "ai_generation", to: story.state, by: "validator", note: result.issues.map(i => `${i.severity}: ${i.message}`).join(" | ") || "All checks passed", at: now() }],
  }));
  logAI({ ...logBase, model, outputCheck: result, cached: !!cached, resultStoryId: id });
  return { ok: true, story, issues: result.issues };
}

// ─────────────────────────── Parent AI assistant (PRD §58 P1) ───────────────────────────
export async function askAssistant(question: string, opts: { storyId?: string; age: number; lang: Lang }): Promise<{ answer: string; grounded: boolean; fallback: boolean }> {
  track("ai_assistant_asked");
  const check = validateInput(question);
  if (!check.ok) return { answer: check.reason!, grounded: false, fallback: true };
  const st = findStory(getState(), opts.storyId);
  const context = st && {
    title: st.title.en, values: st.values, pages: st.pages.map(p => p.text.en),
    discussion: { questions: st.discussion.questions.map(q => q.en), action: st.discussion.action.en, reflection: st.discussion.reflection.en, dua: st.discussion.dua && `${st.discussion.dua.transliteration} (${st.discussion.dua.source})` },
    sources: st.sources.map(id => SOURCE_MAP[id]?.reference),
  };
  const r = await callAI<string>("assistant", { question, lang: opts.lang, age: opts.age, story: context });
  logAI({ id: uid("ai"), at: now(), kind: "parent_assistant", model: r.ok ? r.model : CONFIG.ai.fastModel, input: { question, storyId: opts.storyId }, inputCheck: check, retrievedSources: st?.sources || [], cached: false, error: r.ok ? undefined : r.error });
  if (r.ok) return { answer: r.output || "", grounded: !!st, fallback: false };

  // Offline fallback: answer from the approved discussion guide only
  if (st) {
    const ar = opts.lang === "ar";
    const qs = st.discussion.questions.map(q => `• ${loc(q, opts.lang)}`).join("\n");
    return {
      answer: (ar ? `إليك طريقة لبدء الحديث عن «${loc(st.title, "ar")}»:\n${qs}\n\nتحدٍّ عائلي: ${loc(st.discussion.action, "ar")}` : `Here's a way to start talking about "${st.title.en}":\n${qs}\n\nFamily challenge: ${st.discussion.action.en}`) +
        (ar ? "\n\n(المساعد الذكي غير متصل — هذه إجابة من دليل النقاش المعتمد.)" : "\n\n(The AI assistant is offline — this answer comes from the approved discussion guide.)"),
      grounded: true, fallback: true,
    };
  }
  return { answer: opts.lang === "ar" ? "المساعد الذكي غير متاح حالياً. اختر قصة للحصول على أسئلة نقاش جاهزة." : "The AI assistant is not available right now. Pick a story to get ready-made discussion prompts.", grounded: false, fallback: true };
}

export async function generateIllustration(prompt: string) {
  return callAI<string>("image", { prompt });
}

export async function classifyValues(text: string) {
  return callAI<{ values: string[] }>("classify", { text });
}
