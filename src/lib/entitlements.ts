import { CONFIG } from "@/config";
import type { AppState } from "@/store";
import type { Story } from "@/types";

/** Freemium boundaries (PRD §34, §100 P0-8) */
export function isPremium(s: AppState): boolean {
  const sub = s.subscription;
  if (sub.plan === "free") return false;
  if (sub.status === "active") return true;
  if (sub.status === "trialing") return !!sub.trialEndsAt && new Date(sub.trialEndsAt) > new Date();
  if (sub.status === "cancelled") return !!sub.renewsAt && new Date(sub.renewsAt) > new Date(); // access until period end
  return false;
}

export function canAccessStory(s: AppState, story: Story): boolean {
  if (!story.premium) return true;
  if (isPremium(s)) return true;
  return !!story.packId && s.ownedPacks.includes(story.packId);
}

export function maxChildren(s: AppState) {
  return isPremium(s) ? CONFIG.family.maxChildren : CONFIG.free.maxChildren;
}

export function discussionQuestionLimit(s: AppState) {
  return isPremium(s) ? 3 : CONFIG.free.discussionQuestions;
}

export function canAccessProgramDay(s: AppState, programPackId: string | undefined, day: number) {
  if (!programPackId) return true;
  if (isPremium(s) || s.ownedPacks.includes(programPackId)) return true;
  return day <= CONFIG.free.programFreeDays;
}

export function trialDaysLeft(s: AppState) {
  if (s.subscription.status !== "trialing" || !s.subscription.trialEndsAt) return 0;
  return Math.max(0, Math.ceil((new Date(s.subscription.trialEndsAt).getTime() - Date.now()) / 86400000));
}
