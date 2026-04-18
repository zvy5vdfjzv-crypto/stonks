// 🧠 FASE 7 — Avatar REAL com composicao de items equipados.
// Antes: items comprados NAO apareciam. Agora: overlays SVG compostos em camadas.
// Ordem (bottom → top): base avatar → frame → glasses → hat → effect
import { useUser, SHOP_ITEMS } from '../../context/UserContext'

function OverlaySVG({ overlays, size }) {
  if (!overlays.length) return null
  // Items ja tem svgOverlay como string HTML em viewBox 100x100
  const composed = overlays.join('')
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      dangerouslySetInnerHTML={{ __html: composed }}
    />
  )
}

export default function UserAvatar({ size = 40, className = '', showEquipped = true }) {
  const { user } = useUser()
  if (!user) return null

  const isUrl = typeof user.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))

  // Resolver items equipados em ordem correta de layering
  const eq = user.equippedItems || {}
  const overlays = []
  if (showEquipped) {
    // Order: frame (bottom decoration) → glasses → hat → effect (top)
    ['frame', 'glasses', 'hat', 'effect'].forEach(cat => {
      const itemId = eq[cat]
      if (!itemId) return
      const item = SHOP_ITEMS.find(i => i.id === itemId)
      if (item?.svgOverlay) overlays.push(item.svgOverlay)
    })
  }

  // Base do avatar
  const base = isUrl ? (
    <img
      src={user.avatar}
      alt={user.displayName}
      className="absolute inset-0 w-full h-full object-cover"
    />
  ) : (
    <div
      className="absolute inset-0 flex items-center justify-center bg-accent/20"
      style={{ fontSize: size * 0.55 }}
    >
      {user.avatar}
    </div>
  )

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {base}
      <OverlaySVG overlays={overlays} size={size} />
    </div>
  )
}
