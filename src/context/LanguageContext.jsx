import { createContext, useContext, useState, useCallback } from 'react'
import pt from '../i18n/pt'
import en from '../i18n/en'

const translations = { pt, en }

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('pt')

  const toggleLang = useCallback(() => {
    setLang(prev => (prev === 'pt' ? 'en' : 'pt'))
  }, [])

  const t = useCallback((path) => {
    const keys = path.split('.')
    let value = translations[lang]
    for (const key of keys) {
      value = value?.[key]
    }
    return value ?? path
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
