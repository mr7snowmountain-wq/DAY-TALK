/* Son goutte d'eau + animation rebond au tap */
let _ctx = null
function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function playDrop() {
  try {
    const ctx  = getCtx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15)

    gain.gain.setValueAtTime(0.22, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch {}
}

export function useTap() {
  function tap(e) {
    playDrop()
    const el = e.currentTarget
    el.classList.remove('tap-bounce')
    void el.offsetWidth // reflow pour relancer l'animation
    el.classList.add('tap-bounce')
    el.addEventListener('animationend', () => el.classList.remove('tap-bounce'), { once: true })
  }
  return tap
}
