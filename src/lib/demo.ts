import { CANONICAL_STORIES } from "@/data/stories";
import { evaluateBadges } from "@/lib/learning";
import { getState, initialState, setState, uid } from "@/store";
import type { AnalyticsEvent, ChildProfile, LearningEvent, ReadingSession } from "@/types";

/**
 * Seeds a demo family so every screen can be explored without going
 * through onboarding. Clearly labelled as demo data in the UI.
 */
export function seedDemoFamily() {
  const base = initialState();
  const daysAgo = (d: number, h = 19) => {
    const x = new Date();
    x.setDate(x.getDate() - d);
    x.setHours(h, 30, 0, 0);
    return x.toISOString();
  };
  const children: ChildProfile[] = [
    { id: "demo-ahmad", name: "Ahmad", age: 7, readingLevel: "developing", language: "en", dailyGoalMin: 15, avatarSeed: "Ahmad", createdAt: daysAgo(20) },
    { id: "demo-maryam", name: "Maryam", age: 5, readingLevel: "early", language: "en", dailyGoalMin: 10, avatarSeed: "Maryam", createdAt: daysAgo(20) },
  ];
  const plan: [string, string, number][] = [
    ["demo-ahmad", "yusuf-1", 12], ["demo-ahmad", "nuh-1", 9], ["demo-ahmad", "fable-1", 6], ["demo-ahmad", "al-amin", 4],
    ["demo-ahmad", "yunus-1", 2], ["demo-ahmad", "tariq-coin", 1],
    ["demo-maryam", "fable-1", 8], ["demo-maryam", "yunus-1", 3], ["demo-maryam", "tariq-coin", 1],
  ];
  const events: LearningEvent[] = [];
  const sessions: ReadingSession[] = [];
  const analytics: AnalyticsEvent[] = [
    { name: "landing_view", at: daysAgo(21) }, { name: "signup_started", at: daysAgo(21) }, { name: "signup_completed", at: daysAgo(21) },
    { name: "child_created", at: daysAgo(20) }, { name: "child_created", at: daysAgo(20) }, { name: "onboarding_completed", at: daysAgo(20) },
  ];
  plan.forEach(([childId, storyId, d], i) => {
    const st = CANONICAL_STORIES.find(s => s.id === storyId)!;
    const at = daysAgo(d);
    sessions.push({ id: uid("ses"), childId, storyId, storyVersion: st.version, startedAt: at, endedAt: at, seconds: st.durationMin * 60, pagesViewed: st.pages.length, completed: true });
    events.push({ id: uid("evt"), childId, type: "story_completed", storyId, storyVersion: st.version, values: st.values, at });
    analytics.push({ name: "story_started", at }, { name: "story_completed", at });
    if (i % 3 !== 2) { events.push({ id: uid("evt"), childId, type: "discussion_completed", storyId, values: st.values, at }); analytics.push({ name: "discussion_completed", at }); }
    if (i % 2 === 0) events.push({ id: uid("evt"), childId, type: "reflection_completed", storyId, values: st.values, at, note: childId === "demo-ahmad" ? "I waited for my turn on the swing." : "I said Alhamdulillah for my food." });
    if (i % 3 === 0) events.push({ id: uid("evt"), childId, type: "action_completed", storyId, values: st.values, at });
  });
  events.push({ id: uid("evt"), childId: "demo-ahmad", type: "observation", values: ["patience"], at: daysAgo(3), note: "Waited calmly while his sister finished her turn." });

  setState(() => ({
    ...base,
    parent: { name: "Sarah", email: "sarah@example.com", createdAt: daysAgo(21), consentAt: daysAgo(21), goals: ["bedtime", "character", "prophets"], role: "parent" },
    children,
    activeChildId: "demo-ahmad",
    events,
    sessions,
    analytics,
    subscription: { plan: "premium_annual", status: "trialing", startedAt: daysAgo(2), trialEndsAt: new Date(Date.now() + 5 * 86400000).toISOString() },
    enrollments: [{ programId: "patience-7", childId: "demo-ahmad", startedAt: daysAgo(3), completedDays: [1, 2] }],
  }));
  children.forEach(c => evaluateBadges(c.id));
  return getState();
}
