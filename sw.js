/* ===================================================================
   COMMUNICATE AI – SRI PRATIBHA HIGH SCHOOL
   Offline service worker
   -------------------------------------------------------------------
   Strategy:
     • HTML / navigation  -> NETWORK FIRST  (so a re-deploy is picked
                             up immediately; falls back to cache when
                             the device is offline)
     • icons / manifest   -> CACHE FIRST + background refresh
                             (stale-while-revalidate)
   IMPORTANT: bump VERSION on every deploy.
   =================================================================== */

const VERSION = "2.1.0";
const CACHE   = "communicate-ai-sph-v" + VERSION;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/school-logo.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png"
];

/* ---------- install: pre-cache the shell ---------- */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(new Request(a, {cache: "reload"})))))
    // NOTE: no skipWaiting() here on purpose. The page asks the user
    // before swapping versions, then posts SKIP_WAITING.
  );
});

/* ---------- activate: drop every older cache ---------- */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ---------- let the page trigger the swap ---------- */
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
  if (e.data && e.data.type === "GET_VERSION" && e.source) {
    e.source.postMessage({type: "VERSION", version: VERSION});
  }
});

/* ---------- fetch ---------- */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== location.origin) return;

  const isDoc = req.mode === "navigate"
             || req.destination === "document"
             || (req.headers.get("accept") || "").includes("text/html");

  /* --- HTML: network first, cache as backup --- */
  if (isDoc) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const hit = await caches.match(req, {ignoreSearch: true});
          if (hit) return hit;
          const shell = await caches.match("./index.html");
          if (shell) return shell;
          return new Response(
            "<!doctype html><meta charset=utf-8><title>COMMUNICATE AI</title>"
            + "<h1>COMMUNICATE AI</h1><p>You are offline and this page has not been saved yet. "
            + "Please connect once, then it will work offline.</p>",
            {headers: {"Content-Type": "text/html; charset=utf-8"}, status: 200}
          );
        })
    );
    return;
  }

  /* --- everything else: cache first, refresh in background --- */
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
      return hit || net.catch(() => new Response("", {status: 504}));
    })
  );
});
