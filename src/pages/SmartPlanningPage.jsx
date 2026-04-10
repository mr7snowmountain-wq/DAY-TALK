import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

/* ── Keyframes ── */
const STYLES = `
@keyframes sonar {
  0%   { transform: scale(1);   opacity: 0.65; }
  100% { transform: scale(2.8); opacity: 0;    }
}
@keyframes mic-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50%       { transform: translateY(-5px) scale(1.03); }
}
@keyframes spin-ring {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
`
if (typeof document !== 'undefined' && !document.getElementById('smart-planning-styles')) {
  const s = document.createElement('style')
  s.id = 'smart-planning-styles'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ── Config par thème ── */
const THEMES = {
  journee: {
    label: 'Ma Journée Intelligente',
    icon: '/icon/Ma Journée Intelligente.png',
    color: '#00C2B8',
    gradient: 'linear-gradient(135deg, #00C2B8, #2B5CE6)',
    consigne: 'Dis-moi tes tâches, réunions et priorités du jour. Mentionne les horaires si tu les connais.',
    exemple: '"Réunion à 9h, finir le rapport avant midi, déjeuner avec Marie, call client 15h"',
    prompt: (text) => `Tu es DayTalk, un assistant de planning intelligent. À partir de ce texte, crée un plan de journée optimisé.
Retourne UNIQUEMENT un JSON valide (sans markdown) avec ce format exact :
{"steps":[{"time":"09:00","duration":"1h","title":"Réunion équipe","desc":"Point hebdomadaire","emoji":"👥","color":"#00C2B8"}]}
Règles : ordonne par heure logique, estime la durée si non précisée, emoji pertinent, alterne les couleurs entre #00C2B8 #2B5CE6 #00E5D4 #0D1B4B.
Texte : "${text}"`,
  },
  voyage: {
    label: 'Mon Voyage Intelligent',
    icon: '/icon/Mon Voyage Intelligent.png',
    color: '#2B5CE6',
    gradient: 'linear-gradient(135deg, #2B5CE6, #00C2B8)',
    consigne: 'Dis-moi ta destination, la durée du séjour, ton budget et ce que tu aimes (culture, gastronomie, nature, shopping…)',
    exemple: '"Paris, 3 jours, budget moyen, j\'aime l\'art et la bonne cuisine"',
    prompt: (text) => `Tu es DayTalk, un assistant voyage intelligent. À partir de ce texte, crée un itinéraire de voyage complet.
Retourne UNIQUEMENT un JSON valide (sans markdown) avec ce format exact :
{"steps":[{"time":"Jour 1 - 09:00","duration":"2h","title":"Musée du Louvre","desc":"Collections impressionnistes, entrée 17€","emoji":"🏛️","color":"#2B5CE6"}]}
Règles : structure par jours et heures, inclus restos/cafés, monuments, activités, conseils pratiques, emoji pertinent, alterne les couleurs.
Texte : "${text}"`,
  },
  projet: {
    label: 'Mon Projet Intelligent',
    icon: '/icon/Mon Projet Intelligent.png',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #2B5CE6)',
    consigne: 'Décris ton projet, sa deadline, les ressources disponibles et les obstacles potentiels.',
    exemple: '"Créer un site web pour mon client, deadline dans 2 semaines, je travaille seul, pas de design fourni"',
    prompt: (text) => `Tu es DayTalk, un assistant de gestion de projet. À partir de ce texte, crée un plan de projet structuré.
Retourne UNIQUEMENT un JSON valide (sans markdown) avec ce format exact :
{"steps":[{"time":"Étape 1","duration":"2 jours","title":"Brief & Maquettes","desc":"Définir les besoins et créer les wireframes","emoji":"📐","color":"#7C3AED"}]}
Règles : décompose en étapes logiques avec durées estimées, identifie les priorités et dépendances, emoji pertinent, alterne les couleurs entre #7C3AED #2B5CE6 #00C2B8.
Texte : "${text}"`,
  },
  weekend: {
    label: 'Mon Weekend Intelligent',
    icon: '/icon/Mon Weekend Intelligent.png',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    consigne: 'Dis-moi avec qui tu passes le weekend, où tu es, et tes envies (repos, sorties, famille, activités…)',
    exemple: '"Weekend en famille avec 2 enfants à Lyon, on aime les parcs et la bonne bouffe"',
    prompt: (text) => `Tu es DayTalk, un assistant de planification de weekend. À partir de ce texte, crée un programme de weekend équilibré.
Retourne UNIQUEMENT un JSON valide (sans markdown) avec ce format exact :
{"steps":[{"time":"Samedi 10:00","duration":"2h","title":"Parc de la Tête d'Or","desc":"Promenade et pique-nique en famille","emoji":"🌳","color":"#F59E0B"}]}
Règles : équilibre activités et repos, adapte au profil (famille/couple/solo), inclus repas et moments de détente, emoji chaleureux.
Texte : "${text}"`,
  },
  sport: {
    label: 'Mon Sport Intelligent',
    icon: '/icon/Mon Sport Intelligent.png',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #00C2B8)',
    consigne: 'Dis-moi ton objectif sportif, ton niveau actuel, le temps disponible et le matériel que tu as.',
    exemple: '"Je veux perdre du poids, débutant, 45 minutes, juste des haltères à la maison"',
    prompt: (text) => `Tu es DayTalk, un coach sportif intelligent. À partir de ce texte, crée une séance de sport structurée.
Retourne UNIQUEMENT un JSON valide (sans markdown) avec ce format exact :
{"steps":[{"time":"00:00","duration":"10 min","title":"Échauffement","desc":"Rotations articulaires + footing léger","emoji":"🔥","color":"#10B981"}]}
Règles : structure en phases (échauffement, corps, récupération), adapte au niveau et matériel, donne les séries/reps si pertinent, emoji sportif.
Texte : "${text}"`,
  },
  courses: {
    label: 'Mes Courses Intelligentes',
    icon: '/icon/Mes Courses Intelligentes.png',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #F59E0B)',
    consigne: 'Dis-moi ce dont tu as besoin. Je vais organiser ta liste par rayon et par priorité.',
    exemple: '"Du lait, des pâtes, du poulet, du shampoing, des tomates, du café et du pain"',
    prompt: (text) => `Tu es DayTalk, un assistant courses intelligent. À partir de ce texte, organise la liste de courses par catégorie.
Retourne UNIQUEMENT un JSON valide (sans markdown) avec ce format exact :
{"steps":[{"time":"Rayon 1","duration":"","title":"Fruits & Légumes","desc":"Tomates, salade, carottes","emoji":"🥦","color":"#10B981"}]}
Règles : regroupe par rayon (Fruits/Légumes, Viandes, Produits laitiers, Épicerie, Hygiène…), liste les articles dans desc, emoji par catégorie, couleurs variées.
Texte : "${text}"`,
  },
}

/* ── Appel Claude ── */
async function callClaude(prompt) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) throw new Error('Erreur API')
  const data = await res.json()
  const raw  = data.content[0].text.trim()
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('JSON introuvable')
  return JSON.parse(match[0])
}

/* ── Sauvegarder ── */
async function savePlan(theme, steps, userId) {
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase.from('dt_plannings').upsert(
    { user_id: userId, date: today, tasks: steps, theme, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,date' }
  )
  if (error) console.error('Save error:', error)
}

/* ── Bouton micro ── */
function MicButton({ status, onStart, onStop, color }) {
  const isListening = status === 'listening'
  const isLoading   = status === 'loading'
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 130, height: 130 }}>
      {isListening && [0,1,2].map(i => (
        <span key={i} style={{
          position: 'absolute', width: 84, height: 84, borderRadius: '50%',
          background: `radial-gradient(circle, ${color}44, ${color}11)`,
          animation: `sonar 2s ease-out ${i*0.65}s infinite`, pointerEvents: 'none',
        }}/>
      ))}
      {isLoading && (
        <span style={{
          position: 'absolute', width: 100, height: 100, borderRadius: '50%',
          border: `3px solid ${color}33`, borderTopColor: color,
          animation: 'spin-ring 1s linear infinite', pointerEvents: 'none',
        }}/>
      )}
      <button onClick={isListening ? onStop : onStart} disabled={isLoading} style={{
        position: 'relative', zIndex: 2,
        width: 84, height: 84, borderRadius: '50%', border: 'none',
        background: isListening ? color + 'cc' : color,
        color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer',
        boxShadow: `0 6px 28px ${color}66`,
        animation: (!isListening && !isLoading) ? 'mic-float 3s ease-in-out infinite' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem', opacity: isLoading ? 0.85 : 1, transition: 'background 0.3s',
      }}>
        {isLoading ? '🎙' : isListening ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="11" rx="3" fill="white"/>
            <path d="M5 10a7 7 0 0014 0" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M12 19v3M9 22h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        )}
      </button>
    </div>
  )
}

/* ── Timeline ── */
function TimelinePlan({ steps }) {
  return (
    <div style={{ width: '100%', padding: '0 4px' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}>
          {/* Ligne verticale + point */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: step.color + '22',
              border: `2px solid ${step.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>
              {step.emoji}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 2, flex: 1, minHeight: 32,
                background: `linear-gradient(to bottom, ${step.color}88, ${steps[i+1]?.color || step.color}44)`,
                margin: '4px 0',
              }}/>
            )}
          </div>

          {/* Contenu */}
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.7)',
            border: `1.5px solid ${step.color}33`,
            borderRadius: 16, padding: '12px 16px',
            marginBottom: i < steps.length - 1 ? 0 : 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: step.color, margin: 0 }}>{step.time}</p>
              {step.duration && (
                <span style={{
                  fontSize: 11, fontWeight: 600, color: step.color,
                  background: step.color + '18', borderRadius: 20, padding: '2px 8px',
                }}>
                  {step.duration}
                </span>
              )}
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-dark)', margin: '2px 0 4px' }}>{step.title}</p>
            {step.desc && <p style={{ fontSize: 12, color: 'var(--text-soft)', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Page principale ── */
export default function SmartPlanningPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user }  = useAuth()
  const themeKey  = params.get('theme') || 'journee'
  const theme     = THEMES[themeKey] || THEMES.journee

  const [steps,      setSteps]      = useState([])
  const [status,     setStatus]     = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [errorMsg,   setErrorMsg]   = useState('')

  const statusRef          = useRef('idle')
  const finalTranscriptRef = useRef('')
  const isProcessingRef    = useRef(false)

  useEffect(() => { return () => stopRec() }, [])

  function stopRec() {
    try { window.__dtSmartRec?.stop() } catch {}
    window.__dtSmartRec = null
  }

  async function doProcess() {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    stopRec()
    const text = finalTranscriptRef.current.trim()
    if (!text) { setStatus('idle'); statusRef.current = 'idle'; isProcessingRef.current = false; return }
    setStatus('loading'); statusRef.current = 'loading'
    try {
      const result = await callClaude(theme.prompt(text))
      setSteps(result.steps || [])
      if (user) await savePlan(themeKey, result.steps || [], user.id)
      setStatus('done'); statusRef.current = 'done'
    } catch {
      setErrorMsg("Je n'ai pas réussi à analyser. Réessaie 🎙")
      setStatus('error'); statusRef.current = 'error'
    }
    isProcessingRef.current = false
  }

  function buildRec() {
    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'fr-FR'; rec.continuous = false; rec.interimResults = true
    window.__dtSmartRec = rec
    rec.onstart  = () => { setStatus('listening'); statusRef.current = 'listening' }
    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscriptRef.current += e.results[i][0].transcript + ' '
        else interim = e.results[i][0].transcript
      }
      setTranscript(finalTranscriptRef.current + interim)
    }
    rec.onerror = (e) => { if (e.error === 'no-speech') return; setErrorMsg('Erreur micro : ' + e.error); setStatus('error'); statusRef.current = 'error' }
    rec.onend   = () => { if (statusRef.current === 'listening') buildRec().start() }
    return rec
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setErrorMsg("Ton navigateur ne supporte pas le micro. Essaie Chrome."); setStatus('error'); return }
    finalTranscriptRef.current = ''; isProcessingRef.current = false
    setTranscript(''); buildRec().start()
  }

  function stopListening() { statusRef.current = 'loading'; setStatus('loading'); stopRec(); doProcess() }

  function reset() {
    setSteps([]); setTranscript(''); setStatus('idle')
    statusRef.current = 'idle'; finalTranscriptRef.current = ''
    isProcessingRef.current = false; setErrorMsg('')
  }

  return (
    <div className="app-shell">
      <div className="screen" style={{ paddingTop: 0, paddingBottom: 110, gap: 0, justifyContent: 'flex-start' }}>

        {/* Header */}
        <div style={{
          width: '100%', background: theme.gradient,
          borderRadius: '0 0 28px 28px', padding: '52px 24px 24px',
          marginBottom: 24, boxShadow: `0 6px 24px ${theme.color}33`,
        }}>
          <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', marginBottom: 8 }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={theme.icon} alt="" style={{ width: 52, height: 52, objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}/>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>{theme.label}</h1>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>Dicte, je structure tout pour toi 🚀</p>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', padding: '0 4px' }}>

          {/* Zone micro */}
          {status !== 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>

              {/* Mini consignes */}
              {status === 'idle' && (
                <div style={{
                  width: '100%', background: theme.color + '12',
                  border: `1.5px solid ${theme.color}33`,
                  borderRadius: 16, padding: '14px 18px', marginBottom: 24,
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: theme.color, marginBottom: 6 }}>💡 Comment dicter ?</p>
                  <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: '0 0 8px', lineHeight: 1.55 }}>{theme.consigne}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-hint)', margin: 0, fontStyle: 'italic' }}>Ex : {theme.exemple}</p>
                </div>
              )}

              <MicButton status={status} onStart={startListening} onStop={stopListening} color={theme.color} />

              <p style={{ marginTop: 8, color: 'var(--text-soft)', fontSize: '0.85rem', textAlign: 'center', minHeight: 22 }}>
                {status === 'idle'      && 'Appuie et dicte'}
                {status === 'listening' && '🔴 Je t\'écoute… appuie ⏹ pour terminer'}
                {status === 'loading'   && 'Je structure ton plan…'}
              </p>

              {transcript && (
                <div className="card" style={{ marginTop: 14, padding: '12px 16px', width: '100%' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-hint)', margin: 0, lineHeight: 1.55 }}>
                    <em>"{transcript}"</em>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Erreur */}
          {status === 'error' && (
            <div className="error-banner" style={{ marginBottom: 20 }}>
              {errorMsg}
              <button onClick={reset} style={{ background: 'none', border: 'none', color: theme.color, fontWeight: 700, cursor: 'pointer', marginLeft: 8 }}>Réessayer</button>
            </div>
          )}

          {/* Timeline */}
          {steps.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Ton plan ✨</h2>
                <span style={{ fontSize: 12, color: theme.color, fontWeight: 700 }}>{steps.length} étapes</span>
              </div>
              <TimelinePlan steps={steps} />
              <button onClick={reset} className="btn btn-ghost" style={{ width: '100%', marginTop: 24 }}>
                🎙 Recommencer
              </button>
            </>
          )}

        </div>
      </div>
      <BottomNav />
    </div>
  )
}
