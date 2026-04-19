// 🌍 LanguageContext — suporta 8 linguas
// pt / en / es / fr / de / it / ja / zh
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
  return 'pt' // fallback pt (default do app)
}

function loadSavedLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (translations[parsed]) return parsed
    }
  } catch {}
  return detectBrowserLang()
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => loadSavedLang())

  const setLang = useCallback((newLang) => {
    if (!translations[newLang]) return
    setLangState(newLang)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newLang)) } catch {}
  }, [])

  // Atalho legacy — alterna entre pt e en (mantido pra compat)
  const toggleLang = useCallback(() => {
    setLang(lang === 'pt' ? 'en' : 'pt')
  }, [lang, setLang])

  // Atualiza atributo lang do html
  useEffect(() => {
    try { document.documentElement.setAttribute('lang', lang) } catch {}
  }, [lang])

  const t = useCallback((path, vars) => {
    const keys = path.split('.')
    let value = translations[lang] || translations.pt
    for (const key of keys) {
      value = value?.[key]
    }
    // Fallback pra PT se faltar key na lingua atual
    if (value === undefined) {
      let fallback = translations.pt
      for (const key of keys) fallback = fallback?.[key]
      value = fallback
    }
    // Interpolacao de variaveis {var}
    if (typeof value === 'string' && vars) {
      value = value.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
    }
    return value ?? path
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, AVAILABLE_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
