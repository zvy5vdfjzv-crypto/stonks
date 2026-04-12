const SUBREDDITS = {
  memes: ['memes', 'dankmemes', 'me_irl'],
  finance: ['wallstreetbets', 'CryptoCurrency', 'StockMarket'],
  tech: ['ProgrammerHumor', 'technews'],
  cars: ['carporn', 'Shitty_Car_Mods'],
  gaming: ['gaming', 'pcmasterrace'],
  ai: ['artificial', 'singularity'],
}

export async function fetchRedditPosts(category, limit = 5) {
  const subs = SUBREDDITS[category]
  if (!subs) return []

  const sub = subs[Math.floor(Math.random() * subs.length)]

  try {
    const res = await fetch(
      `https://www.reddit.com/r/${sub}/hot.json?limit=${limit}&raw_json=1`,
      { headers: { 'User-Agent': 'stonks-app/1.0' } }
    )

    if (!res.ok) return []

    const data = await res.json()
    return data.data.children
      .map(post => post.data)
      .filter(post => !post.stickied && !post.over_18)
      .map(post => ({
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
      }))
  } catch {
    return []
  }
}

export async function fetchTrendingRedditPosts(limit = 10) {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/all/hot.json?limit=${limit}&raw_json=1`
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.data.children
      .map(post => post.data)
      .filter(post => !post.stickied && !post.over_18)
      .map(post => ({
        id: post.id,
        title: post.title,
        thumbnail: post.thumbnail?.startsWith('http') ? post.thumbnail : null,
        preview: post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&') || null,
        score: post.score,
        subreddit: post.subreddit,
        permalink: `https://reddit.com${post.permalink}`,
      }))
  } catch {
    return []
  }
}
