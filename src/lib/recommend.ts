import { VALUE_MAP } from "@/data/values";
import { familyStories, findStory, isAgeSuitable, loc } from "@/lib/content";
import { canAccessStory } from "@/lib/entitlements";
import { hasEvent, valueJourney } from "@/lib/learning";
import type { AppState } from "@/store";
import type { ChildProfile, Lang, Story, ValueId } from "@/types";

export type NextStep =
  | { kind: "discuss"; story: Story; reason: string }
  | { kind: "action"; story: Story; reason: string }
  | { kind: "story"; story: Story; reason: string; score: number };

/**
 * Recommendation engine (PRD §28–29). Optimises for learning continuity:
 * the next step can be a discussion or an action, not only another story.
 */
export function recommendStories(s: AppState, child: ChildProfile, lang: Lang = "en", limit = 3) {
  const all = familyStories(s);
  const completedIds = new Set(s.events.filter(e => e.childId === child.id && e.type === "story_completed").map(e => e.storyId));
  const lastEvent = [...s.events].reverse().find(e => e.childId === child.id && e.type === "story_completed");
  const last = findStory(s, lastEvent?.storyId);
  const recentValue: ValueId | undefined = last?.values[0];
  const journey = valueJourney(s, child.id);
  const minTotal = Math.min(...journey.map(j => j.total));
  const leastExplored = new Set(journey.filter(j => j.total === minTotal).map(j => j.value));
  const goals = s.parent?.goals || [];

  const scored = all
    .filter(st => !completedIds.has(st.id) && isAgeSuitable(st, child.age))
    .map(st => {
      let score = 0;
      const why: string[] = [];
      if (recentValue && st.values.includes(recentValue)) {
        score += 3;
        why.push(lang === "ar" ? `يعزّز ${loc(VALUE_MAP[recentValue].name, lang)} في سياق قصصي مختلف` : lang === "id" ? `memperkuat ${loc(VALUE_MAP[recentValue].name, lang).toLowerCase()} melalui narasi berbeda` : `reinforces ${VALUE_MAP[recentValue].name.en.toLowerCase()} through a different narrative`);
      } else if (recentValue && st.values.some(v => VALUE_MAP[recentValue].related.includes(v))) {
        score += 2;
        const v = st.values.find(x => VALUE_MAP[recentValue].related.includes(x))!;
        why.push(lang === "ar" ? `ينتقل من ${loc(VALUE_MAP[recentValue].name, lang)} إلى ${loc(VALUE_MAP[v].name, lang)}` : lang === "id" ? `membangun dari ${loc(VALUE_MAP[recentValue].name, lang).toLowerCase()} ke ${loc(VALUE_MAP[v].name, lang).toLowerCase()}` : `builds from ${VALUE_MAP[recentValue].name.en.toLowerCase()} to ${VALUE_MAP[v].name.en.toLowerCase()}`);
      }
      if (last && st.category !== last.category) score += 0.5;
      const fresh = st.values.find(v => leastExplored.has(v));
      if (fresh) {
        score += 1.5;
        if (!why.length) why.push(lang === "ar" ? `يستكشف قيمة جديدة: ${loc(VALUE_MAP[fresh].name, lang)}` : lang === "id" ? `menjelajahi nilai baru: ${loc(VALUE_MAP[fresh].name, lang).toLowerCase()}` : `explores a new value: ${VALUE_MAP[fresh].name.en.toLowerCase()}`);
      }
      if (goals.includes("bedtime") && st.bedtime) { score += 1.5; if (why.length < 2) why.push(lang === "ar" ? "مناسبة لوقت النوم" : lang === "id" ? "cerita pengantar tidur yang tenang" : "a calm bedtime story"); }
      if (goals.includes("prophets") && st.category === "prophets") score += 1.5;
      if (goals.includes("history") && (st.category === "seerah" || st.category === "sahabah")) score += 1.5;
      if (goals.includes("reading") && st.durationMin <= 6) score += 0.5;
      if (canAccessStory(s, st)) score += 2;
      if (st.state === "published") score += 0.5;
      const reason = why.length ? why.join(lang === "ar" ? "، و" : "; ") : (lang === "ar" ? "مناسبة لعمر طفلك" : lang === "id" ? "cocok untuk usia anakmu" : "a good fit for your child's age");
      return { kind: "story" as const, story: st, reason, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

export function nextStep(s: AppState, child: ChildProfile, lang: Lang = "en"): NextStep | undefined {
  const lastEvent = [...s.events].reverse().find(e => e.childId === child.id && e.type === "story_completed");
  const last = findStory(s, lastEvent?.storyId);
  if (last && !hasEvent(s, child.id, "discussion_completed", last.id)) {
    return { kind: "discuss", story: last, reason: lang === "ar" ? "ناقشا القصة الأخيرة قبل البدء بقصة جديدة" : lang === "id" ? "Bicarakan cerita terakhir bersama sebelum memulai yang baru" : "Talk about the last story together before starting a new one" };
  }
  if (last && !hasEvent(s, child.id, "action_completed", last.id)) {
    return { kind: "action", story: last, reason: lang === "ar" ? "جرّبوا تحدي العمل العائلي لهذه القصة" : lang === "id" ? "Coba tantangan aksi keluarga dari cerita ini di kehidupan nyata" : "Try this story's family action challenge in real life" };
  }
  return recommendStories(s, child, lang, 1)[0];
}
