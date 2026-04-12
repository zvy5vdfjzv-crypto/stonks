const colorMap = {
  green: 'bg-green/15 text-green',
  red: 'bg-red/15 text-red',
  accent: 'bg-accent/15 text-accent-light',
  yellow: 'bg-yellow/15 text-yellow',
  blue: 'bg-blue/15 text-blue',
  pink: 'bg-pink/15 text-pink',
  neutral: 'bg-surface-hover text-text-secondary',
}

export default function Badge({ children, color = 'neutral', className = '' }) {
  return (
    <span className={`
      inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md
      ${colorMap[color]} ${className}
    `}>
      {children}
    </span>
  )
}
