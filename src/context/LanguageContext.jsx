// 🌍 LanguageContext — suporta 8 linguas com detecção automática por localização
// Chain: localStorage (override manual) → /api/geo (IP country) → navigator.language → pt default
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import pt from '../i18n/pt'
import en from '../i18n/en'
import es from '../i18n/es'
import fr from '../i18n/fr'
import de from '../i18n/de'
import it from '../i18n/it'
import ja from '../i18n/ja'
import zh from '../i18n/zh'

const translations = { pt, en, es, fr, de, it, ja, zh }

export const AVAILABLE_LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷', native: 'Português (BR)' },
  { code: 'en', label: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', label: 'Español', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', native: 'Italiano' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', native: '日本語' },
  { code: 'zh', label: '中文', flag: '🇨🇳', native: '中文' },
]

const STORAGE_KEY = 'stonks_lang'
const STORAGE_SOURCE = 'stonks_lang_source' // 'auto' | 'manual'

function detectBrowserLang() {
  if (typeof navigator === 'undefined') return 'pt'
  const lang = (navigator.language || navigator.userLanguage || 'pt').toLowerCase()
  if (lang.startsWith('pt')) return 'pt'
  if (lang.startsWith('en')) return 'en'
  if (lang.startsWith('es')) return 'es'
  if (lang.startsWith('fr')) return 'fr'
  if (lang.startsWith('de')) return 'de'
  if (lang.startsWith('it')) return 'it'
  if (lang.startsWith('ja')) return 'ja'
  if (lang.startsWith('zh')) return 'zh'
  return 'pt'
}

function loadSavedLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (translations[parsed]) return parsed
    }
  } catch {}
  return null
}

function wasManuallySet() {
  try {
    return localStorage.getItem(STORAGE_SOURCE) === '"manual"'
  } catch { return false }
}

async function detectByGeo(timeoutMs = 2500) {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    const r = await fetch('/api/geo', { signal: ctrl.signal, cache: 'force-cache' })
    clearTimeout(timer)
    if (!r.ok) return null
    const data = await r.json()
    if (data?.language && translations[data.language]) {
      return { lang: data.language, country: data.country, city: data.city }
    }
  } catch {}
  return null
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  // Init: carrega saved imediato (evita flash), depois re-detecta via geo se necessario
  const [lang, setLangState] = useState(() => loadSavedLang() || detectBrowserLang())
  const [geo, setGeo] = useState(null) // { country, city }

  const setLang = useCallback((newLang, source = 'manual') => {
    if (!translations[newLang]) return
    setLangState(newLang)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLang))
      localStorage.setItem(STORAGE_SOURCE, JSON.stringify(source))
    } catch {}
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'pt' ? 'en' : 'pt')
  }, [lang, setLang])

  // 🌍 Geo detection — apenas na primeira visita OU se nao tem override manual
  useEffect(() => {
    const saved = loadSavedLang()
    const manual = wasManuallySet()
    // Se user escolheu manualmente, respeita — nao sobrescreve
    if (manual) return
    // Se nao tem saved, faz detecao completa
    detectByGeo().then(result => {
      if (!result) return
      setGeo({ country: result.country, city: result.city })
      // Se a lingua detectada e diferente da atual, atualiza (source=auto)
      if (result.lang && result.lang !== lang) {
        setLangState(result.lang)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result.lang))
          localStorage.setItem(STORAGE_SOURCE, JSON.stringify('auto'))
        } catch {}
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Atualiza atributo lang do html (SEO + acessibilidade)
  useEffect(() => {
    try { document.documentElement.setAttribute('lang', lang) } catch {}
  }, [lang])

  const t = useCallback((path, vars) => {
    const keys = path.split('.')
    let value = translations[lang] || translations.pt
    for (const key of keys) {
      value = value?.[key]
    }
    // Fallback PT se faltar
    if (value === undefined) {
      let fallback = translations.pt
      for (const key of keys) fallback = fallback?.[key]
      value = fallback
    }
    if (typeof value === 'string' && vars) {
      value = value.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
    }
    return value ?? path
  }, [lang])

  return (
    <LanguageContext.Provider value={{
      lang, setLang, toggleLang, t,
      AVAILABLE_LANGUAGES,
      geo,
      isAutoDetected: !wasManuallySet(),
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
