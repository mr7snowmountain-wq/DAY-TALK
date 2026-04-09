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
          <div style={{ fontSize: 52, marginBottom: 16 }}>📅</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 10 }}>Vue Semaine</h1>
          <p style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.6 }}>
            Bientôt disponible 🚀<br/>Planifie toute ta semaine d'un coup.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
