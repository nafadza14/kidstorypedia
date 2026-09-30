import { useEffect } from "react";
import { DEFAULT_IMAGE, LANGS, OG_LOCALE, SITE_NAME, abs } from "@/lib/seo";
import type { Lang } from "@/types";

export interface SeoOptions {
  title: string;
  description?: string;
  /** Root-relative path (resolved against https://kidstorypedia.com); defaults to current path */
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "book";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Emit hreflang alternates (?lang=id|en|ar + x-default). */
  alternates?: boolean;
  noindex?: boolean;
  /** Current UI language, for og:locale. */
  lang?: Lang;
}

function upsertMeta(attr: "name" | "property", key: string, content: string, created: Element[], previous: Map<Element, string | null>) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
    created.push(el);
  } else if (!previous.has(el)) {
    previous.set(el, el.getAttribute("content"));
  }
  el.setAttribute("content", content);
}

/**
 * Sets document title, meta description, Open Graph / Twitter tags, the
 * canonical link (always on kidstorypedia.com), hreflang alternates, robots and
 * JSON-LD. Everything it adds is removed (and everything it changed is
 * restored) on unmount so pages don't leak SEO tags into each other.
 */
export function useSeo(opts: SeoOptions) {
  const key = JSON.stringify(opts);
  useEffect(() => {
    const created: Element[] = [];
    const previous = new Map<Element, string | null>();
    const prevTitle = document.title;
    document.title = opts.title;

    const path = opts.canonical || window.location.pathname;
    const url = abs(path);
    const image = opts.image ? abs(opts.image) : DEFAULT_IMAGE;

    if (opts.description) {
      upsertMeta("name", "description", opts.description, created, previous);
      upsertMeta("property", "og:description", opts.description, created, previous);
      upsertMeta("name", "twitter:description", opts.description, created, previous);
    }
    upsertMeta("name", "robots", opts.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large", created, previous);
    upsertMeta("property", "og:title", opts.title, created, previous);
    upsertMeta("property", "og:type", opts.type || "website", created, previous);
    upsertMeta("property", "og:url", url, created, previous);
    upsertMeta("property", "og:site_name", SITE_NAME, created, previous);
    upsertMeta("property", "og:image", image, created, previous);
    if (opts.lang) upsertMeta("property", "og:locale", OG_LOCALE[opts.lang], created, previous);
    upsertMeta("name", "twitter:card", "summary_large_image", created, previous);
    upsertMeta("name", "twitter:title", opts.title, created, previous);
    upsertMeta("name", "twitter:image", image, created, previous);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    let prevCanonical: string | null = null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
      created.push(canonical);
    } else {
      prevCanonical = canonical.getAttribute("href");
    }
    canonical.href = url;

    // replace any static hreflang links with this page's set
    const staticAlts = Array.from(document.head.querySelectorAll('link[rel="alternate"][hreflang]'));
    staticAlts.forEach(el => el.remove());
    if (opts.alternates && !opts.noindex) {
      for (const l of [...LANGS, "x-default" as const]) {
        const link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = l;
        link.href = l === "x-default" ? url : `${url}${url.includes("?") ? "&" : "?"}lang=${l}`;
        document.head.appendChild(link);
        created.push(link);
      }
    }

    const ld = opts.jsonLd ? (Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd]) : [];
    // drop prerendered page JSON-LD so it isn't duplicated
    document.head.querySelectorAll('script[type="application/ld+json"][data-seo="prerender"]').forEach(el => el.remove());
    for (const obj of ld) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "page");
      script.textContent = JSON.stringify(obj);
      document.head.appendChild(script);
      created.push(script);
    }

    return () => {
      document.title = prevTitle;
      created.forEach(el => el.remove());
      staticAlts.forEach(el => document.head.appendChild(el));
      previous.forEach((val, el) => (val === null ? el.removeAttribute("content") : el.setAttribute("content", val)));
      if (prevCanonical !== null && canonical && canonical.isConnected) canonical.setAttribute("href", prevCanonical);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
