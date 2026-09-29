import { useEffect } from "react";

export interface SeoOptions {
  title: string;
  description?: string;
  /** Absolute or root-relative path; defaults to current location */
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "book";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE = "Kidstorypedia";

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
 * Sets document title, meta description, Open Graph tags, canonical link and
 * an optional JSON-LD script. Everything it adds is removed (and everything it
 * changed is restored) on unmount so pages don't leak SEO tags into each other.
 */
export function useSeo(opts: SeoOptions) {
  const key = JSON.stringify(opts);
  useEffect(() => {
    const created: Element[] = [];
    const previous = new Map<Element, string | null>();
    const prevTitle = document.title;
    document.title = opts.title;

    const url = opts.canonical
      ? new URL(opts.canonical, window.location.origin).toString()
      : window.location.origin + window.location.pathname;

    if (opts.description) {
      upsertMeta("name", "description", opts.description, created, previous);
      upsertMeta("property", "og:description", opts.description, created, previous);
      upsertMeta("name", "twitter:description", opts.description, created, previous);
    }
    upsertMeta("property", "og:title", opts.title, created, previous);
    upsertMeta("property", "og:type", opts.type || "website", created, previous);
    upsertMeta("property", "og:url", url, created, previous);
    upsertMeta("property", "og:site_name", SITE, created, previous);
    upsertMeta("name", "twitter:card", opts.image ? "summary_large_image" : "summary", created, previous);
    upsertMeta("name", "twitter:title", opts.title, created, previous);
    if (opts.image) {
      upsertMeta("property", "og:image", opts.image, created, previous);
      upsertMeta("name", "twitter:image", opts.image, created, previous);
    }

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

    if (opts.jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "page");
      script.textContent = JSON.stringify(opts.jsonLd);
      document.head.appendChild(script);
      created.push(script);
    }

    return () => {
      document.title = prevTitle;
      created.forEach(el => el.remove());
      previous.forEach((val, el) => (val === null ? el.removeAttribute("content") : el.setAttribute("content", val)));
      if (prevCanonical !== null && canonical && canonical.isConnected) canonical.setAttribute("href", prevCanonical);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
