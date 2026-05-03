import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import CardCarousel from '../components/CardCarousel'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

/* ── Keyframes ── */
const STYLES = `
@keyframes neoRing {
  0%   { transform: scale(1);   opacity: 0.7; }
  100% { transform: scale(3.2); opacity: 0;   }
}
@keyframes mic-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}
@keyframes spin-ring {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`
if (typeof document !== 'undefined' && !document.getElementById('planning-styles')) {
  const s = document.createElement('style')
  s.id = 'planning-styles'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ── Appel Claude ── */
async function transcriptToPlanning(text) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Tu es l'assistant DayTalk pour la planification quotidienne. À partir de ce texte dicté, extrais TOUTES les tâches et retourne UNIQUEMENT un tableau JSON valide, sans markdown, sans explication.

Format strict : [{"heure":"08:00","tache":"Déposer les enfants à l'école","emoji":"🏫","done":false}]

Règles : inclure TOUTES les tâches, inventer une heure logique si non précisée, emoji pertinent, done=false.
Texte : "${text}"`,
    }),
  })
  if (!res.ok) throw new Error('Erreur API')
  const data  = await res.json()
  const raw   = data.content[0].text.trim()
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('JSON introuvable')
  return JSON.parse(match[0])
}

/* ── Date locale ── */
function localDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

/* ── Export .ics ── */
function exportToIcs(tasks, baseDate) {
  const day = baseDate || localDate()
  const [year, month, dayN] = day.split('-').map(Number)
  const pad = n => String(n).padStart(2, '0')

  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//DayTalk//AI Planning//FR',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
  ]

  tasks.forEach((task, i) => {
    const m = (task.heure || '').match(/(\d{1,2}):(\d{2})/)
    let h = 9 + i, min = 0
    if (m) { h = parseInt(m[1]); min = parseInt(m[2]) }
    const dtStart = `${year}${pad(month)}${pad(dayN)}T${pad(h)}${pad(min)}00`
    const endH = h + 1
    const dtEnd = `${year}${pad(month)}${pad(dayN)}T${pad(endH)}${pad(min)}00`
    lines.push(
      'BEGIN:VEVENT',
      `UID:daytalk-${day}-${i}@daytalk.app`,
      `DTSTAMP:${dtStart}`, `DTSTART:${dtStart}`, `DTEND:${dtEnd}`,
      `SUMMARY:${task.tache || ''}`.trim(),
      'END:VEVENT',
    )
  })
  lines.push('END:VCALENDAR')

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `daytalk-journee-${day}.ics`; a.click()
  URL.revokeObjectURL(url)
}

/* ── Supabase ── */
async function savePlanning(tasks, userId, date) {
  const day = date || localDate()
  const { data: existing } = await supabase
    .from('dt_plannings').select('id')
    .eq('user_id', userId).eq('date', day).eq('theme', 'planning')
    .maybeSingle()
  if (existing) {
    await supabase.from('dt_plannings')
      .update({ tasks, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('dt_plannings')
      .insert({ user_id: userId, date: day, tasks, theme: 'planning', updated_at: new Date().toISOString() })
  }
}

/* ── Bouton micro NeoAI ── */
function MicButton({ status, onStart, onStop }) {
  const isListening = status === 'listening'
  const isLoading   = status === 'loading'

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 200, height: 200 }}>

      {/* Halo ambiant permanent */}
      <div style={{
        position: 'absolute', width: 190, height: 190, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
        animation: 'orbPulse 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Anneaux NeoAI en écoute */}
      {isListening && [0, 1, 2].map(i => (
        <span key={i} style={{
          position: 'absolute', width: 110, height: 110, borderRadius: '50%',
          border: '1.5px solid rgba(139,92,246,0.65)',
          animation: `neoRing 2.2s ease-out ${i * 0.74}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Spinner chargement */}
      {isLoading && (
        <span style={{
          position: 'absolute', width: 130, height: 130, borderRadius: '50%',
          border: '1.5px solid rgba(139,92,246,0.12)',
          borderTopColor: '#8B5CF6',
          animation: 'spin-ring 1.2s linear infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Orbe principale NeoAI */}
      <div
        onClick={isLoading ? undefined : isListening ? onStop : onStart}
        style={{
          position: 'relative', zIndex: 2,
          width: 110, height: 110, borderRadius: '50%',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          background: isListening
            ? 'radial-gradient(circle at 38% 32%, rgba(196,181,253,0.35) 0%, rgba(109,40,217,0.9) 60%, rgba(79,40,180,0.95) 100%)'
            : 'radial-gradient(circle at 38% 32%, rgba(196,181,253,0.18) 0%, rgba(26,18,50,0.95) 60%, rgba(13,11,26,0.98) 100%)',
          border: '1px solid rgba(139,92,246,0.45)',
          boxShadow: isListening
            ? '0 0 0 1px rgba(139,92,246,0.3), 0 0 50px rgba(139,92,246,0.65), inset 0 1px 0 rgba(255,255,255,0.18)'
            : '0 0 0 1px rgba(139,92,246,0.15), 0 0 35px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.4s ease',
          animation: (!isListening && !isLoading) ? 'mic-float 3.5s ease-in-out infinite' : 'none',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {/* Reflet glassy */}
        <div style={{
          position: 'absolute', top: 12, left: 18, width: 30, height: 16, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)', filter: 'blur(3px)', pointerEvents: 'none',
        }} />

        {isListening ? (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <rect x="7" y="7" width="10" height="10" rx="2.5" fill="rgba(255,255,255,0.92)"/>
          </svg>
        ) : isLoading ? (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="rgba(139,92,246,0.7)"/>
            <circle cx="12" cy="6"  r="1.5" fill="rgba(139,92,246,0.4)"/>
            <circle cx="12" cy="18" r="1.5" fill="rgba(139,92,246,0.4)"/>
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="11" rx="3" fill="rgba(255,255,255,0.88)"/>
            <path d="M5 10a7 7 0 0014 0" stroke="rgba(255,255,255,0.88)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 19v3M9 22h6" stroke="rgba(255,255,255,0.88)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </div>
    </div>
  )
}

/* ── Page ── */
export default function PlanningPage() {
  const navigate  = useNavigate()
  const [params]  = useSearchParams()
  const { user }  = useAuth()
  const dateParam = params.get('date')

  const [tasks,           setTasks]           = useState([])
  const [status,          setStatus]          = useState('idle')
  const [errorMsg,        setErrorMsg]        = useState('')
  const [transcript,      setTranscript]      = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportDate,      setExportDate]      = useState(dateParam || localDate())

  const statusRef          = useRef('idle')
  const finalTranscriptRef = useRef('')
  const isProcessingRef    = useRef(false)

  /* Charger planning (du jour ou historique) */
  useEffect(() => {
    if (!user) return
    const day = dateParam || localDate()
    supabase.from('dt_plannings').select('tasks')
      .eq('user_id', user.id).eq('date', day).eq('theme', 'planning').maybeSingle()
      .then(({ data }) => {
        if (data?.tasks?.length > 0) {
          setTasks(data.tasks)
          setStatus('done'); statusRef.current = 'done'
        }
      })
    return () => stopCurrentRecognition()
  }, [user, dateParam])

  function stopCurrentRecognition() {
    try { window.__daytalkRec?.stop() } catch {}
    window.__daytalkRec = null
  }

  /* ── Traitement vers Claude ── */
  async function doProcess() {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    stopCurrentRecognition()

    const text = finalTranscriptRef.current.trim()
    if (!text) {
      setStatus('idle'); statusRef.current = 'idle'
      isProcessingRef.current = false; return
    }
    setStatus('loading'); statusRef.current = 'loading'
    try {
      const parsed = await transcriptToPlanning(text)
      setTasks(parsed)
      if (user) await savePlanning(parsed, user.id, null)
      setStatus('done'); statusRef.current = 'done'
    } catch {
      setErrorMsg("Je n'ai pas réussi à analyser. Réessaie ")
      setStatus('error'); statusRef.current = 'error'
    }
    isProcessingRef.current = false
  }

  /* ── Créer une instance SR fraîche ── */
  function buildRecognition() {
    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang           = 'fr-FR'
    rec.continuous     = false
    rec.interimResults = true
    window.__daytalkRec = rec

    rec.onstart = () => { setStatus('listening'); statusRef.current = 'listening' }

    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscriptRef.current += e.results[i][0].transcript + ' '
        } else {
          interim = e.results[i][0].transcript
        }
      }
      setTranscript(finalTranscriptRef.current + interim)
    }

    rec.onerror = (e) => {
      if (e.error === 'no-speech') return
      setErrorMsg('Erreur micro : ' + e.error)
      setStatus('error'); statusRef.current = 'error'
    }

    rec.onend = () => {
      if (statusRef.current === 'listening') {
        buildRecognition().start()
      }
    }

    return rec
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setErrorMsg("Ton navigateur ne supporte pas le micro. Essaie Chrome.")
      setStatus('error'); return
    }
    finalTranscriptRef.current = ''
    isProcessingRef.current    = false
    setTranscript('')
    buildRecognition().start()
  }

  function stopListening() {
    statusRef.current = 'loading'
    setStatus('loading')
    stopCurrentRecognition()
    doProcess()
  }

  function toggleTask(index) {
    setTasks(prev => {
      const updated = prev.map((t, i) => i === index ? { ...t, done: !t.done } : t)
      if (user) savePlanning(updated, user.id, dateParam || null)
      return updated
    })
  }

  function reset() {
    setTasks([]); setTranscript('')
    setStatus('idle'); statusRef.current = 'idle'
    finalTranscriptRef.current = ''; isProcessingRef.current = false
    setErrorMsg('')
    if (user && !dateParam) {
      const day = localDate()
      supabase.from('dt_plannings').delete()
        .eq('user_id', user.id).eq('date', day).eq('theme', 'planning')
    }
  }

  const doneCount = tasks.filter(t => t.done).length

  return (
    <div className="app-shell">
      <div className="screen" style={{ paddingTop: 0, paddingBottom: 110, gap: 0, justifyContent: 'flex-start' }}>

        {/* Header */}
        <div style={{
          width: '100%',
          background: 'linear-gradient(160deg, #1a0f3d 0%, #0d0b1a 100%)',
          borderRadius: '0 0 20px 20px',
          padding: '28px 24px 20px', marginBottom: 24,
          color: '#fff', boxShadow: '0 8px 32px rgba(139,92,246,0.2), inset 0 -1px 0 rgba(139,92,246,0.28)',
        }}>
          <button onClick={() => navigate('/home')}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', marginBottom: 8 }}>
            ←
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 400, margin: 0, fontFamily: 'var(--font-display)', letterSpacing: 2, textTransform: 'uppercase' }}>MON PLANNING</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.75, fontSize: '0.85rem', fontWeight: 500 }}>
            Dicte ta journée, je m'occupe du reste
          </p>
        </div>

        <div style={{ width: '100%', padding: '0 4px' }}>

          {/* Zone micro */}
          {status !== 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
              <MicButton status={status} onStart={startListening} onStop={stopListening} />

              <p style={{ marginTop: 8, color: 'var(--text-soft)', fontSize: '0.85rem', textAlign: 'center', minHeight: 22 }}>
                {status === 'idle'      && 'Appuie et dicte ta journée'}
                {status === 'listening' && "Je t'écoute — appuie pour terminer"}
                {status === 'loading'   && 'DayTalk prépare ton planning…'}
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
              <button onClick={reset}
                style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', marginLeft: 8 }}>
                Réessayer
              </button>
            </div>
          )}

          {/* Planning */}
          {tasks.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Ta journée </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--teal)', fontWeight: 700 }}>
                  {doneCount}/{tasks.length} faites
                </span>
              </div>

              {/* Barre de progression */}
              <div style={{ height: 7, background: 'rgba(139,92,246,0.1)', borderRadius: 10, marginBottom: 20, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, var(--teal), var(--blue))',
                  borderRadius: 10, transition: 'width 0.5s ease',
                }} />
              </div>

              {/* Carrousel swipeable */}
              <CardCarousel tasks={tasks} onToggle={toggleTask} />

              {/* Export agenda */}
              <button onClick={() => { setExportDate(dateParam || localDate()); setShowExportModal(true) }} style={{
                width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(139,92,246,0.35)',
                borderRadius: 12, padding: '14px', cursor: 'pointer',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>Ajouter à mon agenda</span>
              </button>

              {/* Modale choix de date */}
              {showExportModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end' }}
                  onClick={() => setShowExportModal(false)}>
                  <div onClick={e => e.stopPropagation()} style={{
                    width: '100%', maxWidth: 480, margin: '0 auto',
                    background: 'linear-gradient(160deg, #1a0f3d 0%, #0d0b1a 100%)',
                    border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px 20px 0 0',
                    padding: '24px 20px 48px', display: 'flex', flexDirection: 'column', gap: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Quel jour ?</h3>
                      <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-hint)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>Choisis la date à laquelle ajouter ce planning dans ton agenda.</p>
                    <input type="date" value={exportDate} onChange={e => setExportDate(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, padding: '14px 18px', fontFamily: 'var(--font)', fontSize: 15, color: 'var(--text-dark)', outline: 'none', colorScheme: 'dark' }} />
                    <button onClick={() => { exportToIcs(tasks, exportDate); setShowExportModal(false) }} className="btn btn-primary">
                      Exporter vers mon agenda
                    </button>
                  </div>
                </div>
              )}

              <button onClick={reset} className="btn btn-ghost" style={{ width: '100%', marginTop: 10 }}>
                 Nouveau planning
              </button>
            </>
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  )
}
