// 💱 Moeda helper — respeita preferencia do user em /settings → Mercado
// Default: S$ (Stonks coins). Alternativas: HC (HypeCoins) / $ (USD visual)

export function getCurrencyPrefix() {
  try {
    const v = localStorage.getItem('stonks_currency')
    if (!v) return 'S$'
    // JSON.parse pode falhar se valor legacy nao-json
    try { return JSON.parse(v) || 'S$' } catch { return v || 'S$' }
  } catch {
    return 'S$'
  }
}

export function formatCurrency(value, decimals = 2) {
  const prefix = getCurrencyPrefix()
  const n = Number(value) || 0
  return `${prefix} ${n.toFixed(decimals)}`
}
