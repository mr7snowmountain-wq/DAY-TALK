import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

/* ── Logo identique à AuthPage ── */
function Logo({ size = 40 }) {
  const s = size
  return (
    <svg width={s} height={s * 1.125} viewBox="0 0 64 72" fill="none">
      <defs>
        <linearGradient id="lg-land" x1="32" y1="0" x2="32" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD"/>
          <stop offset="100%" stopColor="#6D28D9"/>
        </linearGradient>
      </defs>
      <path d="M32 2C32 2 8 28 8 44a24 24 0 0048 0C56 28 32 2 32 2z" fill="url(#lg-land)"/>
      <circle cx="32" cy="44" r="14" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
      <rect x="29" y="34" width="6" height="10" rx="3" fill="white"/>
      <path d="M26 42a6 6 0 0012 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M32 50v4M30 54h4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

/* ── Maquette téléphone avec emplacement screenshot ── */
function PhoneMockup({ src, label, style = {} }) {
  return (
    <div style={{
      width: 200, height: 400, borderRadius: 32,
      border: '1.5px solid rgba(139,92,246,0.5)',
      background: '#0d0b1a',
      boxShadow: '0 24px 64px rgba(139,92,246,0.25), 0 2px 0 rgba(255,255,255,0.06) inset',
      overflow: 'hidden', flexShrink: 0, position: 'relative',
      ...style,
    }}>
      {/* Notch */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 70, height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 3, zIndex: 2 }} />
      {src
        ? <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
            <p style={{ fontSize: 11, color: 'rgba(139,92,246,0.5)', textAlign: 'center', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>{label || 'Screenshot app ici'}</p>
          </div>
      }
    </div>
  )
}

/* ── Bouton CTA principal ── */
function CTAButton({ children, onClick, light = false }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: '16px 32px', borderRadius: 14, border: 'none', cursor: 'pointer',
      background: light ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      color: 'white', fontSize: 16, fontWeight: 800, fontFamily: 'Inter, sans-serif',
      boxShadow: '0 6px 28px rgba(139,92,246,0.45)',
      letterSpacing: 0.3, width: '100%', maxWidth: 340,
    }}>
      {children}
    </button>
  )
}

const STEPS = [
  {
    n: '01',
    title: 'Tu parles',
    desc: 'Appuie sur le micro et dicte ta journée, ton voyage, ton projet. Naturellement, comme à un assistant.',
    svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.6" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/></svg>,
  },
  {
    n: '02',
    title: "L'IA structure",
    desc: "DayTalk analyse ta voix et génère un planning complet avec horaires, durées et priorités — en moins de 10 secondes.",
    svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 6v6l4 2"/></svg>,
  },
  {
    n: '03',
    title: 'Sync agenda',
    desc: "Export en un tap vers Google Agenda, Apple Calendar ou tout autre agenda. Les dates sont exactes, automatiquement.",
    svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M9 14l2 2 4-4"/></svg>,
  },
]

const USE_CASES = [
  {
    tag: 'Voyage',
    before: '"Je passe 2h sur Google Maps pour planifier mon séjour"',
    after: '"Rome 4 jours du 20 juin, culture et gastronomie" → itinéraire complet en 10 sec',
    screen: 'Screenshot Mon Voyage',
  },
  {
    tag: 'Journée pro',
    before: '"J\'oublie la moitié de mes tâches et je finis la journée à la bourre"',
    after: '"Réunion 9h, rapport midi, call client 15h" → planning horaire prêt à suivre',
    screen: 'Screenshot Ma Journée',
  },
  {
    tag: 'Sport',
    before: '"J\'improvise à la salle et je sais jamais si j\'avance"',
    after: '"Prise de masse, débutant, 45 min, haltères" → séance structurée avec conseils',
    screen: 'Screenshot Mon Sport',
  },
  {
    tag: 'Weekend',
    before: '"Le weekend part dans tous les sens, on s\'ennuie ou on s\'épuise"',
    after: '"Weekend en famille à Lyon" → programme samedi + dimanche équilibré',
    screen: 'Screenshot Mon Weekend',
  },
]

const FEATURES = [
  { title: 'Dictée vocale IA', desc: 'Parle naturellement, DayTalk comprend le contexte, les horaires et les priorités.' },
  { title: '6 types de plannings', desc: 'Journée, Voyage, Projet, Weekend, Sport, Courses — un seul outil pour tout.' },
  { title: 'Sync Google & Apple', desc: 'Export .ics en un tap. Chaque étape atterrit sur la bonne date dans ton agenda.' },
  { title: 'Rappels automatiques', desc: 'Notification 15 min avant chaque tâche. Tu ne rates plus rien.' },
  { title: 'Historique illimité', desc: 'Tous tes plannings sauvegardés, consultables et modifiables à tout moment.' },
  { title: '100% mobile', desc: 'PWA installable sur iPhone et Android. Aussi rapide qu\'une app native.' },
]

/* ── Bannière installation PWA ── */
function InstallBanner() {
  const [show,    setShow]    = useState(false)
  const [isIOS,   setIsIOS]   = useState(false)
  const [dismiss, setDismiss] = useState(false)

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone
    setIsIOS(ios)
    if (ios) { setShow(true); return }
    if (window.__pwaInstallPrompt) { setShow(true); return }
    window.addEventListener('pwa-installable', () => setShow(true))
    return () => window.removeEventListener('pwa-installable', () => setShow(true))
  }, [])

  async function install() {
    if (!window.__pwaInstallPrompt) return
    window.__pwaInstallPrompt.prompt()
    const { outcome } = await window.__pwaInstallPrompt.userChoice
    if (outcome === 'accepted') setDismiss(true)
  }

  if (!show || dismiss) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'linear-gradient(135deg, #1a0f3d, #0d0b1a)',
      borderTop: '1px solid rgba(139,92,246,0.4)',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
        <img src="/icon.svg" alt="DayTalk" style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'white', margin: 0 }}>Installer DayTalk</p>
        {isIOS
          ? <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0' }}>Appuie sur <strong style={{ color: '#A78BFA' }}>Partager</strong> puis <strong style={{ color: '#A78BFA' }}>"Sur l'écran d'accueil"</strong></p>
          : <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0' }}>Ajoute l'app à ton écran d'accueil</p>
        }
      </div>
      {!isIOS && (
        <button onClick={install} style={{
          padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
          color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>Installer</button>
      )}
      <button onClick={() => setDismiss(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 20, cursor: 'pointer', flexShrink: 0, lineHeight: 1 }}>×</button>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const goAuth = () => navigate('/auth')

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>

      {/* ── STICKY NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(7,6,15,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(139,92,246,0.15)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={28} />
          <span style={{ fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: 2, fontFamily: "'Bebas Neue', sans-serif" }}>DAYTALK</span>
        </div>
        <button onClick={goAuth} style={{
          padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
          color: 'white', fontSize: 13, fontWeight: 700,
        }}>Essayer gratuitement</button>
      </nav>

      {/* ══════════════════════════════════════ */}
      {/* SECTION 1 — HERO (DARK)               */}
      {/* ══════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(160deg, #0f0824 0%, #07060f 60%, #130826 100%)',
        padding: '100px 24px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Radial glows */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Logo size={56} />
          </div>

          <div style={{ display: 'inline-block', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', letterSpacing: 1 }}>LE PREMIER PLANNEUR VOCAL</span>
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 900, color: 'white', lineHeight: 1.15, margin: '0 0 16px', letterSpacing: -0.5 }}>
            Des milliers de planneurs.<br/>
            <span style={{ background: 'linear-gradient(135deg, #C4B5FD, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Aucun ne t'écoute.
            </span>
          </h1>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: '0 0 32px' }}>
            DayTalk oui. Parle, ton planning se crée en 10 secondes — et se sync automatiquement avec ton agenda.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <CTAButton onClick={goAuth}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/></svg>
              Commencer — 14 jours gratuits
            </CTAButton>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Sans carte bancaire · Résiliable à tout moment</p>
          </div>

          {/* Phone hero mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48, gap: 16 }}>
            <PhoneMockup label="Screenshot page d'accueil" style={{ transform: 'rotate(-4deg) translateY(10px)' }} />
            <PhoneMockup label="Screenshot dictée en cours" style={{ transform: 'rotate(3deg)', zIndex: 2 }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* SECTION 2 — PROBLÈME (BLANC)          */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: '#ffffff', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#8B5CF6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Le vrai problème</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0d0b1a', lineHeight: 1.2, margin: '0 0 20px' }}>
            Tu passes plus de temps à planifier qu'à agir
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, margin: '0 0 40px' }}>
            Tu ouvres ton planner, tu tapes tes tâches une par une, tu réorganises, tu oublies de sync l'agenda… <strong style={{ color: '#0d0b1a' }}>20 minutes perdues</strong> avant même de commencer ta journée.
          </p>

          {/* Pain points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            {[
              'Tu tapes tes tâches une par une au lieu de juste les dire',
              'Ton planning ne sync pas automatiquement avec ton agenda',
              'Tu dois changer d\'app selon le type de planning (voyage, sport, projet…)',
              'Tu oublies des tâches importantes faute de rappels intelligents',
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12, padding: '14px 16px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.5 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* SECTION 3 — COMMENT ÇA MARCHE (DARK)  */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(160deg, #0d0b1a 0%, #130826 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#8B5CF6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Simple comme bonjour</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1.2, margin: '0 0 40px' }}>
            De la voix à l'agenda<br/>en 3 étapes
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16, textAlign: 'left',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(7,5,18,0.6) 100%)',
                backdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 14, padding: '20px 18px',
              }}>
                <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.svg}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(139,92,246,0.6)', letterSpacing: 1 }}>{s.n}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>{s.title}</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Screenshot "comment ça marche" */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
            <PhoneMockup label="Screenshot résultat planning généré" style={{ width: 220, height: 440 }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* SECTION 4 — USE CASES (BLANC)         */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: '#f8fafc', padding: '72px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#8B5CF6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>Pour tous tes besoins</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0d0b1a', lineHeight: 1.2, margin: '0 0 8px', textAlign: 'center' }}>
            Un seul outil.<br/>Toutes les situations.
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', textAlign: 'center', margin: '0 0 40px', lineHeight: 1.6 }}>
            Arrête de jongler entre 6 apps différentes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {USE_CASES.map((u, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
                {/* Screenshot placeholder */}
                <div style={{ background: '#0d0b1a', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  <p style={{ fontSize: 11, color: 'rgba(139,92,246,0.4)', margin: 0, fontFamily: 'Inter, sans-serif' }}>{u.screen}</p>
                </div>
                <div style={{ padding: '20px 18px' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8B5CF6', letterSpacing: 1, textTransform: 'uppercase', background: '#f3f0ff', padding: '3px 10px', borderRadius: 20 }}>{u.tag}</span>
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </div>
                      <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{u.before}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      <p style={{ fontSize: 13, color: '#111827', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{u.after}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* SECTION 5 — FEATURES (DARK)           */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(160deg, #0d0b1a 0%, #130826 100%)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#8B5CF6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>Ce que tu obtiens</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1.2, margin: '0 0 40px', textAlign: 'center' }}>
            Tout ce qu'un planneur<br/>devrait faire
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '18px 14px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B5CF6', boxShadow: '0 0 8px rgba(139,92,246,0.8)', marginBottom: 10 }} />
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'white', margin: '0 0 6px', lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Screenshot features */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48 }}>
            <PhoneMockup label="Screenshot Smart Planning" style={{ transform: 'rotate(-3deg)' }} />
            <PhoneMockup label="Screenshot Export agenda" style={{ transform: 'rotate(2deg)', zIndex: 2 }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* SECTION 6 — PRICING (BLANC)           */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: '#ffffff', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#8B5CF6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Tarif</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0d0b1a', lineHeight: 1.2, margin: '0 0 8px' }}>
            Moins cher qu'un café.<br/>Bien plus utile.
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 32px', lineHeight: 1.6 }}>
            14 jours gratuits pour tester sans engagement. Aucune carte bancaire requise.
          </p>

          <div style={{ background: 'linear-gradient(135deg, #f3f0ff, #faf5ff)', border: '2px solid #c4b5fd', borderRadius: 20, padding: '32px 24px', marginBottom: 16 }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: 'white', borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 16 }}>
              OFFRE DE LANCEMENT
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 56, fontWeight: 900, color: '#0d0b1a', lineHeight: 1 }}>4,99</span>
              <span style={{ fontSize: 20, color: '#6b7280', fontWeight: 700 }}>€</span>
              <span style={{ fontSize: 16, color: '#6b7280', fontWeight: 600 }}>/mois</span>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>après 14 jours d'essai gratuit</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 24 }}>
              {['14 jours d\'essai offerts — sans carte', 'Accès à toutes les fonctionnalités', 'Sync automatique avec ton agenda', 'Résiliable en 1 clic, quand tu veux'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
            <CTAButton onClick={goAuth}>Démarrer mon essai gratuit</CTAButton>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>Paiement sécurisé · Aucun engagement · Résiliable à tout moment</p>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* SECTION 7 — CTA FINAL (DARK)          */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(160deg, #0f0824 0%, #07060f 100%)', padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
          <Logo size={48} />
          <h2 style={{ fontSize: 32, fontWeight: 900, color: 'white', lineHeight: 1.2, margin: '20px 0 12px' }}>
            Arrête de taper.<br/>
            <span style={{ background: 'linear-gradient(135deg, #C4B5FD, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Commence à parler.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', margin: '0 0 32px', lineHeight: 1.65 }}>
            Rejoins les utilisateurs qui planifient en 10 secondes chrono.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <CTAButton onClick={goAuth}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/></svg>
              Essayer gratuitement 14 jours
            </CTAButton>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Sans carte bancaire · Résiliable à tout moment</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#07060f', padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(139,92,246,0.1)' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>© 2025 DayTalk · Le planneur vocal</p>
      </footer>

      {/* ── Bannière install PWA fixée en bas ── */}
      <InstallBanner />

    </div>
  )
}
