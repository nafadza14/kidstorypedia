/**
 * Server-side AI handler shared by the Vercel function (api/ai.ts) and the
 * Vite dev server middleware (vite.config.ts). The Gemini API key never
 * reaches the browser.
 *
 * Tasks are fixed — clients cannot send arbitrary prompts. Each task builds
 * its own constrained system instruction (PRD §25 generation constraints).
 */
import { GoogleGenAI, Type } from "@google/genai";
import { validateInput, VISUAL_POLICY } from "../src/lib/ai/validate";

export interface AIResult { status: number; body: Record<string, unknown> }

const MODELS = {
  fast: process.env.GEMINI_FAST_MODEL || "gemini-2.5-flash-lite",
  strong: process.env.GEMINI_STRONG_MODEL || "gemini-2.5-flash",
  image: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
};

// naive per-instance rate limit (best effort on serverless)
const hits = new Map<string, number[]>();
function rateLimited(ip: string, max = 20, windowMs = 60_000) {
  const t = Date.now();
  const arr = (hits.get(ip) || []).filter(x => t - x < windowMs);
  arr.push(t);
  hits.set(ip, arr);
  return arr.length > max;
}

const STORY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    story_id: { type: Type.STRING },
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    age_range: { type: Type.ARRAY, items: { type: Type.INTEGER } },
    language: { type: Type.STRING },
    category: { type: Type.STRING },
    primary_values: { type: Type.ARRAY, items: { type: Type.STRING } },
    pages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          page: { type: Type.INTEGER },
          narrative: { type: Type.STRING },
          illustration_prompt: { type: Type.STRING },
          source_refs: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["page", "narrative", "illustration_prompt", "source_refs"],
      },
    },
    discussion: {
      type: Type.OBJECT,
      properties: {
        questions: { type: Type.ARRAY, items: { type: Type.STRING } },
        action: { type: Type.STRING },
        reflection: { type: Type.STRING },
      },
      required: ["questions", "action", "reflection"],
    },
    safety_status: { type: Type.STRING },
  },
  required: ["title", "age_range", "language", "category", "primary_values", "pages", "discussion"],
};

interface StoryInput {
  mode: "fable" | "adapt";
  value: string;
  age: number;
  lang: "en" | "ar";
  pages: number;
  topic?: string;
  childName?: string;
  context: {
    sources: { id: string; reference: string }[];
    facts: string[];
    keyEvents: string[];
    prohibited: string[];
    canonicalPages?: string[];
    terminology?: string[];
    category?: string;
  };
}

function storySystemPrompt(i: StoryInput) {
  const langName = i.lang === "ar" ? "Arabic (Modern Standard, simple, with tashkeel where helpful)" : "English";
  const common = [
    "You are the Kidstorypedia story engine. You write for Muslim children with warmth and clarity.",
    `Write in ${langName} for a child aged ${i.age}. Use short sentences and age-appropriate vocabulary.`,
    `Return exactly ${i.pages} pages. Each page cites source_refs using ONLY these ids: ${i.context.sources.map(s => s.id).join(", ")}.`,
    "Rules (strict):",
    "- Use ONLY the retrieved facts below. Do not add events, names, numbers, places or miracles that are not listed.",
    "- Never invent or paraphrase hadith. Never write 'the Prophet said', 'Allah said' or any quotation attributed to sacred figures.",
    "- Preserve known chronology.",
    "- Illustration prompts describe scenery, objects or faceless ordinary children only. Never describe any Prophet, Companion, angel, or God.",
    "- No violence, fear, romance, or mocking. Gentle tone.",
    `- primary_values must include "${i.value}".`,
    "- discussion.questions must contain exactly 3 short questions a parent can ask; action is one real-world family challenge; reflection is one prompt.",
    'Set safety_status to "self_checked".',
  ];
  if (i.mode === "fable") {
    common.push(
      "MODE: ORIGINAL MORAL FABLE. Characters are ordinary children, families or animals — never Prophets or Companions. Do not present the story as historical.",
      `Category must be "moral". Use source id "fable-original" on every page, plus a Qur'an reference id only if the value is directly supported by it.`,
    );
  } else {
    common.push(
      "MODE: ADAPT CANONICAL STORY. Retell the approved canonical text below for the child's age. Keep the meaning and the order of events. Do not add anything.",
      `Category must be "${i.context.category}".`,
      "Canonical pages:",
      ...(i.context.canonicalPages || []).map((p, n) => `${n + 1}. ${p}`),
    );
  }
  common.push(
    "Retrieved facts:", ...(i.context.facts.length ? i.context.facts.map(f => `- ${f}`) : ["- (fiction — no historical facts)"]),
    "Key events:", ...i.context.keyEvents.map(f => `- ${f}`),
    "Prohibited inventions:", ...i.context.prohibited.map(f => `- ${f}`),
    "Approved sources:", ...i.context.sources.map(s => `- ${s.id}: ${s.reference}`),
  );
  if (i.context.terminology?.length) common.push("Approved terminology:", ...i.context.terminology.map(t => `- ${t}`));
  return common.join("\n");
}

export async function handleAI(body: any, apiKey: string | undefined, ip = "local"): Promise<AIResult> {
  if (!apiKey) return { status: 503, body: { error: "AI is not configured. Set GEMINI_API_KEY on the server." } };
  if (rateLimited(ip)) return { status: 429, body: { error: "Too many requests. Please wait a minute." } };
  const task = body?.task;
  const ai = new GoogleGenAI({ apiKey });

  try {
    if (task === "story") {
      const i = body.input as StoryInput;
      const check = validateInput(`${i.topic || ""} ${i.childName || ""}`);
      if (!check.ok) return { status: 400, body: { error: check.reason, layer: "input" } };
      const pages = Math.min(6, Math.max(3, Number(i.pages) || 4));
      const res = await ai.models.generateContent({
        model: MODELS.strong,
        contents: i.mode === "fable"
          ? `Write an original story about ${i.value}${i.topic ? ` — theme: ${i.topic}` : ""}${i.childName ? `. The main character may be named ${i.childName}` : ""}.`
          : "Adapt the canonical story now.",
        config: {
          systemInstruction: storySystemPrompt({ ...i, pages }),
          responseMimeType: "application/json",
          responseSchema: STORY_SCHEMA,
          temperature: i.mode === "adapt" ? 0.3 : 0.8,
        },
      });
      const json = JSON.parse(res.text || "{}");
      return { status: 200, body: { model: MODELS.strong, output: json } };
    }

    if (task === "assistant") {
      const { question, lang, age, story } = body.input || {};
      const check = validateInput(String(question || ""));
      if (!check.ok) return { status: 400, body: { error: check.reason, layer: "input" } };
      const system = [
        "You are the Kidstorypedia Parent Assistant. You help Muslim parents talk with their children (ages 4–12) about stories and values.",
        `Answer in ${lang === "ar" ? "Arabic" : "the same language as the question"}, warmly and practically, in under 150 words.`,
        `The child is ${age || 7} years old.`,
        "Ground answers in the story context provided. If the context does not cover something, say so.",
        "Never issue religious rulings (fatwa); for fiqh questions, suggest consulting a trusted local scholar.",
        "Never quote hadith or Qur'an unless the exact reference is in the context.",
        "Never evaluate or score the child's character; talk about practice, reflection and encouragement.",
        story ? `Story context: ${JSON.stringify(story).slice(0, 3000)}` : "No story selected.",
      ].join("\n");
      const res = await ai.models.generateContent({ model: MODELS.fast, contents: String(question).slice(0, 600), config: { systemInstruction: system, temperature: 0.5 } });
      return { status: 200, body: { model: MODELS.fast, output: res.text || "" } };
    }

    if (task === "classify") {
      const text = String(body.input?.text || "").slice(0, 4000);
      const res = await ai.models.generateContent({
        model: MODELS.fast,
        contents: text,
        config: {
          systemInstruction: "Classify which of these values the children's story teaches (max 3): honesty, patience, gratitude, courage, generosity, kindness, responsibility, forgiveness, humility, perseverance, compassion, trustworthiness. Return JSON {values: string[]}.",
          responseMimeType: "application/json",
          responseSchema: { type: Type.OBJECT, properties: { values: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          temperature: 0,
        },
      });
      return { status: 200, body: { model: MODELS.fast, output: JSON.parse(res.text || "{}") } };
    }

    if (task === "image") {
      const prompt = String(body.input?.prompt || "").slice(0, 500);
      const check = validateInput(prompt);
      if (!check.ok) return { status: 400, body: { error: check.reason, layer: "input" } };
      const res = await ai.models.generateContent({
        model: MODELS.image,
        contents: `${VISUAL_POLICY} Scene: ${prompt}`,
      });
      const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!part?.inlineData?.data) return { status: 502, body: { error: "No image returned" } };
      return { status: 200, body: { model: MODELS.image, output: `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}` } };
    }

    return { status: 400, body: { error: "Unknown task" } };
  } catch (e: any) {
    return { status: 500, body: { error: e?.message || "AI request failed" } };
  }
}
