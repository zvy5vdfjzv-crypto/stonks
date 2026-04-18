// 🎨 STONKS DESIGN TOKENS — Fase 1
// Referencias programaticas aos tokens do @theme.
// Use em: inline styles, SVG fills, chart colors, JS logic.
// Em JSX prefira classes Tailwind (ex: bg-money, text-hype, border-rarity-legendary).

export const COLORS = {
  // Accent primario — verde dinheiro
  money: '#00ff88',
  moneyDim: '#00cc6a',
  moneyGlow: '#00ff8844',

  // Accent secundario — laranja hype/FOMO
  hype: '#ff6b1a',
  hypeDim: '#cc5515',
  hypeGlow: '#ff6b1a44',

  // Accent terciario — roxo sistema (degradado)
  system: '#7c5cff',
  systemDim: '#6449d9',
  systemGlow: '#7c5cff44',

  // Semantica financeira
  gain: '#00ff88',
  loss: '#ff3b6b',
  neutral: '#8888a0',

  // Superficies dark
  bgBase: '#0a0a0f',
  bgElevated: '#14141c',
  bgOverlay: '#1c1c28',
  bgTerminal: '#000000',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a0a0b8',
  textTertiary: '#606070',

  // Amarelo/Azul/Pink mantidos pra compat
  yellow: '#fecA57',
  blue: '#54A0FF',
  pink: '#FF6B9D',
}

export const RARITY = {
  common: { color: '#8888a0', label: 'Comum', glow: null },
  rare: { color: '#4a9eff', label: 'Raro', glow: '#4a9eff66' },
  epic: { color: '#b44aff', label: 'Epico', glow: '#b44aff66' },
  legendary: { color: '#ffb800', label: 'Lendario', glow: '#ffb80088' },
  mythic: { color: '#ff2d6b', label: 'Mitico', glow: '#ff2d6b99' },
}

export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic']

export const FONTS = {
  display: "'Space Grotesk Variable', system-ui, sans-serif",
  mono: "'JetBrains Mono Variable', ui-monospace, monospace",
  sans: "'Geist Variable', system-ui, -apple-system, sans-serif",
}

export const GLOWS = {
  money: '0 0 24px #00ff8844, 0 0 48px #00ff8822',
  hype: '0 0 24px #ff6b1a44, 0 0 48px #ff6b1a22',
  legendary: '0 0 32px #ffb80066, 0 0 64px #ffb80033',
  mythic: '0 0 32px #ff2d6b77, 0 0 72px #ff2d6b44',
}

// Escala tipografica (aplicar via inline style ou classes)
export const TYPE_SCALE = {
  displayXl: { size: '48px', lineHeight: '52px', weight: 800 },
  displayLg: { size: '32px', lineHeight: '36px', weight: 700 },
  displayMd: { size: '24px', lineHeight: '28px', weight: 700 },
  headingLg: { size: '20px', lineHeight: '24px', weight: 600 },
  headingMd: { size: '16px', lineHeight: '20px', weight: 600 },
  headingSm: { size: '14px', lineHeight: '18px', weight: 600 },
  bodyLg: { size: '16px', lineHeight: '24px', weight: 400 },
  bodyMd: { size: '14px', lineHeight: '20px', weight: 400 },
  bodySm: { size: '12px', lineHeight: '16px', weight: 400 },
  monoLg: { size: '20px', lineHeight: '24px', weight: 500 },
  monoMd: { size: '14px', lineHeight: '18px', weight: 500 },
  monoSm: { size: '11px', lineHeight: '14px', weight: 500 },
}

export const RADIUS = {
  terminal: '4px',     // dados densos, tickers
  card: '12px',        // default cards
  cta: '10px',         // botoes
  pill: '9999px',      // pills, badges
}

export const SPACING = {
  dense: 8,      // areas tipo terminal
  normal: 16,    // feed social, geral
  airy: 24,      // hype/destaque
  hero: 32,      // revelacoes, momentos
}
