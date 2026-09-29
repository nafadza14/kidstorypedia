/**
 * AI safety layers (PRD §27) and story acceptance criteria (PRD §67).
 * Pure module - no browser or alias imports - so it can run both in the
 * client and in the serverless function (api/ai.ts).
 */
import type { ValidationIssue, ValidationResult } from "../../types";

// ─────────────────────────── Layer 1: input validation ───────────────────────────
const UNSAFE_INPUT = [
  /\b(kill|murder|blood|gore|torture|suicide|weapon|gun|bomb|knife fight|drug|alcohol|beer|wine|sex|sexy|nude|kiss|boyfriend|girlfriend|horror|zombie|demon summon|curse someone|magic spell)\b/i,
  /\b(bunuh|darah|senjata|narkoba|pacar|seks)\b/i,
];
const SACRED_VIOLATIONS = [
  /\b(draw|show|depict|picture|image|face)\b.{0,40}\b(prophet|nabi|rasul|muhammad|allah|angel|malaikat|sahab)/i,
  /\b(new|invent|make up|create|write)\b.{0,20}\b(hadith|hadis|verse|ayah|ayat|quran)\b/i,
  /\b(joke|funny|mock|parody)\b.{0,30}\b(prophet|nabi|allah|quran|islam)\b/i,
];

export function validateInput(text: string): { ok: boolean; reason?: string } {
  const t = (text || "").trim();
  if (t.length > 600) return { ok: false, reason: "Request is too long (max 600 characters)." };
  if (UNSAFE_INPUT.some(r => r.test(t))) return { ok: false, reason: "This request includes a topic that isn't appropriate for children's stories." };
  if (SACRED_VIOLATIONS.some(r => r.test(t))) return { ok: false, reason: "Requests to depict sacred figures, invent religious texts, or joke about sacred topics are not allowed." };
  return { ok: true };
}

// ─────────────────────────── Layer 4: output validation ───────────────────────────
export interface GeneratedPage { page: number; narrative: string; illustration_prompt: string; source_refs: string[] }
export interface GeneratedStory {
  story_id?: string;
  title: string;
  description?: string;
  age_range: [number, number];
  language: "id" | "en" | "ar";
  category: string;
  primary_values: string[];
  pages: GeneratedPage[];
  discussion: { questions: string[]; action: string; reflection: string };
  safety_status?: string;
}

export interface OutputContext {
  mode: "fable" | "adapt";
  requiredValue?: string;
  age: number;
  lang: "id" | "en" | "ar";
  allowedSourceIds: string[];
  minPages: number;
  maxPages: number;
}

const FABRICATED_QUOTE = [
  /\b(prophet|messenger|rasul|nabi|muhammad)\b[^.!?]{0,40}\b(said|says|told|narrated)\b/i,
  /\b(hadith|hadis|narrated by|reported by|sahih)\b/i,
  /\ballah\s+(said|says|told)\b/i,
  /(قال|يقول)\s+(النبي|الرسول|رسول الله)/,
  /(حديث|رواه)/,
];
const SACRED_CHARACTER = /\b(prophet|nabi|rasul|messenger of allah|muhammad|ibrahim|musa|isa|nuh|yusuf|sulaiman|dawud|abu bakr|umar|uthman|ali ibn|companion|sahab)/i;
const VISUAL_VIOLATION = /\b(prophet|nabi|muhammad|messenger|angel|jibril|allah|god|companion|sahab|face of|detailed face|eyes|smiling face)\b/i;
const INAPPROPRIATE = /\b(stupid|idiot|hate you|shut up|dumb|ugly|blood|gore|scary monster)\b/i;

function wordLimit(age: number) {
  if (age <= 5) return 45;
  if (age <= 8) return 75;
  return 120;
}

export function validateStoryOutput(raw: unknown, ctx: OutputContext): { result: ValidationResult; story?: GeneratedStory } {
  const issues: ValidationIssue[] = [];
  const err = (rule: string, message: string) => issues.push({ rule, severity: "error", message });
  const warn = (rule: string, message: string) => issues.push({ rule, severity: "warning", message });

  // 1. schema
  const s = raw as GeneratedStory;
  if (!s || typeof s !== "object") {
    err("schema", "Output is not a JSON object.");
    return { result: { passed: false, issues } };
  }
  if (!s.title || typeof s.title !== "string") err("schema", "Missing title.");
  if (!Array.isArray(s.pages) || !s.pages.length) err("schema", "Missing pages.");
  if (!s.discussion || !Array.isArray(s.discussion.questions)) err("schema", "Missing discussion guide.");
  if (issues.length) return { result: { passed: false, issues } };

  // 2. age range
  if (!Array.isArray(s.age_range) || s.age_range.length !== 2 || s.age_range[0] < 4 || s.age_range[1] > 12 || s.age_range[0] > s.age_range[1]) {
    err("age_range", "Age range must be within 4–12.");
  } else if (ctx.age < s.age_range[0] || ctx.age > s.age_range[1]) {
    warn("age_range", `Requested age ${ctx.age} is outside the returned range ${s.age_range.join("–")}.`);
  }

  // 3. required value
  if (ctx.requiredValue && !(s.primary_values || []).map(v => v.toLowerCase()).includes(ctx.requiredValue)) {
    err("value", `Required value "${ctx.requiredValue}" is not among primary values.`);
  }

  // 4. pages & source refs
  if (s.pages.length < ctx.minPages || s.pages.length > ctx.maxPages) err("length", `Expected ${ctx.minPages}–${ctx.maxPages} pages, got ${s.pages.length}.`);
  const limit = wordLimit(ctx.age);
  s.pages.forEach((p, i) => {
    const n = i + 1;
    if (!p.narrative || !p.narrative.trim()) err("schema", `Page ${n} has no narrative.`);
    const words = (p.narrative || "").split(/\s+/).filter(Boolean).length;
    if (words > limit * 1.4) err("length", `Page ${n} has ${words} words (target ≤ ${limit} for age ${ctx.age}).`);
    else if (words > limit) warn("length", `Page ${n} is slightly long (${words} words).`);
    if (!Array.isArray(p.source_refs) || !p.source_refs.length) err("sources", `Page ${n} has no source reference.`);
    else p.source_refs.forEach(ref => { if (!ctx.allowedSourceIds.includes(ref)) err("sources", `Page ${n} cites unknown/unapproved source "${ref}".`); });

    // 5. fabricated quotations / unsupported religious claims
    if (FABRICATED_QUOTE.some(r => r.test(p.narrative || ""))) err("fabricated_quote", `Page ${n} attributes a quotation or hadith - not allowed in generated text.`);
    // 6. sacred figures as fable characters
    if (ctx.mode === "fable" && SACRED_CHARACTER.test(p.narrative || "")) err("sacred_figure", `Page ${n} uses a Prophet or Companion in an original fable.`);
    // 7. inappropriate language
    if (INAPPROPRIATE.test(p.narrative || "")) err("language_safety", `Page ${n} contains inappropriate language.`);
    // 8. visual policy
    if (VISUAL_VIOLATION.test(p.illustration_prompt || "")) err("visual_policy", `Page ${n} illustration prompt references sacred figures or faces.`);
    if (!p.illustration_prompt) warn("visual_policy", `Page ${n} has no illustration prompt.`);
  });

  // 9. language
  const allText = s.pages.map(p => p.narrative).join(" ");
  const arabic = (allText.match(/[؀-ۿ]/g) || []).length;
  const latin = (allText.match(/[A-Za-z]/g) || []).length;
  if (ctx.lang === "ar" && arabic < latin) err("language", "Expected Arabic text.");
  if (ctx.lang === "en" && latin < arabic) err("language", "Expected English text.");

  // 10. discussion guide
  if (s.discussion.questions.length !== 3) warn("discussion", `Expected 3 discussion questions, got ${s.discussion.questions.length}.`);
  if (!s.discussion.action) err("discussion", "Missing action challenge.");
  if (!s.discussion.reflection) err("discussion", "Missing reflection prompt.");

  const passed = !issues.some(i => i.severity === "error");
  return { result: { passed, issues }, story: s };
}

/** Enforced style suffix for every illustration (PRD §1.3 visual discipline). */
export const VISUAL_POLICY =
  "Children's book illustration, soft warm pastel colours, clean vector style. Characters are completely faceless (no eyes, nose or mouth). Modest clothing. Never depict any Prophet, Companion, angel, or representation of God. No text in the image.";
