import type { Localized, PlanId, ValueId } from "@/types";

const L = (en: string, ar?: string): Localized => ({ en, ar });

// ───────────────────────────── Plans (PRD §34, §35, §92) ─────────────────────────────
export interface Plan {
  id: PlanId;
  name: Localized;
  priceUsd: number;
  period: "month" | "year" | "forever";
  tagline: Localized;
  features: Localized[];
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: L("Free", "مجاني"),
    priceUsd: 0,
    period: "forever",
    tagline: L("Start your bedtime routine", "ابدأ روتين ما قبل النوم"),
    features: [
      L("Limited story library", "مكتبة قصص محدودة"),
      L("1 child profile", "ملف طفل واحد"),
      L("Basic reader", "قارئ أساسي"),
      L("1 discussion question per story", "سؤال نقاش واحد لكل قصة"),
      L("Basic progress", "تقدم أساسي"),
    ],
  },
  {
    id: "premium_monthly",
    name: L("Family Monthly", "العائلة — شهري"),
    priceUsd: 7.99,
    period: "month",
    tagline: L("The full family learning journey", "رحلة التعلم العائلية الكاملة"),
    features: [
      L("Full story library & premium packs", "المكتبة الكاملة والباقات المميزة"),
      L("Up to 5 child profiles", "حتى ٥ ملفات أطفال"),
      L("Full character journal", "دفتر الأخلاق الكامل"),
      L("Personalised recommendations", "توصيات مخصصة"),
      L("Full discussion guides + du'a", "أدلة نقاش كاملة مع الأدعية"),
      L("Audio narration & certificates", "السرد الصوتي والشهادات"),
      L("Advanced parental controls", "رقابة أبوية متقدمة"),
    ],
  },
  {
    id: "premium_annual",
    name: L("Family Annual", "العائلة — سنوي"),
    priceUsd: 69,
    period: "year",
    tagline: L("Save ~28% vs monthly", "وفّر نحو ٢٨٪ مقارنة بالشهري"),
    features: [
      L("Everything in Family Monthly", "كل مزايا الخطة الشهرية"),
      L("Seasonal programs (Ramadan, Dhul Hijjah)", "برامج موسمية (رمضان، ذو الحجة)"),
      L("Monthly learning report", "تقرير تعلم شهري"),
    ],
    highlight: true,
  },
  {
    id: "family_plus",
    name: L("Family+", "العائلة+"),
    priceUsd: 109,
    period: "year",
    tagline: L("For homeschool families", "لعائلات التعليم المنزلي"),
    features: [
      L("Everything in Family Annual", "كل مزايا الخطة السنوية"),
      L("Family learning plan & printable packs", "خطة تعلم عائلية وحزم قابلة للطباعة"),
      L("Parent AI assistant priority", "أولوية مساعد الوالدين الذكي"),
    ],
  },
];

// ───────────────────────────── Premium packs (PRD §38) ─────────────────────────────
export interface Pack {
  id: string;
  name: Localized;
  description: Localized;
  priceUsd: number;
  storyIds?: string[];
  programId?: string;
  printable?: boolean;
}

export const PACKS: Pack[] = [
  { id: "prophets-collection", name: L("Stories of the Prophets", "قصص الأنبياء"), description: L("Growing collection of Qur'an-grounded prophet stories.", "مجموعة متنامية من قصص الأنبياء المستندة إلى القرآن."), priceUsd: 14.99 },
  { id: "seerah-collection", name: L("Seerah for Children", "السيرة للأطفال"), description: L("Age-appropriate moments from the life of the Prophet ﷺ.", "مواقف من حياة النبي ﷺ مناسبة للأعمار."), priceUsd: 12.99 },
  { id: "sahabah-collection", name: L("Sahabah Collection", "مجموعة الصحابة"), description: L("Character-focused stories of the companions.", "قصص الصحابة بتركيز على الأخلاق."), priceUsd: 9.99 },
  { id: "bedtime-collection", name: L("Bedtime Collection", "مجموعة قبل النوم"), description: L("Short 4–7 minute calm stories.", "قصص هادئة قصيرة من ٤ إلى ٧ دقائق."), priceUsd: 4.99 },
  { id: "ramadan-journey", name: L("Ramadan Character Journey", "رحلة الأخلاق في رمضان"), description: L("30-day story, discussion, action & reflection program.", "برنامج ٣٠ يوماً: قصة ونقاش وعمل وتأمل."), priceUsd: 19.99, programId: "ramadan-30" },
  { id: "family-reflection", name: L("Family Reflection Pack", "حزمة التأمل العائلي"), description: L("Printable reflection cards and value activity sheets.", "بطاقات تأمل وأوراق أنشطة قابلة للطباعة."), priceUsd: 6.99, printable: true },
];

// ───────────────────────────── Programs (PRD §49, §59) ─────────────────────────────
export interface ProgramDay {
  day: number;
  value: ValueId;
  storyId?: string;
  action: Localized;
}

export interface Program {
  id: string;
  name: Localized;
  description: Localized;
  days: ProgramDay[];
  packId?: string;
  seasonal?: boolean;
}

const RAMADAN_ORDER: ValueId[] = [
  "gratitude", "patience", "generosity", "honesty", "kindness", "forgiveness", "humility",
  "courage", "responsibility", "compassion", "trustworthiness", "perseverance",
];

const VALUE_STORY: Partial<Record<ValueId, string>> = {
  gratitude: "fable-1", patience: "yusuf-1", generosity: "abubakr-generosity", honesty: "tariq-coin",
  kindness: "kind-words", forgiveness: "taif-mercy", humility: "sulaiman-ant", courage: "musa-sea",
  responsibility: "little-gardener", compassion: "uthman-well", trustworthiness: "al-amin", perseverance: "nuh-1",
};

const ACTIONS: Record<ValueId, Localized> = {
  gratitude: L("Thank three people today and say Alhamdulillah for three blessings.", "اشكر ثلاثة أشخاص اليوم واحمد الله على ثلاث نعم."),
  patience: L("Wait calmly for iftar without complaining.", "انتظر الإفطار بهدوء دون تذمّر."),
  generosity: L("Prepare a small iftar gift for a neighbour.", "حضّر هدية إفطار صغيرة لجار."),
  honesty: L("Tell the truth about something even when it's hard.", "قل الحقيقة في أمر ما حتى لو كان صعباً."),
  kindness: L("Say a kind word to each family member.", "قل كلمة طيبة لكل فرد في العائلة."),
  forgiveness: L("Forgive someone and let go of a grudge.", "سامح أحداً وتخلّص من الضغينة."),
  humility: L("Help with a chore without being asked.", "ساعد في عمل منزلي دون أن يُطلب منك."),
  courage: L("Try something new and brave, starting with Bismillah.", "جرّب شيئاً جديداً وشجاعاً مبتدئاً بـ«بسم الله»."),
  responsibility: L("Take care of one job all by yourself today.", "تولَّ عملاً واحداً بنفسك اليوم."),
  compassion: L("Put out water for birds or help someone who is tired.", "ضع ماءً للطيور أو ساعد شخصاً متعباً."),
  trustworthiness: L("Keep a promise you made.", "أوفِ بوعد قطعته."),
  perseverance: L("Keep trying at something difficult for 10 minutes.", "استمر في محاولة شيء صعب لمدة ١٠ دقائق."),
};

export const PROGRAMS: Program[] = [
  {
    id: "patience-7",
    name: L("7 Nights of Patience", "سبع ليالٍ من الصبر"),
    description: L("A one-week bedtime challenge exploring patience and perseverance.", "تحدٍّ لمدة أسبوع قبل النوم عن الصبر والمثابرة."),
    days: [
      { day: 1, value: "patience", storyId: "yusuf-1", action: ACTIONS.patience },
      { day: 2, value: "perseverance", storyId: "nuh-1", action: ACTIONS.perseverance },
      { day: 3, value: "patience", storyId: "yunus-1", action: L("When something goes wrong, say 'Inna lillah' and stay calm.", "عندما يحدث خطأ، قل «إنا لله» واهدأ.") },
      { day: 4, value: "courage", storyId: "bilal-ahad", action: ACTIONS.courage },
      { day: 5, value: "forgiveness", storyId: "taif-mercy", action: ACTIONS.forgiveness },
      { day: 6, value: "kindness", storyId: "kind-words", action: ACTIONS.kindness },
      { day: 7, value: "patience", action: L("Family reflection: share your most patient moment this week.", "تأمل عائلي: شاركوا أكثر لحظة صبر هذا الأسبوع.") },
    ],
  },
  {
    id: "ramadan-30",
    name: L("Ramadan Character Journey", "رحلة الأخلاق في رمضان"),
    description: L("30 days: story, discussion, action and reflection. First week free.", "٣٠ يوماً: قصة ونقاش وعمل وتأمل. الأسبوع الأول مجاني."),
    packId: "ramadan-journey",
    seasonal: true,
    days: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      if (day === 30) return { day, value: "gratitude" as ValueId, action: L("Family reflection: which value grew most this Ramadan?", "تأمل عائلي: أي قيمة نمت أكثر في رمضان؟") };
      const value = RAMADAN_ORDER[i % RAMADAN_ORDER.length];
      return { day, value, storyId: VALUE_STORY[value], action: ACTIONS[value] };
    }),
  },
];

// ───────────────────────────── Badges (PRD §20) ─────────────────────────────
export interface BadgeDef {
  id: string;
  name: Localized;
  description: Localized;
  icon: string; // lucide icon name
}

export const BADGES: BadgeDef[] = [
  { id: "first-story", name: L("First Story", "القصة الأولى"), description: L("Completed a first story.", "أكمل أول قصة."), icon: "BookOpen" },
  { id: "nightly-reader", name: L("Nightly Reader", "قارئ الليل"), description: L("Completed 7 family reading sessions.", "أكمل ٧ جلسات قراءة عائلية."), icon: "Moon" },
  { id: "story-explorer", name: L("Story Explorer", "مستكشف القصص"), description: L("Explored all 4 story categories.", "استكشف فئات القصص الأربع."), icon: "Compass" },
  { id: "patience-practitioner", name: L("Patience Practitioner", "ممارس الصبر"), description: L("Completed 3 patience-related reflections.", "أكمل ٣ تأملات عن الصبر."), icon: "Hourglass" },
  { id: "family-reflector", name: L("Family Reflector", "المتأمل العائلي"), description: L("Completed 5 parent-child discussion sessions.", "أكمل ٥ جلسات نقاش مع الوالدين."), icon: "MessageCircle" },
  { id: "action-taker", name: L("Action Taker", "صاحب المبادرة"), description: L("Completed 5 real-world action challenges.", "أكمل ٥ تحديات عملية."), icon: "Zap" },
  { id: "value-explorer", name: L("Value Explorer", "مستكشف القيم"), description: L("Explored 6 different values.", "استكشف ٦ قيم مختلفة."), icon: "Sparkles" },
  { id: "program-finisher", name: L("Program Finisher", "منجز البرنامج"), description: L("Finished a 7-day or 30-day program.", "أنهى برنامجاً من ٧ أو ٣٠ يوماً."), icon: "Trophy" },
];
