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
    icon: '/icon/smart-journee.png',
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
    icon: '/icon/smart-voyage.png',
    color: '#2B5CE6',
    gradient: 'linear-gradient(135deg, #2B5CE6, #00C2B8)',
    consigne: 'Dis-moi ta destination, la durée, tes centres d\'intérêt (culture, gastronomie, nature, shopping…) et ton budget.',
    exemple: '"Paris, 3 jours, budget moyen, j\'aime l\'art et la bonne cuisine"',
    prompt: (text) => `Tu es DayTalk, un expert voyage qui connaît parfaitement les destinations. Crée un itinéraire détaillé et concret.
Retourne UNIQUEMENT un JSON valide (sans markdown) :
{"steps":[{"time":"Jour 1 - 09:00","duration":"2h","title":"Musée d'Orsay","desc":"Chef-d'œuvre de l'impressionnisme. Réserve en ligne pour éviter la queue. Tarif : 16€. Métro : Solférino (L12).","emoji":"🖼️","color":"#2B5CE6"}]}
Règles STRICTES :
- Minimum 8 étapes, maximum 15
- Chaque étape DOIT avoir un titre précis (vrai lieu/resto/activité), une description utile (prix, transport, conseil pratique, horaires réels)
- Structure : matin/midi/après-midi/soir pour chaque jour
- Inclus TOUJOURS 1-2 restaurants avec noms réels et spécialités
- Adapte aux préférences mentionnées (culture, gastronomie, sport, nature...)
- Donne des vrais conseils d'insider (meilleures heures, astuces, à éviter)
- Alterne les couleurs : #2B5CE6 #00C2B8 #7C3AED #F59E0B #10B981
Texte : "${text}"`,
  },
  projet: {
    label: 'Mon Projet Intelligent',
    icon: '/icon/smart-projet.png',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #2B5CE6)',
    consigne: 'Décris ton projet, sa deadline, tes ressources disponibles et les obstacles potentiels.',
    exemple: '"Lancer une boutique en ligne de vêtements, deadline 1 mois, seul, budget 500€"',
    prompt: (text) => `Tu es DayTalk, un expert en gestion de projet et stratégie. Crée un plan de projet actionnable et détaillé.
Retourne UNIQUEMENT un JSON valide (sans markdown) :
{"steps":[{"time":"Semaine 1","duration":"3 jours","title":"Cadrage & Research","desc":"Définir le MVP, analyser les 3 concurrents principaux, identifier les risques clés. Livrables : brief projet + benchmark.","emoji":"🎯","color":"#7C3AED"}]}
Règles STRICTES :
- Minimum 7 étapes, maximum 12
- Chaque étape a un livrable concret et des actions précises à faire
- Identifie les dépendances (ex: "⚠️ Bloquant : avoir X avant de commencer")
- Donne des outils/ressources recommandés (Figma, Notion, Stripe...)
- Estime le temps de manière réaliste avec marge
- Anticipe les risques pour chaque phase critique
- Inclus une étape de validation/test avant le lancement
- Alterne : #7C3AED #2B5CE6 #00C2B8 #F59E0B #EF4444
Texte : "${text}"`,
  },
  weekend: {
    label: 'Mon Weekend Intelligent',
    icon: '/icon/smart-weekend.png',
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
    icon: '/icon/smart-sport.png',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #00C2B8)',
    consigne: 'Dis-moi ton objectif (perte de poids, muscle, endurance…), ton niveau, le temps dispo et le matériel.',
    exemple: '"Perdre du ventre, débutant, 45 min, haltères 10kg à la maison"',
    prompt: (text) => `Tu es DayTalk, un coach sportif certifié. Crée une séance d'entraînement complète, précise et adaptée.
Retourne UNIQUEMENT un JSON valide (sans markdown) :
{"steps":[{"time":"00:00","duration":"8 min","title":"Échauffement cardio","desc":"2 min jumping jacks → 2 min montées de genoux → 2 min talons-fesses → 2 min bras en croix. Objectif : élever le rythme cardiaque progressivement.","emoji":"🔥","color":"#10B981"}]}
Règles STRICTES :
- Minimum 6 étapes, maximum 10
- Chaque exercice : nombre de séries × répétitions OU durée précise + temps de repos
- Explique la technique correcte en 1 phrase pour éviter les blessures
- Adapte EXACTEMENT au matériel disponible (si pas de matériel → exercices au poids du corps)
- Adapte l'intensité au niveau (débutant = moins de volume, pro = plus d'intensité)
- Inclus TOUJOURS : échauffement, exercices principaux par zones ciblées, récupération/étirements
- Donne un conseil nutrition lié à l'objectif dans la dernière étape
- Alterne : #10B981 #00C2B8 #2B5CE6 #F59E0B #EF4444
Texte : "${text}"`,
  },
  courses: {
    label: 'Mes Courses Intelligentes',
    icon: '/icon/smart-courses.png',
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

/* ── Export .ics ── */
function exportToIcs(steps, label, date) {
  const today = date || localDate()
  const [year, month, day] = today.split('-').map(Number)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DayTalk//AI Planning//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  steps.forEach((step, i) => {
    // Extraire l'heure si format "HH:MM" ou "Jour X - HH:MM"
    const timeMatch = (step.time || '').match(/(\d{1,2}):(\d{2})/)
    let startH = 9 + i, startM = 0
    if (timeMatch) { startH = parseInt(timeMatch[1]); startM = parseInt(timeMatch[2]) }

    // Durée en minutes
    const durMatch = (step.duration || '').match(/(\d+)\s*(h|min)/)
    let durMin = 60
    if (durMatch) durMin = durMatch[2] === 'h' ? parseInt(durMatch[1]) * 60 : parseInt(durMatch[1])

    const pad = n => String(n).padStart(2, '0')
    const dtStart = `${year}${pad(month)}${pad(day)}T${pad(startH)}${pad(startM)}00`
    const endH = startH + Math.floor((startM + durMin) / 60)
    const endM = (startM + durMin) % 60
    const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(endH)}${pad(endM)}00`

    lines.push(
      'BEGIN:VEVENT',
      `UID:daytalk-${today}-${i}@daytalk.app`,
      `DTSTAMP:${dtStart}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${step.emoji || ''} ${step.title || step.tache || ''}`.trim(),
      `DESCRIPTION:${step.desc || ''}`,
      'END:VEVENT',
    )
  })

  lines.push('END:VCALENDAR')

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `daytalk-${label.toLowerCase().replace(/\s+/g, '-')}-${today}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

/* ── Sauvegarder ── */
function localDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

async function savePlan(theme, steps, userId, date) {
  const day = date || localDate()
  const { data: existing } = await supabase
    .from('dt_plannings').select('id')
    .eq('user_id', userId).eq('date', day).eq('theme', theme)
    .maybeSingle()
  if (existing) {
    await supabase.from('dt_plannings')
      .update({ tasks: steps, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('dt_plannings')
      .insert({ user_id: userId, date: day, tasks: steps, theme, updated_at: new Date().toISOString() })
  }
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

/* ── Timeline avec édition ── */
function TimelinePlan({ steps, onUpdate }) {
  const [editing, setEditing] = useState(null) // index de l'étape en cours d'édition
  const [draft,   setDraft]   = useState({})

  function openEdit(i) {
    setEditing(i)
    setDraft({ title: steps[i].title, desc: steps[i].desc || '', time: steps[i].time, duration: steps[i].duration || '' })
  }

  function saveEdit() {
    const updated = steps.map((s, i) => i === editing ? { ...s, ...draft } : s)
    onUpdate(updated)
    setEditing(null)
  }

  return (
    <div style={{ width: '100%', padding: '0 4px' }}>
      {/* Modal édition */}
      {editing !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(13,27,75,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setEditing(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', background: 'white', borderRadius: '24px 24px 0 0',
            padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Modifier l'étape</h3>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-hint)' }}>×</button>
            </div>
            {[
              { key: 'time', label: 'Heure / Moment' },
              { key: 'duration', label: 'Durée' },
              { key: 'title', label: 'Titre' },
            ].map(f => (
              <div key={f.key} className="field">
                <label>{f.label}</label>
                <input value={draft[f.key] || ''} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="field">
              <label>Description / Notes</label>
              <textarea value={draft.desc || ''} onChange={e => setDraft(d => ({ ...d, desc: e.target.value }))}
                rows={3} style={{
                  width: '100%', background: 'rgba(255,255,255,0.8)',
                  border: '1.5px solid rgba(0,194,184,0.25)', borderRadius: 16,
                  padding: '12px 16px', fontFamily: 'var(--font)', fontSize: 14,
                  color: 'var(--text-dark)', outline: 'none', resize: 'none',
                }}/>
            </div>
            <button onClick={saveEdit} className="btn btn-primary">Enregistrer</button>
          </div>
        </div>
      )}

      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}>
          {/* Ligne verticale + point */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: step.color + '22', border: `2px solid ${step.color}`,
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

          {/* Contenu — tap pour éditer */}
          <div onClick={() => openEdit(i)} style={{
            flex: 1, background: 'rgba(255,255,255,0.7)',
            border: `1.5px solid ${step.color}33`,
            borderRadius: 16, padding: '12px 16px', cursor: 'pointer',
            marginBottom: 0, position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: step.color, margin: 0 }}>{step.time}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {step.duration && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: step.color, background: step.color + '18', borderRadius: 20, padding: '2px 8px' }}>
                    {step.duration}
                  </span>
                )}
                <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>✏️</span>
              </div>
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
  const dateParam = params.get('date')   // mode lecture historique
  const theme     = THEMES[themeKey] || THEMES.journee

  const [steps,      setSteps]      = useState([])
  const [status,     setStatus]     = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [errorMsg,   setErrorMsg]   = useState('')

  const statusRef          = useRef('idle')
  const finalTranscriptRef = useRef('')
  const isProcessingRef    = useRef(false)

  // Mode lecture : charge le plan d'une date passée
  useEffect(() => {
    if (!dateParam || !user) return
    supabase.from('dt_plannings').select('tasks')
      .eq('user_id', user.id).eq('date', dateParam).eq('theme', themeKey).single()
      .then(({ data }) => {
        if (data?.tasks?.length) {
          setSteps(data.tasks)
          setStatus('done'); statusRef.current = 'done'
        }
      })
  }, [dateParam, themeKey, user])

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
      if (user) await savePlan(themeKey, result.steps || [], user.id, null)
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
          borderRadius: '0 0 28px 28px', padding: '28px 24px 20px',
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
              <TimelinePlan steps={steps} onUpdate={updated => { setSteps(updated); if (user) savePlan(themeKey, updated, user.id, dateParam || null) }} />

              {/* Export agenda */}
              <button onClick={() => exportToIcs(steps, theme.label, dateParam)} style={{
                width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: 'white', border: `1.5px solid ${theme.color}55`,
                borderRadius: 16, padding: '14px', cursor: 'pointer',
                boxShadow: `0 4px 16px ${theme.color}18`,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="3" stroke={theme.color} strokeWidth="1.8"/>
                  <path d="M3 9h18" stroke={theme.color} strokeWidth="1.8"/>
                  <path d="M8 2v4M16 2v4" stroke={theme.color} strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M8 13h4m-4 4h8" stroke={theme.color} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: theme.color }}>
                  Ajouter à mon agenda
                </span>
              </button>

              {!dateParam && (
                <button onClick={reset} className="btn btn-ghost" style={{ width: '100%', marginTop: 10 }}>
                  🎙 Recommencer
                </button>
              )}
            </>
          )}

        </div>
      </div>
      <BottomNav />
    </div>
  )
}
