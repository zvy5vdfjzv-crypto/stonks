// 🏰 STONKS CHARACTER CLASSES
// Personagens RPG pro avatar. Cada um tem silhueta distinta + cores.
// Items da loja se equipam por cima (hat/glasses/effect/frame).
// SVG fragments em viewBox 100x100 — mesma escala dos SHOP_ITEMS.

export const CHARACTER_CLASSES = [
  {
    id: 'humano',
    name: 'Humano',
    tagline: 'Versatil, adaptavel, balanceado',
    emoji: '🧑',
    skin: '#F5C5A3',
    hair: '#4A3728',
    accent: '#54A0FF',   // Cor do traje/aura
    bg: '#1a2332',
    // SVG paths — body + head + features specific to class
    // Tudo entre <g></g>, viewBox 100x100.
    render: ({ skin, hair, accent, bg }) => `
      <rect width="100" height="100" fill="${bg}"/>
      <!-- Ombros/corpo -->
      <path d="M20,95 Q20,65 35,60 L65,60 Q80,65 80,95 Z" fill="${accent}"/>
      <rect x="44" y="55" width="12" height="8" fill="${skin}"/>
      <!-- Cabeca -->
      <circle cx="50" cy="42" r="18" fill="${skin}"/>
      <!-- Cabelo -->
      <path d="M32,36 Q35,22 50,22 Q65,22 68,36 Q64,30 50,29 Q36,30 32,36 Z" fill="${hair}"/>
      <!-- Olhos -->
      <ellipse cx="43" cy="42" rx="1.8" ry="2.2" fill="#1a1a1a"/>
      <ellipse cx="57" cy="42" rx="1.8" ry="2.2" fill="#1a1a1a"/>
      <!-- Nariz -->
      <path d="M50,45 L49,49 L51,49 Z" fill="${skin}" opacity="0.5"/>
      <!-- Boca -->
      <path d="M46,51 Q50,54 54,51" stroke="#2a1a1a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    `,
  },
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    tagline: 'Honra, forca e um jawline afiado',
    emoji: '⚔️',
    skin: '#E8B896',
    hair: '#8B4513',
    accent: '#B91C1C',   // Armor vermelho
    bg: '#2c1a1a',
    render: ({ skin, hair, accent, bg }) => `
      <rect width="100" height="100" fill="${bg}"/>
      <!-- Pauldrons (ombreiras de armadura) -->
      <path d="M15,78 Q15,58 28,55 Q30,63 30,72 Z" fill="#6b1d1d"/>
      <path d="M85,78 Q85,58 72,55 Q70,63 70,72 Z" fill="#6b1d1d"/>
      <!-- Corpo com couraca -->
      <path d="M22,95 Q22,68 34,62 L66,62 Q78,68 78,95 Z" fill="${accent}"/>
      <!-- Detalhe central da armadura -->
      <rect x="48" y="65" width="4" height="22" fill="#fbbf24" opacity="0.5"/>
      <!-- Pescoco -->
      <rect x="44" y="56" width="12" height="8" fill="${skin}"/>
      <!-- Cabeca -->
      <circle cx="50" cy="42" r="18" fill="${skin}"/>
      <!-- Cabelo (curto, guerreiro) -->
      <path d="M32,34 Q36,24 50,23 Q64,24 68,34 L66,30 L60,28 L50,27 L40,28 L34,30 Z" fill="${hair}"/>
      <!-- Cicatriz no olho direito -->
      <line x1="59" y1="38" x2="61" y2="46" stroke="#6b2323" stroke-width="0.8" opacity="0.7"/>
      <!-- Olhos determinados -->
      <rect x="41" y="41" width="4" height="2" fill="#1a1a1a"/>
      <rect x="55" y="41" width="4" height="2" fill="#1a1a1a"/>
      <!-- Sobrancelhas grossas -->
      <path d="M40,38 L46,37" stroke="#3d2817" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M54,37 L60,38" stroke="#3d2817" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Boca seria -->
      <path d="M45,51 L55,51" stroke="#2a1a1a" stroke-width="1.3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'mago',
    name: 'Mago',
    tagline: 'Mestre dos memes arcanos',
    emoji: '🧙',
    skin: '#EED9BC',
    hair: '#C5C5D2',    // Cabelo cinza prateado
    accent: '#7C5CFF',   // Manto roxo
    bg: '#1e1633',
    render: ({ skin, hair, accent, bg }) => `
      <rect width="100" height="100" fill="${bg}"/>
      <!-- Manto largo -->
      <path d="M15,95 Q18,60 32,55 L68,55 Q82,60 85,95 Z" fill="${accent}"/>
      <!-- Detalhes do manto: estrelas -->
      <text x="32" y="78" font-size="6" fill="#fbbf24" opacity="0.8">✦</text>
      <text x="62" y="84" font-size="5" fill="#fbbf24" opacity="0.7">✦</text>
      <!-- Gola alta -->
      <path d="M40,58 Q50,54 60,58 L60,62 L40,62 Z" fill="#4a3aa3"/>
      <!-- Pescoco -->
      <rect x="45" y="54" width="10" height="6" fill="${skin}"/>
      <!-- Cabeca -->
      <circle cx="50" cy="40" r="18" fill="${skin}"/>
      <!-- Cabelo longo caindo -->
      <path d="M32,36 Q34,22 50,22 Q66,22 68,36 L66,52 L34,52 Z" fill="${hair}" opacity="0.85"/>
      <!-- Barba comprida e pontuda -->
      <path d="M40,52 Q43,58 50,62 Q57,58 60,52 L58,55 L54,58 L50,62 L46,58 L42,55 Z" fill="${hair}"/>
      <!-- Olhos sabios (olhos mais fechados/serenos) -->
      <path d="M41,41 Q43,39 46,41" stroke="#1a1a1a" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <path d="M54,41 Q56,39 59,41" stroke="#1a1a1a" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <!-- Sobrancelhas grisalhas -->
      <path d="M40,38 L46,37" stroke="${hair}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M54,37 L60,38" stroke="${hair}" stroke-width="1.2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'orc',
    name: 'Orc',
    tagline: 'Forca bruta e FOMO primordial',
    emoji: '🧌',
    skin: '#7CB342',    // Pele verde
    hair: '#1a1a1a',    // Cabelo escuro
    accent: '#4a3728',   // Couro marrom
    bg: '#1a2813',
    render: ({ skin, hair, accent, bg }) => `
      <rect width="100" height="100" fill="${bg}"/>
      <!-- Corpo grande com colete de couro -->
      <path d="M14,95 Q14,62 28,56 L72,56 Q86,62 86,95 Z" fill="${accent}"/>
      <!-- Tiras/correntes -->
      <rect x="25" y="70" width="50" height="3" fill="#2a1810" opacity="0.6"/>
      <rect x="25" y="82" width="50" height="2" fill="#2a1810" opacity="0.5"/>
      <!-- Pescoco grosso -->
      <rect x="42" y="52" width="16" height="10" fill="${skin}"/>
      <!-- Cabeca maior -->
      <circle cx="50" cy="40" r="20" fill="${skin}"/>
      <!-- Orelhas pontudas -->
      <polygon points="30,38 26,30 32,34" fill="${skin}"/>
      <polygon points="70,38 74,30 68,34" fill="${skin}"/>
      <!-- Moicano (cabelo alto) -->
      <path d="M44,20 Q50,12 56,20 L54,30 L46,30 Z" fill="${hair}"/>
      <!-- Sobrancelhas grossas/ameacadoras -->
      <path d="M38,37 L48,39" stroke="#0a1a0a" stroke-width="2" stroke-linecap="round"/>
      <path d="M52,39 L62,37" stroke="#0a1a0a" stroke-width="2" stroke-linecap="round"/>
      <!-- Olhos -->
      <ellipse cx="43" cy="43" rx="2" ry="2.5" fill="#fbbf24"/>
      <circle cx="43" cy="43" r="1" fill="#1a1a1a"/>
      <ellipse cx="57" cy="43" rx="2" ry="2.5" fill="#fbbf24"/>
      <circle cx="57" cy="43" r="1" fill="#1a1a1a"/>
      <!-- Nariz achatado -->
      <ellipse cx="50" cy="48" rx="2.5" ry="1.5" fill="#5d8a2e" opacity="0.6"/>
      <!-- Boca grande com presas -->
      <path d="M42,53 Q50,57 58,53" stroke="#1a1a1a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <!-- Presas (tusks) -->
      <polygon points="45,53 44,58 46,57" fill="#fdfcf4"/>
      <polygon points="55,53 54,57 56,58" fill="#fdfcf4"/>
    `,
  },
  {
    id: 'ladino',
    name: 'Ladino',
    tagline: 'Sombrio, agil, trader de ultima hora',
    emoji: '🗡️',
    skin: '#D4A37B',
    hair: '#1a1a1a',
    accent: '#1f2937',   // Capa escura
    bg: '#0f0f14',
    render: ({ skin, hair, accent, bg }) => `
      <rect width="100" height="100" fill="${bg}"/>
      <!-- Capa/manto escuro com capuz -->
      <path d="M16,95 Q16,58 32,52 L68,52 Q84,58 84,95 Z" fill="${accent}"/>
      <!-- Capuz sobre a cabeca -->
      <path d="M28,48 Q28,18 50,15 Q72,18 72,48 L68,45 L58,40 L50,38 L42,40 L32,45 Z" fill="#0a0a0f"/>
      <!-- Sombra dentro do capuz -->
      <path d="M33,45 Q33,28 50,26 Q67,28 67,45 L62,43 L50,41 L38,43 Z" fill="#000" opacity="0.8"/>
      <!-- Olhos brilhantes na sombra -->
      <ellipse cx="43" cy="42" rx="1.8" ry="1" fill="#22d3ee"/>
      <ellipse cx="57" cy="42" rx="1.8" ry="1" fill="#22d3ee"/>
      <!-- Boca so parcialmente visivel -->
      <path d="M46,52 L54,52" stroke="#3a2317" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
      <!-- Fecho/broche do manto -->
      <circle cx="50" cy="58" r="2.5" fill="#fbbf24"/>
      <circle cx="50" cy="58" r="1" fill="#7f1d1d"/>
    `,
  },
  {
    id: 'paladino',
    name: 'Paladino',
    tagline: 'Dourado, justo, tank de portfolio',
    emoji: '⛨',
    skin: '#F5D5B1',
    hair: '#FDE68A',    // Cabelo dourado
    accent: '#D97706',   // Armadura dourada
    bg: '#2a1e0a',
    render: ({ skin, hair, accent, bg }) => `
      <rect width="100" height="100" fill="${bg}"/>
      <!-- Halo dourado atras da cabeca -->
      <circle cx="50" cy="40" r="22" fill="none" stroke="#fde047" stroke-width="1.5" opacity="0.4" stroke-dasharray="1 2"/>
      <!-- Pauldrons douradas -->
      <path d="M14,80 Q14,56 30,54 Q33,62 32,72 Z" fill="#b45309"/>
      <path d="M86,80 Q86,56 70,54 Q67,62 68,72 Z" fill="#b45309"/>
      <!-- Couraca dourada -->
      <path d="M22,95 Q22,66 34,60 L66,60 Q78,66 78,95 Z" fill="${accent}"/>
      <!-- Cruz/simbolo sagrado no peito -->
      <rect x="48" y="70" width="4" height="18" fill="#fef3c7"/>
      <rect x="44" y="76" width="12" height="4" fill="#fef3c7"/>
      <!-- Pescoco -->
      <rect x="45" y="54" width="10" height="7" fill="${skin}"/>
      <!-- Cabeca -->
      <circle cx="50" cy="40" r="18" fill="${skin}"/>
      <!-- Cabelo dourado -->
      <path d="M32,34 Q36,22 50,21 Q64,22 68,34 Q64,28 50,27 Q36,28 32,34 Z" fill="${hair}"/>
      <!-- Olhos -->
      <ellipse cx="43" cy="42" rx="1.8" ry="2.2" fill="#1e3a8a"/>
      <ellipse cx="57" cy="42" rx="1.8" ry="2.2" fill="#1e3a8a"/>
      <!-- Boca determinada -->
      <path d="M46,51 L54,51" stroke="#3a2317" stroke-width="1.2" stroke-linecap="round"/>
    `,
  },
]

export function getCharacterById(id) {
  return CHARACTER_CLASSES.find(c => c.id === id) || CHARACTER_CLASSES[0]
}

export function renderCharacterSVG(classId) {
  const c = getCharacterById(classId)
  return c.render(c)
}
