import type { Localized, ValueId } from "@/types";

export interface ValueDef {
  id: ValueId;
  name: Localized;
  description: Localized;
  color: string; // hex, used for chips and charts
  /** Values that reinforce each other — used by the recommendation engine */
  related: ValueId[];
}

/** Canonical 12-value taxonomy (PRD §17 / §100 P0-1). Order is stable. */
export const VALUES: ValueDef[] = [
  { id: "honesty", name: { en: "Honesty", ar: "الصِّدْق" }, description: { en: "Telling the truth and being true in word and deed.", ar: "قول الحق والصدق في القول والعمل." }, color: "#60a5fa", related: ["trustworthiness", "courage"] },
  { id: "patience", name: { en: "Patience", ar: "الصَّبْر" }, description: { en: "Staying calm and hopeful when things are hard.", ar: "الثبات والأمل عند الشدائد." }, color: "#a78bfa", related: ["perseverance", "gratitude"] },
  { id: "gratitude", name: { en: "Gratitude", ar: "الشُّكْر" }, description: { en: "Noticing blessings and thanking Allah and people.", ar: "ملاحظة النعم وشكر الله والناس." }, color: "#fbbf24", related: ["humility", "generosity"] },
  { id: "courage", name: { en: "Courage", ar: "الشَّجَاعَة" }, description: { en: "Doing what is right even when it feels scary.", ar: "فعل الصواب حتى عند الخوف." }, color: "#f87171", related: ["perseverance", "honesty"] },
  { id: "generosity", name: { en: "Generosity", ar: "الكَرَم" }, description: { en: "Sharing what we have with others.", ar: "مشاركة ما نملك مع الآخرين." }, color: "#34d399", related: ["kindness", "compassion"] },
  { id: "kindness", name: { en: "Kindness", ar: "اللُّطْف" }, description: { en: "Gentle words and helpful actions.", ar: "الكلمة الطيبة والعمل النافع." }, color: "#f472b6", related: ["compassion", "generosity"] },
  { id: "responsibility", name: { en: "Responsibility", ar: "المَسْؤُولِيَّة" }, description: { en: "Taking care of our duties and choices.", ar: "القيام بالواجبات وتحمل نتائج الاختيارات." }, color: "#fb923c", related: ["trustworthiness", "perseverance"] },
  { id: "forgiveness", name: { en: "Forgiveness", ar: "العَفْو" }, description: { en: "Letting go of anger and pardoning others.", ar: "ترك الغضب والعفو عن الآخرين." }, color: "#2dd4bf", related: ["compassion", "patience"] },
  { id: "humility", name: { en: "Humility", ar: "التَّوَاضُع" }, description: { en: "Not boasting and remembering all good is from Allah.", ar: "عدم التفاخر وتذكر أن كل خير من الله." }, color: "#94a3b8", related: ["gratitude", "kindness"] },
  { id: "perseverance", name: { en: "Perseverance", ar: "المُثَابَرَة" }, description: { en: "Keeping on and not giving up.", ar: "الاستمرار وعدم الاستسلام." }, color: "#c084fc", related: ["patience", "courage"] },
  { id: "compassion", name: { en: "Compassion", ar: "الرَّحْمَة" }, description: { en: "Caring about people and animals who are hurting.", ar: "الرحمة بالناس والحيوانات." }, color: "#fb7185", related: ["kindness", "forgiveness"] },
  { id: "trustworthiness", name: { en: "Trustworthiness", ar: "الأَمَانَة" }, description: { en: "Keeping promises and looking after what we are trusted with.", ar: "حفظ الوعود والأمانات." }, color: "#38bdf8", related: ["honesty", "responsibility"] },
];

export const VALUE_MAP: Record<ValueId, ValueDef> = Object.fromEntries(VALUES.map(v => [v.id, v])) as Record<ValueId, ValueDef>;

export const CATEGORIES = [
  { id: "prophets", name: { en: "Prophets", ar: "الأنبياء" } },
  { id: "seerah", name: { en: "Seerah", ar: "السيرة" } },
  { id: "sahabah", name: { en: "Sahabah", ar: "الصحابة" } },
  { id: "moral", name: { en: "Moral Stories", ar: "قصص أخلاقية" } },
] as const;

export const CONTENT_STATES = [
  "draft",
  "source_review",
  "editorial_review",
  "scholar_review",
  "ai_generation",
  "validation",
  "published",
  "periodic_review",
] as const;

export const STATE_LABEL: Record<(typeof CONTENT_STATES)[number], string> = {
  draft: "Draft",
  source_review: "Source review",
  editorial_review: "Editorial review",
  scholar_review: "Scholar review",
  ai_generation: "AI generation",
  validation: "Validation",
  published: "Published",
  periodic_review: "Periodic review",
};
