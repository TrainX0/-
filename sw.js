// Необязательный service worker: офлайн-режим для «Сосед: Побег».
// Положите рядом с index.html и откройте игру по https (или localhost).
const CACHE = 'sosed-v2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const ok = u.origin === location.origin || u.hostname === 'cdnjs.cloudflare.com' || u.hostname === 'cdn.jsdelivr.net';
  if (!ok) return;
  const store = res => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; };
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(store).catch(() => caches.match('./index.html')));
  } else {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(store)));
  }
});
