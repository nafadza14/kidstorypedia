/**
 * Post-build SEO step (PRD §45). Runs after `vite build`:
 *
 *  - writes a static HTML file per public route with its own <title>,
 *    description, canonical, hreflang, Open Graph and JSON-LD, plus a short
 *    text body, so crawlers and link previews (WhatsApp, Facebook, X) see the
 *    right content without running JavaScript. React replaces the body on load.
 *  - keeps a clean copy of the SPA shell as `app.html` (served at /app via
 *    cleanUrls) that vercel.json rewrites every other route to.
 *  - generates `sitemap.xml` (with hreflang alternates) and `robots.txt`.
 *
 * Usage: tsx scripts/prerender.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LANGS, NOINDEX_PREFIXES, OG_LOCALE, SEO_TOPICS, SITE_URL, DEFAULT_IMAGE, abs,
  homeMeta, publicStories, staticMeta, storiesIndexMeta, storyMeta, topicMeta,
  type PageMeta,
} from "../src/lib/seo";
import type { Lang } from "../src/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const LANG: Lang = "id"; // primary market; other languages via ?lang= + hreflang

const template = readFileSync(join(dist, "index.html"), "utf8");
if (!template.includes("<!--seo:start-->") || !template.includes("<!--seo:body-->")) {
  throw new Error("dist/index.html is missing the <!--seo:start--> / <!--seo:body--> markers");
}

const attr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function head(m: PageMeta): string {
  const url = abs(m.canonical);
  const image = m.image ? abs(m.image) : DEFAULT_IMAGE;
  const tags = [
    `<title>${attr(m.title)}</title>`,
    `<meta name="description" content="${attr(m.description)}" />`,
    `<meta name="robots" content="${m.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...(m.alternates ? [...LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${url}?lang=${l}" />`), `<link rel="alternate" hreflang="x-default" href="${url}" />`] : []),
    `<meta property="og:type" content="${m.type || "website"}" />`,
    `<meta property="og:site_name" content="Kidstorypedia" />`,
    `<meta property="og:title" content="${attr(m.title)}" />`,
    `<meta property="og:description" content="${attr(m.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${attr(image)}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[LANG]}" />`,
    ...LANGS.filter(l => l !== LANG).map(l => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(m.title)}" />`,
    `<meta name="twitter:description" content="${attr(m.description)}" />`,
    `<meta name="twitter:image" content="${attr(image)}" />`,
    ...(m.jsonLd || []).map(j => `<script type="application/ld+json" data-seo="prerender">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`),
  ];
  return tags.join("\n    ");
}

const STATIC_STYLE = `<style>.seo-static{max-width:760px;margin:0 auto;padding:96px 20px 40px;color:#e4e4e7;background:#0a0a0c;font:16px/1.6 system-ui,sans-serif}.seo-static a{color:#fff}.seo-static h1{font-weight:300;font-size:2rem;line-height:1.15;color:#fff}</style>`;

function render(m: PageMeta): string {
  return template
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, head(m))
    .replace("<!--seo:body-->", `${STATIC_STYLE}<div class="seo-static">${m.bodyHtml || ""}</div>`);
}

function write(path: string, html: string) {
  // vercel.json `cleanUrls` serves /stories/foo from stories/foo.html
  const file = path === "/" ? join(dist, "index.html") : join(dist, `${path.replace(/^\//, "")}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// 1. clean SPA shell for every non-prerendered route (vercel.json rewrites here)
writeFileSync(join(dist, "app.html"), template.replace("<!--seo:body-->", ""));

// 2. prerendered public pages
const pages: PageMeta[] = [
  homeMeta(LANG),
  storiesIndexMeta(LANG),
  ...publicStories().map(s => storyMeta(s, LANG)),
  ...SEO_TOPICS.map(t => topicMeta(t, LANG)),
  staticMeta("/pricing", LANG),
  staticMeta("/30-nights", LANG),
  staticMeta("/privacy", LANG),
];
for (const m of pages) write(m.canonical, render(m));

// 3. sitemap.xml with hreflang alternates
const today = new Date().toISOString().slice(0, 10);
const priority = (p: string) => (p === "/" ? "1.0" : p === "/stories" ? "0.9" : p.startsWith("/stories/") ? "0.8" : SEO_TOPICS.some(t => `/${t.slug}` === p) ? "0.8" : "0.5");
const urls = [...pages.map(m => m.canonical), "/classroom"];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(p => {
  const loc = abs(p);
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.startsWith("/stories/") ? "monthly" : "weekly"}</changefreq>
    <priority>${priority(p)}</priority>
${LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${loc}?lang=${l}" />`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
  </url>`;
}).join("\n")}
</urlset>
`;
writeFileSync(join(dist, "sitemap.xml"), sitemap);

// 4. robots.txt
const robots = `# Kidstorypedia - ${SITE_URL}
User-agent: *
Allow: /
${NOINDEX_PREFIXES.map(p => `Disallow: ${p}`).join("\n")}
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
writeFileSync(join(dist, "robots.txt"), robots);

console.log(`[prerender] ${pages.length} pages, sitemap with ${urls.length} URLs, robots.txt`);
