const CACHE = 'daytalk-v1'
const PRECACHE = ['/', '/index.html', '/icon-192.png', '/icon-512.png', '/manifest.json']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  )
})

// Network first, fallback cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return // Ne jamais cacher les appels API
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

// Push notifications
self.addEventListener('push', e => {
  if (!e.data) return
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title || 'DayTalk', {
      body: data.body || '', icon: '/icon-192.png', badge: '/icon-192.png',
      tag: data.tag || 'daytalk-notif', data: { url: data.url || '/' }, vibrate: [200,100,200],
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const w = list.find(c => c.url.includes(self.location.origin))
      if (w) { w.focus(); w.navigate(url) } else clients.openWindow(url)
    })
  )
})
