import type { ContentState, Localized, ValueId } from "@/types";

export interface ValueDef {
  id: ValueId;
  name: Localized;
  description: Localized;
  color: string; // hex, used for chips and charts
  /** Values that reinforce each other - used by the recommendation engine */
  related: ValueId[];
}

/** Canonical 12-value taxonomy (PRD §17 / §100 P0-1). Order is stable. */
export const VALUES: ValueDef[] = [
  { id: "honesty", name: { en: "Honesty", ar: "الصِّدْق", id: "Kejujuran" }, description: { en: "Telling the truth and being true in word and deed.", ar: "قول الحق والصدق في القول والعمل.", id: "Berkata jujur dan benar dalam perkataan dan perbuatan." }, color: "#60a5fa", related: ["trustworthiness", "courage"] },
  { id: "patience", name: { en: "Patience", ar: "الصَّبْر", id: "Kesabaran" }, description: { en: "Staying calm and hopeful when things are hard.", ar: "الثبات والأمل عند الشدائد.", id: "Tetap tenang dan penuh harapan saat menghadapi kesulitan." }, color: "#a78bfa", related: ["perseverance", "gratitude"] },
  { id: "gratitude", name: { en: "Gratitude", ar: "الشُّكْر", id: "Syukur" }, description: { en: "Noticing blessings and thanking Allah and people.", ar: "ملاحظة النعم وشكر الله والناس.", id: "Menyadari nikmat dan berterima kasih kepada Allah dan sesama." }, color: "#fbbf24", related: ["humility", "generosity"] },
  { id: "courage", name: { en: "Courage", ar: "الشَّجَاعَة", id: "Keberanian" }, description: { en: "Doing what is right even when it feels scary.", ar: "فعل الصواب حتى عند الخوف.", id: "Melakukan hal yang benar meskipun terasa menakutkan." }, color: "#f87171", related: ["perseverance", "honesty"] },
  { id: "generosity", name: { en: "Generosity", ar: "الكَرَم", id: "Kedermawanan" }, description: { en: "Sharing what we have with others.", ar: "مشاركة ما نملك مع الآخرين.", id: "Berbagi apa yang kita miliki dengan orang lain." }, color: "#34d399", related: ["kindness", "compassion"] },
  { id: "kindness", name: { en: "Kindness", ar: "اللُّطْف", id: "Kebaikan" }, description: { en: "Gentle words and helpful actions.", ar: "الكلمة الطيبة والعمل النافع.", id: "Perkataan yang lembut dan tindakan yang membantu." }, color: "#f472b6", related: ["compassion", "generosity"] },
  { id: "responsibility", name: { en: "Responsibility", ar: "المَسْؤُولِيَّة", id: "Tanggung Jawab" }, description: { en: "Taking care of our duties and choices.", ar: "القيام بالواجبات وتحمل نتائج الاختيارات.", id: "Menjaga tugas dan pilihan kita." }, color: "#fb923c", related: ["trustworthiness", "perseverance"] },
  { id: "forgiveness", name: { en: "Forgiveness", ar: "العَفْو", id: "Maaf" }, description: { en: "Letting go of anger and pardoning others.", ar: "ترك الغضب والعفو عن الآخرين.", id: "Melepaskan kemarahan dan memaafkan orang lain." }, color: "#2dd4bf", related: ["compassion", "patience"] },
  { id: "humility", name: { en: "Humility", ar: "التَّوَاضُع", id: "Kerendahan Hati" }, description: { en: "Not boasting and remembering all good is from Allah.", ar: "عدم التفاخر وتذكر أن كل خير من الله.", id: "Tidak menyombongkan diri dan mengingat semua kebaikan dari Allah." }, color: "#94a3b8", related: ["gratitude", "kindness"] },
  { id: "perseverance", name: { en: "Perseverance", ar: "المُثَابَرَة", id: "Ketekunan" }, description: { en: "Keeping on and not giving up.", ar: "الاستمرار وعدم الاستسلام.", id: "Terus berusaha dan tidak menyerah." }, color: "#c084fc", related: ["patience", "courage"] },
  { id: "compassion", name: { en: "Compassion", ar: "الرَّحْمَة", id: "Kasih Sayang" }, description: { en: "Caring about people and animals who are hurting.", ar: "الرحمة بالناس والحيوانات.", id: "Peduli terhadap orang dan hewan yang menderita." }, color: "#fb7185", related: ["kindness", "forgiveness"] },
  { id: "trustworthiness", name: { en: "Trustworthiness", ar: "الأَمَانَة", id: "Amanah" }, description: { en: "Keeping promises and looking after what we are trusted with.", ar: "حفظ الوعود والأمانات.", id: "Menepati janji dan menjaga apa yang dipercayakan." }, color: "#38bdf8", related: ["honesty", "responsibility"] },
];

export const VALUE_MAP: Record<ValueId, ValueDef> = Object.fromEntries(VALUES.map(v => [v.id, v])) as Record<ValueId, ValueDef>;

export const CATEGORIES = [
  { id: "prophets", name: { en: "Prophets", ar: "الأنبياء", id: "Para Nabi" } },
  { id: "seerah", name: { en: "Seerah", ar: "السيرة", id: "Sirah" } },
  { id: "sahabah", name: { en: "Sahabah", ar: "الصحابة", id: "Sahabat" } },
  { id: "moral", name: { en: "Moral Stories", ar: "قصص أخلاقية", id: "Cerita Moral" } },
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

export const STATE_LABEL: Record<ContentState, Localized> = {
  draft: { en: "Draft", ar: "مسودة", id: "Draf" },
  source_review: { en: "Source review", ar: "مراجعة المصادر", id: "Peninjauan sumber" },
  editorial_review: { en: "Editorial review", ar: "مراجعة تحريرية", id: "Peninjauan editorial" },
  scholar_review: { en: "Scholar review", ar: "مراجعة علمية", id: "Peninjauan ulama" },
  ai_generation: { en: "AI generation", ar: "توليد الذكاء", id: "Pembuatan AI" },
  validation: { en: "Validation", ar: "التحقق", id: "Validasi" },
  published: { en: "Published", ar: "منشور", id: "Diterbitkan" },
  periodic_review: { en: "Periodic review", ar: "مراجعة دورية", id: "Peninjauan berkala" },
};
