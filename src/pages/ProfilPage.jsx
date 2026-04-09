import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import BottomNav from '../components/BottomNav'
import { useState, useEffect } from 'react'
import { registerPush, isPushEnabled, unregisterPush } from '../lib/push'

function NotifButton() {
  const { user } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => { isPushEnabled().then(v => { setEnabled(v); setChecked(true) }) }, [])

  if (!checked || !('serviceWorker' in navigator) || !('PushManager' in window)) return null

  async function toggle() {
    setLoading(true)
    if (enabled) { await unregisterPush(user?.id); setEnabled(false) }
    else {
      const r = await registerPush(user?.id)
      if (r.success) setEnabled(true)
      else if (r.error === 'refusé') alert('Active les notifications dans les réglages de ton navigateur.')
    }
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
      background: enabled ? 'linear-gradient(135deg, #00C2B8, #2B5CE6)' : 'rgba(255,255,255,0.75)',
      border: enabled ? 'none' : '1.5px solid rgba(0,194,184,0.25)',
      borderRadius: 16, padding: '14px 18px', cursor: loading ? 'not-allowed' : 'pointer',
      backdropFilter: 'blur(16px)', transition: 'all 0.3s', opacity: loading ? 0.7 : 1,
    }}>
      <span style={{ fontSize: 20 }}>{enabled ? '🔔' : '🔕'}</span>
      <div style={{ textAlign: 'left' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: enabled ? 'white' : 'var(--text-dark)', marginBottom: 2 }}>
          {loading ? 'Chargement…' : enabled ? 'Notifications activées' : 'Activer les notifications'}
        </p>
        <p style={{ fontSize: 11, color: enabled ? 'rgba(255,255,255,0.8)' : 'var(--text-soft)' }}>
          Rappels 15 min avant chaque tâche
        </p>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <div style={{ width: 38, height: 22, borderRadius: 11, background: enabled ? 'rgba(255,255,255,0.25)' : 'rgba(0,194,184,0.12)', border: '1.5px solid rgba(0,194,184,0.2)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 2, left: enabled ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: enabled ? 'white' : 'var(--teal)', transition: 'left 0.3s ease' }} />
        </div>
      </div>
    </button>
  )
}

export default function ProfilPage() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const name = profile?.display_name || '...'

  return (
    <div className="app-shell">
      <div className="screen" style={{ paddingTop: 0, paddingBottom: 100, gap: 0, justifyContent: 'flex-start' }}>
        <div style={{
          width: '100%', background: 'linear-gradient(135deg, #00C2B8, #2B5CE6)',
          borderRadius: '0 0 32px 32px', padding: '52px 24px 32px', marginBottom: 28,
          boxShadow: '0 6px 24px rgba(0,194,184,0.2)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 12, border: '2px solid rgba(255,255,255,0.4)' }}>👤</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{name}</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {profile?.usage_type === 'pro' ? '💼 Pro' : profile?.usage_type === 'personal' ? '🏠 Personnel' : '⚡ Perso & Pro'}
            </p>
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <NotifButton />
          <button onClick={signOut} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            background: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(0,194,184,0.2)',
            borderRadius: 16, padding: '14px 18px', cursor: 'pointer', backdropFilter: 'blur(16px)',
          }}>
            <span style={{ fontSize: 20 }}>🚪</span>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>Se déconnecter</p>
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
