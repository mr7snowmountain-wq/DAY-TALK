import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import BottomNav from '../components/BottomNav'
import { useState, useEffect } from 'react'
import { registerPush, isPushEnabled, unregisterPush } from '../lib/push'
import { supabase } from '../lib/supabase'

const THEME_CONFIG = {
  journee:  { label: 'Ma Journée',    color: '#8B5CF6', icon: '/icon/smart-journee.png' },
  voyage:   { label: 'Mon Voyage',    color: '#6D28D9', icon: '/icon/smart-voyage.png' },
  projet:   { label: 'Mon Projet',    color: '#7C3AED', icon: '/icon/smart-projet.png' },
  weekend:  { label: 'Mon Weekend',   color: '#F59E0B', icon: '/icon/smart-weekend.png' },
  sport:    { label: 'Mon Sport',     color: '#10B981', icon: '/icon/smart-sport.png' },
  courses:  { label: 'Mes Courses',   color: '#EC4899', icon: '/icon/smart-courses.png' },
  planning: { label: 'Mon Planning',  color: '#8B5CF6', icon: '/icon/smart-journee.png' },
  default:  { label: 'Planning',      color: '#8B5CF6', icon: '/icon/smart-journee.png' },
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
      background: enabled ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'rgba(255,255,255,0.07)',
      border: enabled ? 'none' : '1.5px solid rgba(139,92,246,0.25)',
      borderRadius: 16, padding: '14px 18px', cursor: loading ? 'not-allowed' : 'pointer',
      backdropFilter: 'blur(16px)', transition: 'all 0.3s', opacity: loading ? 0.7 : 1,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={enabled ? 'white' : 'var(--teal)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
        {!enabled && <line x1="1" y1="1" x2="23" y2="23"/>}
      </svg>
      <div style={{ textAlign: 'left' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: enabled ? 'white' : 'var(--text-dark)', marginBottom: 2 }}>
          {loading ? 'Chargement…' : enabled ? 'Notifications activées' : 'Activer les notifications'}
        </p>
        <p style={{ fontSize: 11, color: enabled ? 'rgba(255,255,255,0.8)' : 'var(--text-soft)' }}>
          Rappels 15 min avant chaque tâche
        </p>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <div style={{ width: 38, height: 22, borderRadius: 11, background: enabled ? 'rgba(255,255,255,0.25)' : 'rgba(139,92,246,0.12)', border: '1.5px solid rgba(139,92,246,0.2)', position: 'relative' }}>
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
          const cfg = t === 'all' ? { color: '#8B5CF6', label: 'Tous' } : THEME_CONFIG[t]
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
              const path  = h.theme === 'planning'
                ? `/planning?date=${h.date}`
                : h.theme ? `/smart?theme=${h.theme}&date=${h.date}` : `/smart?theme=journee&date=${h.date}`
              const first = h.tasks?.[0]
              const preview = first ? (first.title || first.tache || '') : ''
              const isDeleting = deleting === h.id
              return (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => navigate(path)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 12,
                    background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${cfg.color}33`,
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
                        {preview}…
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
                    {isDeleting ? '…' : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    )}
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
          width: '100%',
          background: 'linear-gradient(160deg, #1a0f3d 0%, #0d0b1a 100%)',
          borderRadius: '0 0 20px 20px', padding: '52px 24px 32px', marginBottom: 28,
          boxShadow: '0 8px 32px rgba(139,92,246,0.2), inset 0 -1px 0 rgba(139,92,246,0.28)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(139,92,246,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, border: '1px solid rgba(139,92,246,0.35)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{name}</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, letterSpacing: 0.3 }}>
              {profile?.usage_type === 'pro' ? 'Professionnel' : profile?.usage_type === 'personal' ? 'Personnel' : 'Perso & Pro'}
            </p>
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Historique */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 12 }}>Mon Historique</h2>
            <HistorySection userId={user?.id} />
          </div>

          <div style={{ height: 1, background: 'rgba(139,92,246,0.15)', margin: '4px 0' }} />

          <NotifButton />
          <button onClick={signOut} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 12, padding: '14px 18px', cursor: 'pointer', backdropFilter: 'blur(16px)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>Se déconnecter</p>
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
