self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

self.addEventListener('push', e => {
  if (!e.data) return
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title || 'DayTalk 🎙', {
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
