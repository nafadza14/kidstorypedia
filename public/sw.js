/* Kidstorypedia offline service worker (PRD §59 offline PWA).
 * App shell: network-first for navigations (falls back to the cached app shell).
 * Static assets & images: stale-while-revalidate. /api is never cached. */
const CACHE = "ksp-v3";
const SHELL = ["/app", "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("/app", copy)); return res; })
        .catch(() => caches.match("/app"))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req)
        .then(res => {
          if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
