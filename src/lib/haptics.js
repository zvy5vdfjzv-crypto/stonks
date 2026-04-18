// 📳 STONKS Haptics — patterns semanticos calibrados pelo briefing 5
// navigator.vibrate wrapper com nomes expressivos.

const PATTERNS = {
  light: [10],                          // Tap em botao qualquer
  medium: [30],                         // Bancagem confirmada
  heavy: [60],                          // Momento de peso
  success: [20, 40, 20],                // Compra/venda bem-sucedida
  anticipation: [50, 30, 50],           // Abertura de caixa — suspense
  jackpot: [100, 50, 100, 50, 200],     // Lendario/Mitico reveal
  tick: [5],                            // Contador incrementando (minimal)
  loss: [40],                           // Venda com prejuizo
  denied: [80, 40, 80],                 // Acao bloqueada
}

let mutedState = false

export const haptics = {
  setMuted(m) { mutedState = m },

  fire(pattern = 'light') {
    if (mutedState) return
    if (typeof navigator === 'undefined' || !navigator.vibrate) return
    const p = typeof pattern === 'string' ? PATTERNS[pattern] : pattern
    if (!p) return
    try { navigator.vibrate(p) } catch { /* ignore */ }
  },
}
