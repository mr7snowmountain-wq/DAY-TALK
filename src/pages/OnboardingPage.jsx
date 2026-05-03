import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const USAGES = [
  { id: 'personal', icon: '/icon/usage-personnel.png',      label: 'Personnel',     desc: 'Famille, courses, quotidien' },
  { id: 'pro',      icon: '/icon/usage-professionnel.png',  label: 'Professionnel', desc: 'Réunions, projets, deadlines' },
  { id: 'both',     icon: '/icon/usage-les-deux.png',       label: 'Les deux',      desc: 'Mix perso et pro' },
]

export default function OnboardingPage() {
  const { saveProfile } = useAuth()
  const navigate = useNavigate()
  const [usage, setUsage] = useState('')
  const [loading, setLoading] = useState(false)

  async function finish() {
    setLoading(true)
    await saveProfile({ usage_type: usage, onboarding_complete: true })
    setLoading(false)
    navigate('/home', { replace: true })
  }

  return (
    <div className="app-shell">
      <div className="screen" style={{ justifyContent: 'center', padding: '40px 20px' }}>

        <div className="anim-0" style={{ width: '100%' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8 }}>
            Comment tu utilises DayTalk ?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-soft)', marginBottom: 24 }}>
            Pour mieux structurer tes plannings
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {USAGES.map(u => (
              <button key={u.id} onClick={() => setUsage(u.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: usage === u.id ? 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(109,40,217,0.08))' : 'rgba(255,255,255,0.06)',
                border: usage === u.id ? '2px solid var(--teal)' : '1.5px solid rgba(139,92,246,0.2)',
                borderRadius: 16, padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s',
              }}>
                <img src={u.icon} alt={u.label} style={{ width: 44, height: 44, objectFit: 'contain' }} />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>{u.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-soft)' }}>{u.desc}</p>
                </div>
                {usage === u.id && <span style={{ marginLeft: 'auto', color: 'var(--teal)', fontSize: 18 }}>✓</span>}
              </button>
            ))}
          </div>
          <button onClick={finish} disabled={!usage || loading} style={{
            width: '100%', padding: '18px', border: 'none', borderRadius: 20,
            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            color: 'white', fontSize: 16, fontWeight: 800, cursor: !usage || loading ? 'not-allowed' : 'pointer',
            opacity: !usage || loading ? 0.5 : 1, transition: 'opacity 0.2s',
            boxShadow: '0 6px 24px rgba(139,92,246,0.4)', letterSpacing: 0.3,
          }}>
            {loading ? '…' : "C'est parti ! 🚀"}
          </button>
        </div>

      </div>
    </div>
  )
}
