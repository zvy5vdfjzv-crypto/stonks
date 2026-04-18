// 🧠 UserAvatar — foto de perfil do user (emoji/foto/face).
// IMPORTANTE: frame e effect sao renderizados FORA do overflow-hidden
// para que nao sejam cortados pelo clip do container.
// Items hat/glasses NAO aparecem na foto (so no character RPG).
import { useUser, SHOP_ITEMS } from '../../context/UserContext'

export default function UserAvatar({ size = 40, className = '', showDecorations = true }) {
  const { user } = useUser()
  if (!user) return null

  const isUrl = typeof user.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))
  const eq = user.equippedItems || {}

  // Na foto de perfil so mostramos decoracoes ambientais: frame + effect
  // (hat/glasses vao no character, nao fazem sentido sobre foto humana)
  const frameItem = showDecorations && eq.frame ? SHOP_ITEMS.find(i => i.id === eq.frame) : null
  const effectItem = showDecorations && eq.effect ? SHOP_ITEMS.find(i => i.id === eq.effect) : null

  // Base
  const base = isUrl ? (
    <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-accent/20"
      style={{ fontSize: size * 0.55 }}>
      {user.avatar}
    </div>
  )

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Base avatar — clipped */}
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden">
        {base}
      </div>

      {/* 🖼️ Frame + effect FORA do clip — podem extender */}
      {(frameItem || effectItem) && (
        <svg
          className="absolute inset-0 pointer-events-none z-10"
          width={size}
          height={size}
          viewBox="0 0 100 100"
          dangerouslySetInnerHTML={{ __html:
            (effectItem?.svgOverlay || '') + (frameItem?.svgOverlay || '')
          }}
        />
      )}
    </div>
  )
}
