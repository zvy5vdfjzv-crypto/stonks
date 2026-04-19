// 🎙️ WelcomeVoice — toca saudacao ElevenLabs quando user loga
// 1x por sessao (sessionStorage flag). Respeita mute global.
// Message varia por hora do dia + lingua + tratamento formal (senhor/senhora).
import { useEffect, useRef } from 'react'
import useTTS from '../../hooks/useTTS'
import { useUser } from '../../context/UserContext'
import { useLang } from '../../context/LanguageContext'

const SESSION_FLAG = 'stonks_welcomed_this_session'

function buildGreeting(name, lang, hour) {
  const h = hour
  const timeOfDay =
    h < 6 ? 'madrugada' :
    h < 12 ? 'manha' :
    h < 18 ? 'tarde' : 'noite'

  const firstName = (name || '').split(' ')[0] || ''

  const greetings = {
    pt: {
      madrugada: `Trader ${firstName}, ainda acordado? A bolsa dos virais nunca dorme. Seja bem-vindo ao STONKS.`,
      manha: `Bom dia, ${firstName}. Bem-vindo de volta ao STONKS. O que deseja negociar hoje?`,
      tarde: `Boa tarde, ${firstName}. O mercado ta quente. Bem-vindo ao STONKS.`,
      noite: `Boa noite, ${firstName}. Pronto pra mais uma sessao na bolsa dos virais?`,
    },
    en: {
      madrugada: `Trader ${firstName}, still awake? The viral exchange never sleeps. Welcome to STONKS.`,
      manha: `Good morning ${firstName}. Welcome back to STONKS. What would you like to trade today?`,
      tarde: `Good afternoon ${firstName}. The market is hot. Welcome to STONKS.`,
      noite: `Good evening ${firstName}. Ready for another session on the viral exchange?`,
    },
    es: {
      madrugada: `Trader ${firstName}, ¿aún despierto? La bolsa viral nunca duerme. Bienvenido a STONKS.`,
      manha: `Buenos días ${firstName}. Bienvenido de vuelta a STONKS. ¿Qué desea negociar hoy?`,
      tarde: `Buenas tardes ${firstName}. El mercado está caliente. Bienvenido a STONKS.`,
      noite: `Buenas noches ${firstName}. ¿Listo para otra sesión en la bolsa viral?`,
    },
    fr: {
      madrugada: `Trader ${firstName}, encore éveillé? La bourse virale ne dort jamais. Bienvenue sur STONKS.`,
      manha: `Bonjour ${firstName}. Bienvenue à nouveau sur STONKS. Que souhaitez-vous trader aujourd'hui?`,
      tarde: `Bon après-midi ${firstName}. Le marché est chaud. Bienvenue sur STONKS.`,
      noite: `Bonsoir ${firstName}. Prêt pour une autre session sur la bourse virale?`,
    },
    de: {
      madrugada: `Trader ${firstName}, noch wach? Die virale Börse schläft nie. Willkommen bei STONKS.`,
      manha: `Guten Morgen ${firstName}. Willkommen zurück bei STONKS. Was möchten Sie heute handeln?`,
      tarde: `Guten Tag ${firstName}. Der Markt ist heiß. Willkommen bei STONKS.`,
      noite: `Guten Abend ${firstName}. Bereit für eine weitere Session?`,
    },
    it: {
      madrugada: `Trader ${firstName}, ancora sveglio? La borsa virale non dorme mai. Benvenuto in STONKS.`,
      manha: `Buongiorno ${firstName}. Bentornato su STONKS. Cosa desidera negoziare oggi?`,
      tarde: `Buon pomeriggio ${firstName}. Il mercato è caldo. Benvenuto in STONKS.`,
      noite: `Buonasera ${firstName}. Pronto per un'altra sessione sulla borsa virale?`,
    },
    ja: {
      madrugada: `トレーダー ${firstName}さん、まだ起きてますか？バイラル取引所は眠りません。STONKSへようこそ。`,
      manha: `おはようございます ${firstName}さん。STONKSへお帰りなさい。今日は何を取引しますか？`,
      tarde: `こんにちは ${firstName}さん。マーケットは熱いです。STONKSへようこそ。`,
      noite: `こんばんは ${firstName}さん。もう一度セッションの準備はできましたか？`,
    },
    zh: {
      madrugada: `交易员 ${firstName}，还醒着？病毒交易所永不休眠。欢迎来到 STONKS。`,
      manha: `早上好 ${firstName}。欢迎回到 STONKS。今天想交易什么？`,
      tarde: `下午好 ${firstName}。市场很热。欢迎来到 STONKS。`,
      noite: `晚上好 ${firstName}。准备好另一场病毒交易所的交易了吗？`,
    },
  }

  const langGreetings = greetings[lang] || greetings.pt
  return langGreetings[timeOfDay] || langGreetings.manha
}

export default function WelcomeVoice() {
  const { user } = useUser()
  const { lang } = useLang()
  const { speak } = useTTS()
  const playedRef = useRef(false)

  useEffect(() => {
    if (!user?.displayName) return
    if (playedRef.current) return

    // Flag de sessao — nao re-executar em nav entre paginas
    try {
      if (sessionStorage.getItem(SESSION_FLAG)) { playedRef.current = true; return }
    } catch {}

    // Aguarda 1.2s depois do login pra dar tempo dos assets carregarem
    // + aguarda primeira interacao do user (audio context unlock)
    const hasInteracted = () => !!window.__stonks_user_interacted
    let triggered = false

    const tryPlay = () => {
      if (triggered || playedRef.current) return
      triggered = true
      playedRef.current = true
      try { sessionStorage.setItem(SESSION_FLAG, '1') } catch {}
      const greeting = buildGreeting(user.displayName, lang, new Date().getHours())
      speak(greeting, { volume: 0.8 })
    }

    const timer = setTimeout(() => {
      if (hasInteracted()) tryPlay()
      else {
        // Espera proxima interacao
        const onInteract = () => { tryPlay(); cleanup() }
        const cleanup = () => {
          window.removeEventListener('click', onInteract)
          window.removeEventListener('touchstart', onInteract)
          window.removeEventListener('keydown', onInteract)
        }
        window.addEventListener('click', onInteract, { once: true })
        window.addEventListener('touchstart', onInteract, { once: true })
        window.addEventListener('keydown', onInteract, { once: true })
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [user?.displayName, lang, speak])

  return null // sem UI, so comportamento
}
