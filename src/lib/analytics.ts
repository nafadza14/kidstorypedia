import { now, setState } from "@/store";
import type { AnalyticsEvent } from "@/types";

/**
 * Analytics event names (PRD §70). Events are stored locally and can be
 * forwarded to a provider (PostHog, Plausible, GA4) by setting
 * `window.__KSP_ANALYTICS__ = (event) => {...}`. No advertising or
 * behavioural-ad tracking is performed (PRD §32).
 */
export type EventName =
  | "landing_view" | "signup_started" | "signup_completed" | "child_created" | "onboarding_completed"
  | "story_viewed" | "story_started" | "story_page_viewed" | "story_completed" | "audio_started" | "reader_style_changed"
  | "discussion_opened" | "discussion_completed" | "action_started" | "action_completed" | "reflection_completed"
  | "badge_unlocked" | "certificate_generated" | "paywall_viewed" | "checkout_started"
  | "subscription_started" | "subscription_cancelled" | "referral_sent" | "referral_converted"
  | "lead_captured" | "quiz_completed" | "program_enrolled" | "pack_purchased" | "observation_added"
  | "ai_story_requested" | "ai_assistant_asked";

declare global {
  interface Window { __KSP_ANALYTICS__?: (e: AnalyticsEvent) => void }
}

export function track(name: EventName, props?: AnalyticsEvent["props"]) {
  const e: AnalyticsEvent = { name, at: now(), props };
  setState(s => ({ ...s, analytics: [...s.analytics, e] }));
  try { window.__KSP_ANALYTICS__?.(e); } catch { /* ignore */ }
}
