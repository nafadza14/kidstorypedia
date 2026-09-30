import { useSyncExternalStore } from "react";
import type {
  Achievement, AIRequestLog, AnalyticsEvent, Certificate, ChildProfile, Classroom, ContentReview,
  ContentState, Lead, LearningEvent, ParentProfile, Payment, ProgramEnrollment, ReadingSession,
  Referral, Settings, Sponsorship, Story, StoryVersion, Subscription,
} from "@/types";

/**
 * Local-first store. Everything persists to localStorage under one key.
 * The shape mirrors the PRD §31 data model so it can be migrated to a
 * backend (e.g. Supabase/Postgres) table-for-table.
 */
export interface AppState {
  schemaVersion: number;
  parent: ParentProfile | null;
  children: ChildProfile[];
  activeChildId: string | null;
  events: LearningEvent[];
  sessions: ReadingSession[];
  achievements: Achievement[];
  certificates: Certificate[];
  enrollments: ProgramEnrollment[];
  subscription: Subscription;
  payments: Payment[];
  ownedPacks: string[];
  referral: Referral;
  settings: Settings;
  analytics: AnalyticsEvent[];
  aiLogs: AIRequestLog[];
  storyOverrides: Record<string, Story>;
  versions: StoryVersion[];
  reviews: ContentReview[];
  classrooms: Classroom[];
  sponsorships: Sponsorship[];
  leads: Lead[];
  aiCache: Record<string, { at: string; value: unknown }>;
}

const KEY = "kidstorypedia:v2";
const SCHEMA = 2;

export const uid = (p = "id") => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
export const now = () => new Date().toISOString();

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function initialState(): AppState {
  return {
    schemaVersion: SCHEMA,
    parent: null,
    children: [],
    activeChildId: null,
    events: [],
    sessions: [],
    achievements: [],
    certificates: [],
    enrollments: [],
    subscription: { plan: "free", status: "none" },
    payments: [],
    ownedPacks: [],
    referral: { code: randomCode(), invited: [], bonusDays: 0 },
    settings: {
      readerStyle: "book",
      audioNarration: true,
      tashkeel: true,
      dailyScreenLimitMin: 30,
      bedtimeReminder: true,
      reminderTime: "19:30",
      weeklyDigest: true,
      readAloudHighlight: true,
      dataRetentionMonths: 24,
    },
    analytics: [],
    aiLogs: [],
    storyOverrides: {},
    versions: [],
    reviews: [],
    classrooms: [],
    sponsorships: [],
    leads: [],
    aiCache: {},
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // shallow-merge so new fields added in later versions get defaults
    const base = initialState();
    return { ...base, ...parsed, settings: { ...base.settings, ...(parsed.settings || {}) }, schemaVersion: SCHEMA };
  } catch {
    return initialState();
  }
}

let state: AppState = typeof window === "undefined" ? initialState() : load();
const listeners = new Set<() => void>();

function persist() {
  try {
    // cap unbounded logs
    if (state.analytics.length > 5000) state = { ...state, analytics: state.analytics.slice(-5000) };
    if (state.aiLogs.length > 300) state = { ...state, aiLogs: state.aiLogs.slice(-300) };
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable or full - keep in memory */
  }
}

export function getState() {
  return state;
}

export function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  listeners.forEach(l => l());
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export function resetAll() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  state = initialState();
  listeners.forEach(l => l());
}

// cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", e => {
    if (e.key === KEY) {
      state = load();
      listeners.forEach(l => l());
    }
  });
}

// ─────────────────────────── helpers used by several modules ───────────────────────────
export function activeChild(s: AppState = state): ChildProfile | undefined {
  return s.children.find(c => c.id === s.activeChildId) || s.children[0];
}

export function transitionStory(storyId: string, story: Story, to: ContentState, by: string, note: string) {
  setState(s => ({
    ...s,
    storyOverrides: { ...s.storyOverrides, [storyId]: { ...story, state: to, reviewer: to === "published" ? by : story.reviewer, reviewDate: to === "published" ? now().slice(0, 10) : story.reviewDate } },
    reviews: [...s.reviews, { id: uid("rev"), storyId, from: story.state, to, by, note, at: now() }],
  }));
}
