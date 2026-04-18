// 🎵 STONKS SoundManager — Web Audio API procedural
// Briefing 5: 7 sons-chave, curtos (100-400ms), mixados baixos, toggle mute proeminente.
// Zero dependencias / zero assets — tons sintetizados em tempo real.

class SoundManager {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.muted = false
  }

  _ensureContext() {
    if (typeof window === 'undefined') return false
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return false
      this.ctx = new AC()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.22 // Briefing: sons mixados baixos
      this.masterGain.connect(this.ctx.destination)
    }
    // Autoplay policy: resumir em primeira interacao do user
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return true
  }

  setMuted(m) { this.muted = m }

  // === PRIMITIVAS ===

  _tone(freq, startOffset, duration, type = 'triangle', volume = 0.12) {
    const t = this.ctx.currentTime + startOffset
    const osc = this.ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(volume, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration)
    osc.connect(g)
    g.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + duration + 0.01)
  }

  _bell(freq, duration = 0.3, volume = 0.1) {
    this._tone(freq, 0, duration, 'sine', volume)
  }

  _noise(duration, filterFreqStart, filterFreqEnd, volume = 0.15) {
    const size = Math.floor(this.ctx.sampleRate * duration)
    const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < size; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 2)
    }
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 2
    filter.frequency.setValueAtTime(filterFreqStart, this.ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(filterFreqEnd, this.ctx.currentTime + duration)
    const g = this.ctx.createGain()
    g.gain.value = volume
    src.connect(filter)
    filter.connect(g)
    g.connect(this.masterGain)
    src.start()
    src.stop(this.ctx.currentTime + duration)
  }

  // === EVENTOS DO APP ===

  // Click mecanico seco — briefing: tap em botao primario
  click() {
    if (this.muted || !this._ensureContext()) return
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(1200, t)
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.03)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.08, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
    osc.connect(g)
    g.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.05)
  }

  // Caixa registradora — Bancagem confirmada
  register() {
    if (this.muted || !this._ensureContext()) return
    // Chord C maior
    this._tone(523, 0, 0.35, 'triangle', 0.1)       // C5
    this._tone(659, 0.03, 0.35, 'triangle', 0.09)   // E5
    this._tone(784, 0.05, 0.35, 'triangle', 0.08)   // G5
    // Coin chime depois
    setTimeout(() => {
      if (!this.muted) { this._bell(1568, 0.4, 0.1); this._bell(2093, 0.4, 0.06) }
    }, 180)
  }

  // Tom ascendente — ganho em posicao
  gain() {
    if (this.muted || !this._ensureContext()) return
    this._tone(523, 0, 0.2, 'triangle', 0.1)     // C5
    this._tone(659, 0.08, 0.2, 'triangle', 0.1)  // E5
    this._tone(880, 0.16, 0.25, 'triangle', 0.1) // A5
  }

  // Tom descendente — perda
  loss() {
    if (this.muted || !this._ensureContext()) return
    this._tone(440, 0, 0.25, 'triangle', 0.08)    // A4
    this._tone(392, 0.1, 0.25, 'triangle', 0.08)  // G4
    this._tone(349, 0.2, 0.3, 'triangle', 0.08)   // F4
  }

  // Swoosh — abertura de caixa comum
  swoosh() {
    if (this.muted || !this._ensureContext()) return
    this._noise(0.5, 200, 3000, 0.14)
  }

  // Fanfarra — reveal de lendary/mythic (briefing 4.6)
  fanfare() {
    if (this.muted || !this._ensureContext()) return
    // Arpeggio ascendente C E G C E
    const notes = [523, 659, 784, 1046, 1318]
    notes.forEach((f, i) => this._tone(f, i * 0.1, 0.5, 'triangle', 0.12))
    // Sino final dourado
    setTimeout(() => {
      if (!this.muted) {
        this._bell(2093, 1.0, 0.1)   // C7
        this._bell(2637, 1.0, 0.06)  // E7
      }
    }, 550)
  }

  // Ding — notificacao (tom variavel por tipo)
  ding(tone = 'default') {
    if (this.muted || !this._ensureContext()) return
    const freqs = {
      default: [800, 1200],
      market: [600, 900],
      social: [900, 1200],
      like: [1200, 1600],
      price_up: [700, 1100],
      price_down: [500, 350],
    }
    const [f1, f2] = freqs[tone] || freqs.default
    this._bell(f1, 0.18, 0.08)
    setTimeout(() => { if (!this.muted) this._bell(f2, 0.25, 0.06) }, 90)
  }

  // Tick — contador incrementando
  tick() {
    if (this.muted || !this._ensureContext()) return
    this._tone(2400, 0, 0.03, 'square', 0.04)
  }
}

export const sound = new SoundManager()
