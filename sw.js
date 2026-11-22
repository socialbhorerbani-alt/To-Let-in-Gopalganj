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
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const a=(e.notification.data||{}).a||'';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list){ if('focus' in c){ c.postMessage({type:'tolet-nt',a}); return c.focus(); } }
    return clients.openWindow('./?nt='+encodeURIComponent(a));
  }));
});
