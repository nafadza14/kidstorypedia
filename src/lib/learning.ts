import { BADGES, PROGRAMS } from "@/data/catalog";
import { VALUES } from "@/data/values";
import { findStory } from "@/lib/content";
import { track } from "@/lib/analytics";
import { getState, now, setState, uid, type AppState } from "@/store";
import type { LearningEvent, LearningEventType, ValueId } from "@/types";

// ─────────────────────────── reading sessions ───────────────────────────
export function startSession(childId: string, storyId: string, storyVersion: string): string {
  const id = uid("ses");
  setState(s => ({
    ...s,
    sessions: [...s.sessions, { id, childId, storyId, storyVersion, startedAt: now(), seconds: 0, pagesViewed: 1, completed: false }],
  }));
  return id;
}

export function updateSession(id: string, patch: { pagesViewed?: number; completed?: boolean; addSeconds?: number }) {
  setState(s => ({
    ...s,
    sessions: s.sessions.map(x =>
      x.id !== id ? x : {
        ...x,
        pagesViewed: Math.max(x.pagesViewed, patch.pagesViewed ?? 0),
        completed: x.completed || !!patch.completed,
        seconds: x.seconds + (patch.addSeconds ?? 0),
        endedAt: now(),
      }),
  }));
}

// ─────────────────────────── learning events ───────────────────────────
export function logEvent(e: Omit<LearningEvent, "id" | "at">): string[] {
  const ev: LearningEvent = { ...e, id: uid("evt"), at: now() };
  setState(s => ({ ...s, events: [...s.events, ev] }));
  return evaluateBadges(e.childId);
}

export function hasEvent(s: AppState, childId: string, type: LearningEventType, storyId?: string) {
  return s.events.some(e => e.childId === childId && e.type === type && (!storyId || e.storyId === storyId));
}

// ─────────────────────────── achievements (PRD §20) ───────────────────────────
function badgeRules(s: AppState, childId: string): Record<string, boolean> {
  const ev = s.events.filter(e => e.childId === childId);
  const count = (t: LearningEventType) => ev.filter(e => e.type === t).length;
  const completed = ev.filter(e => e.type === "story_completed");
  const cats = new Set(completed.map(e => findStory(s, e.storyId)?.category).filter(Boolean));
  const values = new Set(ev.flatMap(e => e.values));
  const patienceReflections = ev.filter(e => e.type === "reflection_completed" && e.values.includes("patience")).length;
  const programDone = s.enrollments.some(en => {
    if (en.childId !== childId) return false;
    const p = PROGRAMS.find(pp => pp.id === en.programId);
    return !!p && en.completedDays.length >= p.days.length;
  });
  return {
    "first-story": completed.length >= 1,
    "nightly-reader": s.sessions.filter(x => x.childId === childId && x.completed).length >= 7,
    "story-explorer": cats.size >= 4,
    "patience-practitioner": patienceReflections >= 3,
    "family-reflector": count("discussion_completed") >= 5,
    "action-taker": count("action_completed") >= 5,
    "value-explorer": values.size >= 6,
    "program-finisher": programDone,
  };
}

/** Returns ids of newly unlocked badges. */
export function evaluateBadges(childId: string): string[] {
  const s = getState();
  const rules = badgeRules(s, childId);
  const owned = new Set(s.achievements.filter(a => a.childId === childId).map(a => a.badgeId));
  const fresh = BADGES.filter(b => rules[b.id] && !owned.has(b.id)).map(b => b.id);
  if (fresh.length) {
    setState(st => ({ ...st, achievements: [...st.achievements, ...fresh.map(badgeId => ({ id: uid("ach"), childId, badgeId, at: now() }))] }));
    fresh.forEach(b => track("badge_unlocked", { badge: b, childId }));
  }
  return fresh;
}

export function badgeProgress(s: AppState, childId: string) {
  return badgeRules(s, childId);
}

// ─────────────────────────── character journey (PRD §19, §30) ───────────────────────────
export interface ValueJourney {
  value: ValueId;
  stories: number;
  discussions: number;
  actions: number;
  reflections: number;
  observations: number;
  total: number;
  lastAt?: string;
}

export function valueJourney(s: AppState, childId: string): ValueJourney[] {
  const ev = s.events.filter(e => e.childId === childId);
  return VALUES.map(v => {
    const mine = ev.filter(e => e.values.includes(v.id));
    const c = (t: LearningEventType) => mine.filter(e => e.type === t).length;
    const j = {
      value: v.id,
      stories: c("story_completed"),
      discussions: c("discussion_completed"),
      actions: c("action_completed"),
      reflections: c("reflection_completed"),
      observations: c("observation"),
      total: mine.length,
      lastAt: mine.length ? mine[mine.length - 1].at : undefined,
    };
    return j;
  });
}

// ─────────────────────────── weekly summary & North Star (PRD §52, §96) ───────────────────────────
const dayKey = (iso: string) => iso.slice(0, 10);

export function weekStart(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x;
}

/** A meaningful learning session = story completed + a learning/reflection interaction the same day. */
export function meaningfulSessions(s: AppState, childId?: string, since?: Date): number {
  const ev = s.events.filter(e => (!childId || e.childId === childId) && (!since || new Date(e.at) >= since));
  const byChildDay = new Map<string, Set<LearningEventType>>();
  for (const e of ev) {
    const k = `${e.childId}|${dayKey(e.at)}`;
    if (!byChildDay.has(k)) byChildDay.set(k, new Set());
    byChildDay.get(k)!.add(e.type);
  }
  let n = 0;
  byChildDay.forEach(types => {
    if (types.has("story_completed") && (types.has("reflection_completed") || types.has("discussion_completed") || types.has("quiz_completed") || types.has("action_completed"))) n++;
  });
  return n;
}

export function weeklySummary(s: AppState, childId: string, start = weekStart()) {
  const ev = s.events.filter(e => e.childId === childId && new Date(e.at) >= start);
  const sessions = s.sessions.filter(x => x.childId === childId && new Date(x.startedAt) >= start);
  const learned = [...new Set(ev.filter(e => e.type === "story_completed").map(e => e.storyId!))];
  const values = [...new Set(ev.flatMap(e => e.values))];
  return {
    storiesCompleted: learned,
    discussions: ev.filter(e => e.type === "discussion_completed").length,
    actions: ev.filter(e => e.type === "action_completed").map(e => e),
    reflections: ev.filter(e => e.type === "reflection_completed"),
    observations: ev.filter(e => e.type === "observation"),
    values,
    readingSeconds: sessions.reduce((a, x) => a + x.seconds, 0),
    meaningful: meaningfulSessions(s, childId, start),
  };
}

export function childStats(s: AppState, childId: string) {
  const ev = s.events.filter(e => e.childId === childId);
  const sessions = s.sessions.filter(x => x.childId === childId);
  return {
    storiesCompleted: new Set(ev.filter(e => e.type === "story_completed").map(e => e.storyId)).size,
    readingSeconds: sessions.reduce((a, x) => a + x.seconds, 0),
    learningSessions: meaningfulSessions(s, childId),
    valuesExplored: new Set(ev.flatMap(e => e.values)).size,
    discussions: ev.filter(e => e.type === "discussion_completed").length,
    badges: s.achievements.filter(a => a.childId === childId).length,
  };
}

/** PRD §51 activation: child profile + first story completed + first discussion completed. */
export function activation(s: AppState) {
  const child = s.children.length > 0;
  const story = s.events.some(e => e.type === "story_completed");
  const discussion = s.events.some(e => e.type === "discussion_completed");
  return { child, story, discussion, activated: child && story && discussion };
}

export function readingSecondsToday(s: AppState, childId: string) {
  const today = dayKey(new Date().toISOString());
  return s.sessions.filter(x => x.childId === childId && dayKey(x.startedAt) === today).reduce((a, x) => a + x.seconds, 0);
}

export function fmtDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.round(sec / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
