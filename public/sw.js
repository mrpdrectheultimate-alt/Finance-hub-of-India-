// ============================================================
// FinanceHub — Service Worker
// public/sw.js
// Version 4: Zero stale HTML navigations, safe caching for static assets only.
// Excludes all authentication, API, contact, and navigation routes.
// ============================================================

const CACHE_NAME   = "financehub-v4";
const STATIC_CACHE = "financehub-static-v4";

// Only precache offline fallback and essential icons
const PRECACHE_URLS = [
  "/offline",
  "/manifest.json",
  "/logo-horizontal.png",
  "/logo-square.png",
];

// ─── Install: pre-cache static assets ────────────────────────
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn("Pre-cache notice:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate: clean old caches immediately ───────────────────
self.addEventListener("activate", event => {
  const VALID_CACHES = [CACHE_NAME, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => !VALID_CACHES.includes(name))
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: routing strategies ───────────────────────────────
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // NEVER cache navigations (HTML pages) — always fetch fresh from network
  if (request.mode === "navigate") return;

  // Skip all API routes and authentication flows
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/contact") ||
    url.pathname.startsWith("/dashboard")
  ) {
    return;
  }

  // Next.js hashed static assets (/ _next/static/...) — safe to cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Static images and fonts in public directory
  if (
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(networkFirstWithCache(request, STATIC_CACHE));
    return;
  }
});

// ─── Caching strategies ───────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 408 });
  }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response("", { status: 408 });
  }
}
