/* Son goutte d'eau + animation rebond au tap */
function playDrop() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.18)
    filter.Q.value = 8

    osc.type = 'sine'
    osc.frequency.setValueAtTime(900, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.18)

    gain.gain.setValueAtTime(0.28, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.18)
    osc.onended = () => ctx.close()
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
