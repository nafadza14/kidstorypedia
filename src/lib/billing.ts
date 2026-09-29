import { CONFIG } from "@/config";
import { PACKS, PLANS } from "@/data/catalog";
import { track } from "@/lib/analytics";
import { getState, now, setState, uid } from "@/store";
import type { PlanId } from "@/types";

/**
 * Billing layer (PRD §33–35, §94). Runs in demo mode (no card is charged)
 * until a payment provider is wired in `checkout()` — e.g. Stripe Checkout
 * for global, Midtrans/Xendit for Indonesia. Keep the same function
 * signatures so the UI does not change.
 */
const addDays = (d: number, from = new Date()) => new Date(from.getTime() + d * 86400000).toISOString();

export function startTrial(plan: PlanId = "premium_annual") {
  const s = getState();
  if (s.subscription.trialEndsAt) return false; // one trial per family
  setState(st => ({ ...st, subscription: { plan, status: "trialing", startedAt: now(), trialEndsAt: addDays(CONFIG.trialDays + st.referral.bonusDays) } }));
  track("subscription_started", { plan, trial: true });
  return true;
}

export async function checkout(plan: PlanId): Promise<{ ok: boolean; message: string }> {
  const p = PLANS.find(x => x.id === plan);
  if (!p || plan === "free") return { ok: false, message: "Invalid plan" };
  track("checkout_started", { plan });
  if (!CONFIG.paymentsDemoMode) {
    // Integrate your provider here (redirect to hosted checkout, then confirm via webhook).
    return { ok: false, message: "Payment provider not configured" };
  }
  await new Promise(r => setTimeout(r, 600));
  const renews = addDays(p.period === "month" ? 30 : 365);
  setState(s => ({
    ...s,
    subscription: { plan, status: "active", startedAt: now(), renewsAt: renews, trialEndsAt: s.subscription.trialEndsAt },
    payments: [...s.payments, { id: uid("pay"), at: now(), amountUsd: p.priceUsd, description: p.name.en, kind: "subscription", ref: "DEMO" }],
  }));
  track("subscription_started", { plan, amount: p.priceUsd });
  // referral conversion credit for the inviter would be processed server-side
  return { ok: true, message: "Subscription active (demo mode — no charge)" };
}

export async function buyPack(packId: string): Promise<{ ok: boolean; message: string }> {
  const pack = PACKS.find(p => p.id === packId);
  if (!pack) return { ok: false, message: "Unknown pack" };
  track("checkout_started", { pack: packId });
  await new Promise(r => setTimeout(r, 500));
  setState(s => ({
    ...s,
    ownedPacks: [...new Set([...s.ownedPacks, packId])],
    payments: [...s.payments, { id: uid("pay"), at: now(), amountUsd: pack.priceUsd, description: pack.name.en, kind: "pack", ref: "DEMO" }],
  }));
  track("pack_purchased", { pack: packId, amount: pack.priceUsd });
  return { ok: true, message: "Pack unlocked (demo mode — no charge)" };
}

/** Non-manipulative cancel flow (PRD §94). */
export function cancelSubscription(reason: string) {
  setState(s => ({ ...s, subscription: { ...s.subscription, status: "cancelled", cancelReason: reason } }));
  track("subscription_cancelled", { reason });
}

export function pauseSubscription(days = 30) {
  setState(s => ({ ...s, subscription: { ...s.subscription, status: "paused", pausedUntil: addDays(days) } }));
}

export function resumeSubscription() {
  setState(s => ({ ...s, subscription: { ...s.subscription, status: "active", pausedUntil: undefined, cancelReason: undefined } }));
}

export function switchPlan(plan: PlanId) {
  return checkout(plan);
}

// ─────────────────────────── referral (PRD §46) ───────────────────────────
export function sendReferral(email: string) {
  setState(s => ({ ...s, referral: { ...s.referral, invited: [...s.referral.invited, { email, at: now(), converted: false }] } }));
  track("referral_sent");
}

/** Called when an invited family signs up with ?ref=CODE */
export function redeemReferral(code: string) {
  const s = getState();
  if (!code || code === s.referral.code) return false;
  setState(st => ({ ...st, referral: { ...st.referral, bonusDays: st.referral.bonusDays + CONFIG.referralBonusDays, redeemedFrom: code } }));
  track("referral_converted", { code });
  return true;
}

/** Demo helper to simulate an invited friend converting (for the referral screen). */
export function markReferralConverted(email: string) {
  setState(s => ({
    ...s,
    referral: {
      ...s.referral,
      bonusDays: s.referral.bonusDays + CONFIG.referralBonusDays,
      invited: s.referral.invited.map(i => (i.email === email ? { ...i, converted: true } : i)),
    },
    subscription: s.subscription.trialEndsAt && s.subscription.status === "trialing"
      ? { ...s.subscription, trialEndsAt: addDays(CONFIG.referralBonusDays, new Date(s.subscription.trialEndsAt)) }
      : s.subscription,
  }));
  track("referral_converted");
}
