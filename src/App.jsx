import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage          from './pages/AuthPage'
import OnboardingPage    from './pages/OnboardingPage'
import HomePage          from './pages/HomePage'
import PlanningPage      from './pages/PlanningPage'
import SmartPlanningPage from './pages/SmartPlanningPage'
import WeekPage          from './pages/WeekPage'
import ProfilPage        from './pages/ProfilPage'

function Loader() {
  return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, margin: '0 auto 16px', background: 'linear-gradient(135deg,#00C2B8,#2B5CE6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, animation: 'pulse 1.5s ease-in-out infinite' }}>🎙</div>
        <p style={{ fontFamily: 'var(--font)', fontStyle: 'italic', color: 'var(--text-soft)' }}>Chargement…</p>
      </div>
    </div>
  )
}

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  return user ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  const { user, profile } = useAuth()
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={profile?.onboarding_complete ? '/home' : '/onboarding'} replace /> : <AuthPage />} />
      <Route path="/onboarding" element={<Guard>{profile?.onboarding_complete ? <Navigate to="/home" replace /> : <OnboardingPage />}</Guard>} />
      <Route path="/home"     element={<Guard><HomePage /></Guard>} />
      <Route path="/planning" element={<Guard><PlanningPage /></Guard>} />
      <Route path="/smart"    element={<Guard><SmartPlanningPage /></Guard>} />
      <Route path="/week"     element={<Guard><WeekPage /></Guard>} />
      <Route path="/profil"   element={<Guard><ProfilPage /></Guard>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
