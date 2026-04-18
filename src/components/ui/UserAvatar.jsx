// 🧠 Avatar com composicao de items equipados + suporte a CHARACTER RPG.
// 4 modos via user.avatarType: 'emoji' | 'photo' | '3d' (face) | 'character' (classe RPG).
// Para character: renderiza SVG do personagem + overlays dos items.
import { useUser, SHOP_ITEMS } from '../../context/UserContext'
import { renderCharacterSVG } from '../../data/characters'

function OverlaySVG({ overlays, size }) {
  if (!overlays.length) return null
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

  const avatarType = user.avatarType || 'emoji'
  const isCharacter = avatarType === 'character'
  const isUrl = !isCharacter && typeof user.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))

  // Items equipados — mesma ordem em todos os modos
  const eq = user.equippedItems || {}
  const overlays = []
  if (showEquipped) {
    ['frame', 'glasses', 'hat', 'effect'].forEach(cat => {
      const itemId = eq[cat]
      if (!itemId) return
      const item = SHOP_ITEMS.find(i => i.id === itemId)
      if (item?.svgOverlay) overlays.push(item.svgOverlay)
    })
  }

  // Base
  let base
  if (isCharacter) {
    const svgMarkup = renderCharacterSVG(user.avatar || 'humano')
    base = (
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox="0 0 100 100"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    )
  } else if (isUrl) {
    base = (
      <img
        src={user.avatar}
        alt={user.displayName}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )
  } else {
    base = (
      <div
        className="absolute inset-0 flex items-center justify-center bg-accent/20"
        style={{ fontSize: size * 0.55 }}
      >
        {user.avatar}
      </div>
    )
  }

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
