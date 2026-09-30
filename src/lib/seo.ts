/**
 * Central SEO definitions (PRD §45 Acquisition channel 3: SEO).
 *
 * Pure data + functions with no browser or React dependencies, so the same
 * titles, descriptions and structured data are used by the running app
 * (`useSeo`) and by the build-time prerender (`scripts/prerender.ts`) that
 * writes static HTML, `sitemap.xml` and `robots.txt`.
 */
import { CANONICAL_STORIES } from "@/data/stories";
import { SOURCE_MAP } from "@/data/sources";
import { CATEGORIES, VALUE_MAP } from "@/data/values";
import { CONFIG } from "@/config";
import type { Lang, Localized, Story, StoryCategory, ValueId } from "@/types";

export const SITE_URL = "https://kidstorypedia.com";
export const SITE_NAME = "Kidstorypedia";
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
export const LANGS: Lang[] = ["id", "en", "ar"];
export const OG_LOCALE: Record<Lang, string> = { id: "id_ID", en: "en_US", ar: "ar_AR" };

export const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

const pick = (l: Localized | undefined, lang: Lang) => (!l ? "" : lang === "ar" ? l.ar || l.en : lang === "id" ? l.id || l.en : l.en);
const T = (lang: Lang, id: string, en: string, ar: string) => (lang === "id" ? id : lang === "ar" ? ar : en);

export interface PageMeta {
  title: string;
  description: string;
  /** Root-relative path, resolved against SITE_URL. */
  canonical: string;
  image?: string;
  type?: "website" | "article" | "book";
  jsonLd?: Record<string, unknown>[];
  /** Adds hreflang alternates (?lang=id|en|ar) for trilingual pages. */
  alternates?: boolean;
  noindex?: boolean;
  /** Short static text for the prerendered HTML body (crawlers without JS). */
  bodyHtml?: string;
}

/** Stories allowed on public pages (mirrors familyStories()). */
export function publicStories(): Story[] {
  return CANONICAL_STORIES.filter(s => s.state === "published" || (CONFIG.showStoriesInReview && s.state === "scholar_review" && s.origin === "canonical"));
}

/* ─────────────────────────── structured data ─────────────────────────── */

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
  description: "Islamic stories and character learning for Muslim families: read a story, start a conversation, practise a value.",
};

export const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: ["id", "en", "ar"],
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/stories?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

function storyListLd(name: string, stories: Story[], lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: stories.length,
    itemListElement: stories.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/stories/${s.slug}`), name: pick(s.title, lang) })),
  };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function storyLinksHtml(stories: Story[], lang: Lang) {
  return `<ul>${stories.map(s => `<li><a href="/stories/${s.slug}">${esc(pick(s.title, lang))}</a> - ${esc(pick(s.description, lang))}</li>`).join("")}</ul>`;
}

/* ─────────────────────────── page builders ─────────────────────────── */

export function homeMeta(lang: Lang): PageMeta {
  const stories = publicStories();
  return {
    title: T(lang,
      "Kidstorypedia - Cerita Islami Anak & Dongeng Sebelum Tidur untuk Keluarga Muslim",
      "Kidstorypedia - Islamic Stories for Kids & Muslim Bedtime Stories",
      "كيدستوريبيديا - قصص إسلامية للأطفال وحكايات ما قبل النوم"),
    description: T(lang,
      "Cerita Islami untuk anak 4–12 tahun: kisah para Nabi, Sirah, Sahabat, dan cerita moral, lengkap dengan sumber, panduan diskusi orang tua, dan tantangan nilai keluarga. Tanpa iklan, dalam Bahasa Indonesia, Inggris, dan Arab.",
      "Islamic stories for kids aged 4–12: stories of the Prophets, Seerah, Sahabah and moral tales, each with sources, a parent discussion guide and a family value challenge. Ad-free, in Indonesian, English and Arabic.",
      "قصص إسلامية للأطفال من ٤ إلى ١٢ سنة: قصص الأنبياء والسيرة والصحابة وحكايات أخلاقية، مع المصادر ودليل نقاش للوالدين وتحدٍّ عائلي للقيم. بلا إعلانات، بالإندونيسية والإنجليزية والعربية."),
    canonical: "/",
    alternates: true,
    jsonLd: [ORGANIZATION_LD, WEBSITE_LD],
    bodyHtml: `<h1>${esc(T(lang, "Cerita Islami untuk anak dan keluarga Muslim", "Islamic stories for kids and Muslim families", "قصص إسلامية للأطفال والعائلات المسلمة"))}</h1>
<p>${esc(T(lang, "Baca cerita. Mulai percakapan. Praktikkan sebuah nilai. Bangun akhlak.", "Read a story. Start a conversation. Practice a value. Build character.", "اقرأ قصة. ابدأ حواراً. مارس قيمة. ابنِ الأخلاق."))}</p>
<nav><a href="/stories">${esc(T(lang, "Semua cerita", "All stories", "كل القصص"))}</a> · ${SEO_TOPICS.map(t => `<a href="/${t.slug}">${esc(pick(t.h1, lang))}</a>`).join(" · ")}</nav>
${storyLinksHtml(stories, lang)}`,
  };
}

export function storiesIndexMeta(lang: Lang): PageMeta {
  const stories = publicStories();
  const name = T(lang, "Cerita Islami untuk anak-anak", "Islamic stories for kids", "قصص إسلامية للأطفال");
  return {
    title: T(lang,
      "Cerita Islami Anak - Kisah Nabi, Sirah, Sahabat & Cerita Moral | Kidstorypedia",
      "Islamic Stories for Kids - Prophets, Seerah, Sahabah & Moral Stories | Kidstorypedia",
      "قصص إسلامية للأطفال - الأنبياء والسيرة والصحابة وقصص أخلاقية | كيدستوريبيديا"),
    description: T(lang,
      "Perpustakaan cerita Islami gratis untuk anak 4–12 tahun: kisah para Nabi, Sirah, Sahabat, dan dongeng Islami sebelum tidur, masing-masing dengan sumber, panduan diskusi, dan aksi keluarga.",
      "Free Islamic stories for kids ages 4–12: stories of the Prophets, Seerah and Sahabah stories, and Islamic bedtime stories with moral values, each with sources, a parent discussion guide and a family action challenge.",
      "مكتبة قصص إسلامية للأطفال من ٤ إلى ١٢ سنة: قصص الأنبياء والسيرة والصحابة وحكايات ما قبل النوم، لكل منها مصادرها ودليل نقاش وعمل عائلي."),
    canonical: "/stories",
    alternates: true,
    jsonLd: [storyListLd(name, stories, lang), breadcrumbs([{ name: SITE_NAME, path: "/" }, { name, path: "/stories" }])],
    bodyHtml: `<h1>${esc(name)}</h1>${storyLinksHtml(stories, lang)}`,
  };
}

export function storyMeta(story: Story, lang: Lang): PageMeta {
  const title = pick(story.title, lang);
  const values = story.values.map(v => pick(VALUE_MAP[v].name, lang).toLowerCase());
  const cat = CATEGORIES.find(c => c.id === story.category);
  const first = story.pages[0];
  return {
    title: T(lang,
      `${title} - Cerita Islami Anak Usia ${story.ageRange[0]}–${story.ageRange[1]} | Kidstorypedia`,
      `${title} - Islamic Story for Kids Ages ${story.ageRange[0]}–${story.ageRange[1]} | Kidstorypedia`,
      `${title} - قصة إسلامية للأطفال من ${story.ageRange[0]} إلى ${story.ageRange[1]} | كيدستوريبيديا`),
    description: T(lang,
      `${pick(story.description, lang)} Mengajarkan ${values.join(" dan ")}. Dilengkapi sumber, panduan diskusi orang tua, dan tantangan aksi keluarga.`,
      `${pick(story.description, lang)} Teaches ${values.join(" and ")}. Includes sources, a parent discussion guide and a family action challenge.`,
      `${pick(story.description, lang)} تعلّم ${values.join(" و")}. مع المصادر ودليل نقاش للوالدين وتحدٍّ عائلي.`),
    canonical: `/stories/${story.slug}`,
    image: story.coverImage,
    type: "book",
    alternates: true,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": ["Book", "CreativeWork"],
        name: title,
        alternateName: [story.title.en, story.title.id, story.title.ar].filter((x): x is string => !!x && x !== title),
        description: pick(story.description, lang),
        url: abs(`/stories/${story.slug}`),
        image: story.coverImage,
        inLanguage: LANGS.filter(l => l === "en" || (l === "id" && story.title.id) || (l === "ar" && story.title.ar)),
        genre: cat ? pick(cat.name, lang) : story.category,
        timeRequired: `PT${story.durationMin}M`,
        audience: { "@type": "PeopleAudience", suggestedMinAge: story.ageRange[0], suggestedMaxAge: story.ageRange[1] },
        about: story.values.map(v => ({ "@type": "Thing", name: pick(VALUE_MAP[v].name, lang) })),
        isAccessibleForFree: !story.premium,
        publisher: { "@id": `${SITE_URL}/#organization` },
        citation: story.sources.map(id => SOURCE_MAP[id]?.reference).filter(Boolean),
      },
      breadcrumbs([
        { name: SITE_NAME, path: "/" },
        { name: T(lang, "Cerita", "Stories", "القصص"), path: "/stories" },
        { name: title, path: `/stories/${story.slug}` },
      ]),
    ],
    bodyHtml: `<article><h1>${esc(title)}</h1><p>${esc(pick(story.description, lang))}</p>${first ? `<blockquote>${esc(pick(first.text, lang))}</blockquote>` : ""}
<h2>${esc(T(lang, "Pertanyaan diskusi", "Discussion question", "سؤال للنقاش"))}</h2><p>${esc(pick(story.discussion.questions[0], lang))}</p>
<h2>${esc(T(lang, "Tantangan aksi keluarga", "Family action challenge", "تحدي العمل العائلي"))}</h2><p>${esc(pick(story.discussion.action, lang))}</p>
<p><a href="/onboarding">${esc(T(lang, "Baca cerita lengkap bersama anakmu", "Read the full story with your child", "اقرأ القصة كاملة مع طفلك"))}</a></p></article>`,
  };
}

export function staticMeta(path: "/pricing" | "/30-nights" | "/privacy", lang: Lang): PageMeta {
  const m = {
    "/pricing": {
      title: T(lang, "Harga - Paket Gratis & Keluarga | Kidstorypedia", "Pricing - Free & Family plans | Kidstorypedia", "الأسعار - الخطة المجانية وخطط العائلة | كيدستوريبيديا"),
      description: T(lang,
        "Mulai gratis dengan cerita pengantar tidur Islami untuk anak. Paket Keluarga membuka seluruh perpustakaan, hingga 5 profil anak, panduan diskusi lengkap, dan program musiman. Bebas iklan, batalkan kapan saja.",
        "Start free with Islamic bedtime stories for kids. Family plans unlock the full library, up to 5 child profiles, full discussion guides and seasonal programs. Ad-free, cancel anytime.",
        "ابدأ مجاناً مع قصص إسلامية للأطفال قبل النوم. خطط العائلة تفتح المكتبة كاملة وحتى ٥ ملفات أطفال وأدلة النقاش الكاملة. بلا إعلانات، وإلغاء في أي وقت."),
    },
    "/30-nights": {
      title: T(lang, "30 Malam Kisah Nabi - Program Pengantar Tidur Gratis | Kidstorypedia", "30 Nights of Prophetic Stories - Free Bedtime Program | Kidstorypedia", "٣٠ ليلة من القصص النبوية - برنامج مجاني قبل النوم | كيدستوريبيديا"),
      description: T(lang,
        "Program gratis 30 malam cerita Islami pengantar tidur untuk anak: sebuah cerita, pertanyaan diskusi, dan aksi keluarga kecil setiap malam. Kisah para Nabi, Sirah, dan Sahabat untuk usia 4-12 tahun.",
        "A free 30-night Islamic bedtime stories program for kids: a story, a discussion question and a small family action each night. Prophets, Seerah and Sahabah stories for ages 4–12.",
        "برنامج مجاني لمدة ٣٠ ليلة من القصص الإسلامية قبل النوم: قصة وسؤال نقاش وعمل عائلي صغير كل ليلة."),
    },
    "/privacy": {
      title: T(lang, "Privasi & Keamanan Anak | Kidstorypedia", "Privacy & Child Safety | Kidstorypedia", "الخصوصية وسلامة الأطفال | كيدستوريبيديا"),
      description: T(lang,
        "Bagaimana Kidstorypedia melindungi anak dan keluarga: data minimal, akun dikontrol orang tua, tanpa iklan, persetujuan orang tua, penghapusan dan ekspor.",
        "How Kidstorypedia protects children and families: minimal data, parent-controlled accounts, no advertising, parental consent, deletion and export.",
        "كيف تحمي كيدستوريبيديا الأطفال والعائلات: أقل قدر من البيانات، حسابات بتحكم الوالدين، بلا إعلانات، موافقة الوالدين، الحذف والتصدير."),
    },
  }[path];
  return { ...m, canonical: path, alternates: true, bodyHtml: `<h1>${esc(m.title.split(" | ")[0])}</h1><p>${esc(m.description)}</p>` };
}

/* ─────────────────────────── topic landing pages (PRD §45) ─────────────────────────── */

export interface SeoTopic {
  slug: string;
  /** Primary search phrase the page targets (PRD §45 list). */
  keyword: string;
  title: Localized;
  h1: Localized;
  description: Localized;
  intro: Localized[];
  faq: { q: Localized; a: Localized }[];
  filter: { category?: StoryCategory; bedtime?: boolean; age?: number; values?: ValueId[] };
}

const L3 = (en: string, id: string, ar: string): Localized => ({ en, id, ar });

export const SEO_TOPICS: SeoTopic[] = [
  {
    slug: "islamic-bedtime-stories",
    keyword: "Islamic bedtime stories",
    title: L3("Islamic Bedtime Stories for Kids - Calm Muslim Stories for Sleep", "Dongeng Islami Sebelum Tidur untuk Anak - Cerita Muslim yang Menenangkan", "قصص إسلامية قبل النوم للأطفال - حكايات هادئة للعائلات المسلمة"),
    h1: L3("Islamic bedtime stories", "Dongeng Islami sebelum tidur", "قصص إسلامية قبل النوم"),
    description: L3(
      "Short, calm Islamic bedtime stories for Muslim kids, with a gentle question and a du'a to close the night. Stories of the Prophets and moral tales in 5–10 minutes.",
      "Dongeng Islami sebelum tidur yang singkat dan menenangkan untuk anak Muslim, dengan satu pertanyaan lembut dan doa penutup malam. Kisah Nabi dan cerita moral dalam 5–10 menit.",
      "قصص إسلامية قصيرة وهادئة قبل النوم للأطفال المسلمين، مع سؤال لطيف ودعاء لختام الليلة. قصص الأنبياء وحكايات أخلاقية في ٥–١٠ دقائق."),
    intro: [
      L3("A bedtime story is one of the easiest ways to pass on faith and character. The stories below are short enough for a tired evening, calm enough to settle a child, and each ends with one small question you can ask before the lights go off.",
        "Dongeng sebelum tidur adalah salah satu cara termudah menanamkan iman dan akhlak. Cerita-cerita di bawah cukup singkat untuk malam yang melelahkan, cukup tenang untuk menenangkan anak, dan masing-masing diakhiri satu pertanyaan kecil yang bisa Anda tanyakan sebelum lampu dimatikan.",
        "قصة ما قبل النوم من أسهل الطرق لغرس الإيمان والأخلاق. القصص أدناه قصيرة بما يناسب مساءً متعباً، وهادئة بما يكفي لتهدئة الطفل، وتنتهي كل منها بسؤال صغير قبل إطفاء الأنوار."),
      L3("Canonical stories are drafted from the Qur'an, hadith and sirah and cite their sources on every page, so you always know where a story comes from. Switch the reader to Bedtime mode for a dim, warm screen.",
        "Cerita kanonik disusun dari Al-Qur'an, hadis, dan sirah serta mencantumkan sumbernya di setiap halaman, sehingga Anda selalu tahu asal cerita. Gunakan Mode Tidur di pembaca untuk layar yang redup dan hangat.",
        "القصص الأساسية مأخوذة من القرآن والحديث والسيرة وتذكر مصادرها في كل صفحة. استخدم وضع وقت النوم في القارئ لشاشة خافتة ودافئة."),
    ],
    faq: [
      { q: L3("How long is each bedtime story?", "Berapa lama setiap dongeng sebelum tidur?", "كم مدة كل قصة؟"), a: L3("Most take 5–10 minutes to read aloud, including the closing question.", "Sebagian besar memakan waktu 5–10 menit dibacakan, termasuk pertanyaan penutup.", "معظمها يستغرق ٥–١٠ دقائق للقراءة بصوت عالٍ مع السؤال الختامي.") },
      { q: L3("Are the stories free?", "Apakah ceritanya gratis?", "هل القصص مجانية؟"), a: L3("Several stories are free forever; Family Premium unlocks the full library.", "Beberapa cerita gratis selamanya; Paket Keluarga Premium membuka seluruh perpustakaan.", "عدة قصص مجانية دائماً، والخطة العائلية تفتح المكتبة كاملة.") },
    ],
    filter: { bedtime: true },
  },
  {
    slug: "prophet-stories-for-kids",
    keyword: "stories of the prophets for kids",
    title: L3("Stories of the Prophets for Kids - Qur'an-Based, With Sources", "Kisah Para Nabi untuk Anak - Berdasarkan Al-Qur'an, Lengkap dengan Sumber", "قصص الأنبياء للأطفال - مستندة إلى القرآن مع المصادر"),
    h1: L3("Stories of the Prophets for kids", "Kisah para Nabi untuk anak", "قصص الأنبياء للأطفال"),
    description: L3(
      "Stories of the Prophets for kids: Yusuf, Nuh, Yunus, Ibrahim, Musa and Sulaiman, retold for ages 4–12 from the Qur'an with sources cited and no depiction of Prophets.",
      "Kisah para Nabi untuk anak: Yusuf, Nuh, Yunus, Ibrahim, Musa, dan Sulaiman, diceritakan ulang untuk usia 4–12 dari Al-Qur'an dengan sumber dan tanpa menggambarkan sosok Nabi.",
      "قصص الأنبياء للأطفال: يوسف ونوح ويونس وإبراهيم وموسى وسليمان، مروية لأعمار ٤–١٢ من القرآن مع ذكر المصادر ودون تصوير الأنبياء."),
    intro: [
      L3("The Qur'an calls the story of Yusuf 'the best of stories'. Prophet stories give children real heroes of patience, courage and trust in Allah. Each story here is retold in simple words from the Qur'an and cites the verses it draws from.",
        "Al-Qur'an menyebut kisah Yusuf sebagai 'kisah yang paling baik'. Kisah para Nabi memberi anak teladan nyata tentang sabar, berani, dan tawakal kepada Allah. Setiap cerita di sini diceritakan ulang dengan bahasa sederhana dari Al-Qur'an dan mencantumkan ayat sumbernya.",
        "يصف القرآن قصة يوسف بأنها أحسن القصص. تمنح قصص الأنبياء الأطفال قدوات حقيقية في الصبر والشجاعة والتوكل. كل قصة هنا مروية بكلمات بسيطة من القرآن مع ذكر الآيات."),
      L3("Out of respect, Prophets are never drawn and no words are put in their mouths beyond the cited texts. Illustrations show places, nature and objects.",
        "Sebagai bentuk penghormatan, para Nabi tidak pernah digambar dan tidak ada ucapan yang dinisbatkan kepada mereka di luar teks yang dikutip. Ilustrasi menampilkan tempat, alam, dan benda.",
        "احتراماً، لا يُرسم الأنبياء ولا يُنسب إليهم قول خارج النصوص المذكورة. تُظهر الرسوم الأماكن والطبيعة والأشياء."),
    ],
    faq: [
      { q: L3("Which Prophets are covered?", "Nabi siapa saja yang diceritakan?", "أي الأنبياء تشملهم القصص؟"), a: L3("Yusuf, Nuh, Yunus, Ibrahim and Ismail, Musa and Sulaiman, with more in review.", "Yusuf, Nuh, Yunus, Ibrahim dan Ismail, Musa, dan Sulaiman, dengan cerita lain sedang ditinjau.", "يوسف ونوح ويونس وإبراهيم وإسماعيل وموسى وسليمان، وقصص أخرى قيد المراجعة.") },
      { q: L3("Are the stories reviewed?", "Apakah ceritanya ditinjau?", "هل تتم مراجعة القصص؟"), a: L3("Yes. Stories move through source, editorial and scholar review; stories still in review are labelled.", "Ya. Cerita melalui peninjauan sumber, editorial, dan ulama; cerita yang masih ditinjau diberi label.", "نعم، تمر القصص بمراجعة المصادر والتحرير والمراجعة العلمية، والقصص قيد المراجعة موسومة.") },
    ],
    filter: { category: "prophets" },
  },
  {
    slug: "islamic-stories-for-5-year-olds",
    keyword: "Islamic stories for 5 year olds",
    title: L3("Islamic Stories for 5 Year Olds - Simple, Short & Gentle", "Cerita Islami untuk Anak 5 Tahun - Sederhana, Singkat & Lembut", "قصص إسلامية لعمر ٥ سنوات - بسيطة وقصيرة ولطيفة"),
    h1: L3("Islamic stories for 5 year olds", "Cerita Islami untuk anak 5 tahun", "قصص إسلامية لطفل في الخامسة"),
    description: L3(
      "Islamic stories for 5 year olds with short sentences, big pictures and one easy question per story. Age-adapted text makes Prophet stories and moral tales easy for little ones.",
      "Cerita Islami untuk anak 5 tahun dengan kalimat pendek, gambar besar, dan satu pertanyaan mudah per cerita. Teks yang disesuaikan usia membuat kisah Nabi dan cerita moral mudah dipahami si kecil.",
      "قصص إسلامية لطفل في الخامسة بجمل قصيرة وصور كبيرة وسؤال سهل لكل قصة. النص المكيّف للعمر يجعل قصص الأنبياء والحكايات الأخلاقية سهلة للصغار."),
    intro: [
      L3("At five, children remember stories through pictures, repetition and feelings. When you set your child's age, the reader automatically switches to a simpler version of each page with shorter sentences.",
        "Di usia lima tahun, anak mengingat cerita lewat gambar, pengulangan, dan perasaan. Saat Anda mengatur usia anak, pembaca otomatis menampilkan versi halaman yang lebih sederhana dengan kalimat lebih pendek.",
        "في الخامسة يتذكر الأطفال القصص بالصور والتكرار والمشاعر. عند تحديد عمر طفلك يعرض القارئ تلقائياً نسخة أبسط من كل صفحة بجمل أقصر."),
      L3("Try the Picture book reading style: full-screen illustrations and a swipe to turn the page, made for small hands.",
        "Coba gaya pembaca Buku Bergambar: ilustrasi layar penuh dan geser untuk membalik halaman, dibuat untuk tangan kecil.",
        "جرّب نمط الكتاب المصوّر: رسوم بملء الشاشة وسحب لتقليب الصفحة، مصمم للأيدي الصغيرة."),
    ],
    faq: [
      { q: L3("Is it safe for a 5 year old to use alone?", "Apakah aman digunakan anak 5 tahun sendirian?", "هل هو آمن لطفل في الخامسة بمفرده؟"), a: L3("The kids view has no ads, no chat and no links out; a parent PIN guards everything else.", "Tampilan anak tanpa iklan, tanpa obrolan, dan tanpa tautan keluar; PIN orang tua menjaga bagian lainnya.", "واجهة الأطفال بلا إعلانات ولا دردشة ولا روابط خارجية، ورقم سري للوالدين يحمي الباقي.") },
    ],
    filter: { age: 5 },
  },
  {
    slug: "islamic-stories-for-7-year-olds",
    keyword: "Islamic stories for 7 year olds",
    title: L3("Islamic Stories for 7 Year Olds - Prophets, Seerah & Sahabah", "Cerita Islami untuk Anak 7 Tahun - Nabi, Sirah & Sahabat", "قصص إسلامية لعمر ٧ سنوات - الأنبياء والسيرة والصحابة"),
    h1: L3("Islamic stories for 7 year olds", "Cerita Islami untuk anak 7 tahun", "قصص إسلامية لطفل في السابعة"),
    description: L3(
      "Islamic stories for 7 year olds: Prophet stories, Seerah and Sahabah stories with a short quiz, a discussion guide and a real-life family challenge after each story.",
      "Cerita Islami untuk anak 7 tahun: kisah Nabi, Sirah, dan Sahabat dengan kuis singkat, panduan diskusi, dan tantangan keluarga di kehidupan nyata setelah setiap cerita.",
      "قصص إسلامية لطفل في السابعة: قصص الأنبياء والسيرة والصحابة مع اختبار قصير ودليل نقاش وتحدٍّ عائلي واقعي بعد كل قصة."),
    intro: [
      L3("Seven is when children start asking 'why'. These stories are chosen for that stage: real people making real choices, from the Prophet ﷺ at Ta'if choosing mercy to 'Uthman buying a well for everyone.",
        "Usia tujuh tahun adalah saat anak mulai bertanya 'mengapa'. Cerita-cerita ini dipilih untuk tahap itu: orang-orang nyata yang membuat pilihan nyata, dari Nabi ﷺ di Thaif yang memilih kasih sayang hingga Utsman yang membeli sumur untuk semua orang.",
        "في السابعة يبدأ الأطفال بالسؤال «لماذا». اخترنا هذه القصص لتلك المرحلة: أناس حقيقيون يتخذون قرارات حقيقية، من النبي ﷺ في الطائف يختار الرحمة إلى عثمان يشتري بئراً للجميع."),
      L3("After each story, a short quiz checks understanding and a three-question discussion guide helps you turn it into a real conversation.",
        "Setelah setiap cerita, kuis singkat memeriksa pemahaman dan panduan diskusi tiga pertanyaan membantu Anda mengubahnya menjadi percakapan nyata.",
        "بعد كل قصة يتحقق اختبار قصير من الفهم، ويساعدك دليل نقاش من ثلاثة أسئلة على تحويلها إلى حوار حقيقي."),
    ],
    faq: [
      { q: L3("Do the stories come with questions?", "Apakah ceritanya dilengkapi pertanyaan?", "هل تأتي القصص مع أسئلة؟"), a: L3("Yes: a comprehension quiz for the child and three discussion questions for the parent.", "Ya: kuis pemahaman untuk anak dan tiga pertanyaan diskusi untuk orang tua.", "نعم: اختبار فهم للطفل وثلاثة أسئلة نقاش للوالد.") },
    ],
    filter: { age: 7 },
  },
  {
    slug: "islamic-moral-stories",
    keyword: "Islamic moral stories",
    title: L3("Islamic Moral Stories for Kids - Honesty, Kindness, Gratitude", "Cerita Moral Islami untuk Anak - Jujur, Baik Hati, Bersyukur", "قصص أخلاقية إسلامية للأطفال - الصدق واللطف والشكر"),
    h1: L3("Islamic moral stories for kids", "Cerita moral Islami untuk anak", "قصص أخلاقية إسلامية للأطفال"),
    description: L3(
      "Islamic moral stories that teach honesty, kindness, gratitude, patience and responsibility, each with a small family action challenge to practise the value the next day.",
      "Cerita moral Islami yang mengajarkan kejujuran, kebaikan, syukur, sabar, dan tanggung jawab, masing-masing dengan tantangan aksi keluarga kecil untuk mempraktikkan nilainya keesokan hari.",
      "قصص أخلاقية إسلامية تعلّم الصدق واللطف والشكر والصبر والمسؤولية، مع تحدٍّ عائلي صغير لممارسة القيمة في اليوم التالي."),
    intro: [
      L3("Moral stories work best when the value leaves the page. Every story here ends with a family action challenge, such as keeping one promise today, so children practise what they heard.",
        "Cerita moral paling berhasil ketika nilainya keluar dari halaman. Setiap cerita di sini diakhiri tantangan aksi keluarga, misalnya menepati satu janji hari ini, agar anak mempraktikkan apa yang mereka dengar.",
        "تنجح القصص الأخلاقية حين تخرج القيمة من الصفحة. تنتهي كل قصة هنا بتحدٍّ عائلي، مثل الوفاء بوعد واحد اليوم، ليمارس الأطفال ما سمعوه."),
      L3("Original fables are clearly labelled as fiction and never attribute sayings to the Prophet ﷺ.",
        "Fabel orisinal diberi label jelas sebagai fiksi dan tidak pernah menisbatkan ucapan kepada Nabi ﷺ.",
        "الحكايات الأصلية موسومة بوضوح كخيال، ولا تنسب أقوالاً إلى النبي ﷺ."),
    ],
    faq: [
      { q: L3("Which values do the stories teach?", "Nilai apa saja yang diajarkan?", "ما القيم التي تعلّمها القصص؟"), a: L3("Twelve core values, including honesty, patience, gratitude, courage, kindness and trustworthiness (amanah).", "Dua belas nilai inti, termasuk kejujuran, sabar, syukur, keberanian, kebaikan, dan amanah.", "اثنتا عشرة قيمة أساسية منها الصدق والصبر والشكر والشجاعة واللطف والأمانة.") },
    ],
    filter: { category: "moral" },
  },
  {
    slug: "ramadan-stories-for-kids",
    keyword: "Ramadan stories for kids",
    title: L3("Ramadan Stories for Kids - Generosity, Gratitude & Patience", "Cerita Ramadan untuk Anak - Dermawan, Syukur & Sabar", "قصص رمضان للأطفال - الكرم والشكر والصبر"),
    h1: L3("Stories for Ramadan evenings", "Cerita untuk malam-malam Ramadan", "قصص لليالي رمضان"),
    description: L3(
      "Islamic stories for kids to read during Ramadan: generosity, gratitude and patience from the Prophets and Sahabah, plus a 30-night family routine.",
      "Cerita Islami untuk anak dibaca selama Ramadan: kedermawanan, syukur, dan sabar dari kisah para Nabi dan Sahabat, ditambah rutinitas keluarga 30 malam.",
      "قصص إسلامية للأطفال لقراءتها في رمضان: الكرم والشكر والصبر من قصص الأنبياء والصحابة، مع روتين عائلي لثلاثين ليلة."),
    intro: [
      L3("Ramadan is a month of giving, thankfulness and patience, and these are exactly the values in the stories below: Abu Bakr giving everything, 'Uthman's free well, and the grateful ant.",
        "Ramadan adalah bulan memberi, bersyukur, dan bersabar, dan itulah nilai-nilai dalam cerita di bawah: Abu Bakar yang memberikan segalanya, sumur gratis Utsman, dan semut yang bersyukur.",
        "رمضان شهر العطاء والشكر والصبر، وهي بالضبط قيم القصص أدناه: أبو بكر يعطي كل شيء، وبئر عثمان المجانية، والنملة الشاكرة."),
      L3("Pair them with our free 30 Nights guide: one story, one question and one du'a after tarawih or before sleep.",
        "Padukan dengan panduan gratis 30 Malam kami: satu cerita, satu pertanyaan, dan satu doa setelah tarawih atau sebelum tidur.",
        "اجمعها مع دليل ٣٠ ليلة المجاني: قصة وسؤال ودعاء بعد التراويح أو قبل النوم."),
    ],
    faq: [
      { q: L3("Is there a Ramadan program?", "Apakah ada program Ramadan?", "هل يوجد برنامج رمضاني؟"), a: L3("Yes, seasonal family programs run with daily stories and actions; the first 7 days are free.", "Ya, program keluarga musiman berisi cerita dan aksi harian; 7 hari pertama gratis.", "نعم، برامج عائلية موسمية بقصص وأعمال يومية، والأيام السبعة الأولى مجانية.") },
    ],
    filter: { values: ["generosity", "gratitude", "patience"] },
  },
  {
    slug: "islamic-character-education",
    keyword: "Islamic character education",
    title: L3("Islamic Character Education for Kids - Stories, Talks & Practice", "Pendidikan Akhlak Islami untuk Anak - Cerita, Dialog & Praktik", "التربية الأخلاقية الإسلامية للأطفال - قصص وحوار وممارسة"),
    h1: L3("Islamic character education at home", "Pendidikan akhlak Islami di rumah", "التربية الأخلاقية الإسلامية في البيت"),
    description: L3(
      "A simple Islamic character education loop for families and schools: read a story, discuss three questions, practise one value, and record it in a character journal. No scores.",
      "Siklus pendidikan akhlak Islami yang sederhana untuk keluarga dan sekolah: baca cerita, diskusikan tiga pertanyaan, praktikkan satu nilai, dan catat di jurnal akhlak. Tanpa skor.",
      "حلقة بسيطة للتربية الأخلاقية الإسلامية للعائلات والمدارس: اقرأ قصة، ناقش ثلاثة أسئلة، مارس قيمة، وسجّلها في دفتر الأخلاق. بلا درجات."),
    intro: [
      L3("Character grows through practice, not points. Kidstorypedia follows one loop: discover a story, read it together, talk about it, try the value in real life, and reflect.",
        "Akhlak tumbuh melalui praktik, bukan poin. Kidstorypedia mengikuti satu siklus: temukan cerita, baca bersama, bicarakan, coba nilainya di kehidupan nyata, lalu renungkan.",
        "تنمو الأخلاق بالممارسة لا بالنقاط. يتبع كيدستوريبيديا حلقة واحدة: اكتشف قصة، اقرأها معاً، تحدثوا عنها، جرّبوا القيمة في الحياة، ثم تأمّلوا."),
      L3("The Character Journal records what your family actually did, such as 'kept a promise' or 'forgave a sibling', instead of scoring a child's character. Teachers can use the same stories in class.",
        "Jurnal Akhlak mencatat apa yang benar-benar dilakukan keluarga Anda, seperti 'menepati janji' atau 'memaafkan saudara', bukan memberi skor pada akhlak anak. Guru dapat menggunakan cerita yang sama di kelas.",
        "يسجّل دفتر الأخلاق ما فعلته عائلتك فعلاً، مثل «وفى بوعد» أو «سامح أخاه»، بدلاً من تقييم أخلاق الطفل بالدرجات. ويمكن للمعلمين استخدام القصص نفسها في الصف."),
    ],
    faq: [
      { q: L3("Can schools use Kidstorypedia?", "Apakah sekolah bisa menggunakan Kidstorypedia?", "هل يمكن للمدارس استخدامه؟"), a: L3("Yes. Classroom mode adds assignments, group discussion guides and a projector view.", "Bisa. Mode Kelas menambahkan tugas, panduan diskusi kelompok, dan tampilan proyektor.", "نعم، وضع الفصل يضيف المهام وأدلة النقاش الجماعي وعرضاً للجهاز العارض.") },
    ],
    filter: {},
  },
];

export function topicStories(t: SeoTopic): Story[] {
  const f = t.filter;
  return publicStories().filter(s =>
    (!f.category || s.category === f.category) &&
    (!f.bedtime || !!s.bedtime) &&
    (f.age === undefined || (s.ageRange[0] <= f.age && s.ageRange[1] >= f.age)) &&
    (!f.values || s.values.some(v => f.values!.includes(v))));
}

export function topicMeta(t: SeoTopic, lang: Lang): PageMeta {
  const stories = topicStories(t);
  const h1 = pick(t.h1, lang);
  return {
    title: `${pick(t.title, lang)} | ${SITE_NAME}`,
    description: pick(t.description, lang),
    canonical: `/${t.slug}`,
    type: "article",
    alternates: true,
    image: stories[0]?.coverImage,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: h1,
        description: pick(t.description, lang),
        url: abs(`/${t.slug}`),
        inLanguage: lang,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: storyListLd(h1, stories, lang),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: t.faq.map(f => ({ "@type": "Question", name: pick(f.q, lang), acceptedAnswer: { "@type": "Answer", text: pick(f.a, lang) } })),
      },
      breadcrumbs([{ name: SITE_NAME, path: "/" }, { name: h1, path: `/${t.slug}` }]),
    ],
    bodyHtml: `<article><h1>${esc(h1)}</h1>${t.intro.map(p => `<p>${esc(pick(p, lang))}</p>`).join("")}${storyLinksHtml(stories, lang)}
${t.faq.map(f => `<h2>${esc(pick(f.q, lang))}</h2><p>${esc(pick(f.a, lang))}</p>`).join("")}</article>`,
  };
}

/** Routes that must never be indexed (private, per-family or internal). */
export const NOINDEX_PREFIXES = ["/dashboard", "/child", "/story/", "/studio", "/admin", "/onboarding", "/join"];
