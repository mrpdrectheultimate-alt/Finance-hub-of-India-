// ============================================================
// FinanceHub — Service Worker
// public/sw.js
// Offline-first caching for lessons, assets, and static pages
// ============================================================

const CACHE_NAME    = "financehub-v1";
const STATIC_CACHE  = "financehub-static-v1";
const LESSON_CACHE  = "financehub-lessons-v1";
const API_CACHE     = "financehub-api-v1";

// ─── Static assets to pre-cache on install ───────────────────
const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/explore",
  "/glossary",
  "/practice/sip",
  "/practice/emi",
  "/practice/tax",
  "/offline",
  "/manifest.json",
];

// ─── Install: pre-cache static assets ────────────────────────
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn("Pre-cache failed for some URLs:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate: clean old caches ──────────────────────────────
self.addEventListener("activate", event => {
  const VALID_CACHES = [CACHE_NAME, STATIC_CACHE, LESSON_CACHE, API_CACHE];
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

  // Skip non-GET, cross-origin, and auth requests
  if (request.method !== "GET") return;
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // Don't cache API calls by default
  if (url.pathname.startsWith("/_next/")) {
    // Next.js static assets — cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Lesson pages — stale-while-revalidate (show cached, update in background)
  if (url.pathname.startsWith("/learn/")) {
    event.respondWith(staleWhileRevalidate(request, LESSON_CACHE));
    return;
  }

  // Glossary, explore, simulators — network first with cache fallback
  if (
    url.pathname.startsWith("/glossary") ||
    url.pathname.startsWith("/explore") ||
    url.pathname.startsWith("/practice/")
  ) {
    event.respondWith(networkFirstWithCache(request, STATIC_CACHE));
    return;
  }

  // Everything else — network first
  event.respondWith(networkFirstWithCache(request, CACHE_NAME));
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
    return offlinePage();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache   = await caches.open(cacheName);
  const cached  = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || await fetchPromise || offlinePage();
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
    return cached || offlinePage();
  }
}

function offlinePage() {
  return caches.match("/offline") || new Response(
    `<!DOCTYPE html>
    <html>
    <head><title>Offline — FinanceHub</title></head>
    <body style="font-family:system-ui;text-align:center;padding:60px 20px;color:#1c2b3a">
      <div style="font-size:60px;margin-bottom:20px">📚</div>
      <h1 style="font-size:24px;margin-bottom:10px">You're offline</h1>
      <p style="color:#718096;margin-bottom:24px">
        Connect to the internet to continue learning.
        Your progress is saved and will sync when you reconnect.
      </p>
      <a href="/dashboard" style="display:inline-block;padding:12px 24px;background:#0E6163;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">
        Try Again
      </a>
    </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

// ─── Background sync for offline actions ──────────────────────
self.addEventListener("sync", event => {
  if (event.tag === "sync-progress") {
    event.waitUntil(syncOfflineProgress());
  }
  if (event.tag === "sync-notes") {
    event.waitUntil(syncOfflineNotes());
  }
});

async function syncOfflineProgress() {
  // Get queued progress updates from IndexedDB and send to Supabase
  const db      = await openDB();
  const updates = await getAllFromStore(db, "pending-progress");
  for (const update of updates) {
    try {
      await fetch("/api/complete-lesson", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(update),
      });
      await deleteFromStore(db, "pending-progress", update.id);
    } catch {
      break; // Still offline, try again later
    }
  }
}

async function syncOfflineNotes() {
  const db    = await openDB();
  const notes = await getAllFromStore(db, "pending-notes");
  for (const note of notes) {
    try {
      await fetch("/api/notes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(note),
      });
      await deleteFromStore(db, "pending-notes", note.id);
    } catch {
      break;
    }
  }
}

// ─── Push notifications ───────────────────────────────────────
self.addEventListener("push", event => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { data = { title: "FinanceHub", body: event.data.text() }; }

  const options = {
    body:    data.body  || "You have a new notification",
    icon:    data.icon  || "/icons/icon-192x192.png",
    badge:   "/icons/badge-72x72.png",
    tag:     data.tag   || "financehub-notification",
    data:    { url: data.url || "/dashboard" },
    actions: data.actions || [],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "FinanceHub", options)
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ─── IndexedDB helpers ────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("financehub-offline", 1);
    request.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("pending-progress")) {
        db.createObjectStore("pending-progress", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pending-notes")) {
        db.createObjectStore("pending-notes", { keyPath: "id" });
      }
    };
    request.onsuccess  = e => resolve(e.target.result);
    request.onerror    = e => reject(e.target.error);
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(storeName, "readonly");
    const store   = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = e => resolve(e.target.result);
    request.onerror   = e => reject(e.target.error);
  });
}

function deleteFromStore(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req   = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}
