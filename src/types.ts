/**
 * Kidstorypedia domain model (PRD §31).
 * All persisted entities live in the local store (src/store) behind a
 * repository interface so they can be swapped for a real backend later.
 */

export type Lang = "id" | "en" | "ar";

/** Canonical 12-value taxonomy (PRD §17, §100.1) */
export type ValueId =
  | "honesty"
  | "patience"
  | "gratitude"
  | "courage"
  | "generosity"
  | "kindness"
  | "responsibility"
  | "forgiveness"
  | "humility"
  | "perseverance"
  | "compassion"
  | "trustworthiness";

export type StoryCategory = "prophets" | "seerah" | "sahabah" | "moral";

export type AgeBand = "4-5" | "6-8" | "9-12";

export type ReadingLevel = "early" | "developing" | "confident";

/** Content governance states (PRD §24) */
export type ContentState =
  | "draft"
  | "source_review"
  | "editorial_review"
  | "scholar_review"
  | "ai_generation"
  | "validation"
  | "published"
  | "periodic_review";

export type SourceType = "quran" | "hadith" | "sirah" | "tafsir" | "scholarly" | "original_fable";

export interface Source {
  id: string;
  type: SourceType;
  title: string;
  reference: string; // e.g. "Qur'an 12:4-5"
  note?: string;
}

export interface Localized {
  en: string;
  ar?: string;
  id?: string;
}

export interface StoryPage {
  page: number;
  text: Localized;
  /** Optional simplified/extended text per age band. Falls back to `text`. */
  variants?: Partial<Record<AgeBand, Localized>>;
  image?: string;
  illustrationPrompt?: string;
  sourceRefs: string[];
}

export interface Dua {
  arabic: string;
  transliteration: string;
  meaning: Localized;
  source: string; // must be a real reference
}

export interface DiscussionGuide {
  questions: Localized[]; // exactly 3
  action: Localized; // family action challenge
  reflection: Localized; // reflection prompt
  dua?: Dua;
}

export interface ComprehensionQuestion {
  q: Localized;
  options: Localized[];
  answer: number;
}

export interface GlossaryTerm {
  term: string;
  meaning: Localized;
}

/** Canonical story record (PRD §23 Trusted Islamic Knowledge Layer) */
export interface Story {
  id: string;
  slug: string;
  title: Localized;
  description: Localized;
  category: StoryCategory;
  coverImage?: string;
  durationMin: number;
  ageRange: [number, number];
  values: ValueId[];
  pages: StoryPage[];
  discussion: DiscussionGuide;
  quiz?: ComprehensionQuestion[];
  glossary?: GlossaryTerm[];

  // Knowledge layer metadata
  sources: string[]; // Source ids
  historicalContext?: Localized;
  keyEvents?: string[];
  allowedFacts?: string[];
  prohibitedInvention?: string[];

  // Governance
  state: ContentState;
  reviewer?: string;
  reviewDate?: string;
  version: string;
  origin: "canonical" | "ai_generated";

  // Monetisation
  premium: boolean;
  packId?: string;
  bedtime?: boolean;
}

export interface StoryVersion {
  storyId: string;
  version: string;
  at: string;
  by: string;
  note: string;
  snapshot: Story;
}

export interface ContentReview {
  id: string;
  storyId: string;
  from: ContentState;
  to: ContentState;
  by: string;
  note: string;
  at: string;
}

export interface ParentProfile {
  name: string;
  email: string;
  createdAt: string;
  consentAt?: string; // parental consent timestamp
  goals: ParentGoal[];
  role: "parent" | "teacher" | "admin";
}

export type ParentGoal = "bedtime" | "prophets" | "character" | "history" | "reading";

export interface ChildProfile {
  id: string;
  name: string; // first name only - data minimisation (PRD §32)
  age: number;
  readingLevel: ReadingLevel;
  language: Lang;
  dailyGoalMin: number;
  avatarSeed: string;
  createdAt: string;
}

/** Observable learning interactions (PRD §30 - no character scores) */
export type LearningEventType =
  | "story_completed"
  | "discussion_completed"
  | "action_completed"
  | "reflection_completed"
  | "observation"
  | "quiz_completed";

export interface LearningEvent {
  id: string;
  childId: string;
  type: LearningEventType;
  storyId?: string;
  storyVersion?: string;
  values: ValueId[];
  at: string;
  note?: string; // reflection answer / observation text
  score?: number; // quiz correct answers
  programId?: string;
  programDay?: number;
}

export interface ReadingSession {
  id: string;
  childId: string;
  storyId: string;
  storyVersion: string;
  startedAt: string;
  endedAt?: string;
  seconds: number;
  pagesViewed: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  childId: string;
  badgeId: string;
  at: string;
}

export interface Certificate {
  id: string;
  childId: string;
  title: string;
  at: string;
  values: ValueId[];
}

export interface ProgramEnrollment {
  programId: string;
  childId: string;
  startedAt: string;
  completedDays: number[];
}

export type PlanId = "free" | "premium_monthly" | "premium_annual" | "family_plus";

export interface Subscription {
  plan: PlanId;
  status: "active" | "trialing" | "paused" | "cancelled" | "none";
  startedAt?: string;
  trialEndsAt?: string;
  renewsAt?: string;
  cancelReason?: string;
  pausedUntil?: string;
}

export interface Payment {
  id: string;
  at: string;
  amountUsd: number;
  description: string;
  kind: "subscription" | "pack";
  ref: string;
}

export interface Referral {
  code: string;
  invited: { email: string; at: string; converted: boolean }[];
  bonusDays: number;
  redeemedFrom?: string;
}

export interface Settings {
  audioNarration: boolean;
  tashkeel: boolean;
  dailyScreenLimitMin: number;
  bedtimeReminder: boolean;
  reminderTime: string;
  weeklyDigest: boolean;
  pin?: string; // parental PIN (hashed-lite)
  readAloudHighlight: boolean;
  dataRetentionMonths: number;
}

export interface AnalyticsEvent {
  name: string;
  at: string;
  props?: Record<string, string | number | boolean | undefined>;
}

export interface AIRequestLog {
  id: string;
  at: string;
  kind: "story_generation" | "parent_assistant" | "adaptation";
  model: string;
  input: Record<string, unknown>;
  inputCheck: { ok: boolean; reason?: string };
  retrievedSources: string[];
  outputCheck?: ValidationResult;
  cached: boolean;
  resultStoryId?: string;
  error?: string;
}

export interface ValidationIssue {
  rule: string;
  severity: "error" | "warning";
  message: string;
}

export interface ValidationResult {
  passed: boolean;
  issues: ValidationIssue[];
}

/** B2B entities (PRD §60) */
export interface Classroom {
  id: string;
  name: string;
  teacher: string;
  school: string;
  createdAt: string;
  students: Student[];
  assignments: Assignment[];
  pilotEndsAt?: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  completed: string[]; // story ids
  discussions: number;
}

export interface Assignment {
  id: string;
  storyId: string;
  due: string;
  note: string;
  createdAt: string;
}

export interface Sponsorship {
  id: string;
  sponsor: string;
  program: string;
  seats: number;
  seatsUsed: number;
  startedAt: string;
}

export interface Lead {
  email: string;
  at: string;
  source: string;
}
