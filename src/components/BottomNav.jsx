import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/home',     label: 'Accueil',  Icon: HomeIcon   },
  { path: '/planning', label: 'Planning', Icon: CalIcon    },
  { path: null,        label: '',         Icon: null, fab: true },
  { path: '/week',     label: 'Semaine',  Icon: WeekIcon   },
  { path: '/profil',   label: 'Profil',   Icon: UserIcon   },
]

function HomeIcon({ active }) {
  const s = active ? '#00C2B8' : '#9BB5D0'
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 10L12 3l9 7v10a1 1 0 01-1 1H5a1 1 0 01-1-1V10z" stroke={s} strokeWidth="1.8" strokeLinejoin="round" fill={active ? 'rgba(0,194,184,0.12)' : 'none'}/>
    <path d="M9 21V13h6v8" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
}
function CalIcon({ active }) {
  const s = active ? '#00C2B8' : '#9BB5D0'
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="17" rx="3" stroke={s} strokeWidth="1.8" fill={active ? 'rgba(0,194,184,0.1)' : 'none'}/>
    <path d="M3 9h18M8 2v4M16 2v4" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="8" cy="14" r="1.2" fill={s}/><circle cx="12" cy="14" r="1.2" fill={s}/><circle cx="16" cy="14" r="1.2" fill={s}/>
  </svg>
}
function WeekIcon({ active }) {
  const s = active ? '#00C2B8' : '#9BB5D0'
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke={s} strokeWidth="1.8" fill={active ? 'rgba(0,194,184,0.1)' : 'none'}/>
    <path d="M3 9h18M9 3v18" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
}
function UserIcon({ active }) {
  const s = active ? '#00C2B8' : '#9BB5D0'
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={s} strokeWidth="1.8" fill={active ? 'rgba(0,194,184,0.1)' : 'none'}/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
}

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(0,194,184,0.2)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '8px 8px calc(8px + env(safe-area-inset-bottom))',
      boxShadow: '0 -4px 24px rgba(0,194,184,0.07)',
    }}>
      {TABS.map((tab, i) => {
        if (tab.fab) return (
          <button key="fab" onClick={() => navigate('/planning')} style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #00C2B8, #2B5CE6)',
            border: '3px solid white', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginTop: -20,
            boxShadow: '0 4px 18px rgba(0,194,184,0.45)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="11" rx="3" fill="white"/>
              <path d="M5 10a7 7 0 0014 0" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M12 19v3M9 22h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        )
        const active = pathname === tab.path
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 10px', borderRadius: 12,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: active ? 'rgba(0,194,184,0.1)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <tab.Icon active={active} />
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? 'var(--teal)' : 'var(--text-hint)' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
