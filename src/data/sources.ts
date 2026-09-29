import type { Source } from "@/types";

/**
 * Source registry (PRD §23). Every canonical story page must reference at
 * least one of these ids. References point to primary texts so a reviewer
 * can audit them; they are not exhaustive citations.
 */
export const SOURCES: Source[] = [
  { id: "q12-4-6", type: "quran", title: "Surah Yusuf", reference: "Qur'an 12:4–6", note: "Yusuf's dream and Yaqub's advice" },
  { id: "q12-18", type: "quran", title: "Surah Yusuf", reference: "Qur'an 12:18", note: "\"Fa sabrun jameel\" - beautiful patience" },
  { id: "q12-92", type: "quran", title: "Surah Yusuf", reference: "Qur'an 12:92", note: "Yusuf forgives his brothers" },
  { id: "q29-14", type: "quran", title: "Surah Al-'Ankabut", reference: "Qur'an 29:14", note: "Nuh stayed among his people a thousand years less fifty" },
  { id: "q11-25-44", type: "quran", title: "Surah Hud", reference: "Qur'an 11:25–44", note: "Nuh's call, building the Ark, the flood" },
  { id: "q11-41", type: "quran", title: "Surah Hud", reference: "Qur'an 11:41", note: "\"Bismillahi majreha wa mursaha\"" },
  { id: "q21-87-88", type: "quran", title: "Surah Al-Anbiya", reference: "Qur'an 21:87–88", note: "Yunus calls upon Allah in the darkness" },
  { id: "q37-139-148", type: "quran", title: "Surah As-Saffat", reference: "Qur'an 37:139–148", note: "Yunus, the ship and the whale" },
  { id: "q2-127", type: "quran", title: "Surah Al-Baqarah", reference: "Qur'an 2:127", note: "Ibrahim and Ismail raise the foundations of the House" },
  { id: "q26-61-63", type: "quran", title: "Surah Ash-Shu'ara", reference: "Qur'an 26:61–63", note: "Musa at the sea: \"Indeed, with me is my Lord\"" },
  { id: "q27-18-19", type: "quran", title: "Surah An-Naml", reference: "Qur'an 27:18–19", note: "Sulaiman and the ant; his du'a of gratitude" },
  { id: "q9-40", type: "quran", title: "Surah At-Tawbah", reference: "Qur'an 9:40", note: "The cave: \"Do not grieve, indeed Allah is with us\"" },
  { id: "q3-8", type: "quran", title: "Surah Ali 'Imran", reference: "Qur'an 3:8", note: "Du'a for steadfast hearts" },
  { id: "q2-201", type: "quran", title: "Surah Al-Baqarah", reference: "Qur'an 2:201", note: "Du'a for good in this life and the next" },
  { id: "q59-10", type: "quran", title: "Surah Al-Hashr", reference: "Qur'an 59:10", note: "Du'a against resentment in the heart" },
  { id: "q1-2", type: "quran", title: "Surah Al-Fatihah", reference: "Qur'an 1:2", note: "Al-hamdu lillahi rabbil 'alamin" },
  { id: "q9-119", type: "quran", title: "Surah At-Tawbah", reference: "Qur'an 9:119", note: "Be with the truthful" },
  { id: "q4-58", type: "quran", title: "Surah An-Nisa", reference: "Qur'an 4:58", note: "Render trusts to whom they are due" },
  { id: "bukhari-3231", type: "hadith", title: "Sahih al-Bukhari", reference: "Sahih al-Bukhari 3231; Sahih Muslim 1795", note: "The day of Ta'if and the angel of the mountains" },
  { id: "abudawud-1678", type: "hadith", title: "Sunan Abi Dawud", reference: "Sunan Abi Dawud 1678; Jami' at-Tirmidhi 3675 (graded hasan)", note: "Abu Bakr brings all his wealth; 'Umar brings half" },
  { id: "tirmidhi-3703", type: "hadith", title: "Jami' at-Tirmidhi", reference: "Jami' at-Tirmidhi 3703; Sunan an-Nasa'i 3608", note: "'Uthman and the well of Rumah" },
  { id: "ibnhisham-amin", type: "sirah", title: "As-Sirah an-Nabawiyyah (Ibn Hisham)", reference: "Ibn Hisham, Sirah - rebuilding of the Ka'bah", note: "Quraysh call him al-Amin; placing the Black Stone" },
  { id: "ibnhisham-bilal", type: "sirah", title: "As-Sirah an-Nabawiyyah (Ibn Hisham)", reference: "Ibn Hisham, Sirah - persecution of the early Muslims", note: "Bilal repeats \"Ahad, Ahad\"; freed by Abu Bakr" },
  { id: "fable-original", type: "original_fable", title: "Kidstorypedia original moral fable", reference: "Original fiction - no historical claims", note: "Fictional characters; values drawn from general Islamic ethics" },
];

export const SOURCE_MAP: Record<string, Source> = Object.fromEntries(SOURCES.map(s => [s.id, s]));
