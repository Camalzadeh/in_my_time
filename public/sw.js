// Minimal service worker.
//
// Its job is installability: Chrome will not offer "Install app" without one
// that handles fetch. Caching pages is deliberately not attempted — a poll's
// contents change with every vote, and a stale grid would be worse than a
// spinner. Everything goes to the network exactly as it would without this.
//
// The only thing it holds is an offline notice, so a dropped connection shows
// something belonging to the app rather than the browser's dinosaur.

const OFFLINE_URL = '/offline.html';
const CACHE = 'inmytime-offline-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)).then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    // Only page navigations get the fallback. Everything else — API calls,
    // scripts, images — is left completely alone.
    if (event.request.mode !== 'navigate') return;

    event.respondWith(
        fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
    );
});
