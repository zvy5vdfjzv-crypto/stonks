// 🎬 FadingVideo — looping com crossfade rAF + fallback gradient quando video falha
// Defensivo: escuta MULTIPLOS eventos (loadeddata/canplay/playing) pra autoplay reliable.
// Se video nao carrega, mostra gradient cinematic atras (nao tela preta vazia).
import { useEffect, useRef, useState } from 'react'

const FADE_MS = 500
const FADE_OUT_LEAD = 0.55

export default function FadingVideo({ src, className = '', style, fallbackGradient }) {
  const videoRef = useRef(null)
  const rafRef = useRef(null)
  const fadingOutRef = useRef(false)
  const [errored, setErrored] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const fadeTo = (target, duration = FADE_MS) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      const start = parseFloat(video.style.opacity || '0')
      const startTime = performance.now()
      const tick = (now) => {
        const elapsed = now - startTime
        const t = Math.min(1, elapsed / duration)
        video.style.opacity = String(start + (target - start) * t)
        if (t < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const triggerFadeIn = () => {
      if (started) return
      setStarted(true)
      video.style.opacity = '0'
      video.play().catch(() => {})
      fadeTo(1)
    }

    const onTimeUpdate = () => {
      if (fadingOutRef.current) return
      const remaining = video.duration - video.currentTime
      if (remaining > 0 && remaining <= FADE_OUT_LEAD) {
        fadingOutRef.current = true
        fadeTo(0)
      }
    }

    const onEnded = () => {
      video.style.opacity = '0'
      setTimeout(() => {
        video.currentTime = 0
        video.play().catch(() => {})
        fadingOutRef.current = false
        fadeTo(1)
      }, 100)
    }

    const onError = () => setErrored(true)

    // Eventos multiplos pra robustez (autoplay policy quirks)
    video.addEventListener('loadeddata', triggerFadeIn)
    video.addEventListener('canplay', triggerFadeIn)
    video.addEventListener('playing', triggerFadeIn)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    video.addEventListener('error', onError)

    // Tentar play imediato (alguns browsers ja tem o video em cache)
    video.play().catch(() => {})

    // Timeout de 5s — se video nao comecou, marca como errored pra fallback
    const errorTimer = setTimeout(() => {
      if (!started && (video.readyState < 2)) setErrored(true)
    }, 5000)

    return () => {
      clearTimeout(errorTimer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      video.removeEventListener('loadeddata', triggerFadeIn)
      video.removeEventListener('canplay', triggerFadeIn)
      video.removeEventListener('playing', triggerFadeIn)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onError)
    }
  }, [src, started])

  // Fallback gradient sempre renderiza ATRAS — se video falhar, fica visivel
  const defaultGradient = 'radial-gradient(ellipse at 30% 20%, rgba(0,255,136,0.15), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255,107,26,0.12), transparent 60%), linear-gradient(180deg, #050510, #000000)'

  return (
    <>
      {/* Fallback bg sempre presente atras */}
      <div
        className={className}
        style={{
          ...style,
          background: fallbackGradient || defaultGradient,
          opacity: errored ? 1 : 0.6,
          transition: 'opacity 0.5s',
        }}
      />
      {/* Video por cima */}
      {!errored && (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          playsInline
          loop={false}
          preload="auto"
          className={className}
          style={{ opacity: 0, ...style }}
        />
      )}
    </>
  )
}
