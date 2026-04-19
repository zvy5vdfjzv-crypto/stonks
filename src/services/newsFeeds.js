// 📰 News RSS feeds — portais de noticia por nicho
// Usa Vercel serverless function /api/rss (server-side parsing, sem CORS)
const RSS_PROXY = '/api/rss?url='

// Portais por nicho — mistura BR + global
const FEEDS = {
  finance: [
    { name: 'InfoMoney', url: 'https://www.infomoney.com.br/feed/' },
    { name: 'Valor', url: 'https://valor.globo.com/rss/valor/' },
    { name: 'Cointelegraph BR', url: 'https://br.cointelegraph.com/rss' },
  ],
  tech: [
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'TecMundo', url: 'https://www.tecmundo.com.br/rss' },
  ],
  ai: [
    { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
    { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' },
  ],
  gaming: [
    { name: 'IGN', url: 'https://feeds.ign.com/ign/all' },
    { name: 'Kotaku', url: 'https://kotaku.com/rss' },
    { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml' },
  ],
  memes: [
    { name: 'Know Your Meme', url: 'https://knowyourmeme.com/newsfeed.rss' },
  ],
  music: [
    { name: 'Pitchfork', url: 'https://pitchfork.com/rss/news/' },
    { name: 'Rolling Stone', url: 'https://www.rollingstone.com/music/feed/' },
  ],
  cars: [
    { name: 'Motor1 BR', url: 'https://br.motor1.com/rss/news/all/' },
    { name: 'FlatOut', url: 'https://www.flatout.com.br/feed/' },
  ],
  sports: [
    { name: 'Globo Esporte', url: 'https://ge.globo.com/rss/google/ultimas-noticias.xml' },
    { name: 'ESPN Brasil', url: 'https://www.espn.com.br/rss/ultimas' },
  ],
  viral: [
    { name: 'BuzzFeed', url: 'https://www.buzzfeed.com/index.xml' },
  ],
  influencer: [
    { name: 'E! News', url: 'https://www.eonline.com/news.rss' },
  ],
  // Geral (fallback + home)
  general: [
    { name: 'G1', url: 'https://g1.globo.com/rss/g1/' },
    { name: 'UOL', url: 'https://rss.uol.com.br/feed/ultimas.xml' },
  ],
}

function normalizeRssItem(item, source) {
  const ts = item.pubDate ? new Date(item.pubDate).getTime() : Date.now()
  return {
    id: item.guid || item.link,
    title: item.title,
    description: item.description || '',
    thumbnail: item.thumbnail || null,
    url: item.link,
    author: item.author || source.name,
    publishedAt: isNaN(ts) ? Date.now() : ts,
    source: 'news',
    sourceName: source.name,
  }
}

export async function fetchNewsByCategory(category, limit = 8) {
  const feeds = FEEDS[category] || FEEDS.general
  try {
    const source = feeds[Math.floor(Math.random() * feeds.length)]
    const res = await fetch(`${RSS_PROXY}${encodeURIComponent(source.url)}`)
    if (!res.ok) return []
    const data = await res.json()
    if (!data?.items) return []
    return data.items.slice(0, limit).map(item => normalizeRssItem(item, source))
  } catch {
    return []
  }
}

export async function fetchMultiCategoryNews(categories, perCategory = 3) {
  const all = await Promise.all(
    categories.map(cat => fetchNewsByCategory(cat, perCategory).then(items => items.map(i => ({ ...i, _category: cat }))))
  )
  return all.flat().sort((a, b) => b.publishedAt - a.publishedAt)
}

export const NEWS_CATEGORIES = Object.keys(FEEDS).filter(c => c !== 'general')
