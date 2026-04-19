// Vercel serverless function — proxy pra Reddit API
// Evita CORS (Reddit nao manda Access-Control-Allow-Origin)
// Cache 5min no edge pra economizar calls

export default async function handler(req, res) {
  const { sub = 'popular', limit = '10' } = req.query || {}
  // Sanitize sub: so letras/numeros/underscore
  const cleanSub = String(sub).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 50) || 'popular'
  const cleanLimit = Math.min(parseInt(limit) || 10, 50)

  // Tenta 3 hosts do Reddit em sequencia — old.reddit.com costuma ser mais permissivo
  const hosts = [
    'https://www.reddit.com',
    'https://old.reddit.com',
    'https://api.reddit.com',
  ]

  // UA de browser real (Reddit bloqueia UAs genericos de bot/cloud)
  const browserUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

  let lastError
  for (const host of hosts) {
    try {
      const url = `${host}/r/${cleanSub}/hot.json?limit=${cleanLimit}&raw_json=1`
      const r = await fetch(url, {
        headers: {
          'User-Agent': browserUA,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8',
        },
      })
      // Reddit pode retornar HTML de erro com status 200 — valida content-type
      const ct = r.headers.get('content-type') || ''
      if (!ct.includes('json')) {
        lastError = `host ${host} retornou ${ct}, status ${r.status}`
        continue
      }
      const data = await r.json()
      if (!data?.data?.children) {
        lastError = `host ${host} resposta invalida`
        continue
      }
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
      res.status(200).json(data)
      return
    } catch (err) {
      lastError = err.message
    }
  }
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(502).json({ error: 'todos os hosts falharam', detail: lastError })
}
