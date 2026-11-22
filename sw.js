const C = 'tolet-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./')))
  );
});
/* ===== BACKGROUND PUSH (FCM) ===== */
self.addEventListener('push', event => {
  let p = {};
  try { p = event.data ? event.data.json() : {}; } catch (_) {}
  const d = p.data || {}, n = p.notification || {};
  const title = d.title || n.title || 'টু-লেট গোপালগঞ্জ';
  const opts = {
    body: d.body || n.body || '',
    icon: 'Website Logo.png',
    badge: 'Website Logo.png',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    vibrate: [200, 100, 200],
    data: { a: d.a || 'home' }
  };
  event.waitUntil((async () => {
    const cl = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    // সাইট চোখের সামনে খোলা থাকলে অ্যাপের ভেতরের টোস্টই যথেষ্ট
    if (cl.some(c => c.visibilityState === 'visible')) return;
    await self.registration.showNotification(title, opts);
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const a = (event.notification.data && event.notification.data.a) || 'home';
  event.waitUntil((async () => {
    const cl = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cl) {
      if ('focus' in c) { await c.focus(); c.postMessage({ type: 'tolet-nt', a }); return; }
    }
    await clients.openWindow('./?nt=' + encodeURIComponent(a));
  })());
});
