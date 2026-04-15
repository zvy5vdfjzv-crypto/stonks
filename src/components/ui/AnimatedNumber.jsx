// 🧠 NEUROMARKETING: Slot Machine Effect — numeros rolantes criam dopamina
// igual caça-niqueis. O cerebro associa movimento numerico a "ganhos".
import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

export default function AnimatedNumber({ value, prefix = '', decimals = 0, className = '' }) {
  const ref = useRef(null)
  const motionValue = useMotionValue(value)
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100, mass: 1 })

  useEffect(() => { motionValue.set(value) }, [value, motionValue])

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(latest)}`
      }
    })
  }, [springValue, prefix, decimals])

  return <span ref={ref} className={className} />
}
