import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// ⚠️ Remplace par ton vrai checkout URL LemonSqueezy
const LEMON_CHECKOUT_URL = 'REMPLACER_PAR_TON_URL_LEMONSQUEEZY'
const PRICE = '4,99 €'

const FEATURES = [
  { svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/></svg>, label: 'Dictée vocale illimitée' },
  { svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>, label: 'Smart Planning (tous les thèmes)' },
  { svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>, label: 'Export agenda Google / Apple' },
  { svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>, label: 'Rappels & notifications' },
  { svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>, label: 'Historique illimité' },
]

export default function PaywallPage() {
  const { user, isPremium } = useAuth()
  const navigate = useNavigate()
  const [planCount, setPlanCount] = useState(0)

  // Si déjà premium → retour home
  useEffect(() => {
    if (isPremium) navigate('/home', { replace: true })
  }, [isPremium])

  // Nombre de plannings créés pendant le trial
  useEffect(() => {
    if (!user) return
    supabase.from('dt_plannings').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setPlanCount(count || 0))
  }, [user])

  function goCheckout() {
    if (!user) return
    // On passe l'user_id en custom_data pour que le webhook sache qui débloquer
    const url = `${LEMON_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}&checkout[email]=${encodeURIComponent(user.email)}`
    window.open(url, '_blank')
  }

  return (
    <div className="app-shell">
      <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 0, paddingBottom: 48 }}>

        {/* Header sombre */}
        <div style={{
          width: '100%',
          background: 'linear-gradient(160deg, #1a0f3d 0%, #0d0b1a 100%)',
          borderRadius: '0 0 20px 20px',
          padding: '52px 24px 32px',
          marginBottom: 28,
          boxShadow: '0 8px 32px rgba(139,92,246,0.2), inset 0 -1px 0 rgba(139,92,246,0.28)',
          textAlign: 'center',
        }}>
          {/* Orbe décoratif */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: 'radial-gradient(circle at 38% 32%, rgba(196,181,253,0.18) 0%, rgba(26,18,50,0.95) 60%, rgba(13,11,26,0.98) 100%)',
            border: '1px solid rgba(139,92,246,0.45)',
            boxShadow: '0 0 35px rgba(139,92,246,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="11" rx="3" fill="rgba(255,255,255,0.88)"/>
              <path d="M5 10a7 7 0 0014 0" stroke="rgba(255,255,255,0.88)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 19v3M9 22h6" stroke="rgba(255,255,255,0.88)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', margin: '0 0 8px', letterSpacing: 0.3 }}>
            Ton mois d'essai est terminé
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
            Tu as créé <span style={{ color: '#A78BFA', fontWeight: 700 }}>{planCount} planning{planCount > 1 ? 's' : ''}</span> avec DayTalk.{'\n'}Continue à planifier sans limite.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Card prix */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(7,5,18,0.8) 100%)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(139,92,246,0.35)',
            borderRadius: 16, padding: '24px 20px', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(139,92,246,0.15)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Abonnement mensuel</p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: 'white', lineHeight: 1 }}>{PRICE.split(' ')[0]}</span>
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>€ / mois</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Résiliable à tout moment</p>
          </div>

          {/* Features */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Ce qui est inclus</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#A78BFA',
                  }}>
                    {f.svg}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{f.label}</span>
                  <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button onClick={goCheckout} style={{
            width: '100%', padding: '18px', border: 'none', borderRadius: 14,
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 6px 28px rgba(139,92,246,0.5)',
            letterSpacing: 0.3,
          }}>
            Continuer pour {PRICE} / mois
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 1.6 }}>
            Paiement sécurisé via LemonSqueezy<br/>
            Accès débloqué immédiatement après paiement
          </p>

        </div>
      </div>
    </div>
  )
}
