// 📺 YouTube Data API v3 — trending videos
// Precisa de YOUTUBE_API_KEY em .env (VITE_YOUTUBE_API_KEY)
// Free quota: 10.000 unidades/dia (search custa 100, list custa 1)
// Get key: https://console.cloud.google.com/apis/credentials (habilitar YouTube Data API v3)

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

// Mapeia categorias internas → YouTube categoryId (videoCategories#list)
const CATEGORY_MAP = {
  gaming: '20',
  music: '10',
  sports: '17',
  tech: '28',
  // Estes nao tem mapping exato — uso search com keyword
  memes: null, // fallback search 'memes'
  finance: null,
  ai: null,
  cars: '2',
  viral: null,
  influencer: null,
}

const SEARCH_KEYWORD = {
  memes: 'memes trending',
  finance: 'stock market news',
  ai: 'artificial intelligence',
  viral: 'viral video',
  influencer: 'celebrity news',
}

function normalizeVideo(video) {
  const s = video.snippet
  const stats = video.statistics
  return {
    id: video.id?.videoId || video.id,
    title: s.title,
    description: s.description?.slice(0, 200) || '',
    thumbnail: s.thumbnails?.medium?.url || s.thumbnails?.default?.url,
    channel: s.channelTitle,
    url: `https://youtube.com/watch?v=${video.id?.videoId || video.id}`,
    views: parseInt(stats?.viewCount || 0),
    likes: parseInt(stats?.likeCount || 0),
    publishedAt: new Date(s.publishedAt).getTime(),
    source: 'youtube',
  }
}

export async function fetchYouTubeTrending(category, limit = 6) {
  if (!API_KEY) {
    // Sem chave — retorna vazio silenciosamente (user adiciona quando quiser)
    return []
  }
  const categoryId = CATEGORY_MAP[category]
  try {
    let url
    if (categoryId) {
      // videos endpoint (custa 1 unidade) — mais eficiente
      url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=BR&videoCategoryId=${categoryId}&maxResults=${limit}&key=${API_KEY}`
    } else {
      // search endpoint (custa 100 unidades) — usa quando nao tem mapping
      const q = SEARCH_KEYWORD[category] || category
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&order=viewCount&publishedAfter=${new Date(Date.now() - 7 * 864e5).toISOString()}&maxResults=${limit}&key=${API_KEY}`
    }
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return (data.items || []).map(normalizeVideo)
  } catch {
    return []
  }
}

export function isYouTubeConfigured() {
  return !!API_KEY
}
