# Product Requirement Document (PRD)

## Project Name: Kidstorypedia
**Tagline:** Prophetic Digital Storytelling for Children's Moral Character & Values  
**Initiative:** Supported by Yayasan Omah Dongeng Kalasan  
**Document Version:** 1.0.0  
**Status:** Approved & Implemented  
**Target Audience:** Muslim parents, educators, homeschoolers, and children (ages 4–12)  

---

## 1. Executive Summary & Vision

### 1.1 Executive Summary
**Kidstorypedia** is an interactive, modern digital storytelling and moral character development platform designed for contemporary Muslim families. It bridges classical Islamic heritage (25 Prophets, Seerah Nabawiyah, Sahabah biographies, and moral wisdom fables) with human-centered digital experiences. 

Rather than passive screen time, Kidstorypedia transforms reading into an active, collaborative habit between parents and children through **interactive page-by-page readers**, **curated weekly story charts**, **parent-child discussion guides**, **character growth tracking across 12 prophetic values**, and **printable certificates of moral character**.

### 1.2 Vision Statement
> *"To nurture noble prophetic character (Akhlak Nabawiyah) in young hearts through authentic, engaging, ad-free digital narratives that inspire lifelong virtue, empathy, and love for Allah and His messengers."*

### 1.3 Key Differentiators
- **Authentic & Scholar-Vetted Content:** Stories based on authentic Islamic tradition without fictional distortions of sacred events.
- **Strict Visual Discipline:** Character illustrations strictly follow modest Islamic art guidelines (faceless character aesthetics, avoiding idolatry/slop).
- **Dual Perspective Platform:** Dedicated **Parent Portal** for monitoring and discussions alongside an engaging, safe **Kids View**.
- **Values Over Vanity Metrics:** Metrics prioritize virtues (Honesty, Patience, Gratitude, Courage, Generosity) rather than addictive dopamine loops.
- **Bilingual & Global Ummah Support:** Native support for English (LTR) and Arabic (RTL) with phonetic diacritics (Tashkeel).

---

## 2. Target Personas

### Persona A: The Conscious Parent ("Ummi Sarah")
- **Profile:** Mother of 2 (ages 5 and 7), living in an urban setting.
- **Goals:** Establish a consistent bedtime routine grounded in Islamic values; find clean, ad-free Islamic media that her children genuinely enjoy.
- **Pain Points:** Mainstream platforms are flooded with advertisements, non-Islamic themes, or low-quality animated content; lack of actionable talking points to discuss faith and morals with children.
- **Platform Usage:** Uses the **Parent Dashboard** to review reading logs, launch bedtime discussion guides, track character milestones, and set screen limits.

### Persona B: The Young Reader ("Ahmad", age 7)
- **Profile:** Curious elementary student who loves illustrated adventure and heroic stories.
- **Goals:** Read exciting stories of prophets, listen to warm voice narration, earn virtue badges.
- **Pain Points:** Textbooks and traditional religious books feel dry or overwhelming without visual engagement.
- **Platform Usage:** Uses **Kids View** and the **Interactive Story Reader** to read stories, collect character points, and celebrate achievements with parents.

---

## 3. Product Architecture & User Journeys

```
                    ┌──────────────────────────────────────────────┐
                    │               KIDSTORYPEDIA                  │
                    │               Landing Page (/)               │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┴───────────────────────┐
                    ▼                                              ▼
   ┌────────────────────────────────┐            ┌────────────────────────────────┐
   │     Parent Portal (/dashboard)  │            │     Kids Experience (/child)   │
   ├────────────────────────────────┤            ├────────────────────────────────┤
   │ 1. Overview & Stats            │            │ 1. Continue Reading Hero       │
   │ 2. Child Profiles Management   │            │ 2. Category Filter Pills       │
   │ 3. Bedtime Discussion Guides   │            │ 3. Curated Library Grid        │
   │ 4. Achievements & Badges       │            │ 4. Character Points Indicator  │
   │ 5. Parental Controls & Settings│            └────────────────┬───────────────┘
   └────────────────────────────────┘                             │
                                                                  ▼
                                                 ┌────────────────────────────────┐
                                                 │   Interactive Story Reader     │
                                                 │         (/story/:id)           │
                                                 ├────────────────────────────────┤
                                                 │ • Fullscreen Ambient Reader    │
                                                 │ • Audio Voice Narration        │
                                                 │ • Page Progress Dots           │
                                                 │ • Completion Reflection Modal  │
                                                 └────────────────────────────────┘
```

---

## 4. Detailed Feature Specifications

### 4.1 Landing Page (`/`)
Designed with a cinematic, high-end editorial agency aesthetic (Mainframe pattern) featuring high-contrast typography, deep translucent layering, and seamless navigation.

| Section | Component / Feature | Description |
|---|---|---|
| **Global Header** | Fixed Navbar | Displays `Kidstorypedia®` logo with decorative `✳︎` symbol, quick navigation anchors (`Top Stories`, `Features`, `How it Works`, `Library`, `Values`), language switcher (`English` / `العربية`), and direct portal CTA. |
| **Hero Section** | Architectural Hero | High-contrast typography with dynamic badge (*"Prophetic Character & Moral Stories for Children"*), two primary action buttons (*Start Parent Dashboard*, *Try Kids Experience*), and spacious layout showcasing the background artwork (`https://i.imgur.com/bpuBPTG.png`). |
| **Bottom Ticker** | Status Ticker | Displays geographic presence (*Global Islamic Parenting • Authentic Storytelling*), active experience indicator, and branding tag. |
| **Top Stories This Week** | Ranked Chart (#1 – #5) | Displays the 5 most popular stories of the week with rank badges (`#1`, `#2`, `#3`, `#4`, `#5`), duration, read count, and cover images. |
| **Core Pillars** | 3-Column Agency Grid | Highlights Authenticity (25 Prophets, Seerah, Sahabah), Character Tracking (12 core values), and Safety (100% ad-free, scholar vetted). |
| **Story Method** | 3-Step Process | Explains the 3-step loop: *Choose a Story* &rarr; *Read & Learn* &rarr; *Track Character*. |
| **Curated Archive** | Library Preview | Showcase of 4 categories: *Stories of the Prophets*, *Seerah Nabawiyah*, *Lives of the Sahabah*, and *Moral Fables*. |
| **Character Growth** | Interactive Progress Showcase | Radar of 6 featured Islamic virtues with percentages alongside a live sample of *Ahmad's Character Journal*. |
| **Parent Reflections** | Testimonial Cards | Authentic parent feedback highlighting bedtime transformation. |
| **Final Call to Action** | Launch Banner | High-impact call to action to launch Parent Dashboard or Kids View. |
| **Footer** | Foundation Attribution | Houses the sole legal acknowledgement: *"Kidstorypedia® • Supported by Yayasan Omah Dongeng Kalasan"*. |

---

### 4.2 Parent Portal / Dashboard (`/dashboard`)
A full-featured management console providing comprehensive oversight over family learning.

#### A. Overview Tab
- **Key Metric Cards:**
  - *Stories Completed:* Total count with weekly velocity indicator.
  - *Reading Time:* Cumulative family reading time with daily average.
  - *Badges Earned:* Count of moral milestones unlocked.
- **Character Progress:** Real-time progress bars for 5 core virtues (*Honesty*, *Patience*, *Gratitude*, *Courage*, *Generosity*).
- **Featured Next Story Card:** Context-aware story recommendation with a trigger to generate/prepare new stories using the Gemini API.
- **Recent Reading Sessions:** History log with one-click re-read links.

#### B. Child Profiles Management
- **Multi-Child Switcher:** Manage multiple children (e.g. Ahmad, Maryam, Zayd) with active profile toggling that updates the entire dashboard state.
- **Child Detail Cards:** Displays avatar, age, reading level, total stories completed, badges won, and core trait breakdown.
- **Add Child Profile Modal:** Interactive form capturing:
  - Child's First Name
  - Age (3 to 14 years)
  - Daily Reading Goal (10, 15, 20, 30 min/day)
  - Custom Illustrated Avatar Selector

#### C. Discussion Guides
- **Bedtime Conversation Cards:** Structured parent-child prompts connected to story themes:
  - *Prophet Yusuf:* Overcoming Jealousy & Sibling Love (Patience)
  - *Prophet Nuh:* Steadfastness When Standing Alone (Courage)
  - *The Grateful Ant:* Cultivating Shukr for Every Little Crumb (Gratitude)
  - *Bilal ibn Rabah:* Equality, Dignity & Unshakable Faith (Honesty)
- **Discussion Structure:**
  - 3 numbered discussion questions tailored for kids.
  - Practical everyday family action challenge.
  - Bedtime reflection Du'a in transliterated Arabic with English translation.
- **Interactive Action:** *"Mark as Discussed"* button awards **+50 Character Points** to the child profile with an animated toast.
- **Category Filter:** Filter by virtue (*All, Patience, Courage, Gratitude, Honesty*).

#### D. Achievements & Certificate
- **Moral Badges Gallery:**
  - *Unlocked Badges:* Gold-bordered emblems (*Truthful One (Al-Amin)*, *Patience Guardian (Sabir)*, *Heart of Gratitude (Shakir)*, *Nightly Reciter*).
  - *In-Progress Badges:* Live progress meters (*Generous Giver 75%*, *Courageous Explorer 50%*, *Prophets Master 12%*, *Kind Companion 80%*).
- **Official Certificate of Moral Excellence:**
  - High-resolution, frame-ready award recognizing child's growth in Islamic virtues.
  - Print-ready trigger via browser print dialog.

#### E. Settings & Parental Controls
- **Guardian Profile:** Name and contact email configuration.
- **Reading Experience:** Toggle voice narration on/off and enable full Arabic diacritics (Tashkeel).
- **Parental Controls:**
  - Daily Screen Time Limit slider (15 min to 90 min).
  - Bedtime Story Reminder with daily time picker.
  - Weekly Progress Digest email toggle.
- **Save Verification:** Persists settings with visual confirmation toast.

---

### 4.3 Kids Experience (`/child`)
A safe, distraction-free environment tailored for young readers.
- **Continue Reading Hero Banner:** Prominent hero card featuring current reading progress with a direct *Read Now* action.
- **Category Filter Pills:** Seamless filtering across *All*, *Prophets*, *Seerah*, *Sahabah*, and *Fables*.
- **Story Grid:** Visual story cards with reading duration, core values tags, and smooth hover animation.
- **Parent Portal Shortcut:** Protected quick link back to the parent console.

---

### 4.4 Interactive Story Reader (`/story/:id`)
An immersive, distraction-free reading experience designed for bedtime and classroom settings.
- **Header Controls:** Close reader, page indicator dots, and audio narration play/pause toggle.
- **Ambient Canvas:** Soft blurred ambient backdrop derived from the current page illustration.
- **Faceless Illustration Frame:** High-resolution illustrations adhering to Islamic faceless aesthetics.
- **Bilingual Story Text:** Clear, large typography in English and Arabic.
- **Bottom Navigation:** Previous and Next buttons with a completion checkmark on the final page.
- **Completion Modal:** Celebratory popup with MashaAllah blessing, learned values recap, and options to read another story or tell parents.

---

## 5. Technical Architecture & Tech Stack

### 5.1 Frontend Stack
- **Framework:** React 19 (SPA Architecture)
- **Language:** TypeScript 5.x
- **Build Tool:** Vite 6.x
- **Styling:** Tailwind CSS 4.x
- **Animations:** Motion (`motion/react`)
- **Icons:** Lucide React
- **Typography:**
  - Heading: *Helvetica Now Display Medium*
  - Body: *Helvetica Now Display Regular*
  - Monospace: Standard system monospaced for metadata indicators

### 5.2 State Management & Contexts
- **LanguageContext:** Handles runtime translation switching between English (`en`, LTR) and Arabic (`ar`, RTL), automatically managing `document.documentElement.dir` and `lang`.
- **Local Application State:** Modular React state managing active child profile, discussion completions, and settings persistence.

### 5.3 AI & Story Generation Engine
- **SDK:** `@google/genai` (Google Gen AI TypeScript SDK)
- **Model:** `gemini-3-flash-preview` for structured JSON story creation.
- **Image Generation Prompting:** Incorporates strict negative guidance to enforce faceless, respectful Islamic children's book illustrations.

---

## 6. Non-Functional Requirements

### 6.1 Performance & Responsiveness
- **Page Load Time:** Under 1.5 seconds on broadband connections.
- **Image Optimization:** Direct CDN links with fallback handlers for broken images.
- **Responsive Breakpoints:** Mobile (`<640px`), Tablet (`640px - 1024px`), Desktop (`>1024px`).

### 6.2 Accessibility & Usability
- High color contrast meeting WCAG AA standards against translucent dark backdrops.
- Keyboard accessible navigation for story reading (`Previous` / `Next`).
- Clear RTL text alignment and mirroring when Arabic is active.

### 6.3 Content Integrity & Safety
- **Zero Advertising:** No 3rd-party ad trackers, banners, or popups.
- **Data Privacy:** Child profiles are maintained strictly for educational tracking without collecting sensitive PII.

---

## 7. Product Roadmap

### Phase 1: MVP & Core Polish (Completed)
- [x] Full-screen Hero landing page with custom background and #1–#5 ranked Top Stories.
- [x] Complete Parent Portal with Child Profiles, Discussion Guides, Achievements, and Settings.
- [x] Dedicated Kids View with category exploration.
- [x] Interactive bilingual page-by-page Story Reader with audio controls.
- [x] Full translation in English and Arabic with RTL switching.
- [x] Yayasan Omah Dongeng Kalasan restricted to footer legal attribution.

### Phase 2: Enhanced Interactivity (Next Release)
- [ ] Offline PWA capability with service worker caching for bedtime reading without internet.
- [ ] Real voice actor audio files integration for Seerah and Prophet series.
- [ ] Interactive quizzes at the end of each story for vocabulary and comprehension.
- [ ] Teacher & Classroom Mode with group discussion guides.

### Phase 3: Community & Multi-Device Sync
- [ ] Cloud sync across tablet and mobile devices via Firebase authentication.
- [ ] Print-on-Demand custom physical storybook generator.

---

*Document maintained by Kidstorypedia Product & Engineering Team.*  
*In collaboration with Yayasan Omah Dongeng Kalasan.*
