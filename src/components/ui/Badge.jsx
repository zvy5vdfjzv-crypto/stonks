const colorMap = {
  green: 'bg-green/15 text-green border-green/25',
  red: 'bg-red/15 text-red border-red/25',
  accent: 'bg-accent/15 text-accent-light border-accent/25',
  yellow: 'bg-yellow/15 text-yellow border-yellow/25',
  blue: 'bg-blue/15 text-blue border-blue/25',
  pink: 'bg-pink/15 text-pink border-pink/25',
  neutral: 'bg-surface-hover text-text-secondary border-border',
}

const sizeMap = {
  sm: 'px-1.5 py-0.5 text-[9px]',
  md: 'px-2 py-0.5 text-[11px]',
}

export default function Badge({ children, color = 'neutral', size = 'md', className = '' }) {
  return (
    <span className={`
      inline-block font-semibold rounded-md border
      ${colorMap[color]} ${sizeMap[size] || sizeMap.md} ${className}
    `}>
      {children}
    </span>
  )
}
