import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import BottomNav from '../components/BottomNav'
import CardCarousel from '../components/CardCarousel'
import { supabase } from '../lib/supabase'

const MESSAGES = [
  "Chaque tâche accomplie est une victoire. 🎯",
  "Organise ta journée, libère ton esprit. ✨",
  "Un plan clair, une journée maîtrisée. 💡",
  "Dicte, planifie, accomplis. 🚀",
  "Ta productivité commence ici. ⚡",
  "Parle, DayTalk s'occupe du reste. 🎙",
  "Une journée bien planifiée = sérénité. 🌊",
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Bonsoir'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

export default function HomePage() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)

  const name    = profile?.display_name || 'toi'
  const message = MESSAGES[new Date().getDay() % MESSAGES.length]
  const date    = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const doneCount = tasks.filter(t => t.done).length

  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    supabase.from('dt_plannings').select('tasks')
      .eq('user_id', user.id).eq('date', today).single()
      .then(({ data }) => { setTasks(data?.tasks || []); setLoading(false) })
  }, [user])

  return (
    <div className="app-shell">
      <div className="screen" style={{ paddingTop: 0, paddingBottom: 100, gap: 0, justifyContent: 'flex-start' }}>

        {/* Hero */}
        <div className="anim-0" style={{
          width: '100%',
          background: 'linear-gradient(135deg, #00C2B8 0%, #2B5CE6 100%)',
          borderRadius: '0 0 32px 32px',
          padding: '52px 24px 28px', marginBottom: 24,
          boxShadow: '0 6px 24px rgba(0,194,184,0.25)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 3 }}>{getGreeting()},</p>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: -0.5 }}>
                {name} 👋
              </h1>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 5 }}>{date}</p>
            </div>
            <button onClick={signOut} style={{
              width: 40, height: 40, background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>👤</button>
          </div>

          {/* Message */}
          <div style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 16, padding: '12px 16px', marginTop: 16, backdropFilter: 'blur(10px)',
          }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.55, fontStyle: 'italic', fontWeight: 500 }}>
              "{message}"
            </p>
          </div>
        </div>

        {/* Planning du jour */}
        <section className="anim-1" style={{ width: '100%', marginBottom: 24, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)' }}>Aujourd'hui 📅</h2>
            <button onClick={() => navigate('/planning')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--teal)', fontSize: 12, fontWeight: 700,
            }}>
              {tasks.length > 0 ? `${doneCount}/${tasks.length} ✓  Voir →` : 'Créer →'}
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-hint)', fontSize: 13, padding: '20px 0' }}>Chargement…</p>
          ) : tasks.length > 0 ? (
            <CardCarousel tasks={tasks} onToggle={() => navigate('/planning')} onCardTap={() => navigate('/planning')} />
          ) : (
            <div onClick={() => navigate('/planning')} style={{
              background: 'rgba(255,255,255,0.6)', border: '1.5px dashed rgba(0,194,184,0.35)',
              borderRadius: 20, padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎙</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>Aucun planning aujourd'hui</p>
              <p style={{ fontSize: 12, color: 'var(--text-soft)' }}>Appuie pour dicter ta journée</p>
            </div>
          )}
        </section>

        {/* Actions rapides */}
        <section className="anim-2" style={{ width: '100%' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 12 }}>Actions rapides ⚡</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[
              { emoji: '🎙', label: 'Dicter', path: '/planning', color: 'rgba(0,194,184,0.12)', border: 'rgba(0,194,184,0.3)' },
              { emoji: '📅', label: 'Semaine', path: '/week', color: 'rgba(43,92,230,0.1)', border: 'rgba(43,92,230,0.25)' },
              { emoji: '🔔', label: 'Rappels', path: '/profil', color: 'rgba(0,229,212,0.1)', border: 'rgba(0,229,212,0.3)' },
              { emoji: '📊', label: 'Stats', path: '/profil', color: 'rgba(13,27,75,0.07)', border: 'rgba(13,27,75,0.15)' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)} style={{
                flex: '1 1 calc(50% - 6px)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, background: a.color,
                border: `1.5px solid ${a.border}`, borderRadius: 20, padding: '18px 12px', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 26 }}>{a.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dark)' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </section>

      </div>
      <BottomNav />
    </div>
  )
}
