import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTap } from '../hooks/useTap'
import BottomNav from '../components/BottomNav'
import CardCarousel from '../components/CardCarousel'
import { supabase } from '../lib/supabase'

const MESSAGES = [
  "Chaque tâche accomplie est une victoire. ",
  "Organise ta journée, libère ton esprit. ",
  "Un plan clair, une journée maîtrisée. ",
  "Dicte, planifie, accomplis. ",
  "Ta productivité commence ici. ",
  "Parle, DayTalk s'occupe du reste. ",
  "Une journée bien planifiée = sérénité. ",
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

  const tap     = useTap()
  const name    = profile?.display_name?.trim() || 'toi'
  const message = MESSAGES[new Date().getDay() % MESSAGES.length]
  const date    = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const doneCount = tasks.filter(t => t.done).length

  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    supabase.from('dt_plannings').select('tasks')
      .eq('user_id', user.id).eq('date', today).eq('theme', 'planning').maybeSingle()
      .then(({ data }) => { setTasks(data?.tasks || []); setLoading(false) })
  }, [user])

  return (
    <div className="app-shell">
      <div className="screen" style={{ paddingTop: 0, paddingBottom: 100, gap: 0, justifyContent: 'flex-start' }}>

        {/* Hero */}
        <div className="anim-0" style={{
          width: '100%',
          background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
          borderRadius: '0 0 32px 32px',
          padding: '52px 24px 28px', marginBottom: 24,
          boxShadow: '0 6px 32px rgba(139,92,246,0.35)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 3 }}>{getGreeting()},</p>
              <h1 style={{ fontSize: 34, fontWeight: 400, color: 'white', lineHeight: 1.1, letterSpacing: 2, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                {name} 
              </h1>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 5 }}>{date}</p>
            </div>
            <button onClick={signOut} style={{
              width: 56, height: 56, background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, overflow: 'hidden',
            }}>
              <img src="/icon/bouton-profil.png" alt="profil" style={{ width: 50, height: 50, objectFit: 'contain' }} />
            </button>
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
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/icon/titre-aujourdhui.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
              Aujourd'hui
            </h2>
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
              background: 'rgba(139,92,246,0.07)', border: '1.5px dashed rgba(139,92,246,0.32)',
              borderRadius: 20, padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}></div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>Aucun planning aujourd'hui</p>
              <p style={{ fontSize: 12, color: 'var(--text-soft)' }}>Appuie pour dicter ta journée</p>
            </div>
          )}
        </section>

        {/* Smart Planning */}
        <section className="anim-2" style={{ width: '100%', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Smart Planning </h2>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              color: 'white', borderRadius: 20, padding: '3px 10px',
            }}>FREE 1 MONTH</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[
              { icon: '/icon/smart-journee.png', label: 'Ma Journée',  theme: 'journee', color: '#8B5CF6' },
              { icon: '/icon/smart-voyage.png',  label: 'Mon Voyage',  theme: 'voyage',  color: '#6D28D9' },
              { icon: '/icon/smart-projet.png',  label: 'Mon Projet',  theme: 'projet',  color: '#7C3AED' },
              { icon: '/icon/smart-weekend.png', label: 'Mon Weekend', theme: 'weekend', color: '#F59E0B' },
              { icon: '/icon/smart-sport.png',   label: 'Mon Sport',   theme: 'sport',   color: '#10B981' },
              { icon: '/icon/smart-courses.png', label: 'Mes Courses', theme: 'courses', color: '#EC4899' },
            ].map(a => (
              <button key={a.theme} onPointerDown={tap} onClick={() => navigate(`/smart?theme=${a.theme}`)} style={{
                flex: '1 1 calc(50% - 6px)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8,
                background: a.color + '12',
                border: `1.5px solid ${a.color}44`,
                borderRadius: 20, padding: '18px 12px', cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
              }}>
                <img src={a.icon} alt={a.label} style={{ width: 44, height: 44, objectFit: 'contain' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', textAlign: 'center', lineHeight: 1.3 }}>{a.label}</span>
                <div style={{
                  position: 'absolute', top: 7, right: 7,
                  width: 7, height: 7, borderRadius: '50%',
                  background: a.color, boxShadow: `0 0 6px ${a.color}`,
                }}/>
              </button>
            ))}
          </div>
        </section>

        {/* Actions rapides */}
        <section className="anim-3" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Actions rapides </h2>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
              color: '#10B981', border: '1.5px solid #10B98144',
              background: '#10B98112', borderRadius: 20, padding: '3px 10px',
            }}>Toujours gratuit</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[
              { icon: '/icon/action-dicter.png',  label: 'Dicter',  path: '/planning', color: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.28)' },
              { icon: '/icon/action-semaine.png', label: 'Semaine', path: '/week',     color: 'rgba(79,70,229,0.1)',   border: 'rgba(79,70,229,0.25)'  },
              { icon: '/icon/action-rappel.png',  label: 'Rappels', path: '/profil',   color: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.25)' },
              { icon: '/icon/action-stats.png',   label: 'Stats',   path: '/profil',   color: 'rgba(196,181,253,0.07)',border: 'rgba(196,181,253,0.18)'},
            ].map(a => (
              <button key={a.label} onPointerDown={tap} onClick={() => navigate(a.path)} style={{
                flex: '1 1 calc(50% - 6px)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, background: a.color,
                border: `1.5px solid ${a.border}`, borderRadius: 20, padding: '18px 12px', cursor: 'pointer',
              }}>
                <img src={a.icon} alt={a.label} style={{ width: 44, height: 44, objectFit: 'contain' }} />
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
