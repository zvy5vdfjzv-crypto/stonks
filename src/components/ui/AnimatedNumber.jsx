// 🧠 NEUROMARKETING: Slot Machine Effect — numeros rolantes criam dopamina
// igual caça-niqueis. O cerebro associa movimento numerico a "ganhos".
import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

function formatNumber(val, prefix, decimals) {
  return `${prefix}${Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val)}`
}

export default function AnimatedNumber({ value, prefix = '', decimals = 0, className = '' }) {
  const ref = useRef(null)
  const motionValue = useMotionValue(value)
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100, mass: 1 })

  useEffect(() => { motionValue.set(value) }, [value, motionValue])

  useEffect(() => {
    // Render inicial imediato (bug: spring so fire 'change' quando valor muda,
    // entao se o valor inicial == spring value, o span ficava vazio)
    if (ref.current) {
      ref.current.textContent = formatNumber(springValue.get(), prefix, decimals)
    }
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = formatNumber(latest, prefix, decimals)
      }
    })
  }, [springValue, prefix, decimals, value])

  // Fallback: renderiza valor formatado inline (SSR / antes do useEffect rodar)
  return <span ref={ref} className={className} translate="no">{formatNumber(value, prefix, decimals)}</span>
}
