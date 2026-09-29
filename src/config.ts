/**
 * App-wide configuration. Review before public launch.
 */
export const CONFIG = {
  /**
   * Stories in `scholar_review` were drafted from primary sources in v2.0 but
   * have NOT been signed off by a qualified scholar. While true, they are
   * visible in the family app with an "In review" label for parents.
   * Set to false before public launch (PRD §24, §95 Risk 2).
   */
  showStoriesInReview: true,

  /** Free tier boundaries (PRD §34) */
  free: {
    maxChildren: 1,
    discussionQuestions: 1, // number of discussion questions shown on free tier
    programFreeDays: 7, // free days of seasonal programs (PRD §49)
  },
  family: {
    maxChildren: 5, // PRD §35
  },
  trialDays: 7,
  referralBonusDays: 7, // "Give 7 days. Get 7 days." (PRD §46)

  /**
   * Payments run in demo mode until a provider is connected
   * (Stripe / Midtrans / Xendit). See src/lib/billing.ts.
   */
  paymentsDemoMode: true,

  /** AI model routing (PRD §90) */
  ai: {
    fastModel: "gemini-2.5-flash-lite",
    strongModel: "gemini-2.5-flash",
    imageModel: "gemini-2.5-flash-image",
  },
} as const;
