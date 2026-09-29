import { CANONICAL_STORIES } from "@/data/stories";
import { CONFIG } from "@/config";
import type { AppState } from "@/store";
import type { AgeBand, Lang, Localized, Story, StoryPage } from "@/types";

/** Canonical stories merged with CMS overrides and AI-generated drafts. */
export function allStories(s: AppState): Story[] {
  const merged = CANONICAL_STORIES.map(st => s.storyOverrides[st.id] || st);
  const extra = Object.values(s.storyOverrides).filter(o => !CANONICAL_STORIES.some(c => c.id === o.id));
  return [...merged, ...extra];
}

/** Stories visible in the family app (PRD §24: only published content). */
export function familyStories(s: AppState): Story[] {
  return allStories(s).filter(st => st.state === "published" || (CONFIG.showStoriesInReview && st.state === "scholar_review" && st.origin === "canonical"));
}

export function findStory(s: AppState, id: string | undefined): Story | undefined {
  if (!id) return undefined;
  return allStories(s).find(st => st.id === id || st.slug === id);
}

export function loc(text: Localized | undefined, lang: Lang): string {
  if (!text) return "";
  return lang === "ar" ? text.ar || text.en : text.en;
}

/** Arabic diacritics (tashkeel) range */
const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g;
export function stripTashkeel(s: string) {
  return s.replace(TASHKEEL, "");
}

export function ageBand(age: number): AgeBand {
  if (age <= 5) return "4-5";
  if (age <= 8) return "6-8";
  return "9-12";
}

export function pageText(page: StoryPage, lang: Lang, age: number, tashkeel = true): string {
  const variant = page.variants?.[ageBand(age)];
  let text = loc(variant || page.text, lang);
  if (lang === "ar" && !tashkeel) text = stripTashkeel(text);
  return text;
}

export function isAgeSuitable(story: Story, age: number) {
  return age >= story.ageRange[0] - 1 && age <= story.ageRange[1] + 1;
}

/** Deterministic gradient for stories without illustration. */
export function coverGradient(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `linear-gradient(135deg, hsl(${h} 45% 22%), hsl(${(h + 50) % 360} 55% 12%))`;
}
