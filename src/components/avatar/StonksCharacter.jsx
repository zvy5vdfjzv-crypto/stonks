// 🏰 STONKS CHARACTER — render SVG do personagem por classe.
// Compativel com SHOP_ITEMS (mesmo viewBox 100x100).
import { renderCharacterSVG } from '../../data/characters'

export default function StonksCharacter({ classId = 'humano', size = 80, className = '' }) {
  const svgMarkup = renderCharacterSVG(classId)
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  )
}
