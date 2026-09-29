# PRD v2 → implementation map

Status legend: ✅ built · 🟡 built in local-first/demo mode (needs a backend or provider for production) · ⏳ not built

| PRD | Feature | Status | Where |
|---|---|---|---|
| §13 | Landing page, trust indicators, CTAs | ✅ | `src/pages/Landing.tsx` |
| §14, §68 | 5-step family onboarding, parental consent, first recommendation | ✅ | `src/pages/Onboarding.tsx` |
| §15, §69 | Kids experience (continue, recommended, categories, recently completed, character journey, PIN-protected exit, screen limit) | ✅ | `src/pages/ChildHome.tsx` |
| §16 | Reader: pages, progress, audio (Web Speech), read-aloud highlight, EN/AR, tashkeel toggle, age-band text, vocabulary help, comprehension check, reflection | ✅ | `src/pages/StoryReader.tsx` |
| §17 | Parent dashboard + canonical 12-value taxonomy | ✅ | `src/pages/Dashboard.tsx`, `src/data/values.ts` |
| §18 | Discussion engine (3 questions, action, reflection, sourced du'a) | ✅ | `src/components/DiscussionCard.tsx` |
| §19, §30 | Character journal — activity counts, never scores | ✅ | `src/pages/dashboard/Journal.tsx`, `src/lib/learning.ts` |
| §20–21 | Behaviour-based badges, certificates (print) | ✅ | `src/data/catalog.ts`, `dashboard/Achievements.tsx` |
| §22–27 | AI architecture: input validation, retrieval, constrained JSON, output validation, human review | ✅ | `src/lib/ai/*`, `server/ai.ts`, `api/ai.ts` |
| §23, §65–66 | Knowledge layer, CMS, versioning | 🟡 | `src/data/stories.ts`, `/studio` (edits are stored in the browser) |
| §24 | Governance workflow & scholar sign-off checklist | 🟡 | `/studio/review` |
| §28–29 | Personalisation & recommendation engine (next learning action) | ✅ | `src/lib/recommend.ts` |
| §32 | Privacy: data minimisation, export, delete, retention setting, consent | 🟡 | Settings, `/privacy` (retention not auto-enforced yet) |
| §33–38, §92 | Freemium, plans, packs, trial | 🟡 | `src/lib/billing.ts` (demo mode, no real charge) |
| §46 | Referral "Give 7 days, get 7 days" | 🟡 | `dashboard/Referral.tsx` (cross-family credit needs backend) |
| §44 | Lead magnet "30 Nights" | 🟡 | `/30-nights` (emails need an email provider) |
| §45 | SEO story library + story pages with JSON-LD | ✅ | `/stories`, `/stories/:slug` (SPA; add prerender/SSR for best SEO) |
| §49, §59 | 7-day & Ramadan 30-day programs | ✅ | `src/data/catalog.ts`, `dashboard/Programs.tsx` |
| §58 | Parent AI assistant (grounded, with offline fallback) | ✅ | `dashboard/Assistant.tsx` |
| §59 | Weekly family digest, offline PWA | 🟡 | `dashboard/Digest.tsx` (no automatic email), `public/sw.js` |
| §60 | Teacher mode, classroom, assignments, class discussion | 🟡 | `/classroom` |
| §37 | Institutional sponsorship impact dashboard | 🟡 | `/classroom?tab=sponsorship` |
| §70 | Analytics events | 🟡 | `src/lib/analytics.ts` (plug a provider via `window.__KSP_ANALYTICS__`) |
| §71, §54, §86–88 | Business dashboard, unit economics, scenarios | 🟡 | `/admin` (browser data only) |
| §90 | AI cost control: model routing, caching, pre-generated canonical stories | ✅ | `CONFIG.ai`, `aiCache` |
| §39, §61 | Physical products, print-on-demand, marketplace, licensing | ⏳ | business track |
| §56, §83–85 | Interviews, beta, GTM plan | ⏳ | business track |

## Before public launch (important)

1. **Scholar review.** 12 stories added in v2 are drafted from the cited Qur'an/hadith/sirah sources but are in `scholar_review`. They are visible now because `CONFIG.showStoriesInReview = true`. Have a qualified reviewer approve them in `/studio/review`, move approved text into `src/data/stories.ts` with `state: "published"`, then set the flag to `false`.
2. **Backend.** Accounts, progress and CMS edits live in the browser (localStorage). For multi-device use, real auth, B2B and aggregate analytics, add a backend (e.g. Supabase: auth + Postgres tables mirroring `src/types.ts`) behind `src/store`.
3. **Payments.** Wire Stripe (global) or Midtrans/Xendit (Indonesia) in `src/lib/billing.ts` → `checkout()`, confirm via webhook, then set `CONFIG.paymentsDemoMode = false`.
4. **Email.** Weekly digest, 30-Nights and referral invites need an email provider (Resend, Postmark, etc.).
5. **Legal.** Review privacy/consent per launch jurisdiction (COPPA, GDPR-K, UU PDP Indonesia) and replace the placeholder contact email on `/privacy`.
