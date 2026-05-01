// 🎬 FadingVideo — looping com crossfade rAF (sem CSS transitions)
// Spec: FADE_MS=500, FADE_OUT_LEAD=0.55s antes do fim. Loop manual via 'ended'.
import { useEffect, useRef } from 'react'

const FADE_MS = 500
const FADE_OUT_LEAD = 0.55

export default function FadingVideo({ src, className = '', style }) {
  const videoRef = useRef(null)
  const rafRef = useRef(null)
  const fadingOutRef = useRef(false)

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

    const onLoaded = () => {
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

    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
      style={{ opacity: 0, ...style }}
    />
  )
}
