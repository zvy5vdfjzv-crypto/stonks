// 🌐 Translation proxy — MyMemory API (5k chars/dia gratis, sem chave)
// Usado pra traduzir titulos de noticias externas (Reddit/RSS) pra lingua do user.
// Cache edge 7 dias porque titulos nao mudam.

export default async function handler(req, res) {
  const { text, to, from = 'auto' } = req.query || {}

  if (!text || !to) {
    res.status(400).json({ error: 'text and to params required' })
    return
  }

  // Limit: MyMemory recusa > 500 chars
  const safeText = String(text).slice(0, 500)
  const source = from === 'auto' ? 'en' : from // MyMemory precisa source concreto
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(safeText)}&langpair=${source}|${to}`

  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'stonks-app/1.0' },
    })
    const data = await r.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    // Cache agressivo: 7 dias na edge (titulos nao mudam)
    res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=86400')

    if (data?.responseData?.translatedText && data.responseStatus === 200) {
      res.status(200).json({
        text: data.responseData.translatedText,
        original: safeText,
        match: data.responseData.match || 0,
      })
    } else {
      // Fallback: retorna texto original se traducao falhar
      res.status(200).json({ text: safeText, original: safeText, match: 0, error: 'no translation' })
    }
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({ text: safeText, original: safeText, error: err.message })
  }
}
