// 🌐 useTranslated — traduz com cache LOCALSTORAGE persistente
// Se o mesmo titulo aparecer de novo (mesmo em outra sessao), serve do cache.
// Economiza quota do MyMemory (5k chars/dia) — so pagamos pelo 1o request.
import { useEffect, useState } from 'react'
import { useLang } from '../context/LanguageContext'

const STORAGE_KEY = 'stonks_translations_v1'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 dias

// Carrega cache do localStorage uma vez
let memCache = null
function getCache() {
  if (memCache) return memCache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    memCache = raw ? JSON.parse(raw) : {}
    // Cleanup entries vencidos (> 7 dias)
    const now = Date.now()
    Object.keys(memCache).forEach(k => {
      if (memCache[k]?.ts && now - memCache[k].ts > CACHE_TTL) delete memCache[k]
    })
  } catch {
    memCache = {}
  }
  return memCache
}

function saveCache() {
  if (!memCache) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memCache))
  } catch {
    // quota full — limpa metade dos mais antigos
    const entries = Object.entries(memCache).sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0))
    const toDelete = Math.floor(entries.length / 2)
    entries.slice(0, toDelete).forEach(([k]) => delete memCache[k])
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memCache)) } catch {}
  }
}

// Debounce writes — salva no final de cada tick, nao a cada set
let writeTimer
function scheduleSave() {
  clearTimeout(writeTimer)
  writeTimer = setTimeout(saveCache, 500)
}

export default function useTranslated(text, sourceLang = 'en') {
  const { lang } = useLang()
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    if (!text) { setTranslated(''); return }
    if (lang === sourceLang) { setTranslated(text); return }

    const cache = getCache()
    const cacheKey = `${sourceLang}→${lang}|${text.slice(0, 200)}`

    if (cache[cacheKey]) {
      setTranslated(cache[cacheKey].text)
      return
    }

    // Mostra original enquanto fetcha traducao
    setTranslated(text)

    let cancelled = false
    fetch(`/api/translate?text=${encodeURIComponent(text)}&to=${lang}&from=${sourceLang}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return
        const result = data?.text || text
        cache[cacheKey] = { text: result, ts: Date.now() }
        scheduleSave()
        setTranslated(result)
      })
      .catch(() => { if (!cancelled) setTranslated(text) })

    return () => { cancelled = true }
  }, [text, lang, sourceLang])

  return translated
}
