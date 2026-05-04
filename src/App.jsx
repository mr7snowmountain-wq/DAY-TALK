import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { playDrop } from './hooks/useTap'
import AuthPage          from './pages/AuthPage'
import OnboardingPage    from './pages/OnboardingPage'
import HomePage          from './pages/HomePage'
import PlanningPage      from './pages/PlanningPage'
import SmartPlanningPage from './pages/SmartPlanningPage'
import WeekPage          from './pages/WeekPage'
import ProfilPage        from './pages/ProfilPage'
import PaywallPage       from './pages/PaywallPage'

function Loader() {
  return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, margin: '0 auto 20px', background: 'radial-gradient(circle at 38% 32%, rgba(196,181,253,0.18) 0%, rgba(26,18,50,0.95) 100%)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(139,92,246,0.4)', animation: 'pulse 1.5s ease-in-out infinite' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="11" rx="3" fill="rgba(255,255,255,0.85)"/>
            <path d="M5 10a7 7 0 0014 0" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 19v3M9 22h6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p style={{ fontFamily: 'var(--font)', fontStyle: 'italic', color: 'var(--text-soft)' }}>Chargement…</p>
      </div>
    </div>
  )
}

function Guard({ children }) {
  const { user, loading, isPremium, trialExpired } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/" replace />
  if (trialExpired && !isPremium) return <Navigate to="/paywall" replace />
  return children
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader />
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={profile?.onboarding_complete ? '/home' : '/onboarding'} replace /> : <AuthPage />} />
      <Route path="/onboarding" element={<Guard>{profile?.onboarding_complete ? <Navigate to="/home" replace /> : <OnboardingPage />}</Guard>} />
      <Route path="/home"     element={<Guard><HomePage /></Guard>} />
      <Route path="/planning" element={<Guard><PlanningPage /></Guard>} />
      <Route path="/smart"    element={<Guard><SmartPlanningPage /></Guard>} />
      <Route path="/week"     element={<Guard><WeekPage /></Guard>} />
      <Route path="/profil"   element={<Guard><ProfilPage /></Guard>} />
      <Route path="/paywall"  element={<PaywallPage />} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function GlobalTap() {
  useEffect(() => {
    function handlePointer(e) {
      const el = e.target.closest('button, a, [role="button"]')
      if (!el || el.disabled || el.getAttribute('disabled') !== null) return
      playDrop()
      el.classList.remove('tap-bounce')
      void el.offsetWidth
      el.classList.add('tap-bounce')
      el.addEventListener('animationend', () => el.classList.remove('tap-bounce'), { once: true })
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalTap />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
