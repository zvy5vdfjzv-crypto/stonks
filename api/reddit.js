// Vercel serverless function — proxy pra Reddit API
// Evita CORS (Reddit nao manda Access-Control-Allow-Origin)
// Cache 5min no edge pra economizar calls

export default async function handler(req, res) {
  const { sub = 'popular', limit = '10' } = req.query || {}
  // Sanitize sub: so letras/numeros/underscore
  const cleanSub = String(sub).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 50) || 'popular'
  const cleanLimit = Math.min(parseInt(limit) || 10, 50)

  const url = `https://www.reddit.com/r/${cleanSub}/hot.json?limit=${cleanLimit}&raw_json=1`

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'stonks-app/1.0 (+https://trendmarket-gules.vercel.app)',
        'Accept': 'application/json',
      },
    })
    const data = await r.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json(data)
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(500).json({ error: err.message })
  }
}
