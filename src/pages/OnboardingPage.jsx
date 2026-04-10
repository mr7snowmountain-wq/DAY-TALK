import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const USAGES = [
  { id: 'personal', icon: '/icon/Usage Personnel.png',      label: 'Personnel',     desc: 'Famille, courses, quotidien' },
  { id: 'pro',      icon: '/icon/Usage Professionnel.png',  label: 'Professionnel', desc: 'Réunions, projets, deadlines' },
  { id: 'both',     icon: '/icon/Usage Les deux.png',       label: 'Les deux',      desc: 'Mix perso et pro' },
]

export default function OnboardingPage() {
  const { saveProfile, profile } = useAuth()
  const navigate = useNavigate()
  const [step,  setStep]  = useState(1)
  const [name,  setName]  = useState(profile?.display_name || '')
  const [usage, setUsage] = useState('')
  const [loading, setLoading] = useState(false)

  async function finish() {
    setLoading(true)
    await saveProfile({ display_name: name, usage_type: usage, onboarding_complete: true })
    setLoading(false)
    navigate('/home', { replace: true })
  }

  return (
    <div className="app-shell">
      <div className="screen" style={{ justifyContent: 'center', padding: '40px 20px' }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              height: 4, borderRadius: 2, flex: 1,
              background: i <= step ? 'var(--grad-btn)' : 'rgba(0,194,184,0.15)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {step === 1 && (
          <div className="anim-0" style={{ width: '100%' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8 }}>
              Comment tu t'appelles ? 👋
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-soft)', marginBottom: 28 }}>
              DayTalk personnalisera ton expérience
            </p>
            <div className="field" style={{ marginBottom: 24 }}>
              <label>Prénom</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ton prénom" autoFocus />
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!name.trim()}>
              Continuer →
            </button>
          </div>
        )}

        {step === 2 && (
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
                  background: usage === u.id ? 'linear-gradient(135deg,rgba(0,194,184,0.12),rgba(43,92,230,0.08))' : 'rgba(255,255,255,0.7)',
                  border: usage === u.id ? '2px solid var(--teal)' : '1.5px solid rgba(0,194,184,0.2)',
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
            <button className="btn btn-primary" onClick={finish} disabled={!usage || loading}>
              {loading ? '…' : "C'est parti 🚀"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
