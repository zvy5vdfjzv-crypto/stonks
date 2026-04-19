// Vercel serverless function — fetcha RSS/XML e parseia pra JSON
// Evita CORS de portais + elimina dependencia de rss2json (que virou pago)

const ALLOWED_HOSTS = [
  'infomoney.com.br', 'valor.globo.com', 'br.cointelegraph.com',
  'theverge.com', 'techcrunch.com', 'tecmundo.com.br',
  'technologyreview.com', 'venturebeat.com',
  'ign.com', 'kotaku.com', 'polygon.com',
  'knowyourmeme.com',
  'pitchfork.com', 'rollingstone.com',
  'br.motor1.com', 'flatout.com.br',
  'ge.globo.com', 'espn.com.br',
  'buzzfeed.com',
  'eonline.com',
  'g1.globo.com', 'uol.com.br', 'rss.uol.com.br',
]

function unescape(str) {
  return str
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function extractTag(content, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const m = re.exec(content)
  return m ? unescape(m[1]) : ''
}

function extractAttr(content, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i')
  const m = re.exec(content)
  return m ? m[1] : ''
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').trim()
}

function findThumbnail(itemXml) {
  // Tenta varios formatos de imagem em RSS/Atom
  const mediaThumb = extractAttr(itemXml, 'media:thumbnail', 'url')
  if (mediaThumb) return mediaThumb
  const mediaContent = extractAttr(itemXml, 'media:content', 'url')
  if (mediaContent) return mediaContent
  const enclosure = extractAttr(itemXml, 'enclosure', 'url')
  if (enclosure) return enclosure
  // img tag dentro da description
  const desc = extractTag(itemXml, 'description')
  const imgMatch = /<img[^>]+src=["']([^"']+)["']/i.exec(desc)
  return imgMatch ? imgMatch[1] : null
}

function parseRSS(xml) {
  const items = []
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    items.push({
      title: extractTag(itemXml, 'title'),
      link: extractTag(itemXml, 'link'),
      description: stripHtml(extractTag(itemXml, 'description')).slice(0, 300),
      pubDate: extractTag(itemXml, 'pubDate'),
      author: extractTag(itemXml, 'dc:creator') || extractTag(itemXml, 'author'),
      thumbnail: findThumbnail(itemXml),
      guid: extractTag(itemXml, 'guid'),
    })
  }
  // Parse Atom feeds tambem (<entry> no lugar de <item>)
  const entryRegex = /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi
  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1]
    const link = extractAttr(entryXml, 'link', 'href') || extractTag(entryXml, 'link')
    items.push({
      title: extractTag(entryXml, 'title'),
      link,
      description: stripHtml(extractTag(entryXml, 'summary') || extractTag(entryXml, 'content')).slice(0, 300),
      pubDate: extractTag(entryXml, 'updated') || extractTag(entryXml, 'published'),
      author: extractTag(entryXml, 'name'),
      thumbnail: findThumbnail(entryXml),
      guid: extractTag(entryXml, 'id'),
    })
  }
  return items
}

export default async function handler(req, res) {
  const { url } = req.query || {}
  if (!url) {
    res.status(400).json({ error: 'url param required' })
    return
  }

  // Whitelist de hosts — impede o endpoint ser usado como proxy generico
  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    res.status(400).json({ error: 'invalid url' })
    return
  }

  const host = parsedUrl.hostname.replace(/^www\./, '')
  if (!ALLOWED_HOSTS.some(h => host.endsWith(h))) {
    res.status(403).json({ error: 'host not allowed' })
    return
  }

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'stonks-app/1.0 (+https://trendmarket-gules.vercel.app)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    })
    if (!r.ok) throw new Error(`upstream ${r.status}`)
    const xml = await r.text()
    const items = parseRSS(xml)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json({ items, count: items.length })
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(500).json({ error: err.message, items: [] })
  }
}
