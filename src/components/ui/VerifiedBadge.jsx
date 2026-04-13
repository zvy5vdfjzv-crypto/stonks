import { VERIFICATION_TYPES } from '../../context/UserContext'

export default function VerifiedBadge({ type, size = 14 }) {
  if (!type) return null
  const info = VERIFICATION_TYPES[type]
  if (!info) return null
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-bold ml-0.5 shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.55, backgroundColor: info.color }}
      title={info.label}
    >
      {info.emoji}
    </span>
  )
}
