// 🎙️ useTTS — text-to-speech via ElevenLabs proxy.
// Usa iOS unlock listener do sound.js (audio context ja destravado em interacao).
// Respeita mute global (muted = skip).

import { useCallback } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { useLang } from '../context/LanguageContext'

// Cache de audio em memoria — mesmo texto/lang nao re-fetcha
const audioCache = new Map() // `${lang}:${text}` → Blob URL

export default function useTTS() {
  const { muted } = useNotifications()
  const { lang } = useLang()

  const speak = useCallback(async (text, options = {}) => {
    if (!text || muted || options.force === false) return
    const cacheKey = `${lang}:${text}`

    try {
      let url = audioCache.get(cacheKey)
      if (!url) {
        const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`)
        if (!res.ok) return // silencioso se nao tiver API key configurada
        const blob = await res.blob()
        url = URL.createObjectURL(blob)
        audioCache.set(cacheKey, url)
      }

      const audio = new Audio(url)
      audio.volume = options.volume ?? 0.75
      await audio.play().catch(() => {})
    } catch {
      // silencioso — TTS e melhoria, nao deve quebrar app
    }
  }, [lang, muted])

  return { speak }
}
