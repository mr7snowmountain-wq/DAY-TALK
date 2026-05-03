import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

export default function WeekPage() {
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <div className="screen" style={{ justifyContent: 'center', paddingBottom: 100 }}>
        <button onClick={() => navigate('/home')} style={{
          alignSelf: 'flex-start', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-soft)', fontSize: 14,
          marginBottom: 32, marginTop: 60,
        }}>← Retour</button>
        <div className="card" style={{ padding: '40px 28px', textAlign: 'center', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 400, color: 'var(--text-dark)', marginBottom: 10, fontFamily: 'var(--font-display)', letterSpacing: 2, textTransform: 'uppercase' }}>VUE SEMAINE</h1>
          <p style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.6 }}>
            Bientôt disponible<br/>Planifie toute ta semaine d'un coup.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
