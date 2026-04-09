import { supabase } from './supabase'
const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export async function registerPush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return { error: 'non_supporté' }
  const reg  = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return { error: 'refusé' }
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
  })
  await supabase.from('dt_push_subscriptions').upsert(
    { user_id: userId, subscription: sub.toJSON(), updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )
  return { success: true }
}

export async function isPushEnabled() {
  if (!('serviceWorker' in navigator)) return false
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  if (!reg) return false
  const sub = await reg.pushManager.getSubscription()
  return !!sub && Notification.permission === 'granted'
}

export async function unregisterPush(userId) {
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  if (reg) { const sub = await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe() }
  if (userId) await supabase.from('dt_push_subscriptions').delete().eq('user_id', userId)
}
