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
          background: 'linear-gradient(160deg, #1a0f3d 0%, #0d0b1a 100%)',
          borderRadius: '0 0 20px 20px',
          padding: '52px 24px 28px', marginBottom: 24,
          boxShadow: '0 8px 32px rgba(139,92,246,0.2), inset 0 -1px 0 rgba(139,92,246,0.28)',
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
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.28)',
            borderRadius: 12, padding: '12px 16px', marginTop: 16, backdropFilter: 'blur(10px)',
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
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px dashed rgba(139,92,246,0.35)',
              borderRadius: 14, padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
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
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Smart Planning</h2>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              color: 'white', borderRadius: 6, padding: '3px 10px',
            }}>FREE 1 MONTH</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Ma Journée',  theme: 'journee', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
              { label: 'Mon Voyage',  theme: 'voyage',  svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> },
              { label: 'Mon Projet',  theme: 'projet',  svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v5M9.5 14.5l2.5-2.5 2.5 2.5"/></svg> },
              { label: 'Mon Weekend', theme: 'weekend', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg> },
              { label: 'Mon Sport',   theme: 'sport',   svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v6l-3 4M12 13l3 4M7 9l-2 2 3 1M17 9l2 2-3 1"/></svg> },
              { label: 'Mes Courses', theme: 'courses', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg> },
            ].map(a => (
              <button key={a.theme} onPointerDown={tap} onClick={() => navigate(`/smart?theme=${a.theme}`)} style={{
                flex: '1 1 calc(50% - 5px)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 10,
                background: 'linear-gradient(145deg, rgba(139,92,246,0.13) 0%, rgba(7,5,18,0.75) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(139,92,246,0.22)',
                borderRadius: 14, padding: '20px 12px', cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}>
                {a.svg}
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 1.3, letterSpacing: 0.2 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Actions rapides */}
        <section className="anim-3" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Actions rapides</h2>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
              color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 10px',
            }}>Toujours gratuit</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Dicter',  path: '/planning', svg: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/></svg> },
              { label: 'Semaine', path: '/week',     svg: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg> },
              { label: 'Rappels', path: '/profil',   svg: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg> },
              { label: 'Stats',   path: '/profil',   svg: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
            ].map(a => (
              <button key={a.label} onPointerDown={tap} onClick={() => navigate(a.path)} style={{
                flex: '1 1 calc(50% - 5px)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 10,
                background: 'linear-gradient(145deg, rgba(139,92,246,0.13) 0%, rgba(7,5,18,0.75) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(139,92,246,0.22)',
                borderRadius: 14, padding: '20px 12px', cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}>
                {a.svg}
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', textAlign: 'center', letterSpacing: 0.2 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </section>

      </div>
      <BottomNav />
    </div>
  )
}
