import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import BottomNav from '../components/BottomNav'
import { useState, useEffect } from 'react'
import { registerPush, isPushEnabled, unregisterPush } from '../lib/push'
import { supabase } from '../lib/supabase'

const THEME_CONFIG = {
  journee: { label: 'Ma Journée',  color: '#00C2B8', icon: '/icon/smart-journee.png' },
  voyage:  { label: 'Mon Voyage',  color: '#2B5CE6', icon: '/icon/smart-voyage.png' },
  projet:  { label: 'Mon Projet',  color: '#7C3AED', icon: '/icon/smart-projet.png' },
  weekend: { label: 'Mon Weekend', color: '#F59E0B', icon: '/icon/smart-weekend.png' },
  sport:   { label: 'Mon Sport',   color: '#10B981', icon: '/icon/smart-sport.png' },
  courses: { label: 'Mes Courses', color: '#EC4899', icon: '/icon/smart-courses.png' },
  default: { label: 'Planning',    color: '#00C2B8', icon: '/icon/smart-journee.png' },
}

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

function HistorySection({ userId }) {
  const navigate = useNavigate()
  const [history, setHistory]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter,  setFilter]        = useState('all')
  const [deleting, setDeleting]     = useState(null)

  useEffect(() => {
    if (!userId) return
    supabase.from('dt_plannings').select('id, date, theme, tasks')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(50)
      .then(({ data }) => { setHistory(data || []); setLoading(false) })
  }, [userId])

  async function deletePlan(id) {
    setDeleting(id)
    await supabase.from('dt_plannings').delete().eq('id', id)
    setHistory(h => h.filter(x => x.id !== id))
    setDeleting(null)
  }

  const themes = ['all', ...Object.keys(THEME_CONFIG).filter(k => k !== 'default')]
  const filtered = filter === 'all' ? history : history.filter(h => h.theme === filter)

  // Grouper par mois
  const grouped = filtered.reduce((acc, h) => {
    const key = new Date(h.date + 'T12:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(h)
    return acc
  }, {})

  if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-hint)', fontSize: 13, padding: '12px 0' }}>Chargement…</p>
  if (!history.length) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>Aucun plan pour l'instant</p>
    </div>
  )

  return (
    <div>
      {/* Filtres par thème */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16, scrollbarWidth: 'none' }}>
        {themes.map(t => {
          const cfg = t === 'all' ? { color: '#00C2B8', label: 'Tous' } : THEME_CONFIG[t]
          const active = filter === t
          return (
            <button key={t} onClick={() => setFilter(t)} style={{
              flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '5px 12px',
              borderRadius: 20, border: `1.5px solid ${cfg.color}44`,
              background: active ? cfg.color : cfg.color + '12',
              color: active ? 'white' : cfg.color, cursor: 'pointer',
            }}>
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Plans groupés par mois */}
      {Object.entries(grouped).map(([month, plans]) => (
        <div key={month} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{month}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plans.map(h => {
              const cfg   = THEME_CONFIG[h.theme] || THEME_CONFIG.default
              const date  = new Date(h.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
              const count = h.tasks?.length || 0
              const path  = h.theme ? `/smart?theme=${h.theme}&date=${h.date}` : `/smart?theme=journee&date=${h.date}`
              const first = h.tasks?.[0]
              const preview = first ? (first.title || first.tache || '') : ''
              const isDeleting = deleting === h.id
              return (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => navigate(path)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 12,
                    background: 'rgba(255,255,255,0.7)', border: `1.5px solid ${cfg.color}33`,
                    borderRadius: 16, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: cfg.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={cfg.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>{date}</p>
                        <span style={{ fontSize: 10, color: cfg.color, fontWeight: 700, background: cfg.color + '15', borderRadius: 10, padding: '2px 7px' }}>{count} étapes</span>
                      </div>
                      {preview && <p style={{ fontSize: 11, color: 'var(--text-soft)', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {h.tasks?.[0]?.emoji} {preview}…
                      </p>}
                    </div>
                    <span style={{ fontSize: 14, color: cfg.color }}>→</span>
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Supprimer ce planning ?')) deletePlan(h.id) }}
                    disabled={isDeleting}
                    style={{
                      flexShrink: 0, width: 40, height: 40, borderRadius: 12,
                      background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, opacity: isDeleting ? 0.4 : 1, transition: 'all 0.2s',
                    }}>
                    {isDeleting ? '…' : '🗑'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProfilPage() {
  const { profile, user, signOut } = useAuth()
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

          {/* Historique */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 12 }}>Mon Historique 📋</h2>
            <HistorySection userId={user?.id} />
          </div>

          <div style={{ height: 1, background: 'rgba(0,194,184,0.15)', margin: '4px 0' }} />

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
