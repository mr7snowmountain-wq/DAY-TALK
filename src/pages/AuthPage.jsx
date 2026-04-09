import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function DropletLogo() {
  return (
    <svg width="64" height="72" viewBox="0 0 64 72" fill="none">
      <defs>
        <linearGradient id="dg" x1="32" y1="0" x2="32" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5D4"/>
          <stop offset="100%" stopColor="#2B5CE6"/>
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

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode,  setMode]  = useState('signin')
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [err,   setErr]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      if (mode === 'signup') await signUp(email, pass, name)
      else await signIn(email, pass)
    } catch (e) { setErr(e.message) }
    setLoading(false)
  }

  return (
    <div className="app-shell">
      <div className="screen" style={{ justifyContent: 'center', paddingTop: 40, paddingBottom: 40, gap: 0 }}>

        {/* Logo + titre */}
        <div className="anim-0" style={{ textAlign: 'center', marginBottom: 36 }}>
          <DropletLogo />
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--navy)', marginTop: 12, letterSpacing: -0.5 }}>
            DAY TALK
          </h1>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 2 }}>
            AI Planning
          </p>
        </div>

        {/* Formulaire */}
        <div className="card anim-1" style={{ padding: '28px 24px', width: '100%' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 20, textAlign: 'center' }}>
            {mode === 'signin' ? 'Bon retour 👋' : 'Créer un compte'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div className="field">
                <label>Prénom</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ton prénom" required />
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

            {err && <p style={{ color: 'var(--teal)', fontSize: 13, textAlign: 'center', fontWeight: 600 }}>{err}</p>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 6 }}>
              {loading ? '…' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-soft)' }}>
            {mode === 'signin' ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13 }}>
              {mode === 'signin' ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
