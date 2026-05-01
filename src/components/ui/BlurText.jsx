// 🎬 BlurText — word-by-word blur-in animation
// Trigger via IntersectionObserver (10% visibility). Cada palavra com stagger 100ms.
// Keyframes: blur 10px → 5px → 0px, opacity 0 → 0.5 → 1, y 50 → -5 → 0
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export default function BlurText({ text, className = '', tag = 'p', delay = 0, as }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const Tag = as || tag
  const words = (text || '').split(' ')

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em' }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={visible ? {
            filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
            opacity: [0, 0.5, 1],
            y: [50, -5, 0],
          } : {}}
          transition={{
            duration: 0.7,
            times: [0, 0.5, 1],
            ease: 'easeOut',
            delay: delay + (i * 100) / 1000,
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  )
}
