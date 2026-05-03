import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function DropletLogo() {
  return (
    <svg width="64" height="72" viewBox="0 0 64 72" fill="none">
      <defs>
        <linearGradient id="dg" x1="32" y1="0" x2="32" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD"/>
          <stop offset="100%" stopColor="#6D28D9"/>
        </linearGradient>
      </defs>
      <path d="M32 2C32 2 8 28 8 44a24 24 0 0048 0C56 28 32 2 32 2z" fill="url(#dg)"/>
      <circle cx="32" cy="44" r="14" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
      <rect x="29" y="34" width="6" height="10" rx="3" fill="white"/>
      <path d="M26 42a6 6 0 0012 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M32 50v4M30 54h4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

/* Toast de succès */
function SuccessToast({ message }) {
  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, animation: 'slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
        borderRadius: 20, padding: '14px 24px',
        boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
        display: 'flex', alignItems: 'center', gap: 12,
        minWidth: 260,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>✓</div>
        <div>
          <p style={{ color: 'white', fontWeight: 800, fontSize: 14, margin: 0 }}>
            Compte créé avec succès !
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: '2px 0 0' }}>
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode,    setMode]    = useState('signin')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [name,    setName]    = useState('')
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(email, pass, name.trim())
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3500)
      } else {
        await signIn(email, pass)
      }
    } catch (e) { setErr(e.message) }
    setLoading(false)
  }

  return (
    <div className="app-shell">
      {success && <SuccessToast message="Bienvenue sur DayTalk " />}

      <div className="screen" style={{ justifyContent: 'center', paddingTop: 40, paddingBottom: 40, gap: 0 }}>

        {/* Logo + titre */}
        <div className="anim-0" style={{ textAlign: 'center', marginBottom: 36 }}>
          <DropletLogo />
          <h1 style={{ fontSize: 38, fontWeight: 400, color: 'var(--navy)', marginTop: 12, letterSpacing: 3, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            DAY TALK
          </h1>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 2 }}>
            AI Planning
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-soft)', marginTop: 10, fontStyle: 'italic', letterSpacing: 0.2 }}>
            Tu dictes et j'organise
          </p>
        </div>

        {/* Formulaire */}
        <div className="card anim-1" style={{ padding: '28px 24px', width: '100%' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 20, textAlign: 'center' }}>
            {mode === 'signin' ? 'Bon retour ' : 'Créer un compte'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div className="field">
                <label>Prénom</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ton prénom" required autoFocus />
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
            </div>

            {err && <p style={{ color: '#e55', fontSize: 13, textAlign: 'center', fontWeight: 600 }}>{err}</p>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 6 }}>
              {loading ? '…' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-soft)' }}>
            {mode === 'signin' ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr('') }}
              style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13 }}>
              {mode === 'signin' ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
