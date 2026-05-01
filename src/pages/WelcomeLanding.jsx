// 🎬 STONKS Welcome Landing — adaptacao cinematica do briefing space-travel
// Liquid-glass + Instrument Serif italic + BlurText + FadingVideo bg
// Conteudo adaptado pra "Bolsa dos Virais" (nao "Mars 2026")
import { motion } from 'framer-motion'
import { useState } from 'react'
import FadingVideo from '../components/ui/FadingVideo'
import BlurText from '../components/ui/BlurText'
import StonksLogo from '../components/ui/StonksLogo'

const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'
const CAPS_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4'

function ArrowUpRight({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  )
}
function PlayIcon({ className = 'h-4 w-4' }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><polygon points="6 4 20 12 6 20 6 4" /></svg>
}

function GlassCard({ children, strong, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag className={`${strong ? 'liquid-glass-strong' : 'liquid-glass'} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

const ANIM = (delay = 0) => ({
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
})

// SVG paths Material Icons
const ICON_CHART = 'M3 13h2v8H3v-8zm4-4h2v12H7V9zm4-3h2v15h-2V6zm4 6h2v9h-2v-9zm4-9h2v18h-2V3z'
const ICON_AVATAR = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
const ICON_FLAME = 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z'

export default function WelcomeLanding({ onCreate, onLogin }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div className="bg-black text-white font-body-alt min-h-dvh overflow-x-hidden">
      {/* ============= SECTION 1: HERO ============= */}
      <section className="relative h-dvh w-full overflow-hidden bg-black">
        <FadingVideo
          src={HERO_VIDEO}
          className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
          style={{ width: '120%', height: '120%' }}
        />

        {/* Navbar */}
        <motion.nav
          {...ANIM(0.2)}
          className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-8 lg:px-16 flex items-center justify-between"
        >
          <GlassCard className="w-12 h-12 rounded-full flex items-center justify-center">
            <span className="font-heading italic text-white text-2xl leading-none">$</span>
          </GlassCard>

          <GlassCard className="hidden md:flex rounded-full px-1.5 py-1.5 items-center gap-0.5">
            {['Bolsa', 'Trends', 'Hype', 'Como funciona', 'Sobre'].map(item => (
              <span key={item} className="px-3 py-2 text-sm font-medium text-white/90 cursor-pointer hover:text-white transition-colors">
                {item}
              </span>
            ))}
            <button
              onClick={onCreate}
              className="ml-1 bg-white text-black rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer hover:bg-white/90 transition-colors"
            >
              Criar conta <ArrowUpRight className="h-4 w-4" />
            </button>
          </GlassCard>

          <button
            onClick={onCreate}
            className="md:hidden bg-white text-black rounded-full px-4 py-2 text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            Entrar <ArrowUpRight className="h-3 w-3" />
          </button>
        </motion.nav>

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center pt-24 px-4">
          <motion.div {...ANIM(0.4)}>
            <GlassCard className="rounded-full inline-flex items-center pl-1 pr-3 py-1 gap-2">
              <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold">Novo</span>
              <span className="text-sm text-white/90">Bolsa dos virais aberta · 24h por dia</span>
            </GlassCard>
          </motion.div>

          <BlurText
            tag="h1"
            text="Negocia memes como ações de verdade"
            className="font-heading italic text-white leading-[0.85] max-w-3xl text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-[-3px] mt-6"
          />

          <motion.p
            {...ANIM(0.8)}
            className="mt-6 text-sm md:text-base text-white max-w-xl font-body-alt font-light leading-relaxed"
          >
            Trends viram tickers. Memes viram cotas. Voce banca o que vai explodir e realiza o lucro antes do mercado virar. Bolsa real, mecanica de jogo.
          </motion.p>

          <motion.div {...ANIM(1.1)} className="flex items-center gap-6 mt-8">
            <button
              onClick={onCreate}
              className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              Comecar a bancar <ArrowUpRight />
            </button>
            <button
              onClick={onLogin}
              className="text-white text-sm font-medium flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              Ja tenho conta <PlayIcon />
            </button>
          </motion.div>

          <motion.div {...ANIM(1.3)} className="flex items-stretch gap-4 mt-10">
            {[
              { num: '24h', label: 'Mercado aberto sem parar', icon: 'M12 6v6l4 2', shape: 'circle' },
              { num: '50+', label: 'Trends viralizando ao vivo', icon: 'M2 12c5-5 15-5 20 0M5 9c4-4 10-4 14 0', shape: 'globe' },
            ].map((s, i) => (
              <GlassCard key={i} className="rounded-[1.25rem] p-5 w-[200px] sm:w-[220px]">
                <svg viewBox="0 0 28 28" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  {s.shape === 'circle' && <circle cx="14" cy="14" r="11" />}
                  {s.shape === 'globe' && <circle cx="14" cy="14" r="11" />}
                  <path d={s.icon} transform="translate(2 2)" />
                </svg>
                <p className="font-heading italic text-white text-3xl sm:text-4xl tracking-[-1px] leading-none mt-4">{s.num}</p>
                <p className="text-xs text-white font-body-alt font-light mt-2">{s.label}</p>
              </GlassCard>
            ))}
          </motion.div>
        </div>

        {/* Partners footer */}
        <motion.div
          {...ANIM(1.4)}
          className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-3 px-4"
        >
          <GlassCard className="rounded-full px-3.5 py-1 text-xs font-medium text-white">
            8 contas oficiais STONKS cobrindo todos os nichos
          </GlassCard>
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-8 md:gap-12 font-heading italic text-white text-xl md:text-2xl tracking-tight opacity-90">
            {['Money', 'Gaming', 'Music', 'Tech', 'Sport'].map(p => (
              <span key={p}>· {p}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ============= SECTION 2: CAPABILITIES ============= */}
      <section className="relative min-h-dvh w-full overflow-hidden bg-black">
        <FadingVideo
          src={CAPS_VIDEO}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div className="relative z-10 px-6 sm:px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-dvh">
          <div className="mb-12">
            <p className="text-sm font-body-alt text-white/80 mb-4">// O que tem dentro</p>
            <BlurText
              tag="h2"
              text="Bolsa, jogo e rede social no mesmo lugar"
              className="font-heading italic text-white text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] leading-[0.9] tracking-[-2px] !justify-start"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto">
            {[
              {
                title: 'Bolsa em tempo real',
                body: 'Cada compra mexe o preco via bonding curve. Realtime no Supabase. Anti-fraude server-side. Voce ve seu trade afetando o mercado.',
                icon: ICON_CHART,
                tags: ['Bonding curve', 'Anti-fraude RPC', 'Realtime', 'HypeCoins']
              },
              {
                title: 'Personagens RPG',
                body: 'Escolha sua classe (Humano, Mago, Orc, Guerreiro) e equipa items dropados em caixas misteriosas. Comum, raro, epico, lendario, mitico.',
                icon: ICON_AVATAR,
                tags: ['6 classes', 'Lootboxes', 'Items lendarios', 'Avatar 3D']
              },
              {
                title: 'Hype ao vivo',
                body: 'Reddit, portais de noticia e YouTube agregados a cada 60s. Traduzidos pra 8 linguas automaticamente. NEW badges quando algo cai.',
                icon: ICON_FLAME,
                tags: ['Reddit live', '16 portais', 'i18n auto', 'Refresh 60s']
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
              >
                <GlassCard className="rounded-[1.25rem] p-6 min-h-[360px] flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <GlassCard className="rounded-[0.75rem] w-11 h-11 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
                        <path d={card.icon} />
                      </svg>
                    </GlassCard>
                    <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                      {card.tags.map(t => (
                        <GlassCard key={t} className="rounded-full px-3 py-1 text-[11px] text-white/90 font-body-alt whitespace-nowrap">
                          {t}
                        </GlassCard>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1" />

                  <div className="mt-6">
                    <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm text-white/90 font-body-alt font-light leading-snug max-w-[32ch]">
                      {card.body}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* CTA final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center mt-16 mb-4 gap-4"
          >
            <button
              onClick={onCreate}
              className="liquid-glass-strong rounded-full px-6 py-3 text-base font-medium text-white flex items-center gap-2 cursor-pointer hover:scale-[1.03] transition-transform"
            >
              Criar conta gratis <ArrowUpRight />
            </button>
            <button
              onClick={onLogin}
              className="text-white/70 text-sm font-medium hover:text-white transition-colors cursor-pointer"
            >
              Ja tenho conta — entrar
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
