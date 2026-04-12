import { useUser } from '../../context/UserContext'

export default function UserAvatar({ size = 40, className = '' }) {
  const { user } = useUser()
  if (!user) return null

  const isUrl = typeof user.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))

  if (isUrl) {
    return (
      <img
        src={user.avatar}
        alt={user.displayName}
        className={`rounded-xl object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`rounded-xl bg-accent/20 flex items-center justify-center ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {user.avatar}
    </div>
  )
}
