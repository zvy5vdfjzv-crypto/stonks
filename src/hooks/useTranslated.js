// 🌐 useTranslated — traduz texto pra lingua do user via /api/translate
// Cache em memoria por (text, targetLang) — evita re-fetch desnecessario
// Se lingua alvo for EN (source default) ou texto for vazio, retorna original.
import { useEffect, useState } from 'react'
import { useLang } from '../context/LanguageContext'

const cache = new Map() // `${lang}:${text}` → translated

export default function useTranslated(text, sourceLang = 'en') {
  const { lang } = useLang()
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    if (!text) { setTranslated(''); return }
    // Se user e da mesma lingua da fonte, nao traduz
    if (lang === sourceLang) { setTranslated(text); return }

    const cacheKey = `${lang}:${text}`
    if (cache.has(cacheKey)) {
      setTranslated(cache.get(cacheKey))
      return
    }

    let cancelled = false
    fetch(`/api/translate?text=${encodeURIComponent(text)}&to=${lang}&from=${sourceLang}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return
        const result = data?.text || text
        cache.set(cacheKey, result)
        setTranslated(result)
      })
      .catch(() => { if (!cancelled) setTranslated(text) })

    return () => { cancelled = true }
  }, [text, lang, sourceLang])

  return translated
}
