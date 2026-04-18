// 🏰 UserCharacter — boneco RPG com TODOS os items equipados.
// Renderiza: character class + glasses + hat (dentro da area) + frame + effect (fora).
// Aqui items fazem sentido: hat vai na cabeca do boneco, glasses no rosto, etc.
import { useUser, SHOP_ITEMS } from '../../context/UserContext'
import { renderCharacterSVG } from '../../data/characters'

export default function UserCharacter({ size = 120, className = '', characterClass }) {
  const { user } = useUser()
  // Permite override (ex: preview de outra classe)
  const classId = characterClass || user?.characterClass || 'humano'
  const eq = user?.equippedItems || {}

  // Itens por layer
  const frameItem = eq.frame ? SHOP_ITEMS.find(i => i.id === eq.frame) : null
  const effectItem = eq.effect ? SHOP_ITEMS.find(i => i.id === eq.effect) : null
  const glassesItem = eq.glasses ? SHOP_ITEMS.find(i => i.id === eq.glasses) : null
  const hatItem = eq.hat ? SHOP_ITEMS.find(i => i.id === eq.hat) : null

  const characterSVG = renderCharacterSVG(classId)

  // Overlays internos (hat/glasses) renderizam sobre o personagem, dentro do clip
  const innerOverlays = (glassesItem?.svgOverlay || '') + (hatItem?.svgOverlay || '')
  // Overlays externos (frame/effect) — fora do clip, podem extender
  const outerOverlays = (effectItem?.svgOverlay || '') + (frameItem?.svgOverlay || '')

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Personagem + items "vestidos" — clipped */}
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          dangerouslySetInnerHTML={{ __html: characterSVG + innerOverlays }}
        />
      </div>

      {/* Frame + effect — fora do clip */}
      {outerOverlays && (
        <svg
          className="absolute inset-0 pointer-events-none z-10"
          width={size}
          height={size}
          viewBox="0 0 100 100"
          dangerouslySetInnerHTML={{ __html: outerOverlays }}
        />
      )}
    </div>
  )
}
