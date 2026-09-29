import { PLANS } from "@/data/catalog";
import { allStories, findStory } from "@/lib/content";
import { activation, meaningfulSessions, weekStart } from "@/lib/learning";
import type { AppState } from "@/store";

/**
 * Business metrics (PRD §53, §71). In local-first mode these are computed
 * from this browser's data only. When a backend is connected, compute the
 * same formulas over all families server-side.
 */
export function funnel(s: AppState) {
  const c = (n: string) => s.analytics.filter(e => e.name === n).length;
  return [
    { step: "Landing views", n: c("landing_view") },
    { step: "Signup started", n: c("signup_started") },
    { step: "Signup completed", n: c("signup_completed") },
    { step: "Child created", n: c("child_created") },
    { step: "Story completed", n: c("story_completed") },
    { step: "Discussion completed", n: c("discussion_completed") },
    { step: "Paywall viewed", n: c("paywall_viewed") },
    { step: "Checkout started", n: c("checkout_started") },
    { step: "Subscription started", n: c("subscription_started") },
  ];
}

export function eventCounts(s: AppState) {
  const m = new Map<string, number>();
  s.analytics.forEach(e => m.set(e.name, (m.get(e.name) || 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export function weeklyNorthStar(s: AppState, weeks = 8) {
  const out: { week: string; sessions: number }[] = [];
  const start = weekStart();
  for (let i = weeks - 1; i >= 0; i--) {
    const from = new Date(start.getTime() - i * 7 * 86400000);
    const to = new Date(from.getTime() + 7 * 86400000);
    const sub = { ...s, events: s.events.filter(e => new Date(e.at) >= from && new Date(e.at) < to) };
    out.push({ week: from.toISOString().slice(5, 10), sessions: meaningfulSessions(sub) });
  }
  return out;
}

export function contentStats(s: AppState) {
  const completed = s.events.filter(e => e.type === "story_completed");
  const started = s.sessions;
  const byStory = new Map<string, { started: number; completed: number }>();
  started.forEach(x => { const r = byStory.get(x.storyId) || { started: 0, completed: 0 }; r.started++; if (x.completed) r.completed++; byStory.set(x.storyId, r); });
  const top = [...byStory.entries()].map(([id, r]) => ({ id, title: findStory(s, id)?.title.en || id, ...r, rate: r.started ? r.completed / r.started : 0 })).sort((a, b) => b.completed - a.completed);
  const values = new Map<string, number>();
  s.events.forEach(e => e.values.forEach(v => values.set(v, (values.get(v) || 0) + 1)));
  const ages = new Map<number, number>();
  s.children.forEach(c => ages.set(c.age, (ages.get(c.age) || 0) + 1));
  const langs = new Map<string, number>();
  s.children.forEach(c => langs.set(c.language, (langs.get(c.language) || 0) + 1));
  const states = new Map<string, number>();
  allStories(s).forEach(st => states.set(st.state, (states.get(st.state) || 0) + 1));
  return { top, values: [...values.entries()].sort((a, b) => b[1] - a[1]), ages: [...ages.entries()].sort((a, b) => a[0] - b[0]), langs: [...langs.entries()], states: [...states.entries()], completions: completed.length };
}

export function revenue(s: AppState) {
  const plan = PLANS.find(p => p.id === s.subscription.plan);
  const paying = s.subscription.status === "active" && plan && plan.priceUsd > 0;
  const mrr = paying ? (plan!.period === "month" ? plan!.priceUsd : plan!.priceUsd / 12) : 0;
  const total = s.payments.reduce((a, p) => a + p.amountUsd, 0);
  return { mrr, arr: mrr * 12, totalCollected: total, payments: s.payments.length, activated: activation(s).activated };
}

// ─────────────────────────── unit economics (PRD §54) ───────────────────────────
export function unitEconomics(i: { arpuMonthly: number; grossMargin: number; lifetimeMonths: number; spend: number; newPaying: number }) {
  const ltv = i.arpuMonthly * i.grossMargin * i.lifetimeMonths;
  const cac = i.newPaying > 0 ? i.spend / i.newPaying : 0;
  const payback = i.arpuMonthly * i.grossMargin > 0 ? cac / (i.arpuMonthly * i.grossMargin) : 0;
  return { ltv, cac, payback, ratio: cac > 0 ? ltv / cac : 0 };
}

// ─────────────────────────── scenario model (PRD §86–88) ───────────────────────────
export function scenario(i: { families: number; blendedAnnual: number; schools: number; schoolContract: number; other: number }) {
  const subs = i.families * i.blendedAnnual;
  const b2b = i.schools * i.schoolContract;
  return { subs, b2b, total: subs + b2b + i.other };
}
