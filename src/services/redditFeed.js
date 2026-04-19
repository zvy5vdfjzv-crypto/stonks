// 🔴 Reddit API (publica, sem chave) — trending posts por categoria
// Limits: ~60 req/min por IP. Suficiente pra uso humano.
const SUBREDDITS = {
  memes: ['memes', 'dankmemes', 'me_irl', 'funny', 'wholesomememes'],
  finance: ['wallstreetbets', 'CryptoCurrency', 'StockMarket', 'investing', 'Superstonk'],
  tech: ['ProgrammerHumor', 'technews', 'technology', 'gadgets', 'Android'],
  cars: ['carporn', 'Shitty_Car_Mods', 'cars', 'Autos', 'spotted'],
  gaming: ['gaming', 'pcmasterrace', 'PS5', 'XboxSeriesX', 'NintendoSwitch'],
  ai: ['artificial', 'singularity', 'ChatGPT', 'OpenAI', 'MachineLearning'],
  viral: ['nextfuckinglevel', 'interestingasfuck', 'oddlysatisfying', 'Damnthatsinteresting'],
  music: ['Music', 'hiphopheads', 'listentothis', 'popheads'],
  sports: ['sports', 'soccer', 'nba', 'formula1'],
  influencer: ['KUWTK', 'popculturechat', 'Fauxmoi', 'BravoRealHousewives'],
}

function normalizePost(post) {
  return {
    id: post.id,
    title: post.title,
    thumbnail: post.thumbnail?.startsWith('http') ? post.thumbnail : null,
    preview: post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&') || null,
    url: post.url,
    score: post.score,
    subreddit: post.subreddit,
    permalink: `https://reddit.com${post.permalink}`,
    isVideo: post.is_video,
    media: post.media?.reddit_video?.fallback_url || null,
    author: post.author,
    numComments: post.num_comments,
    createdAt: post.created_utc * 1000,
    source: 'reddit',
  }
}

// Usa proxy serverless /api/reddit pra evitar CORS do browser
export async function fetchRedditPosts(category, limit = 5) {
  const subs = SUBREDDITS[category]
  if (!subs) return []
  const sub = subs[Math.floor(Math.random() * subs.length)]
  try {
    const res = await fetch(`/api/reddit?sub=${sub}&limit=${limit}`)
    if (!res.ok) return []
    const data = await res.json()
    if (!data?.data?.children) return []
    return data.data.children
      .map(post => post.data)
      .filter(post => !post.stickied && !post.over_18)
      .map(normalizePost)
  } catch {
    return []
  }
}

export async function fetchTrendingRedditPosts(limit = 15) {
  try {
    const res = await fetch(`/api/reddit?sub=popular&limit=${limit}`)
    if (!res.ok) return []
    const data = await res.json()
    if (!data?.data?.children) return []
    return data.data.children
      .map(post => post.data)
      .filter(post => !post.stickied && !post.over_18)
      .map(normalizePost)
  } catch {
    return []
  }
}

// Busca varias categorias em paralelo — pra pagina Hype
export async function fetchMultiCategoryReddit(categories, perCategory = 3) {
  const all = await Promise.all(
    categories.map(cat => fetchRedditPosts(cat, perCategory).then(posts => posts.map(p => ({ ...p, _category: cat }))))
  )
  return all.flat()
}
