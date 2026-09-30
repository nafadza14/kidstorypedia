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
  if (lang === "ar") return text.ar || text.en;
  if (lang === "id") return text.id || text.en;
  return text.en;
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

/** Citation text for a source in the reader's language (identifiers stay as cited). */
const REF_TEXT: Record<string, { id: string; ar: string }> = {
  "ibnhisham-amin": { id: "Ibnu Hisyam, Sirah - pembangunan kembali Ka'bah", ar: "ابن هشام، السيرة - إعادة بناء الكعبة" },
  "ibnhisham-bilal": { id: "Ibnu Hisyam, Sirah - penganiayaan kaum Muslim generasi awal", ar: "ابن هشام، السيرة - اضطهاد المسلمين الأوائل" },
  "fable-original": { id: "Fiksi orisinal - tanpa klaim sejarah", ar: "قصة خيالية أصلية - بلا ادعاءات تاريخية" },
};
export function sourceRef(src: { id: string; reference: string } | undefined, lang: Lang, fallback = ""): string {
  if (!src) return fallback;
  const o = REF_TEXT[src.id];
  if (o && lang !== "en") return o[lang];
  if (lang === "id") return src.reference.replace(/^Qur'an /, "QS ").replace(/; Qur'an /g, "; QS ").replace(/\(graded hasan\)/, "(derajat hasan)");
  if (lang === "ar") return src.reference.replace(/^Qur'an /, "القرآن ").replace(/\(graded hasan\)/, "(حسن)");
  return src.reference;
}

const NOTE_TEXT: Record<string, { id: string; ar: string }> = {
  "q12-4-6": { id: "Mimpi Yusuf dan nasihat Ya'qub", ar: "رؤيا يوسف ونصيحة يعقوب" },
  "q12-18": { id: "\"Fa sabrun jamil\" - kesabaran yang indah", ar: "«فصبر جميل»" },
  "q12-92": { id: "Yusuf memaafkan saudara-saudaranya", ar: "يوسف يعفو عن إخوته" },
  "q29-14": { id: "Nuh tinggal bersama kaumnya seribu tahun kurang lima puluh", ar: "لبث نوح في قومه ألف سنة إلا خمسين عاماً" },
  "q11-25-44": { id: "Seruan Nuh, pembuatan bahtera, dan banjir besar", ar: "دعوة نوح وصنع السفينة والطوفان" },
  "q11-41": { id: "\"Bismillahi majreha wa mursaha\"", ar: "«بسم الله مجراها ومرساها»" },
  "q21-87-88": { id: "Yunus berdoa kepada Allah dalam kegelapan", ar: "يونس ينادي ربه في الظلمات" },
  "q37-139-148": { id: "Yunus, kapal, dan ikan paus", ar: "يونس والفلك والحوت" },
  "q2-127": { id: "Ibrahim dan Ismail meninggikan fondasi Baitullah", ar: "إبراهيم وإسماعيل يرفعان القواعد من البيت" },
  "q26-61-63": { id: "Musa di tepi laut: \"Sesungguhnya Tuhanku bersamaku\"", ar: "موسى عند البحر: «إن معي ربي»" },
  "q27-18-19": { id: "Sulaiman dan semut; doa syukurnya", ar: "سليمان والنملة ودعاؤه بالشكر" },
  "q9-40": { id: "Di gua: \"Jangan bersedih, sesungguhnya Allah bersama kita\"", ar: "في الغار: «لا تحزن إن الله معنا»" },
  "q3-8": { id: "Doa agar hati tetap teguh", ar: "دعاء لثبات القلوب" },
  "q2-201": { id: "Doa kebaikan dunia dan akhirat", ar: "دعاء بخير الدنيا والآخرة" },
  "q59-10": { id: "Doa agar hati bersih dari kedengkian", ar: "دعاء بسلامة القلب من الغل" },
  "q1-2": { id: "Al-hamdu lillahi rabbil 'alamin", ar: "الحمد لله رب العالمين" },
  "q9-119": { id: "Bersamalah dengan orang-orang yang jujur", ar: "كونوا مع الصادقين" },
  "q4-58": { id: "Sampaikan amanah kepada yang berhak", ar: "أداء الأمانات إلى أهلها" },
  "bukhari-3231": { id: "Hari di Thaif dan malaikat penjaga gunung", ar: "يوم الطائف وملك الجبال" },
  "abudawud-1678": { id: "Abu Bakar membawa seluruh hartanya; Umar membawa setengahnya", ar: "أبو بكر يأتي بماله كله وعمر بنصفه" },
  "tirmidhi-3703": { id: "Utsman dan sumur Rumah", ar: "عثمان وبئر رومة" },
  "ibnhisham-amin": { id: "Quraisy menyebutnya al-Amin; peletakan Hajar Aswad", ar: "قريش تسميه الأمين؛ وضع الحجر الأسود" },
  "ibnhisham-bilal": { id: "Bilal mengulang \"Ahad, Ahad\"; dimerdekakan oleh Abu Bakar", ar: "بلال يردد «أحد أحد»؛ أعتقه أبو بكر" },
  "fable-original": { id: "Tokoh fiksi; nilai diambil dari etika Islam secara umum", ar: "شخصيات خيالية؛ القيم مأخوذة من الأخلاق الإسلامية العامة" },
};
export function sourceNote(src: { id: string; note?: string } | undefined, lang: Lang): string {
  if (!src?.note) return "";
  return lang === "en" ? src.note : NOTE_TEXT[src.id]?.[lang] || src.note;
}
